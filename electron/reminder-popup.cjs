const fs = require('node:fs');
const path = require('node:path');
// Reuse the application's dark theme tokens in this separate Electron document.
const theme = fs.readFileSync(path.join(__dirname, '../src/styles/theme.css'), 'utf8').match(/\.dark\s*\{([^}]+)\}/)[1];
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
function reminderHtml(reminder = {}) {
  const title = reminder.title || (reminder.atStart ? 'Time to start' : 'Upcoming task');
  const message = reminder.message || reminder.label || 'Scheduled event';
  const detail = reminder.start ? 'Starts at ' + reminder.start : '';
  return '<!doctype html><html lang="en"><meta charset="utf-8"><title>UX Focus reminder</title><style>:root{' + theme + '}' +
    '*{box-sizing:border-box}html,body{margin:0;overflow:hidden;background:var(--card);color:var(--card-foreground);font-family:Segoe UI,sans-serif}' +
    'main{padding:24px;border:1px solid var(--accent);border-radius:12px;text-align:center;overflow-wrap:anywhere}' +
    '.icon{font-size:28px;line-height:1.3}h1{font-size:21px;line-height:1.3;margin:12px 0}p{font-size:14px;line-height:1.55;margin:10px 0;color:var(--card-foreground)}.detail{color:var(--accent)}' +
    'button{font:600 14px Segoe UI,sans-serif;margin-top:12px;padding:10px 24px;border:2px solid var(--accent);border-radius:10px;background:var(--accent);color:var(--accent-foreground);cursor:pointer}' +
    'button:hover{background:var(--card);color:var(--accent)}button:focus-visible{outline:3px solid var(--card-foreground);outline-offset:4px}button:active{transform:translateY(1px)}' +
    '</style><main><div class="icon" aria-hidden="true">' + escape(reminder.icon || '\u{1F514}') + '</div><h1>' + escape(title) + '</h1><p>' + escape(message) + '</p>' +
    (detail ? '<p class="detail">' + escape(detail) + '</p>' : '') + '<button autofocus onclick="window.close()">Got it</button></main></html>';
}
async function sizeReminderWindow(win, workArea) {
  await win.webContents.executeJavaScript('document.fonts.ready');
  const height = await win.webContents.executeJavaScript('Math.ceil(document.querySelector("main").getBoundingClientRect().height)');
  win.setContentSize(win.getContentSize()[0], height);
  const bounds = win.getBounds();
  win.setPosition(Math.round(workArea.x + (workArea.width - bounds.width) / 2), Math.round(workArea.y + Math.max(0, (workArea.height - bounds.height) / 2)));
}
module.exports = { reminderHtml, sizeReminderWindow };
