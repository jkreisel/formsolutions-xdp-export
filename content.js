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
  };

  const elements = [...ROWS].map(row => {
    const typeClass = [...row.querySelector("span.componentType").classList]
      .find(c => map[c]) || 'staticText';

    const labelNode = row.querySelector('span[style*="pointer-events"], span.highlightActivation');
    const id = (labelNode?.textContent.trim() || "unbenannt").replace(/\s+/g, "_");

    return {
      kind: map[typeClass] ?? "staticText",
      id
    };
  });

  return { name, value, elements };
}

browser.runtime.onMessage.addListener((msg) => {
  if (msg.cmd === "capturePanel") {
    return Promise.resolve(captureCurrentPanel());
  }
});
