// js/constants.js - 角色/武器池 + 常量 + 经营系统数据
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
  {id:15, name:"绚明者·阿特亚", enName:"Radiant Illuminator · Atya", rarity:"UR", 
   baseHP:195, baseATK:175, baseDEF:75, category:"强袭", 
   image:"images/Atya_Illustration.png", 
   animatedImage:"images/Atya_Dynamic.mp4",
   lore: `【绚明者——阿特亚】
职位：强袭
所属势力：联动角色/联合政府
身份：元素之神子、联合政府“元老院”三尊之首、【∅——The Empty 最高领袖之一】
*Aeltris：物质——元素系——【万般绚明】 
霞南的冬天，总是来得悄无声息。
海风掠过低矮的石屋，带着咸湿的凉意。阿特亚坐在崖边的木椅上，目光落在远处的海面。那里没有高楼切割天空，也没有霓虹刺破夜色。只有渔火点点，像被遗忘的星屑。他伸手，轻轻触碰身旁的石块。那石头冰凉，却在指尖传递出一种奇异的脉动——坚硬、沉稳、带着一点点海盐的腐蚀属性。他能感觉到万物本质，从小便是如此。
无人与他为伴。
霞南本就人烟稀少，渔民们日出而作，日落而息。他们畏惧他那双过于安静的眼睛，仿佛能看穿木头里的纹理、布料里的纤维，甚至人心底的隐秘。阿特亚不介意。他只在每年除夕，等候那一瞬。
烟花。
新年的第一朵烟花升空时，世界仿佛被点亮。红、蓝、金、紫，刹那间绽放，又倏然消逝。他坐在崖边，仰头望着。那些光不是简单的颜色，而是物质的歌唱——火药的暴烈、纸壳的脆弱、夜风的缠绕。它们在他眼中分解成无数细微的属性，交织成一曲无声的绚烂。他微微笑，笑容却带着一丝不易察觉的寂寥。那一刻，他觉得自己与世界短暂相连，却又在下一瞬被推回孤岛。
“它们总会灭的。”他曾低声自语。
2024年的冬天，烟花没有如期绽放。
起初是广播里的杂音。接着是远方传来的爆炸声，像闷雷滚过山脊。Aeltris的力量在那一夜凭空降临。有人在城市中觉醒，有人死于突如其来的暴走。旧人类惊恐，新人类狂喜，使用者则如神祇般现身。三方混战迅速吞没了大陆。霞南虽偏远，却未能幸免。
那天夜里，海风忽然变得狂躁。阿特亚站在崖边，看见第一艘渔船在浪中倾覆。船身木板碎裂的声响清晰入耳，每一块碎片都向他诉说：脆弱、断裂、绝望。他转头，村子已陷入火海。旧人类举着简陋的刀枪，新人类以超乎寻常的力量砸碎石墙，而少数觉醒的使用者则以能力撕裂夜空。
他没有逃。
火焰扑向他时，阿特亚伸出手。指尖触及的不是灼热，而是物质最本源的律动——热量、氧气、碳氢化合物的狂舞。他感受到一种前所未有的呼唤，像有谁在耳边低语：来吧，成为我的容器。
世界在那一瞬静止。
他看见了。物质之神。那是一个包容万物的炫彩二十四面体，环绕着无数不知名的光线。它没有言语，却将力量倾注进他的血脉。不是加护，而是真正的选中。Aeltris如洪流涌入，每一寸骨骼、每一缕神经都在重组。疼痛短暂，却如烟花般绚烂。他跪倒在地，双手按着地面。石块在指下融化，又重新凝固成晶莹的琉璃。
“万般绚明。”
他喃喃道。这是他为这力量取的名字。元素在他掌心听命：水可化雾、火可成莲、土可筑墙、风可织锦。所有物质的属性，皆可由他一念改写。绚烂，却不失克制。
混战在霞南持续了七天七夜。旧人类凭借阿尔维·歇那格里斯博士新发明的武器勉强支撑，新人类则以肉身对抗，使用者们高高在上，却也开始出现暴走的裂痕。阿特亚没有停留。他转身，背对已成废墟的石屋，向北而去。
一路“杀”向中原。
不是嗜血的杀戮，而是绝望中的推进。海边的小径上，旧人类与新人类的混战如野火蔓延。他抬手，海水升腾，化作晶莹的利刃，精准地切断那些失控的暴走之力。鲜血染红沙滩，却在下一瞬被他以元素之力蒸发，只余下淡淡的咸腥。每一场交锋，都让他看到人心的破碎——恐惧、贪婪、狂热。他没有言语，只是前行。身后，残存的村民被他以光幕护送至安全的山坳。
山路蜿蜒，进入内陆。城市已成焦土。高楼的钢筋在风中扭曲，诉说着曾经的坚固与如今的脆弱。他遇见成群的旧人类反抗者，他们举着简陋武器，却在使用者面前如蝼蚁。新人类试图以蛮力夺取资源，却被混沌系的毁灭吞没。阿特亚走过战场，将崩塌的混凝土重塑为通途，将熊熊烈火转为温润的暖光。他“杀”出的路，是以绚明之力划开的界限——那些失控的使用者，在他面前如烟花般绽放后归于寂灭。不是愤怒，而是必然。
中原的平原上，废墟连绵。曾经的繁华，如今只剩断壁残垣。幸存者们在绝望中聚集，有人已丧失理智，有人尚存一丝清明。阿特亚站在焦黑的土地上，感受着脚下土壤的属性：干裂、死寂、隐隐的血腥。他没有高喊，只是伸出手。万般绚明如夜空烟火般展开，将尚存理智的旧人类、新人类、使用者尽数笼罩。火光退去，风沙平息。人们抬起头，看见那个来自南方海边的身影，眼中不再是恐惧，而是依稀的希望。
他统合了他们。在绝望中。
没有欢呼。只有沉默的行军。阿特亚走在最前，身后是三方混杂的队伍。旧人类扛着他们的武器，新人类低头跟随，使用者则第一次学会了收敛。他改写沿途的废墟：河流重归清澈，土壤恢复肥沃，断桥以元素之力重新铸就。却也亲眼见证了太多灭亡——暴走的同类在绚明中化为灰烬，理智在混战中一点点剥离。他从未停下，悲伤如海风般缠绕，却被他以克制深埋心底。
终于，在一片广袤的废土之上，队伍停驻。
天空灰蒙，风卷着尘土。阿特亚站在高处，俯视下方无数张脸庞。那些脸写满疲惫、写满创伤，却仍带着一丝求生的光。他张口，声音低沉而平稳，穿过风沙，传向每一个人。
“这是最好的时代，也是最坏的时代。Aeltris，将世间人类分为三等，但无论你是旧人类，新人类，亦或是使用者，联合政府都会进行有效的管辖。我们介入，我们管控，我们维衡……”
话语落下，如烟花的余烬，缓缓飘散。人群中，有人低头，有人握紧拳头。阿特亚的目光扫过他们，带着那份不变的寂寥。万物皆可绚明，唯独人心难测。他能改写物质的本质，却无法抹去记忆中村子焚烧的焦味、路上尸骸的沉默。
【公元2024年7月7日，即新纪元元年1月1日，新纪元人类联合政府，正式成立。】`,
  skills: `核心机制：【绚明印记】
一种可叠加的元素持续伤害（DoT）。
每层每回合对目标造成「攻击力×80%」的元素伤害。
最多叠加8层，超出上限时自动引爆超出的层数，每引爆1层造成「攻击力×120%」的元素伤害。
被动技能：绚明本源
阿特亚天生与万物属性共鸣。
主动造成伤害时，为目标额外附加1层【绚明印记】。
在附加【绚明印记】的瞬间，立即触发一次印记伤害，并提升自身30%元素伤害（最多叠加3层），同时回复自身5点终结能量，此效果每回合回复的终结能量最多20点。
敌方每有一层【绚明印记】，受到的伤害+3%。
将阿特亚造成的所有属性增伤转换为全元素增伤。
普攻：绚光初绽（消耗0技能点，冷却1回合）
“微光乍现，万物应和。”
对指定敌人造成180%攻击力的元素伤害，有100%的概率附加1层【绚明印记】；同时对周围两名敌人造成120%攻击力的元素伤害，有50%的概率附加1层【绚明印记】。
战技：万象绚华（消耗1技能点，冷却1回合）
“看啊，指尖初绽，绚烂华章。”
对敌方全体造成280%攻击力的元素伤害，为每个敌人附加4层【绚明印记】。
若任意敌人的【绚明印记】层数≥6，则全体敌人额外获得【元素凝视】：减少目标25%的防御，持续2回合，不可叠加。
战技：绚律易质（消耗1技能点，无冷却）
“吾改万物之性，唯绚明永恒。”
对指定敌人造成480%攻击力的元素伤害，使其在本回合内受到的【绚明印记】伤害提升100%（不可叠加）。
立即引爆敌人所有【绚明印记】，每引爆1层额外造成攻击力×250%的元素伤害。
引爆后回复20点终结能量，并使自身攻击力提升40%，持续2回合（不可叠加）。
终结技：万般绚明（消耗100点终结能量）
“这一瞬，世间万物皆为吾之烟火。”
对敌方全体造成840%攻击力的元素伤害 + 全场所有敌人【绚明印记】层数×240%的毁灭性元素伤害。
使敌方全体进入【绚明崩解】状态：后续3回合，每回合自动触发一次等同于引爆前该敌人身上印记层数的伤害，此伤害无视防御，且无法被驱散。
终结技结束后，阿特亚进入【神子永辉】状态：攻击力增加75%，所有伤害均无视防御，【绚明印记】附加层数+1（持续2回合，无法叠加）。`
  },
  {id:16, name:"源之光·希罗·玛利亚", enName:"Hiro Maria", rarity:"UR", 
   baseHP:230, baseATK:150, baseDEF:85, category:"辅助", 
   image:"images/Hiro_Illustration.png", 
   animatedImage:"images/Hiro_Dynamic.mp4",
   lore: `【源之光——希罗·玛利亚】
姓名：希罗·玛利亚
性别：女
年龄：20？
Aeltris：物质——力量——【源环之光】
身份：力量之神子、【起源神教】首席执行官，“起源之神”、【∅——The Empty】最高领袖之一
起源教会总部——空源环岛
群岛的午后，总是被暖阳镀上一层柔软的金边。
希罗·玛利亚轻轻推开起源教会后院的木门，权杖在掌心转了个圈，发出清脆的铃响。她今天穿着一件雪白的连衣裙，裙摆绣着细碎的银环，像随时会飞起来的云朵。镜子里的少女眨眨眼，对自己比了个小小的胜利手势。
“今天也要做最可爱的神女哦～”
她不需要权杖。【源环之光】可以瞬间、无条件地倾泻出任何加护。可她还是紧紧握着这根华丽的权杖——因为“神女”就该拿权杖嘛！这可是她偷偷在心里定下的小规则。
第一站，永远是正殿。
教徒们早已排成长队，等着他们的“起源之神”。希罗一出现，整座殿堂都亮了起来。她笑着挥挥手，像撒糖果一样把加护抛出去。
“早安呀～今天也要元气满满！”
一道道斑斓的神环在教徒们身上浮现：有人多了一层“步伐轻盈”、有人多了一层“声音悦耳”、有人直接多了三层“今天无论做什么都会顺利”。神环层层叠叠，像彩虹做成的项链。教徒们欢呼着，有人甚至激动地红了眼眶。
“神女大人！谢谢您！”
希罗歪头，兔子似的眼睛弯成月牙：“不用谢啦～希罗只是觉得，大家开心我就开心呀。”她偷偷给一个害羞的小男孩多加了一层“今天会被喜欢的人夸奖”，然后飞快地跑开，生怕被发现自己“偷偷偏心”。
离开教会，她踩着轻快的步子走在新纪元的街道上。
路边的花坛里，一只橘猫正懒洋洋地晒太阳。希罗蹲下来，伸出指尖轻轻戳了戳它的额头。
“小家伙，今天也要勇敢哦。”
一圈淡金色的神环套在猫咪脖子上——“永远不会饿肚子”加“摸头杀时会呼噜”。橘猫眯起眼，满足地蹭了蹭她的手心。希罗咯咯笑出声，尾音软软的，像棉花糖。
再往前走，一群小麻雀在树梢吵闹。她仰起脸，对着天空轻轻吹了口气。无数细小的神环像蒲公英一样飘上去——“今天能找到更多虫虫”。麻雀们欢快地扑棱翅膀，像在为她表演。
希罗抱着膝盖坐在街边长椅上，盯着蓝天发呆。
云朵慢悠悠地飘。她数着云的形状：一只兔子、一朵棉花糖、还有……阿特亚那张永远面无表情的脸？想到这里，她忍不住扑哧一笑。
“阿特亚肯定又在霞南那边装酷了吧～”
于是，她决定去找老朋友玩。
联合政府的元老院大厅里，阿特亚正低头批阅文件。希罗像一阵风一样推门而入，权杖在地板上敲出叮叮当当的轻响。
“阿特亚～！我来啦！”
她扑过去，双手背在身后，踮起脚尖在他面前转了个圈。阿特亚抬起眼，眼神一如既往地平静，却还是伸出手，轻轻揉了揉她的头顶——他知道她喜欢这个。
希罗立刻眯起眼，发出满足的哼哼声：“嘿嘿……再摸一下～”
她顺手给阿特亚套了一层“今天文件处理速度+200%”的神环。阿特亚明明知道对神子无效，却还是配合地低声说：“……谢谢。”语气里带着一丝无奈的纵容，像在哄一只撒娇的兔子。
玩够了，阿特亚摸摸她的头：“去吧，别让阿拉贝尔等太久。”
希罗开心地点点头，像只小兔子一样蹦蹦跳跳地跑了。
下一站是梦幻系神子阿拉贝尔的幻境庭院。
阿拉贝尔正靠在花藤秋千上发呆，看见希罗立刻露出温柔的笑。希罗直接冲过去抱住她：“阿拉贝尔！我们来玩‘互相加护’游戏吧～”
阿拉贝尔无奈又宠溺地叹气：“又来了？”她知道希罗的加护对神子无效，可还是乖乖伸出手。希罗立刻给她套了三层“今天梦里全是棉花糖”和一层“被希罗抱抱时会超级开心”。阿拉贝尔则回赠了一个小小的幻觉——让希罗眼前出现了漫天飞舞的彩色神环，像烟花一样。
两个少女笑成一团，在庭院里追逐着虚幻的光点。
但希罗心里最期待的，还是最后那个人。
她一路小跑，穿过联合政府与起源神教的交界地带，来到一座安静的白色尖塔前——灵魂之神子夏洛斯的居所。
推开门，夏洛斯正坐在窗边看书。无性别的神子有着一头柔顺的长发，气质清冷得像一缕月光。希罗眼睛瞬间亮成两颗星星，飞扑过去：
“小夏～！！！”
夏洛斯肩膀明显僵了一下，书页差点没拿稳。他合上书，叹了口气，声音低沉却带着无可奈何的温柔：“……希罗，我说过很多次了，不要叫我小夏。”
希罗把脸埋在他肩上，声音软绵绵的：“可是小夏就是小夏呀～最可爱的小夏！”
她像只树袋熊一样挂在夏洛斯身上，权杖随意靠在墙角。夏洛斯明明不喜欢这个称呼，可看着她亮晶晶的眼睛、软乎乎的笑容，却怎么也生不起气来。他最终还是伸手，轻轻拍了拍她的背——像在安抚一只吵闹却又让人无法拒绝的小兔子。
希罗立刻开心得眼睛弯成月牙：“嘿嘿～小夏今天也要被希罗加护哦！”
她一口气给夏洛斯套了五层加护：“今天心情超级好”“被希罗抱抱时会脸红”“晚上做梦梦到希罗”“无论如何都讨厌不起来希罗”……夏洛斯每听一层，嘴角就忍不住抽一下，却还是配合地低声说：“……谢谢。”
最后，希罗满足地窝在他怀里，哼着不成调的小曲。
“小夏，我最喜欢你了～”
夏洛斯低头，看着这只把全世界都当成糖果的少女，眼神里是满满的、无可奈何却又温柔到极致的纵容。他轻轻叹息，却还是伸手揉了揉她的头发。
夕阳的余晖洒进塔内，把两个身影镀成温暖的橙色。
希罗闭上眼，嘴角始终挂着甜甜的笑。
这一天，又是圆满又开心的一天呢。
起源神教的钟声在远处悠扬响起。希罗知道，明天还要继续做最可爱的神女，继续给大家撒加护，继续去找朋友们玩，继续……叫夏洛斯“小夏”。
她轻声呢喃，像在说给全世界听：
“希罗呀，真的超级幸福～”`,
   skills: `我将阐释何为超模！
希罗在场时开启【源环库】系统：
起源：库存区，最多保存10个源环。
实界：激活区，最多同时存在5个源环，全队全局生效（每种源环只能存在一个）。
玩家可随时从起源中选择任意源环放入实界（或替换），也可随时将实界中的源环移除（移除后直接消失，不返回起源）。
实界中的源环提供永久加成，直到被替换或移除，且无法被驱散、净化或覆盖。
已存在于起源和实界中的源环，不会再被创造（每种源环全场只能获得一次，直到被移除后才能再次被创造）。
源环联动
数量共鸣：实界每存在1个源环，全队全伤害提升12%（最多60%）。
高级共鸣：实界同时存在3个及以上源环时，全队每次行动后有50%的概率回复1技能点；存在5个时，全队免疫1次致命伤害（每角色每场限1次）。
22种不同的源环：
力量源环：全队攻击力 +52%
生机源环：全队生命上限 +52%，受到治疗量 +70%
迅捷源环：全队行动条提前38%（全队拉条）
锋芒源环：全队暴击率 +25%，暴击伤害 +82%
坚盾源环：全队受到伤害降低38%
恩赐源环：全队技能点上限 +2，每次行动后全队回复1.5技能点
回响源环：每当任意队友行动后，全队回复希罗攻击力×38% + 自身最大生命值×26%的生命值
涌泉源环：每当队友受到治疗时，全队行动条额外提前24%
辉映源环：每当队友释放终结技时，全队回复32点终结能量
联结源环：实界每存在1个源环，全队全伤害额外 +12%（与数量共鸣叠加）
极辉源环：实界源环数量≥4时，全队免疫1次控制效果，且终结技伤害 +58%
守护源环：全队下一次受到伤害时减少88%并返还38%给攻击者（持续2回合）
破晓源环：全队普攻与战技伤害 +52%
星芒源环：全队暴击时额外造成40%追加伤害
毁灭源环：全队对敌人造成的伤害 +38%；若实界存在力量源环，额外 +22%
共振源环：新源环放入实界时，全队全伤害提升22%（持续2回合）；若实界存在联结源环，效果延长至3回合
圣愈源环：全队治疗量 +85%，治疗溢出部分转化为等量护盾；若实界存在生机源环，额外使治疗量 +25%
疾风源环：全队速度 +45%，行动条额外提前25%；若实界存在迅捷源环，额外使全队普攻伤害 +30%
幻影源环：全队受到伤害降低25%，并有28%概率完全闪避本次伤害；若实界存在坚盾源环，闪避概率 +15%
愤怒源环：全队每次暴击后，下一次行动攻击力 +35%（持续1回合）；若实界存在锋芒源环，暴击后额外回复15点终结能量
庇佑源环：全队每回合开始获得1层庇佑（最多4层），每层减少18%受到伤害；若实界存在守护源环，每层额外回复8%最大生命值
终章源环：全队终结技消耗能量降低28点，且终结技后全队立即行动一次；若实界存在辉映源环，终结技伤害额外 +35%
被动技能：源光永存
希罗天生是力量的源头。
战斗开始时，自动创造4个随机源环进入起源。
每当任意队友行动后，希罗自动创造1个随机源环进入起源（每回合最多创造4个）。
每次有源环被放入实界时：
全队立即回复「希罗攻击力×20% + 自身最大生命值×15%」的生命值，并使全队下一次行动提前12%。
希罗对敌方全体造成「希罗攻击力×120% + 实界源环数量×65%」的元素伤害（此伤害视为追加伤害）。
希罗的所有治疗、拉条、加护效果均视为“全元素增益”，无视任何抵抗或削弱。
战技1：环华初绽（消耗1技能点，冷却1回合）
“来呀，让希罗给大家一个大大的拥抱～”
创造3个指定源环进入起源（玩家可自行选择种类）。
立即为全队回复「希罗攻击力×120% + 自身最大生命值×40%」的生命值，并驱散全队所有负面效果。
同时对敌方全体造成「希罗攻击力×150% + 实界当前源环数量×70%」的元素伤害（此伤害视为追加伤害）。
若此时实界已存在3个及以上源环，则额外使全队下一次行动提前32%（全队拉条）。
战技2：源律恩赐（消耗1技能点，冷却1回合）
“希罗最喜欢大家了，所以要给你们最棒的加护！”
创造2个指定源环进入起源（玩家可自行选择种类）。
为全队回复「希罗攻击力×180% + 自身最大生命值×50%」的生命值，并使指定一名队友立即行动一次（提前行动）。
同时对指定敌人造成「希罗攻击力×300% + 实界当前源环数量×110%」的元素伤害（此伤害视为追加伤害）。
若此时实界已存在4个及以上源环，则额外为全队回复2点技能点，并使全队攻击力提升35%（持续2回合，不可叠加）。
终结技：万源归一·极光神环（消耗100点终结能量）
“这一刻，希罗把全世界最温柔的光，都给你们哦～”
创造6个指定源环进入起源（玩家可自行选择种类，若起源已满则覆盖最早的）。
立即为全队回复「希罗攻击力×280% + 自身最大生命值×75%」的生命值，并驱散全队所有负面效果。
同时对敌方全体造成「希罗攻击力×650% + 实界当前源环数量×160%」的毁灭性元素伤害（此伤害视为追加伤害）。
使全队进入【起源永辉】状态3回合：
所有伤害提升65%
受到伤害降低48%
行动条永久提前38%（全队拉条）
最大技能点上限+2，每回合结束后回复技能点+1
终结技结束后，希罗进入【神女微笑】状态2回合：治疗量+80%，且每次释放战技时额外创造2个源环进入起源，同时希罗下一次伤害提升40%（可叠加）。`
  }
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
const worldviewPool = [
  {
    id: 1,
    name: "Aeltris",
    image: "images/Aeltris.jpg",                  // ← 请把对应图片放进 images/ 文件夹
    description: `Aeltris是物质之神，呈现为包容万物的炫彩二十四面体。它将“万般绚明”的力量赐予阿特亚，使其能自由改写世间一切物质的属性（火→冰、钢→水晶等）。Aeltris代表着“物质即规则”的核心世界观。`
  },
  {
    id: 2,
    name: "人类等级",
    image: "images/HumanRank.jpg",
    description: `新纪元将人类分为三等：旧人类（普通人）、新人类（觉醒肉身强化者）、使用者（获得能力者）。联合政府对三者进行严格管辖与平衡，避免混战。`
  },
  {
    id: 3,
    name: "五大系别",
    image: "images/FiveElements.jpg",
    description: `元素系别分为：物质（Aeltris系）、混沌、秩序、时空、精神五大系。每个系别对应不同的能力表现与世界规则。`
  },
  {
    id: 4,
    name: "圣痕/暴走/加护/",
    image: "images/Stigmata.jpg",
    description: `圣痕：能力觉醒的印记；暴走：能力失控导致的毁灭状态；加护：神明或更高存在的临时力量庇护。三者是使用者能力的核心机制。`
  },
  {
    id: 5,
    name: "复数使用者",
    image: "images/MultipleUsers.jpg",
    description: `指同时拥有两种以上系别能力的使用者，极为稀有且强大，但也更容易暴走。联合政府对其进行重点监控与保护。`
  },
  {
    id: 6,
    name: "新名词",
    image: "images/新图片.jpg",
    description: `这里写完整的详细解释，支持换行`
  }
];

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
window.merchantPermanent = merchantPermanent;
window.materialPrices = materialPrices;
window.worldviewPool = worldviewPool;
