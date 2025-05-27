const captureBtn = document.getElementById("capture");
const exportBtn = document.getElementById("export");
const resetBtn = document.getElementById("reset");
const listEl = document.getElementById("panelList");

async function refreshList() {
  const panels = await browser.runtime.sendMessage({ cmd: "getPanels" });

  // Liste zunächst leeren
  listEl.innerHTML = "";

  if (!panels.length) {
    const li = document.createElement("li");
    const em = document.createElement("em");
    em.textContent = "Keine Panels gespeichert";
    li.appendChild(em);
    listEl.appendChild(li);
  } else {
    panels.forEach((p) => {
      const li = document.createElement("li");
      li.textContent = `${p.name} (${p.elements.length})`;
      listEl.appendChild(li);
    });
  }
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

resetBtn.onclick = async () => {
  const confirmed = confirm("Alle Panels wirklich löschen?");
  if (!confirmed) return;

  await browser.runtime.sendMessage({ cmd: "resetPanels" });
  await refreshList();
};

// Initiale Anzeige
refreshList();

const themeSwitch = document.getElementById("themeSwitch");

// Theme laden beim Start
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeSwitch.checked = true;
  }
});

// Toggle Handler
themeSwitch.addEventListener("change", () => {
  const isDark = themeSwitch.checked;
  document.body.classList.toggle("dark", isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

