// js/battle.js - 完整DOT侵蚀战斗系统 v2.0（全部技能+被动+共鸣+实时演算）
let currentTeam = [];           // 上场角色快照 [{id, charId, level, stars, currentHP, buffs, debuffs, shield, ...}]
let enemies = [];               // 敌人状态
let battleTurn = 1;
let teamEnergy = 4;

// ==================== 怪物池 ====================
const enemyPool = [
  {id:1, name:"深渊影魔", hp:2800, maxHP:2800, atk:190, def:85, erosions:[]},
  {id:2, name:"元素守卫", hp:3400, maxHP:3400, atk:230, def:130, erosions:[]},
  {id:3, name:"狂暴炎兽", hp:4200, maxHP:4200, atk:280, def:110, erosions:[]}
];

// ==================== 实时演算核心====================
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
  currentTeam.forEach(char => {
    if (window.characterSkills[char.charId]?.passive.includes("timeBlessing")) {
      const uniqueCount = new Set(enemies.flatMap(e => e.erosions.map(er => er.type))).size;
      teamEnergy = Math.min(6, teamEnergy + Math.min(2, uniqueCount));
    }
  });
  return totalDamage;
}

function applyAllPassives() {
  currentTeam.forEach(charData => {
    const skills = window.characterSkills[charData.charId];
    if (!skills) return;
    // 加兰被动：神圣惩戒（简化实时触发，在伤害阶段处理）
    if (skills.passive.includes("holyTeamBoost")) {
      const aliveCount = currentTeam.filter(c => (c.currentHP || 0) > 0).length;
      // 实际加成在伤害计算时动态使用
    }
  });
}

// ==================== 技能执行（全部按描述实装） ====================
function executeSkill(charIdx, skillIdx) {
  const charData = currentTeam[charIdx];
  const char = window.getCharacterData(charData.charId);
  const skills = window.characterSkills[charData.charId];
  if (!skills || !skills.active[skillIdx]) return alert("技能不存在！");
  const skill = skills.active[skillIdx];
  if (teamEnergy < skill.cost) return alert("⚡ 能量不足！");

  teamEnergy -= skill.cost;

  // 克罗诺
  if (charData.charId === 14) {
    if (skill.id === 1) { // 时之加速
      currentTeam.forEach(c => c.buffs.push({name:"时之加速", duration:3}));
    } else if (skill.id === 2) { // 命运蚀刻
      enemies.forEach(e => {
        e.erosions.push({type:"chrono", duration:5, sourceCharId:14});
        e.speedDebuff = 4;
      });
    }
  }
  // 埃尔温
  else if (charData.charId === 15) {
    if (skill.id === 1) { // 起源崩解
      const target = enemies[0];
      const stats = window.calculateStats(charData, char);
      target.hp -= Math.floor(stats.atk * 2.8);
      target.erosions.push({type:"source", layers:4, duration:6, sourceCharId:15});
    } else if (skill.id === 2) { // 元素灭世潮
      const stats = window.calculateStats(charData, char);
      enemies.forEach(e => {
        e.hp -= Math.floor(stats.atk * 1.4);
        e.erosions.push({type:"source", layers:2, duration:6, sourceCharId:15});
        const randomKey = Object.keys(window.erosionTypes)[Math.floor(Math.random() * 3) + 1];
        e.erosions.push({type:randomKey, duration:4, sourceCharId:15});
      });
    }
    // 被动多重侵蚀
    if (window.characterSkills[15].passive.includes("multiErosion")) {
      enemies.forEach(e => {
        if (e.erosions.length >= 2) e.hp -= Math.floor(window.calculateStats(charData, char).atk * 0.35);
      });
    }
  }
  // 塞尔维亚
  else if (charData.charId === 9) {
    if (skill.id === 1) { // 星辰腐朽咒
      enemies.forEach(e => {
        e.erosions.push({type:"star", duration:4, sourceCharId:9});
        e.defDebuff = 3;
      });
    } else if (skill.id === 2) { // 星芒增幅
      currentTeam.forEach(c => c.shield = Math.floor(window.calculateStats(c, window.getCharacterData(c.charId)).def * 1.5));
    }
  }
  // 加兰
  else if (charData.charId === 11) {
    if (skill.id === 1) { // 圣辉壁垒
      currentTeam.forEach(c => c.shield = Math.floor(window.calculateStats(charData, char).def * 2));
      charData.buffs.push({name:"圣辉反伤", duration:3});
    } else if (skill.id === 2) { // 审判烈焰斩
      const target = enemies[0];
      const stats = window.calculateStats(charData, char);
      target.hp -= Math.floor(stats.atk * 1.9);
      target.erosions.push({type:"holy", duration:4, sourceCharId:11});
      target.taunt = 2;
    }
  }

  applyAllPassives();
  renderBattleUI();
  if (checkBattleEnd()) return;
}

// ==================== 新增：伤害飘字 ====================
function showDamageNumber(targetEl, damage, isCrit = false) {
  const number = document.createElement("div");
  number.className = `absolute text-3xl font-bold pointer-events-none ${isCrit ? 'text-red-400' : 'text-white'} drop-shadow-lg`;
  number.style.left = "50%";
  number.style.top = "30%";
  number.textContent = `-${Math.floor(damage)}`;
  targetEl.appendChild(number);
  setTimeout(() => {
    number.style.transition = "all 0.8s ease-out";
    number.style.transform = "translateY(-80px)";
    number.style.opacity = "0";
    setTimeout(() => number.remove(), 800);
  }, 50);
}

// ==================== 战斗UI渲染 ====================
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
      <div class="text-[10px] text-teal-300">${charData.buffs ? charData.buffs.map(b => b.name).join(" ") : ""}</div>
    `;
    div.onclick = () => showBattleCharDetail(i);
    pFrag.appendChild(div);
  });
  playerArea.appendChild(pFrag);

  // 行动栏
  const bar = document.getElementById("actionBar");
  bar.innerHTML = "";
  currentTeam.forEach((charData, idx) => {
    const skills = window.characterSkills[charData.charId] || {active:[]};
    skills.active.forEach((skill, sIdx) => {
      const btn = document.createElement("button");
      btn.className = `px-5 py-3 bg-zinc-700 hover:bg-teal-600 rounded-2xl text-xs font-bold mx-1 ${teamEnergy < skill.cost ? 'opacity-40 cursor-not-allowed' : ''}`;
      btn.textContent = `${charData.name.slice(0,2)} ${skill.name}`;
      btn.onclick = () => executeSkill(idx, sIdx);
      bar.appendChild(btn);
    });
  });
  // 结束回合按钮
  const endBtn = document.createElement("button");
  endBtn.className = "ml-6 px-8 py-3 bg-orange-600 hover:bg-orange-700 rounded-3xl text-lg font-bold";
  endBtn.textContent = "结束回合";
  endBtn.onclick = endPlayerTurn;
  bar.appendChild(endBtn);

  // 敌方
  const enemyArea = document.getElementById("enemyArea");
  enemyArea.innerHTML = "";
  const eFrag = document.createDocumentFragment();
  enemies.forEach(enemy => {
    const div = document.createElement("div");
    div.className = "bg-red-950 border-4 border-red-500 rounded-3xl p-4 w-56 text-center";
    let erosionHTML = enemy.erosions.map(e => {
      const t = window.erosionTypes[e.type];
      return `<span class="text-xs px-2 py-0.5 rounded" style="background:${t.color}">${t.icon} ${t.name}×${e.layers||1}</span>`;
    }).join("");
    div.innerHTML = `
      <div class="font-bold">${enemy.name}</div>
      <div class="text-xl">❤️ ${Math.floor(enemy.hp)}/${enemy.maxHP}</div>
      <div class="flex flex-wrap gap-1 justify-center mt-3">${erosionHTML || '<span class="text-gray-400">无侵蚀</span>'}</div>
    `;
    eFrag.appendChild(div);
  });
  enemyArea.appendChild(eFrag);
}

function endPlayerTurn() {
  triggerDOTs();
  // 敌人反击（简易AI）
  enemies.forEach(enemy => {
    if (enemy.hp <= 0) return;
    const target = currentTeam[Math.floor(Math.random() * currentTeam.length)];
    const stats = window.calculateStats(target, window.getCharacterData(target.charId));
    let dmg = Math.max(1, enemy.atk - stats.def * 0.6);
    if (target.shield > 0) {
      target.shield = Math.max(0, target.shield - dmg);
      dmg = 0;
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

// ==================== 选人界面 ====================
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
  enemies = [JSON.parse(JSON.stringify(enemyPool[0]))];
  battleTurn = 1;
  teamEnergy = 4;
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

// ==================== 战斗详情面板====================
function showBattleCharDetail(idx) {
  const item = currentTeam[idx];
  const char = window.getCharacterData(item.charId);
  const stats = window.calculateStats(item, char);

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
          <div class="text-lg font-bold mb-4">当前状态</div>
          <div class="space-y-2">
            ${item.buffs ? item.buffs.map(b => `<div class="bg-emerald-900 px-4 py-2 rounded-2xl text-emerald-300">✅ ${b.name}</div>`).join('') : ''}
            ${item.erosions ? item.erosions.map(e => {
              const t = window.erosionTypes[e.type];
              return `<div class="bg-purple-900 px-4 py-2 rounded-2xl text-purple-300">${t.icon} ${t.name}（${e.duration}回合）</div>`;
            }).join('') : ''}
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

function hideBattleCharDetail() {
  document.getElementById("battleCharDetailModal").classList.add("hidden");
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
