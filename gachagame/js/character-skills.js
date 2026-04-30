// js/character-skills.js - 角色专属技能系统（模块化，易扩展未来角色）
// 当前仅实现阿特亚完整技能组（严格按用户最终描述）

window.CharacterSkills = {
  // 阿特亚技能处理器
  atya: {
    // 核心：应用/叠加【绚明印记】
    applyMark(enemy, stacksToAdd = 1, source = "被动") {
      if (!enemy || enemy.currentHP <= 0) return { exploded: 0, damage: 0 };
      
      enemy.debuffs = enemy.debuffs || [];
      let mark = enemy.debuffs.find(d => d.name === "绚明印记");
      
      if (!mark) {
        mark = { name: "绚明印记", stacks: 0, duration: 3 }; // 默认3回合
        enemy.debuffs.push(mark);
      }
      
      const oldStacks = mark.stacks || 0;
      mark.stacks = Math.min(8, (mark.stacks || 0) + stacksToAdd);
      mark.duration = 3; // 刷新持续时间
      
      let exploded = 0;
      let explodeDmg = 0;
      
      // 超出8层自动引爆
      if (mark.stacks > 8) {
        exploded = mark.stacks - 8;
        mark.stacks = 8;
        // 引爆伤害：每层80%攻击力（使用阿特亚当前atk）
        const atya = window.battleState?.team?.find(m => m.charId === 15);
        const atk = atya ? atya.stats.atk : 100;
        explodeDmg = Math.floor(atk * 0.8 * exploded);
        enemy.currentHP = Math.max(0, enemy.currentHP - explodeDmg);
      }
      
      return { exploded, damage: explodeDmg, newStacks: mark.stacks };
    },

    // 立即触发一次印记伤害（被动用）
    triggerMarkDamage(enemy, atyaStats) {
      if (!enemy || enemy.currentHP <= 0) return 0;
      const mark = (enemy.debuffs || []).find(d => d.name === "绚明印记");
      if (!mark || !mark.stacks) return 0;
      
      const dmg = Math.floor((atyaStats.atk || 100) * 0.5 * mark.stacks);
      enemy.currentHP = Math.max(0, enemy.currentHP - dmg);
      return dmg;
    },

    // 被动：绚明本源（伤害后调用）
    onDamageDealt(atyaMember, targetEnemy, isAoe = false) {
      if (!atyaMember || atyaMember.charId !== 15) return;
      
      const stats = atyaMember.stats || {};
      
      // 附加1层 + 立即触发 + 10%元素增伤（最多3层） + 5 UE（每回合最多30）
      const result = this.applyMark(targetEnemy, 1, "被动");
      
      // 立即触发印记伤害
      const triggerDmg = this.triggerMarkDamage(targetEnemy, stats);
      
      // 元素增伤（用dmgBonus模拟，最多+30%）
      stats.dmgBonus = Math.min(0.3, (stats.dmgBonus || 0) + 0.1);
      
      // UE回复（每回合上限30，简化全局计数）
      if (!window._atyaUeThisTurn) window._atyaUeThisTurn = 0;
      if (window._atyaUeThisTurn < 30) {
        atyaMember.UE = Math.min(100, atyaMember.UE + 5);
        window._atyaUeThisTurn += 5;
      }
      
      if (result.exploded > 0) {
        addLog(`💥【绚明印记】引爆 ${result.exploded} 层！额外造成 ${result.damage} 点元素伤害`);
      }
      if (triggerDmg > 0) {
        addLog(`✨ 被动触发印记伤害：${triggerDmg} 点`);
      }
    },

    // 普攻：绚光初绽（扩散 + 概率附加）
    performNormal(atyaMember) {
      const alive = window.battleState.enemies.filter(e => e.currentHP > 0);
      if (alive.length === 0) return;
      
      const mainTarget = alive[0];
      const others = alive.slice(1, 3); // 周围两名
      
      // 主目标 110%
      const mainDmg = Math.floor(atyaMember.stats.atk * 1.1);
      mainTarget.currentHP = Math.max(0, mainTarget.currentHP - mainDmg);
      addLog(`💥 普攻对 ${mainTarget.name} 造成 ${mainDmg} 点元素伤害`);
      
      if (Math.random() < 0.5) {
        this.applyMark(mainTarget, 1, "普攻");
        this.onDamageDealt(atyaMember, mainTarget);
      }
      
      // 扩散 80% + 30%概率
      others.forEach(enemy => {
        const subDmg = Math.floor(atyaMember.stats.atk * 0.8);
        enemy.currentHP = Math.max(0, enemy.currentHP - subDmg);
        addLog(`💥 普攻扩散对 ${enemy.name} 造成 ${subDmg} 点元素伤害`);
        
        if (Math.random() < 0.3) {
          this.applyMark(enemy, 1, "普攻扩散");
          this.onDamageDealt(atyaMember, enemy);
        }
      });
    },

    // 战技1：万象绚华（AOE + 3层 + 条件元素凝视）
    performSkill1(atyaMember) {
      if (atyaMember.SP < 2) { alert("SP不足！"); return false; }
      atyaMember.SP -= 2;
      
      const alive = window.battleState.enemies.filter(e => e.currentHP > 0);
      let hasHighStack = false;
      
      alive.forEach(enemy => {
        const dmg = Math.floor(atyaMember.stats.atk * 2.2);
        enemy.currentHP = Math.max(0, enemy.currentHP - dmg);
        addLog(`🔥 战技1对 ${enemy.name} 造成 ${dmg} 点元素伤害`);
        
        const markResult = this.applyMark(enemy, 3, "战技1");
        if (markResult.newStacks >= 6) hasHighStack = true;
        
        this.onDamageDealt(atyaMember, enemy, true);
      });
      
      // 若任意>=6，全员元素凝视
      if (hasHighStack) {
        alive.forEach(enemy => {
          let debuff = enemy.debuffs.find(d => d.name === "元素凝视");
          if (!debuff) {
            debuff = { name: "元素凝视", duration: 2 };
            enemy.debuffs.push(debuff);
          } else {
            debuff.duration = 2; // 刷新
          }
          addLog(`🔻 ${enemy.name} 获得【元素凝视】(防御-15%)`);
        });
      }
      return true;
    },

    // 战技2：绚律易质（单体 + 引爆 + 180% per layer + 35 UE + 25% ATK 2回合）
    performSkill2(atyaMember) {
      if (atyaMember.SP < 2) { alert("SP不足！"); return false; }
      atyaMember.SP -= 2;
      
      const alive = window.battleState.enemies.filter(e => e.currentHP > 0);
      if (alive.length === 0) return false;
      
      const target = alive[0]; // 指定第一个
      const baseDmg = Math.floor(atyaMember.stats.atk * 3.4);
      target.currentHP = Math.max(0, target.currentHP - baseDmg);
      addLog(`💥 战技2对 ${target.name} 造成 ${baseDmg} 点元素伤害`);
      
      // 立即引爆所有印记
      const mark = (target.debuffs || []).find(d => d.name === "绚明印记");
      let explodeLayers = 0;
      let extraDmg = 0;
      
      if (mark && mark.stacks > 0) {
        explodeLayers = mark.stacks;
        extraDmg = Math.floor(atyaMember.stats.atk * 1.8 * explodeLayers);
        target.currentHP = Math.max(0, target.currentHP - extraDmg);
        mark.stacks = 0; // 引爆后清空
        mark.duration = 0;
        addLog(`💥 引爆 ${explodeLayers} 层！额外造成 ${extraDmg} 点毁灭性元素伤害`);
      }
      
      // 回复35 UE + 25% ATK 2回合
      atyaMember.UE = Math.min(100, atyaMember.UE + 35);
      let atkBuff = atyaMember.buffs.find(b => b.name === "攻击力提升");
      if (!atkBuff) {
        atkBuff = { name: "攻击力提升", value: 0.25, duration: 2 };
        atyaMember.buffs.push(atkBuff);
      } else {
        atkBuff.duration = 2;
      }
      addLog(`✨ 引爆后回复35 UE + 攻击力+25%（2回合）`);
      
      this.onDamageDealt(atyaMember, target);
      return true;
    },

    // 终结技：万般绚明（AOE 700% + 总层数80% + 崩解状态2回合 + 神子永辉）
    performUltimate(atyaMember) {
      if (atyaMember.UE < 100 || atyaMember.ultimateUsed) { alert("无法释放终结技！"); return false; }
      
      atyaMember.ultimateUsed = true;
      atyaMember.UE = 0;
      
      const alive = window.battleState.enemies.filter(e => e.currentHP > 0);
      let totalStacks = 0;
      
      // 先统计总层数
      alive.forEach(e => {
        const m = (e.debuffs || []).find(d => d.name === "绚明印记");
        if (m) totalStacks += (m.stacks || 0);
      });
      
      // 主伤害 + 层数额外伤害
      const baseDmg = Math.floor(atyaMember.stats.atk * 7.0);
      const extraDmg = Math.floor(atyaMember.stats.atk * 0.8 * totalStacks);
      
      alive.forEach(enemy => {
        const totalDmg = baseDmg + Math.floor(extraDmg / alive.length); // 平均分配额外
        enemy.currentHP = Math.max(0, enemy.currentHP - totalDmg);
        addLog(`🌟 终结技对 ${enemy.name} 造成 ${totalDmg} 点毁灭性元素伤害`);
        
        // 应用【绚明崩解】状态（2回合）
        let collapse = enemy.debuffs.find(d => d.name === "绚明崩解");
        if (!collapse) {
          collapse = { name: "绚明崩解", duration: 2, preStacks: (enemy.debuffs.find(m => m.name === "绚明印记")?.stacks || 0) };
          enemy.debuffs.push(collapse);
        } else {
          collapse.duration = 2;
          collapse.preStacks = (enemy.debuffs.find(m => m.name === "绚明印记")?.stacks || 0);
        }
      });
      
      addLog(`🌟 终结技总计引爆 ${totalStacks} 层效果！`);
      
      // 终结后进入【神子永辉】
      let godBuff = atyaMember.buffs.find(b => b.name === "神子永辉");
      if (!godBuff) {
        godBuff = { name: "神子永辉", duration: 1, atkBonus: 0.3, ignoreDef: true, markBonus: 1 };
        atyaMember.buffs.push(godBuff);
      }
      addLog(`🌟 ${atyaMember.name} 进入【神子永辉】状态！（+30%攻击、无视防御、印记+1层）`);
      
      // 被动触发
      alive.forEach(e => this.onDamageDealt(atyaMember, e, true));
      
      return true;
    },

    // 每回合结束处理：DoT + 崩解触发 + 持续时间
    processEndOfTurn() {
      const aliveEnemies = window.battleState.enemies.filter(e => e.currentHP > 0);
      const atya = window.battleState.team.find(m => m.charId === 15 && m.currentHP > 0);
      
      aliveEnemies.forEach(enemy => {
        // 1. 【绚明印记】DoT
        const mark = (enemy.debuffs || []).find(d => d.name === "绚明印记");
        if (mark && mark.stacks > 0 && atya) {
          const dotDmg = Math.floor((atya.stats.atk || 100) * 0.5 * mark.stacks);
          enemy.currentHP = Math.max(0, enemy.currentHP - dotDmg);
          addLog(`🔥 ${enemy.name} 受到【绚明印记】DoT：${dotDmg} 点元素伤害`);
        }
        
        // 2. 【绚明崩解】每回合触发（无视防御，无法驱散，不触发被动）
        const collapse = (enemy.debuffs || []).find(d => d.name === "绚明崩解");
        if (collapse && collapse.duration > 0 && collapse.preStacks > 0) {
          const collapseDmg = Math.floor((atya ? atya.stats.atk : 100) * collapse.preStacks * 1.0); // 等同引爆前层数
          enemy.currentHP = Math.max(0, enemy.currentHP - collapseDmg);
          addLog(`💥 ${enemy.name} 【绚明崩解】触发：${collapseDmg} 点无视防御伤害`);
        }
        
        // 3. 统一减少持续时间（印记、崩解、元素凝视等）
        if (enemy.debuffs) {
          enemy.debuffs = enemy.debuffs.filter(d => {
            if (d.duration !== undefined) {
              d.duration--;
              return d.duration > 0;
            }
            return true; // 无duration的保持
          });
        }
      });
      
      // 重置阿特亚每回合UE计数
      window._atyaUeThisTurn = 0;
    }
  }
};

// 暴露给battle.js调用
window.applyAtyaMark = window.CharacterSkills.atya.applyMark;
window.processAtyaEndOfTurn = window.CharacterSkills.atya.processEndOfTurn;
