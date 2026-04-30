// ==================== 材料池 ====================
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

// ==================== 商人系统数据 ====================
const merchantPermanent = [
  { id: 'yaoXing', name: "450 ⭐ 耀星", costGold: 1000, qty: 450, icon: "⭐", maxBulk: 100 },
  { id: 'reinforceStone', name: "1 💎 强化石", costGold: 100, qty: 1, icon: "💎", maxBulk: 100 },
  { id: 11, name: "1 💧 水", costGold: 10, qty: 1, icon: "💧", maxBulk: 100 },
  { id: 12, name: "1 🍷 酒", costGold: 20, qty: 1, icon: "🍷", maxBulk: 100 }
];

const materialPrices = {
  1: 28, 2: 28, 3: 28, 4: 32,
  5: 45, 6: 48, 7: 42, 8: 50, 9: 55, 13: 60, 14: 62, 15: 58,
  10: 95, 16: 110, 17: 120, 18: 115,
  19: 280, 20: 320
};

// ==================== 新增：世界观详解数据（数据驱动，未来扩展只需加对象） ====================

// 养成方面描述数据
window.materialsPool = materialsPool;
window.recipesPool = recipesPool;
window.customerDemands = customerDemands;
window.merchantPermanent = merchantPermanent;
window.materialPrices = materialPrices;
