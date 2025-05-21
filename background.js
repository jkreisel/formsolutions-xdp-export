/* global browser */

function buildXdpXml({ panels }) {
  const fieldToXdp = (el) => {
    const name = el.id || 'unnamed';
    const uiType = {
      input: 'textEdit',
      textarea: 'textEdit',
      select: 'choiceList',
      checkbox: 'checkButton',
      radio: 'exclusiveGroup',
      file: 'button'
    }[el.kind] || 'textEdit';

    return `
      <field name="${name}">
        <ui>
          <${uiType}/>
        </ui>
        <caption>
          <value>
            <text>${name}</text>
          </value>
        </caption>
      </field>`;
  };

  const fields = panels
    .flatMap(p => p.elements)
    .map(fieldToXdp)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<xdp:xdp xmlns:xdp="http://ns.adobe.com/xdp/"
         xmlns:xfa="http://www.xfa.org/schema/xfa-data/1.0/"
         xmlns:xfaTpl="http://www.xfa.org/schema/xfa-template/2.5/">
  <xfaTpl:template>
    <subform name="MainForm">
      ${fields}
    </subform>
  </xfaTpl:template>
</xdp:xdp>`;
}

async function getModel() {
  return (await browser.storage.local.get("panels")).panels ?? [];
}

async function saveModel(panels) {
  return browser.storage.local.set({ panels });
}

browser.runtime.onMessage.addListener(async (msg) => {
  if (msg.cmd === "storePanel") {
    let panels = await getModel();
    panels = panels.filter(p => p.value !== msg.panel.value);
    panels.push(msg.panel);
    await saveModel(panels);
  }

  if (msg.cmd === "exportXdp") {
    const panels = await getModel();
    if (!panels.length) {
      browser.notifications.create({
        title: "Kein Panel erfasst",
        message: "Bitte erst Panels übernehmen.",
        type: "basic",
      });
      return;
    }

    const xdp = buildXdpXml({ panels });
    const blobUrl = URL.createObjectURL(new Blob([xdp], { type: "application/xml" }));
    await browser.downloads.download({
      url: blobUrl,
      filename: "export_form.xdp",
    });
  }
});
