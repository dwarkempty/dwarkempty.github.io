// config.js - 资源路径、画廊数据、常量
const ASSETS = {
    bg: {
        arrival: 'galgame_assets/images/background/村子主街道-樱花大道.jpg',
        house: 'galgame_assets/images/background/木屋外景-春日樱花.jpg',
        interior: 'galgame_assets/images/background/木屋室内-客厅厨房.jpg',
        forest: 'galgame_assets/images/background/樱花树林-后山观景台.jpg',
        farm: 'galgame_assets/images/background/农场菜园-春季.jpg'   // Day 2 新背景
    },
    sakura: {
        standard: 'galgame_assets/images/character/乡村便服-标准站姿.png',
        one_hand: 'galgame_assets/images/character/乡村便服-单手叉腰.png',
        both_hands: 'galgame_assets/images/character/乡村便服-双手叉腰.png',
        arms_cross: 'galgame_assets/images/character/乡村便服-双臂交叉.png'
    },
    title: 'galgame_assets/images/title/title.png',
    audio: 'galgame_assets/audio/the_meadow_path.mp3'
};

const galleryItems = [
    { id: 1, title: "春日樱花大道", desc: "村子主街道，樱花盛开时的浪漫景象。", img: ASSETS.bg.arrival, unlocked: true, type: "背景" },
    { id: 2, title: "木屋外景", desc: "姬莫继承的叔叔老宅，爬满绿藤。", img: ASSETS.bg.house, unlocked: true, type: "背景" },
    { id: 3, title: "木屋室内", desc: "温馨的客厅与厨房。", img: ASSETS.bg.interior, unlocked: true, type: "背景" },
    { id: 4, title: "樱花树林观景台", desc: "后山观景台，可远眺整个布罗斯村。", img: ASSETS.bg.forest, unlocked: true, type: "背景" },
    { id: 5, title: "农场菜园-春季", desc: "Day 2 新场景：嫩绿菜苗与果树。", img: ASSETS.bg.farm, unlocked: true, type: "背景" },
    { id: 6, title: "樱花·标准站姿", desc: "温柔微笑，充满期待。", img: ASSETS.sakura.standard, unlocked: true, type: "立绘" },
    { id: 7, title: "樱花·单手叉腰", desc: "好奇与兴奋。", img: ASSETS.sakura.one_hand, unlocked: true, type: "立绘" },
    { id: 8, title: "樱花·双手叉腰", desc: "调皮自信，充满干劲。", img: ASSETS.sakura.both_hands, unlocked: true, type: "立绘" },
    { id: 9, title: "樱花·双臂交叉", desc: "害羞温柔，轻微脸红。", img: ASSETS.sakura.arms_cross, unlocked: true, type: "立绘" }
];

const MAX_SLOTS = 3;
const SAVE_PREFIX = 'galgame_save_slot_';
const STORY_TOTAL = 19; // Day 1 对话数（示例）
