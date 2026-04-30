// js/battle.js - 完整战斗系统（严格遵循战斗模块设计：回合制、SP/UE、速度行动、属性克制、伤害公式等）
let battleState = {
  team: [],           // [{..., buffs:[], debuffs:[] }]
  enemies: [],        // [{name, currentHP, maxHP, atk, def, spd, attribute, buffs:[], debuffs:[] }, ...] 支持多个敌人
  turnOrder: [],      // array of 'team-0', 'team-1', 'enemy-0', 'enemy-1'...
  currentTurnIndex: 0,
  bigTurn: 1,
  log: [],
  isPlayerTurn: false,
  selectedTeam: []    // for pre-battle selection, char indices in player.owned
};

// 增益减益详细效果描述 (可扩展)
const buffDescMap = {
  "终结余辉": "终结技释放后获得，攻击力临时提升50%，持续2回合，无法被驱散。",
  "裂隙侵蚀": "受到BOSS攻击时附加，受到所有伤害增加15%，持续2回合。",
  "神子永辉": "阿特亚终结技后，攻击力增加30%（可与其他攻击力加成叠加），所有伤害无视防御，【绚明印记】附加层数+1，持续1回合。",
  "元素凝视": "防御降低15%，持续2回合，不可叠加。",
  "源环加护": "全队获得随机正面效果，持续至移除。",
  "绚明印记": "可叠加元素DoT，每层每回合造成攻击力×50%伤害，最高8层。超出时引爆，单层80%伤害。被动触发时立即结算。",
  "绚明崩解": "后续2回合，每回合自动触发等同引爆前层数的无视防御伤害，无法被驱散，不触发阿特亚被动。"
  // 未来新buff/debuff在此添加描述
};

function getBuffDesc(name) {
  return buffDescMap[name] || "该效果暂无详细描述，将在后续更新中补充。";
}

// 辅助：添加或刷新同名增益/减益（同名覆盖，刷新duration）
function addOrRefreshEffect(entity, name, duration, isDebuff = true) {
  const list = isDebuff ? (entity.debuffs = entity.debuffs || []) : (entity.buffs = entity.buffs || []);
  const existing = list.find(e => e.name === name);
  if (existing) {
    existing.duration = duration;
    if (name === "绚明印记" && existing.stacks) existing.stacks = Math.min(8, (existing.stacks || 1) + 1);
  } else {
    const effect = {name, duration};
    if (name === "绚明印记") effect.stacks = 1;
    list.push(effect);
  }
}

function initBattleUI() {
  const panel = document.getElementById("panel5");
  if (!panel) return;

  panel.innerHTML = `
    <div class="max-w-6xl mx-auto px-4">
      <div class="text-center mb-10">
        <div class="inline-flex items-center gap-4 bg-zinc-900 px-8 py-3 rounded-3xl border border-red-500">
          <span class="text-6xl">⚔️</span>
          <div>
            <div class="text-5xl font-bold text-red-500 tracking-wider">战斗测试区</div>
            <div class="text-sm text-gray-400 -mt-1">基于完整战斗模块 · 回合制 · SP/UE系统</div>
          </div>
        </div>
      </div>

      <!-- 队伍选择 -->
      <div id="preBattle" class="mb-10">
        <div class="flex items-center justify-between mb-5">
          <div class="text-2xl font-bold flex items-center gap-3">
            🧙 选择出战队伍 <span class="text-base text-gray-400 font-normal">(最多 3 人)</span>
          </div>
          <div class="text-emerald-400 text-sm">已选 <span id="selectedCount" class="font-bold text-2xl">0</span>/3</div>
        </div>
        
        <div id="teamSelectGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 max-h-[420px] overflow-auto pr-2"></div>
        
        <div class="flex justify-center gap-4 mt-8">
          <button onclick="startBattle()" 
                  class="px-16 py-5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-2xl font-bold rounded-3xl flex items-center gap-3 shadow-xl btn-hover">
            <i class="fas fa-play"></i> 开始战斗
          </button>
          <button onclick="resetTeamSelection()" 
                  class="px-10 py-5 bg-zinc-800 hover:bg-zinc-700 text-xl rounded-3xl flex items-center gap-2">
            <i class="fas fa-undo"></i> 重置选择
          </button>
        </div>
      </div>

      <!-- 战斗主界面 -->
      <div id="battleArena" class="hidden">
        <div class="flex justify-between items-center mb-4">
          <div class="text-2xl font-bold text-emerald-400">第 <span id="bigTurnDisplay">1</span> 大回合</div>
          <div onclick="endBattle(true)" class="cursor-pointer text-red-400 hover:text-red-500 flex items-center gap-2 text-sm">
            <i class="fas fa-times"></i> 结束战斗
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- 我方队伍 -->
          <div class="lg:col-span-7">
            <div class="text-xl font-bold mb-4 text-emerald-400 flex items-center gap-2">
              <span>我方</span> <span class="text-xs bg-emerald-900 px-3 py-0.5 rounded-full">TEAM</span>
            </div>
            <div id="teamDisplay" class="grid grid-cols-1 sm:grid-cols-3 gap-5"></div>
          </div>

          <!-- 敌方 -->
          <div class="lg:col-span-5">
            <div class="text-xl font-bold mb-4 text-red-400 flex items-center gap-2">
              <span>敌方</span> <span class="text-xs bg-red-900 px-3 py-0.5 rounded-full">BOSS</span>
            </div>
            <div id="enemyDisplay" class="bg-zinc-900 border-4 border-red-600 rounded-3xl p-6 shadow-2xl"></div>
          </div>
        </div>

        <!-- 行动顺序显示 -->
        <div id="actionOrderDisplay" class="mb-4 p-4 bg-zinc-800 rounded-3xl text-sm border border-amber-500">
          <div class="font-bold text-amber-400 mb-2 flex items-center gap-2">
            📋 本大回合行动顺序 <span class="text-xs text-gray-400">(高亮当前行动者)</span>
          </div>
          <div id="actionOrderList" class="flex flex-wrap gap-2 text-xs"></div>
        </div>

        <!-- 战斗日志 -->
        <div class="mt-6">
          <div class="flex justify-between items-center mb-2 px-1">
            <div class="text-lg font-bold text-amber-400">📜 战斗日志</div>
            <button onclick="clearBattleLog()" class="text-xs px-3 py-1 bg-zinc-800 rounded-xl hover:bg-zinc-700">清空</button>
          </div>
          <div id="battleLog" class="bg-black/70 border border-zinc-700 rounded-3xl p-5 text-sm font-mono h-[220px] overflow-auto leading-relaxed text-gray-300"></div>
        </div>

        <!-- 操作栏 -->
        <div id="actionBar" class="mt-6 bg-zinc-900 border-4 border-orange-500 rounded-3xl p-6 hidden">
          <div class="text-center mb-5">
            <div id="currentActorName" class="text-2xl font-bold text-orange-400"></div>
            <div class="text-xs text-gray-400 mt-1">当前行动角色</div>
          </div>
          
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button onclick="performAction('normal')" 
                    class="py-6 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all rounded-3xl text-xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg">
              <div>普攻</div>
              <div class="text-xs opacity-75">0 SP • +20 UE</div>
            </button>
            <button onclick="performAction('skill1')" 
                    class="py-6 bg-purple-600 hover:bg-purple-700 active:scale-95 transition-all rounded-3xl text-xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg">
              <div>战技 1</div>
              <div class="text-xs opacity-75">1 SP • +30 UE</div>
            </button>
            <button onclick="performAction('skill2')" 
                    class="py-6 bg-purple-600 hover:bg-purple-700 active:scale-95 transition-all rounded-3xl text-xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg">
              <div>战技 2</div>
              <div class="text-xs opacity-75">1 SP • +30 UE</div>
            </button>
            <button onclick="performAction('ultimate')" 
                    class="py-6 bg-gradient-to-br from-pink-600 via-purple-600 to-cyan-500 hover:brightness-110 active:scale-95 transition-all rounded-3xl text-xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg">
              <div>终结技</div>
              <div class="text-xs opacity-75">100 UE • 每大回合1次</div>
            </button>
          </div>
          
          <div class="text-center mt-4 text-[10px] text-gray-500">终结技不会结束当前小回合，但每大回合仅限释放一次</div>
        </div>
      </div>
    </div>
  `;

  renderTeamSelectGrid();
  battleState.selectedTeam = [];
}

// 渲染可选队伍
function renderTeamSelectGrid() {
  const container = document.getElementById("teamSelectGrid");
  if (!container) return;
  container.innerHTML = "";

  if (!player.owned || player.owned.length === 0) {
    container.innerHTML = `<p class="col-span-full text-center text-gray-500 py-12">暂无角色，快去抽卡吧！</p>`;
    return;
  }

  player.owned.forEach((item, idx) => {
    const char = window.getCharacterData(item.charId);
    if (!char) return;

    const stats = window.calculateStats(item, char);
    const isSelected = battleState.selectedTeam.includes(idx);

    const div = document.createElement("div");
    div.className = `relative bg-zinc-900 rounded-3xl p-3 cursor-pointer border-4 transition-all ${isSelected ? 'border-emerald-500 scale-[1.02] shadow-xl' : 'border-zinc-700 hover:border-zinc-500'}`;
    div.innerHTML = `
      <img src="${char.image}" class="w-full aspect-square object-cover rounded-2xl mb-3 ${isSelected ? 'ring-4 ring-emerald-500' : ''}">
      <div class="text-center">
        <div class="rarity-${char.rarity.toLowerCase()} text-[10px] inline-block px-3 py-0.5 rounded-full text-white font-bold mb-1">${char.rarity}</div>
        <div class="font-bold text-sm truncate">${char.name}</div>
        <div class="text-xs text-gray-400">${char.category} · Lv.${item.level}</div>
        
        <div class="flex justify-center gap-2 text-xs mt-2 text-emerald-400">
          <div>❤️${stats.hp}</div>
          <div>⚔️${stats.atk}</div>
        </div>
        <div class="text-[10px] text-purple-400 mt-1">${stats.attribute} · 速${stats.spd}</div>
      </div>
    `;

    div.onclick = () => toggleTeamMember(idx, div);
    container.appendChild(div);
  });
}

function toggleTeamMember(idx, element) {
  const i = battleState.selectedTeam.indexOf(idx);
  if (i > -1) {
    battleState.selectedTeam.splice(i, 1);
    element.classList.remove("border-emerald-500", "scale-[1.02]", "shadow-xl");
    element.classList.add("border-zinc-700");
    element.querySelector("img").classList.remove("ring-4", "ring-emerald-500");
  } else {
    if (battleState.selectedTeam.length >= 3) {
      alert("最多只能选择 3 名角色出战！");
      return;
    }
    // 检查同名角色只能上场一个
    const newChar = player.owned[idx];
    const newName = window.getCharacterData(newChar.charId)?.name || "";
    const hasDuplicate = battleState.selectedTeam.some(selIdx => {
      const selChar = player.owned[selIdx];
      return window.getCharacterData(selChar.charId)?.name === newName;
    });
    if (hasDuplicate) {
      alert("同名角色只能上场一个！");
      return;
    }
    battleState.selectedTeam.push(idx);
    element.classList.add("border-emerald-500", "scale-[1.02]", "shadow-xl");
    element.classList.remove("border-zinc-700");
    element.querySelector("img").classList.add("ring-4", "ring-emerald-500");
  }
  document.getElementById("selectedCount").textContent = battleState.selectedTeam.length;
}

function resetTeamSelection() {
  battleState.selectedTeam = [];
  document.getElementById("selectedCount").textContent = "0";
  renderTeamSelectGrid();
}

// 开始战斗
function startBattle() {
  if (battleState.selectedTeam.length === 0) {
    alert("请至少选择 1 名角色！");
    return;
  }

  // 构建队伍数据
  battleState.team = battleState.selectedTeam.map((idx, i) => {
    const item = player.owned[idx];
    const char = window.getCharacterData(item.charId);
    const stats = window.calculateStats(item, char);
    return {
      id: item.id,
      charId: item.charId,
      name: char.name,
      image: char.image,
      category: char.category,
      stats: stats,
      currentHP: stats.hp,
      maxHP: stats.hp,
      SP: 3,
      UE: 40 + Math.floor(Math.random() * 30), // 初始 UE
      ultimateUsed: false,
      index: i
    };
  });

  // 敌方：3个裂隙属性敌人，高血低攻
  battleState.enemies = [
    {
      id: 0,
      name: "虚空裂隙兽·湮",
      image: "https://picsum.photos/id/1015/300/300",
      maxHP: 1000000,
      currentHP: 1000000,
      atk: 80,
      def: 200,
      spd: 110,
      attribute: "裂隙",
      penFixed: 50,
      penRate: 0.05,
      healBonus: 0,
      recvHealBonus: 0,
      shieldStr: 1.0,
      dmgBonus: 0,
      dmgReduction: 0,
      buffs: [],
      debuffs: []
    },
    {
      id: 1,
      name: "虚空裂隙兽·极",
      image: "https://picsum.photos/id/102/300/300",
      maxHP: 1000000,
      currentHP: 1000000,
      atk: 75,
      def: 210,
      spd: 112,
      attribute: "裂隙",
      penFixed: 40,
      penRate: 0.06,
      healBonus: 0,
      recvHealBonus: 0,
      shieldStr: 1.0,
      dmgBonus: 0,
      dmgReduction: 0,
      buffs: [],
      debuffs: []
    },
    {
      id: 2,
      name: "虚空裂隙兽·辉",
      image: "https://picsum.photos/id/1033/300/300",
      maxHP: 1000000,
      currentHP: 1000000,
      atk: 85,
      def: 190,
      spd: 109,
      attribute: "裂隙",
      penFixed: 60,
      penRate: 0.04,
      healBonus: 0,
      recvHealBonus: 0,
      shieldStr: 1.0,
      dmgBonus: 0,
      dmgReduction: 0,
      buffs: [],
      debuffs: []
    }
  ];

  battleState.team.forEach(m => { m.buffs = []; m.debuffs = []; });
  battleState.bigTurn = 1;
  battleState.log = [];
  battleState.currentTurnIndex = 0;
  battleState.ultimateUsedThisBigTurn = false; // 全局标记

  // 生成行动顺序（速度降序，同速玩家优先，近卫>辅助>强袭）
  battleState.turnOrder = generateTurnOrder();

  // 切换UI
  document.getElementById("preBattle").classList.add("hidden");
  document.getElementById("battleArena").classList.remove("hidden");

  addLog("⚔️ 战斗开始！敌方：虚空裂隙兽");
  addLog(`我方 ${battleState.team.length} 人出战`);

  renderBattleUI();
  // 自动开始第一回合
  setTimeout(() => nextTurn(), 600);
}

// 生成行动顺序
function generateTurnOrder() {
  let order = [];
  battleState.team.forEach((member, i) => {
    order.push({ type: 'team', index: i, spd: member.stats.spd, category: member.category });
  });
  battleState.enemies.forEach((en, i) => {
    if (en.currentHP > 0) {
      order.push({ type: 'enemy', index: i, spd: en.spd, category: '敌方' });
    }
  });

  order.sort((a, b) => {
    if (b.spd !== a.spd) return b.spd - a.spd;
    // 同速：玩家优先
    if (a.type === 'team' && b.type === 'enemy') return -1;
    if (a.type === 'enemy' && b.type === 'team') return 1;
    // 玩家内部：近卫 > 辅助 > 强袭
    const prio = { "近卫": 3, "辅助": 2, "强袭": 1 };
    return (prio[b.category] || 0) - (prio[a.category] || 0);
  });

  return order.map(o => o.type === 'team' ? `team-${o.index}` : `enemy-${o.index}`);
}

function renderBattleUI() {
  // 队伍显示
  const teamContainer = document.getElementById("teamDisplay");
  teamContainer.innerHTML = "";

  let currentKey = null;
  if (battleState.turnOrder && battleState.currentTurnIndex < battleState.turnOrder.length) {
    currentKey = battleState.turnOrder[battleState.currentTurnIndex];
  }

  battleState.team.forEach((member, i) => {
    const hpPercent = Math.max(0, Math.floor(member.currentHP / member.maxHP * 100));
    const spPercent = Math.floor(member.SP / 5 * 100);
    const uePercent = Math.floor(member.UE / 100 * 100);
    const isCurrent = currentKey === `team-${i}`;

    const div = document.createElement("div");
    div.className = `bg-zinc-900 rounded-3xl p-4 border-2 cursor-pointer transition-all ${member.currentHP > 0 ? 'border-emerald-600' : 'border-red-900 opacity-60'} ${isCurrent ? 'ring-4 ring-yellow-400 shadow-[0_0_20px_#facc15] animate-pulse' : 'hover:scale-[1.02]'}`;
    div.onclick = () => showBattleDetail(true, i);
    div.innerHTML = `
      <div class="flex gap-4">
        <img src="${member.image}" class="w-20 h-20 rounded-2xl object-cover border border-zinc-700 flex-shrink-0">
        <div class="flex-1 min-w-0">
          <div class="font-bold text-lg truncate">${member.name}</div>
          <div class="text-xs text-gray-400">${member.category} · ${member.stats.attribute}</div>
          
          <div class="mt-3 space-y-2">
            <!-- HP -->
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span>HP</span>
                <span class="font-mono">${member.currentHP}/${member.maxHP}</span>
              </div>
              <div class="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div class="h-2 bg-emerald-500 transition-all" style="width: ${hpPercent}%"></div>
              </div>
            </div>
            
            <!-- SP -->
            <div class="flex items-center gap-2 text-xs">
              <span class="w-6">SP</span>
              <div class="flex-1 flex gap-1">
                ${Array.from({length:5}).map((_,s) => 
                  `<div class="flex-1 h-1.5 rounded ${s < member.SP ? 'bg-cyan-400' : 'bg-zinc-700'}"></div>`
                ).join('')}
              </div>
              <span class="font-mono w-6 text-right">${member.SP}/5</span>
            </div>
            
            <!-- UE -->
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span>UE</span>
                <span class="font-mono">${member.UE}/100</span>
              </div>
              <div class="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div class="h-2 bg-gradient-to-r from-pink-500 to-purple-500 transition-all" style="width: ${uePercent}%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    teamContainer.appendChild(div);
  });

  // 敌方显示 (支持3个裂隙敌人)
  const enemyContainer = document.getElementById("enemyDisplay");
  enemyContainer.innerHTML = `<div class="space-y-4">` + battleState.enemies.map((enemy, i) => {
    const eHpPercent = Math.max(0, Math.floor(enemy.currentHP / enemy.maxHP * 100));
    const isEnemyCurrent = currentKey === `enemy-${i}`;
    return `
      <div class="text-center cursor-pointer transition-all p-4 border-2 border-red-600 rounded-3xl ${isEnemyCurrent ? 'ring-4 ring-yellow-400 shadow-[0_0_20px_#facc15] animate-pulse' : 'hover:scale-[1.02]'}" onclick="showBattleDetail(false, ${i})">
        <div class="flex items-center gap-4">
          <img src="${enemy.image}" class="w-20 h-20 rounded-3xl border-4 border-red-500 object-cover flex-shrink-0">
          <div class="flex-1 text-left">
            <div class="font-bold text-xl text-red-400">${enemy.name}</div>
            <div class="text-xs text-gray-400">${enemy.attribute} · 速 ${enemy.spd}</div>
            <div class="mt-2">
              <div class="flex justify-between text-xs mb-1">
                <span>HP</span>
                <span class="font-mono">${enemy.currentHP} / ${enemy.maxHP}</span>
              </div>
              <div class="h-3 bg-zinc-800 rounded-full overflow-hidden border border-red-900">
                <div class="h-3 bg-red-600 transition-all" style="width: ${eHpPercent}%"></div>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-1 text-[10px] mt-2">
              <div class="bg-zinc-800 rounded p-1">ATK ${enemy.atk}</div>
              <div class="bg-zinc-800 rounded p-1">DEF ${enemy.def}</div>
              <div class="bg-zinc-800 rounded p-1">穿 ${enemy.penFixed}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('') + `</div>`;

  document.getElementById("bigTurnDisplay").textContent = battleState.bigTurn;

  // 更新行动栏
  updateActionBar();
  updateActionOrder();
}

function updateActionBar() {
  const bar = document.getElementById("actionBar");
  if (!bar) return;

  const current = getCurrentActor();
  if (!current || current.type === 'enemy') {
    bar.classList.add("hidden");
    return;
  }

  bar.classList.remove("hidden");
  document.getElementById("currentActorName").innerHTML = `
    <span class="text-emerald-400">${current.member.name}</span> 
    <span class="text-xs text-gray-400">(SP:${current.member.SP} UE:${current.member.UE})</span>
  `;

  // 禁用终结技如果已用或UE不足
  const ultBtn = bar.querySelector('button[onclick*="ultimate"]');
  if (ultBtn) {
    const canUlt = current.member.UE >= 100 && !current.member.ultimateUsed;
    ultBtn.disabled = !canUlt;
    ultBtn.style.opacity = canUlt ? "1" : "0.5";
  }
}

function getCurrentActor() {
  if (!battleState.turnOrder || battleState.currentTurnIndex >= battleState.turnOrder.length) return null;
  const key = battleState.turnOrder[battleState.currentTurnIndex];
  if (key.startsWith('team-')) {
    const idx = parseInt(key.split('-')[1]);
    return { type: 'team', index: idx, member: battleState.team[idx] };
  }
  if (key.startsWith('enemy-')) {
    const idx = parseInt(key.split('-')[1]);
    return { type: 'enemy', index: idx, enemy: battleState.enemies[idx] };
  }
  return null;
}

function addLog(text) {
  battleState.log.push(text);
  const logEl = document.getElementById("battleLog");
  if (logEl) {
    logEl.innerHTML = battleState.log.map(l => `<div class="py-0.5">${l}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
  }
}

function clearBattleLog() {
  battleState.log = [];
  document.getElementById("battleLog").innerHTML = "";
}

function nextTurn() {
  if (!battleState.turnOrder || battleState.currentTurnIndex >= battleState.turnOrder.length) {
    // 大回合结束，恢复SP +1， 重置终结技标记
    battleState.bigTurn++;
    // 处理buff/debuff持续时间
    const processDurations = (list) => list.filter(b => { b.duration = (b.duration || 1) - 1; return b.duration > 0; });
    battleState.team.forEach(m => {
      if (m.currentHP > 0) m.SP = Math.min(5, m.SP + 1);
      m.ultimateUsed = false;
      m.buffs = processDurations(m.buffs || []);
      m.debuffs = processDurations(m.debuffs || []);
    });
    if (battleState.enemy) {
      battleState.enemy.buffs = processDurations(battleState.enemy.buffs || []);
      battleState.enemy.debuffs = processDurations(battleState.enemy.debuffs || []);
    }
    battleState.turnOrder = generateTurnOrder();
    battleState.currentTurnIndex = 0;
    addLog(`=== 第 ${battleState.bigTurn} 大回合开始 ===`);
    renderBattleUI();
  }

  const actor = getCurrentActor();
  if (!actor) {
    endBattle(true);
    return;
  }

  if (actor.type === 'team' && actor.member.currentHP <= 0) {
    // 跳过已死亡角色
    battleState.currentTurnIndex++;
    setTimeout(() => nextTurn(), 100);
    return;
  }

  if (actor.type === 'enemy') {
    // 敌方AI行动
    setTimeout(() => enemyAction(), 800);
  } else {
    // 玩家角色行动
    battleState.isPlayerTurn = true;
    renderBattleUI();
    addLog(`▶ ${actor.member.name} 的回合`);
  }
}

function performAction(actionType) {
  const actor = getCurrentActor();
  if (!actor || actor.type !== 'team' || !battleState.isPlayerTurn || actor.member.currentHP <= 0) return;

  const member = actor.member;
  let skillMult = 1.0;
  let spCost = 0;
  let ueGain = 20;
  let isUltimate = false;

  if (actionType === 'normal') {
    skillMult = 1.0;
    spCost = 0;
    ueGain = 20;
  } else if (actionType === 'skill1') {
    if (member.SP < 1) { alert("SP不足！"); return; }
    skillMult = 1.8;
    spCost = 1;
    ueGain = 30;
  } else if (actionType === 'skill2') {
    if (member.SP < 1) { alert("SP不足！"); return; }
    skillMult = 2.4;
    spCost = 1;
    ueGain = 30;
  } else if (actionType === 'ultimate') {
    if (member.UE < 100 || member.ultimateUsed) { alert("无法释放终结技！"); return; }
    skillMult = 6.5;
    spCost = 0;
    ueGain = 0;
    isUltimate = true;
    member.ultimateUsed = true;
    member.buffs.push({name: "终结余辉", duration: 2});
  }

  // 消耗
  member.SP = Math.max(0, member.SP - spCost);
  member.UE = Math.min(100, member.UE + ueGain);

  // 计算伤害 (目标第一个存活敌人)
  const aliveEnemies = battleState.enemies.filter(e => e.currentHP > 0);
  if (aliveEnemies.length === 0) {
    addLog("🎉 所有敌人被击败！战斗胜利！");
    setTimeout(() => endBattle(true, true), 1200);
    return;
  }
  const targetEnemy = aliveEnemies[0];
  const damage = calculateBattleDamage(member.stats, skillMult, targetEnemy);
  targetEnemy.currentHP = Math.max(0, targetEnemy.currentHP - damage);

  addLog(`💥 ${member.name} 使用 ${actionType === 'normal' ? '普攻' : actionType === 'skill1' ? '战技1' : actionType === 'skill2' ? '战技2' : '终结技'}！造成 ${damage} 点伤害`);

  renderBattleUI();

  // 检查所有敌方死亡
  if (battleState.enemies.every(e => e.currentHP <= 0)) {
    addLog("🎉 所有敌人被击败！战斗胜利！");
    setTimeout(() => endBattle(true, true), 1200);
    return;
  }

  // 结束小回合（除非终结技）
  if (!isUltimate) {
    battleState.currentTurnIndex++;
    battleState.isPlayerTurn = false;
    setTimeout(() => nextTurn(), 900);
  } else {
    // 终结技不结束回合，允许再行动一次
    addLog("⚡ 终结技释放完毕，可继续行动！");
    renderBattleUI();
  }
}

function enemyAction() {
  const currentActor = getCurrentActor();
  if (!currentActor || currentActor.type !== 'enemy') return;
  const enemy = battleState.enemies[currentActor.index];
  if (!enemy || enemy.currentHP <= 0) {
    battleState.currentTurnIndex++;
    setTimeout(() => nextTurn(), 100);
    return;
  }

  // 随机攻击我方存活角色
  const aliveTeam = battleState.team.filter(m => m.currentHP > 0);
  if (aliveTeam.length === 0) {
    endBattle(false);
    return;
  }

  const target = aliveTeam[Math.floor(Math.random() * aliveTeam.length)];

  // 简单伤害计算（敌方无暴击模拟）
  const dmg = Math.floor(enemy.atk * 1.2 * (1 - target.stats.def / (target.stats.def + 4000)));
  target.currentHP = Math.max(0, target.currentHP - dmg);

  addLog(`👹 ${enemy.name} 攻击 ${target.name}，造成 ${dmg} 点伤害`);
  if (Math.random() < 0.4) {
    addOrRefreshEffect(target, "裂隙侵蚀", 2, true);
    addLog(`🔻 ${target.name} 受到【裂隙侵蚀】减益`);
  }

  renderBattleUI();

  // 检查我方全灭
  if (battleState.team.every(m => m.currentHP <= 0)) {
    addLog("💀 全队阵亡...战斗失败");
    setTimeout(() => endBattle(false), 1000);
    return;
  }

  // 结束敌方回合
  battleState.currentTurnIndex++;
  setTimeout(() => nextTurn(), 700);
}

// 核心伤害公式（严格参考战斗模块）
function calculateBattleDamage(attackerStats, skillMult, defender) {
  // 基础伤害
  let base = attackerStats.atk * skillMult;

  // 伤害扩大
  let expand = base * (1 + 0.1); // 模拟少量增伤

  // 暴击
  const isCrit = Math.random() < attackerStats.critRate;
  let critCoef = isCrit ? (1 + attackerStats.critDamage) : 1;
  if (isCrit) expand *= critCoef;

  // 属性克制
  const attrMult = getAttributeAdvantage(attackerStats.attribute, defender.attribute);
  expand *= attrMult;

  // 有效防御 & 减伤
  let effDef = Math.max(0, defender.def * (1 - attackerStats.penRate) - attackerStats.penFixed);
  let dmgReduction = 1 - 4000 / (4000 + effDef);

  let finalDmg = Math.floor(expand * (1 - dmgReduction) * attrMult); // attrMult 同时影响受伤

  // 最小伤害
  return Math.max(10, finalDmg);
}

function getAttributeAdvantage(att1, att2) {
  if (att1 === "裂隙") return 1.2;
  if (att2 === "裂隙") return 0.85;

  const cycle = { "混沌": "灵幻", "灵幻": "元素", "元素": "混沌" };
  if (cycle[att1] === att2) return 1.3;
  if (cycle[att2] === att1) return 0.7;
  return 1.0;
}

function endBattle(isWin, fromVictory = false) {
  const arena = document.getElementById("battleArena");
  const pre = document.getElementById("preBattle");
  if (!arena || !pre) return;

  arena.classList.add("hidden");
  pre.classList.remove("hidden");

  if (isWin) {
    const reward = 150 + battleState.bigTurn * 40;
    player.gold = (player.gold || 0) + reward;
    document.getElementById("gold").textContent = player.gold;
    alert(`🎉 战斗胜利！获得 ${reward} 金币奖励！`);
    addLog(`🏆 获得 ${reward} 金币`);
  } else {
    alert("战斗失败...下次再来挑战吧！");
  }

  // 重置状态
  battleState = { team: [], enemy: null, turnOrder: [], currentTurnIndex: 0, bigTurn: 1, log: [], isPlayerTurn: false, selectedTeam: [] };
  renderTeamSelectGrid();
}

// 暴露全局函数
window.initBattleUI = initBattleUI;
window.startBattle = startBattle;
window.performAction = performAction;
window.endBattle = endBattle;
function updateActionOrder() {
  const listEl = document.getElementById("actionOrderList");
  if (!listEl || !battleState.turnOrder) return;
  listEl.innerHTML = "";
  const currentKey = battleState.turnOrder[battleState.currentTurnIndex] || "";
  battleState.turnOrder.forEach((key, idx) => {
    let name = "";
    let cls = "bg-zinc-700 text-white";
    if (key.startsWith("team-")) {
      const i = parseInt(key.split("-")[1]);
      const m = battleState.team[i];
      name = m ? m.name.split("·").pop() || m.name : "队友";
      if (key === currentKey) cls = "bg-yellow-500 text-black font-bold";
    } else {
      name = "敌方BOSS";
      if (key === currentKey) cls = "bg-yellow-500 text-black font-bold";
    }
    const span = document.createElement("span");
    span.className = `px-3 py-1 rounded-xl ${cls} ${idx === battleState.currentTurnIndex ? 'animate-pulse' : ''}`;
    span.textContent = name;
    listEl.appendChild(span);
    if (idx < battleState.turnOrder.length - 1) {
      const arr = document.createElement("span");
      arr.className = "text-gray-500 px-1 self-center";
      arr.textContent = "→";
      listEl.appendChild(arr);
    }
  });
}

function showBattleDetail(isTeam, index) {
  const modal = document.createElement("div");
  modal.className = "fixed inset-0 bg-black/90 flex items-center justify-center z-[100000] p-4";
  let contentHTML = "";
  if (isTeam) {
    const member = battleState.team[index];
    if (!member) return;
    const stats = member.stats || {};
    const buffs = member.buffs || [];
    const debuffs = member.debuffs || [];
    const attr = stats.attribute || "元素";
    contentHTML = `
      <div class="bg-zinc-900 rounded-3xl max-w-lg w-full border-4 border-emerald-500 p-6 max-h-[90vh] overflow-auto">
        <div class="flex justify-between mb-4">
          <h3 class="text-2xl font-bold text-emerald-400">${member.name}</h3>
          <button onclick="this.closest('.fixed').remove()" class="text-4xl text-gray-400 hover:text-white">×</button>
        </div>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="bg-zinc-800 p-3 rounded-2xl"><span class="text-gray-400">生命值</span><br><span class="text-xl font-bold">${member.currentHP} / ${member.maxHP}</span></div>
          <div class="bg-zinc-800 p-3 rounded-2xl"><span class="text-gray-400">攻击力</span><br><span class="text-xl font-bold">${stats.atk}</span> <span class="text-xs text-emerald-400">(+${Math.floor((stats.dmgBonus||0)*100)}%增伤)</span></div>
          <div class="bg-zinc-800 p-3 rounded-2xl"><span class="text-gray-400">防御力</span><br><span class="text-xl font-bold">${stats.def}</span> <span class="text-xs text-emerald-400">(-${Math.floor((stats.dmgReduction||0)*100)}%减伤)</span></div>
          <div class="bg-zinc-800 p-3 rounded-2xl"><span class="text-gray-400">暴击率/暴击伤害</span><br><span class="text-xl font-bold">${(stats.critRate*100).toFixed(0)}% / ${(stats.critDamage*100).toFixed(0)}%</span></div>
          <div class="bg-zinc-800 p-3 rounded-2xl"><span class="text-gray-400">速度</span><br><span class="text-xl font-bold">${stats.spd}</span></div>
          <div class="bg-zinc-800 p-3 rounded-2xl"><span class="text-gray-400">终结能量 UE</span><br><span class="text-xl font-bold">${member.UE} / 100</span></div>
          <div class="bg-zinc-800 p-3 rounded-2xl"><span class="text-gray-400">穿透值 / 穿透率</span><br><span class="text-xl font-bold">${stats.penFixed} / ${(stats.penRate*100).toFixed(0)}%</span></div>
          <div class="bg-zinc-800 p-3 rounded-2xl"><span class="text-gray-400">属性类型</span><br><span class="text-xl font-bold text-purple-400">${attr}</span></div>
          <div class="bg-zinc-800 p-3 rounded-2xl"><span class="text-gray-400">治疗加成</span><br><span class="text-xl font-bold">${(stats.healBonus*100).toFixed(0)}%</span></div>
          <div class="bg-zinc-800 p-3 rounded-2xl"><span class="text-gray-400">受治疗加成</span><br><span class="text-xl font-bold">${(stats.recvHealBonus*100).toFixed(0)}%</span></div>
          <div class="bg-zinc-800 p-3 rounded-2xl"><span class="text-gray-400">护盾强度</span><br><span class="text-xl font-bold">${(stats.shieldStr||1).toFixed(1)}</span></div>
          <div class="bg-zinc-800 p-3 rounded-2xl col-span-2"><span class="text-gray-400">增伤加成 / 减伤比率</span><br><span class="text-xl font-bold">${(stats.dmgBonus*100).toFixed(0)}% / ${(stats.dmgReduction*100).toFixed(0)}%</span></div>
        </div>
        <div class="mt-4">
          <div class="text-sm font-bold text-emerald-400 mb-1">增益 Buffs</div>
          <div class="flex flex-wrap gap-1 min-h-[30px]">
            ${buffs.length ? buffs.map(b => `<span title="${getBuffDesc(b.name)}" class="px-2 py-0.5 bg-emerald-900 text-emerald-300 text-xs rounded cursor-help">${b.name}(${b.duration||1}回合)</span>`).join('') : '<span class="text-gray-500 text-xs">无</span>'}
          </div>
          <div class="text-sm font-bold text-red-400 mb-1 mt-3">减益 DeBuffs</div>
          <div class="flex flex-wrap gap-1 min-h-[30px]">
            ${debuffs.length ? debuffs.map(d => `<span title="${getBuffDesc(d.name)}" class="px-2 py-0.5 bg-red-900 text-red-300 text-xs rounded cursor-help">${d.name}(${d.duration||1}回合)</span>`).join('') : '<span class="text-gray-500 text-xs">无</span>'}
          </div>
        </div>
        <div class="text-center mt-6">
          <button onclick="this.closest('.fixed').remove()" class="px-8 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-2xl">关闭</button>
        </div>
      </div>
    `;
  } else {
    const enemy = battleState.enemy;
    const buffs = enemy.buffs || [];
    const debuffs = enemy.debuffs || [];
    const attr = enemy.attribute || "混沌——虚";
    contentHTML = `
      <div class="bg-zinc-900 rounded-3xl max-w-lg w-full border-4 border-red-500 p-6 max-h-[90vh] overflow-auto">
        <div class="flex justify-between mb-4">
          <h3 class="text-2xl font-bold text-red-400">${enemy.name}</h3>
          <button onclick="this.closest('.fixed').remove()" class="text-4xl text-gray-400 hover:text-white">×</button>
        </div>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="bg-zinc-800 p-3 rounded-2xl"><span class="text-gray-400">生命值</span><br><span class="text-xl font-bold">${enemy.currentHP} / ${enemy.maxHP}</span></div>
          <div class="bg-zinc-800 p-3 rounded-2xl"><span class="text-gray-400">攻击力</span><br><span class="text-xl font-bold">${enemy.atk}</span></div>
          <div class="bg-zinc-800 p-3 rounded-2xl"><span class="text-gray-400">防御力</span><br><span class="text-xl font-bold">${enemy.def}</span></div>
          <div class="bg-zinc-800 p-3 rounded-2xl"><span class="text-gray-400">速度</span><br><span class="text-xl font-bold">${enemy.spd}</span></div>
          <div class="bg-zinc-800 p-3 rounded-2xl"><span class="text-gray-400">穿透值 / 穿透率</span><br><span class="text-xl font-bold">${enemy.penFixed} / ${(enemy.penRate*100).toFixed(0)}%</span></div>
          <div class="bg-zinc-800 p-3 rounded-2xl"><span class="text-gray-400">属性类型</span><br><span class="text-xl font-bold text-purple-400">${attr}</span></div>
          <div class="bg-zinc-800 p-3 rounded-2xl"><span class="text-gray-400">治疗加成 / 受治疗加成</span><br><span class="text-xl font-bold">${(enemy.healBonus*100).toFixed(0)}% / ${(enemy.recvHealBonus*100).toFixed(0)}%</span></div>
          <div class="bg-zinc-800 p-3 rounded-2xl"><span class="text-gray-400">护盾强度</span><br><span class="text-xl font-bold">${(enemy.shieldStr||1).toFixed(1)}</span></div>
          <div class="bg-zinc-800 p-3 rounded-2xl col-span-2"><span class="text-gray-400">增伤加成 / 减伤比率</span><br><span class="text-xl font-bold">${(enemy.dmgBonus*100).toFixed(0)}% / ${(enemy.dmgReduction*100).toFixed(0)}%</span></div>
        </div>
        <div class="mt-4">
          <div class="text-sm font-bold text-emerald-400 mb-1">增益 Buffs</div>
          <div class="flex flex-wrap gap-1 min-h-[30px]">
            ${buffs.length ? buffs.map(b => `<span title="${getBuffDesc(b.name)}" class="px-2 py-0.5 bg-emerald-900 text-emerald-300 text-xs rounded cursor-help">${b.name}(${b.duration||1}回合)</span>`).join('') : '<span class="text-gray-500 text-xs">无</span>'}
          </div>
          <div class="text-sm font-bold text-red-400 mb-1 mt-3">减益 DeBuffs</div>
          <div class="flex flex-wrap gap-1 min-h-[30px]">
            ${debuffs.length ? debuffs.map(d => `<span title="${getBuffDesc(d.name)}" class="px-2 py-0.5 bg-red-900 text-red-300 text-xs rounded cursor-help">${d.name}(${d.duration||1}回合)</span>`).join('') : '<span class="text-gray-500 text-xs">无</span>'}
          </div>
        </div>
        <div class="text-center mt-6">
          <button onclick="this.closest('.fixed').remove()" class="px-8 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-2xl">关闭</button>
        </div>
      </div>
    `;
  }
  modal.innerHTML = contentHTML;
  document.body.appendChild(modal);
}
