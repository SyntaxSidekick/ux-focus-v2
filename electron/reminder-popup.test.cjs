const {app,BrowserWindow}=require('electron');
const assert=require('node:assert/strict');
const {reminderHtml,sizeReminderWindow}=require('./reminder-popup.cjs');
app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
  const {reminderDefinitions,combinedReminder}=await import('../src/features/reminders/wellness-reminders.mjs');
  const cases=[{label:'Design review',start:'07:00'},{label:'Start task',start:'08:00',atStart:true},
    {label:'Long task name '.repeat(80),start:'09:00'}, {label:'NoSpaces'.repeat(100)},
    ...[...reminderDefinitions,combinedReminder].flatMap(d=>d.variants.map(v=>({...v,icon:d.icon})))];
  try {
    for(const width of [320,420]) for(const reminder of cases){
      const win=new BrowserWindow({width,height:100,frame:false,show:false,webPreferences:{contextIsolation:true,nodeIntegration:false}});
      await win.loadURL('data:text/html;charset=UTF-8,'+encodeURIComponent(reminderHtml(reminder)));
      await sizeReminderWindow(win,{x:0,y:0,width:1920,height:1080});
      const metrics=await win.webContents.executeJavaScript('({height:innerHeight, width:innerWidth, contentHeight:document.querySelector("main").getBoundingClientRect().height, scrollWidth:document.documentElement.scrollWidth, buttonBottom:document.querySelector("button").getBoundingClientRect().bottom, focused:document.activeElement.tagName})');
      assert.ok(metrics.contentHeight<=metrics.height,JSON.stringify(metrics));
      assert.ok(metrics.scrollWidth<=metrics.width,JSON.stringify(metrics));
      assert.ok(metrics.buttonBottom<=metrics.height,JSON.stringify(metrics));
      assert.equal(metrics.focused,'BUTTON');
      if(width===420 && reminder.title==='Time to move!') require('node:fs').writeFileSync('.cache/reminder-preview.png',(await win.webContents.capturePage()).toPNG());
      win.destroy();
    }
    console.log('PASS: all 13 notification cases at 320px and 420px; full content and action visible, no overflow, button focused');
    app.exit(0);
  } catch(error){console.error(error);app.exit(1);}
});
