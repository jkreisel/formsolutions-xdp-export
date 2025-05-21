/* global browser */
const captureBtn = document.getElementById("capture");
const exportBtn = document.getElementById("export");
const listEl = document.getElementById("panelList");

async function refreshList() {
  const { panels = [] } = await browser.storage.local.get("panels");
  listEl.innerHTML = panels.map((p) => `<li>${p.name} (${p.elements.length})</li>`).join("");
}

captureBtn.onclick = async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  const panel = await browser.tabs.sendMessage(tab.id, { cmd: "capturePanel" });

  if (!panel) {
    alert("Panel konnte nicht gelesen werden");
    return;
  }

  await browser.runtime.sendMessage({ cmd: "storePanel", panel });
  await refreshList();
};

exportBtn.onclick = () => browser.runtime.sendMessage({ cmd: "exportXdp" });

refreshList();
