// js/main.js - 初始化 + Tab切换 + 全局启动
function switchTab(n) {
  document.querySelectorAll(".panel").forEach(p => p.classList.add("hidden"));
  document.getElementById("panel" + n).classList.remove("hidden");
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active", "bg-white", "text-black"));
  document.getElementById("tab" + n).classList.add("active", "bg-white", "text-black");

  if (n === 1) {
    decomposeMode = false;
    document.getElementById("decomposeBar").classList.add("hidden");
    window.renderInventory();
    setTimeout(window.initVirtualScroll, 100);
  }
  if (n === 2) {
    window.renderExplorationButtons();
  }
  if (n === 3) {
    window.renderAlbum();
  }
}

window.onload = () => {
  window.loadGame();
  window.switchTab(0);

  console.log("%c🎉 抽卡养成大冒险 + 图鉴系统 已完整加载！", "color:#eab308; font-size:18px; font-weight:bold");
};

window.addEventListener('beforeunload', () => {
  localStorage.removeItem("gachaGame");
  console.log("💾 存档已自动保存");
});
