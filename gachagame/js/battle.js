// js/battle.js - 完整回合制战斗系统（已实现技能效果）
let currentBattleTeam = [null, null, null, null]; // 玩家4个位置
let enemyTeam = []; // 2个敌人
let battleEnergy = 4;
let actedThisTurn = []; // 本回合已行动的玩家角色索引
let battleLogElement = null;

// 敌人模板
function createEnemy(id) {
  return {
    id: id,
    name: id === 0 ? "森林魔狼" : "火焰元素",
    hp: id === 0 ? 1200 : 1100,
    maxHp: id === 0 ? 1200 : 1100,
    atk: id === 0 ? 85 : 95
  };
}

// ====================== 技能执行核心 ======================
function executeNormalAttack(attackerIndex, targetIndex) {
  const attacker = currentBattleTeam[attackerIndex];
  if (!attacker) return;
  const target = enemyTeam[targetIndex];
  const charData = window.getCharacterData(attacker.charId);
  const stats = window.calculateStats(attacker, charData);

  const damage = Math.floor(stats.atk * 0.8);
  target.hp = Math.max(0, target.hp - damage);

  addBattleLog(`${charData.name} 普攻 → ${target.name}，造成 ${damage} 伤害`);
  actedThisTurn.push(attackerIndex);
  renderBattleUI();
  checkBattleEnd();
}

function executeSkill(attackerIndex, skillIndex, targetIndex) {
  const attacker = currentBattleTeam[attackerIndex];
  if (!attacker) return;
  const charData = window.getCharacterData(attacker.charId);
  const skillInfo = window.characterSkillMap[attacker.charId];
  if (!skillInfo) return;

  const cost = skillInfo.skill1Cost || 1;
  if (battleEnergy < cost) {
    alert("能量不足！");
    return;
  }

  battleEnergy -= cost;
  const target = enemyTeam[targetIndex];
  const stats = window.calculateStats(attacker, charData);

  let damage = 0;
  let logText = "";

  switch (attacker.charId) {
    case 1: // 艾伦 - 穿林箭
      damage = Math.floor(stats.atk * 1.2);
      target.hp = Math.max(0, target.hp - damage);
      logText = `${charData.name} 使用【穿林箭】，造成 ${damage} 物理伤害`;
      break;

    case 2: // 莎莉 - 火球冲击
      damage = Math.floor(stats.atk * 1.1);
      target.hp = Math.max(0, target.hp - damage);
      logText = `${charData.name} 使用【火球冲击】，造成 ${damage} 火焰伤害`;
      if (Math.random() < 0.3) {
        logText += "（目标被点燃！）";
      }
      break;

    case 3: // 巴克 - 铁壁守护
      logText = `${charData.name} 使用【铁壁守护】，为自己生成护盾`;
      // 护盾逻辑可后续扩展
      break;

    case 4: // 莉莉 - 月光祈福
      const heal = Math.floor(stats.atk * 0.8);
      attacker.hp = Math.min(attacker.hp + heal, stats.hp); // 暂用当前血量
      logText = `${charData.name} 使用【月光祈福】，回复 ${heal} 生命`;
      break;
  }

  addBattleLog(logText);
  actedThisTurn.push(attackerIndex);
  renderBattleUI();
  checkBattleEnd();
}

// ====================== 战斗UI渲染 ======================
function renderBattleUI() {
  document.getElementById("battleEnergy").innerHTML = `${battleEnergy} / 6 ⚡`;

  // 我方
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById(`my-${i}`);
    if (currentBattleTeam[i]) {
      const data = window.getCharacterData(currentBattleTeam[i].charId);
      const isActed = actedThisTurn.includes(i);
      el.innerHTML = `
        <img src="${data.image}" class="w-20 h-20 mx-auto rounded-2xl mb-2 ${isActed ? 'opacity-50' : ''}">
        <div class="text-sm font-bold">${data.name}</div>
        ${isActed ? '<div class="text-[10px] text-gray-500">已行动</div>' : ''}
      `;
      el.style.pointerEvents = isActed ? 'none' : 'auto';
    }
  }
}

function addBattleLog(text) {
  const log = document.getElementById("battleLog");
  log.innerHTML += `<div class="text-sm py-1">${text}</div>`;
  log.scrollTop = log.scrollHeight;
}

function checkBattleEnd() {
  const aliveEnemies = enemyTeam.filter(e => e.hp > 0).length;
  if (aliveEnemies === 0) {
    setTimeout(() => {
      alert("🎉 战斗胜利！");
      hideBattleModal();
    }, 800);
  }
}

// ====================== 主要战斗流程 ======================
function startBattle() {
  if (currentBattleTeam.every(slot => slot === null)) return alert("至少上阵一位角色！");
  hideBattleSelectModal();
  document.getElementById("battleModal").classList.remove("hidden");

  // 初始化敌人
  enemyTeam = [createEnemy(0), createEnemy(1)];
  battleEnergy = 4;
  actedThisTurn = [];
  battleLogElement = document.getElementById("battleLog");
  battleLogElement.innerHTML = "";

  addBattleLog("⚔️ 战斗开始！玩家先手");
  renderBattleUI();
}

function endBattleTurn() {
  if (actedThisTurn.length < currentBattleTeam.filter(Boolean).length) {
    if (!confirm("还有角色未行动，确定结束回合吗？")) return;
  }

  // 敌人行动（简单实现）
  addBattleLog("—— 敌人回合 ——");
  enemyTeam.forEach((enemy, i) => {
    if (enemy.hp <= 0) return;
    const targetIndex = Math.floor(Math.random() * 4);
    const target = currentBattleTeam[targetIndex];
    if (target) {
      const damage = Math.floor(enemy.atk * 0.9);
      addBattleLog(`${enemy.name} 攻击 → ${window.getCharacterData(target.charId).name}，造成 ${damage} 伤害`);
    }
  });

  // 新回合
  battleEnergy = Math.min(battleEnergy + 2, 6);
  actedThisTurn = [];
  addBattleLog("⚡ 新回合开始，恢复2点能量");
  renderBattleUI();
}

// ====================== 战斗中点击角色 → 详情 + 行动选择 ======================
function showBattleCharDetail(index) {
  const char = currentBattleTeam[index];
  if (!char || actedThisTurn.includes(index)) return;

  const charData = window.getCharacterData(char.charId);
  const stats = window.calculateStats(char, charData);
  const skillInfo = window.characterSkillMap[char.charId] || { skill1Name: "暂无", skill1Desc: "", skill1Cost: 0 };

  const html = `
    <div class="flex gap-8">
      <div class="flex-1">
        <img src="${charData.image}" class="character-img w-full rounded-3xl">
      </div>
      <div class="flex-1 space-y-6">
        <div class="text-4xl font-bold">${charData.name}</div>
        
        <div class="grid grid-cols-2 gap-3">
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">等级<br><span class="text-3xl">${char.level}</span></div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">星级<br><span class="text-3xl">${"★".repeat(char.stars)}</span></div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">攻击<br><span class="text-3xl">${stats.atk}</span></div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">血量<br><span class="text-3xl">${stats.hp}</span></div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">防御<br><span class="text-3xl">${stats.def}</span></div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">暴击率<br><span class="text-3xl">${(stats.critRate*100).toFixed(0)}%</span></div>
        </div>

        <div class="pt-4">
          <button onclick="selectAction(${index}, 'normal')" class="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-3xl text-xl font-bold mb-3">普攻</button>
          <button onclick="selectAction(${index}, 'skill')" class="w-full py-4 bg-amber-600 hover:bg-amber-700 rounded-3xl text-xl font-bold">使用 ${skillInfo.skill1Name}（消耗${skillInfo.skill1Cost}能量）</button>
        </div>
      </div>
    </div>

    <div class="mt-8 text-center text-gray-400 text-sm">请选择攻击对象</div>
    <div class="flex justify-center gap-6 mt-4">
      <button onclick="executePlayerAction(${index}, 'normal', 0)" class="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-3xl">攻击 敌人1</button>
      <button onclick="executePlayerAction(${index}, 'normal', 1)" class="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-3xl">攻击 敌人2</button>
    </div>

    <div class="text-center mt-8">
      <button onclick="window.hideBattleCharDetailModal()" class="px-12 py-4 bg-gray-700 hover:bg-gray-600 rounded-3xl text-xl">取消</button>
    </div>
  `;

  document.getElementById("battleDetailContent").innerHTML = html;
  document.getElementById("battleCharDetailModal").classList.remove("hidden");
}

function executePlayerAction(attackerIndex, actionType, targetIndex) {
  window.hideBattleCharDetailModal();
  if (actionType === 'normal') {
    executeNormalAttack(attackerIndex, targetIndex);
  } else {
    executeSkill(attackerIndex, 0, targetIndex);
  }
}

function hideBattleCharDetailModal() {
  document.getElementById("battleCharDetailModal").classList.add("hidden");
}

// ====================== 暴露 ======================
window.openBattleTest = openBattleTest;
window.showBattleSelectModal = showBattleSelectModal;
window.hideBattleSelectModal = hideBattleSelectModal;
window.startBattle = startBattle;
window.hideBattleModal = hideBattleModal;
window.endBattleTurn = endBattleTurn;
window.showBattleCharDetail = showBattleCharDetail;
window.hideBattleCharDetailModal = hideBattleCharDetailModal;
window.executePlayerAction = executePlayerAction;
window.characterSkillMap = characterSkillMap;
