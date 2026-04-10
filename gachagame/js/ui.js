// js/ui.js - UI 动画、Modal、记录查询、控制台 + 经营系统完整逻辑
function showDrawAnimation(results, poolType) {
  const modal = document.getElementById("drawModal");
  const container = document.getElementById("drawResults");
  const title = document.getElementById("drawTitle");
  container.innerHTML = "";
  modal.classList.remove("hidden");
  title.textContent = poolType === "char" ? (results.length === 1 ? "🎉 单抽角色" : "🎉 十连角色") : (results.length === 1 ? "🎉 单抽武器" : "🎉 十连武器");

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
      give 5 50 3 → 获得角色ID 5（等级50，星级3）<br>
      give 105 30 2 → 获得武器ID 105（等级30，星级2）<br>
      <span class="text-emerald-400">物品ID系统仍然完全有效！角色1-15，武器100-114</span>
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
  if (parts[0].toLowerCase() === "give") {
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
    } else if (id >= 1 && id <= 15) {
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
    } else if (id >= 100 && id <= 114) {
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
    } else {
      log.innerHTML += `❌ 未知物品ID（角色1-15，武器100-114，998=耀星，997=金币，999=强化石）<br>`;
    }
    window.saveGame();
    window.renderInventory();
  } else {
    log.innerHTML += `未知命令<br>`;
  }
  document.getElementById("consoleInput").value = "";
  log.scrollTop = log.scrollHeight;
}

// ==================== 经营系统完整逻辑 ====================
let currentCustomer = null;

function startOperating() {
  currentCustomer = {
    demand: window.customerTemplates[Math.floor(Math.random() * window.customerTemplates.length)],
    rewardMultiplier: Math.random() > 0.7 ? 1.5 : 1
  };
  const modalHTML = `
    <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
      <div class="bg-zinc-900 rounded-3xl p-8 max-w-lg w-full mx-4">
        <h3 class="text-3xl font-bold mb-4">👤 顾客出现</h3>
        <p class="text-xl mb-8">"${currentCustomer.demand}"</p>
        <div class="text-sm text-gray-400 mb-3">选择配方制作药水</div>
        <div class="grid grid-cols-1 gap-3 max-h-96 overflow-auto" id="recipeList"></div>
        <button onclick="window.hideOperatingModal()" class="mt-6 w-full py-4 text-xl font-bold bg-zinc-700 rounded-2xl">取消</button>
      </div>
    </div>`;
  const div = document.createElement("div");
  div.id = "operatingModal";
  div.innerHTML = modalHTML;
  document.body.appendChild(div);
  window.renderRecipeList();
}

function renderRecipeList() {
  const container = document.getElementById("recipeList");
  container.innerHTML = "";
  window.recipesPool.forEach(recipe => {
    if (player.unlockedRecipes.includes(recipe.id) && player.shopLevel >= recipe.minLevel) {
      let canMake = true;
      let missing = [];
      recipe.materials.forEach(m => {
        if ((player.materials[m.id] || 0) < m.qty) {
          canMake = false;
          missing.push(`${window.materialsPool.find(mat=>mat.id===m.id).name}×${m.qty}`);
        }
      });
      const btn = document.createElement("button");
      btn.className = `w-full text-left p-4 rounded-2xl border ${canMake ? 'border-emerald-500 hover:bg-emerald-950' : 'border-gray-600 opacity-50'}`;
      btn.innerHTML = `
        <div class="font-bold">${recipe.name}</div>
        <div class="text-xs text-gray-400">${recipe.materials.map(m => `${window.materialsPool.find(mat=>mat.id===m.id).name}×${m.qty}`).join(" + ")}</div>
        <div class="text-emerald-400 text-right">预计获得 ${Math.floor(recipe.gold * currentCustomer.rewardMultiplier)} 金币</div>
      `;
      if (canMake) btn.onclick = () => window.sellPotion(recipe.id);
      container.appendChild(btn);
    }
  });
}

function sellPotion(recipeId) {
  const recipe = window.recipesPool.find(r => r.id === recipeId);
  recipe.materials.forEach(m => {
    player.materials[m.id] = (player.materials[m.id] || 0) - m.qty;
  });
  const reward = Math.floor(recipe.gold * currentCustomer.rewardMultiplier);
  player.gold += reward;
  player.operatingPoints += 100;

  const nextLevelCost = player.shopLevel * 800;
  if (player.operatingPoints >= nextLevelCost) {
    player.operatingPoints -= nextLevelCost;
    player.shopLevel++;
    if (player.shopLevel === 2 && !player.unlockedRecipes.includes(3)) player.unlockedRecipes.push(3);
    if (player.shopLevel === 3 && !player.unlockedRecipes.includes(4)) player.unlockedRecipes.push(4);
    alert(`🎉 商店升级到 Lv.${player.shopLevel}！`);
  }

  window.saveGame();
  window.hideOperatingModal();
  window.renderShopInfo();
  alert(`✅ 成功出售 ${recipe.name}，获得 ${reward} 金币！`);
}

function hideOperatingModal() {
  const modal = document.getElementById("operatingModal");
  if (modal) modal.remove();
}

function renderShopInfo() {
  document.getElementById("shopLevelDisplay").textContent = `Lv.${player.shopLevel}`;
  const nextCost = player.shopLevel * 800;
  const progress = Math.min(100, Math.floor((player.operatingPoints / nextCost) * 100));
  document.getElementById("operatingBar").style.width = `${progress}%`;
  document.getElementById("operatingPointsDisplay").innerHTML = `${player.operatingPoints} / ${nextCost}`;

  const recipesDiv = document.getElementById("unlockedRecipes");
  recipesDiv.innerHTML = player.unlockedRecipes.map(id => {
    const r = window.recipesPool.find(rec => rec.id === id);
    return `<span class="inline-block bg-orange-500 text-white text-xs px-4 py-1 rounded-full mr-2">${r.name}</span>`;
  }).join('');
}

function openPlanting() { alert("🌱 种植系统开发中..."); }
function openMerchant() { alert("🛒 商人系统开发中..."); }
function openDungeon() { alert("🗡️ 地牢冒险系统开发中..."); }

// 暴露所有函数
window.showDrawAnimation = showDrawAnimation;
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
window.startOperating = startOperating;
window.renderRecipeList = renderRecipeList;
window.sellPotion = sellPotion;
window.hideOperatingModal = hideOperatingModal;
window.renderShopInfo = renderShopInfo;
window.openPlanting = openPlanting;
window.openMerchant = openMerchant;
window.openDungeon = openDungeon;
