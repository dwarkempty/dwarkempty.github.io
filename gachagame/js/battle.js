// js/battle.js - 完整DOT侵蚀战斗系统 v2.5（最终版）
let currentTeam = [];
let enemies = [];
let battleTurn = 1;
let teamEnergy = 4;
let usedSkillsThisTurn = {};

const enemyPool = [
  {id:1, name:"深渊影魔", hp:2800, maxHP:2800, atk:190, def:85, erosions:[], defDebuff:0},
  {id:2, name:"元素守卫", hp:3400, maxHP:3400, atk:230, def:130, erosions:[], defDebuff:0},
  {id:3, name:"狂暴炎兽", hp:4200, maxHP:4200, atk:280, def:110, erosions:[], defDebuff:0}
];

function calculateResonance(erosions) {
  const unique = new Set(erosions.map(e => e.type));
  return Math.min(45, (unique.size - 1) * 15);
}

function triggerDOTs() {
  enemies.forEach(enemy => {
    if (enemy.hp <= 0) return;
    const resonance = calculateResonance(enemy.erosions);
    enemy.erosions.forEach(ero => {
      if (ero.duration <= 0) return;
      let dmg = 0;
      const source = currentTeam.find(c => c.charId === ero.sourceCharId);
      if (!source) return;
      const stats = window.calculateStats(source, window.getCharacterData(source.charId));
      if (ero.type === "chrono") dmg = stats.atk * 0.8;
      else if (ero.type === "source") dmg = stats.atk * 0.45 * (ero.layers || 1);
      else if (ero.type === "star") dmg = stats.atk * 0.65;
      else if (ero.type === "holy") dmg = stats.atk * 0.7;
      dmg *= (1 + resonance / 100);
      enemy.hp = Math.max(0, enemy.hp - Math.floor(dmg));
      ero.duration--;
      if (ero.layers) ero.layers = Math.max(0, ero.layers - 1);
    });
    enemy.erosions = enemy.erosions.filter(e => e.duration > 0);
  });
}

function showDamageNumber(container, damage) {
  const num = document.createElement("div");
  num.className = "absolute text-4xl font-bold text-white drop-shadow-2xl pointer-events-none";
  num.style.left = "50%";
  num.style.top = "40%";
  num.style.transform = "translate(-50%, -50%)";
  num.textContent = `-${Math.floor(damage)}`;
  container.appendChild(num);
  setTimeout(() => {
    num.style.transition = "all 0.9s cubic-bezier(0.4, 0, 1, 1)";
    num.style.opacity = "0";
    num.style.transform = "translate(-50%, -150px)";
    setTimeout(() => num.remove(), 900);
  }, 30);
}

function executeSkill(charIdx, skillIdx) {
  const charData = currentTeam[charIdx];
  const char = window.getCharacterData(charData.charId);
  const skillList = window.characterSkills[charData.charId];
  if (!skillList || !skillList.active[skillIdx]) return;

  const skill = skillList.active[skillIdx];
  const skillId = skill.id;

  if (!usedSkillsThisTurn[charData.id]) usedSkillsThisTurn[charData.id] = [];
  if (usedSkillsThisTurn[charData.id].includes(skillId)) {
    alert("该技能本回合已使用！");
    return;
  }
  usedSkillsThisTurn[charData.id].push(skillId);

  if (teamEnergy < skill.cost) {
    alert("⚡ 能量不足！");
    return;
  }

  teamEnergy -= skill.cost;

  // 克罗诺
  if (charData.charId === 14) {
    if (skill.id === 1) currentTeam.forEach(c => c.buffs.push({name:"时之加速", duration:3}));
    if (skill.id === 2) enemies.forEach(e => e.erosions.push({type:"chrono", duration:5, sourceCharId:14}));
  }
  // 埃尔温
  if (charData.charId === 15) {
    if (skill.id === 1) {
      const target = enemies[0];
      const stats = window.calculateStats(charData, char);
      const dmg = Math.floor(stats.atk * 2.8);
      target.hp = Math.max(0, target.hp - dmg);
      showDamageNumber(document.querySelector("#enemyArea > div"), dmg);
      target.erosions.push({type:"source", layers:4, duration:6, sourceCharId:15});
    }
    if (skill.id === 2) {
      const stats = window.calculateStats(charData, char);
      enemies.forEach((e, i) => {
        const dmg = Math.floor(stats.atk * 1.4);
        e.hp = Math.max(0, e.hp - dmg);
        showDamageNumber(document.querySelectorAll("#enemyArea > div")[i], dmg);
        e.erosions.push({type:"source", layers:2, duration:6, sourceCharId:15});
        const randomType = Object.keys(window.erosionTypes)[Math.floor(Math.random()*3)+1];
        e.erosions.push({type:randomType, duration:4, sourceCharId:15});
      });
    }
  }
  // 塞尔维亚
  if (charData.charId === 9) {
    if (skill.id === 1) {
      enemies.forEach(e => {
        e.erosions.push({type:"star", duration:4, sourceCharId:9});
        e.defDebuff = 3;
      });
    }
    if (skill.id === 2) {
      currentTeam.forEach(c => c.shield = Math.floor(window.calculateStats(c, window.getCharacterData(c.charId)).def * 1.5));
    }
  }
  // 加兰
  if (charData.charId === 11) {
    if (skill.id === 1) {
      currentTeam.forEach(c => c.shield = Math.floor(window.calculateStats(charData, char).def * 2));
      charData.buffs.push({name:"圣辉反伤", duration:3});
    }
    if (skill.id === 2) {
      const target = enemies[0];
      const stats = window.calculateStats(charData, char);
      const dmg = Math.floor(stats.atk * 1.9);
      target.hp = Math.max(0, target.hp - dmg);
      showDamageNumber(document.querySelector("#enemyArea > div"), dmg);
      target.erosions.push({type:"holy", duration:4, sourceCharId:11});
    }
  }

  renderBattleUI();
  if (checkBattleEnd()) return;
}

function showBattleCharDetail(idx) {
  const item = currentTeam[idx];
  const char = window.getCharacterData(item.charId);
  const stats = window.calculateStats(item, char);

  const html = `
    <div class="flex flex-col lg:flex-row gap-6 p-8">
      <div class="flex-1">
        <img src="${char.image}" class="character-img w-full rounded-2xl">
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
        </div>
        <div class="mt-8 border-4 border-orange-500 rounded-3xl p-6">
          <div class="text-lg font-bold mb-4">当前状态</div>
          <div class="space-y-2">
            ${item.buffs && item.buffs.length ? item.buffs.map(b => `<div class="bg-emerald-900 px-4 py-2 rounded-2xl">✅ ${b.name}</div>`).join('') : ''}
            ${item.debuffs && item.debuffs.length ? item.debuffs.map(d => `<div class="bg-red-900 px-4 py-2 rounded-2xl">❌ ${d.name}</div>`).join('') : ''}
          </div>
        </div>
        <div class="mt-8 border-4 border-orange-500 rounded-3xl p-6">
          <div class="text-lg font-bold mb-4">释放技能</div>
          <div class="space-y-3">
            ${(window.characterSkills[item.charId]||{active:[]}).active.map((s,i) => `
              <button onclick="executeSkillFromDetail(${idx},${i});" class="w-full py-4 bg-teal-600 hover:bg-teal-700 rounded-2xl text-lg font-bold">
                ${s.name}（${s.cost}⚡）
              </button>`).join('')}
          </div>
        </div>
        <button onclick="doNormalAttack(${idx}); hideBattleCharDetail();" class="mt-4 w-full py-5 bg-zinc-700 hover:bg-zinc-600 rounded-2xl text-xl font-bold">
          普攻（90%-100% ATK）
        </button>
      </div>
    </div>
    <div class="text-center py-6">
      <button onclick="hideBattleCharDetail()" class="text-gray-400 text-xl">关闭</button>
    </div>
  `;

  document.getElementById("battleModalInner").innerHTML = html;
  document.getElementById("battleCharDetailModal").classList.remove("hidden");
}

function executeSkillFromDetail(idx, skillIdx) {
  hideBattleCharDetail();
  executeSkill(idx, skillIdx);
}

function hideBattleCharDetail() {
  document.getElementById("battleCharDetailModal").classList.add("hidden");
}

function showEnemyDetail(i) {
  const enemy = enemies[i];
  const html = `
    <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-[14000]">
      <div class="bg-zinc-900 rounded-3xl max-w-md w-full mx-4 p-8">
        <div class="flex justify-between mb-6">
          <h3 class="text-2xl font-bold">${enemy.name}</h3>
          <button onclick="hideEnemyDetail()" class="text-4xl text-gray-400">×</button>
        </div>
        <div class="text-4xl font-bold mb-4">❤️ ${Math.floor(enemy.hp)} / ${enemy.maxHP}</div>
        <div class="flex flex-wrap gap-2">
          ${enemy.erosions.map(e => {
            const t = window.erosionTypes[e.type];
            return `<span class="px-3 py-1 rounded-xl text-xs" style="background:${t.color}">${t.icon} ${t.name}×${e.layers||1}（${e.duration}回合）</span>`;
          }).join('') || '<p class="text-gray-400">无侵蚀效果</p>'}
        </div>
        <div class="text-center mt-8">
          <button onclick="hideEnemyDetail()" class="px-10 py-4 bg-zinc-700 hover:bg-zinc-600 rounded-2xl text-lg font-bold">关闭</button>
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

function renderBattleUI() {
  document.getElementById("battleEnergy").textContent = `${teamEnergy} / 6`;
  document.getElementById("turnNumber").textContent = battleTurn;

  const playerArea = document.getElementById("playerTeamArea");
  playerArea.innerHTML = "";
  currentTeam.forEach((c, i) => {
    const char = window.getCharacterData(c.charId);
    const stats = window.calculateStats(c, char);
    const div = document.createElement("div");
    div.className = `bg-zinc-800 rounded-3xl p-3 cursor-pointer border-4 ${window.getRarityColor(char.rarity)}`;
    div.innerHTML = `
      <img src="${char.image}" class="character-img w-full rounded-2xl mb-2">
      <div class="font-bold">${char.name}</div>
      <div class="text-emerald-400">❤️ ${Math.floor(c.currentHP || stats.hp)}/${stats.hp}</div>
    `;
    div.onclick = () => showBattleCharDetail(i);
    playerArea.appendChild(div);
  });

  document.getElementById("actionBar").innerHTML = `
    <button onclick="endPlayerTurn()" class="px-12 py-5 bg-orange-600 hover:bg-orange-700 rounded-3xl text-2xl font-bold w-full">
      结束回合
    </button>`;

  const enemyArea = document.getElementById("enemyArea");
  enemyArea.innerHTML = "";
  enemies.forEach((e, i) => {
    const percent = Math.max(0, Math.floor(e.hp / e.maxHP * 100));
    const div = document.createElement("div");
    div.className = "bg-red-950 border-4 border-red-500 rounded-3xl p-4 w-64 cursor-pointer";
    div.innerHTML = `
      <div class="font-bold">${e.name}</div>
      <div class="text-xl">❤️ ${Math.floor(e.hp)}/${e.maxHP}</div>
      <div class="h-3 bg-zinc-800 rounded-full overflow-hidden">
        <div class="h-full bg-red-500" style="width:${percent}%"></div>
      </div>
    `;
    div.onclick = () => showEnemyDetail(i);
    enemyArea.appendChild(div);
  });
}

function endPlayerTurn() {
  usedSkillsThisTurn = {};
  triggerDOTs();

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
  checkBattleEnd();
}

function checkBattleEnd() {
  if (enemies.every(e => e.hp <= 0)) {
    alert("🎉 胜利！获得 800 金币 + 120 耀星 + 15 强化石");
    player.gold += 800; player.yaoXing += 120; player.reinforceStone += 15;
    document.getElementById("gold").textContent = player.gold;
    document.getElementById("yaoXing").textContent = player.yaoXing;
    document.getElementById("reinforceStone").textContent = player.reinforceStone;
    window.saveGame();
    endBattle();
  }
  if (currentTeam.every(c => (c.currentHP || 0) <= 0)) {
    alert("💥 失败！");
    endBattle();
  }
}

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

function doNormalAttack(charIdx) {
  const charData = currentTeam[charIdx];
  const char = window.getCharacterData(charData.charId);
  const stats = window.calculateStats(charData, char);
  const damage = Math.floor(stats.atk * (0.9 + Math.random() * 0.1));
  const target = enemies[0];
  target.hp = Math.max(0, target.hp - damage);
  showDamageNumber(document.querySelector("#enemyArea > div"), damage);
  renderBattleUI();
  if (checkBattleEnd()) return;
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
window.doNormalAttack = doNormalAttack;
