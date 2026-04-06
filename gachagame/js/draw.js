// js/draw.js - 抽卡核心逻辑（保底 + 概率 + 动画）
function drawOne(poolType) {
  const isChar = poolType === "char";
  if (isChar) {
    player.charSsrPity = (player.charSsrPity || 0) + 1;
    player.charUrPity = (player.charUrPity || 0) + 1;
  } else {
    player.weaponSsrPity = (player.weaponSsrPity || 0) + 1;
    player.weaponUrPity = (player.weaponUrPity || 0) + 1;
  }

  let item;
  const pitySSR = isChar ? player.charSsrPity : player.weaponSsrPity;
  const pityUR = isChar ? player.charUrPity : player.weaponUrPity;

  if (pityUR >= 80) {
    const pool = isChar ? window.characterPool : window.weaponPool;
    const candidates = pool.filter(c => c.rarity === "UR");
    item = candidates[Math.floor(Math.random() * candidates.length)];
    if (isChar) { player.charSsrPity = 0; player.charUrPity = 0; }
    else { player.weaponSsrPity = 0; player.weaponUrPity = 0; }
  } else if (pitySSR >= 10) {
    const pool = isChar ? window.characterPool : window.weaponPool;
    const candidates = pool.filter(c => c.rarity === "SSR" || c.rarity === "UR");
    item = candidates[Math.floor(Math.random() * candidates.length)];
    if (isChar) player.charSsrPity = 0;
    else player.weaponSsrPity = 0;
  } else {
    const total = Object.values(window.rarityWeights).reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    let sum = 0;
    for (let r in window.rarityWeights) {
      sum += window.rarityWeights[r];
      if (rand <= sum) {
        const pool = isChar ? window.characterPool : window.weaponPool;
        const candidates = pool.filter(c => c.rarity === r);
        item = candidates[Math.floor(Math.random() * candidates.length)];
        break;
      }
    }
  }

  // 重置保底
  if (item.rarity === "SSR" || item.rarity === "UR") {
    if (isChar) player.charSsrPity = 0;
    else player.weaponSsrPity = 0;
  }
  if (item.rarity === "UR") {
    if (isChar) player.charUrPity = 0;
    else player.weaponUrPity = 0;
  }
  return item;
}

function drawCard(times) {
  const cost = times === 1 ? 100 : 900;
  if (player.diamonds < cost) return alert("钻石不够啦！去探索吧～");

  player.diamonds -= cost;
  document.getElementById("diamonds").textContent = player.diamonds;

  let results = [];
  for (let i = 0; i < times; i++) {
    const item = drawOne(currentDrawPool);
    if (currentDrawPool === "char") {
      player.owned.push({ id: Date.now() + i, charId: item.id, level: 1, stars: 0, equippedWeapon: null });
      player.totalCharDraws++;
      if (item.rarity === "R") player.rCount++;
      else if (item.rarity === "SR") player.srCount++;
      else if (item.rarity === "SSR") player.ssrCount++;
      else if (item.rarity === "UR") player.urCount++;
    } else {
      player.weapons.push({ id: Date.now() + i, weaponId: item.id, level: 1, stars: 0 });
      player.totalWeaponDraws++;
      if (item.rarity === "R") player.wR++;
      else if (item.rarity === "SR") player.wSR++;
      else if (item.rarity === "SSR") player.wSSR++;
      else if (item.rarity === "UR") player.wUR++;
    }
    results.push(item);
  }
  window.saveGame();
  window.showDrawAnimation(results, currentDrawPool);   // 调用 ui.js 中的动画
  if (!document.getElementById("panel1").classList.contains("hidden")) {
    window.renderInventory();
  }
}

// 暴露
window.drawCard = drawCard;
window.drawOne = drawOne;
