// js/battle.js - 战斗系统核心（已完整实现R级角色详情界面 + 技能展示）
let currentBattleTeam = [null, null, null, null]; // 4个位置：0=后排a, 1=前排a, 2=后排b, 3=前排b
let battleEnergy = 4;
const MAX_ENERGY = 6;
const ENERGY_PER_TURN = 2;

// ====================== R级角色技能数据（后续SSR/UR在此扩展） ======================
const characterSkillMap = {
  1: { // 森林游侠·艾伦
    description: "出身幽暗森林的年轻游侠，精通弓箭与自然追踪。性格坚韧乐观，热爱冒险与保护生态。虽经验尚浅，但精准的箭术能为团队提供可靠的远程支援，是新手冒险者最常见的伙伴。",
    normalAttack: "普通攻击：对敌方单体造成80%总攻击的物理伤害",
    skill1Name: "【穿林箭】",
    skill1Desc: "消耗1点能量，对敌方单体造成120%总攻击的物理伤害，并降低目标10%防御，持续2回合。若目标处于后排，该技能额外无视5%的防御",
    skill1Cost: 1
  },
  2: { // 火焰学徒·莎莉
    description: "魔法学徒莎莉，天生亲和火焰元素。活泼热情但控制力不足，常在战斗中制造小爆炸。学习火焰魔法，希望成为强大法师，是队伍中活力满满的火力输出手。",
    normalAttack: "普通攻击：对敌方单体造成75%总攻击的火焰魔法伤害",
    skill1Name: "【火球冲击】",
    skill1Desc: "消耗1点能量，对敌方单体造成110%总攻击的火焰魔法伤害，有30%概率点燃目标（每回合造成相当于自身5%总攻击的额外持续伤害，持续2回合）",
    skill1Cost: 1
  },
  3: { // 铁壁卫士·巴克
    description: "身躯如铁塔般的佣兵卫士，拥有惊人的耐力和防御力。忠诚可靠，总是冲在最前线保护同伴。话语不多，但行动胜于千言，是新手队伍最值得信赖的盾牌。",
    normalAttack: "普通攻击：对敌方单体造成70%总攻击的物理伤害",
    skill1Name: "【铁壁守护】",
    skill1Desc: "消耗1点能量，为自身或一名前排队友生成护盾（吸收相当于自身1.5倍总防御的伤害），持续2回合，并提升自身20%减伤1回合",
    skill1Cost: 1
  },
  4: { // 月影精灵·莉莉
    description: "月影森林的精灵少女，沐浴在月光下成长。温柔恬静，擅长月影魔法，能治愈伤口并增强盟友。虽战斗力不强，但她是团队不可或缺的治愈之光，深受大家喜爱。",
    normalAttack: "普通攻击：对敌方单体造成65%总攻击的魔法伤害",
    skill1Name: "【月光祈福】",
    skill1Desc: "消耗1点能量，为己方单体回复相当于自身80%总攻击的生命值，并提升目标10%攻击力，持续2回合。若目标为前排角色，额外为其附加5%暴击率加成",
    skill1Cost: 1
  }
  // 后续在此继续添加 SR/SSR/UR 的技能数据
};

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
  const sorted = window.sortOwned(window.player.owned, true);
  sorted.forEach(item => {
    const data = window.getCharacterData(item.charId);
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
    if (!alreadyInTeam) div.onclick = () => addToBattleTeam(item);
    grid.appendChild(div);
  });
}

function addToBattleTeam(item) {
  const emptyIndex = currentBattleTeam.findIndex(slot => slot === null);
  if (emptyIndex === -1) return alert("阵型已满！");
  currentBattleTeam[emptyIndex] = { ...item };
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
  document.getElementById("battleEnergy").innerHTML = `${battleEnergy} / ${MAX_ENERGY} <span class="text-xs text-gray-400">⚡</span>`;
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById(`my-${i}`);
    if (currentBattleTeam[i]) {
      const data = window.getCharacterData(currentBattleTeam[i].charId);
      el.innerHTML = `<img src="${data.image}" class="w-20 h-20 mx-auto rounded-2xl mb-2"><div class="text-sm font-bold">${data.name}</div>`;
    } else {
      el.innerHTML = `<div class="text-gray-500 text-sm">空位</div>`;
    }
  }
}

function endBattleTurn() {
  battleEnergy = Math.min(battleEnergy + ENERGY_PER_TURN, MAX_ENERGY);
  document.getElementById("battleLog").innerHTML += `<div class="text-emerald-400">⚡ 恢复 ${ENERGY_PER_TURN} 点能量 → 当前 ${battleEnergy}/${MAX_ENERGY}</div>`;
  renderBattleUI();
}

// ====================== 战斗中点击角色详情界面（核心实现） ======================
function showBattleCharDetail(index) {
  const char = currentBattleTeam[index];
  if (!char) return;
  const data = window.getCharacterData(char.charId);
  const stats = window.calculateStats(char, data, null); // 当前无装备，后面可传入武器

  const skill = characterSkillMap[char.charId] || {
    description: "暂无详细描述",
    normalAttack: "普通攻击：对敌方单体造成70%总攻击的物理伤害",
    skill1Name: "暂无技能",
    skill1Desc: "暂无技能描述",
    skill1Cost: 0
  };

  const html = `
    <div class="flex gap-8">
      <!-- 左侧立绘 -->
      <div class="flex-1 border-4 border-orange-500 rounded-3xl p-4 bg-gray-950 flex items-center justify-center">
        <img src="${data.image}" class="character-img w-full max-h-[420px] rounded-2xl" style="filter: drop-shadow(0 15px 25px rgba(249,115,22,0.5));">
      </div>
      
      <!-- 右侧属性 -->
      <div class="flex-1">
        <div class="text-4xl font-bold mb-6">${data.name}</div>
        
        <div class="grid grid-cols-2 gap-3">
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">等级</div>
            <div class="text-3xl font-bold">${char.level}</div>
          </div>
          <div class="stat-box border-4 border-orange-500 rounded-3xl p-4 text-center">
            <div class="text-sm text-orange-400">星级</div>
            <div class="text-3xl font-bold">${"★".repeat(char.stars)}</div>
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

        <!-- 所受状态 -->
        <div class="mt-6 bg-gray-800 rounded-3xl p-4 text-center">
          <div class="text-orange-400 font-bold">所受状态：buff/debuff</div>
          <div class="text-gray-400 text-sm mt-1">（后续在此显示状态图标）</div>
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
      <button onclick="window.hideBattleCharDetailModal()" class="px-12 py-4 bg-gray-700 hover:bg-gray-600 rounded-3xl text-xl">关闭详情</button>
    </div>
  `;

  document.getElementById("battleDetailContent").innerHTML = html;
  document.getElementById("battleCharDetailModal").classList.remove("hidden");
}

function hideBattleCharDetailModal() {
  document.getElementById("battleCharDetailModal").classList.add("hidden");
}

// ====================== 暴露函数 ======================
window.openBattleTest = openBattleTest;
window.showBattleSelectModal = showBattleSelectModal;
window.hideBattleSelectModal = hideBattleSelectModal;
window.startBattle = startBattle;
window.hideBattleModal = hideBattleModal;
window.endBattleTurn = endBattleTurn;
window.showBattleCharDetail = showBattleCharDetail;
window.hideBattleCharDetailModal = hideBattleCharDetailModal;
