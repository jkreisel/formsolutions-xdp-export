/* global browser */

function captureCurrentPanel() {
  const sel = document.getElementById("tabs:panelSelectionForm:panelSelection_input");
  if (!sel) return null;

  const opt = sel.options[sel.selectedIndex];
  const value = opt.value;
  const name = opt.textContent.trim();

  const ROWS = document.querySelectorAll('#tabs\\:panelForm\\:panelComponentTree tbody tr');

  const map = {
    Textfield: 'input',
    Textarea: 'textarea',
    Selectlist: 'select',
    Checkbox: 'checkbox',
    Radiolist: 'radio',
    Fileupload: 'file',
    Compositecomponent: 'group',
    Textoutput: 'textoutput'
  };

  const elements = [];

  const rowMap = new Map();

  // 1. Elemente vorbereiten und zuordnen
  [...ROWS].forEach(row => {
    const idAttr = row.getAttribute('id');
    const idParts = idAttr?.split('_') ?? [];
    const depth = idParts.length - 1;
    const baseId = idAttr?.split(':').pop();

    const typeClass = [...row.querySelector("span.componentType")?.classList || []]
      .find(c => map[c]);

    const kind = map[typeClass] ?? "staticText";
    const labelNode = row.querySelector('span[style*="pointer-events"], span.highlightActivation');
    const id = (labelNode?.textContent.trim() || "unbenannt").replace(/\s+/g, "_");

    const item = { kind, id };

    rowMap.set(baseId, { item, depth, parentId: idAttr.includes('_') ? idAttr.split('_')[0] : null });
  });

  // 2. Baumstruktur aufbauen
  for (const [baseId, { item, depth, parentId }] of rowMap.entries()) {
    if (item.kind === 'group') {
      item.children = [];
      elements.push(item);
    } else if (parentId && rowMap.has(parentId)) {
      const parentItem = rowMap.get(parentId).item;
      if (parentItem.kind === 'group') {
        parentItem.children = parentItem.children || [];
        parentItem.children.push(item);
      } else {
        elements.push(item); // Fallback
      }
    } else {
      elements.push(item);
    }
  }

  return { name, value, elements };
}

browser.runtime.onMessage.addListener((msg) => {
  if (msg.cmd === "capturePanel") {
    return Promise.resolve(captureCurrentPanel());
  }
});
