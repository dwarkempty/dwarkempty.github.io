// js/inventory.js - 仓库渲染 + 养成系统
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
    const data = isChar ? window.getCharacterData(item.charId) : window.getWeaponData(item.weaponId);
    if (!data) return;

    const div = document.createElement("div");
    div.className = `relative bg-gray-800 rounded-3xl p-3 sm:p-4 cursor-pointer border-4 ${window.getRarityColor(data.rarity)} hover:scale-105 transition btn-hover`;

    let html = '';
    if (isChar) {
      let equippedName = "无";
      let equippedItem = null;
      if (item.equippedWeapon) {
        equippedItem = player.weapons.find(w => w.id === item.equippedWeapon);
        if (equippedItem) equippedName = window.getWeaponData(equippedItem.weaponId)?.name || "无";
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
          <div class="flex justify-between text-[10px] mt-1 text-purple-400">
            <div>⚡ ${stats.spd}</div>
            <div>${stats.attribute}</div>
            <div>穿 ${stats.penFixed}</div>
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

    if (decomposeMode) html = `<input type="checkbox" class="absolute top-4 right-4 w-6 h-6 accent-red-500 z-10" data-index="${list.findIndex(o => o.id === item.id)}" onchange="window.toggleSelect(this)">` + html;
    div.innerHTML = html;

    if (!decomposeMode) {
      if (isChar) div.onclick = () => window.showCharacterDetailById(item.id);
      else div.onclick = () => window.showWeaponDetailById(item.id);
    }
    container.appendChild(div);
  });

  if (list.length === 0) {
    container.innerHTML = `<p class="text-center text-gray-500 py-12 col-span-full">${isChar ? '还没有角色，快去抽卡吧！' : '还没有武器，快去抽卡吧！'}</p>`;
  }
}

function showCharacterDetailById(itemId) {
  const index = player.owned.findIndex(o => o.id === itemId);
  if (index === -1) return;
  currentModalIndex = index;
  currentModalType = "char";
  window.showCharacterDetail(index);
}

function showWeaponDetailById(itemId) {
  const index = player.weapons.findIndex(o => o.id === itemId);
  if (index === -1) return;
  currentModalIndex = index;
  currentModalType = "weapon";
  window.showWeaponDetail(index);
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

  const starHTML = Array(5).fill(0).map((_, i) => `<span class="${i < item.stars ? `star-${Math.min(item.stars, 5)}` : 'text-gray-500'}">★</span>`).join('');

  document.getElementById("modalInner").className = `modal-content bg-gray-900 rounded-3xl max-w-full sm:max-w-4xl w-full mx-4 overflow-hidden border-4 ${borderClass}`;

  document.getElementById("modalContent").innerHTML = `
    <div class="flex flex-col lg:flex-row gap-6">
      <div class="flex-1 flex flex-col">
        <div class="border-4 border-orange-500 rounded-3xl p-4 bg-gray-950 flex-1 flex items-center justify-center relative">
          <img src="${char.image}" class="character-img w-full max-h-[420px] rounded-2xl" style="filter: drop-shadow(0 15px 25px rgba(249,115,22,0.5));">
        </div>
        
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

        <!-- 新增：可点击的“详细描述”按钮 -->
        <div class="mt-4 border-4 border-orange-500 rounded-3xl p-5 bg-gray-950">
          <button onclick="window.showCharacterLore(${index})" 
                  class="w-full py-4 text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 rounded-2xl btn-hover flex items-center justify-center gap-2">
            <i class="fas fa-book-open"></i> 详细描述
          </button>
        </div>
      </div>

      <div class="flex-1">
        <div class="grid grid-cols-3 gap-3">
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">等级</div>
            <div class="text-4xl font-bold">${item.level}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">星级</div>
            <div class="text-4xl font-bold flex items-center justify-center gap-1">${starHTML}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">属性</div>
            <div class="text-2xl font-bold text-purple-400">${stats.attribute}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">生命值</div>
            <div class="text-3xl font-bold">${stats.hp}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">攻击力</div>
            <div class="text-3xl font-bold">${stats.atk}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">防御力</div>
            <div class="text-3xl font-bold">${stats.def}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">暴击率</div>
            <div class="text-3xl font-bold">${(stats.critRate*100).toFixed(0)}%</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">暴击伤害</div>
            <div class="text-3xl font-bold">${(stats.critDamage*100).toFixed(0)}%</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">速度</div>
            <div class="text-3xl font-bold">${stats.spd}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">穿透值</div>
            <div class="text-3xl font-bold">${stats.penFixed}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">穿透率</div>
            <div class="text-3xl font-bold">${(stats.penRate*100).toFixed(0)}%</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">护盾强度</div>
            <div class="text-3xl font-bold">${stats.shieldStr.toFixed(1)}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center col-span-1">
            <div class="text-sm text-orange-400">治疗加成</div>
            <div class="text-3xl font-bold">${(stats.healBonus*100).toFixed(0)}%</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center col-span-1">
            <div class="text-sm text-orange-400">受治疗加成</div>
            <div class="text-3xl font-bold">${(stats.recvHealBonus*100).toFixed(0)}%</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center col-span-1">
            <div class="text-sm text-orange-400">治疗/护盾</div>
            <div class="text-xs text-gray-400">详见战斗</div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3 mt-8">
          <button onclick="window.levelUp()" class="btn-hover ${item.level >= 100 ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} py-5 rounded-3xl text-xl font-bold flex items-center justify-center gap-2">
            <i class="fas fa-arrow-up"></i> ${item.level >= 100 ? '已满级' : `升级 Lv.${item.level} → ${item.level+1}（${item.level*30}金币）`}
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

function showCharacterLore(index) {
  const item = player.owned[index];
  const char = window.getCharacterData(item.charId);

  const loreHTML = `
    <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-[100000]">
      <div class="bg-zinc-900 rounded-3xl max-w-2xl w-full mx-4 p-8 overflow-auto max-h-[90vh]">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-3xl font-bold">${char.name} 详细描述</h3>
          <button onclick="window.closeCharacterLore()" class="text-4xl leading-none text-gray-400 hover:text-white">×</button>
        </div>
        
        <div class="prose prose-invert max-w-none">
          <h4 class="text-orange-400 text-xl mb-3">人物背景</h4>
          <p class="text-gray-200 leading-relaxed text-lg">${char.description || '这位冒险者有着神秘的过去，目前暂无详细记载……'}</p>
          
          <h4 class="text-orange-400 text-xl mt-10 mb-3">技能描述</h4>
          <div class="bg-zinc-800 rounded-3xl p-6 text-gray-300">
            <p class="text-base">（技能描述暂未实装）</p>
            <p class="mt-6 text-sm text-gray-400">未来可在此处展示该角色的主动技能、被动技能、专属故事等详细内容。</p>
          </div>
        </div>
        
        <div class="text-center mt-10">
          <button onclick="window.closeCharacterLore()" class="px-10 py-4 bg-zinc-700 hover:bg-zinc-600 rounded-3xl text-lg font-bold">关闭窗口</button>
        </div>
      </div>
    </div>`;

  const div = document.createElement("div");
  div.id = "characterLoreModal";
  div.innerHTML = loreHTML;
  document.body.appendChild(div);
}

window.closeCharacterLore = function() {
  const modal = document.getElementById("characterLoreModal");
  if (modal) modal.remove();
};

function showWeaponDetail(index) {
  currentModalIndex = index;
  currentModalType = "weapon";
  const item = player.weapons[index];
  const weapon = window.getWeaponData(item.weaponId);
  const wStats = window.calculateWeaponStats(item, weapon);

  const borderClass = window.getRarityBorderClass(weapon.rarity);

  document.getElementById("modalInner").className = `modal-content bg-gray-900 rounded-3xl max-w-full sm:max-w-4xl w-full mx-4 overflow-hidden border-4 ${borderClass}`;

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
  if (item.level >= 100) return alert("已满级！");
  const cost = item.level * 30;
  if (player.gold < cost) return alert("金币不够！");
  player.gold -= cost;
  item.level++;
  document.getElementById("gold").textContent = player.gold;
  window.saveGame();
  if (currentModalType === "char") window.showCharacterDetail(currentModalIndex);
  else window.showWeaponDetail(currentModalIndex);
}

function starUp() {
  if (currentModalIndex === null || currentModalType !== "char") return alert("仅角色可升星！");
  const item = player.owned[currentModalIndex];
  if (item.stars >= 5) return alert("已经满星！");
  showStarUpgradeModal(currentModalIndex);
}

function showStarUpgradeModal(ownedIndex) {
  const item = player.owned[ownedIndex];
  const charData = window.getCharacterData(item.charId);
  if (!charData) return;
  const sourceCount = (player.sourcePowers && player.sourcePowers[item.charId]) || 0;

  const modal = document.createElement("div");
  modal.className = "fixed inset-0 bg-black/90 flex items-center justify-center z-[100000] p-4";
  modal.innerHTML = `
    <div class="bg-zinc-900 rounded-3xl max-w-2xl w-full border-4 border-purple-500 p-8">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-3xl font-bold text-purple-400">✨ ${charData.name} 命座升星</h3>
        <button onclick="this.closest('.fixed').remove()" class="text-4xl text-gray-400 hover:text-white">×</button>
      </div>
      
      <div class="flex gap-8">
        <!-- 左侧五星 -->
        <div class="flex flex-col items-center gap-4 w-24">
          ${[1,2,3,4,5].map(star => {
            const isLit = star <= item.stars;
            const starClass = isLit ? 'text-yellow-400 drop-shadow-[0_0_8px_#facc15]' : 'text-gray-600';
            return `<div class="text-6xl ${starClass} transition-all">★</div>`;
          }).join('')}
        </div>
        
        <!-- 右侧效果描述 (暂时留空) -->
        <div class="flex-1">
          <div class="text-xl font-bold text-purple-300 mb-4">当前星级：${item.stars} / 5</div>
          <div class="space-y-3 text-sm">
            ${[1,2,3,4,5].map(star => {
              let desc = "效果待定";
              if (star === 2) desc = "暴击率 +5%";
              else if (star === 3) desc = "暴击率 +5%，暴击伤害 +10%";
              else if (star === 4) desc = "暴击率 +5%，暴击伤害 +10%，穿透率 +8%";
              else if (star === 5) desc = "暴击率 +10%，暴击伤害 +10%，穿透率 +8%，增伤 +10%";
              const isLit = star <= item.stars;
              return `<div class="flex items-start gap-3 p-3 rounded-2xl ${isLit ? 'bg-purple-900/50 border border-purple-500' : 'bg-zinc-800'}">
                <div class="text-2xl ${isLit ? 'text-yellow-400' : 'text-gray-500'}">★</div>
                <div><div class="font-bold text-purple-200">第${star}星</div><div class="text-gray-400">${desc}</div></div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
      
      <div class="mt-8 flex items-center justify-between border-t border-zinc-700 pt-6">
        <div class="text-lg">
          可用角色源力：<span class="font-bold text-emerald-400">${sourceCount}</span> / 1
        </div>
        <div class="flex gap-4">
          <button onclick="this.closest('.fixed').remove()" class="px-8 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-2xl">取消</button>
          <button id="upgradeBtn" onclick="performStarUpgrade(${ownedIndex}, this)" 
                  class="px-10 py-3 ${sourceCount >= 1 && item.stars < 5 ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 cursor-not-allowed'} rounded-2xl text-lg font-bold flex items-center gap-2"
                  ${sourceCount < 1 || item.stars >= 5 ? 'disabled' : ''}>
            <i class="fas fa-star"></i> 升星至 ★${item.stars + 1}
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function performStarUpgrade(ownedIndex, btn) {
  const item = player.owned[ownedIndex];
  const sourceCount = (player.sourcePowers && player.sourcePowers[item.charId]) || 0;
  if (sourceCount < 1 || item.stars >= 5) return;

  player.sourcePowers[item.charId]--;
  item.stars++;

  window.saveGame();

  // 特效
  const burst = document.createElement("div");
  burst.className = "fixed inset-0 flex items-center justify-center pointer-events-none z-[99999]";
  burst.innerHTML = `<div class="text-8xl flex gap-4 star-burst">✨★★★✨</div>`;
  document.body.appendChild(burst);

  setTimeout(() => {
    burst.remove();
    // 关闭当前模态，重新打开详情或升级界面
    document.querySelectorAll('.fixed.inset-0').forEach(m => m.remove());
    window.showCharacterDetail(ownedIndex);
  }, 800);
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
  document.getElementById("decomposeValue").textContent = `预计获得 ${value} 耀星`;
}

function selectAll() {
  selected = [];
  const checkboxes = document.querySelectorAll('#inventory input[type="checkbox"]');
  const maxSelect = Math.min(checkboxes.length, 500);
  for (let i = 0; i < maxSelect; i++) {
    checkboxes[i].checked = true;
    selected.push(parseInt(checkboxes[i].dataset.index));
  }
  window.updateDecomposeBar();
}

function decomposeSelected() {
  if (selected.length === 0) return;
  if (selected.length > 500) return alert("一次最多分解500个！");
  const decomposeType = document.getElementById("decomposeType").value;
  const isChar = currentInventoryTab === 0;
  const list = isChar ? player.owned : player.weapons;
  let total = 0;
  const toRemove = [];

  selected.sort((a, b) => b - a).forEach(i => {
    const item = list[i];
    const data = isChar ? window.getCharacterData(item.charId) : window.getWeaponData(item.weaponId);
    let canDecompose = true;
    if (decomposeType === "r" && data.rarity !== "R") canDecompose = false;
    if (decomposeType === "sr" && (data.rarity !== "R" && data.rarity !== "SR")) canDecompose = false;
    if (canDecompose) {
      total += window.decomposeValue[data.rarity];
      toRemove.push(i);
    }
  });

  toRemove.forEach(i => list.splice(i, 1));
  player.yaoXing += total;
  document.getElementById("yaoXing").textContent = player.yaoXing;
  window.saveGame();
  alert(`✅ 已分解 ${toRemove.length} 个，获得 ${total} 耀星！`);
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

// 暴露
window.renderInventory = renderInventory;
window.sortOwned = sortOwned;
window.showCharacterDetail = showCharacterDetail;
window.showWeaponDetail = showWeaponDetail;
window.showCharacterDetailById = showCharacterDetailById;
window.showCharacterLore = showCharacterLore;
window.closeCharacterLore = window.closeCharacterLore;
window.showWeaponDetailById = showWeaponDetailById;
window.equipWeapon = equipWeapon;
window.levelUp = levelUp;
window.starUp = starUp;
window.showStarUpgradeModal = showStarUpgradeModal;
window.performStarUpgrade = performStarUpgrade;
window.hideModal = hideModal;
window.toggleDecomposeMode = toggleDecomposeMode;
window.toggleSelect = toggleSelect;
window.updateDecomposeBar = updateDecomposeBar;
window.selectAll = selectAll;
window.decomposeSelected = decomposeSelected;
window.setInventoryTab = setInventoryTab;
