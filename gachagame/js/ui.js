// js/ui.js - UI 动画、Modal、记录查询、控制台 + 经营系统完整逻辑
function showDrawAnimation(results, poolType) {
  const modal = document.getElementById("drawModal");
  const container = document.getElementById("drawResults");
  const title = document.getElementById("drawTitle");
  container.innerHTML = "";
  modal.classList.remove("hidden");
  title.textContent = poolType === "char" ? (results.length === 1 ? "🎉 单抽角色" : "🎉 十连角色") : (results.length === 1 ? "🎉 单抽武器" : "🎉 十连武器");

  // ==================== 通用动态视频检测（性能+拓展性优化） ====================
  let dynamicItem = null;
  if (poolType === "char") {
    dynamicItem = results.find(item => {
      const data = window.getCharacterData(item.id);
      return data && data.animatedImage;   // 只要有 animatedImage 字段就触发
    });
  }

  if (dynamicItem) {
    const charData = window.getCharacterData(dynamicItem.id);
    const videoContainer = document.createElement("div");
    videoContainer.className = "fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-[99999] cursor-pointer";
    videoContainer.style.zIndex = "99999";

    videoContainer.innerHTML = `
      <div class="text-center mb-6 px-4">
        <div class="text-5xl font-bold text-orange-400 drop-shadow-lg">🎉 UR ${charData.name} 降临！</div>
        <div class="text-xl text-gray-200 mt-3">点击屏幕任意位置跳过动画</div>
      </div>
      
      <video id="dynamicDrawVideo" class="w-screen h-screen object-contain" 
             autoplay loop playsinline preload="auto" muted="false">
        <source src="${charData.animatedImage}" type="video/mp4">
      </video>
      
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-400 bg-black/50 px-6 py-2 rounded-3xl">
        点击任意处跳过 • 音量已开启
      </div>
    `;
    document.body.appendChild(videoContainer);

    const videoEl = document.getElementById("dynamicDrawVideo");
    videoEl.volume = 0.75;

    // 错误处理
    videoEl.onerror = () => {
      videoContainer.innerHTML += `
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-900 text-white px-8 py-6 rounded-3xl text-center max-w-md">
          <div class="text-2xl mb-3">❌ 视频加载失败</div>
          <div class="text-sm">请确认文件路径正确且使用本地服务器运行</div>
          <button onclick="this.closest('.fixed').remove()" class="mt-6 px-8 py-3 bg-white text-red-900 rounded-2xl font-bold">关闭</button>
        </div>`;
      console.error("动态立绘加载失败:", charData.animatedImage);
      // 自动降级显示卡片（解决UR不显示问题）
      setTimeout(() => {
        if (videoContainer.parentNode) videoContainer.remove();
        renderNormalDrawCards(results, poolType, container);
      }, 500);
    };

    // 点击跳过
    videoContainer.onclick = (e) => {
      if (e.target.tagName === "VIDEO") return;
      videoEl.pause();
      videoContainer.remove();
      renderNormalDrawCards(results, poolType, container);
    };

    videoEl.onended = () => {
      videoContainer.remove();
      renderNormalDrawCards(results, poolType, container);
    };
  } else {
    // 普通抽卡
    renderNormalDrawCards(results, poolType, container);
  }
}

// 普通抽卡卡片渲染（复用，保持不变）
function renderNormalDrawCards(results, poolType, container) {
  results.forEach((item, i) => {
    const delay = results.length === 1 ? 0 : i * 80;
    const div = document.createElement("div");
    div.style.animationDelay = delay + "ms";
    const data = poolType === "char" ? window.getCharacterData(item.id) : window.getWeaponData(item.id);
    const hasShine = (data.rarity === "SSR" || data.rarity === "UR");
    div.className = `draw-card bg-gray-800 rounded-3xl p-4 border-4 ${window.getRarityColor(data.rarity)} text-center w-40 sm:w-52`;
    div.innerHTML = `
      <img src="${data.image}" class="character-img w-full rounded-2xl mx-auto ${hasShine ? 'draw-shine' : ''}">
      <div class="rarity-${data.rarity.toLowerCase()} text-xs inline-block px-4 py-1 rounded-full text-white font-bold mt-4">${data.rarity}</div>
      <div class="text-lg sm:text-xl font-bold mt-2">${data.name}</div>
      <div class="text-xs text-gray-400">${data.category || data.type}</div>
    `;
    container.appendChild(div);
  });
}

function hideDrawModal() {
  document.getElementById("drawModal").classList.add("hidden");
}

function setDrawPool(type) {
  currentDrawPool = type;
  document.getElementById("poolCharBtn").classList.toggle("active", type === "char");
  document.getElementById("poolWeaponBtn").classList.toggle("active", type === "weapon");
  document.getElementById("poolTitle").textContent = type === "char" ? "角色池抽取" : "武器池抽取";
  // 更新称号
  const titleEl = document.getElementById("playerTitle");
  if (titleEl) titleEl.textContent = `当前称号：${window.getPlayerTitle()}`;
}

function setRecordTab(n) {
  currentRecordTab = n;
  document.querySelectorAll('.record-tab').forEach((b,i) => b.classList.toggle('active', i===n));
  window.showRecordModal();
}

function showRecordModal() {
  const isCharTab = currentRecordTab === 0;
  const total = isCharTab ? (player.totalCharDraws || 0) : (player.totalWeaponDraws || 0);
  const ur = isCharTab ? player.urCount : player.wUR;
  const ssrRate = total ? ((isCharTab ? player.ssrCount : player.wSSR) / total * 100).toFixed(2) : 0;
  const urRate = total ? (ur / total * 100).toFixed(2) : 0;

  let html = `
    <div class="space-y-6">
      <div class="flex justify-between text-xl"><span>${isCharTab ? '角色' : '武器'}总抽卡次数</span><span class="font-bold">${total}</span></div>
      <div class="grid grid-cols-2 gap-6">
        <div class="text-center"><div class="text-sm text-gray-400">R</div><div class="text-4xl font-bold text-blue-400">${isCharTab ? player.rCount : player.wR}</div></div>
        <div class="text-center"><div class="text-sm text-gray-400">SR</div><div class="text-4xl font-bold text-purple-400">${isCharTab ? player.srCount : player.wSR}</div></div>
        <div class="text-center"><div class="text-sm text-gray-400">SSR</div><div class="text-4xl font-bold text-yellow-400">${isCharTab ? player.ssrCount : player.wSSR}</div></div>
        <div class="text-center"><div class="text-sm text-gray-400">UR</div><div class="text-4xl font-bold text-orange-400">${ur}</div></div>
      </div>
      <div class="pt-4 border-t border-gray-700">
        <div class="flex justify-between"><span>SSR获得率</span><span class="font-bold">${ssrRate}%</span></div>
        <div class="flex justify-between"><span>UR获得率</span><span class="font-bold">${urRate}%</span></div>
        <div class="flex justify-between mt-3"><span>UR大保底进度</span><span class="font-bold text-amber-400">${isCharTab ? (player.charUrPity || 0) : (player.weaponUrPity || 0)}/80</span></div>
      </div>
    </div>`;

  const luckRate = parseFloat(urRate);
  let luckText = "", luckClass = "";
  if (luckRate <= 1) { luckText = "大非酋"; luckClass = "bg-gradient-to-r from-red-900 to-red-700 text-white"; }
  else if (luckRate <= 2) { luckText = "非酋"; luckClass = "bg-gradient-to-r from-red-700 to-red-500 text-white"; }
  else if (luckRate <= 3) { luckText = "正常玩家"; luckClass = "bg-gray-700 text-white"; }
  else if (luckRate <= 4) { luckText = "小欧皇"; luckClass = "bg-gradient-to-r from-yellow-300 to-yellow-500 text-black"; }
  else if (luckRate <= 5) { luckText = "欧皇"; luckClass = "bg-gradient-to-r from-yellow-400 to-amber-500 text-black"; }
  else { luckText = "欧气满满"; luckClass = "bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 text-white animate-pulse"; }

  html += `<div id="luckBox" class="mt-6 p-6 rounded-3xl text-center text-2xl font-bold transition-all"><span class="${luckClass} px-8 py-4 rounded-3xl inline-block">${luckText}（UR概率 ${luckRate}%）</span></div>`;

  document.getElementById("recordContent").innerHTML = html;
  document.getElementById("recordModal").classList.remove("hidden");
}

function hideRecordModal() {
  document.getElementById("recordModal").classList.add("hidden");
}

function exportSave() {
  const dataStr = JSON.stringify(player, null, 2);
  const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
  const link = document.createElement("a");
  link.setAttribute("href", dataUri);
  link.setAttribute("download", "gacha-save.json");
  link.click();
  alert("✅ 存档已导出！");
}

function importSave(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      player = JSON.parse(ev.target.result);
      document.getElementById("yaoXing").textContent = player.yaoXing || 1000;
      document.getElementById("gold").textContent = player.gold || 0;
      document.getElementById("reinforceStone").textContent = player.reinforceStone || 0;
      window.saveGame();
      alert("✅ 存档导入成功！");
      window.hideRecordModal();
      window.renderInventory();
    } catch(err) { alert("❌ 文件格式错误"); }
  };
  reader.readAsText(file);
  e.target.value = "";
}

function openConsolePrompt() {
  const code = prompt("请输入作者命令开启控制台：");
  if (code === "114514") {
    document.getElementById("consoleModal").classList.remove("hidden");
    document.getElementById("consoleLog").innerHTML = `
      控制台已开启<br>
      <span class="text-yellow-400">可用命令示例：</span><br>
      give 998 500 → 获得500耀星⭐<br>
      give 997 10000 → 获得10000金币<br>
      give 999 50 → 获得50强化石<br>
      give 201 10 → 获得10个红史莱姆粘液<br>
      set shoplevel 3 → 设置商店等级为3（最高5）<br>
      give allmaterials 20 → 获得全部材料各20个<br>
      give allcharacters 50 3 → 获得全部角色（等级50，星级3）<br>
      give allweapons 30 2 → 获得全部武器（等级30，星级2）<br>
      <span class="text-emerald-400">经营材料ID：201~220</span>
    `;
  } else {
    alert("命令错误！");
  }
}

function hideConsole() {
  document.getElementById("consoleModal").classList.add("hidden");
}

function executeConsoleCommand() {
  const input = document.getElementById("consoleInput").value.trim();
  const log = document.getElementById("consoleLog");
  log.innerHTML += `<span class="text-green-400">&gt; ${input}</span><br>`;

  const parts = input.split(" ");
  const cmd = parts[0].toLowerCase();

  if (cmd === "set" && parts[1] === "shoplevel") {
    let level = parseInt(parts[2]);
    if (isNaN(level) || level < 1) level = 1;
    if (level > 5) level = 5;
    player.shopLevel = level;
    log.innerHTML += `✅ 商店等级已设置为 Lv.${level}<br>`;
    window.saveGame();
    if (document.getElementById("panel4") && !document.getElementById("panel4").classList.contains("hidden")) window.renderShopInfo();
  } 

  else if (cmd === "give" && parts[1] === "allmaterials") {
    let amount = parseInt(parts[2]) || 20;
    window.materialsPool.forEach(mat => {
      player.materials[mat.id] = (player.materials[mat.id] || 0) + amount;
    });
    log.innerHTML += `✅ 已获得全部材料各 ${amount} 个<br>`;
    window.saveGame();
    window.renderInventory();
    if (document.getElementById("panel4") && !document.getElementById("panel4").classList.contains("hidden")) window.renderShopInfo();
  } 

  else if (cmd === "give" && parts[1] === "allcharacters") {
    const level = parseInt(parts[2]) || 1;
    const stars = parseInt(parts[3]) || 0;
    const maxId = window.characterPool.length;   // 自动支持所有角色（包括阿特亚和希罗·玛利亚）
    for (let i = 1; i <= maxId; i++) {
      player.owned.push({
        id: Date.now() + i,
        charId: i,
        level: Math.min(level, 100),
        stars: Math.min(stars, 5),
        equippedWeapon: null
      });
    }
    log.innerHTML += `✅ 已获得全部 ${maxId} 个角色（等级${level}，星级${stars}）<br>`;
    window.saveGame();
    window.renderInventory();
  } 

  else if (cmd === "give" && parts[1] === "allweapons") {
    const level = parseInt(parts[2]) || 1;
    const stars = parseInt(parts[3]) || 0;
    const maxId = window.weaponPool.length;
    for (let i = 1; i <= maxId; i++) {
      player.weapons.push({
        id: Date.now() + i,
        weaponId: i,
        level: Math.min(level, 100),
        stars: Math.min(stars, 5)
      });
    }
    log.innerHTML += `✅ 已获得全部 ${maxId} 个武器（等级${level}，星级${stars}）<br>`;
    window.saveGame();
    window.renderInventory();
  } 

  else if (cmd === "give") {
    const id = parseInt(parts[1]);
    let amount = parseInt(parts[2]) || 1;

    if (id === 998) {
      player.yaoXing += amount;
      document.getElementById("yaoXing").textContent = player.yaoXing;
      log.innerHTML += `✅ 已获得 ${amount} 耀星⭐<br>`;
    } else if (id === 997) {
      player.gold += amount;
      document.getElementById("gold").textContent = player.gold;
      log.innerHTML += `✅ 已获得 ${amount} 金币<br>`;
    } else if (id === 999) {
      player.reinforceStone += amount;
      document.getElementById("reinforceStone").textContent = player.reinforceStone;
      log.innerHTML += `✅ 已获得 ${amount} 个强化石<br>`;
    } else if (id >= 1 && id <= window.characterPool.length) {
      const level = parseInt(parts[2]) || 1;
      const stars = parseInt(parts[3]) || 0;
      player.owned.push({ 
        id: Date.now(), 
        charId: id, 
        level: Math.min(level, 100), 
        stars: Math.min(stars, 5), 
        equippedWeapon: null 
      });
      log.innerHTML += `✅ 已获得角色 ${window.getCharacterData(id).name} Lv.${level} ★${stars}<br>`;
    } else if (id >= 100 && id <= 100 + window.weaponPool.length) {
      const weaponRealId = id - 99;
      const level = parseInt(parts[2]) || 1;
      const stars = parseInt(parts[3]) || 0;
      player.weapons.push({ 
        id: Date.now(), 
        weaponId: weaponRealId, 
        level: Math.min(level, 100), 
        stars: Math.min(stars, 5) 
      });
      log.innerHTML += `✅ 已获得武器 ${window.getWeaponData(weaponRealId).name} Lv.${level} ★${stars}<br>`;
    } else if (id >= 201 && id <= 220) {
      const mat = window.materialsPool.find(m => m.id === id - 200);
      if (mat) {
        player.materials[id - 200] = (player.materials[id - 200] || 0) + amount;
        log.innerHTML += `✅ 已获得 ${amount} 个 ${mat.name}<br>`;
      }
    } else if (id >= 1001 && id <= 1016) {
      const charId = id - 1000;
      const charData = window.getCharacterData(charId);
      if (charData) {
        player.sourcePowers = player.sourcePowers || {};
        player.sourcePowers[charId] = (player.sourcePowers[charId] || 0) + amount;
        log.innerHTML += `✅ 已获得 ${amount} 个 ${charData.name}源力<br>`;
      }
    } else {
      log.innerHTML += `❌ 未知物品ID<br>`;
    }
    window.saveGame();
    window.renderInventory();
    if (document.getElementById("panel4") && !document.getElementById("panel4").classList.contains("hidden")) window.renderShopInfo();
  } else {
    log.innerHTML += `未知命令<br>`;
  }

  document.getElementById("consoleInput").value = "";
  log.scrollTop = log.scrollHeight;
}


// 经营模块已完全删除（用户要求）

window.hideDrawModal = hideDrawModal;
window.setDrawPool = setDrawPool;
window.setRecordTab = setRecordTab;
window.showRecordModal = showRecordModal;
window.hideRecordModal = hideRecordModal;
window.exportSave = exportSave;
window.importSave = importSave;
window.openConsolePrompt = openConsolePrompt;
window.hideConsole = hideConsole;
window.executeConsoleCommand = executeConsoleCommand;
window.resetGame = resetGame;
window.showCharacterLore = showCharacterLore;
window.closeCharacterLore = window.closeCharacterLore;
window.showDrawAnimation = showDrawAnimation;
