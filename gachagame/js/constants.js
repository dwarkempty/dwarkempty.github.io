// js/constants.js - 角色/武器池 + 常量 + 经营系统数据（完整版，无任何省略）
const characterPool = [
  {id:1, name:"森林游侠·艾伦", enName:"Forest Ranger · Allen", rarity:"R", baseHP:125, baseATK:72, baseDEF:48, category:"强袭", image:"images/Allen_Illustration.jpg"},
  {id:2, name:"火焰学徒·莎莉", enName:"Flame Apprentice · Sally", rarity:"R", baseHP:108, baseATK:88, baseDEF:38, category:"辅助", image:"images/Sally_Illustration.jpg"},
  {id:3, name:"铁壁卫士·巴克", enName:"Ironclad Guardian · Buck", rarity:"R", baseHP:145, baseATK:62, baseDEF:72, category:"近卫", image:"images/Buck_Illustration.jpg"},
  {id:4, name:"月影精灵·莉莉", enName:"Moonshadow Elf · Lily", rarity:"R", baseHP:115, baseATK:82, baseDEF:45, category:"辅助", image:"images/Lily_Illustration.jpg"},
  {id:5, name:"疾风剑豪·凯尔", enName:"Gale Swordmaster · Kael", rarity:"SR", baseHP:158, baseATK:98, baseDEF:52, category:"强袭", image:"images/Kael_Illustration.jpg"},
  {id:6, name:"自然召唤师·米娅", enName:"Natural Summoner · Mia", rarity:"SR", baseHP:132, baseATK:105, baseDEF:48, category:"辅助", image:"images/Mia_Illustration.jpg"},
  {id:7, name:"雷鸣骑士·索雷", enName:"Thunder Knight · Sorey", rarity:"SR", baseHP:165, baseATK:90, baseDEF:58, category:"强袭", image:"images/Sorey_Illustration.jpg"},
  {id:8, name:"暗夜刺客·影刃", enName:"Shadow Assassin · Shadowblade", rarity:"SR", baseHP:128, baseATK:118, baseDEF:50, category:"强袭", image:"images/Shadowblade_Illustration.jpg"},
  {id:9, name:"星辰魔导师·塞尔维亚", enName:"Starlight Archmage · Sylvia", rarity:"SSR", baseHP:185, baseATK:82, baseDEF:78, category:"辅助", image:"images/Sylvia_Illustration.jpg"},
  {id:10, name:"幻月弓神·阿蕾莎", enName:"Illusion Moon Archer Goddess · Alesha", rarity:"SSR", baseHP:172, baseATK:95, baseDEF:65, category:"强袭", image:"images/Alesha_Illustration.jpg"},
  {id:11, name:"圣辉骑士王·加兰", enName:"Holy Radiance Knight King · Galan", rarity:"SSR", baseHP:198, baseATK:88, baseDEF:85, category:"近卫", image:"images/Galan_Illustration.jpg"},
  {id:12, name:"凤凰圣女·菲妮克斯", enName:"Phoenix Saintess · Phoenix", rarity:"SSR", baseHP:175, baseATK:110, baseDEF:70, category:"近卫", image:"images/Phoenix_Illustration.jpg"},
  {id:13, name:"创世光辉·露娜薇尔", enName:"Genesis Radiance · Lunaviel", rarity:"UR", baseHP:230, baseATK:145, baseDEF:95, category:"辅助", image:"images/Lunaviel_Illustration.jpg"},
  {id:14, name:"永恒时女·克罗诺", enName:"Eternal Time Maiden · Chrono", rarity:"UR", baseHP:210, baseATK:155, baseDEF:88, category:"辅助", image:"images/Chrono_Illustration.jpg"},
  {id:15, name:"元素起源·埃尔温", enName:"Element Origin · Elwin", rarity:"UR", baseHP:205, baseATK:160, baseDEF:92, category:"辅助", image:"images/Elwin_Illustration.jpg"}
];

const weaponPool = [
  {id:1, name:"森林魔杖", enName:"Forest Wand", rarity:"R", type:"权杖", image:"images/ForestWand.jpg", baseHP:40, baseATK:25, baseDEF:15, baseCritRate:0.02, baseCritDamage:0.15},
  {id:2, name:"铁锋冒险剑", enName:"Iron Edge", rarity:"R", type:"单手剑", image:"images/IronEdge.jpg", baseHP:20, baseATK:50, baseDEF:25, baseCritRate:0, baseCritDamage:0.2},
  {id:3, name:"影林双刃", enName:"Shadowwood Twin Blades", rarity:"R", type:"双刀", image:"images/ShadowwoodTwinBlades.jpg", baseHP:25, baseATK:45, baseDEF:20, baseCritRate:0.03, baseCritDamage:0.25},
  {id:4, name:"猎手短弓", enName:"Hunter’s Shortbow", rarity:"R", type:"弓箭", image:"images/Hunter'sShortbow.jpg", baseHP:15, baseATK:55, baseDEF:10, baseCritRate:0.04, baseCritDamage:0.3},
  {id:5, name:"紫晶唤魔杖", enName:"Amethyst Summoning Staff", rarity:"SR", type:"权杖", image:"images/AmethystSummoningStaff.jpg", baseHP:65, baseATK:40, baseDEF:25, baseCritRate:0.04, baseCritDamage:0.3},
  {id:6, name:"雷鸣圣剑", enName:"Thunderclap Holy Sword", rarity:"SR", type:"单手剑", image:"images/ThunderclapHolySword.jpg", baseHP:30, baseATK:75, baseDEF:35, baseCritRate:0, baseCritDamage:0.4},
  {id:7, name:"夜刃双刺", enName:"Nightblade Twin Daggers", rarity:"SR", type:"双刀", image:"images/NightbladeTwinDaggers.jpg", baseHP:35, baseATK:70, baseDEF:25, baseCritRate:0.05, baseCritDamage:0.35},
  {id:8, name:"幻影长弓", enName:"Phantom Longbow", rarity:"SR", type:"弓箭", image:"images/PhantomLongbow.jpg", baseHP:20, baseATK:80, baseDEF:15, baseCritRate:0.06, baseCritDamage:0.45},
  {id:9, name:"星河魔典", enName:"Starriver Codex", rarity:"SSR", type:"权杖", owner:9, image:"images/StarriverCodex.jpg", baseHP:90, baseATK:55, baseDEF:40, baseCritRate:0.05, baseCritDamage:0.4},
  {id:10, name:"幻月神弓·月影弦", enName:"Lunar Shadow String", rarity:"SSR", type:"弓箭", owner:10, image:"images/LunarShadowString.jpg", baseHP:45, baseATK:110, baseDEF:30, baseCritRate:0.08, baseCritDamage:0.55},
  {id:11, name:"圣辉王剑·光誓", enName:"Holy Radiance King Sword", rarity:"SSR", type:"单手剑", owner:11, image:"images/HolyRadianceKingSword.jpg", baseHP:55, baseATK:105, baseDEF:55, baseCritRate:0, baseCritDamage:0.5},
  {id:12, name:"涅槃圣杖·凤翼", enName:"Nirvana Holy Staff", rarity:"SSR", type:"权杖", owner:12, image:"images/NirvanaHolyStaff.jpg", baseHP:110, baseATK:70, baseDEF:45, baseCritRate:0.06, baseCritDamage:0.45},
  {id:13, name:"创世起源杖·光始", enName:"Genesis Origin Staff", rarity:"UR", type:"权杖", owner:13, image:"images/GenesisOriginStaff.jpg", baseHP:150, baseATK:100, baseDEF:80, baseCritRate:0.08, baseCritDamage:0.6},
  {id:14, name:"永恒逆转杖·时轮", enName:"Chrono Wheel", rarity:"UR", type:"权杖", owner:14, image:"images/ChronoWheel.jpg", baseHP:130, baseATK:120, baseDEF:70, baseCritRate:0.1, baseCritDamage:0.7},
  {id:15, name:"元素起源杖·万象", enName:"Element Origin Staff", rarity:"UR", type:"权杖", owner:15, image:"images/ElementOriginStaff.jpg", baseHP:140, baseATK:130, baseDEF:75, baseCritRate:0.09, baseCritDamage:0.65}
];

const rarityWeights = { R: 60, SR: 25, SSR: 12, UR: 3 };
const decomposeValue = { R: 10, SR: 50, SSR: 200, UR: 1000 };
const rarityOrder = { UR: 4, SSR: 3, SR: 2, R: 1 };

const characterMap = new Map(characterPool.map(c => [c.id, c]));
const weaponMap = new Map(weaponPool.map(w => [w.id, w]));

// ==================== 经营系统数据（已按要求修改） ====================
const materialsPool = [
  {id:1, name:"红史莱姆粘液", desc:"红色史莱姆的液体，可用于基础治疗", rarity:"R"},
  {id:2, name:"小枯骨", desc:"骷髅怪的部件，可加强药效", rarity:"R"},
  {id:3, name:"蓝史莱姆粘液", desc:"蓝色史莱姆的液体，可加强自身魔力", rarity:"R"},
  {id:4, name:"哥布林指甲", desc:"哥布林身上的珍贵部件", rarity:"SR"},
  {id:5, name:"水", desc:"液体基底", rarity:"R"},
  {id:6, name:"酒", desc:"液体基底", rarity:"SR"}
];

const recipesPool = [
  {id:1, name:"基础治疗药水", materials:[{id:1,qty:1},{id:5,qty:1}], gold:100, minLevel:1},
  {id:2, name:"基础魔力药水", materials:[{id:3,qty:1},{id:5,qty:1}], gold:100, minLevel:1},
  {id:3, name:"基础抗性药水", materials:[{id:4,qty:1},{id:5,qty:1}], gold:120, minLevel:1},
  {id:4, name:"基础全能药剂", materials:[{id:1,qty:1},{id:3,qty:1},{id:2,qty:1},{id:6,qty:1}], gold:500, minLevel:1}
];

const customerTemplates = [
  "我需要一瓶基础治疗药水",
  "我需要一瓶能补充自身魔力的药水",
  "我希望我能变得更加坚硬！",
  "我现在全身受伤，魔力散失，急需一瓶药水！"
];

// 需求匹配映射（用于严格检查）
const demandToRecipe = {
  "治疗": 1,
  "基础治疗": 1,
  "魔力": 2,
  "补充魔力": 2,
  "坚硬": 3,
  "抗性": 3,
  "受伤": 4,
  "魔力散失": 4,
  "全能": 4
};

window.characterPool = characterPool;
window.weaponPool = weaponPool;
window.rarityWeights = rarityWeights;
window.decomposeValue = decomposeValue;
window.rarityOrder = rarityOrder;
window.characterMap = characterMap;
window.weaponMap = weaponMap;
window.materialsPool = materialsPool;
window.recipesPool = recipesPool;
window.customerTemplates = customerTemplates;
window.demandToRecipe = demandToRecipe;
