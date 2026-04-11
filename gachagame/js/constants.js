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

// ==================== 材料池（水和酒已移到最下面） ====================
const materialsPool = [
  {id:1, name:"红史莱姆粘液", desc:"红色史莱姆的液体，可用于基础治疗", rarity:"R"},
  {id:2, name:"蓝史莱姆粘液", desc:"蓝色史莱姆的液体，可加强自身魔力", rarity:"R"},
  {id:3, name:"绿史莱姆粘液", desc:"绿色史莱姆的液体，可恢复体力与精力", rarity:"R"},
  {id:4, name:"小枯骨", desc:"骷髅怪的部件，可加强药效、延长持续时间", rarity:"R"},
  {id:5, name:"哥布林指甲", desc:"哥布林身上的珍贵部件，可提升抗性与防御", rarity:"SR"},
  {id:6, name:"蜘蛛毒腺", desc:"洞穴蜘蛛掉落，可制造轻微毒性或麻痹效果", rarity:"SR"},
  {id:7, name:"蝙蝠翅膜", desc:"吸血蝙蝠的薄膜，可提升夜视能力或轻微吸血回复", rarity:"SR"},
  {id:8, name:"狼牙", desc:"灰狼掉落，可增加攻击欲望与爆发力", rarity:"SR"},
  {id:9, name:"石巨人碎屑", desc:"小型石巨人掉落，可强化身体硬度", rarity:"SR"},
  {id:10, name:"幽灵残片", desc:"低级幽灵掉落，可短暂提升精神抗性", rarity:"SSR"},
  {id:13, name:"火蜥蜴鳞片", desc:"火焰蜥蜴掉落，可赋予火焰抗性或灼烧效果", rarity:"SR"},
  {id:14, name:"雷电结晶", desc:"雷鸟掉落，可提升速度与反应力", rarity:"SR"},
  {id:15, name:"巨型蘑菇孢子", desc:"地下真菌怪掉落，可提供持续再生", rarity:"SR"},
  {id:16, name:"影魔残影", desc:"影子刺客掉落，可短暂提升闪避能力", rarity:"SSR"},
  {id:17, name:"魔力水晶碎片", desc:"魔晶守护者掉落，可大幅增强魔力输出", rarity:"SSR"},
  {id:18, name:"亡灵精华", desc:"高级亡灵掉落，可提供不死之力（持续回复）", rarity:"SSR"},
  {id:19, name:"凤凰羽毛", desc:"凤凰幼体掉落，可极强治疗与复苏", rarity:"UR"},
  {id:20, name:"古龙血滴", desc:"远古龙类掉落，全方位强化身体素质", rarity:"UR"},
  // 基底材料放到最下面
  {id:11, name:"水", desc:"普通液体基底，无特殊效果，稳定易用", rarity:"R"},
  {id:12, name:"酒", desc:"酒精液体基底，可增强药效但可能产生轻微副作用", rarity:"SR"}
];

const recipesPool = [
  {id:1, level:1, name:"基础治疗药水", materials:[{id:1,qty:1},{id:11,qty:1}], gold:100, operating:5},
  {id:2, level:1, name:"基础魔力药水", materials:[{id:2,qty:1},{id:11,qty:1}], gold:100, operating:5},
  {id:3, level:1, name:"基础体力药水", materials:[{id:3,qty:1},{id:11,qty:1}], gold:100, operating:5},
  {id:4, level:1, name:"基础抗性药水", materials:[{id:5,qty:1},{id:11,qty:1}], gold:120, operating:5},
  {id:5, level:2, name:"爆发力量药水", materials:[{id:8,qty:1},{id:12,qty:1}], gold:250, operating:7},
  {id:6, level:2, name:"坚韧护甲药水", materials:[{id:9,qty:1},{id:11,qty:1}], gold:220, operating:6},
  {id:7, level:2, name:"精神安定药水", materials:[{id:10,qty:1},{id:11,qty:1}], gold:230, operating:6},
  {id:8, level:2, name:"夜视侦察药水", materials:[{id:7,qty:1},{id:11,qty:1}], gold:180, operating:5},
  {id:9, level:3, name:"强效治疗药水", materials:[{id:1,qty:1},{id:4,qty:1},{id:11,qty:1}], gold:350, operating:8},
  {id:10, level:3, name:"魔力强化药水", materials:[{id:2,qty:1},{id:3,qty:1},{id:12,qty:1}], gold:320, operating:8},
  {id:11, level:3, name:"毒刃药水", materials:[{id:6,qty:1},{id:8,qty:1},{id:12,qty:1}], gold:300, operating:7},
  {id:12, level:3, name:"基础全能药剂", materials:[{id:1,qty:1},{id:2,qty:1},{id:4,qty:1},{id:12,qty:1}], gold:500, operating:10},
  {id:13, level:4, name:"火焰爆发药水", materials:[{id:13,qty:1},{id:8,qty:1},{id:12,qty:1}], gold:450, operating:9},
  {id:14, level:4, name:"雷霆护盾药水", materials:[{id:14,qty:1},{id:9,qty:1},{id:11,qty:1}], gold:480, operating:10},
  {id:15, level:4, name:"再生活力药水", materials:[{id:15,qty:1},{id:3,qty:1},{id:4,qty:1}], gold:420, operating:9},
  {id:16, level:4, name:"暗影闪避药水", materials:[{id:16,qty:1},{id:7,qty:1},{id:12,qty:1}], gold:400, operating:9},
  {id:17, level:5, name:"魔力风暴药水", materials:[{id:17,qty:1},{id:2,qty:1},{id:14,qty:1},{id:12,qty:1}], gold:750, operating:12},
  {id:18, level:5, name:"不死战意药水", materials:[{id:18,qty:1},{id:4,qty:1},{id:1,qty:1}], gold:680, operating:11},
  {id:19, level:5, name:"凤凰复苏药水", materials:[{id:19,qty:1},{id:1,qty:1},{id:4,qty:1},{id:11,qty:1}], gold:720, operating:12},
  {id:20, level:5, name:"龙血强化药水", materials:[{id:20,qty:1},{id:13,qty:1},{id:8,qty:1},{id:12,qty:1}], gold:800, operating:13}
];

// ==================== 精确顾客需求列表（保持你上次提供的完整列表） ====================
const customerDemands = [
  // 1级商店
  {id:1, level:1, demand:"喂，老板！我跟红色史莱姆打架受伤了，来一瓶基础治疗药水！", satisfy:[1,9,12]},
  {id:2, level:1, demand:"我需要一瓶能补充自身魔力的药水，下一场战斗要靠它了。", satisfy:[2,10,12]},
  {id:3, level:1, demand:"跑了半天腿都软了，有恢复体力跟精力的药吗？", satisfy:[3,10,12]},
  {id:4, level:1, demand:"下一个地牢怪物攻击好高，我要提升抗性，先来瓶基础抗性药水！", satisfy:[4,6,12]},
  {id:5, level:1, demand:"我希望我能变得更加坚硬！皮再厚一点就好了。", satisfy:[6,4,12]},
  {id:6, level:1, demand:"我要一瓶基础魔力药水，蓝史莱姆粘液那种！", satisfy:[2,10,12]},
  {id:7, level:1, demand:"我现在只想快速回血，其他都不重要！", satisfy:[1,9,12]},

  // 2级商店
  {id:8, level:2, demand:"我希望我能变得更加坚硬！皮再厚一点就好了。", satisfy:[6,4,12]},
  {id:9, level:2, demand:"我想要能够增强我实力的药水，越猛越好！", satisfy:[5,6,7,11,12]},
  {id:10, level:2, demand:"地牢里太黑了，有没有能让我看清路的药水？", satisfy:[8,12]},
  {id:11, level:2, demand:"精神老是恍惚，下个幽灵区要疯了，有安定精神的药水不？", satisfy:[7,12]},
  {id:12, level:2, demand:"给我狼牙和酒的组合，我要爆发一下！", satisfy:[5,11]},
  {id:13, level:2, demand:"石巨人碎屑加水，能不能让我更耐打？", satisfy:[6,4]},
  {id:14, level:2, demand:"蝙蝠翅膜加水的药水，我要夜视能力！", satisfy:[8]},
  {id:15, level:2, demand:"幽灵残片加水的药水，能不能让我不怕精神攻击？", satisfy:[7,12]},

  // 3级商店
  {id:16, level:3, demand:"给我来点红史莱姆粘液加小枯骨的组合，效果要强一点的！", satisfy:[9,12]},
  {id:17, level:3, demand:"我想让武器带点毒，下次打哥布林轻松点，有那种药吗？", satisfy:[11,12]},
  {id:18, level:3, demand:"我魔力跟体力都没了，来瓶能一起补的！", satisfy:[10,12]},
  {id:19, level:3, demand:"快！我要最强的治疗药水，红史莱姆粘液加小枯骨那种！", satisfy:[9,12]},
  {id:20, level:3, demand:"蜘蛛毒腺加狼牙再加酒，我要毒刃效果的！", satisfy:[11]},
  {id:21, level:3, demand:"绿史莱姆粘液加蓝史莱姆粘液，再加点酒，效果要猛！", satisfy:[10]},

  // 4级商店
  {id:22, level:4, demand:"下一个boss会喷火，我需要能抗火又能反击的药水！", satisfy:[13,6,12]},
  {id:23, level:4, demand:"我速度太慢了，有没有能让我像闪电一样快的药？", satisfy:[14,5]},
  {id:24, level:4, demand:"我伤口一直不愈合，需要强力再生的药水！", satisfy:[15,9]},
  {id:25, level:4, demand:"影子怪物太多，我要能躲开的药水！", satisfy:[16,8]},
  {id:26, level:4, demand:"给我火蜥蜴鳞片加狼牙的组合，我要爆发输出！", satisfy:[13]},
  {id:27, level:4, demand:"雷电结晶加石巨人碎屑，能不能让我又快又硬？", satisfy:[14]},
  {id:28, level:4, demand:"蘑菇孢子加绿史莱姆粘液，我要一直回血！", satisfy:[15]},
  {id:29, level:4, demand:"影魔残影加蝙蝠翅膜，我要隐身闪避！", satisfy:[16]},
  {id:30, level:4, demand:"我需要一瓶既能打又能防的全面强化药水！", satisfy:[13,14,12]},

  // 5级商店
  {id:31, level:5, demand:"魔力快耗尽了，我要最强的魔力药水！", satisfy:[17,10]},
  {id:32, level:5, demand:"我快死了，但还想再战！有没有不死的药？", satisfy:[18,19]},
  {id:33, level:5, demand:"给我能起死回生的药水，凤凰那种！", satisfy:[19,9]},
  {id:34, level:5, demand:"我要全面无敌！龙血那种最强的强化药水！", satisfy:[20,12]},
  {id:35, level:5, demand:"魔力水晶碎片加蓝史莱姆粘液，再加雷电结晶！", satisfy:[17]},
  {id:36, level:5, demand:"亡灵精华加小枯骨，我要不死之身！", satisfy:[18]},
  {id:37, level:5, demand:"凤凰羽毛加红史莱姆粘液，我要复苏！", satisfy:[19]},
  {id:38, level:5, demand:"古龙血滴加火蜥蜴鳞片和狼牙，我要最强爆发！", satisfy:[20]},
  {id:39, level:5, demand:"我现在什么都需要，最全面的顶级药水！", satisfy:[20,19,17]}
];

// ==================== 商人系统数据====================
const merchantPermanent = [
  { id: 'yaoXing', name: "450 ⭐ 耀星", costGold: 1000, qty: 450, icon: "⭐", maxBulk: 100 },
  { id: 'reinforceStone', name: "1 💎 强化石", costGold: 100, qty: 1, icon: "💎", maxBulk: 100 },
  { id: 11, name: "1 💧 水", costGold: 10, qty: 1, icon: "💧", maxBulk: 100 },
  { id: 12, name: "1 🍷 酒", costGold: 20, qty: 1, icon: "🍷", maxBulk: 100 }
];

const materialPrices = {
  1: 28, 2: 28, 3: 28, 4: 32,     // R级材料
  5: 45, 6: 48, 7: 42, 8: 50, 9: 55, 13: 60, 14: 62, 15: 58, // SR级
  10: 95, 16: 110, 17: 120, 18: 115, // SSR级
  19: 280, 20: 320                 // UR级
};

// ==================== 地牢冒险 - 完整卡牌数据库（战士 & 法师） ====================
// 卡牌结构说明：id唯一、name、type(Attack/Skill/Power)、cost能量、effects(后续战斗解析)、rarity、class(职业)、desc(显示用)

const warriorCards = [
  // 起始卡组 12张
  { id: 1001, name: "猛击", type: "Attack", cost: 1, effects: { damage: 8 }, rarity: "Common", class: "warrior", desc: "造成8点伤害 (+角色ATK)" },
  { id: 1002, name: "防御", type: "Skill", cost: 1, effects: { block: 6 }, rarity: "Common", class: "warrior", desc: "获得6点格挡 (+角色DEF)" },
  { id: 1003, name: "挥砍", type: "Attack", cost: 2, effects: { damage: 12 }, rarity: "Common", class: "warrior", desc: "造成12点伤害" },
  { id: 1004, name: "盾击", type: "Attack", cost: 2, effects: { damage: 9, debuff: "Weak:1" }, rarity: "Uncommon", class: "warrior", desc: "造成9点伤害并施加1层Weak" },
  { id: 1005, name: "狂怒", type: "Attack", cost: 0, effects: { damage: 6, strength: 1 }, rarity: "Rare", class: "warrior", desc: "造成6点伤害，本回合每伤害获得1层Strength" },
  { id: 1006, name: "钢铁之躯", type: "Skill", cost: 1, effects: { block: 10, dynamicBlock: "hpLoss*2" }, rarity: "Uncommon", class: "warrior", desc: "获得10点格挡，本回合每损失HP额外获得2点格挡" },
  { id: 1007, name: "战吼", type: "Skill", cost: 1, effects: { strength: 2 }, rarity: "Common", class: "warrior", desc: "获得2层Strength" },
  { id: 1008, name: "冲锋", type: "Attack", cost: 2, effects: { damage: 10, extraIfDebuff: { type: "Weak", damage: 8 } }, rarity: "Uncommon", class: "warrior", desc: "造成10点伤害，若敌人有Weak额外8点" },
  { id: 1009, name: "重锤", type: "Attack", cost: 3, effects: { damage: 18 }, rarity: "Common", class: "warrior", desc: "造成18点伤害" },
  { id: 1010, name: "壁垒", type: "Skill", cost: 2, effects: { block: 14, retainBlock: 0.5 }, rarity: "Uncommon", class: "warrior", desc: "获得14点格挡，下回合保留一半" },
  { id: 1011, name: "力量涌动", type: "Power", cost: 2, effects: { perTurn: { strength: 1 } }, rarity: "Rare", class: "warrior", desc: "每回合开始获得1层Strength" },
  { id: 1012, name: "复仇", type: "Attack", cost: 1, effects: { damage: 7, doubleIfDamaged: true }, rarity: "Uncommon", class: "warrior", desc: "造成7点伤害，本回合已受伤害则翻倍" },

  // 额外卡牌池 6张
  { id: 1013, name: "血祭", type: "Attack", cost: 1, effects: { damage: 10, selfDamage: 3 }, rarity: "Rare", class: "warrior", desc: "造成10点伤害，自己损失3HP" },
  { id: 1014, name: "完美防御", type: "Skill", cost: 0, effects: { block: 5, nextAttackBlock: 12 }, rarity: "Uncommon", class: "warrior", desc: "获得5点格挡，下次受击额外12点格挡" },
  { id: 1015, name: "狂战士", type: "Power", cost: 3, effects: { perTurn: { strength: 2, selfDamage: 1 } }, rarity: "Rare", class: "warrior", desc: "每回合+2Strength，但结束时损失1HP" },
  { id: 1016, name: "裂地斩", type: "Attack", cost: 2, effects: { damage: 15, area: true }, rarity: "Uncommon", class: "warrior", desc: "对所有敌人造成15点伤害" },
  { id: 1017, name: "不屈意志", type: "Skill", cost: 1, effects: { block: 8, strengthIfLowHp: 3 }, rarity: "Rare", class: "warrior", desc: "获得8点格挡，若HP<30%获得3层Strength" },
  { id: 1018, name: "终极防御", type: "Power", cost: 3, effects: { perTurn: { block: 5 } }, rarity: "Rare", class: "warrior", desc: "每回合开始获得5点格挡" }
];

const mageCards = [
  // 起始卡组 12张
  { id: 2001, name: "火球术", type: "Attack", cost: 1, effects: { damage: 7, burn: 4 }, rarity: "Common", class: "mage", desc: "造成7点伤害，附加4点Burn" },
  { id: 2002, name: "冰盾", type: "Skill", cost: 1, effects: { block: 8, debuff: "Weak:1" }, rarity: "Common", class: "mage", desc: "获得8点格挡，敌人下次攻击附加Weak" },
  { id: 2003, name: "闪电链", type: "Attack", cost: 2, effects: { damage: 9, splash: 5 }, rarity: "Uncommon", class: "mage", desc: "造成9点伤害，随机另一目标5点" },
  { id: 2004, name: "法力涌动", type: "Skill", cost: 0, effects: { extraEnergy: 1 }, rarity: "Uncommon", class: "mage", desc: "本回合获得1点额外能量" },
  { id: 2005, name: "元素召唤", type: "Power", cost: 2, effects: { perTurn: { burn: 3 } }, rarity: "Rare", class: "mage", desc: "每回合结束对敌人造成3点Burn" },
  { id: 2006, name: "霜冻射线", type: "Attack", cost: 1, effects: { damage: 6, debuff: "Weak:2" }, rarity: "Common", class: "mage", desc: "造成6点伤害，施加2层Weak" },
  { id: 2007, name: "魔力护盾", type: "Skill", cost: 2, effects: { block: 12, drawIfHit: 2 }, rarity: "Uncommon", class: "mage", desc: "获得12点格挡，下次受伤害抽2张牌" },
  { id: 2008, name: "连锁闪电", type: "Attack", cost: 3, effects: { damage: 14, area: 6 }, rarity: "Rare", class: "mage", desc: "造成14点伤害，所有敌人额外6点" },
  { id: 2009, name: "奥术飞弹", type: "Attack", cost: 1, effects: { damage: 5, multiHit: true }, rarity: "Common", class: "mage", desc: "造成5点伤害，每多支付1能量多发射1枚" },
  { id: 2010, name: "时间扭曲", type: "Skill", cost: 1, effects: { nextDrawBonus: 2 }, rarity: "Uncommon", class: "mage", desc: "下回合抽牌+2张" },
  { id: 2011, name: "元素掌控", type: "Power", cost: 3, effects: { perTurn: { randomStat: 1 } }, rarity: "Rare", class: "mage", desc: "每回合开始随机获得1层Strength或Dexterity" },
  { id: 2012, name: "爆裂法术", type: "Attack", cost: 2, effects: { damage: 11, areaBurn: 4 }, rarity: "Uncommon", class: "mage", desc: "造成11点伤害，所有敌人额外4点Burn" },

  // 额外卡牌池 6张
  { id: 2013, name: "大法师之怒", type: "Power", cost: 2, effects: { perTurn: { extraEnergy: 1 } }, rarity: "Rare", class: "mage", desc: "每回合开始获得1点能量（上限+1）" },
  { id: 2014, name: "毒雾", type: "Skill", cost: 1, effects: { areaPoison: 3 }, rarity: "Uncommon", class: "mage", desc: "所有敌人获得3层Poison" },
  { id: 2015, name: "镜像分身", type: "Skill", cost: 0, effects: { nextAttackDouble: true }, rarity: "Rare", class: "mage", desc: "本回合下一次攻击造成双倍伤害" },
  { id: 2016, name: "奥术风暴", type: "Attack", cost: 2, effects: { damage: 8, area: true, draw: 1 }, rarity: "Uncommon", class: "mage", desc: "所有敌人造成8点伤害并抽1张牌" },
  { id: 2017, name: "永恒法阵", type: "Power", cost: 3, effects: { perTurn: { block: 4, energy: 1 } }, rarity: "Rare", class: "mage", desc: "每回合获得4点格挡和1点能量" },
  { id: 2018, name: "终极元素", type: "Power", cost: 3, effects: { perTurn: { randomElement: true } }, rarity: "Rare", class: "mage", desc: "每回合随机触发Fire/Burn/Ice效果" }
];

window.merchantPermanent = merchantPermanent;
window.materialPrices = materialPrices;
window.characterPool = characterPool;
window.weaponPool = weaponPool;
window.rarityWeights = rarityWeights;
window.decomposeValue = decomposeValue;
window.rarityOrder = rarityOrder;
window.characterMap = characterMap;
window.weaponMap = weaponMap;
window.materialsPool = materialsPool;
window.recipesPool = recipesPool;
window.customerDemands = customerDemands;
window.warriorCards = warriorCards;
window.mageCards = mageCards;
window.allDungeonCards = [...warriorCards, ...mageCards]; // 全局卡牌池，方便后续抽卡/奖励
