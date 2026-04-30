// js/player.js - 玩家数据 + 存档 + 属性计算
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

  // ==================== 你指定的公式（角色） ====================
  let hp  = Math.floor(charData.baseHP  * Math.pow(1.025, X) + 700 * Y);
  let atk = Math.floor(charData.baseATK * Math.pow(1.02,  X) + 500 * Y);
  let def = Math.floor(charData.baseDEF * Math.pow(1.015, X) + 400 * Y);

  let spd = Math.floor(charData.baseSPD * (1 + 0.15 * Y));

  let critRate = 0.05;
  let critDamage = 0.5;

  if (equippedWeapon) {
    const wpData = getWeaponData(equippedWeapon.weaponId);
    const wX = equippedWeapon.level;
    const wY = equippedWeapon.stars;

    hp  += Math.floor(wpData.baseHP  * Math.pow(1.025, wX) + 700 * wY);
    atk += Math.floor(wpData.baseATK * Math.pow(1.02,  wX) + 500 * wY);
    def += Math.floor(wpData.baseDEF * Math.pow(1.015, wX) + 400 * wY);
    // 武器不影响速度
    critRate += wpData.baseCritRate * (1 + wY * 0.38);
    critDamage += wpData.baseCritDamage * (1 + wY * 0.38);
  }

  // 新增战斗属性（基于战斗模块）
  let penFixed = (charData.basePenFixed || 30) + Math.floor(X * 3 + Y * 15);
  let penRate = Math.min(0.5, (charData.basePenRate || 0.03) + Y * 0.02 + X * 0.001);
  let attribute = charData.attribute || "元素";
  let healBonus = (charData.healBonus || 0.05) + Y * 0.03;
  let recvHealBonus = (charData.recvHealBonus || 0.05) + Y * 0.03;
  let shieldStr = (charData.shieldStr || 1.0) + Y * 0.08;

  return { 
    hp, 
    atk, 
    def, 
    critRate: Math.min(critRate, 1), 
    critDamage, 
    spd,
    penFixed: Math.floor(penFixed),
    penRate: Math.min(1, penRate),
    attribute,
    healBonus: Math.min(1, healBonus),
    recvHealBonus: Math.min(1, recvHealBonus),
    shieldStr: Math.min(2.5, shieldStr)
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
