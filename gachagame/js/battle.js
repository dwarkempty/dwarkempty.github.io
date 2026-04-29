// js/battle.js - 完整战斗系统（行动值回合制 + 能量机制 + 防御公式）
// 设计完全遵循用户规格：行动值=10000/速度，每回合150行动值预算，防御减免公式，能量点5上限+每回合+1

let battleState = {
  playerTeam: [],
  enemyTeam: [],
  allUnits: [],
  currentAV: {},      
  turn: 0,
  log: [],
  isRunning: false,
  speed: 1,           
  selectedTarget: null,
  battleModal: null,
  pendingSkillUnit: null,   // 当前等待手动选择技能的单位
  isManualMode: true        // 开启手动技能选择
};

// ==================== 工具函数 ====================
function getCategoryPriority(category) {
  if (category === "近卫") return 3;
  if (category === "辅助") return 2;
  return 1; // 强袭
}

function calculateActionValue(spd) {
  return 10000 / spd;
}

function calculateDamageReduction(def) {
  return 1 - 4000 / (4000 + def);
}

// ==================== 高级伤害计算系统（符合用户新公式） ====================
function calculateDamage(attacker, target, skillMultiplier = 1.0, isCrit = false, extra = {}) {
  // 1. 基础攻击 + 加成攻击值
  let baseAtk = attacker.atk || 0;
  let bonusAtk = extra.bonusAtk || 0;
  let totalAtk = baseAtk + bonusAtk;
  
  // 2. 攻击加成倍率（百分比）
  let atkPercent = (extra.atkPercent || 0) + (attacker.atkPercentBuff || 0);
  
  // 3. 技能倍率
  let skillMult = skillMultiplier;
  
  // 4. 增伤加成区间（元素增伤、全伤加成等）
  let dmgBonus = (extra.dmgBonus || 0) + (attacker.dmgBonus || 0);
  
  // 5. 暴击加成
  let critMult = 1.0;
  let finalIsCrit = isCrit;
  
  const critRate = (attacker.critRate || 0.05) + (extra.critRateBonus || 0);
  if (!finalIsCrit && Math.random() < critRate) {
    finalIsCrit = true;
  }
  
  if (finalIsCrit) {
    const critDmg = (attacker.critDamage || 0.5) + (extra.critDmgBonus || 0);
    critMult = 1 + critDmg;
  }
  
  // 总出伤公式
  let outgoing = totalAtk * (1 + atkPercent) * skillMult * (1 + dmgBonus) * critMult;
  
  // 6. 防御减伤倍率
  let defReduction = calculateDamageReduction(target.def || 0);
  
  // 7. 额外减伤倍率（来自debuff等）
  let dmgReduction = extra.dmgReduction || 0;
  if (target.defenseShredTurns > 0) {
    defReduction = Math.min(0.8, defReduction + 0.15); // 元素凝视15%防御降低
  }
  
  // 总受伤
  let finalDamage = outgoing * (1 - defReduction) * (1 - dmgReduction);
  
  // 神子永辉 / 绚明崩解 等无视防御
  if (attacker.ignoreDefense || target.lingeringCollapseActive) {
    finalDamage = outgoing * (1 - dmgReduction); // 忽略防御减免
  }
  
  return {
    damage: Math.max(1, Math.floor(finalDamage)),
    isCrit: finalIsCrit,
    breakdown: {
      totalAtk, atkPercent, skillMult, dmgBonus, critMult, defReduction
    }
  };
}

function calculateFinalDamage(baseDamage, attacker, target, isCrit = false) {
  const dr = calculateDamageReduction(target.def || 0);
  let dmg = baseDamage * (1 - dr);
  
  if (isCrit) {
    dmg *= (1 + (attacker.critDamage || 0.5));
  }
  
  // 暴击率检查
  const critRate = attacker.critRate || 0.05;
  const actualCrit = isCrit || (Math.random() < critRate);
  if (actualCrit && !isCrit) {
    dmg *= (1 + (attacker.critDamage || 0.5));
  }
  
  return Math.max(1, Math.floor(dmg));
}

// ==================== 单位创建 ====================
function createBattleUnit(charData, level = 1, stars = 0, isPlayer = true, equippedWeapon = null) {
  const stats = window.calculateStats 
    ? window.calculateStats({ level, stars, equippedWeapon: equippedWeapon ? { level: 1, stars: 0 } : null }, charData, equippedWeapon)
    : {
        hp: charData.baseHP,
        atk: charData.baseATK,
        def: charData.baseDEF,
        spd: charData.baseSPD,
        critRate: 0.05,
        critDamage: 0.5
      };

  const unit = {
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
    
    actionValue: calculateActionValue(stats.spd),
    currentAV: calculateActionValue(stats.spd),
    
    energy: 3,           // 技能点
    maxEnergy: 5,
    ultimateEnergy: 0,   // 终结能量
    maxUltimate: 100,
    
    isPlayer: isPlayer,
    isAlive: true,
    buffs: [],
    debuffs: [],
    
    // 引用原始数据用于技能描述
    charData: charData,
    level: level,
    stars: stars
  };
  
  return unit;
}

// ==================== 敌人生成（可扩展） ====================
function generateEnemyTeam(playerAvgLevel = 30, count = 3) {
  const enemyPool = [
    { name: "森林史莱姆", rarity: "R", category: "强袭", baseHP: 280, baseATK: 180, baseDEF: 120, baseSPD: 95, image: "images/Allen_Illustration.jpg" },
    { name: "岩石傀儡", rarity: "SR", category: "近卫", baseHP: 520, baseATK: 140, baseDEF: 280, baseSPD: 85, image: "images/Buck_Illustration.jpg" },
    { name: "暗影刺客", rarity: "SR", category: "强袭", baseHP: 320, baseATK: 260, baseDEF: 110, baseSPD: 135, image: "images/Shadowblade_Illustration.jpg" },
    { name: "雷鸣骑士", rarity: "SSR", category: "强袭", baseHP: 480, baseATK: 310, baseDEF: 180, baseSPD: 122, image: "images/Sorey_Illustration.jpg" },
    { name: "星辰魔导师", rarity: "SSR", category: "辅助", baseHP: 420, baseATK: 220, baseDEF: 200, baseSPD: 118, image: "images/Sylvia_Illustration.jpg" }
  ];
  
  const enemies = [];
  for (let i = 0; i < count; i++) {
    const template = enemyPool[Math.floor(Math.random() * enemyPool.length)];
    const level = Math.max(10, playerAvgLevel - 5 + Math.floor(Math.random() * 15));
    const stars = Math.floor(Math.random() * 3);
    
    const enemyData = {
      ...template,
      id: 999 + i,
      name: template.name + (i > 0 ? ` #${i+1}` : "")
    };
    
    const unit = createBattleUnit(enemyData, level, stars, false);
    // 敌人稍微加强一点
    unit.maxHp = Math.floor(unit.maxHp * 1.15);
    unit.hp = unit.maxHp;
    unit.atk = Math.floor(unit.atk * 1.1);
    enemies.push(unit);
  }
  return enemies;
}

// ==================== 战斗初始化 ====================
function startBattle(selectedChars = null) {
  if (!selectedChars) {
    // 默认取前4个最高等级角色
    const owned = [...player.owned].sort((a, b) => {
      const da = window.getCharacterData(a.charId);
      const db = window.getCharacterData(b.charId);
      return (b.level * 10 + b.stars) - (a.level * 10 + a.stars);
    }).slice(0, 4);
    
    selectedChars = owned.map(item => {
      const data = window.getCharacterData(item.charId);
      let equipped = null;
      if (item.equippedWeapon) {
        equipped = player.weapons.find(w => w.id === item.equippedWeapon);
      }
      return createBattleUnit(data, item.level, item.stars, true, equipped);
    });
  }
  
  if (selectedChars.length === 0) {
    // 新玩家自动给予演示队伍（前4个角色，Lv.20）
    console.log("%c[战斗系统] 新玩家检测到，自动创建演示队伍...", "color:#fbbf24");
    const demoChars = window.characterPool.slice(0, 4);
    selectedChars = demoChars.map((charData, idx) => {
      return createBattleUnit(charData, 20 + idx * 5, 1, true, null);
    });
    alert("已为你自动创建演示队伍（Lv.20~35）！\n实际游戏中请先抽卡获得角色。");
  }
  
  battleState.playerTeam = selectedChars;
  const avgLevel = selectedChars.reduce((sum, u) => sum + u.level, 0) / selectedChars.length;
  battleState.enemyTeam = generateEnemyTeam(Math.floor(avgLevel), Math.min(4, Math.max(2, selectedChars.length)));
  
  battleState.allUnits = [...battleState.playerTeam, ...battleState.enemyTeam];
  battleState.log = [];
  battleState.turn = 0;
  battleState.isRunning = true;
  battleState.selectedTarget = null;
  battleState.pendingSkillUnit = null;
  
  // 初始化当前行动值 + 重置所有状态
  battleState.allUnits.forEach(u => {
    u.currentAV = u.actionValue;
    u.hp = u.maxHp;
    u.energy = 3;
    u.ultimateEnergy = 0;
    u.isAlive = true;
    u.buffs = [];
    u.debuffs = [];
    u.sparkleMarks = 0;
    u.lingeringCollapseTurns = 0;
    u.lingeringCollapseActive = false;
    u.defenseShredTurns = 0;
    u.godModeTurns = 0;
    u.atkPercentBuff = 0;
    u.atkBuffTurns = 0;
    u.ignoreDefense = false;
    u.elementDmgBonus = 0;
    u.ultEnergyThisTurn = 0;
  });
  
  // 打开战斗界面
  showBattleModal();
  
  // 延迟开始第一回合
  setTimeout(() => {
    addBattleLog("⚔️ 战斗开始！", "system");
    processNextTurn();
  }, 600);
}

// ==================== 战斗主循环 ====================
function processNextTurn() {
  if (!battleState.isRunning) return;
  
  // 检查胜负
  const alivePlayers = battleState.playerTeam.filter(u => u.isAlive);
  const aliveEnemies = battleState.enemyTeam.filter(u => u.isAlive);
  
  if (alivePlayers.length === 0) {
    endBattle(false);
    return;
  }
  if (aliveEnemies.length === 0) {
    endBattle(true);
    return;
  }
  
  // 找出当前行动值最小的单位
  let actor = null;
  let minAV = Infinity;
  
  battleState.allUnits.forEach(u => {
    if (!u.isAlive) return;
    if (u.currentAV < minAV) {
      minAV = u.currentAV;
      actor = u;
    } else if (u.currentAV === minAV) {
      // 同行动值优先级
      if (u.isPlayer && !actor.isPlayer) {
        actor = u;
      } else if (u.isPlayer === actor.isPlayer) {
        if (getCategoryPriority(u.category) > getCategoryPriority(actor.category)) {
          actor = u;
        }
      }
    }
  });
  
  if (!actor) {
    console.error("No actor found");
    return;
  }
  
  // 执行行动
  executeAction(actor);
  
  // 推进时间（减去该单位的行动值）
  battleState.allUnits.forEach(u => {
    if (u.isAlive) {
      u.currentAV -= actor.actionValue;
    }
  });
  
  // 每回合自然回复能量（当有单位行动时）
  if (actor.isPlayer) {
    battleState.playerTeam.forEach(u => {
      if (u.isAlive && u.energy < u.maxEnergy) u.energy++;
    });
  } else {
    battleState.enemyTeam.forEach(u => {
      if (u.isAlive && u.energy < u.maxEnergy) u.energy++;
    });
  }
  
  battleState.turn++;
  
  // 处理持续效果（绚明崩解、防御降低、神子永辉等）
  processEndOfTurnEffects();
  
  // 更新UI
  updateBattleUI();
  
  // 继续下一行动（带速度控制）
  const delay = Math.max(200, 800 / battleState.speed);
  setTimeout(() => {
    if (battleState.isRunning) processNextTurn();
  }, delay);
}

// 行动后推进时间（必须调用！）
function advanceTimeAfterAction(actor) {
  if (!actor || !actor.actionValue) return;
  
  battleState.allUnits.forEach(u => {
    if (u.isAlive) {
      u.currentAV -= actor.actionValue;
    }
  });
  
  // 防止行动值过度负数（保持相对顺序，同时让数字好看）
  const minAV = Math.min(...battleState.allUnits.filter(u => u.isAlive).map(u => u.currentAV));
  if (minAV < -100) {
    const adjust = Math.ceil(-minAV / 50) * 50; // 每次调整到合理范围
    battleState.allUnits.forEach(u => {
      if (u.isAlive) u.currentAV += adjust;
    });
  }
}

// 处理回合结束效果
function processEndOfTurnEffects() {
  battleState.allUnits.forEach(unit => {
    if (!unit.isAlive) return;
    
    // 绚明崩解：每回合自动触发印记伤害（无视防御）
    if (unit.lingeringCollapseTurns > 0 && unit.lingeringCollapseActive) {
      const markStacks = unit.sparkleMarks || 0;
      if (markStacks > 0) {
        const dmg = Math.floor(markStacks * (unit.atk || 200) * 0.8);
        unit.hp = Math.max(0, unit.hp - dmg);
        addBattleLog(`🌋 绚明崩解触发！${unit.name} 受到 <span class="text-red-400">${dmg}</span> 无视防御伤害`, "enemy");
      }
      unit.lingeringCollapseTurns--;
      if (unit.lingeringCollapseTurns <= 0) {
        unit.lingeringCollapseActive = false;
        addBattleLog(`🌋 ${unit.name} 的绚明崩解状态结束`, "system");
      }
    }
    
    // 防御降低持续时间
    if (unit.defenseShredTurns > 0) {
      unit.defenseShredTurns--;
      if (unit.defenseShredTurns === 0) {
        addBattleLog(`🛡️ ${unit.name} 的元素凝视效果结束`, "system");
      }
    }
    
    // 攻击力提升持续时间
    if (unit.atkBuffTurns > 0) {
      unit.atkBuffTurns--;
      if (unit.atkBuffTurns === 0 && unit.atkPercentBuff) {
        unit.atkPercentBuff = Math.max(0, unit.atkPercentBuff - 0.25);
        addBattleLog(`⚡ ${unit.name} 的攻击力提升效果结束`, "system");
      }
    }
    
    // 神子永辉持续
    if (unit.godModeTurns > 0) {
      unit.godModeTurns--;
      if (unit.godModeTurns === 0) {
        unit.ignoreDefense = false;
        addBattleLog(`🌟 ${unit.name} 的神子永辉状态结束`, "system");
      }
    }
  });
}

// ==================== 手动技能选择 + 阿特亚完整技能实现 ====================
function executeAction(unit) {
  if (!unit.isAlive) return;
  
  const isPlayer = unit.isPlayer;
  const aliveEnemies = battleState.enemyTeam.filter(e => e.isAlive);
  const aliveAllies = (isPlayer ? battleState.playerTeam : battleState.enemyTeam).filter(a => a.isAlive);
  
  if (aliveEnemies.length === 0 || aliveAllies.length === 0) return;
  
  // 仅手动战斗：我方角色必须手动选择技能
  if (isPlayer) {
    if (!battleState.pendingSkillUnit) {
      battleState.pendingSkillUnit = unit;
      showSkillSelectionUI(unit);
    }
    return;
  }
  
  // 敌人保持自动AI
  let skillType = "normal";
  let target = aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
  
  const canSkill = unit.energy >= 2;
  const canUlt = unit.ultimateEnergy >= 70;
  if (canUlt && Math.random() > 0.6) skillType = "ultimate";
  else if (canSkill && Math.random() > 0.4) skillType = "skill1";
  
  useSkill(unit, skillType, target);
}

// 显示技能选择UI（手动战斗核心）
function showSkillSelectionUI(unit) {
  // 暂停战斗循环
  battleState.isRunning = false;
  
  const skillBar = document.createElement("div");
  skillBar.id = "skillSelectionBar";
  skillBar.className = `fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900/95 border-2 border-emerald-500 rounded-3xl px-8 py-5 flex gap-4 z-[100001] shadow-2xl`;
  
  const isAtya = unit.name.includes("阿特亚");
  
  let html = `
    <div class="flex flex-col items-center mr-4">
      <div class="text-emerald-400 text-sm mb-1">当前行动</div>
      <div class="font-bold">${unit.name}</div>
      <div class="text-xs text-gray-400">能量 ${unit.energy}/5 | 终结 ${unit.ultimateEnergy}</div>
    </div>
  `;
  
  if (isAtya) {
    // 阿特亚：完整技能组
    html += `<button onclick="selectSkillAndExecute('${unit.id}', 'normal')" class="skill-btn px-6 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl text-center min-w-[110px]">
      <div class="text-lg">普攻</div>
      <div class="text-xs text-gray-400">0能量</div>
    </button>`;
    
    html += `<button onclick="selectSkillAndExecute('${unit.id}', 'skill1')" class="skill-btn px-6 py-4 bg-blue-900 hover:bg-blue-800 rounded-2xl text-center min-w-[110px]">
      <div class="text-lg">战技</div>
      <div class="text-xs text-gray-400">2能量</div>
    </button>`;
    
    html += `<button onclick="selectSkillAndExecute('${unit.id}', 'skill2')" class="skill-btn px-6 py-4 bg-purple-900 hover:bg-purple-800 rounded-2xl text-center min-w-[110px]">
      <div class="text-lg">绚律易质</div>
      <div class="text-xs text-gray-400">2能量</div>
    </button>`;
    
    const ultDisabled = unit.ultimateEnergy < 80 ? 'opacity-50 cursor-not-allowed' : '';
    html += `<button onclick="selectSkillAndExecute('${unit.id}', 'ultimate')" class="skill-btn px-6 py-4 bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-2xl text-center min-w-[110px] ${ultDisabled}">
      <div class="text-lg font-bold">终结技</div>
      <div class="text-xs">80能量</div>
    </button>`;
  } else {
    // 其他角色：仅普攻（后续可扩展）
    html += `<button onclick="selectSkillAndExecute('${unit.id}', 'normal')" class="skill-btn px-8 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl text-center min-w-[140px]">
      <div class="text-lg">普攻</div>
      <div class="text-xs text-gray-400">0能量</div>
    </button>`;
    
    html += `<div class="px-4 py-2 text-xs text-gray-500 self-center">其他技能<br>开发中</div>`;
  }
  
  html += `<button onclick="cancelSkillSelection()" class="skill-btn px-5 py-4 bg-zinc-700 hover:bg-zinc-600 rounded-2xl text-sm">取消</button>`;
  
  skillBar.innerHTML = html;
  document.body.appendChild(skillBar);
}

window.selectSkillAndExecute = function(unitId, skillType) {
  const unit = battleState.allUnits.find(u => u.id == unitId);
  if (!unit) return;
  
  // 移除技能条
  document.getElementById("skillSelectionBar")?.remove();
  
  // 选择目标
  const aliveEnemies = battleState.enemyTeam.filter(e => e.isAlive);
  let target = aliveEnemies[0];
  
  try {
    useSkill(unit, skillType, target);
  } catch (e) {
    console.error("Skill execution error:", e);
    addBattleLog("技能执行出错，已跳过", "system");
  }
  
  // 恢复战斗循环
  battleState.pendingSkillUnit = null;
  battleState.isRunning = true;
  
  // 推进时间
  advanceTimeAfterAction(unit);
  
  setTimeout(() => processNextTurn(), 300);
};

window.cancelSkillSelection = function() {
  document.getElementById("skillSelectionBar")?.remove();
  battleState.pendingSkillUnit = null;
  battleState.isRunning = true;
  addBattleLog("已取消技能选择", "system");
  setTimeout(() => processNextTurn(), 200);
};

// ==================== 核心技能执行函数（完整实现阿特亚） ====================
function useSkill(unit, skillType, target) {
  if (!unit.isAlive || !target) return;
  
  const isAtya = unit.name.includes("阿特亚");
  let result = { damage: 0, log: "" };
  
  // 重置本回合终结能量计数
  unit.ultEnergyThisTurn = unit.ultEnergyThisTurn || 0;
  
  if (skillType === "normal") {
    // ========== 普攻 ==========
    if (isAtya) {
      // 阿特亚普攻：绚光初绽
      const mainDmg = calculateDamage(unit, target, 1.1).damage;
      target.hp = Math.max(0, target.hp - mainDmg);
      result.damage = mainDmg;
      result.log = `绚光初绽 → ${target.name} <span class="text-red-400">${mainDmg}</span>`;
      
      // 50%概率附加印记
      if (Math.random() < 0.5) addSparkleMark(target, 1, unit);
      
      // 溅射到周围两个敌人
      const others = battleState.enemyTeam.filter(e => e.isAlive && e.id !== target.id);
      others.slice(0, 2).forEach(enemy => {
        const splash = calculateDamage(unit, enemy, 0.8).damage;
        enemy.hp = Math.max(0, enemy.hp - splash);
        if (Math.random() < 0.3) addSparkleMark(enemy, 1, unit);
      });
      
      // 被动触发
      addSparkleMark(target, 0, unit); // 触发被动（stacks=0只触发效果）
      
    } else {
      // 普通角色普攻
      const dmg = calculateDamage(unit, target, 1.0).damage;
      target.hp = Math.max(0, target.hp - dmg);
      result.damage = dmg;
      result.log = `普攻 → ${target.name} <span class="text-red-400">${dmg}</span>`;
    }
    
    unit.ultimateEnergy = Math.min(unit.maxUltimate || 100, unit.ultimateEnergy + 8);
    
  } else if (skillType === "skill1") {
    // ========== 战技1 ==========
    if (isAtya) {
      // 万象绚华
      if (unit.energy < 2) { addBattleLog("能量不足！", "system"); return; }
      unit.energy -= 2;
      
      let totalDmg = 0;
      battleState.enemyTeam.filter(e => e.isAlive).forEach(enemy => {
        const dmg = calculateDamage(unit, enemy, 2.2).damage;
        enemy.hp = Math.max(0, enemy.hp - dmg);
        totalDmg += dmg;
        addSparkleMark(enemy, 3, unit);
      });
      
      result.damage = totalDmg;
      result.log = `万象绚华！全体造成 <span class="text-red-400">${totalDmg}</span> 伤害 + 3层印记`;
      
      // 检查是否有敌人≥6层 → 元素凝视
      const hasHighMark = battleState.enemyTeam.some(e => (e.sparkleMarks || 0) >= 6);
      if (hasHighMark) {
        battleState.enemyTeam.forEach(e => {
          if (e.isAlive) e.defenseShredTurns = 2;
        });
        addBattleLog(`✨ 元素凝视触发！敌方全体防御降低15%（2回合）`, "player");
      }
      
    } else {
      // 普通战技
      if (unit.energy < 1) return;
      unit.energy -= 1;
      const dmg = calculateDamage(unit, target, 1.8).damage;
      target.hp = Math.max(0, target.hp - dmg);
      result.damage = dmg;
      result.log = `战技 → ${target.name} <span class="text-red-400">${dmg}</span>`;
    }
    
    unit.ultimateEnergy = Math.min(unit.maxUltimate || 100, unit.ultimateEnergy + 15);
    
  } else if (skillType === "skill2" && isAtya) {
    // ========== 阿特亚专属战技2：绚律易质 ==========
    if (unit.energy < 2) { addBattleLog("能量不足！", "system"); return; }
    unit.energy -= 2;
    
    const baseDmg = calculateDamage(unit, target, 3.4).damage;
    target.hp = Math.max(0, target.hp - baseDmg);
    
    // 引爆所有印记
    const explodeDmg = explodeSparkleMarks(target, target.sparkleMarks || 0, unit);
    
    result.damage = baseDmg + explodeDmg;
    result.log = `绚律易质！${target.name} 受到 <span class="text-red-400">${baseDmg + explodeDmg}</span> 伤害`;
    
    // 回复35点终结能量 + 攻击力提升25%（2回合）
    unit.ultimateEnergy = Math.min(unit.maxUltimate || 100, unit.ultimateEnergy + 35);
    unit.atkPercentBuff = (unit.atkPercentBuff || 0) + 0.25;
    unit.atkBuffTurns = 2;
    
    addBattleLog(`⚡ 攻击力提升25%（2回合） + 回复35终结能量`, "player");
    
  } else if (skillType === "ultimate") {
    // ========== 终结技 ==========
    if (unit.ultimateEnergy < 80) { addBattleLog("终结能量不足！", "system"); return; }
    unit.ultimateEnergy = 0;
    
    if (isAtya) {
      // 万般绚明
      let totalDmg = 0;
      const markBonus = battleState.enemyTeam.reduce((sum, e) => sum + (e.sparkleMarks || 0), 0) * 0.8;
      
      battleState.enemyTeam.filter(e => e.isAlive).forEach(enemy => {
        const markDmg = (enemy.sparkleMarks || 0) * unit.atk * 0.8;
        const base = calculateDamage(unit, enemy, 7.0).damage;
        const final = base + markDmg;
        enemy.hp = Math.max(0, enemy.hp - final);
        totalDmg += final;
      });
      
      result.damage = totalDmg;
      result.log = `万般绚明！造成 <span class="text-red-400">${totalDmg}</span> 毁灭性伤害`;
      
      // 绚明崩解
      applyLingeringCollapse(battleState.enemyTeam.filter(e => e.isAlive), 2);
      
      // 进入神子永辉
      applyGodMode(unit, 1);
      unit.atkPercentBuff = (unit.atkPercentBuff || 0) + 0.30;
      
    } else {
      const dmg = calculateDamage(unit, target, 4.0, true).damage;
      target.hp = Math.max(0, target.hp - dmg);
      result.damage = dmg;
      result.log = `终结技！${target.name} 受到 <span class="text-red-400">${dmg}</span> 伤害`;
    }
  }
  
  // 关键：无论手动还是自动，都必须推进时间
  advanceTimeAfterAction(unit);
  
  // 通用：检查死亡
  battleState.allUnits.forEach(u => {
    if (u.hp <= 0) u.isAlive = false;
  });
  
  addBattleLog(result.log, unit.isPlayer ? "player" : "enemy");
  
  // 更新UI
  updateBattleUI();
}

// ==================== 绚明印记 & 效果系统 ====================
function addSparkleMark(target, stacks = 1, source = null) {
  if (!target.sparkleMarks) target.sparkleMarks = 0;
  
  const oldStacks = target.sparkleMarks;
  target.sparkleMarks = Math.min(8, target.sparkleMarks + stacks);
  
  // 超出8层自动引爆
  if (target.sparkleMarks > 8) {
    const explodeStacks = target.sparkleMarks - 8;
    target.sparkleMarks = 8;
    explodeSparkleMarks(target, explodeStacks, source);
  }
  
  // 被动：附加印记瞬间触发一次伤害 + 提升自身元素伤害 + 回复终结能量
  if (source && source.name.includes("阿特亚")) {
    // 立即触发一次印记伤害
    const tickDamage = Math.floor(source.atk * 0.5);
    target.hp = Math.max(0, target.hp - tickDamage);
    addBattleLog(`✨ 绚明印记触发！${target.name} 受到 <span class="text-orange-400">${tickDamage}</span> 元素伤害`, "crit");
    
    // 提升自身10%元素伤害（最多3层）
    if (!source.elementDmgBonus) source.elementDmgBonus = 0;
    source.elementDmgBonus = Math.min(0.3, source.elementDmgBonus + 0.1);
    
    // 回复终结能量（每回合最多30点）
    if (!source.ultEnergyThisTurn) source.ultEnergyThisTurn = 0;
    if (source.ultEnergyThisTurn < 30) {
      const gain = Math.min(5, 30 - source.ultEnergyThisTurn);
      source.ultimateEnergy = Math.min(source.maxUltimate || 100, source.ultimateEnergy + gain);
      source.ultEnergyThisTurn += gain;
    }
  }
  
  return target.sparkleMarks;
}

function explodeSparkleMarks(target, stacks, source = null) {
  if (!target.sparkleMarks || stacks <= 0) return 0;
  
  const explodeDamage = Math.floor((source?.atk || 300) * 0.8 * stacks);
  target.hp = Math.max(0, target.hp - explodeDamage);
  
  addBattleLog(`💥 绚明印记引爆！${target.name} 受到 <span class="text-red-400 font-bold">${explodeDamage}</span> 爆炸伤害（${stacks}层）`, "crit");
  
  target.sparkleMarks = 0;
  return explodeDamage;
}

function applyGodMode(unit, turns = 1) {
  unit.godModeTurns = (unit.godModeTurns || 0) + turns;
  unit.ignoreDefense = true;
  addBattleLog(`🌟 ${unit.name} 进入【神子永辉】状态！攻击力+30%，所有伤害无视防御`, "player");
}

function applyLingeringCollapse(targets, turns = 2) {
  targets.forEach(t => {
    t.lingeringCollapseTurns = turns;
    t.lingeringCollapseActive = true;
  });
  addBattleLog(`🌋 敌方全体进入【绚明崩解】状态！后续2回合自动受到印记伤害（无视防御）`, "enemy");
}

// ==================== UI 相关 ====================
function showBattleModal() {
  const modalHTML = `
    <div id="battleModal" class="fixed inset-0 bg-black/95 flex items-center justify-center z-[99999] p-2">
      <div class="bg-zinc-900 rounded-3xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden border-4 border-orange-500">
        
        <!-- 顶部信息栏 -->
        <div class="flex justify-between items-center px-6 py-4 bg-zinc-950 border-b border-zinc-700">
          <div class="flex items-center gap-4">
            <div class="text-2xl font-bold text-orange-400">⚔️ 战斗中</div>
            <div class="text-sm text-gray-400">回合 <span id="battleTurn">0</span></div>
          </div>
          
          <div class="flex items-center gap-3">
            <button onclick="battleState.speed = Math.max(0.5, battleState.speed - 0.5); updateBattleUI()" 
                    class="px-4 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm">慢</button>
            <div class="text-emerald-400 font-bold w-12 text-center" id="battleSpeed">1.0x</div>
            <button onclick="battleState.speed = Math.min(4, battleState.speed + 0.5); updateBattleUI()" 
                    class="px-4 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm">快</button>
            
            <button onclick="pauseBattle()" class="px-5 py-2 bg-amber-600 hover:bg-amber-700 rounded-2xl text-sm font-bold">暂停</button>
            <button onclick="endBattle(false)" class="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-2xl text-sm font-bold">投降</button>
          </div>
        </div>
        
        <!-- 战场区域 -->
        <div class="flex-1 flex p-4 gap-4 overflow-hidden">
          
          <!-- 玩家队伍 -->
          <div class="flex-1 bg-zinc-950 rounded-3xl p-4 border border-emerald-500/50">
            <div class="text-emerald-400 text-lg font-bold mb-3 flex items-center gap-2">
              <i class="fas fa-shield-alt"></i> 我方队伍
            </div>
            <div id="playerUnits" class="grid grid-cols-2 gap-3"></div>
          </div>
          
          <!-- 行动顺序栏（新增） -->
          <div class="w-52 bg-zinc-950 rounded-3xl p-4 border border-yellow-500/50 flex-shrink-0">
            <div class="text-yellow-400 text-sm font-bold mb-3 flex items-center gap-2">
              <i class="fas fa-clock"></i> 下回合行动顺序
            </div>
            <div id="actionOrderList" class="text-xs space-y-1"></div>
          </div>
          
          <!-- 敌方队伍 -->
          <div class="flex-1 bg-zinc-950 rounded-3xl p-4 border border-red-500/50">
            <div class="text-red-400 text-lg font-bold mb-3 flex items-center gap-2">
              <i class="fas fa-skull"></i> 敌方队伍
            </div>
            <div id="enemyUnits" class="grid grid-cols-2 gap-3"></div>
          </div>
          
        </div>
        
        <!-- 行动日志 -->
        <div class="h-48 bg-black/60 border-t border-zinc-700 p-4 overflow-auto font-mono text-sm" id="battleLog">
          <div class="text-emerald-400">战斗日志...</div>
        </div>
        
        <!-- 底部控制 -->
        <div class="px-6 py-4 bg-zinc-950 border-t border-zinc-700 flex justify-between items-center">
          <div class="text-xs text-gray-500">行动值系统：速度越快行动越频繁 | 防御减免 = 1 - 4000/(4000+防御)</div>
          <button onclick="closeBattleModal()" class="px-8 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-2xl text-sm">退出战斗</button>
        </div>
        
      </div>
    </div>
  `;
  
  // 移除旧的
  const old = document.getElementById("battleModal");
  if (old) old.remove();
  
  const div = document.createElement("div");
  div.innerHTML = modalHTML;
  document.body.appendChild(div.firstElementChild);
  
  battleState.battleModal = document.getElementById("battleModal");
  
  updateBattleUI();
}

function updateBattleUI() {
  if (!battleState.battleModal) return;
  
  // 更新回合数
  const turnEl = document.getElementById("battleTurn");
  if (turnEl) turnEl.textContent = battleState.turn;
  
  // 更新速度
  const speedEl = document.getElementById("battleSpeed");
  if (speedEl) speedEl.textContent = battleState.speed.toFixed(1) + "x";
  
  // 渲染我方单位（强制清空）
  const playerContainer = document.getElementById("playerUnits");
  if (playerContainer) {
    playerContainer.innerHTML = "";
    battleState.playerTeam.forEach(unit => {
      const el = createUnitCard(unit, true);
      playerContainer.appendChild(el);
    });
  }
  
  // 渲染敌方单位（强制清空）
  const enemyContainer = document.getElementById("enemyUnits");
  if (enemyContainer) {
    enemyContainer.innerHTML = "";
    battleState.enemyTeam.forEach(unit => {
      const el = createUnitCard(unit, false);
      enemyContainer.appendChild(el);
    });
  }
  
  // 渲染行动顺序栏（新增）
  const orderContainer = document.getElementById("actionOrderList");
  if (orderContainer) {
    const aliveUnits = battleState.allUnits.filter(u => u.isAlive);
    // 按当前行动值从小到大排序（越小越先行动）
    const sorted = [...aliveUnits].sort((a, b) => a.currentAV - b.currentAV).slice(0, 6);
    
    orderContainer.innerHTML = sorted.map((u, idx) => {
      const isPlayer = u.isPlayer;
      const color = isPlayer ? 'text-emerald-400' : 'text-red-400';
      const avDisplay = u.currentAV <= 0 ? 'Ready!' : u.currentAV.toFixed(0);
      const mark = u.sparkleMarks > 0 ? ` <span class="text-orange-400">★${u.sparkleMarks}</span>` : '';
      return `<div class="${color} flex justify-between"><span>${idx+1}. ${u.name}</span><span class="text-gray-500">${avDisplay}${mark}</span></div>`;
    }).join('');
  }
  
  // 更新日志
  const logContainer = document.getElementById("battleLog");
  if (logContainer && battleState.log.length > 0) {
    logContainer.innerHTML = battleState.log.slice(-12).map(l => 
      `<div class="mb-1 ${l.type === 'player' ? 'text-emerald-300' : l.type === 'enemy' ? 'text-red-300' : l.type === 'crit' ? 'text-yellow-400 font-bold' : l.type === 'heal' ? 'text-emerald-400' : 'text-gray-400'}">${l.msg}</div>`
    ).join("");
    logContainer.scrollTop = logContainer.scrollHeight;
  }
}

function createUnitCard(unit, isPlayer) {
  const hpPercent = Math.max(0, Math.floor((unit.hp / unit.maxHp) * 100));
  const energyPercent = Math.floor((unit.energy / unit.maxEnergy) * 100);
  const ultPercent = Math.floor((unit.ultimateEnergy / unit.maxUltimate) * 100);
  
  const card = document.createElement("div");
  card.className = `relative bg-zinc-900 rounded-2xl p-3 border ${unit.isAlive ? (isPlayer ? 'border-emerald-500' : 'border-red-500') : 'border-gray-700 opacity-60'} transition-all cursor-pointer hover:scale-[1.02]`;
  
  // 生成buff/debuff标签
  let buffHTML = '';
  if (unit.sparkleMarks > 0) buffHTML += `<span class="text-[9px] bg-orange-500/80 px-1.5 rounded">印记×${unit.sparkleMarks}</span>`;
  if (unit.godModeTurns > 0) buffHTML += `<span class="text-[9px] bg-yellow-500/80 px-1.5 rounded">神辉</span>`;
  if (unit.lingeringCollapseActive) buffHTML += `<span class="text-[9px] bg-red-500/80 px-1.5 rounded">崩解</span>`;
  if (unit.defenseShredTurns > 0) buffHTML += `<span class="text-[9px] bg-purple-500/80 px-1.5 rounded">凝视</span>`;
  if (unit.atkBuffTurns > 0) buffHTML += `<span class="text-[9px] bg-emerald-500/80 px-1.5 rounded">强攻</span>`;
  
  card.innerHTML = `
    <div class="flex gap-3">
      <img src="${unit.image}" class="w-16 h-16 rounded-xl object-cover border ${unit.rarity === 'UR' ? 'border-pink-500' : unit.rarity === 'SSR' ? 'border-yellow-400' : 'border-gray-600'}" 
           style="filter: ${unit.isAlive ? 'none' : 'grayscale(1)'}">
      
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-start">
          <div>
            <div class="font-bold text-sm truncate">${unit.name}</div>
            <div class="text-[10px] text-gray-400">${unit.category} Lv.${unit.level} ★${unit.stars}</div>
          </div>
          <div class="text-right">
            <div class="text-xs ${unit.isAlive ? 'text-emerald-400' : 'text-red-500'}">${unit.hp}/${unit.maxHp}</div>
          </div>
        </div>
        
        <!-- HP Bar -->
        <div class="h-2 bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
          <div class="h-full transition-all ${hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'}" 
               style="width: ${hpPercent}%"></div>
        </div>
        
        <!-- Energy & Ultimate -->
        <div class="flex gap-2 mt-2 text-[10px]">
          <div class="flex-1">
            <div class="flex justify-between text-gray-400"><span>能量</span><span>${unit.energy}/5</span></div>
            <div class="h-1 bg-zinc-800 rounded mt-0.5"><div class="h-1 bg-blue-500 rounded" style="width:${energyPercent}%"></div></div>
          </div>
          <div class="flex-1">
            <div class="flex justify-between text-gray-400"><span>终结</span><span>${unit.ultimateEnergy}</span></div>
            <div class="h-1 bg-zinc-800 rounded mt-0.5"><div class="h-1 bg-purple-500 rounded" style="width:${ultPercent}%"></div></div>
          </div>
        </div>
        
        <div class="flex justify-between items-center mt-1">
          <div class="text-[9px] text-gray-500">行动值: ${unit.currentAV <= 0 ? 'Ready!' : unit.currentAV.toFixed(0)}</div>
          <div class="flex gap-1">${buffHTML}</div>
        </div>
      </div>
    </div>
  `;
  
  // 点击显示详细面板
  card.onclick = () => showUnitDetailModal(unit);
  
  return card;
}

// 详细数值面板（支持buff/debuff）
function showUnitDetailModal(unit) {
  const modal = document.createElement("div");
  modal.className = "fixed inset-0 bg-black/80 flex items-center justify-center z-[100002] p-4";
  
  let buffList = '';
  if (unit.sparkleMarks > 0) buffList += `<div class="flex justify-between"><span>【绚明印记】</span><span class="text-orange-400">×${unit.sparkleMarks} 层</span></div>`;
  if (unit.godModeTurns > 0) buffList += `<div class="flex justify-between"><span>【神子永辉】</span><span class="text-yellow-400">${unit.godModeTurns}回合</span></div>`;
  if (unit.lingeringCollapseActive) buffList += `<div class="flex justify-between"><span>【绚明崩解】</span><span class="text-red-400">剩余${unit.lingeringCollapseTurns}回合</span></div>`;
  if (unit.defenseShredTurns > 0) buffList += `<div class="flex justify-between"><span>【元素凝视】</span><span class="text-purple-400">防御-15% (${unit.defenseShredTurns}回合)</span></div>`;
  if (unit.atkBuffTurns > 0) buffList += `<div class="flex justify-between"><span>【攻击强化】</span><span class="text-emerald-400">+25% (${unit.atkBuffTurns}回合)</span></div>`;
  
  modal.innerHTML = `
    <div class="bg-zinc-900 rounded-3xl max-w-md w-full p-8 border-4 ${unit.isPlayer ? 'border-emerald-500' : 'border-red-500'}">
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-4">
          <img src="${unit.image}" class="w-20 h-20 rounded-2xl object-cover">
          <div>
            <div class="text-2xl font-bold">${unit.name}</div>
            <div class="text-sm text-gray-400">${unit.category} · ${unit.rarity} · Lv.${unit.level} ★${unit.stars}</div>
          </div>
        </div>
        <button onclick="this.closest('.fixed').remove()" class="text-4xl text-gray-400 hover:text-white">×</button>
      </div>
      
      <div class="grid grid-cols-2 gap-4 text-lg mb-6">
        <div class="bg-zinc-800 rounded-2xl p-4">
          <div class="text-xs text-gray-400">生命值</div>
          <div class="text-3xl font-bold text-emerald-400">${unit.hp} <span class="text-base">/ ${unit.maxHp}</span></div>
        </div>
        <div class="bg-zinc-800 rounded-2xl p-4">
          <div class="text-xs text-gray-400">攻击力</div>
          <div class="text-3xl font-bold text-red-400">${unit.atk}</div>
        </div>
        <div class="bg-zinc-800 rounded-2xl p-4">
          <div class="text-xs text-gray-400">防御力</div>
          <div class="text-3xl font-bold text-blue-400">${unit.def}</div>
        </div>
        <div class="bg-zinc-800 rounded-2xl p-4">
          <div class="text-xs text-gray-400">速度</div>
          <div class="text-3xl font-bold text-purple-400">${unit.spd}</div>
        </div>
      </div>
      
      <div class="bg-zinc-800 rounded-2xl p-5 mb-6">
        <div class="text-sm text-gray-400 mb-3">当前状态 / Buff & Debuff</div>
        ${buffList || '<div class="text-gray-500 text-sm">暂无特殊状态</div>'}
      </div>
      
      <div class="text-center">
        <button onclick="this.closest('.fixed').remove()" class="px-10 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-2xl">关闭</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function addBattleLog(msg, type = "normal") {
  battleState.log.push({ msg, type, time: Date.now() });
  // 限制日志长度
  if (battleState.log.length > 30) battleState.log.shift();
  
  const logEl = document.getElementById("battleLog");
  if (logEl) {
    logEl.innerHTML = battleState.log.slice(-12).map(l => 
      `<div class="mb-1 ${l.type === 'player' ? 'text-emerald-300' : l.type === 'enemy' ? 'text-red-300' : l.type === 'crit' ? 'text-yellow-400 font-bold' : l.type === 'heal' ? 'text-emerald-400' : 'text-gray-400'}">${l.msg}</div>`
    ).join("");
    logEl.scrollTop = logEl.scrollHeight;
  }
}

// ==================== 结束战斗 ====================
function endBattle(playerWin) {
  battleState.isRunning = false;
  
  const modal = battleState.battleModal;
  if (!modal) return;
  
  let rewardHTML = "";
  let title = playerWin ? "🎉 胜利！" : "💀 失败...";
  let color = playerWin ? "emerald" : "red";
  
  if (playerWin) {
    const avgLevel = battleState.playerTeam.reduce((s, u) => s + u.level, 0) / battleState.playerTeam.length;
    const baseReward = Math.floor(avgLevel * 8 + 120);
    const yaoXing = Math.floor(baseReward * 1.2);
    const gold = Math.floor(baseReward * 2.5);
    const stones = Math.floor(baseReward * 0.15);
    
    player.yaoXing = (player.yaoXing || 0) + yaoXing;
    player.gold = (player.gold || 0) + gold;
    player.reinforceStone = (player.reinforceStone || 0) + stones;
    
    document.getElementById("yaoXing").textContent = player.yaoXing;
    document.getElementById("gold").textContent = player.gold;
    document.getElementById("reinforceStone").textContent = player.reinforceStone;
    window.saveGame();
    
    rewardHTML = `
      <div class="bg-emerald-900/40 rounded-2xl p-5 mt-4">
        <div class="text-emerald-400 text-xl font-bold mb-3">战斗奖励</div>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div><div class="text-3xl">⭐</div><div class="text-yellow-400 font-bold">+${yaoXing}</div><div class="text-xs text-gray-400">耀星</div></div>
          <div><div class="text-3xl">🪙</div><div class="text-yellow-400 font-bold">+${gold}</div><div class="text-xs text-gray-400">金币</div></div>
          <div><div class="text-3xl">💎</div><div class="text-purple-400 font-bold">+${stones}</div><div class="text-xs text-gray-400">强化石</div></div>
        </div>
      </div>
    `;
  }
  
  modal.innerHTML = `
    <div class="fixed inset-0 bg-black/95 flex items-center justify-center z-[99999]">
      <div class="bg-zinc-900 rounded-3xl max-w-md w-full mx-4 p-8 text-center border-4 border-${color}-500">
        <div class="text-7xl mb-6">${playerWin ? "🏆" : "☠️"}</div>
        <h2 class="text-4xl font-bold mb-4 text-${color}-400">${title}</h2>
        
        <div class="text-gray-300 mb-6">战斗持续了 <span class="font-bold text-white">${battleState.turn}</span> 个行动轮</div>
        
        ${rewardHTML}
        
        <div class="flex gap-4 mt-8">
          <button onclick="restartBattle()" class="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 rounded-2xl text-lg font-bold">再来一局</button>
          <button onclick="closeBattleModal()" class="flex-1 py-4 bg-zinc-700 hover:bg-zinc-600 rounded-2xl text-lg font-bold">返回游戏</button>
        </div>
      </div>
    </div>
  `;
}

function pauseBattle() {
  battleState.isRunning = !battleState.isRunning;
  if (battleState.isRunning) {
    addBattleLog("▶️ 战斗继续", "system");
    processNextTurn();
  } else {
    addBattleLog("⏸️ 战斗已暂停", "system");
  }
}

function restartBattle() {
  closeBattleModal();
  // 重新开始，使用相同队伍
  setTimeout(() => {
    startBattle(battleState.playerTeam);
  }, 300);
}

function closeBattleModal() {
  battleState.isRunning = false;
  battleState.pendingSkillUnit = null;
  battleState.selectedTarget = null;
  document.getElementById("skillSelectionBar")?.remove();
  
  const modal = document.getElementById("battleModal");
  if (modal) modal.remove();
  battleState.battleModal = null;
}

// ==================== 暴露接口（供主界面调用） ====================
window.startBattle = startBattle;
window.showBattleModal = showBattleModal;

// 未来可扩展：手动战斗模式
window.setBattleSpeed = (s) => { battleState.speed = s; };

// 控制台命令支持
if (window.executeConsoleCommand) {
  const oldExec = window.executeConsoleCommand;
  window.executeConsoleCommand = function() {
    const input = document.getElementById("consoleInput").value.trim();
    if (input === "battle test" || input === "开始战斗") {
      startBattle();
      document.getElementById("consoleModal").classList.add("hidden");
      return;
    }
    oldExec();
  };
}

console.log("%c✅ 战斗系统已加载！使用 startBattle() 或控制台 'battle test' 开始战斗", "color:#22c55e");
// ==================== 战斗准备界面渲染 ====================
window.renderBattleTeamPreview = function() {
  const container = document.getElementById("battleTeamPreview");
  if (!container) return;
  
  container.innerHTML = "";
  
  if (!player.owned || player.owned.length === 0) {
    container.innerHTML = `<div class="col-span-4 text-center text-gray-500 py-8">还没有角色，快去抽卡吧！</div>`;
    return;
  }
  
  // 自动选择最高等级的4个角色
  const sorted = [...player.owned].sort((a, b) => {
    const da = window.getCharacterData(a.charId);
    const db = window.getCharacterData(b.charId);
    const scoreA = (a.level || 1) * 100 + (a.stars || 0) * 10 + (da ? (window.rarityOrder ? window.rarityOrder[da.rarity] : 0) : 0);
    const scoreB = (b.level || 1) * 100 + (b.stars || 0) * 10 + (db ? (window.rarityOrder ? window.rarityOrder[db.rarity] : 0) : 0);
    return scoreB - scoreA;
  }).slice(0, 4);
  
  sorted.forEach(item => {
    const data = window.getCharacterData(item.charId);
    if (!data) return;
    
    const stats = window.calculateStats ? window.calculateStats(item, data, null) : { hp: data.baseHP, atk: data.baseATK, spd: data.baseSPD };
    
    const div = document.createElement("div");
    div.className = `bg-zinc-800 rounded-2xl p-3 text-center border-2 border-emerald-500`;
    div.innerHTML = `
      <img src="${data.image}" class="w-12 h-12 mx-auto rounded-xl mb-2 object-cover">
      <div class="text-xs font-bold truncate">${data.name}</div>
      <div class="text-[10px] text-emerald-400">Lv.${item.level || 1} ★${item.stars || 0}</div>
      <div class="text-[9px] text-gray-400 mt-1">⚔️${Math.floor(stats.atk)} 速${Math.floor(stats.spd)}</div>
    `;
    container.appendChild(div);
  });
};

// ==================== 手动选择队伍系统 ====================
let selectedTeamForBattle = [];

window.showBattleTeamSelect = function() {
  if (!player.owned || player.owned.length === 0) {
    alert("你还没有任何角色！请先去抽卡。");
    return;
  }

  const modalHTML = `
    <div id="teamSelectModal" class="fixed inset-0 bg-black/90 flex items-center justify-center z-[100000] p-4">
      <div class="bg-zinc-900 rounded-3xl max-w-5xl w-full max-h-[85vh] flex flex-col overflow-hidden border-4 border-emerald-500">
        <div class="flex justify-between items-center px-8 py-5 border-b border-zinc-700">
          <div>
            <h3 class="text-3xl font-bold text-emerald-400">手动选择战斗队伍</h3>
            <p class="text-sm text-gray-400 mt-1">最多选择 4 名角色（已自动按等级/星级排序）</p>
          </div>
          <button onclick="closeTeamSelectModal()" class="text-4xl leading-none text-gray-400 hover:text-white">×</button>
        </div>
        
        <div class="flex-1 overflow-auto p-6">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="teamSelectGrid">
            <!-- 动态生成角色卡片 -->
          </div>
        </div>
        
        <div class="px-8 py-5 border-t border-zinc-700 bg-zinc-950 flex justify-between items-center">
          <div class="text-lg">
            已选择 <span id="selectedCount" class="font-bold text-emerald-400">0</span>/4
          </div>
          <div class="flex gap-4">
            <button onclick="clearTeamSelection()" class="px-8 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-2xl">清空</button>
            <button onclick="confirmTeamSelection()" class="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-2xl text-lg font-bold">确认并开始战斗</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById("teamSelectModal")?.remove();
  const div = document.createElement("div");
  div.innerHTML = modalHTML;
  document.body.appendChild(div.firstElementChild);
  
  renderTeamSelectGrid();
};

function renderTeamSelectGrid() {
  const grid = document.getElementById("teamSelectGrid");
  if (!grid) return;
  
  grid.innerHTML = "";
  selectedTeamForBattle = [];
  
  // 按强度排序
  const sortedOwned = [...player.owned].sort((a, b) => {
    const da = window.getCharacterData(a.charId);
    const db = window.getCharacterData(b.charId);
    const scoreA = (a.level || 1) * 100 + (a.stars || 0) * 20 + (da ? (window.rarityOrder?.[da.rarity] || 0) * 50 : 0);
    const scoreB = (b.level || 1) * 100 + (b.stars || 0) * 20 + (db ? (window.rarityOrder?.[db.rarity] || 0) * 50 : 0);
    return scoreB - scoreA;
  });
  
  sortedOwned.forEach((item, index) => {
    const data = window.getCharacterData(item.charId);
    if (!data) return;
    
    const stats = window.calculateStats ? window.calculateStats(item, data, null) : 
      { hp: data.baseHP, atk: data.baseATK, def: data.baseDEF, spd: data.baseSPD };
    
    const isSelected = selectedTeamForBattle.some(s => s.id === item.id);
    
    const card = document.createElement("div");
    card.className = `relative bg-zinc-800 rounded-2xl p-4 cursor-pointer border-2 transition-all ${isSelected ? 'border-emerald-500 scale-[1.02]' : 'border-transparent hover:border-zinc-600'}`;
    card.innerHTML = `
      <img src="${data.image}" class="w-full h-32 object-cover rounded-xl mb-3">
      <div class="flex justify-between items-start">
        <div>
          <div class="font-bold">${data.name}</div>
          <div class="text-xs text-gray-400">${data.category} · ${data.rarity}</div>
        </div>
        <div class="text-right text-xs">
          <div>Lv.${item.level || 1}</div>
          <div class="star-${Math.min(item.stars || 0, 5)}">★${item.stars || 0}</div>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-1 text-xs mt-3 text-gray-300">
        <div>❤️ ${Math.floor(stats.hp)}</div>
        <div>⚔️ ${Math.floor(stats.atk)}</div>
        <div>🛡️ ${Math.floor(stats.def)}</div>
        <div>⚡ ${Math.floor(stats.spd)}</div>
      </div>
    `;
    
    card.onclick = () => toggleTeamMember(item, card, index);
    grid.appendChild(card);
  });
  
  updateSelectedCount();
}

function toggleTeamMember(item, cardElement, index) {
  const existingIndex = selectedTeamForBattle.findIndex(s => s.id === item.id);
  
  if (existingIndex !== -1) {
    // 取消选择
    selectedTeamForBattle.splice(existingIndex, 1);
    cardElement.classList.remove('border-emerald-500', 'scale-[1.02]');
    cardElement.classList.add('border-transparent');
  } else {
    if (selectedTeamForBattle.length >= 4) {
      alert("最多只能选择 4 名角色！");
      return;
    }
    selectedTeamForBattle.push(item);
    cardElement.classList.add('border-emerald-500', 'scale-[1.02]');
    cardElement.classList.remove('border-transparent');
  }
  
  updateSelectedCount();
}

function updateSelectedCount() {
  const countEl = document.getElementById("selectedCount");
  if (countEl) countEl.textContent = selectedTeamForBattle.length;
}

window.clearTeamSelection = function() {
  selectedTeamForBattle = [];
  renderTeamSelectGrid();
};

window.confirmTeamSelection = function() {
  if (selectedTeamForBattle.length === 0) {
    alert("请至少选择 1 名角色！");
    return;
  }
  
  // 优化：同名角色只能上阵一个
  const names = selectedTeamForBattle.map(item => {
    const data = window.getCharacterData(item.charId);
    return data ? data.name : '';
  });
  const uniqueNames = new Set(names);
  if (uniqueNames.size < names.length) {
    alert("同名角色只能上阵一个！请重新选择。");
    return;
  }
  
  closeTeamSelectModal();
  
  // 将选择的角色转换为 battle units
  const battleUnits = selectedTeamForBattle.map(item => {
    const data = window.getCharacterData(item.charId);
    let equipped = null;
    if (item.equippedWeapon) {
      equipped = player.weapons.find(w => w.id === item.equippedWeapon);
    }
    return createBattleUnit(data, item.level || 1, item.stars || 0, true, equipped);
  });
  
  startBattle(battleUnits);
};

function closeTeamSelectModal() {
  const modal = document.getElementById("teamSelectModal");
  if (modal) modal.remove();
}
