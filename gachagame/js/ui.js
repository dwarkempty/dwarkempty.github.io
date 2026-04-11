// js/ui.js - UI 动画、Modal、记录查询、控制台 + 经营系统完整逻辑（完整版，无任何省略）
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
    for (let i = 1; i <= 15; i++) {
      player.owned.push({
        id: Date.now() + i,
        charId: i,
        level: Math.min(level, 100),
        stars: Math.min(stars, 5),
        equippedWeapon: null
      });
    }
    log.innerHTML += `✅ 已获得全部15个角色（等级${level}，星级${stars}）<br>`;
    window.saveGame();
    window.renderInventory();
  } 
  else if (cmd === "give" && parts[1] === "allweapons") {
    const level = parseInt(parts[2]) || 1;
    const stars = parseInt(parts[3]) || 0;
    for (let i = 1; i <= 15; i++) {
      player.weapons.push({
        id: Date.now() + i,
        weaponId: i,
        level: Math.min(level, 100),
        stars: Math.min(stars, 5)
      });
    }
    log.innerHTML += `✅ 已获得全部15个武器（等级${level}，星级${stars}）<br>`;
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
    } else if (id >= 1 && id <= 15) {
      const level = parseInt(parts[2]) || 1;
      const stars = parseInt(parts[3]) || 0;
      player.owned.push({ id: Date.now(), charId: id, level: Math.min(level, 100), stars: Math.min(stars, 5), equippedWeapon: null });
      log.innerHTML += `✅ 已获得角色 ${window.getCharacterData(id).name} Lv.${level} ★${stars}<br>`;
    } else if (id >= 100 && id <= 114) {
      const weaponRealId = id - 99;
      const level = parseInt(parts[2]) || 1;
      const stars = parseInt(parts[3]) || 0;
      player.weapons.push({ id: Date.now(), weaponId: weaponRealId, level: Math.min(level, 100), stars: Math.min(stars, 5) });
      log.innerHTML += `✅ 已获得武器 ${window.getWeaponData(weaponRealId).name} Lv.${level} ★${stars}<br>`;
    } else if (id >= 201 && id <= 220) {
      const mat = window.materialsPool.find(m => m.id === id - 200);
      if (mat) {
        player.materials[id - 200] = (player.materials[id - 200] || 0) + amount;
        log.innerHTML += `✅ 已获得 ${amount} 个 ${mat.name}<br>`;
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

// ==================== 经营系统完整逻辑 ====================
let currentCustomer = null;
let currentCrafting = [];
let currentCraftedPotion = null;

function startOperating() {
  // 权重随机选择顾客
  let pool = [];
  if (player.shopLevel === 1) pool = window.customerDemands.filter(c => c.level === 1);
  else if (player.shopLevel === 2) pool = window.customerDemands.filter(c => c.level === 1 || c.level === 2);
  else if (player.shopLevel === 3) pool = window.customerDemands.filter(c => c.level === 1 || c.level === 2 || c.level === 3);
  else if (player.shopLevel === 4) pool = window.customerDemands.filter(c => c.level === 1 || c.level === 2 || c.level === 3 || c.level === 4);
  else if (player.shopLevel === 5) pool = window.customerDemands.filter(c => c.level === 1 || c.level === 2 || c.level === 3 || c.level === 4 || c.level === 5);

  currentCustomer = pool[Math.floor(Math.random() * pool.length)];
  currentCrafting = [];
  currentCraftedPotion = null;

  const modalHTML = `
    <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
      <div class="bg-zinc-900 rounded-3xl p-8 max-w-2xl w-full mx-4">
        <h3 class="text-3xl font-bold mb-2">👤 顾客出现</h3>
        <p class="text-xl mb-6">"${currentCustomer.demand}"</p>
        
        <div class="grid grid-cols-2 gap-6">
          <div>
            <div class="text-sm text-gray-400 mb-3">选择材料</div>
            <div class="grid grid-cols-2 gap-2 max-h-80 overflow-auto" id="materialSelect"></div>
          </div>
          
          <div>
            <div class="text-sm text-gray-400 mb-2">当前配置</div>
            <div id="currentCraft" class="bg-zinc-800 rounded-2xl p-4 min-h-[100px] flex flex-wrap gap-2 mb-4"></div>
            
            <button onclick="window.craftPotion()" class="w-full py-3 text-lg font-bold bg-teal-600 hover:bg-teal-700 rounded-2xl mb-3">配置药水</button>
            
            <div id="submitPotionArea" class="hidden bg-emerald-900 rounded-2xl p-4 mb-4">
              <div class="text-sm text-emerald-300 mb-2">当前要提交的药水</div>
              <div id="submitPotionCard" class="flex justify-between items-center"></div>
            </div>
            
            <button onclick="window.giveToCustomer()" class="w-full py-4 text-xl font-bold bg-emerald-600 hover:bg-emerald-700 rounded-2xl">给予顾客</button>
          </div>
        </div>
        
        <button onclick="window.hideOperatingModal()" class="mt-6 w-full py-4 text-xl font-bold bg-zinc-700 rounded-2xl">取消</button>
      </div>
    </div>`;
  
  const div = document.createElement("div");
  div.id = "operatingModal";
  div.innerHTML = modalHTML;
  document.body.appendChild(div);
  
  renderMaterialSelect();
}

function renderMaterialSelect() {
  const container = document.getElementById("materialSelect");
  container.innerHTML = "";
  window.materialsPool.forEach(mat => {
    const count = player.materials[mat.id] || 0;
    const btn = document.createElement("button");
    btn.className = `p-3 rounded-2xl text-left ${count > 0 ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-900 opacity-50 cursor-not-allowed'}`;
    btn.innerHTML = `
      <div class="font-medium">${mat.name}</div>
      <div class="text-xs text-gray-400">${mat.desc}</div>
      <div class="text-emerald-400 text-xl font-bold">${count}</div>
    `;
    if (count > 0) {
      btn.onclick = () => {
        const existing = currentCrafting.find(item => item.id === mat.id);
        if (existing) existing.qty++;
        else currentCrafting.push({id: mat.id, qty: 1});
        renderCurrentCraft();
      };
    }
    container.appendChild(btn);
  });
}

function renderCurrentCraft() {
  const container = document.getElementById("currentCraft");
  container.innerHTML = currentCrafting.map(item => {
    const mat = window.materialsPool.find(m => m.id === item.id);
    return `<div class="bg-zinc-900 px-4 py-1 rounded-xl text-sm">${mat.name} ×${item.qty}</div>`;
  }).join('') || '<p class="text-gray-500 text-center py-8">点击左侧材料添加</p>';
}

function craftPotion() {
  if (currentCrafting.length === 0) return alert("请先选择材料！");
  
  let matchedRecipe = null;
  for (let recipe of window.recipesPool) {
    if (recipe.level > player.shopLevel) continue;
    if (recipe.materials.length !== currentCrafting.length) continue;
    let match = true;
    for (let req of recipe.materials) {
      const selected = currentCrafting.find(s => s.id === req.id);
      if (!selected || selected.qty !== req.qty) match = false;
    }
    if (match) {
      matchedRecipe = recipe;
      break;
    }
  }
  
  currentCrafting.forEach(item => {
    player.materials[item.id] = (player.materials[item.id] || 0) - item.qty;
  });
  
  currentCraftedPotion = matchedRecipe || { id: 0, name: "未知的药水", gold: 0, operating: 0 };
  currentCrafting = [];
  
  renderCurrentCraft();
  window.renderMaterialsWarehouse();
  showSubmitPotion();
}

function showSubmitPotion() {
  const area = document.getElementById("submitPotionArea");
  const card = document.getElementById("submitPotionCard");
  area.classList.remove("hidden");
  
  card.innerHTML = `
    <div class="font-bold">${currentCraftedPotion.name}</div>
    <button onclick="window.deleteCraftedPotion()" class="px-4 py-1 bg-red-500 hover:bg-red-600 rounded-xl text-sm">删除重新配置</button>
  `;
}

function deleteCraftedPotion() {
  currentCraftedPotion = null;
  document.getElementById("submitPotionArea").classList.add("hidden");
  alert("已删除当前药水，可以重新配置");
}

function giveToCustomer() {
  if (!currentCraftedPotion) return alert("请先配置药水！");
  
  const recipe = currentCraftedPotion;
  let isCorrect = false;
  
  if (currentCustomer && currentCustomer.satisfy) {
    isCorrect = currentCustomer.satisfy.includes(recipe.id);
  }
  
  if (isCorrect && recipe.id !== 0) {
    const reward = recipe.gold;
    player.gold += reward;
    player.operatingPoints += recipe.operating || 5;
    document.getElementById("gold").textContent = player.gold;
    alert(`✅ 顾客满意！获得 ${reward} 金币`);
  } else {
    player.operatingPoints = Math.max(0, player.operatingPoints - 2);
    alert(recipe.id === 0 ? "❌ 未知的药水！" : "❌ 这不是我要的药！");
  }
  
  const nextLevelCost = player.shopLevel === 1 ? 50 : player.shopLevel === 2 ? 100 : player.shopLevel === 3 ? 180 : 250;
  const upgradeGold = player.shopLevel === 1 ? 500 : player.shopLevel === 2 ? 1000 : player.shopLevel === 3 ? 1500 : 2000;
  
  if (player.operatingPoints >= nextLevelCost) {
    if (player.gold >= upgradeGold) {
      if (confirm(`商店可升级到 Lv.${player.shopLevel + 1}，需要花费 ${upgradeGold} 金币，是否升级？`)) {
        player.gold -= upgradeGold;
        player.operatingPoints -= nextLevelCost;
        player.shopLevel++;
        alert(`🎉 商店升级到 Lv.${player.shopLevel}！`);
      }
    } else {
      alert(`经营值已满，但金币不足${upgradeGold}，无法升级`);
    }
  }
  
  window.saveGame();
  window.renderShopInfo();
  window.hideOperatingModal();
}

function hideOperatingModal() {
  const modal = document.getElementById("operatingModal");
  if (modal) modal.remove();
  currentCrafting = [];
  currentCraftedPotion = null;
}

function renderMaterialsWarehouse() {
  const container = document.getElementById("materialsWarehouse");
  container.innerHTML = "";
  window.materialsPool.forEach(mat => {
    const count = player.materials[mat.id] || 0;
    const div = document.createElement("div");
    div.className = "flex justify-between items-center bg-zinc-800 rounded-2xl p-3 mb-2";
    div.innerHTML = `
      <div>
        <div class="font-medium">${mat.name}</div>
        <div class="text-xs text-gray-400">${mat.desc}</div>
      </div>
      <div class="text-right">
        <span class="text-2xl font-bold text-emerald-400">${count}</span>
      </div>
    `;
    container.appendChild(div);
  });
  if (Object.keys(player.materials).length === 0) {
    container.innerHTML = `<p class="text-gray-500 text-center py-8">暂无材料，快去种植或冒险获取吧！</p>`;
  }
}

function renderRecipeBook() {
  const container = document.getElementById("recipeBook");
  container.innerHTML = "";
  window.recipesPool.forEach(recipe => {
    const div = document.createElement("div");
    div.className = `bg-zinc-800 rounded-2xl p-4 ${player.shopLevel < recipe.level ? 'opacity-50' : ''}`;
    div.innerHTML = `
      <div class="font-bold text-lg">${recipe.name} <span class="text-xs bg-orange-500 text-white px-2 py-0.5 rounded">Lv.${recipe.level}</span></div>
      <div class="text-xs text-gray-400 mt-1">所需材料</div>
      <div class="text-sm">${recipe.materials.map(m => {
        const mat = window.materialsPool.find(x => x.id === m.id);
        return `${mat.name}×${m.qty}`;
      }).join(" + ")}</div>
      <div class="text-emerald-400 text-right mt-3">${recipe.gold} 金币 + ${recipe.operating} 经营值</div>
    `;
    container.appendChild(div);
  });
}

function renderShopInfo() {
  document.getElementById("shopLevelDisplay").textContent = `Lv.${player.shopLevel}`;
  const nextCost = player.shopLevel === 1 ? 50 : player.shopLevel === 2 ? 100 : player.shopLevel === 3 ? 180 : 250;
  const progress = Math.min(100, Math.floor((player.operatingPoints / nextCost) * 100));
  document.getElementById("operatingBar").style.width = `${progress}%`;
  document.getElementById("operatingPointsDisplay").innerHTML = `${player.operatingPoints} / ${nextCost}`;
  window.renderMaterialsWarehouse();
  window.renderRecipeBook();
}

function openPlanting() { alert("🌱 种植系统开发中..."); }
function openMerchant() { alert("🛒 商人系统开发中..."); }
function openDungeon() { alert("🗡️ 地牢冒险系统开发中..."); }

function resetGame() {
  if (confirm("⚠️ 确定要初始化网页吗？\n\n所有存档、角色、材料、商店等级等数据将被永久清除！\n此操作不可撤销！")) {
    localStorage.removeItem("gachaGame");
    alert("✅ 网页已初始化！即将刷新页面...");
    setTimeout(() => location.reload(), 600);
  }
}

// 暴露
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
window.craftPotion = craftPotion;
window.deleteCraftedPotion = deleteCraftedPotion;
window.giveToCustomer = giveToCustomer;
window.hideOperatingModal = hideOperatingModal;
window.renderMaterialsWarehouse = renderMaterialsWarehouse;
window.renderRecipeBook = renderRecipeBook;
window.renderShopInfo = renderShopInfo;
window.resetGame = resetGame;
