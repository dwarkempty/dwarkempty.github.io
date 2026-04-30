// js/player.js - 玩家数据 + 存档 + 属性计算（完整版，无任何省略）
let player = {
  yaoXing: 1000,
  gold: 0,
  reinforceStone: 0,
  owned: [],
  weapons: [],
  unlockedChars: [],
  unlockedWeapons: [],
  totalCharDraws: 0,
  rCount: 0,
  srCount: 0,
  ssrCount: 0,
  urCount: 0,
  totalWeaponDraws: 0,
  wR: 0,
  wSR: 0,
  wSSR: 0,
  wUR: 0,
  charSsrPity: 0,
  charUrPity: 0,
  weaponSsrPity: 0,
  weaponUrPity: 0,
  shopLevel: 1,
  operatingPoints: 0,
  materials: {},
  sourcePowers: {},
  unlockedRecipes: [1,2,3,4]   // 1级默认解锁4种
};

let decomposeMode = false;
let selected = [];
let currentSort = "rarity";
let currentDrawPool = "char";
let currentInventoryTab = 0;
let currentRecordTab = 0;
let currentModalIndex = null;
let currentModalType = "char";

function saveGame() {
  localStorage.setItem("gachaGame", JSON.stringify(player));
}

function loadGame() {
  const saved = localStorage.getItem("gachaGame");
  if (saved) {
    let data = JSON.parse(saved);
    player = { ...player, ...data };
  }
  
  if (!player.charSsrPity) player.charSsrPity = 0;
  if (!player.charUrPity) player.charUrPity = 0;
  if (!player.weaponSsrPity) player.weaponSsrPity = 0;
  if (!player.weaponUrPity) player.weaponUrPity = 0;
  if (!player.unlockedChars) player.unlockedChars = [];
  if (!player.unlockedWeapons) player.unlockedWeapons = [];
  if (!player.shopLevel) player.shopLevel = 1;
  if (!player.operatingPoints) player.operatingPoints = 0;
  if (!player.materials) player.materials = {};
  if (!player.sourcePowers) player.sourcePowers = {};
  if (!player.unlockedRecipes) player.unlockedRecipes = [1,2,3,4];

  // 1. 初始获得各种经营材料20个（新玩家或首次加载时生效）
  window.materialsPool.forEach(mat => {
    if (player.materials[mat.id] === undefined) {
      player.materials[mat.id] = 20;
    }
  });

  document.getElementById("yaoXing").textContent = player.yaoXing;
  document.getElementById("gold").textContent = player.gold;
  document.getElementById("reinforceStone").textContent = player.reinforceStone;
  
  saveGame();
}

function getCharacterData(charId) {
  return window.characterMap.get(charId);
}

function getWeaponData(weaponId) {
  return window.weaponMap.get(weaponId);
}

function calculateStats(item, charData, equippedWeapon = null) {
  const X = item.level;      // 等级
  const Y = item.stars;      // 星级

  // 星级系数 (0-5星)
  const starCoefficients = [1.00, 1.20, 1.40, 1.60, 1.80, 2.00];
  const coeff = starCoefficients[Math.min(Y, 5)] || 1.0;

  // 成长率按职业 (固定，来自设计图)
  const cat = charData.category || "强袭";
  let hpGrowth, atkGrowth, defGrowth, spdGrowth;
  if (cat === "强袭") {
    hpGrowth = 48.0; atkGrowth = 24.3; defGrowth = 10.0; spdGrowth = 0.8;
  } else if (cat === "近卫") {
    hpGrowth = 50.5; atkGrowth = 13.9; defGrowth = 16.5; spdGrowth = 0.5;
  } else {
    hpGrowth = 40.4; atkGrowth = 19.9; defGrowth = 12.4; spdGrowth = 0.7;
  }

  // 使用角色数据中的初始值 (0星1级，区间内不同角色略有差异)
  const baseHP = charData.baseHP || 695;
  const baseATK = charData.baseATK || 165;
  const baseDEF = charData.baseDEF || 195;
  const baseSPD = charData.baseSPD || 109;

  // 最终基础属性公式 (来自设计图)
  let hp = Math.floor( (baseHP + hpGrowth * (X - 1)) * coeff );
  let atk = Math.floor( (baseATK + atkGrowth * (X - 1)) * coeff );
  let def = Math.floor( (baseDEF + defGrowth * (X - 1)) * coeff );

  // 速度特殊公式
  let spd = Math.floor( (baseSPD + spdGrowth * (X - 1)) * (1 + (coeff - 1) * 0.5) );

  // 星级固定副属性加成 (累计)
  let starCritRate = 0, starCritDamage = 0, starPenRate = 0, starDmgBonus = 0;
  if (Y >= 2) starCritRate += 0.05;
  if (Y >= 3) { starCritRate += 0.05; starCritDamage += 0.10; }
  if (Y >= 4) { starCritRate += 0.05; starCritDamage += 0.10; starPenRate += 0.08; }
  if (Y >= 5) { starCritRate += 0.10; starCritDamage += 0.10; starPenRate += 0.08; starDmgBonus += 0.10; }

  // 基础 + 星级加成 + (未来装备/技能, 当前0)
  let critRate = 0.05 + starCritRate;
  let critDamage = 1.50 + starCritDamage;
  let penRate = starPenRate;
  let penFixed = 0;
  let dmgBonus = starDmgBonus;
  let dmgReduction = 0;
  let healBonus = 0;
  let recvHealBonus = 0;
  let shieldStr = 1.0;

  let attribute = charData.attribute || "元素";

  // 武器加成 (保留原有逻辑, 但调整)
  if (equippedWeapon) {
    const wpData = getWeaponData(equippedWeapon.weaponId);
    const wX = equippedWeapon.level;
    const wY = equippedWeapon.stars;
    hp += Math.floor(wpData.baseHP * Math.pow(1.02, wX) + 200 * wY);
    atk += Math.floor(wpData.baseATK * Math.pow(1.015, wX) + 150 * wY);
    def += Math.floor(wpData.baseDEF * Math.pow(1.01, wX) + 100 * wY);
    critRate += wpData.baseCritRate * (1 + wY * 0.3);
    critDamage += wpData.baseCritDamage * (1 + wY * 0.3);
  }

  return { 
    hp: Math.max(1, hp), 
    atk: Math.max(1, atk), 
    def: Math.max(1, def), 
    critRate: Math.min(1, Math.max(0, critRate)), 
    critDamage: Math.max(1, critDamage),
    spd: Math.max(1, spd),
    penFixed: Math.floor(penFixed),
    penRate: Math.min(1, Math.max(0, penRate)),
    attribute,
    healBonus: Math.min(1, Math.max(0, healBonus)),
    recvHealBonus: Math.min(1, Math.max(0, recvHealBonus)),
    shieldStr: Math.max(0.1, shieldStr),
    dmgBonus: Math.min(0.5, Math.max(0, dmgBonus)),
    dmgReduction: Math.min(0.5, Math.max(0, dmgReduction)),
    spRecovery: 0,
    ueCharge: 0
  };
}

function calculateWeaponStats(item, weaponData) {
  const X = item.level;
  const Y = item.stars;

  return {
    hp:  Math.floor(weaponData.baseHP  * Math.pow(1.025, X) + 700 * Y),
    atk: Math.floor(weaponData.baseATK * Math.pow(1.02,  X) + 500 * Y),
    def: Math.floor(weaponData.baseDEF * Math.pow(1.015, X) + 400 * Y),
    critRate: weaponData.baseCritRate * (1 + Y * 0.38),
    critDamage: weaponData.baseCritDamage * (1 + Y * 0.38)
  };
}

function getRarityColor(r) {
  if (r === "UR") return "card-ur";
  if (r === "SSR") return "card-ssr";
  if (r === "SR") return "card-sr";
  return "card-r";
}

function getRarityBorderClass(r) {
  if (r === "R") return "border-blue-500";
  if (r === "SR") return "border-purple-500";
  if (r === "SSR") return "border-yellow-400";
  if (r === "UR") return "border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400";
  return "border-orange-500";
}

window.player = player;
window.saveGame = saveGame;
window.loadGame = loadGame;
window.calculateStats = calculateStats;
window.calculateWeaponStats = calculateWeaponStats;
window.getCharacterData = getCharacterData;
window.getWeaponData = getWeaponData;
window.getRarityColor = getRarityColor;
window.getRarityBorderClass = getRarityBorderClass;

function getURRate() {
  const totalDraws = (player.totalCharDraws || 0) + (player.totalWeaponDraws || 0);
  if (totalDraws === 0) return 0;
  const totalUR = (player.urCount || 0) + (player.wUR || 0);
  return (totalUR / totalDraws * 100);
}

function getPlayerTitle() {
  const rate = getURRate();
  if (rate <= 0.1) return "万里挑一大非酋";
  if (rate <= 0.5) return "千里挑一大非酋";
  if (rate <= 0.8) return "非酋";
  if (rate <= 1.2) return "正常玩家";
  if (rate <= 2) return "欧皇";
  if (rate <= 3) return "千里挑一大欧皇";
  if (rate <= 4) return "万里挑一大欧皇";
  return "终极至尊欧皇";
}

window.getURRate = getURRate;
window.getPlayerTitle = getPlayerTitle;
