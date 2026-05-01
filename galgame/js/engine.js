// engine.js - 核心游戏引擎（屏幕、对话、存档、BGM、控制等）
let currentScreen = 'title';
let dialogueIndex = 0;
let dialogueHistory = [];
let isAutoPlaying = false;
let isSkipping = false;
let isCtrlPressed = false;
let textSpeed = 45;
let autoDelay = 1600;
let currentTypewriter = null;
let autoTimer = null;
let skipTimer = null;
let bgm = null;
let currentChapter = 1;

// 从 config 和 story 读取（config.js 已挂载到 window）
const ASSETS = window.ASSETS;
const galleryItems = window.galleryItems;
const MAX_SLOTS = window.MAX_SLOTS;
const SAVE_PREFIX = window.SAVE_PREFIX;
const getStory = window.getStory;

function showScreen(screen) {
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('diary-screen').classList.add('hidden');
    
    if (screen === 'title') {
        document.getElementById('title-screen').classList.remove('hidden');
        currentScreen = 'title';
    } else if (screen === 'game') {
        document.getElementById('game-screen').classList.remove('hidden');
        currentScreen = 'game';
    } else if (screen === 'diary') {
        document.getElementById('diary-screen').classList.remove('hidden');
        currentScreen = 'diary';
    }
}

function startNewGame(chapter = 1) {
    currentChapter = chapter;
    dialogueIndex = 0;
    dialogueHistory = [];
    isAutoPlaying = false;
    isSkipping = false;
    clearInterval(autoTimer);
    clearInterval(skipTimer);
    
    document.getElementById('btn-auto').classList.remove('!text-[#f9a8d4]', 'bg-white/10');
    document.getElementById('btn-skip').classList.remove('!text-[#f9a8d4]', 'bg-white/10');
    
    showScreen('game');
    loadDialogue(0);
    initBGM();
    showToast(chapter === 1 ? '第一章开始！' : '第二章开始！');
}

function continueGame() {
    // 简单实现：读取槽位1
    const data = getSlotData(1);
    if (!data) { showToast('没有存档'); return; }
    dialogueIndex = data.index || 0;
    dialogueHistory = data.history || [];
    showScreen('game');
    loadDialogue(dialogueIndex);
    initBGM();
    showToast('已读取存档');
}

function loadDialogue(idx) {
    const story = getStory(currentChapter);
    if (idx >= story.length) {
        showChapterEnd();
        return;
    }
    
    const step = story[idx];
    dialogueIndex = idx;
    
    // 背景切换
    const bgLayer = document.getElementById('bg-layer');
    const newBg = ASSETS.bg[step.bg] || ASSETS.bg.house;
    bgLayer.style.backgroundImage = `url('${newBg}')`;
    
    // 立绘
    const charLayer = document.getElementById('character-layer');
    if (step.char && ASSETS.sakura[step.char]) {
        charLayer.style.backgroundImage = `url('${ASSETS.sakura[step.char]}')`;
        charLayer.classList.remove('hidden');
    } else {
        charLayer.classList.add('hidden');
    }
    
    // 说话人
    const speakerEl = document.getElementById('speaker-name');
    if (step.speaker === '樱花') {
        speakerEl.innerHTML = `<span class="speaker-sakura px-1">${step.speaker}</span>`;
    } else {
        speakerEl.innerHTML = `<span class="speaker-jimo px-1">${step.speaker}</span>`;
    }
    
    // 打字机
    const textEl = document.getElementById('dialogue-text');
    textEl.innerHTML = '';
    if (currentTypewriter) clearTimeout(currentTypewriter);
    
    let i = 0;
    const speed = isSkipping ? 6 : textSpeed;
    
    function typeChar() {
        if (i < step.text.length) {
            textEl.innerHTML += step.text.charAt(i);
            i++;
            currentTypewriter = setTimeout(typeChar, speed);
        } else {
            currentTypewriter = null;
            document.getElementById('next-indicator').style.opacity = '0.75';
            dialogueHistory.push({ speaker: step.speaker, text: step.text, time: new Date() });
            updateProgress();
            
            if (isAutoPlaying && !isSkipping) {
                autoTimer = setTimeout(() => advanceDialogue(), autoDelay);
            }
        }
    }
    typeChar();
    document.getElementById('next-indicator').style.opacity = '0.25';
}

function advanceDialogue() {
    if (currentTypewriter) {
        clearTimeout(currentTypewriter);
        currentTypewriter = null;
        const story = getStory(currentChapter);
        document.getElementById('dialogue-text').innerHTML = story[dialogueIndex].text;
        return;
    }
    clearInterval(autoTimer);
    dialogueIndex++;
    loadDialogue(dialogueIndex);
}

function showChapterEnd() {
    const diary = document.getElementById('diary-screen');
    const chapterName = currentChapter === 1 ? '第一章' : '第二章';
    diary.innerHTML = `
        <div class="diary-page max-w-md mx-auto text-center p-8 rounded-3xl">
            <i class="fas fa-heart text-6xl text-[#f9a8d4] mb-6"></i>
            <h2 class="text-4xl font-bold mb-4">${chapterName} 完</h2>
            <p class="text-zinc-300 mb-8">感谢体验「与邻居的乡间生活日记」${chapterName}。<br>好感度 +${currentChapter === 1 ? 10 : 25}</p>
            
            <div class="flex flex-col gap-3">
                <button onclick="returnToTitleFromEnd()" class="px-8 py-3.5 bg-[#f9a8d4] hover:bg-[#e879f9] text-black font-medium rounded-2xl">回到标题</button>
                <button onclick="showSaveLoadFromEnd()" class="px-8 py-3.5 border border-white/30 hover:bg-white/10 rounded-2xl">读取存档</button>
                ${currentChapter === 1 ? 
                    `<button onclick="startNewGame(2)" class="px-8 py-3.5 border border-white/30 hover:bg-white/10 rounded-2xl">进入第二章</button>` : 
                    `<button onclick="restartFromEnd()" class="px-8 py-3.5 border border-white/30 hover:bg-white/10 rounded-2xl">重新开始</button>`
                }
            </div>
        </div>
    `;
    showScreen('diary');
}

function returnToTitleFromEnd() {
    document.getElementById('diary-screen').classList.add('hidden');
    if (bgm) bgm.pause();
    showScreen('title');
}

function showSaveLoadFromEnd() {
    document.getElementById('diary-screen').classList.add('hidden');
    showSaveLoad();
}

function restartFromEnd() {
    document.getElementById('diary-screen').classList.add('hidden');
    startNewGame(1);
}

// 存档槽位函数（简化版）
function getSlotData(slot) {
    try {
        const raw = localStorage.getItem(SAVE_PREFIX + slot);
        return raw ? JSON.parse(raw) : null;
    } catch(e) { return null; }
}

function showSaveLoad() {
    const modal = document.getElementById('saveload-modal');
    const container = document.getElementById('saveload-slots');
    container.innerHTML = '';
    
    for (let i = 1; i <= MAX_SLOTS; i++) {
        const data = getSlotData(i);
        const hasSave = !!data;
        const timeStr = hasSave ? new Date(data.timestamp).toLocaleString('zh-CN', {month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'}) : '空';
        
        const slotDiv = document.createElement('div');
        slotDiv.className = `p-4 rounded-2xl border ${hasSave ? 'border-[#f9a8d4]/50 bg-zinc-950/80' : 'border-zinc-700 bg-zinc-950/50'}`;
        slotDiv.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <div class="font-semibold text-lg">槽位 ${i}</div>
                <div class="text-xs px-2 py-0.5 rounded ${hasSave ? 'bg-emerald-500/70 text-white' : 'bg-zinc-700 text-zinc-400'}">${hasSave ? '已存档' : '空'}</div>
            </div>
            <div class="text-sm text-zinc-400 mb-3">
                ${hasSave ? `时间：${timeStr}<br>进度：${data.progress || '未知'}` : '点击下方按钮存档'}
            </div>
            <div class="flex gap-2">
                <button onclick="saveToSlot(${i})" class="flex-1 px-3 py-1.5 text-sm rounded-xl ${hasSave ? 'border border-[#f9a8d4] text-[#f9a8d4] hover:bg-[#f9a8d4]/10' : 'bg-[#f9a8d4] text-black'}">
                    ${hasSave ? '覆盖保存' : '保存到此'}
                </button>
                <button onclick="loadFromSlot(${i})" class="flex-1 px-3 py-1.5 text-sm rounded-xl border border-zinc-600 hover:bg-white/5 ${hasSave ? '' : 'opacity-40 pointer-events-none'}">读取</button>
                <button onclick="deleteSlot(${i})" class="px-3 py-1.5 text-sm rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500/10 ${hasSave ? '' : 'opacity-40 pointer-events-none'}"><i class="fas fa-trash text-xs"></i></button>
            </div>
        `;
        container.appendChild(slotDiv);
    }
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
}

function hideSaveLoad() {
    const modal = document.getElementById('saveload-modal');
    modal.style.display = 'none';
    modal.classList.add('hidden');
}

function saveToSlot(slot) {
    if (currentScreen !== 'game') { showToast('请在游戏中存档'); return; }
    const data = { index: dialogueIndex, history: dialogueHistory, timestamp: new Date().toISOString(), progress: `${dialogueIndex + 1}/${getStory(currentChapter).length}` };
    localStorage.setItem(SAVE_PREFIX + slot, JSON.stringify(data));
    showToast(`已保存到槽位 ${slot}`);
    showSaveLoad();
}

function loadFromSlot(slot) {
    const data = getSlotData(slot);
    if (!data) { showToast(`槽位 ${slot} 为空`); return; }
    dialogueIndex = data.index || 0;
    dialogueHistory = data.history || [];
    showScreen('game');
    loadDialogue(dialogueIndex);
    initBGM();
    hideSaveLoad();
    showToast(`已读取槽位 ${slot}`);
}

function deleteSlot(slot) {
    if (confirm(`确定删除槽位 ${slot} 的存档吗？`)) {
        localStorage.removeItem(SAVE_PREFIX + slot);
        showToast(`槽位 ${slot} 已删除`);
        showSaveLoad();
    }
}

// BGM
function initBGM() {
    const audio = document.getElementById('bgm-audio');
    if (!audio) return;
    bgm = audio;
    bgm.volume = 0.65;
    bgm.play().catch(() => {});
}

function updateVolume(v) {
    if (bgm) bgm.volume = parseInt(v) / 100;
    document.getElementById('volume-value').textContent = v + '%';
}

// 控制
function initControls() {
    document.addEventListener('keydown', e => {
        if (currentScreen !== 'game') return;
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); advanceDialogue(); }
        if (e.key === 'Escape') { /* close modals */ }
        if ((e.key === 's' || e.key === 'S') && e.ctrlKey) { e.preventDefault(); showSaveLoad(); }
        if (e.ctrlKey && !isSkipping) {
            isSkipping = true;
            isCtrlPressed = true;
            document.getElementById('btn-skip').classList.add('!text-[#f9a8d4]', 'bg-white/10');
            if (!skipTimer) {
                skipTimer = setInterval(() => {
                    if (!isSkipping || !isCtrlPressed) { clearInterval(skipTimer); skipTimer = null; return; }
                    advanceDialogue();
                }, 180);
            }
        }
    });
    
    document.addEventListener('keyup', e => {
        if (e.key === 'Control') {
            isCtrlPressed = false;
            if (isSkipping) {
                isSkipping = false;
                document.getElementById('btn-skip').classList.remove('!text-[#f9a8d4]', 'bg-white/10');
                if (skipTimer) { clearInterval(skipTimer); skipTimer = null; }
            }
        }
    });
    
    // 其他事件监听（滚轮、点击等）省略，完整版已实现
}

// 初始化
function initGame() {
    // 加载设置
    const saved = localStorage.getItem('galgame_settings_v2');
    if (saved) {
        try { const s = JSON.parse(saved); textSpeed = s.textSpeed || 45; autoDelay = s.autoDelay || 1600; } catch(e){}
    }
    
    // 樱花粒子（标题）
    setInterval(() => {
        if (!document.getElementById('title-screen').classList.contains('hidden')) {
            // spawnSakura(5); // 简化
        }
    }, 420);
    
    initControls();
    
    // 隐藏所有模态
    ['saveload-modal', 'gallery-modal', 'cg-viewer'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.style.display = 'none'; el.classList.add('hidden'); }
    });
    
    console.log('%c[GalGame] 与邻居的乡间生活日记 - 模块化版本已就绪', 'color:#f9a8d4');
}

window.onload = initGame;

// 暴露常用函数
window.GALGAME = { start: () => startNewGame(1), startDay2: () => startNewGame(2) };
