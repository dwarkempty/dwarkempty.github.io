// js/battle.js - 完整战斗系统（行动值回合制 + 能量机制 + 防御公式）
// 设计完全遵循用户规格：行动值=10000/速度，每回合150行动值预算，防御减免公式，能量点5上限+每回合+1

let battleState = {
  playerTeam: [],
  enemyTeam: [],
  allUnits: [],
  currentAV: {},      // 当前行动值
  turn: 0,
  log: [],
  isRunning: false,
  speed: 1,           // 战斗速度倍率
  selectedTarget: null,
  battleModal: null
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
  
  // 初始化当前行动值
  battleState.allUnits.forEach(u => {
    u.currentAV = u.actionValue;
    u.hp = u.maxHp;
    u.energy = 3;
    u.ultimateEnergy = 0;
    u.isAlive = true;
    u.buffs = [];
    u.debuffs = [];
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
  
  // 更新UI
  updateBattleUI();
  
  // 继续下一行动（带速度控制）
  const delay = Math.max(200, 800 / battleState.speed);
  setTimeout(() => {
    if (battleState.isRunning) processNextTurn();
  }, delay);
}

// ==================== 行动执行 ====================
function executeAction(unit) {
  if (!unit.isAlive) return;
  
  const isPlayerTurn = unit.isPlayer;
  const enemies = battleState.enemyTeam.filter(e => e.isAlive);
  const allies = (isPlayerTurn ? battleState.playerTeam : battleState.enemyTeam).filter(a => a.isAlive);
  
  if (enemies.length === 0 || allies.length === 0) return;
  
  let actionType = "普攻";
  let target = null;
  let damage = 0;
  let heal = 0;
  let logMsg = "";
  
  // 简单AI / 自动选择技能
  const canUseSkill1 = unit.energy >= 1;
  const canUseUltimate = unit.ultimateEnergy >= 80; // 降低门槛方便演示
  
  if (isPlayerTurn) {
    // 玩家单位：优先使用高价值技能（演示用，实际可改为手动选择）
    if (canUseUltimate && Math.random() > 0.6) {
      actionType = "终结技";
      target = enemies[Math.floor(Math.random() * enemies.length)];
      damage = calculateFinalDamage(unit.atk * 4.2, unit, target, true);
      unit.ultimateEnergy = 0;
      unit.energy = Math.min(unit.maxEnergy, unit.energy + 1);
      logMsg = `🌟 ${unit.name} 释放终结技！`;
    } else if (canUseSkill1 && Math.random() > 0.4) {
      actionType = "战技";
      target = enemies[Math.floor(Math.random() * enemies.length)];
      damage = calculateFinalDamage(unit.atk * 1.8, unit, target);
      unit.energy -= 1;
      unit.ultimateEnergy = Math.min(unit.maxUltimate, unit.ultimateEnergy + 12);
      logMsg = `⚔️ ${unit.name} 使用战技`;
    } else {
      actionType = "普攻";
      target = enemies[Math.floor(Math.random() * enemies.length)];
      damage = calculateFinalDamage(unit.atk * 1.0, unit, target);
      unit.ultimateEnergy = Math.min(unit.maxUltimate, unit.ultimateEnergy + 8);
      logMsg = `${unit.name} 普攻`;
    }
  } else {
    // 敌人AI：简单随机
    if (canUseUltimate && Math.random() > 0.7) {
      actionType = "终结技";
      target = allies[Math.floor(Math.random() * allies.length)];
      damage = calculateFinalDamage(unit.atk * 3.8, unit, target, true);
      unit.ultimateEnergy = 0;
      logMsg = `💀 ${unit.name} 释放终结技！`;
    } else if (canUseSkill1 && Math.random() > 0.5) {
      actionType = "战技";
      target = allies[Math.floor(Math.random() * allies.length)];
      damage = calculateFinalDamage(unit.atk * 1.6, unit, target);
      unit.energy -= 1;
      logMsg = `${unit.name} 使用战技`;
    } else {
      actionType = "普攻";
      target = allies[Math.floor(Math.random() * allies.length)];
      damage = calculateFinalDamage(unit.atk * 1.0, unit, target);
      unit.ultimateEnergy = Math.min(unit.maxUltimate, unit.ultimateEnergy + 10);
      logMsg = `${unit.name} 普攻`;
    }
  }
  
  // 应用伤害
  if (damage > 0 && target) {
    target.hp = Math.max(0, target.hp - damage);
    if (target.hp <= 0) target.isAlive = false;
    
    addBattleLog(`${logMsg} → ${target.name} 造成 <span class="text-red-400 font-bold">${damage}</span> 伤害`, isPlayerTurn ? "player" : "enemy");
    
    // 暴击特效提示
    if (damage > unit.atk * 1.5) {
      addBattleLog(`💥 暴击！`, "crit");
    }
  }
  
  // 简单治疗示例（辅助职业）
  if (unit.category === "辅助" && Math.random() > 0.6 && allies.length > 1) {
    const healTarget = allies[Math.floor(Math.random() * allies.length)];
    heal = Math.floor(unit.atk * 0.6);
    healTarget.hp = Math.min(healTarget.maxHp, healTarget.hp + heal);
    addBattleLog(`💚 ${unit.name} 治疗 ${healTarget.name} +${heal}`, "heal");
  }
  
  // 更新UI
  updateBattleUI();
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
  
  // 渲染我方单位
  const playerContainer = document.getElementById("playerUnits");
  if (playerContainer) {
    playerContainer.innerHTML = "";
    battleState.playerTeam.forEach(unit => {
      const el = createUnitCard(unit, true);
      playerContainer.appendChild(el);
    });
  }
  
  // 渲染敌方单位
  const enemyContainer = document.getElementById("enemyUnits");
  if (enemyContainer) {
    enemyContainer.innerHTML = "";
    battleState.enemyTeam.forEach(unit => {
      const el = createUnitCard(unit, false);
      enemyContainer.appendChild(el);
    });
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
  card.className = `relative bg-zinc-900 rounded-2xl p-3 border ${unit.isAlive ? (isPlayer ? 'border-emerald-500' : 'border-red-500') : 'border-gray-700 opacity-60'} transition-all`;
  
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
        
        <div class="text-[9px] text-gray-500 mt-1">行动值: ${unit.currentAV.toFixed(0)}</div>
      </div>
    </div>
  `;
  
  // 点击可手动选择目标（未来扩展手动战斗）
  if (unit.isAlive && !isPlayer) {
    card.onclick = () => {
      battleState.selectedTarget = unit;
      addBattleLog(`已选择目标：${unit.name}`, "system");
    };
    card.style.cursor = "pointer";
  }
  
  return card;
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

// 自定义队伍选择（简单版，可扩展为Modal多选）
window.showBattleTeamSelect = function() {
  alert("自定义队伍功能开发中！当前自动选择最高等级角色。\n\n未来可在此处多选4名角色并保存预设。");
  // TODO: 弹出多选Modal，让玩家手动选择队伍
};
