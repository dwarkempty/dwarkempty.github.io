// js/album.js - 图鉴系统
let currentAlbumTab = 0; // 0=角色 1=武器 2=世界观

function setAlbumTab(n) {
  currentAlbumTab = n;
  document.querySelectorAll('.album-tab').forEach((b, i) => b.classList.toggle('active', i === n));
  renderAlbum();
}

function renderAlbum() {
  const grid = document.getElementById("albumGrid");
  grid.innerHTML = "";

  if (currentAlbumTab === 0) {
    window.characterPool.forEach(char => {
      const owned = player.unlockedChars.includes(char.id);
      const count = player.owned.filter(o => o.charId === char.id).length;
      const div = document.createElement("div");
      div.className = `relative bg-zinc-900 rounded-3xl p-4 cursor-pointer border-4 ${owned ? window.getRarityColor(char.rarity) : 'border-gray-700 opacity-60'}`;
      div.innerHTML = `
        <img src="${char.image}" class="character-img w-full rounded-2xl mb-3 ${owned ? '' : 'grayscale'}">
        <div class="text-center">
          <div class="rarity-${char.rarity.toLowerCase()} text-xs inline-block px-4 py-1 rounded-full text-white font-bold mb-2">${char.rarity}</div>
          <div class="text-base font-bold">${char.name}</div>
          ${owned ? `<div class="text-emerald-400 text-sm">已获得 ×${count}</div>` : `<div class="text-gray-500 text-sm">未解锁</div>`}
        </div>
      `;
      if (owned) div.onclick = () => {
        const item = player.owned.find(o => o.charId === char.id);
        if (item) window.showCharacterDetail(player.owned.indexOf(item));
      };
      grid.appendChild(div);
    });
  } else if (currentAlbumTab === 1) {
    window.weaponPool.forEach(weapon => {
      const owned = player.unlockedWeapons.includes(weapon.id);
      const count = player.weapons.filter(w => w.weaponId === weapon.id).length;
      const div = document.createElement("div");
      div.className = `relative bg-zinc-900 rounded-3xl p-4 cursor-pointer border-4 ${owned ? window.getRarityColor(weapon.rarity) : 'border-gray-700 opacity-60'}`;
      div.innerHTML = `
        <img src="${weapon.image}" class="character-img w-full rounded-2xl mb-3 ${owned ? '' : 'grayscale'}">
        <div class="text-center">
          <div class="rarity-${weapon.rarity.toLowerCase()} text-xs inline-block px-4 py-1 rounded-full text-white font-bold mb-2">${weapon.rarity}</div>
          <div class="text-base font-bold">${weapon.name}</div>
          ${owned ? `<div class="text-emerald-400 text-sm">已获得 ×${count}</div>` : `<div class="text-gray-500 text-sm">未解锁</div>`}
        </div>
      `;
      if (owned) div.onclick = () => {
        const item = player.weapons.find(w => w.weaponId === weapon.id);
        if (item) window.showWeaponDetail(player.weapons.indexOf(item));
      };
      grid.appendChild(div);
    });
  } else if (currentAlbumTab === 2) {
    // ==================== 世界观详解 ====================
    window.worldviewPool.forEach(item => {
      const div = document.createElement("div");
      div.className = `relative bg-zinc-900 rounded-3xl p-4 cursor-pointer border-4 border-purple-500 hover:border-violet-400 transition-all`;
      div.innerHTML = `
        <div class="h-40 flex items-center justify-center bg-gradient-to-br from-purple-900 to-violet-900 rounded-2xl mb-4 overflow-hidden">
          <img src="${item.image}" class="max-h-full max-w-full object-contain" loading="lazy">
        </div>
        <div class="text-center">
          <div class="text-base font-bold text-purple-300">${item.name}</div>
        </div>
      `;
      // 只传递 id，彻底解决长文本问题
      div.onclick = () => window.showWorldLore(item.id);
      grid.appendChild(div);
    });
  }
}

// ==================== 世界观大图Modal ====================
function showWorldLore(id) {
  const item = window.worldviewPool.find(w => w.id === id);
  if (!item) return;

  const modalHTML = `
    <div class="fixed inset-0 bg-black/90 flex items-center justify-center z-[100000] p-4">
      <div class="bg-zinc-900 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border-4 border-purple-500">
        <div class="flex justify-between items-center px-8 py-5 border-b border-zinc-700">
          <h3 class="text-3xl font-bold text-purple-400">${item.name}</h3>
          <button onclick="window.closeWorldLore()" class="text-4xl leading-none text-gray-400 hover:text-white">×</button>
        </div>
        
        <div class="p-8 flex-1 flex items-center justify-center bg-black/30">
          <img src="${item.image}" class="max-h-[420px] max-w-full rounded-3xl shadow-2xl" loading="lazy">
        </div>
        
        <div class="px-8 py-6 border-t border-zinc-700 text-center">
          <button onclick="window.showWorldDescription(${item.id})" 
                  class="w-full py-5 text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 rounded-3xl transition-all">
            查看详细解释
          </button>
        </div>
      </div>
    </div>`;

  const old = document.getElementById("worldLoreModal");
  if (old) old.remove();
  
  const div = document.createElement("div");
  div.id = "worldLoreModal";
  div.innerHTML = modalHTML;
  document.body.appendChild(div);
}

// ==================== 详细解释页面（支持任意长文本） ====================
window.showWorldDescription = function(id) {
  const item = window.worldviewPool.find(w => w.id === id);
  if (!item) return;

  const modal = document.getElementById("worldLoreModal");
  if (!modal) return;

  modal.innerHTML = `
    <div class="fixed inset-0 bg-black/90 flex items-center justify-center z-[100000] p-4">
      <div class="bg-zinc-900 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border-4 border-purple-500">
        <div class="flex justify-between items-center px-8 py-5 border-b border-zinc-700">
          <h3 class="text-3xl font-bold text-purple-400">${item.name}</h3>
          <button onclick="window.closeWorldLore()" class="text-4xl leading-none text-gray-400 hover:text-white">×</button>
        </div>
        <div class="flex-1 p-8 overflow-auto text-gray-200 leading-relaxed text-[17px] prose prose-invert">
          ${item.description.replace(/\n/g, '<br>')}
        </div>
        <div class="px-8 py-5 border-t border-zinc-700 text-center">
          <button onclick="window.closeWorldLore()" class="px-12 py-4 bg-purple-600 hover:bg-purple-700 rounded-2xl text-lg font-bold">关闭</button>
        </div>
      </div>
    </div>`;
};

window.closeWorldLore = function() {
  const modal = document.getElementById("worldLoreModal");
  if (modal) modal.remove();
};

// 暴露
window.setAlbumTab = setAlbumTab;
window.renderAlbum = renderAlbum;
window.showWorldLore = showWorldLore;
window.closeWorldLore = window.closeWorldLore;
