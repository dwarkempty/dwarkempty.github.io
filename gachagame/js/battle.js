// js/battle.js - 最终完整版
let currentBattleTeam = [null, null, null, null];
let battleEnergy = 4;
const MAX_ENERGY = 6;
const ENERGY_PER_TURN = 2;

let hasActed = [false, false, false, false];
let playerHP = [0, 0, 0, 0];
let playerMaxHP = [0, 0, 0, 0];

let currentEnemyTargets = [
  { id: 1, name: "森林魔狼", hp: 1200, maxHp: 1200, atk: 65, defense: 40, status: {} },
  { id: 2, name: "影林刺客", hp: 850, maxHp: 850, atk: 90, defense: 25, status: {} }
];

let playerStatuses = [{}, {}, {}, {}];

// ====================== R级角色完整技能数据（含特殊效果） ======================
const characterSkillMap = {
  1: { // 艾伦
    description: "出身幽暗森林的年轻游侠，精通弓箭与自然追踪。性格坚韧乐观，热爱冒险与保护生态。虽经验尚浅，但精准的箭术能为团队提供可靠的远程支援，是新手冒险者最常见的伙伴。",
    normalAttack: "普通攻击：对敌方单体造成80%总攻击的物理伤害",
    skill1Name: "【穿林箭】",
    skill1Desc: "消耗1点能量，对敌方单体造成120%总攻击的物理伤害，并降低目标10%防御，持续2回合。若目标处于后排，该技能额外无视5%的防御",
    skill1Cost: 1,
    execute: (position) => {
      const char = currentBattleTeam[position];
      const stats = window.calculateStats(char, window.getCharacterData(char.charId), null);
      let damage = Math.floor(stats.atk * 1.2);
      const targetIndex = Math.floor(Math.random() * currentEnemyTargets.length);
      const target = currentEnemyTargets[targetIndex];
      if (targetIndex >= 1) damage = Math.floor(damage * 1.05); // 后排无视防御
      target.hp = Math.max(0, target.hp - damage);
      target.status.defDown = 2; // 防御降低2回合
      return `🏹 ${char.name} 发动【穿林箭】！造成 ${damage} 伤害 ${targetIndex >= 1 ? '(后排无视)' : ''} 🛡️ 目标防御降低10% (2回合)`;
    }
  },
  2: { // 莎莉
    description: "魔法学徒莎莉，天生亲和火焰元素。活泼热情但控制力不足，常在战斗中制造小爆炸。学习火焰魔法，希望成为强大法师，是队伍中活力满满的火力输出手。",
    normalAttack: "普通攻击：对敌方单体造成75%总攻击的火焰魔法伤害",
    skill1Name: "【火球冲击】",
    skill1Desc: "消耗1点能量，对敌方单体造成110%总攻击的火焰魔法伤害，有30%概率点燃目标（每回合造成相当于自身5%总攻击的额外持续伤害，持续2回合）",
    skill1Cost: 1,
    execute: (position) => {
      const char = currentBattleTeam[position];
      const stats = window.calculateStats(char, window.getCharacterData(char.charId), null);
      let damage = Math.floor(stats.atk * 1.1);
      const targetIndex = Math.floor(Math.random() * currentEnemyTargets.length);
      const target = currentEnemyTargets[targetIndex];
      target.hp = Math.max(0, target.hp - damage);
      if (Math.random() < 0.3) {
        target.status.burn = 2;
        return `🔥 ${char.name} 释放【火球冲击】！造成 ${damage} 伤害 🔥 点燃目标！`;
      }
      return `🔥 ${char.name} 释放【火球冲击】！造成 ${damage} 伤害`;
    }
  },
  3: { // 巴克
    description: "身躯如铁塔般的佣兵卫士，拥有惊人的耐力和防御力。忠诚可靠，总是冲在最前线保护同伴。话语不多，但行动胜于千言，是新手队伍最值得信赖的盾牌。",
    normalAttack: "普通攻击：对敌方单体造成70%总攻击的物理伤害",
    skill1Name: "【铁壁守护】",
    skill1Desc: "消耗1点能量，为自身或一名前排队友生成护盾（吸收相当于自身1.5倍总防御的伤害），持续2回合，并提升自身20%减伤1回合",
    skill1Cost: 1,
    execute: (position) => {
      const char = currentBattleTeam[position];
      const stats = window.calculateStats(char, window.getCharacterData(char.charId), null);
      playerStatuses[position].shield = Math.floor(stats.def * 1.5);
      playerStatuses[position].reduceDamage = 1;
      return `🛡️ ${char.name} 发动【铁壁守护】！生成护盾 🛡️ 自身减伤 +20% (1回合)`;
    }
  },
  4: { // 莉莉
    description: "月影森林的精灵少女，沐浴在月光下成长。温柔恬静，擅长月影魔法，能治愈伤口并增强盟友。虽战斗力不强，但她是团队不可或缺的治愈之光，深受大家喜爱。",
    normalAttack: "普通攻击：对敌方单体造成65%总攻击的魔法伤害",
    skill1Name: "【月光祈福】",
    skill1Desc: "消耗1点能量，为己方单体回复相当于自身80%总攻击的生命值，并提升目标10%攻击力，持续2回合。若目标为前排角色，额外为其附加5%暴击率加成",
    skill1Cost: 1,
    execute: (position) => {
      const char = currentBattleTeam[position];
      const stats = window.calculateStats(char, window.getCharacterData(char.charId), null);
      const heal = Math.floor(stats.atk * 0.8);
      playerHP[position] = Math.min(playerMaxHP[position], playerHP[position] + heal);
      return `🌙 ${char.name} 释放【月光祈福】！回复 ${heal} 生命值 🌟 攻击提升`;
    }
  }
};

// ====================== 执行技能 ======================
function executeSkill(position, isNormalAttack) {
  const char = currentBattleTeam[position];
  if (!char || hasActed[position]) return alert("该角色本回合已行动！");

  const skillInfo = characterSkillMap[char.charId];
  let logText = "";

  if (isNormalAttack) {
    const stats = window.calculateStats(char, window.getCharacterData(char.charId), null);
    const damage = Math.floor(stats.atk * 0.8);
    const targetIndex = Math.floor(Math.random() * currentEnemyTargets.length);
    currentEnemyTargets[targetIndex].hp = Math.max(0, currentEnemyTargets[targetIndex].hp - damage);
    logText = `⚔️ ${char.name} 发动【普攻】！造成 ${damage} 伤害`;
  } else {
    if (!skillInfo || battleEnergy < skillInfo.skill1Cost) return alert("能量不足！");
    battleEnergy -= skillInfo.skill1Cost;
    logText = skillInfo.execute(position);
  }

  document.getElementById("battleLog").innerHTML += `<div class="text-emerald-400">${logText}</div>`;
  document.getElementById("battleLog").scrollTop = 999999;

  hasActed[position] = true;
  renderBattleUI();

  if (hasActed.every(v => v)) setTimeout(enemyTurn, 800);
}

// ====================== 敌方回合 + 状态结算 ======================
function enemyTurn() {
  document.getElementById("battleLog").innerHTML += `<div class="text-red-400 font-bold">【敌方回合开始】</div>`;

  // 结算玩家点燃状态
  for (let i = 0; i < 4; i++) {
    if (playerStatuses[i].burn > 0) {
      const burnDamage = Math.floor(playerMaxHP[i] * 0.05);
      playerHP[i] = Math.max(0, playerHP[i] - burnDamage);
      document.getElementById("battleLog").innerHTML += `<div class="text-orange-400">🔥 ${currentBattleTeam[i].name} 受到点燃伤害 ${burnDamage}</div>`;
      playerStatuses[i].burn--;
    }
  }

  for (let i = 0; i < currentEnemyTargets.length; i++) {
    const enemy = currentEnemyTargets[i];
    if (enemy.hp <= 0) continue;
    const targetIndex = Math.floor(Math.random() * 4);
    const targetChar = currentBattleTeam[targetIndex];
    if (!targetChar) continue;
    const damage = Math.floor(enemy.atk * 0.9);
    playerHP[targetIndex] = Math.max(0, playerHP[targetIndex] - damage);
    document.getElementById("battleLog").innerHTML += `<div class="text-red-400">${enemy.name} 攻击 ${targetChar.name}，造成 ${damage} 伤害</div>`;
  }

  checkBattleEnd();
  renderBattleUI();
}

// ====================== 胜负判断 ======================
function checkBattleEnd() {
  const allEnemiesDead = currentEnemyTargets.every(e => e.hp <= 0);
  if (allEnemiesDead) {
    alert("🎉 战斗胜利！获得 300 钻石 + 500 金币");
    player.diamonds += 300;
    player.gold += 500;
    window.saveGame();
    hideBattleModal();
    return;
  }
  const allPlayersDead = playerHP.every(hp => hp <= 0);
  if (allPlayersDead) {
    alert("💀 战斗失败...");
    hideBattleModal();
  }
}

// ====================== 渲染主界面 ======================
function renderBattleUI() {
  document.getElementById("battleEnergy").innerHTML = `${battleEnergy} / ${MAX_ENERGY} <span class="text-xs text-gray-400">⚡</span>`;

  for (let i = 0; i < 4; i++) {
    const el = document.getElementById(`my-${i}`);
    if (currentBattleTeam[i]) {
      const data = window.getCharacterData(currentBattleTeam[i].charId);
      const acted = hasActed[i] ? 'opacity-50 pointer-events-none' : '';
      const hpPercent = Math.max(0, Math.floor((playerHP[i] / playerMaxHP[i]) * 100));
      el.innerHTML = `
        <img src="${data.image}" class="w-20 h-20 mx-auto rounded-2xl mb-2 ${acted}">
        <div class="text-sm font-bold ${acted}">${data.name}</div>
        <div class="text-xs text-gray-400">${playerHP[i]} / ${playerMaxHP[i]}</div>
        <div class="h-1.5 bg-gray-700 rounded mt-1 overflow-hidden"><div class="h-full bg-emerald-500" style="width:${hpPercent}%"></div></div>
      `;
    } else {
      el.innerHTML = `<div class="text-gray-500 text-sm">空位</div>`;
    }
  }

  // 敌人血条
  for (let i = 0; i < 2; i++) {
    const enemy = currentEnemyTargets[i];
    const hpPercent = Math.max(0, Math.floor((enemy.hp / enemy.maxHp) * 100));
    document.getElementById(`enemy-hp-${i}`).textContent = `${enemy.hp} / ${enemy.maxHp}`;
    document.getElementById(`enemy-hp-bar-${i}`).style.width = `${hpPercent}%`;
  }
}

// ====================== 战斗中点击角色详情 ======================
function showBattleCharDetail(index) {
  const char = currentBattleTeam[index];
  if (!char) return;
  const data = window.getCharacterData(char.charId);
  const stats = window.calculateStats(char, data, null);
  const skill = characterSkillMap[char.charId] || { description: "暂无描述", normalAttack: "普通攻击", skill1Name: "暂无技能", skill1Desc: "", skill1Cost: 0 };

  const html = `
    <div class="flex gap-8">
      <div class="flex-1 border-4 border-orange-500 rounded-3xl p-4 bg-gray-950 flex items-center justify-center">
        <img src="${data.image}" class="character-img w-full max-h-[420px] rounded-2xl">
      </div>
      <div class="flex-1">
        <div class="text-4xl font-bold mb-6">${data.name}</div>
        <div class="grid grid-cols-2 gap-3">
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center"><div class="text-sm text-orange-400">等级</div><div class="text-3xl">${char.level}</div></div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center"><div class="text-sm text-orange-400">星级</div><div class="text-3xl">${"★".repeat(char.stars)}</div></div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center"><div class="text-sm text-orange-400">攻击</div><div class="text-3xl">${stats.atk}</div></div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center"><div class="text-sm text-orange-400">暴击率</div><div class="text-3xl">${(stats.critRate*100).toFixed(0)}%</div></div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center"><div class="text-sm text-orange-400">血量</div><div class="text-3xl">${stats.hp}</div></div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center"><div class="text-sm text-orange-400">暴击伤害</div><div class="text-3xl">${(stats.critDamage*100).toFixed(0)}%</div></div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center"><div class="text-sm text-orange-400">防御</div><div class="text-3xl">${stats.def}</div></div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center"><div class="text-sm text-orange-400">减伤</div><div class="text-3xl">0%</div></div>
        </div>

        <div class="mt-6 bg-gray-800 rounded-3xl p-4 text-center border border-orange-400">
          <div class="text-orange-400 font-bold mb-2">当前所受状态</div>
          <div class="text-sm text-gray-300">暂无状态（后续扩展）</div>
        </div>

        <div class="grid grid-cols-2 gap-4 mt-6">
          <button onclick="window.executeSkill(${index}, true)" class="py-6 bg-emerald-600 hover:bg-emerald-700 rounded-3xl text-xl font-bold">普攻</button>
          <button onclick="window.executeSkill(${index}, false)" class="py-6 bg-amber-600 hover:bg-amber-700 rounded-3xl text-xl font-bold">
            ${skill.skill1Name}<br><span class="text-xs">消耗 ${skill.skill1Cost} 能量</span>
          </button>
        </div>
      </div>
    </div>

    <div class="text-center mt-8">
      <button onclick="window.hideBattleCharDetailModal()" class="px-12 py-4 bg-gray-700 hover:bg-gray-600 rounded-3xl text-xl">关闭</button>
    </div>
  `;

  document.getElementById("battleDetailContent").innerHTML = html;
  document.getElementById("battleCharDetailModal").classList.remove("hidden");
}

function hideBattleCharDetailModal() {
  document.getElementById("battleCharDetailModal").classList.add("hidden");
}

// ====================== 退出战斗重置 ======================
function hideBattleModal() {
  document.getElementById("battleModal").classList.add("hidden");
  currentBattleTeam = [null, null, null, null];
  battleEnergy = 4;
  hasActed = [false, false, false, false];
  playerHP = [0, 0, 0, 0];
  playerMaxHP = [0, 0, 0, 0];
  playerStatuses = [{}, {}, {}, {}];
  currentEnemyTargets = [
    { id: 1, name: "森林魔狼", hp: 1200, maxHp: 1200, atk: 65, defense: 40, status: {} },
    { id: 2, name: "影林刺客", hp: 850, maxHp: 850, atk: 90, defense: 25, status: {} }
  ];
  document.getElementById("battleLog").innerHTML = "";
}

// ====================== 选人 + 开始战斗 ======================
function openBattleTest() {
  currentBattleTeam = [null, null, null, null];
  battleEnergy = 4;
  hasActed = [false, false, false, false];
  window.showBattleSelectModal();
}

function showBattleSelectModal() {
  document.getElementById("battleSelectModal").classList.remove("hidden");
  renderBattleSelectInventory();
  renderBattleSlots();
}

function hideBattleSelectModal() {
  document.getElementById("battleSelectModal").classList.add("hidden");
}

function renderBattleSelectInventory() {
  const container = document.getElementById("battleSelectInventory");
  container.innerHTML = `<div class="grid grid-cols-3 sm:grid-cols-4 gap-4" id="battleInventoryGrid"></div>`;
  const grid = document.getElementById("battleInventoryGrid");
  const sorted = window.sortOwned(window.player.owned, true);
  sorted.forEach(item => {
    const data = window.getCharacterData(item.charId);
    const alreadyInTeam = currentBattleTeam.some(t => t && t.charId === item.charId);
    const div = document.createElement("div");
    div.className = `relative bg-gray-800 rounded-3xl p-3 cursor-pointer border-4 ${window.getRarityColor(data.rarity)} ${alreadyInTeam ? 'opacity-50' : 'hover:scale-105'}`;
    div.innerHTML = `
      <img src="${data.image}" class="character-img w-full rounded-2xl mb-3">
      <div class="text-center">
        <div class="rarity-${data.rarity.toLowerCase()} text-xs px-4 py-1 rounded-full text-white font-bold mb-1">${data.rarity}</div>
        <div class="text-base font-bold">${data.name}</div>
        <div class="text-xs text-gray-400">Lv.${item.level} ★${item.stars}</div>
      </div>
      ${alreadyInTeam ? `<div class="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded-xl">已上阵</div>` : ''}
    `;
    if (!alreadyInTeam) div.onclick = () => addToBattleTeam(item);
    grid.appendChild(div);
  });
}

function addToBattleTeam(item) {
  const emptyIndex = currentBattleTeam.findIndex(slot => slot === null);
  if (emptyIndex === -1) return alert("阵型已满！");
  currentBattleTeam[emptyIndex] = { ...item };
  const stats = window.calculateStats(item, window.getCharacterData(item.charId), null);
  playerHP[emptyIndex] = stats.hp;
  playerMaxHP[emptyIndex] = stats.hp;
  renderBattleSelectInventory();
  renderBattleSlots();
}

function renderBattleSlots() {
  for (let i = 0; i < 4; i++) {
    const slot = document.getElementById(`position-${i}`);
    if (currentBattleTeam[i]) {
      const data = window.getCharacterData(currentBattleTeam[i].charId);
      slot.innerHTML = `<img src="${data.image}" class="h-20 mx-auto rounded-2xl">`;
      slot.classList.add("border-amber-400");
    } else {
      slot.innerHTML = ["后排 a","前排 a","后排 b","前排 b"][i];
      slot.classList.remove("border-amber-400");
    }
  }
}

function selectBattlePosition(index) {
  if (currentBattleTeam[index]) {
    if (confirm("移除该角色？")) {
      currentBattleTeam[index] = null;
      renderBattleSelectInventory();
      renderBattleSlots();
    }
  }
}

function startBattle() {
  if (currentBattleTeam.every(slot => slot === null)) return alert("至少上阵一位角色！");
  hideBattleSelectModal();
  document.getElementById("battleModal").classList.remove("hidden");
  battleEnergy = 4;
  hasActed = [false, false, false, false];
  renderBattleUI();
}

function endBattleTurn() {
  enemyTurn();
}

// ====================== 暴露 ======================
window.executeSkill = executeSkill;
window.showBattleCharDetail = showBattleCharDetail;
window.hideBattleCharDetailModal = hideBattleCharDetailModal;
window.endBattleTurn = endBattleTurn;
window.openBattleTest = openBattleTest;
window.showBattleSelectModal = showBattleSelectModal;
window.hideBattleSelectModal = hideBattleSelectModal;
window.startBattle = startBattle;
window.hideBattleModal = hideBattleModal;
window.characterSkillMap = characterSkillMap;
