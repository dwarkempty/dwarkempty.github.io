// js/battle.js - 崩铁式回合制战斗系统（基础框架 - 全部战斗代码集中在此）
let battleState = {
  team: [],           // 已选角色 [{charId, level, stars, hp, maxHp, spd, ...}]
  enemies: [],        // 敌人 [{id, name, hp, maxHp, spd, isDummy: true}]
  actionQueue: [],    // 行动值队列 [{entity, av, isPlayer}]
  currentTurnEntity: null,
  skillPoints: 3,     // 初始技能点
  isBattleEnded: false
};

// ==================== 1. 动态添加探索页面的“战斗”按钮 ====================
function addBattleButton() {
  const grid = document.getElementById("explorationGrid");
  if (!grid) return;

  const btnHTML = `
    <button onclick="window.openBattleSelection()" 
            class="bg-red-600 hover:bg-red-700 p-8 rounded-3xl flex flex-col items-center gap-4 transition btn-hover">
      <i class="fas fa-swords text-6xl"></i>
      <div class="text-3xl font-bold">进入战斗</div>
      <div class="text-red-200">测试崩铁式回合制（仅阿特亚 & 希罗）</div>
    </button>`;
  
  // 插入到探索按钮最后
  grid.insertAdjacentHTML('beforeend', btnHTML);
}

// ==================== 2. 打开选人界面（仅阿特亚 id15 + 希罗 id16） ====================
window.openBattleSelection = function() {
  const modalHTML = `
    <div class="fixed inset-0 bg-black/90 flex items-center justify-center z-[100000] p-4">
      <div class="bg-zinc-900 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div class="px-8 py-6 border-b border-zinc-700 flex justify-between items-center">
          <h2 class="text-3xl font-bold">选择出战角色</h2>
          <button onclick="window.closeBattleModal()" class="text-4xl text-gray-400 hover:text-white">×</button>
        </div>
        
        <div class="p-8 flex-1 overflow-auto" id="teamSelectionGrid">
          <!-- 动态生成 -->
        </div>
        
        <div class="px-8 py-6 border-t border-zinc-700 flex justify-between items-center">
          <div class="text-sm text-gray-400">当前已选 <span id="selectedCount" class="font-bold text-white">0/2</span></div>
          <button onclick="window.startBattle()" 
                  id="startBattleBtn"
                  class="px-12 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-xl font-bold rounded-3xl opacity-50 cursor-not-allowed">
            开始战斗
          </button>
        </div>
      </div>
    </div>`;

  const old = document.getElementById("battleModal");
  if (old) old.remove();

  const div = document.createElement("div");
  div.id = "battleModal";
  div.innerHTML = modalHTML;
  document.body.appendChild(div);

  renderTeamSelection();
};

function renderTeamSelection() {
  const grid = document.getElementById("teamSelectionGrid");
  grid.innerHTML = "";

  const candidates = window.characterPool.filter(c => c.id === 15 || c.id === 16); // 只允许阿特亚和希罗

  candidates.forEach(char => {
    const owned = player.owned.find(o => o.charId === char.id);
    if (!owned) return;

    const div = document.createElement("div");
    div.className = `relative bg-zinc-800 rounded-3xl p-4 cursor-pointer border-4 hover:border-orange-400 transition-all ${battleState.team.some(t => t.charId === char.id) ? 'border-orange-400 ring-2 ring-orange-400' : 'border-transparent'}`;
    div.innerHTML = `
      <img src="${char.image}" class="character-img w-full rounded-2xl mb-3">
      <div class="text-center">
        <div class="rarity-ur text-xs inline-block px-4 py-1 rounded-full text-white font-bold mb-2">UR</div>
        <div class="text-xl font-bold">${char.name}</div>
        <div class="text-sm text-emerald-400">Lv.${owned.level} ★${owned.stars}</div>
      </div>
    `;
    div.onclick = () => toggleTeamSelection(char.id, owned);
    grid.appendChild(div);
  });
}

function toggleTeamSelection(charId, ownedChar) {
  const index = battleState.team.findIndex(t => t.charId === charId);
  if (index > -1) {
    battleState.team.splice(index, 1);
  } else if (battleState.team.length < 2) {
    battleState.team.push({
      ...ownedChar,
      maxHp: ownedChar.hp || 9999,
      hp: ownedChar.hp || 9999,
      spd: window.getCharacterData(charId).baseSPD || 120
    });
  }
  renderTeamSelection();
  document.getElementById("selectedCount").textContent = `${battleState.team.length}/2`;
  document.getElementById("startBattleBtn").classList.toggle("opacity-50", battleState.team.length < 1);
  document.getElementById("startBattleBtn").classList.toggle("cursor-not-allowed", battleState.team.length < 1);
}

window.closeBattleModal = function() {
  const modal = document.getElementById("battleModal");
  if (modal) modal.remove();
  battleState.team = [];
};

// ==================== 3. 开始战斗（3个木桩怪） ====================
window.startBattle = function() {
  window.closeBattleModal();

  // 创建3个简单木桩怪
  battleState.enemies = [
    { id: 1, name: "木桩怪A", maxHp: 12000, hp: 12000, spd: 95, isDummy: true },
    { id: 2, name: "木桩怪B", maxHp: 11000, hp: 11000, spd: 100, isDummy: true },
    { id: 3, name: "木桩怪C", maxHp: 13000, hp: 13000, spd: 90, isDummy: true }
  ];

  // 初始化行动值队列
  battleState.actionQueue = [];

  // 加入玩家角色
  battleState.team.forEach((member, i) => {
    battleState.actionQueue.push({
      entity: member,
      av: 10000,           // 初始行动值
      isPlayer: true,
      index: i
    });
  });

  // 加入敌人
  battleState.enemies.forEach((enemy, i) => {
    battleState.actionQueue.push({
      entity: enemy,
      av: 10000,
      isPlayer: false,
      index: i
    });
  });

  // 渲染战斗界面
  renderBattleUI();
};

// ==================== 4. 崩铁风格战斗主界面 ====================
function renderBattleUI() {
  const modalHTML = `
    <div class="fixed inset-0 bg-black/95 flex flex-col z-[100000]" id="battleMainUI">
      <!-- 顶部状态栏 -->
      <div class="bg-zinc-900 px-6 py-3 flex justify-between items-center border-b border-zinc-700">
        <div class="flex items-center gap-4">
          <button onclick="window.endBattle()" class="text-red-400 hover:text-red-300">退出战斗</button>
        </div>
        <div class="text-lg font-bold">行动值系统测试</div>
        <div>技能点 <span id="skillPointDisplay" class="text-emerald-400 font-bold">${battleState.skillPoints}</span></div>
      </div>

      <!-- 战斗区域 -->
      <div class="flex-1 flex p-6 gap-8 overflow-hidden">
        <!-- 左侧：己方角色 -->
        <div class="flex-1 flex flex-col gap-6" id="playerSide"></div>
        
        <!-- 右侧：敌人 -->
        <div class="flex-1 flex flex-col gap-6" id="enemySide"></div>
      </div>

      <!-- 底部行动栏 -->
      <div class="bg-zinc-900 border-t border-zinc-700 p-6" id="actionBar">
        <!-- 动态生成 -->
      </div>
    </div>`;

  const old = document.getElementById("battleMainUI");
  if (old) old.remove();

  const div = document.createElement("div");
  div.innerHTML = modalHTML;
  document.body.appendChild(div);

  updateBattleUI();
}

// 更新战斗UI（行动值系统核心）
function updateBattleUI() {
  // 排序行动队列（AV越小越先行动）
  battleState.actionQueue.sort((a, b) => a.av - b.av);

  // 渲染己方
  const playerSide = document.getElementById("playerSide");
  playerSide.innerHTML = battleState.team.map((char, i) => `
    <div class="bg-zinc-800 rounded-3xl p-4 flex gap-4 border-2 ${char.hp > 0 ? 'border-emerald-500' : 'border-red-500 opacity-50'}">
      <img src="${window.getCharacterData(char.charId).image}" class="w-20 h-20 object-contain rounded-2xl">
      <div class="flex-1">
        <div class="font-bold">${window.getCharacterData(char.charId).name}</div>
        <div class="text-sm text-gray-400">HP ${char.hp}/${char.maxHp}</div>
        <div class="w-full bg-zinc-700 h-2 rounded mt-2">
          <div class="h-2 bg-emerald-500 rounded" style="width:${(char.hp/char.maxHp)*100}%"></div>
        </div>
      </div>
    </div>`).join('');

  // 渲染敌人
  const enemySide = document.getElementById("enemySide");
  enemySide.innerHTML = battleState.enemies.map(enemy => `
    <div class="bg-zinc-800 rounded-3xl p-4 flex gap-4 border-2 ${enemy.hp > 0 ? 'border-red-500' : 'border-gray-500 opacity-50'}">
      <div class="flex-1 text-right">
        <div class="font-bold">${enemy.name}</div>
        <div class="text-sm text-gray-400">HP ${enemy.hp}/${enemy.maxHp}</div>
        <div class="w-full bg-zinc-700 h-2 rounded mt-2">
          <div class="h-2 bg-red-500 rounded" style="width:${(enemy.hp/enemy.maxHp)*100}%"></div>
        </div>
      </div>
    </div>`).join('');

  // 行动栏（当前可行动角色）
  const current = battleState.actionQueue[0];
  const actionBar = document.getElementById("actionBar");
  if (current && current.isPlayer && current.entity.hp > 0) {
    actionBar.innerHTML = `
      <div class="flex gap-4 justify-center">
        <button onclick="playerNormalAttack()" class="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-3xl text-xl font-bold">普通攻击</button>
        <button onclick="playerSkill()" class="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-3xl text-xl font-bold">技能</button>
      </div>`;
  } else {
    // 敌人行动
    setTimeout(enemyTurn, 800);
  }
}

// ==================== 5. 行动值系统核心逻辑 ====================
function advanceActionValue() {
  // 每个行动后，所有实体AV减少当前行动者的SPD值
  const current = battleState.actionQueue[0];
  const spent = current.entity.spd || 100;

  battleState.actionQueue.forEach(entry => {
    entry.av -= spent;
  });

  // 当前行动者重新加入队列（AV = 10000 / SPD）
  current.av = 10000 / (current.entity.spd || 100);

  // 重新排序
  battleState.actionQueue.sort((a, b) => a.av - b.av);
}

// 普通攻击示例
window.playerNormalAttack = function() {
  const current = battleState.actionQueue[0];
  const target = battleState.enemies.find(e => e.hp > 0);
  if (!target) return;

  const damage = Math.floor(current.entity.atk || 800) * 1.2;
  target.hp = Math.max(0, target.hp - damage);

  advanceActionValue();
  updateBattleUI();

  if (battleState.enemies.every(e => e.hp <= 0)) endBattle(true);
};

// 技能示例
window.playerSkill = function() {
  if (battleState.skillPoints <= 0) return alert("技能点不足！");
  battleState.skillPoints--;

  const current = battleState.actionQueue[0];
  const target = battleState.enemies.find(e => e.hp > 0);
  if (!target) return;

  const damage = Math.floor((current.entity.atk || 800) * 2.5);
  target.hp = Math.max(0, target.hp - damage);

  advanceActionValue();
  updateBattleUI();

  if (battleState.enemies.every(e => e.hp <= 0)) endBattle(true);
};

function enemyTurn() {
  const current = battleState.actionQueue[0];
  const target = battleState.team.find(c => c.hp > 0);
  if (!target) return;

  const damage = Math.floor(600 + Math.random() * 400);
  target.hp = Math.max(0, target.hp - damage);

  advanceActionValue();
  updateBattleUI();

  if (battleState.team.every(c => c.hp <= 0)) endBattle(false);
}

function endBattle(win = false) {
  battleState.isBattleEnded = true;
  alert(win ? "🎉 战斗胜利！" : "💀 战斗失败…");
  const ui = document.getElementById("battleMainUI");
  if (ui) ui.remove();
  battleState = { team: [], enemies: [], actionQueue: [], currentTurnEntity: null, skillPoints: 3, isBattleEnded: false };
}

// 暴露所有入口函数
window.addBattleButton = addBattleButton;
window.openBattleSelection = window.openBattleSelection;
window.startBattle = window.startBattle;
window.endBattle = endBattle;
window.playerNormalAttack = window.playerNormalAttack;
window.playerSkill = window.playerSkill;
