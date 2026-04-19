// js/battle.js - 崩铁式回合制战斗系统（已全面修复）
let battleState = {
  team: [],           // 已选角色（含完整计算数值）
  enemies: [],        
  actionQueue: [],    // 行动值队列
  skillPoints: 3,
  isBattleEnded: false
};

// ==================== 1. 探索页面战斗按钮 ====================
function addBattleButton() {
  const grid = document.getElementById("explorationGrid");
  if (!grid) return;
  const btnHTML = `
    <button onclick="window.openBattleSelection()" 
            class="bg-red-600 hover:bg-red-700 p-8 rounded-3xl flex flex-col items-center gap-4 transition btn-hover">
      <i class="fas fa-swords text-6xl"></i>
      <div class="text-3xl font-bold">进入战斗</div>
      <div class="text-red-200">测试崩铁式回合制</div>
    </button>`;
  grid.insertAdjacentHTML('beforeend', btnHTML);
}

// ==================== 2. 选人界面 ====================
window.openBattleSelection = function() {
  battleState.team = [];
  const modalHTML = `
    <div class="fixed inset-0 bg-black/90 flex items-center justify-center z-[100000] p-4">
      <div class="bg-zinc-900 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div class="px-8 py-6 border-b flex justify-between">
          <h2 class="text-3xl font-bold">选择出战角色（最多2人）</h2>
          <button onclick="window.closeBattleModal()" class="text-4xl text-gray-400 hover:text-white">×</button>
        </div>
        <div class="p-8 flex-1 overflow-auto grid grid-cols-2 gap-6" id="teamSelectionGrid"></div>
        <div class="px-8 py-6 border-t flex justify-between items-center">
          <div>已选 <span id="selectedCount" class="font-bold text-orange-400">0/2</span></div>
          <button onclick="window.startBattle()" id="startBattleBtn" class="px-12 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-xl font-bold rounded-3xl opacity-50 cursor-not-allowed">开始战斗</button>
        </div>
      </div>
    </div>`;

  const div = document.createElement("div");
  div.id = "battleModal";
  div.innerHTML = modalHTML;
  document.body.appendChild(div);

  renderTeamSelection();
};

function renderTeamSelection() {
  const grid = document.getElementById("teamSelectionGrid");
  grid.innerHTML = "";

  const candidates = window.characterPool.filter(c => [15, 16].includes(c.id)); // 阿特亚 + 希罗

  candidates.forEach(char => {
    const owned = player.owned.find(o => o.charId === char.id);
    if (!owned) return;

    const isSelected = battleState.team.some(t => t.charId === char.id);

    const div = document.createElement("div");
    div.className = `bg-zinc-800 rounded-3xl p-4 cursor-pointer border-4 transition-all ${isSelected ? 'border-orange-400 ring-2 ring-orange-400' : 'border-transparent hover:border-orange-300'}`;
    div.innerHTML = `
      <img src="${char.image}" class="character-img w-full rounded-2xl mb-3">
      <div class="text-center">
        <div class="text-xl font-bold">${char.name}</div>
        <div class="text-emerald-400">Lv.${owned.level} ★${owned.stars}</div>
      </div>
    `;
    div.onclick = () => toggleTeamSelection(char.id, owned, char);
    grid.appendChild(div);
  });
}

function toggleTeamSelection(charId, owned, charData) {
  const index = battleState.team.findIndex(t => t.charId === charId);
  if (index > -1) {
    battleState.team.splice(index, 1);
  } else if (battleState.team.length < 2) {
    const stats = window.calculateStats(owned, charData);   // 使用你最新的公式计算数值
    battleState.team.push({
      charId: charId,
      name: charData.name,
      level: owned.level,
      stars: owned.stars,
      hp: stats.hp,
      maxHp: stats.hp,
      atk: stats.atk,
      def: stats.def,
      spd: stats.spd,
      image: charData.image
    });
  }
  renderTeamSelection();
  document.getElementById("selectedCount").textContent = `${battleState.team.length}/2`;
  const btn = document.getElementById("startBattleBtn");
  btn.classList.toggle("opacity-50", battleState.team.length === 0);
  btn.classList.toggle("cursor-not-allowed", battleState.team.length === 0);
}

window.closeBattleModal = function() {
  const modal = document.getElementById("battleModal");
  if (modal) modal.remove();
};

// ==================== 3. 开始战斗 ====================
window.startBattle = function() {
  if (battleState.team.length === 0) return;

  window.closeBattleModal();

  battleState.enemies = [
    { id:1, name:"木桩怪A", maxHp:15000, hp:15000, spd:95 },
    { id:2, name:"木桩怪B", maxHp:14000, hp:14000, spd:100 },
    { id:3, name:"木桩怪C", maxHp:16000, hp:16000, spd:90 }
  ];

  battleState.actionQueue = [];

  // 加入玩家
  battleState.team.forEach((member, i) => {
    battleState.actionQueue.push({ entity: member, av: 10000, isPlayer: true, index: i });
  });
  // 加入敌人
  battleState.enemies.forEach((enemy, i) => {
    battleState.actionQueue.push({ entity: enemy, av: 10000, isPlayer: false, index: i });
  });

  renderBattleUI();
};

// ==================== 4. 战斗主界面 ====================
function renderBattleUI() {
  const html = `
    <div class="fixed inset-0 bg-black/95 flex flex-col z-[100000]" id="battleMainUI">
      <!-- 顶部 -->
      <div class="bg-zinc-900 px-6 py-3 flex justify-between border-b border-zinc-700">
        <button onclick="window.endBattle()" class="text-red-400 hover:text-red-300 font-bold">退出战斗</button>
        <div class="font-bold text-lg">行动值系统测试</div>
        <div>技能点 <span id="skillPointDisplay" class="text-emerald-400 font-bold">${battleState.skillPoints}</span></div>
      </div>

      <div class="flex-1 flex p-6 gap-8">
        <!-- 左侧己方 -->
        <div class="flex-1 space-y-6" id="playerSide"></div>
        
        <!-- 右侧敌人 -->
        <div class="flex-1 space-y-6" id="enemySide"></div>
      </div>

      <!-- 底部行动栏 -->
      <div class="bg-zinc-900 border-t border-zinc-700 p-6" id="actionBar"></div>
    </div>`;

  const div = document.createElement("div");
  div.innerHTML = html;
  document.body.appendChild(div);

  updateBattleUI();
}

function updateBattleUI() {
  // 排序：AV越小越先行动
  battleState.actionQueue.sort((a, b) => a.av - b.av);

  // 渲染己方角色
  const playerSide = document.getElementById("playerSide");
  playerSide.innerHTML = battleState.team.map((char, i) => `
    <div onclick="window.showCharDetail(${i})" class="bg-zinc-800 rounded-3xl p-5 cursor-pointer border-2 ${char.hp > 0 ? 'border-emerald-400' : 'border-red-500 opacity-60'}">
      <div class="flex gap-4">
        <img src="${char.image}" class="w-16 h-16 object-contain rounded-2xl">
        <div class="flex-1">
          <div class="font-bold text-xl">${char.name}</div>
          <div class="text-sm text-emerald-400">Lv.${char.level} ★${char.stars}</div>
          <div class="mt-3 text-sm">HP ${Math.floor(char.hp)} / ${char.maxHp}</div>
          <div class="h-2.5 bg-zinc-700 rounded-full mt-1">
            <div class="h-2.5 bg-emerald-500 rounded-full" style="width: ${(char.hp / char.maxHp) * 100}%"></div>
          </div>
        </div>
      </div>
    </div>`).join('');

  // 渲染敌人
  const enemySide = document.getElementById("enemySide");
  enemySide.innerHTML = battleState.enemies.map((enemy, i) => `
    <div onclick="window.showEnemyDetail(${i})" class="bg-zinc-800 rounded-3xl p-5 cursor-pointer border-2 ${enemy.hp > 0 ? 'border-red-500' : 'border-gray-500 opacity-60'}">
      <div class="flex justify-end gap-4">
        <div class="flex-1 text-right">
          <div class="font-bold text-xl">${enemy.name}</div>
          <div class="mt-3 text-sm">HP ${Math.floor(enemy.hp)} / ${enemy.maxHp}</div>
          <div class="h-2.5 bg-zinc-700 rounded-full mt-1">
            <div class="h-2.5 bg-red-500 rounded-full" style="width: ${(enemy.hp / enemy.maxHp) * 100}%"></div>
          </div>
        </div>
      </div>
    </div>`).join('');

  // 行动栏
  const current = battleState.actionQueue[0];
  const actionBar = document.getElementById("actionBar");

  if (current && current.isPlayer && current.entity.hp > 0) {
    actionBar.innerHTML = `
      <div class="flex justify-center gap-6">
        <button onclick="window.playerNormalAttack()" class="px-10 py-5 bg-blue-600 hover:bg-blue-700 rounded-3xl text-xl font-bold">普通攻击</button>
        <button onclick="window.playerSkill()" class="px-10 py-5 bg-purple-600 hover:bg-purple-700 rounded-3xl text-xl font-bold">技能</button>
      </div>`;
  } else if (current && !current.isPlayer) {
    setTimeout(enemyTurn, 600);
  }
}

// ==================== 行动值系统核心 ====================
function advanceActionValue() {
  const current = battleState.actionQueue[0];
  const spent = current.entity.spd || 100;

  battleState.actionQueue.forEach(entry => {
    entry.av -= spent;
  });

  current.av = 10000 / (current.entity.spd || 100);
  battleState.actionQueue.sort((a, b) => a.av - b.av);
}

// 普通攻击
window.playerNormalAttack = function() {
  const current = battleState.actionQueue[0];
  const target = battleState.enemies.find(e => e.hp > 0);
  if (!target) return;

  const damage = Math.floor(current.entity.atk * 1.2);
  target.hp = Math.max(0, target.hp - damage);

  advanceActionValue();
  updateBattleUI();

  if (battleState.enemies.every(e => e.hp <= 0)) window.endBattle(true);
};

// 技能
window.playerSkill = function() {
  if (battleState.skillPoints <= 0) return alert("技能点不足！");
  battleState.skillPoints--;

  const current = battleState.actionQueue[0];
  const target = battleState.enemies.find(e => e.hp > 0);
  if (!target) return;

  const damage = Math.floor(current.entity.atk * 2.8);
  target.hp = Math.max(0, target.hp - damage);

  advanceActionValue();
  updateBattleUI();

  if (battleState.enemies.every(e => e.hp <= 0)) window.endBattle(true);
};

function enemyTurn() {
  const current = battleState.actionQueue[0];
  const target = battleState.team.find(c => c.hp > 0);
  if (!target) return;

  const damage = Math.floor(700 + Math.random() * 400);
  target.hp = Math.max(0, target.hp - damage);

  advanceActionValue();
  updateBattleUI();

  if (battleState.team.every(c => c.hp <= 0)) window.endBattle(false);
}

// 角色详情面板
window.showCharDetail = function(index) {
  const char = battleState.team[index];
  alert(`${char.name}\n等级：${char.level}  星级：${char.stars}\n攻击：${char.atk}  防御：${char.def}  速度：${char.spd}`);
};

// 怪物详情面板
window.showEnemyDetail = function(index) {
  const enemy = battleState.enemies[index];
  alert(`${enemy.name}\nHP：${Math.floor(enemy.hp)} / ${enemy.maxHp}`);
};

function endBattle(win = false) {
  alert(win ? "🎉 战斗胜利！" : "💀 战斗失败…");
  const ui = document.getElementById("battleMainUI");
  if (ui) ui.remove();
  battleState = { team: [], enemies: [], actionQueue: [], skillPoints: 3, isBattleEnded: false };
}

// 暴露
window.addBattleButton = addBattleButton;
window.openBattleSelection = window.openBattleSelection;
window.startBattle = window.startBattle;
window.endBattle = endBattle;
window.playerNormalAttack = window.playerNormalAttack;
window.playerSkill = window.playerSkill;
window.showCharDetail = window.showCharDetail;
window.showEnemyDetail = window.showEnemyDetail;
