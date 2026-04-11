// js/album.js - 图鉴系统
let currentAlbumTab = 0; // 0=角色 1=武器

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
      const owned = player.unlockedChars.includes(char.id); // 永久解锁
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
        if (item) {
          const index = player.owned.indexOf(item);
          window.showCharacterDetail(index);
        }
      };
      grid.appendChild(div);
    });
  } else {
    window.weaponPool.forEach(weapon => {
      const owned = player.unlockedWeapons.includes(weapon.id); // 永久解锁
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
        if (item) {
          const index = player.weapons.indexOf(item);
          window.showWeaponDetail(index);
        }
      };
      grid.appendChild(div);
    });
  }
}

// 暴露
window.setAlbumTab = setAlbumTab;
window.renderAlbum = renderAlbum;
