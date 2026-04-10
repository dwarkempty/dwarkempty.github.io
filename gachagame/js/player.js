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
  const levelMult = Math.pow(1.06, item.level);
  const starMult = 1 + item.stars * 0.25;
  let hp = Math.floor(charData.baseHP * levelMult * starMult);
  let atk = Math.floor(charData.baseATK * levelMult * starMult);
  let def = Math.floor(charData.baseDEF * levelMult * starMult);
  let critRate = 0.05;
  let critDamage = 0.5;

  if (equippedWeapon) {
    const wpData = getWeaponData(equippedWeapon.weaponId);
    const wLevelMult = Math.pow(1.06, equippedWeapon.level);
    const wStarMult = 1 + equippedWeapon.stars * 0.25;
    hp += Math.floor(wpData.baseHP * wLevelMult * wStarMult);
    atk += Math.floor(wpData.baseATK * wLevelMult * wStarMult);
    def += Math.floor(wpData.baseDEF * wLevelMult * wStarMult);
    critRate += wpData.baseCritRate * wStarMult;
    critDamage += wpData.baseCritDamage * wStarMult;
  }
  return { hp, atk, def, critRate: Math.min(critRate, 1), critDamage };
}

function calculateWeaponStats(item, weaponData) {
  const levelMult = Math.pow(1.06, item.level);
  const starMult = 1 + item.stars * 0.25;
  return {
    hp: Math.floor(weaponData.baseHP * levelMult * starMult),
    atk: Math.floor(weaponData.baseATK * levelMult * starMult),
    def: Math.floor(weaponData.baseDEF * levelMult * starMult),
    critRate: weaponData.baseCritRate * starMult,
    critDamage: weaponData.baseCritDamage * starMult
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
