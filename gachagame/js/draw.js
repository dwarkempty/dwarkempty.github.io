// js/draw.js - 抽卡核心逻辑
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

  if (item.rarity === "SSR" || item.rarity === "UR") {
    if (isChar) player.charSsrPity = 0;
    else player.weaponSsrPity = 0;
  }
  if (item.rarity === "UR") {
    if (isChar) player.charUrPity = 0;
    else player.weaponUrPity = 0;
  }

  if (isChar) {
    if (!player.unlockedChars.includes(item.id)) {
      player.unlockedChars.push(item.id);
    }
  } else {
    if (!player.unlockedWeapons.includes(item.id)) player.unlockedWeapons.push(item.id);
  }

  return item;
}

function drawCard(times) {
  const cost = times === 1 ? 100 : 900;
  if (player.yaoXing < cost) return alert("耀星不够啦！去经营或探索吧～");

  player.yaoXing -= cost;
  document.getElementById("yaoXing").textContent = player.yaoXing;

  let results = [];
  for (let i = 0; i < times; i++) {
    const item = drawOne(currentDrawPool);
    if (currentDrawPool === "char") {
      if (player.owned.some(o => o.charId === item.id)) {
        // 重复角色 → 转换为角色源力
        player.sourcePowers = player.sourcePowers || {};
        player.sourcePowers[item.id] = (player.sourcePowers[item.id] || 0) + 1;
      } else {
        player.owned.push({ id: Date.now() + i, charId: item.id, level: 1, stars: 0, equippedWeapon: null });
      }
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
  window.showDrawAnimation(results, currentDrawPool);
  window.renderInventory();

  console.log(`🎉 抽卡完成！新增 ${results.length} 个物品，已强制刷新仓库`);
}

window.drawCard = drawCard;
window.drawOne = drawOne;
