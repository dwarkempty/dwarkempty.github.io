// config.js - 资源路径、画廊数据、常量
window.ASSETS = {
    bg: {
        // 旧键（兼容）
        arrival: 'galgame_assets/images/background/村子主街道-樱花大道-白天.jpg',
        house: 'galgame_assets/images/background/木屋外景-春日樱花-白天.jpg',
        interior: 'galgame_assets/images/background/木屋室内-客厅厨房-白天.jpg',
        forest: 'galgame_assets/images/background/樱花树林-后山观景台-白天＆傍晚.jpg',
        farm: 'galgame_assets/images/background/农场菜园-春季-白天.jpg',
        // 新增详细场景键
        street_day: 'galgame_assets/images/background/村子主街道-樱花大道-白天.jpg',
        shop: 'galgame_assets/images/background/村子商店-白天.jpg',
        house_day: 'galgame_assets/images/background/木屋外景-春日樱花-白天.jpg',
        house_evening: 'galgame_assets/images/background/木屋外景-春日樱花-傍晚.jpg',
        farm_day: 'galgame_assets/images/background/农场菜园-春季-白天.jpg',
        mountain: 'galgame_assets/images/background/樱花树林-后山观景台-白天＆傍晚.jpg',
        bedroom_evening: 'galgame_assets/images/background/男主卧室-傍晚.jpg'
    },
    sakura: {
        standard: 'galgame_assets/images/character/乡村便服-标准站姿.png',
        one_hand: 'galgame_assets/images/character/乡村便服-单手叉腰.png',
        both_hands: 'galgame_assets/images/character/乡村便服-双手叉腰.png',
        arms_cross: 'galgame_assets/images/character/乡村便服-双臂交叉.png'
    },
    title: 'galgame_assets/images/title/title.png',
    audio: {
        meadow: 'galgame_assets/audio/the_meadow_path.mp3',
        twilight: 'galgame_assets/audio/fields_at_twilight.mp3',
        cartoon: 'galgame_assets/audio/tiptoeing_past_the_barn_door.mp3'
    }
};

window.galleryItems = [
    { id: 1, title: "春日樱花大道", desc: "村子主街道，樱花盛开时的浪漫景象。", img: window.ASSETS.bg.arrival, unlocked: true, type: "背景" },
    { id: 2, title: "木屋外景", desc: "姬莫继承的叔叔老宅，爬满绿藤。", img: window.ASSETS.bg.house, unlocked: true, type: "背景" },
    { id: 3, title: "木屋室内", desc: "温馨的客厅与厨房。", img: window.ASSETS.bg.interior, unlocked: true, type: "背景" },
    { id: 4, title: "樱花树林观景台", desc: "后山观景台，可远眺整个布罗斯村。", img: window.ASSETS.bg.forest, unlocked: true, type: "背景" },
    { id: 5, title: "农场菜园-春季", desc: "Day 2 新场景：嫩绿菜苗与果树。", img: window.ASSETS.bg.farm, unlocked: true, type: "背景" },
    { id: 6, title: "樱花·标准站姿", desc: "温柔微笑，充满期待。", img: window.ASSETS.sakura.standard, unlocked: true, type: "立绘" },
    { id: 7, title: "樱花·单手叉腰", desc: "好奇与兴奋。", img: window.ASSETS.sakura.one_hand, unlocked: true, type: "立绘" },
    { id: 8, title: "樱花·双手叉腰", desc: "调皮自信，充满干劲。", img: window.ASSETS.sakura.both_hands, unlocked: true, type: "立绘" },
    { id: 9, title: "樱花·双臂交叉", desc: "害羞温柔，轻微脸红。", img: window.ASSETS.sakura.arms_cross, unlocked: true, type: "立绘" }
];

window.MAX_SLOTS = 3;
window.SAVE_PREFIX = 'galgame_save_slot_';
window.STORY_TOTAL = 128;
