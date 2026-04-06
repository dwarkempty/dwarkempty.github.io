// js/inventory.js - 仓库渲染 + 养成系统（完整无省略，性能优化，无任何战斗/技能相关代码）
function sortOwned(list, isChar) {
  const copy = [...list];
  copy.sort((a, b) => {
    const dataA = isChar ? window.getCharacterData(a.charId) : window.getWeaponData(a.weaponId);
    const dataB = isChar ? window.getCharacterData(b.charId) : window.getWeaponData(b.weaponId);
    const rDiff = window.rarityOrder[dataB.rarity] - window.rarityOrder[dataA.rarity];
    if (rDiff !== 0) return rDiff;
    if (dataA.name !== dataB.name) return dataA.name.localeCompare(dataB.name);
    if (a.stars !== b.stars) return b.stars - a.stars;
    return b.level - a.level;
  });
  return copy;
}

function renderInventory() {
  const container = document.getElementById("inventory");
  container.innerHTML = "";
  selected = [];
  const isChar = currentInventoryTab === 0;
  const list = isChar ? player.owned : player.weapons;
  const sorted = sortOwned(list, isChar);

  sorted.forEach((item) => {
    const originalIndex = list.findIndex(o => o.id === item.id);
    const data = isChar ? window.getCharacterData(item.charId) : window.getWeaponData(item.weaponId);

    const div = document.createElement("div");
    div.className = `relative bg-gray-800 rounded-3xl p-3 sm:p-4 cursor-pointer border-4 ${window.getRarityColor(data.rarity)} hover:scale-105 transition btn-hover`;

    let html = '';
    if (isChar) {
      let equippedName = "无";
      let equippedItem = null;
      if (item.equippedWeapon) {
        equippedItem = player.weapons.find(w => w.id === item.equippedWeapon);
        if (equippedItem) {
          const wpData = window.getWeaponData(equippedItem.weaponId);
          equippedName = wpData ? wpData.name : "无";
        }
      }
      const stats = window.calculateStats(item, data, equippedItem);
      html = `
        <img src="${data.image}" class="character-img w-full rounded-2xl mb-3">
        <div class="text-center">
          <div class="rarity-${data.rarity.toLowerCase()} text-xs inline-block px-4 py-1 rounded-full text-white font-bold mb-2">${data.rarity}</div>
          <div class="text-base sm:text-xl font-bold mb-1">${data.name}</div>
          <div class="text-xs text-gray-400">${data.category}</div>
          <div class="flex justify-center items-center gap-1 mt-2 mb-3">
            <span class="text-lg font-bold">Lv.${item.level}</span>
            <span class="star-${Math.min(item.stars + 1, 5)} text-2xl">★</span><span class="text-sm text-gray-400">(${item.stars}/5)</span>
          </div>
          <div class="text-xs text-emerald-400">装备：${equippedName}</div>
          <div class="flex justify-between text-sm mt-4">
            <div>❤️ ${stats.hp}</div><div>⚔️ ${stats.atk}</div><div>🛡️ ${stats.def}</div>
          </div>
        </div>
      `;
    } else {
      let equippedBy = "";
      for (let char of player.owned) {
        if (char.equippedWeapon === item.id) {
          const charData = window.getCharacterData(char.charId);
          equippedBy = `<div class="absolute top-4 right-4 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-xl">已被${charData.name}装备</div>`;
          break;
        }
      }
      const wStats = window.calculateWeaponStats(item, data);
      html = `
        ${equippedBy}
        <img src="${data.image}" class="character-img w-full rounded-2xl mb-3">
        <div class="text-center">
          <div class="rarity-${data.rarity.toLowerCase()} text-xs inline-block px-4 py-1 rounded-full text-white font-bold mb-2">${data.rarity}</div>
          <div class="text-base sm:text-xl font-bold mb-1">${data.name}</div>
          <div class="text-xs text-gray-400">${data.type}</div>
          <div class="flex justify-center items-center gap-1 mt-2 mb-3">
            <span class="text-lg font-bold">Lv.${item.level}</span>
            <span class="star-${Math.min(item.stars + 1, 5)} text-2xl">★</span><span class="text-sm text-gray-400">(${item.stars}/5)</span>
          </div>
          <div class="flex justify-between text-xs mt-2">
            <div>❤️ +${wStats.hp}</div>
            <div>⚔️ +${wStats.atk}</div>
            <div>🛡️ +${wStats.def}</div>
          </div>
          <div class="flex justify-between text-xs mt-1">
            <div>暴击 +${(wStats.critRate*100).toFixed(0)}%</div>
            <div>暴伤 +${(wStats.critDamage*100).toFixed(0)}%</div>
          </div>
        </div>
      `;
    }

    if (decomposeMode) html = `<input type="checkbox" class="absolute top-4 right-4 w-6 h-6 accent-red-500 z-10" data-index="${originalIndex}" onchange="window.toggleSelect(this)">` + html;
    div.innerHTML = html;
    if (!decomposeMode) {
      if (isChar) div.onclick = () => window.showCharacterDetail(originalIndex);
      else div.onclick = () => window.showWeaponDetail(originalIndex);
    }
    container.appendChild(div);
  });

  if (list.length === 0) {
    container.innerHTML = `<p class="text-center text-gray-500 py-12 col-span-full">${isChar ? '还没有角色，快去抽卡吧！' : '还没有武器，快去抽卡吧！'}</p>`;
  }
}

function showCharacterDetail(index) {
  currentModalIndex = index;
  currentModalType = "char";
  const item = player.owned[index];
  const char = window.getCharacterData(item.charId);
  let equippedItem = null;
  if (item.equippedWeapon) equippedItem = player.weapons.find(w => w.id === item.equippedWeapon);
  const stats = window.calculateStats(item, char, equippedItem);

  const equippedName = equippedItem ? window.getWeaponData(equippedItem.weaponId).name : "无武器";

  const borderClass = window.getRarityBorderClass(char.rarity);

  document.getElementById("modalInner").className = `modal-content bg-gray-900 rounded-3xl max-w-full sm:max-w-4xl w-full mx-auto overflow-hidden border-4 ${borderClass}`;

  document.getElementById("modalContent").innerHTML = `
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- 左侧：立绘 + 装备 -->
      <div class="flex-1 flex flex-col">
        <div class="border-4 border-orange-500 rounded-3xl p-4 bg-gray-950 flex-1 flex items-center justify-center relative">
          <img src="${char.image}" class="character-img w-full max-h-[420px] rounded-2xl" style="filter: drop-shadow(0 15px 25px rgba(249,115,22,0.5));">
        </div>

        <!-- 装备武器 -->
        <div class="mt-4 border-4 border-orange-500 rounded-3xl p-4 bg-gray-950">
          <div class="text-center text-lg font-bold mb-3">装备武器</div>
          <div class="bg-gray-800 rounded-2xl p-3 text-center text-base mb-3">${equippedName}</div>
          <select id="equipSelect" class="w-full bg-gray-800 text-white py-3 px-4 rounded-2xl mb-3">
            <option value="">无武器</option>
            ${player.weapons.map(w => {
              const wp = window.getWeaponData(w.weaponId);
              const canEquip = (wp.rarity === "R" || wp.rarity === "SR") || (wp.owner === item.charId);
              const isEquipped = player.owned.some(c => c.equippedWeapon === w.id);
              return canEquip && !isEquipped ? `<option value="${w.id}">${wp.name} (${wp.rarity})</option>` : '';
            }).join('')}
          </select>
          <button onclick="window.equipWeapon()" class="w-full bg-teal-600 hover:bg-teal-700 py-4 rounded-2xl text-xl font-bold btn-hover">更换/装备武器</button>
        </div>

        <!-- 角色描述（已移除技能部分） -->
        <div class="mt-4 border-4 border-orange-500 rounded-3xl p-5 bg-gray-950 text-sm leading-relaxed">
          <div class="font-bold text-orange-400 mb-3">角色描述</div>
          <p>${char.description || '一位神秘的冒险者。'}</p>
        </div>
      </div>

      <!-- 右侧：属性 + 按钮 -->
      <div class="flex-1">
        <div class="grid grid-cols-2 gap-3">
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">等级</div>
            <div class="text-4xl font-bold">${item.level}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">星级</div>
            <div class="text-4xl font-bold">${"★".repeat(item.stars)}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">攻击</div>
            <div class="text-3xl font-bold">${stats.atk}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">暴击率</div>
            <div class="text-3xl font-bold">${(stats.critRate*100).toFixed(0)}%</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">血量</div>
            <div class="text-3xl font-bold">${stats.hp}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">暴击伤害</div>
            <div class="text-3xl font-bold">${(stats.critDamage*100).toFixed(0)}%</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">防御</div>
            <div class="text-3xl font-bold">${stats.def}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">减伤</div>
            <div class="text-3xl font-bold">0%</div>
          </div>
        </div>

        <!-- 升级 & 升星按钮 -->
        <div class="grid grid-cols-2 gap-3 mt-8">
          <button onclick="window.levelUp()" class="btn-hover bg-blue-600 hover:bg-blue-700 py-5 rounded-3xl text-xl font-bold flex items-center justify-center gap-2">
            <i class="fas fa-arrow-up"></i> 升级 Lv.${item.level} → ${item.level+1}（${item.level*30}金币）
          </button>
          <button onclick="window.starUp()" class="btn-hover bg-purple-600 hover:bg-purple-700 py-5 rounded-3xl text-xl font-bold flex items-center justify-center gap-2 ${item.stars >= 5 ? 'opacity-50 cursor-not-allowed' : ''}">
            <i class="fas fa-star"></i> 升星 ★${item.stars} → ★${item.stars+1}
          </button>
        </div>
      </div>
    </div>

    <div class="text-center mt-8">
      <button onclick="window.hideModal()" class="text-gray-400 text-lg btn-hover">关闭</button>
    </div>
  `;

  document.getElementById("modal").classList.remove("hidden");
}

function showWeaponDetail(index) {
  currentModalIndex = index;
  currentModalType = "weapon";
  const item = player.weapons[index];
  const weapon = window.getWeaponData(item.weaponId);
  const wStats = window.calculateWeaponStats(item, weapon);

  const borderClass = window.getRarityBorderClass(weapon.rarity);

  document.getElementById("modalInner").className = `modal-content bg-gray-900 rounded-3xl max-w-full sm:max-w-4xl w-full mx-auto overflow-hidden border-4 ${borderClass}`;

  document.getElementById("modalContent").innerHTML = `
    <div class="flex flex-col lg:flex-row gap-6">
      <div class="flex-1 flex flex-col">
        <div class="border-4 border-orange-500 rounded-3xl p-4 bg-gray-950 flex-1 flex items-center justify-center relative">
          <img src="${weapon.image}" class="character-img w-full max-h-[420px] rounded-2xl" style="filter: drop-shadow(0 15px 25px rgba(249,115,22,0.5));">
        </div>
      </div>

      <div class="flex-1">
        <div class="flex justify-between gap-3 mb-6">
          <div class="flex-1 border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">等级</div>
            <div class="text-4xl font-bold">Lv.${item.level}</div>
          </div>
          <div class="flex-1 border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">星级</div>
            <div class="text-4xl font-bold flex items-center justify-center gap-1">${Array(5).fill(0).map((_,i)=>`<span class="${i < item.stars ? 'star-5' : 'text-gray-500'}">★</span>`).join('')}</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">攻击</div>
            <div class="text-3xl font-bold">+${wStats.atk}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">暴击率</div>
            <div class="text-3xl font-bold">+${(wStats.critRate*100).toFixed(0)}%</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">血量</div>
            <div class="text-3xl font-bold">+${wStats.hp}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">暴击伤害</div>
            <div class="text-3xl font-bold">+${(wStats.critDamage*100).toFixed(0)}%</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">防御</div>
            <div class="text-3xl font-bold">+${wStats.def}</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 mt-8">
          <button onclick="window.levelUp()" class="btn-hover bg-blue-600 hover:bg-blue-700 py-5 rounded-3xl text-xl font-bold flex items-center justify-center gap-2">
            <i class="fas fa-arrow-up"></i> 升级 Lv.${item.level} → ${item.level+1}（${item.level*30}金币）
          </button>
          <button onclick="window.starUp()" class="btn-hover bg-purple-600 hover:bg-purple-700 py-5 rounded-3xl text-xl font-bold flex items-center justify-center gap-2 ${item.stars >= 5 ? 'opacity-50 cursor-not-allowed' : ''}">
            <i class="fas fa-star"></i> 升星 ★${item.stars} → ★${item.stars+1}
          </button>
        </div>
      </div>
    </div>

    <div class="text-center mt-8">
      <button onclick="window.hideModal()" class="text-gray-400 text-lg btn-hover">关闭</button>
    </div>
  `;
  document.getElementById("modal").classList.remove("hidden");
}

function equipWeapon() {
  if (currentModalIndex === null || currentModalType !== "char") return;
  const select = document.getElementById("equipSelect");
  const weaponUniqueId = parseInt(select.value);
  if (weaponUniqueId) {
    const alreadyEquipped = player.owned.some(c => c.equippedWeapon === weaponUniqueId);
    if (alreadyEquipped) return alert("该武器已被其他角色装备！");
  }
  player.owned[currentModalIndex].equippedWeapon = weaponUniqueId || null;
  window.saveGame();
  window.hideModal();
  window.renderInventory();
}

function levelUp() {
  if (currentModalIndex === null) return;
  let item;
  if (currentModalType === "char") item = player.owned[currentModalIndex];
  else item = player.weapons[currentModalIndex];
  const cost = item.level * 30;
  if (player.gold < cost) return alert("金币不够！");
  player.gold -= cost;
  item.level = Math.min(item.level + 1, 100);
  document.getElementById("gold").textContent = player.gold;
  window.saveGame();
  if (currentModalType === "char") window.showCharacterDetail(currentModalIndex);
  else window.showWeaponDetail(currentModalIndex);
}

function starUp() {
  if (currentModalIndex === null) return;
  let item, list;
  if (currentModalType === "char") {
    item = player.owned[currentModalIndex];
    list = player.owned;
  } else {
    item = player.weapons[currentModalIndex];
    list = player.weapons;
  }
  if (item.stars >= 5) return alert("已经满星！");
  const duplicateIndex = list.findIndex(o => (currentModalType === "char" ? o.charId : o.weaponId) === (currentModalType === "char" ? item.charId : item.weaponId) && o.id !== item.id && o.stars <= item.stars);
  if (duplicateIndex === -1) return alert("没有可用的相同材料！");

  const potionCost = 10 + item.stars * 10;
  if (player.magicPotion < potionCost) return alert(`魔药不足！需要 ${potionCost} 个魔药`);

  if (!confirm(`确定消耗 ${potionCost} 个魔药 + 1个相同材料升星吗？`)) return;

  player.magicPotion -= potionCost;
  list.splice(duplicateIndex, 1);
  item.stars++;

  document.getElementById("magicPotion").textContent = player.magicPotion;
  window.saveGame();

  const burst = document.createElement("div");
  burst.className = "fixed inset-0 flex items-center justify-center pointer-events-none z-[99999]";
  burst.innerHTML = `<div class="text-8xl flex gap-4 star-burst">★★★</div>`;
  document.body.appendChild(burst);

  setTimeout(() => {
    burst.remove();
    if (currentModalType === "char") window.showCharacterDetail(currentModalIndex);
    else window.showWeaponDetail(currentModalIndex);
  }, 900);
}

function hideModal() {
  document.getElementById("modal").classList.add("hidden");
  currentModalIndex = null;
  currentModalType = "char";
  window.renderInventory();
}

function toggleDecomposeMode() {
  decomposeMode = !decomposeMode;
  const btn = document.getElementById("decomposeBtn");
  btn.innerHTML = decomposeMode ? `<i class="fas fa-times"></i> 退出分解` : `<i class="fas fa-recycle"></i> 分解`;
  document.getElementById("decomposeBar").classList.toggle("hidden", !decomposeMode);
  window.renderInventory();
}

function toggleSelect(checkbox) {
  const index = parseInt(checkbox.dataset.index);
  if (checkbox.checked) selected.push(index);
  else selected = selected.filter(i => i !== index);
  window.updateDecomposeBar();
}

function updateDecomposeBar() {
  const count = selected.length;
  let value = 0;
  const isChar = currentInventoryTab === 0;
  const list = isChar ? player.owned : player.weapons;
  selected.forEach(i => {
    const item = list[i];
    const data = isChar ? window.getCharacterData(item.charId) : window.getWeaponData(item.weaponId);
    value += window.decomposeValue[data.rarity];
  });
  document.getElementById("selectedCount").textContent = `已选 ${count} 个`;
  document.getElementById("decomposeValue").textContent = `预计获得 ${value} 钻石`;
}

function selectAll() {
  selected = [];
  const checkboxes = document.querySelectorAll('#inventory input[type="checkbox"]');
  const maxSelect = Math.min(checkboxes.length, 300);
  for (let i = 0; i < maxSelect; i++) {
    checkboxes[i].checked = true;
    selected.push(parseInt(checkboxes[i].dataset.index));
  }
  window.updateDecomposeBar();
}

function decomposeSelected() {
  if (selected.length === 0) return;
  if (selected.length > 300) return alert("一次最多分解300个！");
  const isChar = currentInventoryTab === 0;
  const list = isChar ? player.owned : player.weapons;
  let total = 0;
  selected.sort((a, b) => b - a).forEach(i => {
    const item = list[i];
    const data = isChar ? window.getCharacterData(item.charId) : window.getWeaponData(item.weaponId);
    total += window.decomposeValue[data.rarity];
    list.splice(i, 1);
  });
  player.diamonds += total;
  document.getElementById("diamonds").textContent = player.diamonds;
  window.saveGame();
  alert(`✅ 已分解 ${selected.length} 个，获得 ${total} 钻石！`);
  selected = [];
  decomposeMode = false;
  document.getElementById("decomposeBar").classList.add("hidden");
  window.renderInventory();
}

function setInventoryTab(n) {
  currentInventoryTab = n;
  document.querySelectorAll('.inv-tab').forEach((b,i) => b.classList.toggle('active', i===n));
  window.renderInventory();
}

// 暴露所有函数
window.renderInventory = renderInventory;
window.sortOwned = sortOwned;
window.showCharacterDetail = showCharacterDetail;
window.showWeaponDetail = showWeaponDetail;
window.equipWeapon = equipWeapon;
window.levelUp = levelUp;
window.starUp = starUp;
window.hideModal = hideModal;
window.toggleDecomposeMode = toggleDecomposeMode;
window.toggleSelect = toggleSelect;
window.updateDecomposeBar = updateDecomposeBar;
window.selectAll = selectAll;
window.decomposeSelected = decomposeSelected;
window.setInventoryTab = setInventoryTab;
