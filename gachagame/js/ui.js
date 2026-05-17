// ==================== 新版增强抽卡动画（用户提供） ====================
function showDrawAnimation(results, poolType) {
  const modal = document.getElementById("drawModal");
  const container = document.getElementById("drawResults");
  const title = document.getElementById("drawTitle");
  container.innerHTML = "";
  modal.classList.remove("hidden");
  const isTen = results.length > 1;
  title.innerHTML = `
    <div class="flex items-center justify-center gap-4">
      <span class="text-6xl">${poolType === "char" ? "🧙‍♂️" : "⚔️"}</span>
      <div>
        <div class="text-5xl font-black tracking-tighter">${poolType === "char" ? (isTen ? "十连角色" : "单抽角色") : (isTen ? "十连武器" : "单抽武器")}</div>
        <div class="text-sm text-zinc-400 -mt-1">${isTen ? "运气爆棚！" : "命运之手"}</div>
      </div>
    </div>
  `;
  // 抽卡前仪式动画
  const ritual = document.createElement("div");
  ritual.className = "fixed inset-0 bg-zinc-950/95 flex items-center justify-center z-[100000]";
  ritual.innerHTML = `
    <div class="text-center">
      <div class="text-[120px] mb-8 animate-[spin_1.5s_linear_infinite]">🎰</div>
      <div class="text-5xl font-bold mb-3">命运正在选择你的传说...</div>
      <div class="flex justify-center gap-3 mt-4">
        <div class="w-4 h-4 bg-white rounded-full animate-bounce"></div>
        <div class="w-4 h-4 bg-white rounded-full animate-bounce" style="animation-delay:150ms"></div>
        <div class="w-4 h-4 bg-white rounded-full animate-bounce" style="animation-delay:300ms"></div>
      </div>
    </div>
  `;
  document.body.appendChild(ritual);
  setTimeout(() => {
    ritual.style.transition = "opacity .4s ease";
    ritual.style.opacity = "0";
    setTimeout(() => ritual.remove(), 400);
    renderEnhancedDrawCards(results, poolType, container);
  }, 950);
}

function renderEnhancedDrawCards(results, poolType, container) {
  results.forEach((item, i) => {
    const data = poolType === "char" ? window.getCharacterData(item.id) : window.getWeaponData(item.id);
    const rarity = data.rarity;
    const isRare = rarity === "SSR" || rarity === "UR";
    const isUR = rarity === "UR";
    const card = document.createElement("div");
    card.className = `draw-card group relative w-44 sm:w-56 bg-zinc-900 rounded-3xl overflow-hidden border-4 cursor-pointer transition-all ${getRarityBorderClass(rarity)}`;
    card.style.opacity = "0";
    card.style.transform = "translateY(60px) rotateX(25deg) scale(0.7)";
    card.innerHTML = `
      <div class="relative h-full">
        <img src="${data.image}" class="w-full aspect-[16/13] object-cover ${isRare ? 'rare-shimmer' : ''}" />
       
        <div class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 to-transparent"></div>
       
        <div class="absolute top-4 right-4 px-4 py-1 text-xs font-extrabold tracking-[3px] rounded-full ${getRarityBadge(rarity)}">
          ${rarity}
        </div>
        <div class="absolute bottom-0 left-0 right-0 p-5">
          <div class="font-black text-2xl text-white drop-shadow">${data.name}</div>
          <div class="text-sm text-zinc-300">${data.category || data.type || ''}</div>
        </div>
        ${isRare ? `<div class="absolute inset-0 bg-[radial-gradient(#fff_0.8px,transparent_1px)] bg-[length:4px_4px] opacity-30 pointer-events-none"></div>` : ''}
      </div>
    `;
    card.onclick = () => poolType === "char" ? window.showCharacterDetailById?.(item.id) : alert(data.name + " - " + rarity);
    container.appendChild(card);
    // 弹出动画
    setTimeout(() => {
      card.style.transition = "all .65s cubic-bezier(0.23, 1.0, 0.32, 1)";
      card.style.opacity = "1";
      card.style.transform = "translateY(0) rotateX(0) scale(1)";
      if (isRare) {
        createEpicParticles(card, rarity);
        if (isUR) createURLightBeam(card);
      }
    }, i * 95 + 80);
  });
  // 全屏史诗特效
  const hasEpic = results.some(r => {
    const d = poolType === "char" ? window.getCharacterData(r.id) : window.getWeaponData(r.id);
    return d.rarity === "UR" || d.rarity === "SSR";
  });
  if (hasEpic) {
    setTimeout(() => {
      triggerEpicEffects(results, poolType);
    }, 650);
  }
}

function getRarityBorderClass(r) {
  return r === "UR" ? "border-orange-400 shadow-[0_0_50px_#f59e0b]" :
         r === "SSR" ? "border-yellow-400 shadow-[0_0_35px_#eab308]" :
         r === "SR" ? "border-purple-500" : "border-blue-500";
}

function getRarityBadge(r) {
  return r === "UR" ? "bg-gradient-to-r from-orange-500 to-red-500 text-white" :
         r === "SSR" ? "bg-gradient-to-r from-yellow-300 to-amber-400 text-black" :
         r === "SR" ? "bg-purple-600 text-white" : "bg-blue-600 text-white";
}

function createEpicParticles(card, rarity) {
  const count = rarity === "UR" ? 18 : 10;
  const colors = rarity === "UR" ? ["#fb923c","#f59e0b","#ef4444"] : ["#fde047","#eab308","#c084fc"];
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "absolute w-[5px] h-[5px] rounded-full pointer-events-none";
    p.style.background = colors[i % colors.length];
    p.style.left = Math.random()*100 + "%";
    p.style.top = Math.random()*100 + "%";
    card.appendChild(p);
    setTimeout(() => {
      p.animate([
        { transform: "scale(1) translate(0,0)", opacity: 0.9 },
        { transform: `scale(0) translate(${(Math.random()-0.5)*180}px, ${(Math.random()-0.5)*140}px)`, opacity: 0 }
      ], { duration: 1100 + Math.random()*600, easing: "ease-out" }).onfinish = () => p.remove();
    }, 30);
  }
}

function createURLightBeam(card) {
  const beam = document.createElement("div");
  beam.className = "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] pointer-events-none";
  beam.style.background = "conic-gradient(transparent, #fb923c33, transparent)";
  beam.style.animation = "spin 2.8s linear infinite";
  card.appendChild(beam);
  setTimeout(() => beam.remove(), 5200);
}

function triggerEpicEffects(results, poolType) {
  // 屏幕闪光
  const flash = document.createElement("div");
  flash.className = "fixed inset-0 bg-white z-[99999] pointer-events-none";
  flash.style.opacity = "0.18";
  document.body.appendChild(flash);
  setTimeout(() => { flash.style.transition = "opacity .9s"; flash.style.opacity = "0"; setTimeout(() => flash.remove(), 900); }, 120);
  // UR 专属彩带爆裂
  if (results.some(r => (poolType === "char" ? window.getCharacterData(r.id) : window.getWeaponData(r.id)).rarity === "UR")) {
    createConfettiBurst();
  }
}

function createConfettiBurst() {
  const emojis = ["⭐", "🎉", "✨", "🔥", "🎆"];
  for (let i = 0; i < 45; i++) {
    const c = document.createElement("div");
    c.className = "fixed text-3xl z-[99999] pointer-events-none";
    c.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    c.style.left = Math.random() * window.innerWidth + "px";
    c.style.top = "-30px";
    document.body.appendChild(c);
    const drift = (Math.random() - 0.5) * 220;
    c.animate([
      { transform: "translateY(0) rotate(0deg)", opacity: 1 },
      { transform: `translateY(${window.innerHeight + 120}px) translateX(${drift}px) rotate(${Math.random()*900-450}deg)`, opacity: 0 }
    ], { duration: 2400 + Math.random()*900, easing: "cubic-bezier(.22,1,.36,1)" }).onfinish = () => c.remove();
  }
}

function hideDrawModal() {
  document.getElementById("drawModal").classList.add("hidden");
}

function resetGame() {
  if (confirm("⚠️ 确定要初始化网页吗？\n\n所有存档、角色、材料、商店等级等数据将被永久清除！\n此操作不可撤销！")) {
    localStorage.removeItem("gachaGame");
    alert("✅ 网页已初始化！即将刷新页面...");
    setTimeout(() => location.reload(), 600);
  }
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

// 赌博/扫雷存根（防止null报错）
window.switchGamblingTab = switchGamblingTab;
window.selectCurrency = selectCurrency;
window.startMinesweeper = startMinesweeper;
