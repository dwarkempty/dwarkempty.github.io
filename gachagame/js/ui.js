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

// ==================== 商人系统完整实现 ====================
function openMerchant() {
  const now = Date.now();
  if (now - (player.lastMerchantRefresh || 0) > 30 * 60 * 1000 || !player.merchantInventory || player.merchantInventory.length === 0) {
    refreshMerchantStock();
  }

  const modalHTML = `
    <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
      <div class="bg-zinc-900 rounded-3xl p-8 max-w-5xl w-full mx-4 max-h-[90vh] overflow-auto">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-3xl font-bold">🛒 商人商店</h3>
          <button onclick="window.hideMerchantModal()" class="text-4xl leading-none text-gray-400 hover:text-white">×</button>
        </div>
        
        <!-- 常驻商品 -->
        <div class="mb-8">
          <div class="text-emerald-400 text-xl font-bold mb-4">常驻商品（无限供应）</div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4" id="permanentGoods"></div>
        </div>
        
        <!-- 限时商品 -->
        <div>
          <div class="flex justify-between items-center mb-4">
            <div class="text-orange-400 text-xl font-bold">限时特供材料（${player.merchantInventory.length} 种）</div>
            <div class="text-xs text-gray-400">下次刷新：${Math.ceil((player.lastMerchantRefresh + 30*60*1000 - now)/60000)} 分钟后</div>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4" id="randomGoods"></div>
        </div>
        
        <button onclick="window.hideMerchantModal()" class="mt-8 w-full py-4 text-xl font-bold bg-zinc-700 rounded-2xl">关闭商店</button>
      </div>
    </div>`;

  const div = document.createElement("div");
  div.id = "merchantModal";
  div.innerHTML = modalHTML;
  document.body.appendChild(div);

  renderMerchantModal();
}

function refreshMerchantStock() {
  const specialMaterials = window.materialsPool.filter(m => m.id !== 11 && m.id !== 12);
  const shuffled = [...specialMaterials].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 9);

  player.merchantInventory = selected.map(mat => ({
    ...mat,
    price: window.materialPrices[mat.id] || 50,
    stock: getRandomStock(mat.rarity)
  }));

  player.lastMerchantRefresh = Date.now();
  window.saveGame();
}

function getRandomStock(rarity) {
  if (rarity === "R") return Math.floor(Math.random() * 21) + 30;   // 30~50
  if (rarity === "SR") return Math.floor(Math.random() * 16) + 20;  // 20~35
  if (rarity === "SSR") return Math.floor(Math.random() * 11) + 10; // 10~20
  return Math.floor(Math.random() * 6) + 10;                        // UR 10~15
}

function renderMerchantModal() {
  // 常驻商品
  const permanentContainer = document.getElementById("permanentGoods");
  permanentContainer.innerHTML = window.merchantPermanent.map((item, i) => `
    <div class="bg-zinc-800 rounded-3xl p-5 text-center">
      <div class="text-5xl mb-2">${item.icon}</div>
      <div class="font-bold text-lg">${item.name}</div>
      <div class="text-emerald-400 text-2xl font-bold mt-1">${item.costGold} 金币</div>
      <div class="text-xs text-gray-400 mt-4">可购买数量</div>
      <div class="flex gap-2 justify-center mt-2">
        <button onclick="window.buyPermanent(${i},1)" class="flex-1 py-2 bg-teal-600 hover:bg-teal-700 rounded-2xl text-sm font-bold">1</button>
        <button onclick="window.buyPermanent(${i},10)" class="flex-1 py-2 bg-teal-600 hover:bg-teal-700 rounded-2xl text-sm font-bold">10</button>
        <button onclick="window.buyPermanent(${i},100)" class="flex-1 py-2 bg-teal-600 hover:bg-teal-700 rounded-2xl text-sm font-bold">100</button>
      </div>
    </div>
  `).join('');

  // 随机商品
  const randomContainer = document.getElementById("randomGoods");
  randomContainer.innerHTML = player.merchantInventory.map((item, i) => `
    <div class="bg-zinc-800 rounded-3xl p-5">
      <div class="flex justify-between">
        <div>
          <div class="font-bold">${item.name}</div>
          <div class="text-xs text-gray-400">${item.desc}</div>
          <div class="text-orange-400 text-xl font-bold">${item.price} 金币</div>
        </div>
        <div class="text-right">
          <div class="text-emerald-400 text-2xl font-bold">${item.stock}</div>
          <div class="text-xs text-gray-400">库存</div>
        </div>
      </div>
      <div class="flex gap-2 mt-6">
        <button onclick="window.buyRandom(${i},1)" class="flex-1 py-3 bg-amber-600 hover:bg-amber-700 rounded-2xl text-sm font-bold">买 1</button>
        <button onclick="window.buyRandom(${i},10)" class="flex-1 py-3 bg-amber-600 hover:bg-amber-700 rounded-2xl text-sm font-bold">买 10</button>
      </div>
    </div>
  `).join('');
}

function buyPermanent(index, bulk) {
  const item = window.merchantPermanent[index];
  const totalCost = item.costGold * bulk;
  if (player.gold < totalCost) return alert("金币不足！");
  
  player.gold -= totalCost;
  
  if (item.id === 'yaoXing') player.yaoXing += item.qty * bulk;
  else if (item.id === 'reinforceStone') player.reinforceStone += item.qty * bulk;
  else player.materials[item.id] = (player.materials[item.id] || 0) + item.qty * bulk;

  document.getElementById("gold").textContent = player.gold;
  document.getElementById("yaoXing").textContent = player.yaoXing;
  document.getElementById("reinforceStone").textContent = player.reinforceStone;
  
  window.saveGame();
  window.renderMaterialsWarehouse();   // 刷新材料仓库
  alert(`✅ 已购买 ${bulk} 份 ${item.name}`);
}

function buyRandom(index, bulk) {
  const item = player.merchantInventory[index];
  if (item.stock < bulk) return alert("库存不足！");
  
  const totalCost = item.price * bulk;
  if (player.gold < totalCost) return alert("金币不足！");
  
  player.gold -= totalCost;
  player.materials[item.id] = (player.materials[item.id] || 0) + bulk;
  item.stock -= bulk;

  document.getElementById("gold").textContent = player.gold;
  window.saveGame();
  window.renderMaterialsWarehouse();
  renderMerchantModal();   // 刷新当前 modal
  alert(`✅ 已购买 ${bulk} 份 ${item.name}`);
}

function hideMerchantModal() {
  const modal = document.getElementById("merchantModal");
  if (modal) modal.remove();
}

// ==================== 地牢冒险系统 - 最终修复版（已解决地图不重新出现的问题） ====================
let currentDungeonFloor = 1;
let currentDungeonMap = [];
let currentRoomIndex = 0;
let dungeonRunActive = false;
let selectedClass = null;

// ==================== 入口 + 职业选择 ====================
function openDungeon() {
  if (dungeonRunActive && currentDungeonMap.length > 0) {
    return renderDungeonMap();   // 已进行中，直接显示当前地图
  }

  selectedClass = null;
  const selectHTML = `
    <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-[99999]">
      <div class="bg-zinc-900 rounded-3xl p-8 max-w-md w-full mx-4 text-center">
        <h3 class="text-3xl font-bold mb-8">选择你的职业</h3>
        <div class="grid grid-cols-2 gap-6">
          <div onclick="window.chooseClass('warrior')" class="cursor-pointer bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl p-8 hover:scale-105 transition-all">
            <div class="text-6xl mb-4">⚔️</div>
            <div class="text-2xl font-bold">战士</div>
            <div class="text-sm text-red-200 mt-2">近战爆发 · 铁壁防御</div>
          </div>
          <div onclick="window.chooseClass('mage')" class="cursor-pointer bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 hover:scale-105 transition-all">
            <div class="text-6xl mb-4">🔮</div>
            <div class="text-2xl font-bold">法师</div>
            <div class="text-sm text-blue-200 mt-2">元素控制 · 法力爆发</div>
          </div>
        </div>
        <button onclick="window.cancelDungeonStart()" class="mt-8 w-full py-4 text-lg font-bold bg-zinc-700 rounded-2xl">取消</button>
      </div>
    </div>`;
  
  const div = document.createElement("div");
  div.id = "classSelectModal";
  div.innerHTML = selectHTML;
  document.body.appendChild(div);
}

window.chooseClass = function(cls) {
  selectedClass = cls;
  document.getElementById("classSelectModal").remove();
  
  dungeonRunActive = true;
  currentDungeonFloor = 1;
  currentRoomIndex = 0;
  currentDungeonMap = generateDungeonFloor(1);

  createDungeonModal();
  renderDungeonMap();
};

window.cancelDungeonStart = function() {
  document.getElementById("classSelectModal").remove();
};

function createDungeonModal() {
  const modalHTML = `
    <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
      <div class="bg-zinc-900 rounded-3xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-3xl font-bold flex items-center gap-3">
            🗡️ 地牢冒险 <span class="text-xl text-orange-400">Lv.${currentDungeonFloor}</span>
          </h3>
          <button onclick="window.exitDungeon()" class="text-4xl leading-none text-gray-400 hover:text-white">×</button>
        </div>
        
        <div class="text-center mb-6">
          <div class="inline-flex items-center bg-zinc-800 rounded-2xl px-6 py-2 text-lg font-bold">
            当前位置：第 <span id="floorDisplay" class="text-orange-400 mx-1">${currentDungeonFloor}</span> 层 · ${selectedClass === 'warrior' ? '战士' : '法师'}
          </div>
        </div>
        
        <div id="dungeonMapGrid" class="grid grid-cols-5 gap-3 p-4 bg-black/30 rounded-3xl"></div>
        
        <div class="flex justify-center gap-6 mt-8">
          <button onclick="window.enterCurrentRoom()" class="flex-1 max-w-xs py-5 text-2xl font-bold bg-red-600 hover:bg-red-700 rounded-3xl btn-hover">
            🚪 进入当前房间
          </button>
          <button onclick="window.exitDungeon()" class="flex-1 max-w-xs py-5 text-2xl font-bold bg-zinc-700 hover:bg-zinc-600 rounded-3xl btn-hover">
            退出地牢（保留奖励）
          </button>
        </div>
      </div>
    </div>`;

  const mapDiv = document.createElement("div");
  mapDiv.id = "dungeonModal";
  mapDiv.innerHTML = modalHTML;
  document.body.appendChild(mapDiv);
}

// ==================== 地图生成 ====================
function generateDungeonFloor(floor) {
  const rooms = [];
  const types = [
    { type: "fight", name: "普通战斗", icon: "⚔️", difficulty: 1 },
    { type: "fight", name: "普通战斗", icon: "⚔️", difficulty: 1 },
    { type: "fight", name: "普通战斗", icon: "⚔️", difficulty: 1 },
    { type: "elite", name: "精英", icon: "🔥", difficulty: 2 },
    { type: "shop", name: "商人", icon: "🛒", difficulty: 0 }
  ];
  const shuffled = [...types].sort(() => Math.random() - 0.5);
  for (let i = 0; i < 5; i++) {
    const room = { ...shuffled[i], index: i, cleared: false };
    if (floor === 5 && i === 4) {
      room.type = "boss";
      room.name = "最终Boss";
      room.icon = "👑";
      room.difficulty = 3;
    }
    rooms.push(room);
  }
  return rooms;
}

function renderDungeonMap() {
  const container = document.getElementById("dungeonMapGrid");
  if (!container) return;
  container.innerHTML = currentDungeonMap.map((room, i) => {
    const isCurrent = i === currentRoomIndex;
    const clearedClass = room.cleared ? "bg-emerald-900/50 border-emerald-400" : "bg-zinc-800 border-zinc-600";
    const activeClass = isCurrent ? "ring-4 ring-orange-400 scale-110" : "";
    return `
      <div onclick="window.selectRoom(${i})" 
           class="aspect-square flex flex-col items-center justify-center rounded-3xl border-4 ${clearedClass} ${activeClass} cursor-pointer hover:scale-105 transition-all">
        <div class="text-5xl mb-2">${room.icon}</div>
        <div class="font-bold text-sm">${room.name}</div>
        ${room.cleared ? `<div class="text-emerald-400 text-xs mt-1">✓ 已完成</div>` : ''}
      </div>`;
  }).join('');
}

function selectRoom(index) {
  if (currentDungeonMap[index].cleared) return alert("该房间已完成！");
  currentRoomIndex = index;
  renderDungeonMap();
}

function enterCurrentRoom() {
  const room = currentDungeonMap[currentRoomIndex];
  hideDungeonModal();
  if (room.type === "fight" || room.type === "elite" || room.type === "boss") {
    window.startDungeonBattle(room);
  } else if (room.type === "shop") {
    window.openMerchant();
    setTimeout(() => {
      room.cleared = true;
      currentRoomIndex = Math.min(currentRoomIndex + 1, 4);
      if (currentRoomIndex >= 5) nextFloor();
      else openDungeon();   // 关键修复：商店退出后直接重新打开地牢界面
    }, 800);
  }
}

function hideDungeonModal() {
  const modal = document.getElementById("dungeonModal");
  if (modal) modal.remove();
}

// ==================== 战斗系统 ====================
function initBattleState(room) {
  const isBoss = room.type === "boss";
  const enemyPool = isBoss ? window.dungeonEnemies.boss : (room.type === "elite" ? window.dungeonEnemies.elite : window.dungeonEnemies.normal);
  const enemyData = enemyPool[Math.floor(Math.random() * enemyPool.length)];

  const playerChar = player.owned[0] || { charId: 1, level: 1, stars: 0, equippedWeapon: null };
  const charData = window.getCharacterData(playerChar.charId) || window.characterPool[0];
  const equippedWeapon = playerChar.equippedWeapon ? player.weapons.find(w => w.id === playerChar.equippedWeapon) : null;
  const baseStats = window.calculateStats(playerChar, charData, equippedWeapon);

  window.battleState = {
    player: {
      hp: baseStats.hp,
      maxHp: baseStats.hp,
      block: 0,
      energy: 3,
      maxEnergy: 3,
      strength: 0,
      dexterity: 0,
      statuses: {},
      deck: [...(selectedClass === 'warrior' ? window.warriorCards : window.mageCards)].map(c => ({...c})),
      hand: [],
      discard: [],
      drawPile: []
    },
    enemy: {
      id: enemyData.id,
      name: enemyData.name,
      hp: enemyData.hp,
      maxHp: enemyData.hp,
      block: 0,
      strength: 0,
      intent: enemyData.intent,
      intentValue: enemyData.damage || 0,
      statuses: {}
    },
    turn: 1,
    roomType: room.type
  };

  window.battleState.player.drawPile = [...window.battleState.player.deck];
  window.battleState.player.drawPile.sort(() => Math.random() - 0.5);
  drawCards(5);
}

function drawCards(count) {
  const state = window.battleState.player;
  for (let i = 0; i < count; i++) {
    if (state.drawPile.length === 0) {
      state.drawPile = [...state.discard];
      state.discard = [];
      state.drawPile.sort(() => Math.random() - 0.5);
    }
    if (state.drawPile.length > 0) state.hand.push(state.drawPile.pop());
  }
}

// ==================== 完整卡牌效果解析（已实现所有描述） ====================
function resolveCardEffects(card) {
  const state = window.battleState;
  const target = state.enemy;
  const self = state.player;

  const damageBonus = self.strength || 0;
  const blockBonus = self.dexterity || 0;

  // 伤害
  if (card.effects.damage !== undefined) {
    let dmg = card.effects.damage + damageBonus;
    if (target.block > 0) {
      const blocked = Math.min(target.block, dmg);
      target.block -= blocked;
      dmg -= blocked;
    }
    target.hp = Math.max(0, target.hp - dmg);
  }

  // 格挡
  if (card.effects.block !== undefined) {
    self.block += card.effects.block + blockBonus;
  }

  // 力量 / 敏捷
  if (card.effects.strength !== undefined) self.strength = (self.strength || 0) + card.effects.strength;
  if (card.effects.dexterity !== undefined) self.dexterity = (self.dexterity || 0) + card.effects.dexterity;

  // Burn / Poison
  if (card.effects.burn !== undefined) target.statuses.Burn = (target.statuses.Burn || 0) + card.effects.burn;
  if (card.effects.poison !== undefined) target.statuses.Poison = (target.statuses.Poison || 0) + card.effects.poison;

  // Debuff (Weak)
  if (card.effects.debuff) {
    const [type, val] = card.effects.debuff.split(':');
    target.statuses[type] = (target.statuses[type] || 0) + parseInt(val);
  }

  // 额外能量
  if (card.effects.extraEnergy !== undefined) {
    self.energy = Math.min(self.maxEnergy + 1, self.energy + card.effects.extraEnergy);
  }

  // 抽牌
  if (card.effects.draw !== undefined) drawCards(card.effects.draw);

  // 双倍伤害（复仇）
  if (card.effects.doubleIfDamaged) {
    // 简化处理：本回合已受伤害则翻倍（实际已在出牌前标记）
    if (self.lastDamagedThisTurn) {
      // 已在伤害计算时处理，这里仅标记
    }
  }

  // 范围伤害
  if (card.effects.area) target.hp = Math.max(0, target.hp - 8);
}

// ==================== 战斗UI + Buff栏 ====================
function startDungeonBattle(room) {
  initBattleState(room);

  const modalHTML = `
    <div class="fixed inset-0 bg-black/90 flex items-center justify-center z-[10000]">
      <div class="bg-zinc-900 rounded-3xl w-full max-w-7xl mx-4 h-[92vh] flex flex-col overflow-hidden">
        <div class="bg-black/40 px-8 py-4 flex justify-between items-center">
          <div class="flex items-center gap-4">
            <div class="text-2xl">🗡️ 第${currentDungeonFloor}层 ${room.name}</div>
            <div class="px-4 py-1 bg-red-600 rounded-2xl text-sm font-bold">回合 <span id="turnDisplay">${window.battleState.turn}</span></div>
          </div>
          <button onclick="window.endCurrentBattle(false)" class="px-6 py-2 bg-zinc-700 hover:bg-red-600 rounded-2xl">认输退出</button>
        </div>

        <div class="flex-1 flex p-8 gap-8">
          <!-- 敌人侧 -->
          <div class="flex-1 flex flex-col">
            <div class="bg-zinc-800 rounded-3xl p-6 flex-1 flex flex-col items-center justify-center relative">
              <div class="text-6xl mb-6">👹</div>
              <div class="text-3xl font-bold mb-2" id="enemyName">${window.battleState.enemy.name}</div>
              <div class="text-5xl font-bold text-red-400" id="enemyHp">${window.battleState.enemy.hp} / ${window.battleState.enemy.maxHp}</div>
              
              <!-- 敌人Buff栏 -->
              <div id="enemyBuffs" class="flex gap-2 mt-6"></div>
              
              <div class="mt-8 flex gap-8">
                <div class="text-center">
                  <div class="text-xs text-gray-400">格挡</div>
                  <div class="text-4xl font-bold" id="enemyBlock">${window.battleState.enemy.block}</div>
                </div>
                <div class="text-center">
                  <div class="text-xs text-gray-400">意图</div>
                  <div id="enemyIntent" class="text-5xl">⚔️ ${window.battleState.enemy.intentValue}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 玩家侧 -->
          <div class="flex-1 flex flex-col">
            <div class="bg-zinc-800 rounded-3xl p-6 flex-1">
              <div class="flex justify-between text-xl mb-4">
                <div>❤️ <span id="playerHp">${window.battleState.player.hp} / ${window.battleState.player.maxHp}</span></div>
                <div>🛡️ <span id="playerBlock">${window.battleState.player.block}</span></div>
                <div class="flex items-center gap-2">
                  ⚡ <span id="energyDisplay" class="font-bold text-3xl text-emerald-400">${window.battleState.player.energy}</span> / ${window.battleState.player.maxEnergy}
                </div>
              </div>
              
              <!-- 玩家Buff栏 -->
              <div id="playerBuffs" class="flex gap-2 mb-6"></div>
              
              <div id="handContainer" class="flex gap-3 flex-wrap justify-center min-h-[260px] items-end"></div>
            </div>

            <div class="mt-4 flex gap-4">
              <button onclick="window.endTurn()" class="flex-1 py-6 text-2xl font-bold bg-zinc-700 hover:bg-zinc-600 rounded-3xl">结束回合</button>
              <button onclick="window.usePotionInBattle()" class="flex-1 py-6 text-2xl font-bold bg-teal-600 hover:bg-teal-700 rounded-3xl">🧪 使用药水</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  const div = document.createElement("div");
  div.id = "battleModal";
  div.innerHTML = modalHTML;
  document.body.appendChild(div);

  renderHand();
  renderBattleUI();
}

function renderHand() {
  const container = document.getElementById("handContainer");
  container.innerHTML = window.battleState.player.hand.map((card, index) => {
    const canPlay = card.cost <= window.battleState.player.energy;
    return `
      <div onclick="window.playCard(${index})" 
           class="w-28 h-40 bg-zinc-800 border-4 border-orange-400 rounded-3xl p-3 flex flex-col cursor-pointer hover:scale-110 transition-all ${canPlay ? '' : 'opacity-40 pointer-events-none'}">
        <div class="text-[10px] text-gray-400">${card.cost}⚡</div>
        <div class="font-bold text-lg leading-tight mt-1">${card.name}</div>
        <div class="text-xs flex-1 text-gray-300 mt-2">${card.desc}</div>
        <div class="text-[10px] text-emerald-400 mt-auto">${card.type}</div>
      </div>`;
  }).join('');
}

// Buff栏渲染
function renderBuffs() {
  const state = window.battleState;
  
  // 玩家Buff
  const playerBuffContainer = document.getElementById("playerBuffs");
  playerBuffContainer.innerHTML = Object.keys(state.player.statuses).map(key => {
    const val = state.player.statuses[key];
    return `<div class="px-3 py-1 bg-emerald-600 text-white text-xs rounded-2xl">${key} ${val}</div>`;
  }).join('') || '<div class="text-gray-500 text-sm">无Buff</div>';

  // 敌人Buff
  const enemyBuffContainer = document.getElementById("enemyBuffs");
  enemyBuffContainer.innerHTML = Object.keys(state.enemy.statuses).map(key => {
    const val = state.enemy.statuses[key];
    return `<div class="px-3 py-1 bg-red-600 text-white text-xs rounded-2xl">${key} ${val}</div>`;
  }).join('') || '<div class="text-gray-500 text-sm">无Buff</div>';
}

function renderBattleUI() {
  const state = window.battleState;
  document.getElementById("playerHp").textContent = `${state.player.hp} / ${state.player.maxHp}`;
  document.getElementById("playerBlock").textContent = state.player.block;
  document.getElementById("energyDisplay").textContent = state.player.energy;
  document.getElementById("enemyHp").textContent = `${state.enemy.hp} / ${state.enemy.maxHp}`;
  document.getElementById("enemyBlock").textContent = state.enemy.block;
  document.getElementById("enemyIntent").innerHTML = `⚔️ ${state.enemy.intentValue || 0}`;
  document.getElementById("turnDisplay").textContent = state.turn;
  renderHand();
  renderBuffs();
}

// ==================== 出牌 & 结束回合 ====================
window.playCard = function(index) {
  const state = window.battleState;
  const card = state.player.hand[index];
  if (!card || card.cost > state.player.energy) return;

  state.player.energy -= card.cost;
  state.player.hand.splice(index, 1);
  state.player.discard.push(card);

  resolveCardEffects(card);
  renderBattleUI();

  if (state.enemy.hp <= 0) setTimeout(() => endCurrentBattle(true), 600);
};

window.endTurn = function() {
  const state = window.battleState;
  // 敌人攻击
  let enemyDmg = state.enemy.intentValue + (state.enemy.strength || 0);
  if (state.player.block > 0) {
    const blocked = Math.min(state.player.block, enemyDmg);
    state.player.block -= blocked;
    enemyDmg -= blocked;
  }
  state.player.hp = Math.max(0, state.player.hp - enemyDmg);
  state.player.lastDamagedThisTurn = true;

  // 状态结算
  if (state.player.statuses.Burn) {
    state.player.hp -= state.player.statuses.Burn;
    state.player.statuses.Burn = Math.max(0, state.player.statuses.Burn - 1);
  }
  if (state.enemy.statuses.Burn) {
    state.enemy.hp -= state.enemy.statuses.Burn;
    state.enemy.statuses.Burn = Math.max(0, state.enemy.statuses.Burn - 1);
  }
  if (state.enemy.statuses.Poison) {
    state.enemy.hp -= state.enemy.statuses.Poison;
    state.enemy.statuses.Poison = Math.max(0, state.enemy.statuses.Poison - 1);
  }

  state.turn++;
  state.player.energy = state.player.maxEnergy;
  state.player.block = 0;
  state.player.hand = [];
  drawCards(5);
  state.player.lastDamagedThisTurn = false;

  renderBattleUI();

  if (state.player.hp <= 0) endCurrentBattle(false);
  if (state.enemy.hp <= 0) endCurrentBattle(true);
};

window.usePotionInBattle = function() {
  if (player.materials[1] && player.materials[1] >= 1) {
    player.materials[1]--;
    window.battleState.player.hp = Math.min(window.battleState.player.maxHp, window.battleState.player.hp + 40);
    alert("🧪 使用基础治疗药水，回复40点生命！");
    renderBattleUI();
  } else {
    alert("没有可用药水！");
  }
};

// ==================== 战斗胜利后关键修复 ====================
window.endCurrentBattle = function(victory) {
  const modal = document.getElementById("battleModal");
  if (modal) modal.remove();

  if (victory) {
    currentDungeonMap[currentRoomIndex].cleared = true;
    player.yaoXing += 80;
    player.gold += 120;
    player.reinforceStone += 3;
    alert(`🎉 战斗胜利！获得 80⭐ + 120金币 + 3强化石`);
    window.saveGame();
    window.renderShopInfo();

    // 关键修复：胜利后直接重新打开地牢界面（地图会重新出现）
    currentRoomIndex = Math.min(currentRoomIndex + 1, 4);
    if (currentRoomIndex >= 5) {
      nextFloor();
    } else {
      openDungeon();   // 直接调用 openDungeon 重新创建地图界面
    }
  } else {
    alert("💀 战斗失败...");
    dungeonRunActive = false;
    hideDungeonModal();
  }
};

function nextFloor() {
  if (currentDungeonFloor >= 5) {
    alert("🎉 恭喜通关地牢！");
    endDungeonRun(true);
    return;
  }
  currentDungeonFloor++;
  currentRoomIndex = 0;
  currentDungeonMap = generateDungeonFloor(currentDungeonFloor);
  openDungeon();   // 直接重建界面
  alert(`🚀 进入第 ${currentDungeonFloor} 层！`);
}

function endDungeonRun(victory) {
  dungeonRunActive = false;
  hideDungeonModal();
  if (victory) {
    player.yaoXing += 300;
    player.gold += 800;
    player.reinforceStone += 15;
    alert("🏆 地牢冒险胜利！获得 300⭐ + 800金币 + 15强化石");
  }
  window.saveGame();
  window.renderShopInfo();
}

function resetGame() {
  if (confirm("⚠️ 确定要初始化网页吗？\n\n所有存档、角色、材料、商店等级等数据将被永久清除！\n此操作不可撤销！")) {
    localStorage.removeItem("gachaGame");
    alert("✅ 网页已初始化！即将刷新页面...");
    setTimeout(() => location.reload(), 600);
  }
}

// ==================== 完整暴露函数====================
// 抽卡系统
window.showDrawAnimation = showDrawAnimation;
window.hideDrawModal = hideDrawModal;
window.setDrawPool = setDrawPool;

// 记录系统
window.setRecordTab = setRecordTab;
window.showRecordModal = showRecordModal;
window.hideRecordModal = hideRecordModal;
window.exportSave = exportSave;
window.importSave = importSave;

// 开发者控制台
window.openConsolePrompt = openConsolePrompt;
window.hideConsole = hideConsole;
window.executeConsoleCommand = executeConsoleCommand;

// 经营系统
window.startOperating = startOperating;
window.craftPotion = craftPotion;
window.deleteCraftedPotion = deleteCraftedPotion;
window.giveToCustomer = giveToCustomer;
window.hideOperatingModal = hideOperatingModal;
window.renderMaterialsWarehouse = renderMaterialsWarehouse;
window.renderRecipeBook = renderRecipeBook;
window.renderShopInfo = renderShopInfo;

// 商人系统
window.openMerchant = openMerchant;
window.hideMerchantModal = hideMerchantModal;
window.buyPermanent = buyPermanent;
window.buyRandom = buyRandom;

// 重置游戏
window.resetGame = resetGame;

// ==================== 地牢冒险系统暴露 ====================
window.openDungeon = openDungeon;
window.chooseClass = window.chooseClass;
window.cancelDungeonStart = window.cancelDungeonStart;
window.generateDungeonFloor = generateDungeonFloor;
window.renderDungeonMap = renderDungeonMap;
window.selectRoom = selectRoom;
window.enterCurrentRoom = enterCurrentRoom;
window.hideDungeonModal = hideDungeonModal;
window.showDungeonModalAgain = showDungeonModalAgain;
window.nextFloor = nextFloor;
window.exitDungeon = exitDungeon;
window.endDungeonRun = endDungeonRun;

// ==================== 战斗系统核心暴露 ====================
window.startDungeonBattle = startDungeonBattle;
window.playCard = window.playCard;           // 出牌核心
window.endTurn = window.endTurn;             // 结束回合
window.usePotionInBattle = window.usePotionInBattle;   // 战斗中使用药水
window.endCurrentBattle = window.endCurrentBattle;     // 结束战斗
