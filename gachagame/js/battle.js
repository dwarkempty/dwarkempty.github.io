// js/battle.js - 完整最终版（玩家回合制 + 技能选择 + 目标选择 + 详情界面）
let currentBattleTeam = [null, null, null, null]; // 0=后排a, 1=前排a, 2=后排b, 3=前排b
let battleEnergy = 4;
const MAX_ENERGY = 6;
const ENERGY_PER_TURN = 2;

let hasActed = [false, false, false, false]; // 本回合是否已行动

let currentEnemyTargets = [
  { id: 1, name: "森林魔狼", hp: 1200, maxHp: 1200, atk: 65, defense: 40 },
  { id: 2, name: "影林刺客", hp: 850, maxHp: 850, atk: 90, defense: 25 }
];

let playerStatuses = [{}, {}, {}, {}]; // 每个位置的状态（后续扩展）

// ====================== R级角色技能数据 ======================
const characterSkillMap = {
  1: { // 森林游侠·艾伦
    description: "出身幽暗森林的年轻游侠，精通弓箭与自然追踪。性格坚韧乐观，热爱冒险与保护生态。虽经验尚浅，但精准的箭术能为团队提供可靠的远程支援，是新手冒险者最常见的伙伴。",
    normalAttack: "普通攻击：对敌方单体造成80%总攻击的物理伤害",
    skill1Name: "【穿林箭】",
    skill1Desc: "消耗1点能量，对敌方单体造成120%总攻击的物理伤害，并降低目标10%防御，持续2回合。若目标处于后排，该技能额外无视5%的防御",
    skill1Cost: 1
  },
  2: { // 火焰学徒·莎莉
    description: "魔法学徒莎莉，天生亲和火焰元素。活泼热情但控制力不足，常在战斗中制造小爆炸。学习火焰魔法，希望成为强大法师，是队伍中活力满满的火力输出手。",
    normalAttack: "普通攻击：对敌方单体造成75%总攻击的火焰魔法伤害",
    skill1Name: "【火球冲击】",
    skill1Desc: "消耗1点能量，对敌方单体造成110%总攻击的火焰魔法伤害，有30%概率点燃目标（每回合造成相当于自身5%总攻击的额外持续伤害，持续2回合）",
    skill1Cost: 1
  },
  3: { // 铁壁卫士·巴克
    description: "身躯如铁塔般的佣兵卫士，拥有惊人的耐力和防御力。忠诚可靠，总是冲在最前线保护同伴。话语不多，但行动胜于千言，是新手队伍最值得信赖的盾牌。",
    normalAttack: "普通攻击：对敌方单体造成70%总攻击的物理伤害",
    skill1Name: "【铁壁守护】",
    skill1Desc: "消耗1点能量，为自身或一名前排队友生成护盾（吸收相当于自身1.5倍总防御的伤害），持续2回合，并提升自身20%减伤1回合",
    skill1Cost: 1
  },
  4: { // 月影精灵·莉莉
    description: "月影森林的精灵少女，沐浴在月光下成长。温柔恬静，擅长月影魔法，能治愈伤口并增强盟友。虽战斗力不强，但她是团队不可或缺的治愈之光，深受大家喜爱。",
    normalAttack: "普通攻击：对敌方单体造成65%总攻击的魔法伤害",
    skill1Name: "【月光祈福】",
    skill1Desc: "消耗1点能量，为己方单体回复相当于自身80%总攻击的生命值，并提升目标10%攻击力，持续2回合。若目标为前排角色，额外为其附加5%暴击率加成",
    skill1Cost: 1
  }
};

// ====================== 伤害计算公式 ======================
function calculateDamage(attackerStats, defender, isCritPossible = true) {
  let damage = attackerStats.atk;
  const critChance = attackerStats.critRate || 0.05;
  const isCrit = isCritPossible && Math.random() < critChance;
  if (isCrit) damage = Math.floor(damage * (1 + (attackerStats.critDamage || 0.5)));
  const defenseReduce = defender.defense || 30;
  damage = Math.floor(damage * (1 - defenseReduce / (defenseReduce + 100)));
  return Math.max(1, damage);
}

// ====================== 执行技能 ======================
function executeSkill(position, isNormalAttack) {
  const char = currentBattleTeam[position];
  if (!char || hasActed[position]) return alert("该角色本回合已行动！");

  const skillInfo = characterSkillMap[char.charId];
  const charData = window.getCharacterData(char.charId);
  const stats = window.calculateStats(char, charData, null);

  let damage = 0;
  let logText = "";

  if (isNormalAttack) {
    damage = calculateDamage(stats, currentEnemyTargets[0]);
    logText = `${charData.name} 发动【普攻】！造成 ${damage} 伤害`;
  } else {
    if (!skillInfo || battleEnergy < skillInfo.skill1Cost) {
      return alert("能量不足！");
    }
    battleEnergy -= skillInfo.skill1Cost;
    damage = Math.floor(stats.atk * 1.2);
    logText = `${charData.name} 释放 ${skillInfo.skill1Name}！造成 ${damage} 伤害`;
  }

  const targetIndex = Math.floor(Math.random() * currentEnemyTargets.length);
  currentEnemyTargets[targetIndex].hp = Math.max(0, currentEnemyTargets[targetIndex].hp - damage);

  document.getElementById("battleLog").innerHTML += `<div class="text-emerald-400">${logText}</div>`;
  document.getElementById("battleLog").scrollTop = 999999;

  hasActed[position] = true;
  renderBattleUI();

  if (hasActed.every(v => v)) {
    setTimeout(enemyTurn, 800);
  }
}

// ====================== 敌方回合 ======================
function enemyTurn() {
  document.getElementById("battleLog").innerHTML += `<div class="text-red-400 font-bold">【敌方回合开始】</div>`;

  for (let enemy of currentEnemyTargets) {
    if (enemy.hp <= 0) continue;
    const targetIndex = Math.floor(Math.random() * 4);
    const targetChar = currentBattleTeam[targetIndex];
    if (!targetChar) continue;

    const damage = Math.floor(enemy.atk * 0.9);
    // 简单扣血（后续可加护盾）
    // 这里暂时不做玩家血量扣减（留给下一阶段完整生命值系统）
    document.getElementById("battleLog").innerHTML += `<div class="text-red-400">${enemy.name} 攻击 ${targetChar.name}，造成 ${damage} 伤害</div>`;
  }

  // 检查胜负
  const allEnemiesDead = currentEnemyTargets.every(e => e.hp <= 0);
  if (allEnemiesDead) {
    setTimeout(() => alert("🎉 战斗胜利！"), 300);
    return;
  }

  // 重置玩家行动
  hasActed = [false, false, false, false];
  battleEnergy = Math.min(battleEnergy + ENERGY_PER_TURN, MAX_ENERGY);
  document.getElementById("battleLog").innerHTML += `<div class="text-cyan-400">⚡ 玩家回合开始！能量恢复至 ${battleEnergy}/${MAX_ENERGY}</div>`;
  renderBattleUI();
}

// ====================== 渲染主战斗界面 ======================
function renderBattleUI() {
  document.getElementById("battleEnergy").innerHTML = `${battleEnergy} / ${MAX_ENERGY} <span class="text-xs text-gray-400">⚡</span>`;

  for (let i = 0; i < 4; i++) {
    const el = document.getElementById(`my-${i}`);
    if (currentBattleTeam[i]) {
      const data = window.getCharacterData(currentBattleTeam[i].charId);
      const acted = hasActed[i] ? 'opacity-50 pointer-events-none' : '';
      el.innerHTML = `
        <img src="${data.image}" class="w-20 h-20 mx-auto rounded-2xl mb-2 ${acted}">
        <div class="text-sm font-bold ${acted}">${data.name}</div>
      `;
    } else {
      el.innerHTML = `<div class="text-gray-500 text-sm">空位</div>`;
    }
  }
}

// ====================== 战斗中点击角色详情界面 ======================
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

        <div class="grid grid-cols-2 gap-4 mt-8">
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

// ====================== 回合结束 ======================
function endBattleTurn() {
  battleEnergy = Math.min(battleEnergy + ENERGY_PER_TURN, MAX_ENERGY);
  document.getElementById("battleLog").innerHTML += `<div class="text-cyan-400">⚡ 恢复 ${ENERGY_PER_TURN} 点能量 → 当前 ${battleEnergy}/${MAX_ENERGY}</div>`;
  hasActed = [false, false, false, false];
  renderBattleUI();
  document.getElementById("battleLog").innerHTML += `<div class="text-red-400">敌方行动中...（暂为占位）</div>`;
}

// ====================== 选人界面相关函数 ======================
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

function hideBattleModal() {
  document.getElementById("battleModal").classList.add("hidden");
  currentBattleTeam = [null, null, null, null];
}

// ====================== 暴露 ======================
window.executeSkill = executeSkill;
window.showBattleCharDetail = showBattleCharDetail;
window.hideBattleCharDetailModal = hideBattleCharDetailModal;
window.endBattleTurn = enemyTurn;
window.openBattleTest = openBattleTest;
window.showBattleSelectModal = showBattleSelectModal;
window.hideBattleSelectModal = hideBattleSelectModal;
window.startBattle = startBattle;
window.hideBattleModal = hideBattleModal;
window.characterSkillMap = characterSkillMap;
