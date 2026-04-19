// js/exploration.js - 探索系统、赌博、21点、扫雷（资源已全部改为耀星/强化石）
let diamondCooldownEnd = 0;   // 改名但保持变量名清晰
let goldCooldownEnd = 0;
let potionCooldownEnd = 0;    // 改名但保持变量名清晰
let currentMinesweeperScore = 0;
let minesweeperBoard = [];
let mineRows = 0, mineCols = 0, mineCount = 0;
let minesweeperGameOver = false;
let minesweeperReward = 0;

// 赌博全局
let currentGamblingTab = 0;
let currentBetCurrency = 0; // 0=耀星 1=金币 2=强化石
let currentBetAmount = 1000;

// 21点全局
let blackjackDeck = [];
let playerHand = [];
let dealerHand = [];
let blackjackBet = 0;
let blackjackBetCurrency = 0;

function getYaoXing() {  // 原 getDiamonds
  if (Date.now() < diamondCooldownEnd) return;
  const amount = Math.floor(Math.random() * 201) + 300;
  player.yaoXing += amount;
  document.getElementById("yaoXing").textContent = player.yaoXing;
  window.saveGame();
  const btn = document.getElementById("yaoXingBtn");
  btn.classList.add("opacity-50", "cursor-not-allowed");
  diamondCooldownEnd = Date.now() + 10000;
  const cd = document.getElementById("yaoXingCooldown");
  let timeLeft = 10;
  const timer = setInterval(() => {
    timeLeft--;
    cd.textContent = `${timeLeft}秒后可再次获取`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      btn.classList.remove("opacity-50", "cursor-not-allowed");
      cd.textContent = "";
    }
  }, 1000);
}

function getGold() {
  if (Date.now() < goldCooldownEnd) return;
  const amount = Math.floor(Math.random() * 501) + 500;
  player.gold += amount;
  document.getElementById("gold").textContent = player.gold;
  window.saveGame();
  const btn = document.getElementById("goldBtn");
  btn.classList.add("opacity-50", "cursor-not-allowed");
  goldCooldownEnd = Date.now() + 10000;
  const cd = document.getElementById("goldCooldown");
  let timeLeft = 10;
  const timer = setInterval(() => {
    timeLeft--;
    cd.textContent = `${timeLeft}秒后可再次获取`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      btn.classList.remove("opacity-50", "cursor-not-allowed");
      cd.textContent = "";
    }
  }, 1000);
}

function getReinforceStone() {  // 原 getMagicPotion
  if (Date.now() < potionCooldownEnd) return;
  const amount = Math.floor(Math.random() * 6) + 5;
  player.reinforceStone += amount;
  document.getElementById("reinforceStone").textContent = player.reinforceStone;
  window.saveGame();
  const btn = document.getElementById("reinforceStoneBtn");
  btn.classList.add("opacity-50", "cursor-not-allowed");
  potionCooldownEnd = Date.now() + 10000;
  const cd = document.getElementById("reinforceStoneCooldown");
  let timeLeft = 10;
  const timer = setInterval(() => {
    timeLeft--;
    cd.textContent = `${timeLeft}秒后可再次获取`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      btn.classList.remove("opacity-50", "cursor-not-allowed");
      cd.textContent = "";
    }
  }, 1000);
}

// ==================== 赌博 ====================
function openGambling() {
  document.getElementById("gamblingModal").classList.remove("hidden");
  window.switchGamblingTab(0);
}

function hideGambling() {
  document.getElementById("gamblingModal").classList.add("hidden");
}

function switchGamblingTab(n) {
  currentGamblingTab = n;
  document.querySelectorAll('.gambling-tab').forEach((b, i) => b.classList.toggle('active', i === n));
  document.getElementById("slotPanel").classList.toggle("hidden", n !== 0);
  document.getElementById("blackjackPanel").classList.toggle("hidden", n !== 1);
}

function selectCurrency(n) {
  currentBetCurrency = n;
  document.querySelectorAll('.currency-btn').forEach((el, i) => el.classList.toggle('active', i === n));
  const unit = n === 0 ? "耀星" : n === 1 ? "金币" : "强化石";
  document.getElementById("betUnit").textContent = unit;
}

function spinSlots() {
  const bet = parseInt(document.getElementById("betAmount").value);
  let maxBet = currentBetCurrency === 0 ? 5000 : currentBetCurrency === 1 ? 50000 : 100;
  let minBet = currentBetCurrency === 0 ? 100 : currentBetCurrency === 1 ? 1000 : 5;
  if (bet < minBet || bet > maxBet) return alert(`下注金额必须在 ${minBet}~${maxBet} 之间！`);

  let costField = currentBetCurrency === 0 ? "yaoXing" : currentBetCurrency === 1 ? "gold" : "reinforceStone";
  if (player[costField] < bet) return alert("余额不足！");

  player[costField] -= bet;
  if (currentBetCurrency === 0) document.getElementById("yaoXing").textContent = player.yaoXing;
  else if (currentBetCurrency === 1) document.getElementById("gold").textContent = player.gold;
  else document.getElementById("reinforceStone").textContent = player.reinforceStone;

  const symbols = ["💎", "🃏", "🔥", "🌟", "⚡", "🧊", "7️⃣", "☠️"];
  const reel1 = symbols[Math.floor(Math.random() * symbols.length)];
  const reel2 = symbols[Math.floor(Math.random() * symbols.length)];
  const reel3 = symbols[Math.floor(Math.random() * symbols.length)];

  document.getElementById("slots").innerHTML = `${reel1} ${reel2} ${reel3}`;

  let multiplier = 0;
  if (reel1 === reel2 && reel2 === reel3) {
    if (reel1 === "7️⃣") multiplier = 5;
    else if (reel1 === "☠️") multiplier = 0;
    else multiplier = 3;
  } else if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
    multiplier = 2;
  }

  let win = 0;
  if (multiplier > 0) {
    win = bet * multiplier;
    let winField = currentBetCurrency === 0 ? "yaoXing" : currentBetCurrency === 1 ? "gold" : "reinforceStone";
    player[winField] += win;
    if (currentBetCurrency === 0) document.getElementById("yaoXing").textContent = player.yaoXing;
    else if (currentBetCurrency === 1) document.getElementById("gold").textContent = player.gold;
    else document.getElementById("reinforceStone").textContent = player.reinforceStone;
    document.getElementById("gamblingResult").innerHTML = `<span class="text-green-400">🎉 中奖 ×${multiplier}！获得 ${win} ${currentBetCurrency === 0 ? "耀星" : currentBetCurrency === 1 ? "金币" : "强化石"}</span>`;
  } else if (multiplier === 0) {
    document.getElementById("gamblingResult").innerHTML = `<span class="text-red-400">💀 全清！损失全部下注</span>`;
  } else {
    document.getElementById("gamblingResult").innerHTML = `<span class="text-red-400">😢 未中奖</span>`;
  }
  window.saveGame();
}

// ==================== 21点 ====================
function createDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  let deck = [];
  for (let s of suits) {
    for (let v of values) {
      deck.push({suit: s, value: v});
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

function cardValue(card) {
  if (['J','Q','K'].includes(card.value)) return 10;
  if (card.value === 'A') return 11;
  return parseInt(card.value);
}

function handScore(hand) {
  let score = 0;
  let aces = 0;
  for (let card of hand) {
    let val = cardValue(card);
    if (val === 11) aces++;
    score += val;
  }
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  return score;
}

function renderCard(card, isBack = false) {
  if (isBack) {
    return `<div class="card-back"></div>`;
  }
  return `<div class="w-16 h-24 bg-white text-black rounded-xl flex flex-col items-center justify-center shadow-lg text-3xl border border-gray-300">${card.value}<span class="text-4xl">${card.suit}</span></div>`;
}

function startBlackjack() {
  blackjackBet = parseInt(document.getElementById("betAmount").value) || 1000;
  blackjackBetCurrency = currentBetCurrency;

  let maxBet = blackjackBetCurrency === 0 ? 5000 : blackjackBetCurrency === 1 ? 50000 : 100;
  let minBet = blackjackBetCurrency === 0 ? 100 : blackjackBetCurrency === 1 ? 1000 : 5;
  if (blackjackBet < minBet || blackjackBet > maxBet) return alert(`下注金额必须在 ${minBet}~${maxBet} 之间！`);

  let costField = blackjackBetCurrency === 0 ? "yaoXing" : blackjackBetCurrency === 1 ? "gold" : "reinforceStone";
  if (player[costField] < blackjackBet) return alert("余额不足！");

  player[costField] -= blackjackBet;
  if (blackjackBetCurrency === 0) document.getElementById("yaoXing").textContent = player.yaoXing;
  else if (blackjackBetCurrency === 1) document.getElementById("gold").textContent = player.gold;
  else document.getElementById("reinforceStone").textContent = player.reinforceStone;

  blackjackDeck = createDeck();
  playerHand = [blackjackDeck.pop(), blackjackDeck.pop()];
  dealerHand = [blackjackDeck.pop(), blackjackDeck.pop()];

  document.getElementById("dealerCards").innerHTML = renderCard(dealerHand[0]) + renderCard(null, true);
  document.getElementById("playerCards").innerHTML = playerHand.map(c => renderCard(c)).join('');
  document.getElementById("playerScore").textContent = `得分：${handScore(playerHand)}`;
  document.getElementById("dealerScore").textContent = `得分：${cardValue(dealerHand[0])} (隐藏一张)`;

  const unit = blackjackBetCurrency === 0 ? "耀星" : blackjackBetCurrency === 1 ? "金币" : "强化石";
  document.getElementById("blackjackBetInfo").innerHTML = `下注：${blackjackBet} ${unit}`;

  document.getElementById("blackjackResult").innerHTML = "";

  document.getElementById("hitBtn").disabled = false;
  document.getElementById("standBtn").disabled = false;
}

function hitBlackjack() {
  playerHand.push(blackjackDeck.pop());
  document.getElementById("playerCards").innerHTML = playerHand.map(c => renderCard(c)).join('');
  const score = handScore(playerHand);
  document.getElementById("playerScore").textContent = `得分：${score}`;
  if (score > 21) {
    endBlackjack(false);
  }
}

function standBlackjack() {
  document.getElementById("hitBtn").disabled = true;
  document.getElementById("standBtn").disabled = true;

  while (handScore(dealerHand) < 17) {
    dealerHand.push(blackjackDeck.pop());
  }
  document.getElementById("dealerCards").innerHTML = dealerHand.map(c => renderCard(c)).join('');
  document.getElementById("dealerScore").textContent = `得分：${handScore(dealerHand)}`;

  const playerScoreVal = handScore(playerHand);
  const dealerScoreVal = handScore(dealerHand);

  let win = false;
  if (playerScoreVal > 21) win = false;
  else if (dealerScoreVal > 21) win = true;
  else if (playerScoreVal > dealerScoreVal) win = true;
  else if (playerScoreVal === dealerScoreVal) win = false;
  else win = false;

  endBlackjack(win);
}

function endBlackjack(win) {
  let payoutMultiplier = 2;
  if (win) {
    if (handScore(playerHand) === 21 && playerHand.length === 2) {
      payoutMultiplier = 2.5;
    }
    let winAmount = Math.floor(blackjackBet * payoutMultiplier);
    let winField = blackjackBetCurrency === 0 ? "yaoXing" : blackjackBetCurrency === 1 ? "gold" : "reinforceStone";
    player[winField] += winAmount;

    if (blackjackBetCurrency === 0) document.getElementById("yaoXing").textContent = player.yaoXing;
    else if (blackjackBetCurrency === 1) document.getElementById("gold").textContent = player.gold;
    else document.getElementById("reinforceStone").textContent = player.reinforceStone;

    const unit = blackjackBetCurrency === 0 ? "耀星" : blackjackBetCurrency === 1 ? "金币" : "强化石";
    document.getElementById("blackjackResult").innerHTML = `<span class="text-green-400">🎉 你赢了！获得 ${winAmount} ${unit}（2倍/2.5倍）</span>`;
  } else {
    document.getElementById("blackjackResult").innerHTML = `<span class="text-red-400">😢 你输了</span>`;
  }
  window.saveGame();
}

// ==================== 扫雷 ====================
function openMinesweeper() {
  document.getElementById("minesweeperModal").classList.remove("hidden");
  window.startMinesweeper(8,8,10);
}

function hideMinesweeper() {
  document.getElementById("minesweeperModal").classList.add("hidden");
  currentMinesweeperScore = 0;
  minesweeperReward = 0;
  minesweeperGameOver = false;
}

function startMinesweeper(rows, cols, mines) {
  mineRows = rows; mineCols = cols; mineCount = mines;
  currentMinesweeperScore = 0;
  minesweeperReward = 0;
  minesweeperGameOver = false;
  document.getElementById("mineScore").textContent = "0 钻石";
  minesweeperBoard = Array(rows).fill().map(() => Array(cols).fill().map(() => ({revealed: false, mine: false, flagged: false, adjacent: 0})));
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!minesweeperBoard[r][c].mine) { minesweeperBoard[r][c].mine = true; placed++; }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (minesweeperBoard[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && minesweeperBoard[nr][nc].mine) count++;
      }
      minesweeperBoard[r][c].adjacent = count;
    }
  }
  window.renderMinesweeperBoard();
}

function renderMinesweeperBoard() {
  const boardEl = document.getElementById("minesweeperBoard");
  boardEl.innerHTML = "";
  boardEl.style.gridTemplateColumns = `repeat(${mineCols}, 42px)`;
  for (let r = 0; r < mineRows; r++) {
    for (let c = 0; c < mineCols; c++) {
      const cell = document.createElement("div");
      cell.className = `ms-cell ms-unrevealed border border-gray-400 hover:bg-gray-500 rounded cursor-pointer flex items-center justify-center text-xl font-bold`;
      cell.dataset.r = r; cell.dataset.c = c;
      cell.addEventListener("click", window.handleMineClick);
      cell.addEventListener("contextmenu", (e) => { e.preventDefault(); window.handleMineFlag(r, c); });
      boardEl.appendChild(cell);
    }
  }
}

function handleMineClick(e) {
  if (minesweeperGameOver) return;
  const r = parseInt(e.target.dataset.r);
  const c = parseInt(e.target.dataset.c);
  const cellData = minesweeperBoard[r][c];
  if (cellData.revealed || cellData.flagged) return;
  if (cellData.mine) {
    minesweeperGameOver = true;
    alert("💥 踩雷了！游戏结束，奖励清零");
    window.hideMinesweeper();
    return;
  }
  window.floodFill(r, c);
  window.checkWin();
}

function floodFill(r, c) {
  if (r < 0 || r >= mineRows || c < 0 || c >= mineCols) return;
  const cellData = minesweeperBoard[r][c];
  if (cellData.revealed || cellData.flagged || cellData.mine) return;
  cellData.revealed = true;
  const cellEl = document.querySelector(`[data-r="${r}"][data-c="${c}"]`);
  if (cellEl) {
    cellEl.classList.remove("ms-unrevealed");
    cellEl.classList.add("ms-revealed-safe");
    if (cellData.adjacent > 0) {
      cellEl.textContent = cellData.adjacent;
      cellEl.style.color = ["#1e90ff","#00b700","#ff0000","#800080","#ffa500","#00ffff","#000000","#808080"][cellData.adjacent-1];
    }
  }
  if (cellData.adjacent === 0) {
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      window.floodFill(r + dr, c + dc);
    }
  }
}

function handleMineFlag(r, c) {
  if (minesweeperGameOver) return;
  const cellData = minesweeperBoard[r][c];
  if (cellData.revealed) return;
  cellData.flagged = !cellData.flagged;
  const cellEl = document.querySelector(`[data-r="${r}"][data-c="${c}"]`);
  if (cellEl) cellEl.textContent = cellData.flagged ? "🚩" : "";
  if (cellData.flagged && cellData.mine) {
    minesweeperReward += 500;
    document.getElementById("mineScore").textContent = `${minesweeperReward} 钻石`;
  }
}

function checkWin() {
  let safeCellsLeft = 0;
  let allMinesFlagged = true;
  for (let r = 0; r < mineRows; r++) {
    for (let c = 0; c < mineCols; c++) {
      const cell = minesweeperBoard[r][c];
      if (!cell.mine && !cell.revealed) safeCellsLeft++;
      if (cell.mine && !cell.flagged) allMinesFlagged = false;
    }
  }
  if (safeCellsLeft === 0 || allMinesFlagged) {  // 新增：标记完所有雷也胜利
    minesweeperGameOver = true;
    player.yaoXing += minesweeperReward;
    document.getElementById("yaoXing").textContent = player.yaoXing;
    window.saveGame();
    alert(`🎉 扫雷胜利！获得 ${minesweeperReward} 耀星`);
    window.hideMinesweeper();
  }
}

function stopMinesweeper() {
  if (minesweeperGameOver) return;
  let safeCellsLeft = 0;
  for (let r = 0; r < mineRows; r++) {
    for (let c = 0; c < mineCols; c++) {
      if (!minesweeperBoard[r][c].mine && !minesweeperBoard[r][c].revealed) safeCellsLeft++;
    }
  }
  if (safeCellsLeft === 0) {
    player.yaoXing += minesweeperReward;
    document.getElementById("yaoXing").textContent = player.yaoXing;
    window.saveGame();
    alert(`🎉 扫雷胜利！获得 ${minesweeperReward} 耀星`);
  } else {
    alert("中途退出，奖励清零");
  }
  window.hideMinesweeper();
}

// ====================== 动态生成探索按钮 ======================
function renderExplorationButtons() {
  const grid = document.getElementById("explorationGrid");
  grid.innerHTML = `
    <button onclick="getYaoXing()" id="yaoXingBtn" class="bg-emerald-600 hover:bg-emerald-700 p-8 rounded-3xl flex flex-col items-center gap-4 transition btn-hover">
      <i class="fas fa-gem text-6xl"></i>
      <div class="text-3xl font-bold">获取耀星</div>
      <div class="text-emerald-200">300~500耀星</div>
      <div id="yaoXingCooldown" class="text-xs text-emerald-300"></div>
    </button>
    <button onclick="getGold()" id="goldBtn" class="bg-yellow-600 hover:bg-yellow-700 p-8 rounded-3xl flex flex-col items-center gap-4 transition btn-hover">
      <i class="fas fa-coins text-6xl"></i>
      <div class="text-3xl font-bold">获取金币</div>
      <div class="text-yellow-200">500~1000金币</div>
      <div id="goldCooldown" class="text-xs text-yellow-300"></div>
    </button>
    <button onclick="getReinforceStone()" id="reinforceStoneBtn" class="bg-teal-600 hover:bg-teal-700 p-8 rounded-3xl flex flex-col items-center gap-4 transition btn-hover">
      <i class="fas fa-gem text-6xl"></i>
      <div class="text-3xl font-bold">获取强化石</div>
      <div class="text-teal-200">5~10强化石</div>
      <div id="reinforceStoneCooldown" class="text-xs text-teal-300"></div>
    </button>
    <button onclick="openGambling()" class="bg-purple-600 hover:bg-purple-700 p-8 rounded-3xl flex flex-col items-center gap-4 transition btn-hover">
      <i class="fas fa-dice text-6xl"></i>
      <div class="text-3xl font-bold">赌博</div>
      <div class="text-purple-200">老虎机 / 21点</div>
    </button>
    <button onclick="openMinesweeper()" class="bg-red-600 hover:bg-red-700 p-8 rounded-3xl flex flex-col items-center gap-4 transition btn-hover">
      <i class="fas fa-bomb text-6xl"></i>
      <div class="text-3xl font-bold">扫雷</div>
      <div class="text-red-200">标记雷获胜后统一结算</div>
    </button>
  `;
}

// ====================== 暴露 ======================
window.getYaoXing = getYaoXing;
window.getGold = getGold;
window.getReinforceStone = getReinforceStone;
window.openGambling = openGambling;
window.hideGambling = hideGambling;
window.switchGamblingTab = switchGamblingTab;
window.selectCurrency = selectCurrency;
window.spinSlots = spinSlots;
window.startBlackjack = startBlackjack;
window.hitBlackjack = hitBlackjack;
window.standBlackjack = standBlackjack;
window.endBlackjack = endBlackjack;
window.openMinesweeper = openMinesweeper;
window.hideMinesweeper = hideMinesweeper;
window.startMinesweeper = startMinesweeper;
window.renderMinesweeperBoard = renderMinesweeperBoard;
window.handleMineClick = handleMineClick;
window.floodFill = floodFill;
window.handleMineFlag = handleMineFlag;
window.checkWin = checkWin;
window.stopMinesweeper = stopMinesweeper;
window.renderExplorationButtons = renderExplorationButtons;
// 测试：战斗模块暴露
window.addBattleButton();
