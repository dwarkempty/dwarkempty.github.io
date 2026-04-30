// =============================================
// 全新战斗模块 v2.0 - 严格遵循《战斗模块.txt》设计
// =============================================

let battleState = {
  playerTeam: [],
  enemyTeam: [],
  allUnits: [],
  currentBigTurn: 1,
  turnOrder: [],           // 当前大回合的行动顺序
  currentActorIndex: 0,    // 当前行动的单位在 turnOrder 中的索引
  log: [],
  isRunning: false,
  pendingSkillUnit: null,
  battleModal: null,
  speed: 1
};

// ==================== 工具函数 ====================
function getCategoryPriority(category) {
  if (category === "近卫") return 3;
  if (category === "辅助") return 2;
  return 1; // 强袭
}

// 元素克制表
const ELEMENT_ADVANTAGE = {
  "混沌": { "灵幻": 1.3, "元素": 0.7, "裂隙": 1.0 },
  "灵幻": { "元素": 1.3, "混沌": 0.7, "裂隙": 1.0 },
  "元素": { "混沌": 1.3, "灵幻": 0.7, "裂隙": 1.0 },
  "裂隙": { "混沌": 1.2, "灵幻": 1.2, "元素": 1.2 }
};

function getElementMultiplier(attackerType, targetType) {
  if (!attackerType || !targetType) return 1.0;
  return ELEMENT_ADVANTAGE[attackerType]?.[targetType] || 1.0;
}

// ==================== 伤害计算（严格按照新公式） ====================
function calculateDamage(attacker, target, skillMultiplier = 1.0, isCrit = false, extra = {}) {
  // 1. 基础伤害
  const baseAtk = (attacker.atk || 0) + (extra.bonusAtk || 0);
  const atkPercent = (extra.atkPercent || 0) + (attacker.atkPercentBuff || 0);
  const baseDamage = baseAtk * (1 + atkPercent) * skillMultiplier;

  // 2. 伤害扩大
  const dmgBonus = (extra.dmgBonus || 0) + (attacker.dmgBonus || 0);
  const elemAdv = getElementMultiplier(attacker.elementType || "元素", target.elementType || "元素");
  let amplified = baseDamage * (1 + dmgBonus) * elemAdv;

  // 3. 暴击
  let critMult = 1.0;
  let finalIsCrit = isCrit;
  const critRate = (attacker.critRate || 0.05) + (extra.critRateBonus || 0);
  if (!finalIsCrit && Math.random() < critRate) {
    finalIsCrit = true;
  }
  if (finalIsCrit) {
    critMult = 1 + ((attacker.critDamage || 0.5) + (extra.critDmgBonus || 0));
  }
  let totalOut = amplified * critMult;

  // 4. 有效防御 & 减免
  const penRate = attacker.penRate || 0;
  const penValue = attacker.penValue || 0;
  const effectiveDef = Math.max(0, (target.def || 0) * (1 - penRate) - penValue);
  const defReduction = 1 - 4000 / (4000 + effectiveDef);

  const dmgReduction = extra.dmgReduction || 0;
  const elemDisadv = 1 / getElementMultiplier(target.elementType || "元素", attacker.elementType || "元素"); // 反向克制

  let finalDamage = totalOut * (1 - defReduction) * (1 - dmgReduction) * elemDisadv;

  // 5. 特殊状态（无视防御）
  if (attacker.ignoreDefense) {
    finalDamage = totalOut * (1 - dmgReduction) * elemDisadv;
  }

  return {
    damage: Math.max(1, Math.floor(finalDamage)),
    isCrit: finalIsCrit,
    breakdown: { baseDamage, amplified, critMult, defReduction, elemAdv }
  };
}

// ==================== 开始战斗 ====================
function startBattle(selectedChars = null) {
  // 如果没有传入队伍，自动选择前4个
  if (!selectedChars || selectedChars.length === 0) {
    const sorted = [...(player.owned || [])].sort((a, b) => {
      const da = window.getCharacterData(a.charId);
      const scoreA = (a.level || 1) * 100 + (a.stars || 0) * 20 + (da ? (window.rarityOrder?.[da.rarity] || 0) * 50 : 0);
      const db = window.getCharacterData(b.charId);
      const scoreB = (b.level || 1) * 100 + (b.stars || 0) * 20 + (db ? (window.rarityOrder?.[db.rarity] || 0) * 50 : 0);
      return scoreB - scoreA;
    }).slice(0, 4);

    selectedChars = sorted.map(item => {
      const data = window.getCharacterData(item.charId);
      let equipped = null;
      if (item.equippedWeapon) equipped = player.weapons.find(w => w.id === item.equippedWeapon);
      return createBattleUnit(data, item.level || 1, item.stars || 0, true, equipped);
    });
  }

  if (selectedChars.length === 0) {
    // 给演示队伍
    const demo = window.characterPool.slice(0, 4);
    selectedChars = demo.map((d, i) => createBattleUnit(d, 25 + i * 3, 1, true, null));
  }

  battleState.playerTeam = selectedChars;
  const avgLevel = selectedChars.reduce((s, u) => s + u.level, 0) / selectedChars.length;
  battleState.enemyTeam = generateEnemyTeam(Math.floor(avgLevel), Math.max(2, Math.min(4, selectedChars.length)));

  battleState.allUnits = [...battleState.playerTeam, ...battleState.enemyTeam];
  battleState.currentBigTurn = 1;
  battleState.log = [];
  battleState.isRunning = true;
  battleState.pendingSkillUnit = null;

  // 初始化所有单位
  battleState.allUnits.forEach(u => {
    u.hp = u.maxHp;
    u.energy = 3;
    u.ultimateEnergy = 30; // 初始30点
    u.isAlive = true;
    u.sparkleMarks = 0;
    u.usedUltimateThisBigTurn = false;
    u.elementType = u.name.includes("阿特亚") || u.name.includes("希罗") ? "元素" : (u.elementType || "混沌");
  });

  showBattleModal();
  startNewBigTurn();
}

// 生成敌人（简化）
function generateEnemyTeam(avgLevel, count) {
  const pool = [
    { name: "森林史莱姆", rarity: "R", category: "强袭", baseHP: 320, baseATK: 190, baseDEF: 110, baseSPD: 98, elementType: "混沌", image: "images/Allen_Illustration.jpg" },
    { name: "岩石傀儡", rarity: "SR", category: "近卫", baseHP: 580, baseATK: 150, baseDEF: 290, baseSPD: 82, elementType: "元素", image: "images/Buck_Illustration.jpg" },
    { name: "暗影刺客", rarity: "SR", category: "强袭", baseHP: 350, baseATK: 270, baseDEF: 105, baseSPD: 138, elementType: "混沌", image: "images/Shadowblade_Illustration.jpg" },
    { name: "雷鸣骑士", rarity: "SSR", category: "强袭", baseHP: 520, baseATK: 320, baseDEF: 175, baseSPD: 125, elementType: "元素", image: "images/Sorey_Illustration.jpg" }
  ];
  const enemies = [];
  for (let i = 0; i < count; i++) {
    const t = pool[Math.floor(Math.random() * pool.length)];
    const u = createBattleUnit(t, avgLevel + Math.floor(Math.random() * 8) - 2, 0, false, null);
    u.maxHp = Math.floor(u.maxHp * 1.2);
    u.hp = u.maxHp;
    enemies.push(u);
  }
  return enemies;
}

function createBattleUnit(charData, level = 1, stars = 0, isPlayer = true, equipped = null) {
  const stats = window.calculateStats ? window.calculateStats({ level, stars }, charData, equipped) : {
    hp: charData.baseHP, atk: charData.baseATK, def: charData.baseDEF, spd: charData.baseSPD,
    critRate: 0.05, critDamage: 0.5
  };
  return {
    id: Date.now() + Math.random(),
    name: charData.name,
    rarity: charData.rarity,
    category: charData.category,
    image: charData.image,
    maxHp: Math.floor(stats.hp),
    hp: Math.floor(stats.hp),
    atk: Math.floor(stats.atk),
    def: Math.floor(stats.def),
    spd: Math.floor(stats.spd),
    critRate: stats.critRate || 0.05,
    critDamage: stats.critDamage || 0.5,
    energy: 3,
    ultimateEnergy: 30,
    isPlayer: isPlayer,
    isAlive: true,
    usedUltimateThisBigTurn: false,
    elementType: charData.elementType || "混沌",
    sparkleMarks: 0
  };
}

// ==================== 大回合开始 ====================
function startNewBigTurn() {
  // 重置所有单位本回合状态
  battleState.allUnits.forEach(u => {
    if (u.isAlive) {
      u.usedUltimateThisBigTurn = false;
      if (u.isPlayer) {
        u.energy = Math.min(5, u.energy + 1); // 大回合开始 +1 SP
      }
    }
  });

  // 按速度排序（降序），同速玩家优先，同类近卫优先
  const alive = battleState.allUnits.filter(u => u.isAlive);
  alive.sort((a, b) => {
    if (a.spd !== b.spd) return b.spd - a.spd;
    if (a.isPlayer !== b.isPlayer) return a.isPlayer ? -1 : 1;
    return getCategoryPriority(b.category) - getCategoryPriority(a.category);
  });

  battleState.turnOrder = alive;
  battleState.currentActorIndex = 0;
  battleState.currentBigTurn++;

  addBattleLog(`=== 第 ${battleState.currentBigTurn} 大回合开始 ===`, "system");
  updateBattleUI();

  // 延迟开始第一个行动
  setTimeout(() => processNextTurn(), 600);
}

// ==================== 处理下一个行动 ====================
function processNextTurn() {
  if (!battleState.isRunning) return;

  // 检查胜负
  const alivePlayers = battleState.playerTeam.filter(u => u.isAlive).length;
  const aliveEnemies = battleState.enemyTeam.filter(u => u.isAlive).length;

  if (alivePlayers === 0) { endBattle(false); return; }
  if (aliveEnemies === 0) { endBattle(true); return; }

  // 如果当前大回合所有单位都行动完毕 → 新大回合
  if (battleState.currentActorIndex >= battleState.turnOrder.length) {
    startNewBigTurn();
    return;
  }

  const actor = battleState.turnOrder[battleState.currentActorIndex];

  if (!actor || !actor.isAlive) {
    battleState.currentActorIndex++;
    processNextTurn();
    return;
  }

  // 高亮当前行动者
  highlightCurrentActor(actor);

  if (actor.isPlayer) {
    // 我方 → 手动选择技能
    battleState.pendingSkillUnit = actor;
    showSkillSelectionUI(actor);
  } else {
    // 敌人 → 自动AI
    setTimeout(() => {
      autoEnemyAction(actor);
    }, 400);
  }
}

function highlightCurrentActor(actor) {
  // 简单实现：更新UI时会高亮
  updateBattleUI();
}

// ==================== 敌人AI ====================
function autoEnemyAction(unit) {
  const alivePlayers = battleState.playerTeam.filter(p => p.isAlive);
  if (alivePlayers.length === 0) return;

  let skillType = "normal";
  let target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];

  const canSkill = unit.energy >= 1;
  const canUlt = unit.ultimateEnergy >= 100 && !unit.usedUltimateThisBigTurn;

  if (canUlt && Math.random() > 0.65) {
    skillType = "ultimate";
  } else if (canSkill && Math.random() > 0.4) {
    skillType = "skill1";
  }

  useSkill(unit, skillType, target);
  battleState.currentActorIndex++;
  setTimeout(() => processNextTurn(), 500);
}

// ==================== 技能选择UI ====================
function showSkillSelectionUI(unit) {
  battleState.isRunning = false; // 暂停自动流程

  const isAtya = unit.name.includes("阿特亚");
  const canSkill1 = unit.energy >= 1;
  const canSkill2 = unit.energy >= 2;
  const canUlt = unit.ultimateEnergy >= 100 && !unit.usedUltimateThisBigTurn;

  const bar = document.createElement("div");
  bar.id = "skillSelectionBar";
  bar.className = `fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 border-2 border-emerald-500 rounded-3xl px-6 py-4 flex gap-3 z-[100001] shadow-2xl`;

  let html = `
    <div class="flex flex-col justify-center mr-4 text-center">
      <div class="font-bold text-emerald-400">${unit.name}</div>
      <div class="text-xs text-gray-400">SP ${unit.energy}/5 | UE ${unit.ultimateEnergy}</div>
    </div>
  `;

  // 普攻（永远可用）
  html += `<button onclick="playerUseSkill('${unit.id}', 'normal')" class="px-7 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl text-sm font-bold">普攻<br><span class="text-[10px] text-gray-400">结束回合</span></button>`;

  // 战技1
  html += `<button onclick="playerUseSkill('${unit.id}', 'skill1')" class="px-6 py-3 bg-blue-900 hover:bg-blue-800 rounded-2xl text-sm font-bold ${canSkill1 ? '' : 'opacity-40 cursor-not-allowed'}" ${canSkill1 ? '' : 'disabled'}>
    战技1<br><span class="text-[10px] text-gray-400">消耗1 SP</span>
  </button>`;

  // 战技2（仅阿特亚）
  if (isAtya) {
    html += `<button onclick="playerUseSkill('${unit.id}', 'skill2')" class="px-6 py-3 bg-purple-900 hover:bg-purple-800 rounded-2xl text-sm font-bold ${canSkill2 ? '' : 'opacity-40 cursor-not-allowed'}" ${canSkill2 ? '' : 'disabled'}>
      绚律易质<br><span class="text-[10px] text-gray-400">消耗2 SP</span>
    </button>`;
  }

  // 终结技
  html += `<button onclick="playerUseSkill('${unit.id}', 'ultimate')" class="px-6 py-3 bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-2xl text-sm font-bold ${canUlt ? '' : 'opacity-40 cursor-not-allowed'}" ${canUlt ? '' : 'disabled'}>
    终结技<br><span class="text-[10px]">消耗100 UE</span>
  </button>`;

  html += `<button onclick="cancelSkillSelection()" class="px-5 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-2xl text-xs">取消</button>`;

  bar.innerHTML = html;
  document.body.appendChild(bar);
}

window.playerUseSkill = function(unitId, skillType) {
  const unit = battleState.allUnits.find(u => u.id == unitId);
  if (!unit) return;

  document.getElementById("skillSelectionBar")?.remove();

  const aliveEnemies = battleState.enemyTeam.filter(e => e.isAlive);
  let target = aliveEnemies[0];

  // 简单目标选择（后续可扩展点击选择）
  useSkill(unit, skillType, target);

  // 推进到下一个
  battleState.pendingSkillUnit = null;
  battleState.isRunning = true;
  battleState.currentActorIndex++;

  setTimeout(() => processNextTurn(), 450);
};

window.cancelSkillSelection = function() {
  document.getElementById("skillSelectionBar")?.remove();
  battleState.pendingSkillUnit = null;
  battleState.isRunning = true;
  addBattleLog("已取消行动", "system");
  setTimeout(() => processNextTurn(), 300);
};

// ==================== 使用技能 ====================
function useSkill(unit, skillType, target) {
  if (!unit.isAlive || !target) return;

  const isPlayer = unit.isPlayer;
  const isAtya = unit.name.includes("阿特亚");
  let logMsg = "";
  let dmgInfo = null;

  if (skillType === "normal") {
    // 普攻
    dmgInfo = calculateDamage(unit, target, 1.0);
    target.hp = Math.max(0, target.hp - dmgInfo.damage);
    logMsg = `${unit.name} 普攻 → ${target.name} <span class="text-red-400">${dmgInfo.damage}</span>`;
    unit.ultimateEnergy = Math.min(100, unit.ultimateEnergy + 20);

  } else if (skillType === "skill1") {
    if (unit.energy < 1) { addBattleLog("SP不足", "system"); return; }
    unit.energy -= 1;

    const mult = isAtya ? 2.2 : 1.8;
    dmgInfo = calculateDamage(unit, target, mult);
    target.hp = Math.max(0, target.hp - dmgInfo.damage);
    logMsg = `${unit.name} 战技 → ${target.name} <span class="text-red-400">${dmgInfo.damage}</span>`;
    unit.ultimateEnergy = Math.min(100, unit.ultimateEnergy + 30);

    if (isAtya) {
      // 阿特亚战技1特殊效果：附加印记
      target.sparkleMarks = Math.min(8, (target.sparkleMarks || 0) + 3);
      logMsg += ` +3层印记`;
    }

  } else if (skillType === "skill2" && isAtya) {
    if (unit.energy < 2) { addBattleLog("SP不足", "system"); return; }
    unit.energy -= 2;

    const base = calculateDamage(unit, target, 3.4).damage;
    const explode = (target.sparkleMarks || 0) * unit.atk * 0.8;
    const total = base + explode;

    target.hp = Math.max(0, target.hp - total);
    target.sparkleMarks = 0;

    logMsg = `绚律易质！${target.name} 受到 <span class="text-red-400">${total}</span> 伤害（含爆炸）`;
    unit.ultimateEnergy = Math.min(100, unit.ultimateEnergy + 35);
    unit.atkPercentBuff = (unit.atkPercentBuff || 0) + 0.25;

  } else if (skillType === "ultimate") {
    if (unit.ultimateEnergy < 100 || unit.usedUltimateThisBigTurn) {
      addBattleLog("终结技不可用", "system"); return;
    }
    unit.ultimateEnergy = 0;
    unit.usedUltimateThisBigTurn = true;

    if (isAtya) {
      // 阿特亚终结技
      let total = 0;
      battleState.enemyTeam.filter(e => e.isAlive).forEach(e => {
        const markDmg = (e.sparkleMarks || 0) * unit.atk * 0.8;
        const base = calculateDamage(unit, e, 7.0).damage;
        e.hp = Math.max(0, e.hp - (base + markDmg));
        total += base + markDmg;
      });
      logMsg = `万般绚明！全体造成 <span class="text-red-400">${total}</span> 毁灭伤害`;
      // 进入神子永辉
      unit.ignoreDefense = true;
      unit.godModeTurns = 2;
    } else {
      const dmg = calculateDamage(unit, target, 4.5, true).damage;
      target.hp = Math.max(0, target.hp - dmg);
      logMsg = `终结技！${target.name} 受到 <span class="text-red-400">${dmg}</span> 伤害`;
    }
  }

  // 检查死亡
  battleState.allUnits.forEach(u => { if (u.hp <= 0) u.isAlive = false; });

  addBattleLog(logMsg, isPlayer ? "player" : "enemy");
  updateBattleUI();
}

// ==================== UI 相关 ====================
function showBattleModal() {
  const html = `
    <div id="battleModal" class="fixed inset-0 bg-black/95 flex items-center justify-center z-[99999] p-2">
      <div class="bg-zinc-900 rounded-3xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden border-4 border-orange-500">
        <!-- 顶部 -->
        <div class="flex justify-between items-center px-6 py-4 bg-zinc-950 border-b border-zinc-700">
          <div class="flex items-center gap-4">
            <div class="text-2xl font-bold text-orange-400">⚔️ 战斗中</div>
            <div class="text-sm text-gray-400">第 <span id="bigTurnNum">1</span> 大回合</div>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="battleState.speed = Math.max(0.5, battleState.speed-0.5); updateBattleUI()" class="px-3 py-1 bg-zinc-800 rounded text-xs">慢</button>
            <div id="battleSpeed" class="text-emerald-400 font-bold w-10 text-center">1.0x</div>
            <button onclick="battleState.speed = Math.min(3, battleState.speed+0.5); updateBattleUI()" class="px-3 py-1 bg-zinc-800 rounded text-xs">快</button>
            <button onclick="endBattle(false)" class="px-5 py-1.5 bg-red-600 hover:bg-red-700 rounded-2xl text-xs font-bold">投降</button>
          </div>
        </div>

        <!-- 战场 -->
        <div class="flex-1 flex p-4 gap-4 overflow-hidden">
          <!-- 我方 -->
          <div class="flex-1 bg-zinc-950 rounded-3xl p-4 border border-emerald-500/50">
            <div class="text-emerald-400 text-lg font-bold mb-3">我方队伍</div>
            <div id="playerUnits" class="grid grid-cols-2 gap-3"></div>
          </div>

          <!-- 行动顺序 -->
          <div class="w-56 bg-zinc-950 rounded-3xl p-4 border border-yellow-500/50 flex-shrink-0">
            <div class="text-yellow-400 text-sm font-bold mb-3">行动顺序</div>
            <div id="actionOrderList" class="text-xs space-y-1"></div>
          </div>

          <!-- 敌方 -->
          <div class="flex-1 bg-zinc-950 rounded-3xl p-4 border border-red-500/50">
            <div class="text-red-400 text-lg font-bold mb-3">敌方队伍</div>
            <div id="enemyUnits" class="grid grid-cols-2 gap-3"></div>
          </div>
        </div>

        <!-- 日志 -->
        <div class="h-44 bg-black/70 border-t border-zinc-700 p-4 overflow-auto font-mono text-sm" id="battleLog"></div>
      </div>
    </div>
  `;

  document.getElementById("battleModal")?.remove();
  const div = document.createElement("div");
  div.innerHTML = html;
  document.body.appendChild(div.firstElementChild);
  battleState.battleModal = document.getElementById("battleModal");
}

function updateBattleUI() {
  if (!battleState.battleModal) return;

  // 大回合数
  const turnEl = document.getElementById("bigTurnNum");
  if (turnEl) turnEl.textContent = battleState.currentBigTurn;

  // 速度
  const speedEl = document.getElementById("battleSpeed");
  if (speedEl) speedEl.textContent = battleState.speed.toFixed(1) + "x";

  // 我方
  const pContainer = document.getElementById("playerUnits");
  if (pContainer) {
    pContainer.innerHTML = "";
    battleState.playerTeam.forEach(u => {
      const card = createUnitCard(u, true);
      pContainer.appendChild(card);
    });
  }

  // 敌方
  const eContainer = document.getElementById("enemyUnits");
  if (eContainer) {
    eContainer.innerHTML = "";
    battleState.enemyTeam.forEach(u => {
      const card = createUnitCard(u, false);
      eContainer.appendChild(card);
    });
  }

  // 行动顺序
  const orderEl = document.getElementById("actionOrderList");
  if (orderEl) {
    const remaining = battleState.turnOrder.slice(battleState.currentActorIndex).filter(u => u.isAlive);
    orderEl.innerHTML = remaining.map((u, i) => {
      const color = u.isPlayer ? "text-emerald-400" : "text-red-400";
      const mark = u.sparkleMarks > 0 ? `★${u.sparkleMarks}` : "";
      return `<div class="${color} flex justify-between text-xs"><span>${i+1}. ${u.name}</span><span>${mark}</span></div>`;
    }).join("");
  }

  // 日志
  const logEl = document.getElementById("battleLog");
  if (logEl) {
    logEl.innerHTML = battleState.log.slice(-15).map(l => 
      `<div class="mb-0.5 ${l.type === 'player' ? 'text-emerald-300' : l.type === 'enemy' ? 'text-red-300' : 'text-gray-400'}">${l.msg}</div>`
    ).join("");
    logEl.scrollTop = logEl.scrollHeight;
  }
}

function createUnitCard(unit, isPlayer) {
  const hpPct = Math.max(0, Math.floor((unit.hp / unit.maxHp) * 100));
  const card = document.createElement("div");
  card.className = `bg-zinc-900 rounded-2xl p-3 border ${unit.isAlive ? (isPlayer ? 'border-emerald-500' : 'border-red-500') : 'border-gray-700 opacity-60'} cursor-pointer hover:scale-[1.02] transition-all`;

  let buff = "";
  if (unit.sparkleMarks > 0) buff += `<span class="text-[9px] bg-orange-500 px-1 rounded">印记×${unit.sparkleMarks}</span>`;
  if (unit.godModeTurns > 0) buff += `<span class="text-[9px] bg-yellow-500 px-1 rounded">神辉</span>`;

  card.innerHTML = `
    <div class="flex gap-3">
      <img src="${unit.image}" class="w-14 h-14 rounded-xl object-cover">
      <div class="flex-1 min-w-0">
        <div class="flex justify-between">
          <div class="font-bold text-sm truncate">${unit.name}</div>
          <div class="text-xs ${unit.isAlive ? 'text-emerald-400' : 'text-red-500'}">${unit.hp}/${unit.maxHp}</div>
        </div>
        <div class="h-2 bg-zinc-800 rounded mt-1"><div class="h-2 bg-emerald-500 rounded" style="width:${hpPct}%"></div></div>
        <div class="flex justify-between text-[10px] text-gray-400 mt-1">
          <div>SP ${unit.energy}</div>
          <div>UE ${unit.ultimateEnergy}</div>
        </div>
        <div class="text-[9px] text-gray-500 mt-0.5">${buff}</div>
      </div>
    </div>
  `;

  card.onclick = () => showUnitDetailModal(unit);
  return card;
}

function showUnitDetailModal(unit) {
  const modal = document.createElement("div");
  modal.className = "fixed inset-0 bg-black/80 flex items-center justify-center z-[100002]";
  modal.innerHTML = `
    <div class="bg-zinc-900 rounded-3xl max-w-sm w-full p-8 border-4 ${unit.isPlayer ? 'border-emerald-500' : 'border-red-500'}">
      <div class="flex justify-between mb-6">
        <div class="font-bold text-xl">${unit.name}</div>
        <button onclick="this.closest('.fixed').remove()" class="text-3xl">×</button>
      </div>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>生命: <span class="font-bold">${unit.hp}/${unit.maxHp}</span></div>
        <div>攻击: <span class="font-bold">${unit.atk}</span></div>
        <div>防御: <span class="font-bold">${unit.def}</span></div>
        <div>速度: <span class="font-bold">${unit.spd}</span></div>
        <div>暴击率: <span class="font-bold">${(unit.critRate*100).toFixed(1)}%</span></div>
        <div>暴击伤: <span class="font-bold">${(unit.critDamage*100).toFixed(0)}%</span></div>
      </div>
      <div class="mt-6 text-xs text-gray-400">元素属性: ${unit.elementType}</div>
      <div class="mt-4 text-center">
        <button onclick="this.closest('.fixed').remove()" class="px-10 py-2 bg-zinc-700 rounded-2xl">关闭</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function addBattleLog(msg, type = "normal") {
  battleState.log.push({ msg, type });
  if (battleState.log.length > 30) battleState.log.shift();
  const logEl = document.getElementById("battleLog");
  if (logEl) {
    logEl.innerHTML = battleState.log.slice(-15).map(l => 
      `<div class="mb-0.5 ${l.type === 'player' ? 'text-emerald-300' : l.type === 'enemy' ? 'text-red-300' : 'text-gray-400'}">${l.msg}</div>`
    ).join("");
    logEl.scrollTop = logEl.scrollHeight;
  }
}

function endBattle(playerWin) {
  battleState.isRunning = false;
  const modal = battleState.battleModal;
  if (!modal) return;

  let reward = "";
  if (playerWin) {
    const gold = Math.floor(800 + battleState.currentBigTurn * 120);
    const yao = Math.floor(120 + battleState.currentBigTurn * 18);
    player.gold = (player.gold || 0) + gold;
    player.yaoXing = (player.yaoXing || 0) + yao;
    document.getElementById("gold").textContent = player.gold;
    document.getElementById("yaoXing").textContent = player.yaoXing;
    window.saveGame();
    reward = `<div class="text-emerald-400 mt-4">获得 ${gold} 金币 + ${yao} 耀星</div>`;
  }

  modal.innerHTML = `
    <div class="fixed inset-0 bg-black/95 flex items-center justify-center">
      <div class="bg-zinc-900 rounded-3xl max-w-md w-full p-10 text-center border-4 ${playerWin ? 'border-emerald-500' : 'border-red-500'}">
        <div class="text-7xl mb-6">${playerWin ? "🏆" : "☠️"}</div>
        <h2 class="text-4xl font-bold mb-4 ${playerWin ? 'text-emerald-400' : 'text-red-400'}">${playerWin ? "胜利！" : "失败..."}</h2>
        <div class="text-gray-300">战斗持续了 ${battleState.currentBigTurn} 个大回合</div>
        ${reward}
        <div class="flex gap-4 mt-8">
          <button onclick="restartBattle()" class="flex-1 py-4 bg-emerald-600 rounded-2xl text-lg font-bold">再来一局</button>
          <button onclick="closeBattleModal()" class="flex-1 py-4 bg-zinc-700 rounded-2xl text-lg font-bold">返回</button>
        </div>
      </div>
    </div>
  `;
}

function restartBattle() {
  closeBattleModal();
  setTimeout(() => startBattle(battleState.playerTeam), 300);
}

function closeBattleModal() {
  battleState.isRunning = false;
  document.getElementById("battleModal")?.remove();
  battleState.battleModal = null;
}

// 暴露
window.startBattle = startBattle;
window.showBattleModal = showBattleModal;

console.log("%c✅ 全新战斗模块 v2.0 已加载（严格遵循新设计）", "color:#22c55e");
