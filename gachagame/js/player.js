// js/player.js - 玩家数据 + 存档 + 属性计算
let player = {
  yaoXing: 1000,                    // 耀星⭐
  gold: 0,
  reinforceStone: 0,                // 强化石
  owned: [],                        // 当前拥有的角色
  weapons: [],                      // 当前拥有的武器
  unlockedChars: [],                // 永久解锁的角色ID（图鉴用）
  unlockedWeapons: [],              // 永久解锁的武器ID（图鉴用）
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
  // ==================== 经营系统新增字段 ====================
  shopLevel: 1,
  operatingPoints: 0
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
  
  // 保底默认值
  if (!player.charSsrPity) player.charSsrPity = 0;
  if (!player.charUrPity) player.charUrPity = 0;
  if (!player.weaponSsrPity) player.weaponSsrPity = 0;
  if (!player.weaponUrPity) player.weaponUrPity = 0;
  
  // 永久解锁数组默认值
  if (!player.unlockedChars) player.unlockedChars = [];
  if (!player.unlockedWeapons) player.unlockedWeapons = [];
  
  // 经营系统默认值
  if (!player.shopLevel) player.shopLevel = 1;
  if (!player.operatingPoints) player.operatingPoints = 0;

  // 更新顶部资源显示
  document.getElementById("yaoXing").textContent = player.yaoXing;
  document.getElementById("gold").textContent = player.gold;
  document.getElementById("reinforceStone").textContent = player.reinforceStone;
  
  saveGame();
}

// 性能优化：使用 Map 快速获取数据
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
  return { 
    hp, 
    atk, 
    def, 
    critRate: Math.min(critRate, 1), 
    critDamage 
  };
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

// 暴露给其他模块
window.player = player;
window.saveGame = saveGame;
window.loadGame = loadGame;
window.calculateStats = calculateStats;
window.calculateWeaponStats = calculateWeaponStats;
window.getCharacterData = getCharacterData;
window.getWeaponData = getWeaponData;
window.getRarityColor = getRarityColor;
window.getRarityBorderClass = getRarityBorderClass;
