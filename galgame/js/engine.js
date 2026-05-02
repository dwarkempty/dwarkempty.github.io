// engine.js - 完整游戏引擎（从原单文件版完整迁移 + 模块化适配）
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
let currentBgmKey = null;
let currentChapter = 1;

// 全局变量（来自 config.js 和 story.js）
const ASSETS = window.ASSETS || {};
const galleryItems = window.galleryItems || [];
const MAX_SLOTS = window.MAX_SLOTS || 3;
const SAVE_PREFIX = window.SAVE_PREFIX || 'galgame_save_slot_';
// getStory 由 story.js 提供（全局 function）

// ==================== 工具函数 ====================
function showToast(msg, duration = 2100) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    document.getElementById('toast-text').textContent = msg;
    toast.style.transition = 'none';
    toast.style.opacity = '1';
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.style.transition = 'opacity 0.4s ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.classList.add('hidden'), 400);
    }, duration);
}

function updateProgress() {
    const el = document.getElementById('progress-text');
    if (el) {
        const total = getStory(currentChapter).length;
        el.textContent = `${String(dialogueIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    }
}

function spawnSakura(count = 12) {
    const container = document.getElementById('sakura-container');
    if (!container) return;
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const p = document.createElement('div');
            p.className = 'sakura-petal';
            p.innerHTML = Math.random() > 0.5 ? '❀' : '🌸';
            p.style.left = Math.random() * 100 + 'vw';
            p.style.top = '-10px';
            p.style.animationDuration = (Math.random() * 9 + 6) + 's';
            p.style.opacity = Math.random() * 0.5 + 0.45;
            p.style.fontSize = (Math.random() * 9 + 11) + 'px';
            container.appendChild(p);
            setTimeout(() => p.remove(), 16000);
        }, i * 28);
    }
}

// ==================== 屏幕控制 ====================
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
    
    const btnAuto = document.getElementById('btn-auto');
    const btnSkip = document.getElementById('btn-skip');
    if (btnAuto) btnAuto.classList.remove('!text-[#f9a8d4]', 'bg-white/10');
    if (btnSkip) btnSkip.classList.remove('!text-[#f9a8d4]', 'bg-white/10');
    
    showScreen('game');
    loadDialogue(0);
    initBGM();
    showToast(chapter === 1 ? '第一章开始！' : '第二章开始！');
}

function continueGame() {
    const data = getSlotData(1);
    if (!data) { showToast('没有存档'); return; }
    dialogueIndex = data.index || 0;
    dialogueHistory = data.history || [];
    showScreen('game');
    loadDialogue(dialogueIndex);
    initBGM();
    showToast('已读取存档');
}

function returnToTitle() {
    if (confirm('返回标题画面？当前进度将丢失（除非已保存）')) {
        clearInterval(autoTimer);
        clearInterval(skipTimer);
        isAutoPlaying = false;
        isSkipping = false;
        if (bgm) bgm.pause();
        showScreen('title');
        const charLayer = document.getElementById('character-layer');
        if (charLayer) {
            charLayer.style.backgroundImage = '';
            charLayer.classList.add('hidden');
        }
    }
}

// ==================== 对话系统 ====================
function loadDialogue(idx) {
    const story = getStory(currentChapter);
    if (idx >= story.length) {
        showChapterEnd();
        return;
    }
    
    const step = story[idx];
    dialogueIndex = idx;
    
    const bgLayer = document.getElementById('bg-layer');
    const newBg = ASSETS.bg[step.bg] || ASSETS.bg.house_day || ASSETS.bg.street_day;
    if (bgLayer) bgLayer.style.backgroundImage = `url('${newBg}')`;
    
    const charLayer = document.getElementById('character-layer');
    if (charLayer) {
        if (step.char && ASSETS.sakura[step.char]) {
            charLayer.style.backgroundImage = `url('${ASSETS.sakura[step.char]}')`;
            charLayer.classList.remove('hidden');
        } else {
            charLayer.classList.add('hidden');
        }
    }
    
    const speakerEl = document.getElementById('speaker-name');
    if (speakerEl) {
        if (!step.speaker || step.speaker === '旁白') {
            speakerEl.style.display = 'none';
            speakerEl.innerHTML = '';
        } else {
            speakerEl.style.display = '';
            if (step.speaker === '樱花') {
                speakerEl.innerHTML = `<span class="speaker-sakura px-1">${step.speaker}</span>`;
            } else if (step.speaker === '姬莫') {
                speakerEl.innerHTML = `<span class="speaker-jimo px-1">${step.speaker}</span>`;
            } else {
                speakerEl.innerHTML = `<span class="px-1 text-zinc-300">${step.speaker}</span>`;
            }
        }
    }
    
    // BGM 切换
    if (step.bgm) {
        switchBGM(step.bgm);
    }
    
    const textEl = document.getElementById('dialogue-text');
    if (!textEl) return;
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
            const indicator = document.getElementById('next-indicator');
            if (indicator) indicator.style.opacity = '0.75';
            dialogueHistory.push({ speaker: step.speaker, text: step.text, time: new Date() });
            updateProgress();
            if (isAutoPlaying && !isSkipping) {
                autoTimer = setTimeout(() => advanceDialogue(), autoDelay);
            }
        }
    }
    typeChar();
    const indicator = document.getElementById('next-indicator');
    if (indicator) indicator.style.opacity = '0.25';
}

function advanceDialogue() {
    if (currentTypewriter) {
        clearTimeout(currentTypewriter);
        currentTypewriter = null;
        const story = getStory(currentChapter);
        const textEl = document.getElementById('dialogue-text');
        if (textEl) textEl.innerHTML = story[dialogueIndex].text;
        const indicator = document.getElementById('next-indicator');
        if (indicator) indicator.style.opacity = '0.75';
        return;
    }
    clearInterval(autoTimer);
    dialogueIndex++;
    loadDialogue(dialogueIndex);
}

function showChapterEnd() {
    const diary = document.getElementById('diary-screen');
    if (!diary) return;
    const chapterName = currentChapter === 1 ? '第一章' : '第二章';
    const favor = currentChapter === 1 ? 10 : 25;
    
    diary.innerHTML = `
        <div class="diary-page max-w-md mx-auto text-center p-8 rounded-3xl">
            <i class="fas fa-heart text-6xl text-[#f9a8d4] mb-6"></i>
            <h2 class="text-4xl font-bold mb-4">${chapterName} 完</h2>
            <p class="text-zinc-300 mb-8">感谢体验「与邻居的乡间生活日记」${chapterName}。<br>好感度 +${favor}</p>
            
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
    if (currentChapter === 1) markDay1Completed();
    showScreen('diary');
}

function returnToTitleFromEnd() {
    const diary = document.getElementById('diary-screen');
    if (diary) diary.classList.add('hidden');
    if (bgm) bgm.pause();
    showScreen('title');
}

function showSaveLoadFromEnd() {
    const diary = document.getElementById('diary-screen');
    if (diary) diary.classList.add('hidden');
    showSaveLoad();
}

function restartFromEnd() {
    const diary = document.getElementById('diary-screen');
    if (diary) diary.classList.add('hidden');
    startNewGame(1);
}

// ==================== 存档系统 ====================
function getSlotData(slot) {
    try {
        const raw = localStorage.getItem(SAVE_PREFIX + slot);
        return raw ? JSON.parse(raw) : null;
    } catch(e) { return null; }
}

function showSaveLoad() {
    const modal = document.getElementById('saveload-modal');
    const container = document.getElementById('saveload-slots');
    if (!modal || !container) return;
    container.innerHTML = '';
    
    for (let i = 1; i <= MAX_SLOTS; i++) {
        const data = getSlotData(i);
        const hasSave = !!data;
        const timeStr = hasSave ? new Date(data.timestamp).toLocaleString('zh-CN', {month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'}) : '空';
        const prog = hasSave ? (data.progress || `${(data.index||0)+1}/19`) : '-';
        
        const slotDiv = document.createElement('div');
        slotDiv.className = `p-4 rounded-2xl border ${hasSave ? 'border-[#f9a8d4]/50 bg-zinc-950/80' : 'border-zinc-700 bg-zinc-950/50'}`;
        slotDiv.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <div class="font-semibold text-lg">槽位 ${i}</div>
                <div class="text-xs px-2 py-0.5 rounded ${hasSave ? 'bg-emerald-500/70 text-white' : 'bg-zinc-700 text-zinc-400'}">${hasSave ? '已存档' : '空'}</div>
            </div>
            <div class="text-sm text-zinc-400 mb-3">
                ${hasSave ? `时间：${timeStr}<br>进度：${prog}` : '点击下方按钮存档'}
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
    if (modal) { modal.style.display = 'none'; modal.classList.add('hidden'); }
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

// ==================== BGM ====================
function initBGM() {
    const audio = document.getElementById('bgm-audio');
    if (!audio) return;
    bgm = audio;
    bgm.volume = 0.65;
    currentBgmKey = 'meadow';
    if (ASSETS.audio && ASSETS.audio.meadow) {
        bgm.src = ASSETS.audio.meadow;
    }
    bgm.play().catch(() => {});
}

function switchBGM(bgmKey) {
    if (!bgm || !ASSETS.audio || !ASSETS.audio[bgmKey]) return;
    if (currentBgmKey === bgmKey) return;
    currentBgmKey = bgmKey;
    bgm.src = ASSETS.audio[bgmKey];
    bgm.play().catch(() => {});
}

function updateVolume(v) {
    if (bgm) bgm.volume = parseInt(v) / 100;
    const valEl = document.getElementById('volume-value');
    if (valEl) valEl.textContent = v + '%';
}

// ==================== 画廊 ====================
function showGallery() {
    const modal = document.getElementById('gallery-modal');
    const grid = document.getElementById('gallery-grid');
    if (!modal || !grid) return;
    grid.innerHTML = '';
    
    galleryItems.forEach(item => {
        const card = document.createElement('div');
        const isCharacter = item.type === '立绘';
        card.className = `group relative overflow-hidden rounded-2xl border border-zinc-700 ${isCharacter ? 'aspect-[9/16]' : 'aspect-[16/10]'} cursor-pointer bg-zinc-950`;
        card.innerHTML = `
            <img src="${item.img}" class="w-full h-full ${isCharacter ? 'object-contain' : 'object-cover'} transition-transform group-hover:scale-[1.08] duration-500" alt="${item.title}">
            <div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/70 to-black/90"></div>
            <div class="absolute bottom-0 left-0 right-0 p-4">
                <div class="flex items-center justify-between mb-1">
                    <div class="font-semibold text-lg">${item.title}</div>
                    <div class="px-2 py-px text-[10px] rounded ${isCharacter ? 'bg-purple-500/80' : 'bg-emerald-500/80'}">${item.type}</div>
                </div>
                <div class="text-xs text-zinc-400 line-clamp-2">${item.desc}</div>
            </div>
        `;
        card.onclick = () => showCGViewer(item);
        grid.appendChild(card);
    });
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
}

function hideGallery() {
    const modal = document.getElementById('gallery-modal');
    if (modal) { modal.style.display = 'none'; modal.classList.add('hidden'); }
}

function showCGViewer(item) {
    const viewer = document.getElementById('cg-viewer');
    if (!viewer) return;
    const img = document.getElementById('cg-image');
    const title = document.getElementById('cg-title');
    const desc = document.getElementById('cg-desc');
    if (img) img.src = item.img;
    if (title) title.textContent = item.title;
    if (desc) desc.textContent = item.desc + '（模块化版本）';
    viewer.style.display = 'flex';
}

function hideCGViewer() {
    const viewer = document.getElementById('cg-viewer');
    if (viewer) viewer.style.display = 'none';
}

// ==================== 自动 / 快进 ====================
function toggleAuto() {
    isAutoPlaying = !isAutoPlaying;
    const btn = document.getElementById('btn-auto');
    if (!btn) return;
    
    if (isAutoPlaying) {
        btn.classList.add('!text-[#f9a8d4]', 'bg-white/10');
        showToast('自动播放已开启');
        const textEl = document.getElementById('dialogue-text');
        if (textEl && textEl.innerHTML.length >= (getStory(currentChapter)[dialogueIndex]?.text.length || 0)) {
            setTimeout(() => { if (isAutoPlaying) advanceDialogue(); }, 650);
        }
    } else {
        btn.classList.remove('!text-[#f9a8d4]', 'bg-white/10');
        clearInterval(autoTimer);
        showToast('自动播放已关闭');
    }
}

function toggleSkip() {
    isSkipping = !isSkipping;
    const btn = document.getElementById('btn-skip');
    if (!btn) return;
    
    if (isSkipping) {
        btn.classList.add('!text-[#f9a8d4]', 'bg-white/10');
        showToast('快进模式开启（按住 Ctrl 也可）');
        
        const textEl = document.getElementById('dialogue-text');
        if (textEl && currentTypewriter) {
            clearTimeout(currentTypewriter);
            const story = getStory(currentChapter);
            textEl.innerHTML = story[dialogueIndex].text;
            const indicator = document.getElementById('next-indicator');
            if (indicator) indicator.style.opacity = '0.75';
        }
        
        if (!skipTimer) {
            skipTimer = setInterval(() => {
                if (!isSkipping) { clearInterval(skipTimer); skipTimer = null; return; }
                advanceDialogue();
            }, 260);
        }
    } else {
        btn.classList.remove('!text-[#f9a8d4]', 'bg-white/10');
        clearInterval(skipTimer);
        skipTimer = null;
        showToast('快进模式关闭');
    }
}

// ==================== 键盘 & 鼠标控制 ====================
function initControls() {
    document.addEventListener('keydown', e => {
        if (currentScreen !== 'game') return;
        
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            advanceDialogue();
        }
        if (e.key === 'Escape') {
            const modals = ['saveload-modal', 'gallery-modal', 'cg-viewer'];
            for (let id of modals) {
                const m = document.getElementById(id);
                if (m && m.style.display === 'flex') {
                    m.style.display = 'none';
                    m.classList.add('hidden');
                    return;
                }
            }
            returnToTitle();
        }
        if ((e.key === 's' || e.key === 'S') && e.ctrlKey) {
            e.preventDefault();
            showSaveLoad();
        }
        if (e.ctrlKey && !isSkipping) {
            isSkipping = true;
            isCtrlPressed = true;
            const btn = document.getElementById('btn-skip');
            if (btn) btn.classList.add('!text-[#f9a8d4]', 'bg-white/10');
            
            const textEl = document.getElementById('dialogue-text');
            if (textEl && currentTypewriter) {
                clearTimeout(currentTypewriter);
                const story = getStory(currentChapter);
                textEl.innerHTML = story[dialogueIndex].text;
            }
            
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
                const btn = document.getElementById('btn-skip');
                if (btn) btn.classList.remove('!text-[#f9a8d4]', 'bg-white/10');
                if (skipTimer) { clearInterval(skipTimer); skipTimer = null; }
            }
        }
    });
    
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
        gameScreen.addEventListener('wheel', e => {
            if (currentScreen === 'game' && e.deltaY < 0) {
                e.preventDefault();
                showSaveLoad();
            }
        }, { passive: false });
        
        gameScreen.addEventListener('click', e => {
            if (currentScreen !== 'game') return;
            if (e.target.closest('#dialogue-container') || e.target.closest('.quick-btn') || e.target.closest('[id$="-modal"]')) return;
            advanceDialogue();
        });
    }
}

// ==================== 设置系统 ====================
function showSettings() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;
    
    const speedSlider = document.getElementById('speed-slider');
    const autoSlider = document.getElementById('auto-slider');
    const speedValue = document.getElementById('speed-value');
    const autoValue = document.getElementById('auto-value');
    
    if (speedSlider) {
        speedSlider.value = textSpeed;
        speedSlider.oninput = () => {
            textSpeed = parseInt(speedSlider.value);
            if (speedValue) speedValue.textContent = textSpeed + 'ms';
        };
        if (speedValue) speedValue.textContent = textSpeed + 'ms';
    }
    
    if (autoSlider) {
        autoSlider.value = autoDelay;
        autoSlider.oninput = () => {
            autoDelay = parseInt(autoSlider.value);
            if (autoValue) autoValue.textContent = (autoDelay / 1000).toFixed(1) + 's';
        };
        if (autoValue) autoValue.textContent = (autoDelay / 1000).toFixed(1) + 's';
    }
    
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
}

function hideSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) { modal.style.display = 'none'; modal.classList.add('hidden'); }
}

function saveSettings() {
    const settings = { textSpeed, autoDelay, volume: bgm ? bgm.volume : 0.65 };
    localStorage.setItem('galgame_settings_v2', JSON.stringify(settings));
    showToast('设置已保存');
    hideSettings();
}

function resetSettings() {
    textSpeed = 45;
    autoDelay = 1600;
    if (bgm) bgm.volume = 0.65;
    const volSlider = document.getElementById('volume-slider');
    const volValue = document.getElementById('volume-value');
    if (volSlider) volSlider.value = 65;
    if (volValue) volValue.textContent = '65%';
    showToast('已恢复默认设置');
    // 重新打开设置面板刷新滑块
    hideSettings();
    setTimeout(showSettings, 300);
}

// ==================== 初始化 ====================
function initGame() {
    const savedSettings = localStorage.getItem('galgame_settings_v2');
    if (savedSettings) {
        try {
            const s = JSON.parse(savedSettings);
            textSpeed = s.textSpeed || 45;
            autoDelay = s.autoDelay || 1600;
            if (s.volume !== undefined && bgm) bgm.volume = s.volume;
        } catch(e){}
    }
    
    setInterval(() => {
        if (!document.getElementById('title-screen').classList.contains('hidden')) {
            spawnSakura(5);
        }
    }, 420);
    
    const titleArea = document.getElementById('title-screen');
    if (titleArea) {
        titleArea.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            spawnSakura(22);
        });
    }
    
    initControls();
    
    ['saveload-modal', 'gallery-modal', 'cg-viewer', 'settings-modal'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.style.display = 'none'; el.classList.add('hidden'); }
    });
    
    console.log('%c[GalGame] 与邻居的乡间生活日记 - 模块化完整版已就绪', 'color:#f9a8d4');
}

window.onload = initGame;

// 确保所有 onclick 函数挂载到 window（防止作用域问题）
window.startNewGame = startNewGame;
window.continueGame = continueGame;
window.showSaveLoad = showSaveLoad;
window.showGallery = showGallery;
window.returnToTitle = returnToTitle;
window.advanceDialogue = advanceDialogue;
window.toggleAuto = toggleAuto;
window.toggleSkip = toggleSkip;
window.returnToTitleFromEnd = returnToTitleFromEnd;
window.showSaveLoadFromEnd = showSaveLoadFromEnd;
window.restartFromEnd = restartFromEnd;
window.showSettings = showSettings;
window.hideSettings = hideSettings;
window.showBgmAppreciation = showBgmAppreciation;
window.hideBgmAppreciation = hideBgmAppreciation;

window.GALGAME = { start: () => startNewGame(1), startDay2: () => startNewGame(2) };

// ==================== BGM鉴赏 ====================
let bgmPlayer = null;

function showBgmAppreciation() {
    const modal = document.getElementById('bgm-modal');
    const list = document.getElementById('bgm-list');
    if (!modal || !list) return;

    const isUnlocked = localStorage.getItem('galgame_day1_completed') === 'true' || getSlotData(1) !== null;
    
    list.innerHTML = `
        <div class="space-y-4">
            ${createBgmCard('meadow', 'the_meadow_path', '乡间治愈系、轻快', '营造出午后乡间漫步的休闲氛围，适合日常场景', isUnlocked)}
            ${createBgmCard('twilight', 'fields_at_twilight', '舒缓、略带忧伤', '适合独自思考、宁静夜晚、雨天，农场收工后的傍晚', isUnlocked)}
            ${createBgmCard('cartoon', 'tiptoeing_past_the_barn_door', '古怪卡通', '适合搞怪时刻、轻松时刻、内心吐槽、搞笑画面', isUnlocked)}
        </div>
    `;
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
}

function createBgmCard(key, filename, style, desc, unlocked) {
    const isPlaying = currentBgmKey === key;
    return `
        <div class="bg-zinc-800/80 border border-zinc-700 rounded-2xl p-4 flex items-center gap-4 hover:border-[#f9a8d4]/50 transition-all">
            <button onclick="playBgmTrack('${key}', this)" class="w-12 h-12 flex-shrink-0 rounded-full ${isPlaying ? 'bg-[#f9a8d4] text-black' : 'bg-zinc-700 hover:bg-[#f9a8d4] hover:text-black'} flex items-center justify-center text-xl">
                <i class="fas ${isPlaying ? 'fa-pause' : 'fa-play'}"></i>
            </button>
            <div class="flex-1 min-w-0">
                <div class="font-semibold text-lg">${filename}</div>
                <div class="text-xs text-[#f9a8d4]">${style}</div>
                <div class="text-xs text-zinc-400 mt-1 line-clamp-2">${desc}</div>
            </div>
            ${!unlocked ? '<div class="text-[10px] px-2 py-0.5 bg-zinc-700 rounded text-zinc-400">未解锁</div>' : ''}
        </div>
    `;
}

function playBgmTrack(key, btn) {
    const audio = document.getElementById('bgm-audio');
    if (!audio || !ASSETS.audio || !ASSETS.audio[key]) return;

    document.querySelectorAll('#bgm-list button').forEach(b => {
        b.classList.remove('bg-[#f9a8d4]', 'text-black');
        b.classList.add('bg-zinc-700');
        b.innerHTML = '<i class="fas fa-play"></i>';
    });

    if (currentBgmKey === key && !audio.paused) {
        audio.pause();
        btn.innerHTML = '<i class="fas fa-play"></i>';
        btn.classList.remove('bg-[#f9a8d4]', 'text-black');
        btn.classList.add('bg-zinc-700');
        return;
    }

    audio.src = ASSETS.audio[key];
    audio.volume = 0.7;
    audio.play().then(() => {
        currentBgmKey = key;
        btn.innerHTML = '<i class="fas fa-pause"></i>';
        btn.classList.add('bg-[#f9a8d4]', 'text-black');
        btn.classList.remove('bg-zinc-700');
    }).catch(() => {});
}

function hideBgmAppreciation() {
    const modal = document.getElementById('bgm-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
    }
    const audio = document.getElementById('bgm-audio');
    if (audio) audio.pause();
}

function markDay1Completed() {
    localStorage.setItem('galgame_day1_completed', 'true');
}
