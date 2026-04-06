// js/main.js - 初始化 + Tab切换 + 全局启动（完整无省略）
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
}

window.onload = () => {
  window.loadGame();
  window.switchTab(0);

  // Tailwind 脚本已在 index.html 中引入，这里只需确保全局变量就绪
  console.log("%c🎉 抽卡养成大冒险 重构版 启动成功！", "color:#eab308; font-size:18px; font-weight:bold");
  console.log("当前结构：constants + player + draw + inventory + exploration + ui + main");
  console.log("所有功能已完整联动，欢迎继续开发战斗系统！");
};
