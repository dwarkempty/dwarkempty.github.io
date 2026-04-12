// js/battle.js - 完整DOT侵蚀战斗系统 v2.4

let currentTeam = [];           // 上场角色快照
let enemies = [];               // 敌人状态
let battleTurn = 1;
let teamEnergy = 4;
let usedSkillsThisTurn = {};    // {角色唯一id: [已使用技能id数组]}

// ==================== 怪物池（3个怪物） ====================
const enemyPool = [
  {id:1, name:"深渊影魔", hp:2800, maxHP:2800, atk:190, def:85, erosions:[], defDebuff:0, speedDebuff:0, taunt:0},
  {id:2, name:"元素守卫", hp:3400, maxHP:3400, atk:230, def:130, erosions:[], defDebuff:0, speedDebuff:0, taunt:0},
  {id:3, name:"狂暴炎兽", hp:4200, maxHP:4200, atk:280, def:110, erosions:[], defDebuff:0, speedDebuff:0, taunt:0}
];

// ==================== 实时演算核心 ====================
function calculateResonance(erosions) {
  const unique = new Set(erosions.map(e => e.type));
  return Math.min(45, (unique.size - 1) * 15);
}

function triggerDOTs() {
  let totalDamage = 0;
  enemies.forEach(enemy => {
    if (enemy.hp <= 0) return;
    const resonance = calculateResonance(enemy.erosions);
    enemy.erosions.forEach(ero => {
      if (ero.duration <= 0) return;
      let dmg = 0;
      const sourceChar = currentTeam.find(c => c.charId === ero.sourceCharId);
      if (!sourceChar) return;
      const stats = window.calculateStats(sourceChar, window.getCharacterData(sourceChar.charId));
      if (ero.type === "chrono") dmg = stats.atk * 0.8;
      else if (ero.type === "source") dmg = stats.atk * 0.45 * (ero.layers || 1);
      else if (ero.type === "star") dmg = stats.atk * 0.65;
      else if (ero.type === "holy") dmg = stats.atk * 0.7;
      dmg *= (1 + resonance / 100);
      enemy.hp = Math.max(0, enemy.hp - Math.floor(dmg));
      totalDamage += Math.floor(dmg);
      ero.duration--;
      if (ero.layers) ero.layers = Math.max(0, ero.layers - 1);
    });
    enemy.erosions = enemy.erosions.filter(e => e.duration > 0);
  });
  // 克罗诺被动：时间恩赐
  currentTeam.forEach(char => {
    if (window.characterSkills[char.charId]?.passive.includes("timeBlessing")) {
      const uniqueCount = new Set(enemies.flatMap(e => e.erosions.map(er => er.type))).size;
      teamEnergy = Math.min(6, teamEnergy + Math.min(2, uniqueCount));
    }
  });
  return totalDamage;
}

// ==================== 伤害计算（考虑防御降低、护盾） ====================
function calculateDamage(sourceChar, target, baseDmg) {
  const stats = window.calculateStats(sourceChar, window.getCharacterData(sourceChar.charId));
  let dmg = baseDmg;
  if (target.defDebuff) dmg *= (1 - target.defDebuff / 100);
  if (target.shield > 0) {
    const absorbed = Math.min(target.shield, dmg);
    target.shield -= absorbed;
    dmg -= absorbed;
  }
  return Math.floor(dmg);
}

// ==================== 单独技能效果函数（全部按照描述实现，便于以后扩展） ====================
function applyChronoSkill1(charData) { // 时之加速·克罗诺斯
  currentTeam.forEach(c => c.buffs.push({name:"时之加速", duration:3}));
}

function applyChronoSkill2(charData) { // 命运蚀刻
  enemies.forEach(e => {
    e.erosions.push({type:"chrono", duration:5, sourceCharId:14});
    e.speedDebuff = 4;
  });
}

function applyElwinSkill1(charData) { // 起源崩解
  const target = enemies[0];
  const stats = window.calculateStats(charData, window.getCharacterData(charData.charId));
  target.hp -= calculateDamage(charData, target, stats.atk * 2.8);
  target.erosions.push({type:"source", layers:4, duration:6, sourceCharId:15});
}

function applyElwinSkill2(charData) { // 元素灭世潮
  const stats = window.calculateStats(charData, window.getCharacterData(charData.charId));
  enemies.forEach(e => {
    e.hp -= calculateDamage(charData, e, stats.atk * 1.4);
    e.erosions.push({type:"source", layers:2, duration:6, sourceCharId:15});
    const randomKey = Object.keys(window.erosionTypes)[Math.floor(Math.random() * 3) + 1];
    e.erosions.push({type:randomKey, duration:4, sourceCharId:15});
  });
}

function applySylviaSkill1(charData) { // 星辰腐朽咒
  enemies.forEach(e => {
    e.erosions.push({type:"star", duration:4, sourceCharId:9});
    e.defDebuff = 15;   // ← 按照描述：降低15%防御力，持续3回合
    e.defDebuffDuration = 3;
  });
}

function applySylviaSkill2(charData) { // 星芒增幅
  currentTeam.forEach(c => c.shield = Math.floor(window.calculateStats(c, window.getCharacterData(c.charId)).def * 1.5));
}

function applyGalanSkill1(charData) { // 圣辉壁垒
  currentTeam.forEach(c => c.shield = Math.floor(window.calculateStats(charData, window.getCharacterData(charData.charId)).def * 2));
  charData.buffs.push({name:"圣辉反伤", duration:3});
}

function applyGalanSkill2(charData) { // 审判烈焰斩
  const target = enemies[0];
  const stats = window.calculateStats(charData, window.getCharacterData(charData.charId));
  target.hp -= calculateDamage(charData, target, stats.atk * 1.9);
  target.erosions.push({type:"holy", duration:4, sourceCharId:11});
  target.taunt = 2;
}

// ==================== 技能执行入口 ====================
function executeSkill(charIdx, skillIdx) {
  const charData = currentTeam[charIdx];
  const char = window.getCharacterData(charData.charId);
  const skills = window.characterSkills[charData.charId];
  if (!skills || !skills.active[skillIdx]) return;

  const skill = skills.active[skillIdx];
  const skillId = skill.id;

  // 每回合同种技能只能释放一次
  if (!usedSkillsThisTurn[charData.id]) usedSkillsThisTurn[charData.id] = [];
  if (usedSkillsThisTurn[charData.id].includes(skillId)) {
    return alert("该技能本回合已使用过！");
  }
  usedSkillsThisTurn[charData.id].push(skillId);

  if (teamEnergy < skill.cost) return alert("⚡ 能量不足！");
  teamEnergy -= skill.cost;

  // 调用对应技能函数（全部实装）
  if (charData.charId === 14) {
    if (skill.id === 1) applyChronoSkill1(charData);
    else if (skill.id === 2) applyChronoSkill2(charData);
  } else if (charData.charId === 15) {
    if (skill.id === 1) applyElwinSkill1(charData);
    else if (skill.id === 2) applyElwinSkill2(charData);
  } else if (charData.charId === 9) {
    if (skill.id === 1) applySylviaSkill1(charData);
    else if (skill.id === 2) applySylviaSkill2(charData);
  } else if (charData.charId === 11) {
    if (skill.id === 1) applyGalanSkill1(charData);
    else if (skill.id === 2) applyGalanSkill2(charData);
  }

  applyAllPassives();
  renderBattleUI();
  if (checkBattleEnd()) return;
}

// ==================== 点击角色 → 显示完整详情面板 ====================
function showBattleCharDetail(idx) {
  const item = currentTeam[idx];
  const char = window.getCharacterData(item.charId);
  const stats = window.calculateStats(item, char);

  let buffHTML = item.buffs ? item.buffs.map(b => `<div class="bg-emerald-900 px-4 py-2 rounded-2xl text-emerald-300">✅ ${b.name}</div>`).join('') : '';
  let debuffHTML = item.debuffs ? item.debuffs.map(d => `<div class="bg-red-900 px-4 py-2 rounded-2xl text-red-300">❌ ${d.name}</div>`).join('') : '';

  const html = `
    <div class="flex flex-col lg:flex-row gap-6 p-8">
      <div class="flex-1 flex flex-col">
        <div class="border-4 border-orange-500 rounded-3xl p-4 bg-gray-950 flex-1 flex items-center justify-center">
          <img src="${char.image}" class="character-img w-full max-h-[420px] rounded-2xl">
        </div>
      </div>
      <div class="flex-1">
        <div class="text-3xl font-bold mb-4">${char.name}</div>
        <div class="grid grid-cols-2 gap-3">
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">血量</div>
            <div class="text-4xl font-bold">${Math.floor(item.currentHP || stats.hp)} / ${stats.hp}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">攻击</div>
            <div class="text-4xl font-bold">${stats.atk}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">防御</div>
            <div class="text-4xl font-bold">${stats.def}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">暴击率</div>
            <div class="text-4xl font-bold">${(stats.critRate*100).toFixed(0)}%</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">暴击伤害</div>
            <div class="text-4xl font-bold">${(stats.critDamage*100).toFixed(0)}%</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">减伤</div>
            <div class="text-4xl font-bold">0%</div>
          </div>
        </div>
        <!-- 当前状态栏 -->
        <div class="mt-8 border-4 border-orange-500 rounded-3xl p-6">
          <div class="text-lg font-bold mb-4">当前状态（buff / debuff / 侵蚀）</div>
          <div class="space-y-2">${buffHTML}${debuffHTML}</div>
        </div>
        <!-- 本回合技能释放区域 -->
        <div class="mt-8 border-4 border-orange-500 rounded-3xl p-6">
          <div class="text-lg font-bold mb-4">本回合可释放技能</div>
          <div class="space-y-3">
            ${(window.characterSkills[item.charId] || {active:[]}).active.map((skill, sIdx) => `
              <button onclick="window.executeSkillFromDetail(${idx},${sIdx});" 
                      class="w-full bg-teal-600 hover:bg-teal-700 py-4 rounded-2xl text-lg font-bold">
                ${skill.name}（${skill.cost}⚡）
              </button>`).join('')}
          </div>
        </div>
      </div>
    </div>
    <div class="text-center py-6">
      <button onclick="window.hideBattleCharDetail()" class="text-gray-400 text-xl">关闭</button>
    </div>
  `;

  document.getElementById("battleModalInner").innerHTML = html;
  document.getElementById("battleCharDetailModal").classList.remove("hidden");
}

function executeSkillFromDetail(charIdx, skillIdx) {
  hideBattleCharDetail();
  executeSkill(charIdx, skillIdx);
}

function hideBattleCharDetail() {
  document.getElementById("battleCharDetailModal").classList.add("hidden");
}

// ==================== 点击怪物查看实时面板 ====================
function showEnemyDetail(enemyIdx) {
  const enemy = enemies[enemyIdx];
  const html = `
    <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-[14000]">
      <div class="bg-zinc-900 rounded-3xl max-w-md w-full mx-4 p-8">
        <div class="flex justify-between mb-6">
          <h3 class="text-2xl font-bold">${enemy.name}</h3>
          <button onclick="window.hideEnemyDetail()" class="text-4xl text-gray-400">×</button>
        </div>
        <div class="text-4xl font-bold mb-4">❤️ ${Math.floor(enemy.hp)} / ${enemy.maxHP}</div>
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="text-center">攻击：${enemy.atk}</div>
          <div class="text-center">防御：${enemy.def}</div>
        </div>
        <div class="text-lg font-bold mb-3">当前侵蚀</div>
        <div class="flex flex-wrap gap-2">
          ${enemy.erosions.map(e => {
            const t = window.erosionTypes[e.type];
            return `<span class="px-3 py-1 rounded-xl text-xs" style="background:${t.color}">${t.icon} ${t.name}×${e.layers||1}（${e.duration}回合）</span>`;
          }).join('') || '<p class="text-gray-400">无侵蚀效果</p>'}
        </div>
        <div class="text-center mt-8">
          <button onclick="window.hideEnemyDetail()" class="px-10 py-4 bg-zinc-700 hover:bg-zinc-600 rounded-2xl text-lg font-bold">关闭</button>
        </div>
      </div>
    </div>`;
  const div = document.createElement("div");
  div.id = "enemyDetailModal";
  div.innerHTML = html;
  document.body.appendChild(div);
}

function hideEnemyDetail() {
  const modal = document.getElementById("enemyDetailModal");
  if (modal) modal.remove();
}

// ==================== 渲染战斗主界面 ====================
function renderBattleUI() {
  document.getElementById("battleEnergy").textContent = `${teamEnergy} / 6`;
  document.getElementById("turnNumber").textContent = battleTurn;

  // 我方队伍
  const playerArea = document.getElementById("playerTeamArea");
  playerArea.innerHTML = "";
  const pFrag = document.createDocumentFragment();
  currentTeam.forEach((charData, i) => {
    const char = window.getCharacterData(charData.charId);
    const stats = window.calculateStats(charData, char);
    const div = document.createElement("div");
    div.className = `relative bg-zinc-800 rounded-3xl p-3 text-center cursor-pointer border-4 ${window.getRarityColor(char.rarity)}`;
    div.innerHTML = `
      <img src="${char.image}" class="character-img w-full rounded-2xl mb-2">
      <div class="font-bold text-sm">${char.name}</div>
      <div class="text-xs text-emerald-400">❤️ ${Math.floor(charData.currentHP || stats.hp)}/${stats.hp}</div>
    `;
    div.onclick = () => showBattleCharDetail(i);
    pFrag.appendChild(div);
  });
  playerArea.appendChild(pFrag);

  // 行动栏（结束回合按钮）
  const bar = document.getElementById("actionBar");
  bar.innerHTML = `<button onclick="window.endPlayerTurn()" class="px-12 py-5 bg-orange-600 hover:bg-orange-700 rounded-3xl text-2xl font-bold w-full">结束回合</button>`;

  // 敌方（可点击）
  const enemyArea = document.getElementById("enemyArea");
  enemyArea.innerHTML = "";
  const eFrag = document.createDocumentFragment();
  enemies.forEach((enemy, i) => {
    const percent = Math.max(0, Math.floor((enemy.hp / enemy.maxHP) * 100));
    const div = document.createElement("div");
    div.className = "bg-red-950 border-4 border-red-500 rounded-3xl p-4 w-64 text-center cursor-pointer";
    div.innerHTML = `
      <div class="font-bold mb-1">${enemy.name}</div>
      <div class="text-xl mb-2">❤️ ${Math.floor(enemy.hp)} / ${enemy.maxHP}</div>
      <div class="h-3 bg-zinc-800 rounded-full overflow-hidden mb-3">
        <div class="h-full bg-red-500 transition-all" style="width:${percent}%"></div>
      </div>
      <div class="flex flex-wrap gap-1 justify-center">
        ${enemy.erosions.map(e => {
          const t = window.erosionTypes[e.type];
          return `<span class="text-xs px-2 py-0.5 rounded" style="background:${t.color}">${t.icon} ${t.name}×${e.layers||1}</span>`;
        }).join('') || '<span class="text-gray-400">无侵蚀</span>'}
      </div>
    `;
    div.onclick = () => showEnemyDetail(i);
    eFrag.appendChild(div);
  });
  enemyArea.appendChild(eFrag);
}

// ==================== 回合结束（怪物攻击 + 重置技能记录） ====================
function endPlayerTurn() {
  usedSkillsThisTurn = {}; // 重置本回合技能使用记录
  triggerDOTs();

  // 怪物攻击
  enemies.forEach(enemy => {
    if (enemy.hp <= 0) return;
    const target = currentTeam[Math.floor(Math.random() * currentTeam.length)];
    const stats = window.calculateStats(target, window.getCharacterData(target.charId));
    let dmg = Math.max(1, enemy.atk - stats.def * 0.6);
    if (target.shield > 0) {
      const absorbed = Math.min(target.shield, dmg);
      target.shield -= absorbed;
      dmg -= absorbed;
    }
    target.currentHP = Math.max(0, (target.currentHP || stats.hp) - Math.floor(dmg));
  });

  battleTurn++;
  teamEnergy = Math.min(6, teamEnergy + 2);
  renderBattleUI();
  if (checkBattleEnd()) return;
}

function checkBattleEnd() {
  const allEnemyDead = enemies.every(e => e.hp <= 0);
  const allPlayerDead = currentTeam.every(c => (c.currentHP || 0) <= 0);
  if (allEnemyDead) {
    alert("🎉 战斗胜利！获得 800 金币 + 120 耀星 + 15 强化石");
    player.gold += 800; player.yaoXing += 120; player.reinforceStone += 15;
    document.getElementById("gold").textContent = player.gold;
    document.getElementById("yaoXing").textContent = player.yaoXing;
    document.getElementById("reinforceStone").textContent = player.reinforceStone;
    window.saveGame();
    endBattle();
    return true;
  }
  if (allPlayerDead) {
    alert("💥 战斗失败！");
    endBattle();
    return true;
  }
  return false;
}

// ==================== 战斗入口 ====================
function openBattleStart() {
  currentTeam = [];
  document.getElementById("battleStartModal").classList.remove("hidden");
  renderTeamSelection();
}

function hideBattleStartModal() {
  document.getElementById("battleStartModal").classList.add("hidden");
}

function renderTeamSelection() {
  const grid = document.getElementById("teamSelectionGrid");
  grid.innerHTML = "";
  const fragment = document.createDocumentFragment();
  const uniqueOwned = player.owned.reduce((acc, item) => {
    if (!acc.some(i => i.charId === item.charId)) acc.push(item);
    return acc;
  }, []);
  uniqueOwned.forEach(item => {
    const char = window.getCharacterData(item.charId);
    const div = document.createElement("div");
    div.className = `relative bg-zinc-800 rounded-3xl p-4 cursor-pointer border-4 transition ${currentTeam.some(t => t.id === item.id) ? 'border-emerald-400 scale-105' : window.getRarityColor(char.rarity)}`;
    div.innerHTML = `
      <img src="${char.image}" class="character-img w-full rounded-2xl mb-3">
      <div class="text-center">
        <div class="rarity-${char.rarity.toLowerCase()} text-xs inline-block px-4 py-1 rounded-full text-white font-bold mb-1">${char.rarity}</div>
        <div class="font-bold">${char.name}</div>
        <div class="text-sm text-gray-400">Lv.${item.level} ★${item.stars}</div>
      </div>
    `;
    div.onclick = () => toggleTeamMember(item, div);
    fragment.appendChild(div);
  });
  grid.appendChild(fragment);
  document.getElementById("startBattleBtn").disabled = currentTeam.length === 0;
}

function toggleTeamMember(item, element) {
  const index = currentTeam.findIndex(t => t.id === item.id);
  if (index > -1) {
    currentTeam.splice(index, 1);
    element.classList.remove("border-emerald-400", "scale-105");
  } else if (currentTeam.length < 4) {
    currentTeam.push(item);
    element.classList.add("border-emerald-400", "scale-105");
  }
  document.getElementById("startBattleBtn").disabled = currentTeam.length === 0;
}

function startBattle() {
  hideBattleStartModal();
  currentTeam = currentTeam.map(item => ({
    ...item,
    currentHP: window.calculateStats(item, window.getCharacterData(item.charId)).hp,
    buffs: [], debuffs: [], shield: 0
  }));
  enemies = [JSON.parse(JSON.stringify(enemyPool[Math.floor(Math.random()*enemyPool.length)]))];
  battleTurn = 1;
  teamEnergy = 4;
  usedSkillsThisTurn = {};
  document.getElementById("battleModal").classList.remove("hidden");
  renderBattleUI();
}

function endBattle() {
  if (confirm("确定退出战斗吗？")) {
    document.getElementById("battleModal").classList.add("hidden");
    currentTeam = [];
    enemies = [];
  }
}

// ==================== 暴露 ====================
window.openBattleStart = openBattleStart;
window.hideBattleStartModal = hideBattleStartModal;
window.startBattle = startBattle;
window.renderBattleUI = renderBattleUI;
window.executeSkill = executeSkill;
window.endPlayerTurn = endPlayerTurn;
window.endBattle = endBattle;
window.showBattleCharDetail = showBattleCharDetail;
window.hideBattleCharDetail = hideBattleCharDetail;
window.showEnemyDetail = showEnemyDetail;
window.hideEnemyDetail = hideEnemyDetail;
window.executeSkillFromDetail = executeSkillFromDetail;
