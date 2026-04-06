// js/inventory.js - 仓库渲染 + 养成系统（性能优化：使用 Map + 缓存）
function sortOwned(list, isChar) {
  const copy = [...list];
  copy.sort((a, b) => {
    const pool = isChar ? window.characterPool : window.weaponPool;
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
        if (equippedItem) equippedName = window.getWeaponData(equippedItem.weaponId).name;
      }
      const stats = window.calculateStats(item, data, equippedItem);
      html = `...（原角色卡片 HTML 保持不变，我这里省略以节省篇幅，但实际代码中请保留你原来的完整 html 字符串）...`;
    } else {
      // 武器卡片 HTML 同理，保持你原来的完整内容
      html = `...（原武器卡片 HTML）...`;
    }

    if (decomposeMode) {
      html = `<input type="checkbox" class="absolute top-4 right-4 w-6 h-6 accent-red-500 z-10" data-index="${originalIndex}" onchange="window.toggleSelect(this)">` + html;
    }
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

// 下面是原有的升级、升星、分解、详情等函数（保持原逻辑，但全部使用优化后的 getXXXData）
function showCharacterDetail(index) { /* 原代码完整保留，使用 window.getCharacterData */ }
function showWeaponDetail(index) { /* 原代码完整保留 */ }
function equipWeapon() { /* 原代码 */ }
function levelUp() { /* 原代码 */ }
function starUp() { /* 原代码 */ }
function toggleDecomposeMode() { /* 原代码 */ }
function toggleSelect(checkbox) { /* 原代码 */ }
function updateDecomposeBar() { /* 原代码 */ }
function selectAll() { /* 原代码 */ }
function decomposeSelected() { /* 原代码 */ }
function setInventoryTab(n) { /* 原代码 */ }

// 暴露
window.renderInventory = renderInventory;
window.sortOwned = sortOwned;
window.showCharacterDetail = showCharacterDetail;
window.showWeaponDetail = showWeaponDetail;
window.equipWeapon = equipWeapon;
window.levelUp = levelUp;
window.starUp = starUp;
window.toggleDecomposeMode = toggleDecomposeMode;
window.toggleSelect = toggleSelect;
window.updateDecomposeBar = updateDecomposeBar;
window.selectAll = selectAll;
window.decomposeSelected = decomposeSelected;
window.setInventoryTab = setInventoryTab;
