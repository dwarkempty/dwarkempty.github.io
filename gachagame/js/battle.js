// js/battle.js - 战斗系统核心（能量 + 选人 + 框架）
let currentBattleTeam = [null, null, null, null]; // 4个位置：0=后排a, 1=前排a, 2=后排b, 3=前排b
let battleEnergy = 4;
const MAX_ENERGY = 6;
const ENERGY_PER_TURN = 2;

function openBattleTest() {
  currentBattleTeam = [null, null, null, null];
  battleEnergy = 4;
  window.showBattleSelectModal();
}

function showBattleSelectModal() {
  document.getElementById("battleSelectModal").classList.remove("hidden");
  renderBattleSelectInventory();
  renderBattleSlots();
}

function hideBattleSelectModal() {
  document.getElementById("battleSelectModal").classList.add("hidden");
}

function renderBattleSelectInventory() {
  const container = document.getElementById("battleSelectInventory");
  container.innerHTML = `<div class="grid grid-cols-3 sm:grid-cols-4 gap-4" id="battleInventoryGrid"></div>`;
  const grid = document.getElementById("battleInventoryGrid");
  
  // 复用现有排序逻辑
  const sorted = window.sortOwned(window.player.owned, true);
  sorted.forEach(item => {
    const data = window.getCharacterData(item.charId);
    // 检查是否已上阵（同名只允许一位）
    const alreadyInTeam = currentBattleTeam.some(t => t && t.charId === item.charId);
    
    const div = document.createElement("div");
    div.className = `relative bg-gray-800 rounded-3xl p-3 cursor-pointer border-4 ${window.getRarityColor(data.rarity)} ${alreadyInTeam ? 'opacity-50' : 'hover:scale-105'}`;
    div.innerHTML = `
      <img src="${data.image}" class="character-img w-full rounded-2xl mb-3">
      <div class="text-center">
        <div class="rarity-${data.rarity.toLowerCase()} text-xs px-4 py-1 rounded-full text-white font-bold mb-1">${data.rarity}</div>
        <div class="text-base font-bold">${data.name}</div>
        <div class="text-xs text-gray-400">Lv.${item.level} ★${item.stars}</div>
      </div>
      ${alreadyInTeam ? `<div class="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded-xl">已上阵</div>` : ''}
    `;
    if (!alreadyInTeam) {
      div.onclick = () => addToBattleTeam(item);
    }
    grid.appendChild(div);
  });
}

function addToBattleTeam(item) {
  // 找到空位
  const emptyIndex = currentBattleTeam.findIndex(slot => slot === null);
  if (emptyIndex === -1) return alert("阵型已满！");
  currentBattleTeam[emptyIndex] = { ...item }; // 复制一份
  renderBattleSelectInventory();
  renderBattleSlots();
}

function renderBattleSlots() {
  for (let i = 0; i < 4; i++) {
    const slot = document.getElementById(`position-${i}`);
    if (currentBattleTeam[i]) {
      const data = window.getCharacterData(currentBattleTeam[i].charId);
      slot.innerHTML = `<img src="${data.image}" class="h-20 mx-auto rounded-2xl">`;
      slot.classList.add("border-amber-400");
    } else {
      slot.innerHTML = ["后排 a","前排 a","后排 b","前排 b"][i];
      slot.classList.remove("border-amber-400");
    }
  }
}

function selectBattlePosition(index) {
  // 可选：点击槽位可移除角色（实现拖拽移除）
  if (currentBattleTeam[index]) {
    if (confirm("移除该角色？")) {
      currentBattleTeam[index] = null;
      renderBattleSelectInventory();
      renderBattleSlots();
    }
  }
}

function startBattle() {
  if (currentBattleTeam.every(slot => slot === null)) return alert("至少上阵一位角色！");
  hideBattleSelectModal();
  document.getElementById("battleModal").classList.remove("hidden");
  battleEnergy = 4;
  renderBattleUI();
}

function hideBattleModal() {
  document.getElementById("battleModal").classList.add("hidden");
  currentBattleTeam = [null, null, null, null];
}

function renderBattleUI() {
  // 更新能量
  document.getElementById("battleEnergy").innerHTML = `${battleEnergy} / ${MAX_ENERGY} <span class="text-xs text-gray-400">⚡</span>`;
  
  // 渲染我方4个位置
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById(`my-${i}`);
    if (currentBattleTeam[i]) {
      const data = window.getCharacterData(currentBattleTeam[i].charId);
      el.innerHTML = `
        <img src="${data.image}" class="w-20 h-20 mx-auto rounded-2xl mb-2">
        <div class="text-sm font-bold">${data.name}</div>
      `;
    } else {
      el.innerHTML = `<div class="text-gray-500 text-sm">空位</div>`;
    }
  }
}

function endBattleTurn() {
  // 回合结束：恢复能量
  battleEnergy = Math.min(battleEnergy + ENERGY_PER_TURN, MAX_ENERGY);
  document.getElementById("battleLog").innerHTML += `<div class="text-emerald-400">⚡ 恢复 ${ENERGY_PER_TURN} 点能量 → 当前 ${battleEnergy}/${MAX_ENERGY}</div>`;
  renderBattleUI();
  
  // 这里以后放敌人行动、技能逻辑
  console.log("本回合结束，能量系统已正常工作！");
}

// 点击角色弹出详情（先只做框架）
function showBattleCharDetail(index) {
  const char = currentBattleTeam[index];
  if (!char) return;
  const data = window.getCharacterData(char.charId);
  
  const html = `
    <div class="flex gap-8">
      <div class="flex-1">
        <img src="${data.image}" class="character-img w-full rounded-3xl">
      </div>
      <div class="flex-1 space-y-4">
        <div class="text-4xl font-bold">${data.name}</div>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-gray-800 rounded-2xl p-4 text-center">等级<br><span class="text-3xl">${char.level}</span></div>
          <div class="bg-gray-800 rounded-2xl p-4 text-center">星级<br><span class="text-3xl">${"★".repeat(char.stars)}</span></div>
          <!-- 后续可继续加实时属性 -->
        </div>
        <div class="pt-4 border-t text-center text-amber-400">能量系统就绪（技能待开发）</div>
      </div>
    </div>
    <div class="text-center mt-8">
      <button onclick="hideBattleCharDetailModal()" class="px-12 py-4 bg-gray-700 hover:bg-gray-600 rounded-3xl text-xl">关闭</button>
    </div>
  `;
  document.getElementById("battleDetailContent").innerHTML = html;
  document.getElementById("battleCharDetailModal").classList.remove("hidden");
}

function hideBattleCharDetailModal() {
  document.getElementById("battleCharDetailModal").classList.add("hidden");
}

// 暴露给全局
window.openBattleTest = openBattleTest;
window.showBattleSelectModal = showBattleSelectModal;
window.hideBattleSelectModal = hideBattleSelectModal;
window.startBattle = startBattle;
window.hideBattleModal = hideBattleModal;
window.endBattleTurn = endBattleTurn;
window.showBattleCharDetail = showBattleCharDetail;
window.hideBattleCharDetailModal = hideBattleCharDetailModal;
