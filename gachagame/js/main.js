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
  }
  if (n === 2) {
    window.renderExplorationButtons();
  }
  if (n === 3) {
    window.renderAlbum();
  }
  if (n === 4) {
    window.renderShopInfo();
  }
}

function hideAnnouncement() {
  document.getElementById("announcementModal").classList.add("hidden");
}

window.onload = () => {
  window.loadGame();
  window.switchTab(0);

  // 每次进入网页弹出公告
  document.getElementById("announcementModal").classList.remove("hidden");

  console.log("%c🎉 抽卡养成大冒险 + 经营系统 已完整加载！", "color:#eab308; font-size:18px; font-weight:bold");
};

window.addEventListener('beforeunload', () => {
  localStorage.removeItem("gachaGame");
  window.saveGame();
});

// 暴露所有全局函数
window.switchTab = switchTab;
window.hideAnnouncement = hideAnnouncement;
