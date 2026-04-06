// js/ui.js - UI 动画、Modal、记录查询、控制台（完整无省略）
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
      document.getElementById("diamonds").textContent = player.diamonds || 1000;
      document.getElementById("gold").textContent = player.gold || 0;
      document.getElementById("magicPotion").textContent = player.magicPotion || 0;
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
    document.getElementById("consoleLog").innerHTML = "控制台已开启<br>可用命令：<br>give {物品id} {数量}<br>give {角色id} {等级} {星级}<br>give {武器id} {等级} {星级}";
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
      player.diamonds += amount;
      document.getElementById("diamonds").textContent = player.diamonds;
      log.innerHTML += `已获得 ${amount} 钻石<br>`;
    } else if (id === 997) {
      player.gold += amount;
      document.getElementById("gold").textContent = player.gold;
      log.innerHTML += `已获得 ${amount} 金币<br>`;
    } else if (id === 999) {
      player.magicPotion += amount;
      document.getElementById("magicPotion").textContent = player.magicPotion;
      log.innerHTML += `已获得 ${amount} 个魔药<br>`;
    } else if (id >= 1 && id <= 15) {
      const level = parseInt(parts[2]) || 1;
      const stars = parseInt(parts[3]) || 0;
      player.owned.push({ id: Date.now(), charId: id, level: Math.min(level, 100), stars: Math.min(stars, 5), equippedWeapon: null });
      log.innerHTML += `已获得角色 ${window.getCharacterData(id).name} Lv.${level} ★${stars}<br>`;
    } else if (id >= 100 && id <= 115) {
      const weaponRealId = id - 99;
      const level = parseInt(parts[2]) || 1;
      const stars = parseInt(parts[3]) || 0;
      player.weapons.push({ id: Date.now(), weaponId: weaponRealId, level: Math.min(level, 100), stars: Math.min(stars, 5) });
      log.innerHTML += `已获得武器 ${window.getWeaponData(weaponRealId).name} Lv.${level} ★${stars}<br>`;
    } else {
      log.innerHTML += `未知物品ID<br>`;
    }
    window.saveGame();
  } else {
    log.innerHTML += `未知命令<br>`;
  }
  document.getElementById("consoleInput").value = "";
  log.scrollTop = log.scrollHeight;
}

// ====================== 新增：统一角色详情界面（仓库 + 战斗共用） ======================
function showFullCharacterDetail(item, isBattle = false) {
  const charData = window.getCharacterData(item.charId);
  const stats = window.calculateStats(item, charData, null); // 暂无装备，可后续扩展

  const skill = window.characterSkillMap[item.charId] || {
    description: "暂无详细描述",
    normalAttack: "普通攻击：对敌方单体造成70%总攻击的物理伤害",
    skill1Name: "暂无技能",
    skill1Desc: "暂无技能描述",
    skill1Cost: 0
  };

  const html = `
    <div class="flex gap-8">
      <div class="flex-1 border-4 border-orange-500 rounded-3xl p-4 bg-gray-950 flex items-center justify-center">
        <img src="${charData.image}" class="character-img w-full max-h-[420px] rounded-2xl" style="filter: drop-shadow(0 15px 25px rgba(249,115,22,0.5));">
      </div>
      
      <div class="flex-1">
        <div class="text-4xl font-bold mb-6">${charData.name}</div>
        
        <div class="grid grid-cols-2 gap-3">
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">等级</div>
            <div class="text-3xl font-bold">${item.level}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">星级</div>
            <div class="text-3xl font-bold">${"★".repeat(item.stars)}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">实时攻击</div>
            <div class="text-3xl font-bold">${stats.atk}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">实时暴击率</div>
            <div class="text-3xl font-bold">${(stats.critRate*100).toFixed(0)}%</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">实时血量</div>
            <div class="text-3xl font-bold">${stats.hp}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">实时暴击伤害</div>
            <div class="text-3xl font-bold">${(stats.critDamage*100).toFixed(0)}%</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">实时防御</div>
            <div class="text-3xl font-bold">${stats.def}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">实时减伤</div>
            <div class="text-3xl font-bold">0%</div>
          </div>
        </div>

        <!-- 人物描述 -->
        <div class="mt-6 bg-gray-800 rounded-3xl p-5 text-sm leading-relaxed">
          ${skill.description}
        </div>

        <!-- 技能栏 -->
        <div class="grid grid-cols-3 gap-3 mt-6">
          <div class="border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="font-bold text-sm">普攻</div>
            <div class="text-xs text-gray-400 mt-2">${skill.normalAttack}</div>
          </div>
          <div class="border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="font-bold text-sm">${skill.skill1Name}</div>
            <div class="text-xs text-gray-400 mt-2">${skill.skill1Desc}</div>
            <div class="text-amber-400 text-xs mt-3">消耗 ${skill.skill1Cost} 能量</div>
          </div>
          <div class="border-4 border-orange-500 rounded-3xl p-4 text-center opacity-50">
            <div class="font-bold text-sm">主动技2</div>
            <div class="text-xs text-gray-400 mt-2">R级角色暂无第二主动技能</div>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center mt-8">
      <button onclick="window.hideModal()" class="px-12 py-4 bg-gray-700 hover:bg-gray-600 rounded-3xl text-xl">关闭</button>
    </div>
  `;

  document.getElementById("modalContent").innerHTML = html;
  document.getElementById("modal").classList.remove("hidden");
}

// 暴露
window.showFullCharacterDetail = showFullCharacterDetail;
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
