const K="myroutine-v4";
const Q=id=>document.getElementById(id);
const T=()=>new Date().toISOString().slice(0,10);
const UID=()=>Date.now()+Math.random();
let d=JSON.parse(localStorage.getItem(K)||localStorage.getItem("myroutine-v3")||'{"routines":[],"medicines":[],"bp":[],"appointments":[],"reminders":[],"water":0,"waterDate":""}');
d.reminders=d.reminders||[];

function save(){localStorage.setItem(K,JSON.stringify(d));render()}
function toast(x){Q("toast").textContent=x;Q("toast").classList.add("show");setTimeout(()=>Q("toast").classList.remove("show"),2200)}
function reset(){if(d.waterDate!==T()){d.water=0;d.waterDate=T();localStorage.setItem(K,JSON.stringify(d))}}
function close(){Q("backdrop").classList.remove("show")}
function open(x){Q("modal").innerHTML=x;Q("backdrop").classList.add("show")}

function form(k){
 let x="";
 if(k==="routine") x=`<h2>New routine</h2><p class=sub>Create a reminder.</p><form class=form id=f><div class=field><label>NAME</label><input name=name required placeholder="Morning walk"></div><div class=row><div class=field><label>DATE</label><input name=date type=date value=${T()} required></div><div class=field><label>TIME</label><input name=time type=time required></div></div><div class=field><label>REPEAT</label><select name=repeat><option value="once">Once</option><option value="daily">Every day</option></select></div><button class=primary>Save routine</button></form>`;
 if(k==="medicine") x=`<h2>Medicine reminder</h2><p class=sub>Add a medicine reminder.</p><form class=form id=f><div class=field><label>MEDICINE</label><input name=name required placeholder="Medicine name"></div><div class=row><div class=field><label>DOSE</label><input name=dose placeholder="1 tablet"></div><div class=field><label>TIME</label><input name=time type=time required></div></div><div class=field><label>START DATE</label><input name=date type=date value=${T()} required></div><div class=field><label>REPEAT</label><select name=repeat><option value="once">Once</option><option value="daily">Every day</option></select></div><button class=primary>Save medicine</button></form>`;
 if(k==="bp") x=`<h2>BP reading</h2><p class=sub>Record a BP reading, or schedule a reminder to check it.</p><div class=choice><button type=button data-bp-mode="record">🩺 Record reading</button><button type=button data-bp-mode="reminder">🔔 Set reminder</button></div><div id=bpPanel></div>`;
 if(k==="appointment") x=`<h2>Appointment</h2><form class=form id=f><div class=field><label>TITLE</label><input name=title required placeholder="Doctor appointment"></div><div class=row><div class=field><label>DATE</label><input name=date type=date required></div><div class=field><label>TIME</label><input name=time type=time required></div></div><div class=field><label>LOCATION</label><input name=location></div><button class=primary>Save appointment</button></form>`;
 if(k==="water") x=`<h2>Add water</h2><p class=sub>Today: ${d.water} ml</p><div class=choice><button data-water=250>💧 +250 ml</button><button data-water=500>💧 +500 ml</button><button data-water=750>💧 +750 ml</button><button data-water=1000>💧 +1 L</button></div>`;
 open(x);
 let f=Q("f");
 if(f) f.onsubmit=e=>{e.preventDefault();let z=new FormData(f),o={id:UID(),done:false};
   if(k==="routine"){Object.assign(o,{title:z.get("name"),date:z.get("date"),time:z.get("time"),repeat:z.get("repeat")});d.routines.push(o)}
   if(k==="medicine"){Object.assign(o,{title:"💊 "+z.get("name"),dose:z.get("dose"),date:z.get("date"),time:z.get("time"),repeat:z.get("repeat")});d.medicines.push(o)}
   if(k==="appointment")d.appointments.push({id:UID(),title:z.get("title"),date:z.get("date"),time:z.get("time"),location:z.get("location")});
   save();close();toast("Saved ✓");scheduleTick();
 };
 document.querySelectorAll("[data-water]").forEach(b=>b.onclick=()=>{reset();d.water+=+b.dataset.water;save();toast("Water added 💧");form("water")});
 document.querySelectorAll("[data-bp-mode]").forEach(b=>b.onclick=()=>bpPanel(b.dataset.bpMode));
}

function bpPanel(mode){
 const p=Q("bpPanel");
 if(mode==="record"){
  p.innerHTML=`<form class=form id=bpForm style="margin-top:14px"><div class=row><div class=field><label>SYS</label><input name=sys type=number required></div><div class=field><label>DIA</label><input name=dia type=number required></div></div><div class=row><div class=field><label>PULSE</label><input name=pulse type=number></div><div class=field><label>TIME</label><input name=time type=time></div></div><button class=primary>Save BP reading</button></form>`;
  Q("bpForm").onsubmit=e=>{e.preventDefault();let z=new FormData(e.target);d.bp.unshift({id:UID(),sys:z.get("sys"),dia:z.get("dia"),pulse:z.get("pulse"),time:z.get("time"),date:T()});save();close();toast("BP reading saved ✓")};
 } else {
  p.innerHTML=`<form class=form id=remForm style="margin-top:14px"><div class=field><label>REMINDER</label><input name=title value="🩺 Time to check your BP" required></div><div class=field><label>TIME</label><input name=time type=time value="08:30" required></div><div class=field><label>START DATE</label><input name=date type=date value=${T()} required></div><div class=field><label>REPEAT</label><select name=repeat><option value="daily">Every day</option><option value="once">Once</option></select></div><button class=primary>Save BP reminder</button></form>`;
  Q("remForm").onsubmit=e=>{e.preventDefault();let z=new FormData(e.target);d.reminders.push({id:UID(),title:z.get("title"),time:z.get("time"),date:z.get("date"),repeat:z.get("repeat"),lastNotified:""});save();close();toast("BP reminder saved 🔔");scheduleTick()};
 }
}

function menu(){open(`<h2>Add something</h2><div class=choice><button data-choice=routine>⏰ Routine</button><button data-choice=medicine>💊 Medicine</button><button data-choice=bp>🩺 BP</button><button data-choice=water>💧 Water</button><button data-choice=appointment>📅 Appointment</button></div>`);document.querySelectorAll("[data-choice]").forEach(b=>b.onclick=()=>form(b.dataset.choice))}
function isTodayOrDaily(x){return x.repeat==="daily" ? x.date<=T() : x.date===T()}
function todayItems(){return [...d.routines.filter(isTodayOrDaily),...d.medicines.filter(isTodayOrDaily),...d.reminders.filter(isTodayOrDaily)].sort((a,b)=>(a.time||"").localeCompare(b.time||""))}
function render(){reset();Q("date").textContent=new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"});let h=new Date().getHours();Q("greeting").textContent=h<12?"Good morning 👋":h<17?"Good afternoon ☀️":"Good evening 🌙";Q("medCount").textContent=d.medicines.length;Q("bpCount").textContent=d.bp.length;Q("waterCount").textContent=d.water;Q("apptCount").textContent=d.appointments.length;let a=todayItems(),done=a.filter(x=>x.done).length,p=a.length?Math.round(done/a.length*100):0;Q("percent").textContent=p+"%";Q("tasks").innerHTML=a.length?a.map(x=>`<div class="task ${x.done?"done":""}"><button class=check data-id="${x.id}">${x.done?"✓":"○"}</button><div><b>${x.title}</b><small>${x.time||""}${x.dose?" • "+x.dose:""}${x.repeat==="daily"?" • Daily":""}</small></div></div>`).join(""):`<div class=empty>No routines or reminders for today.<br>Tap + Add to create one.</div>`;document.querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>{let x=[...d.routines,...d.medicines,...d.reminders].find(x=>x.id==b.dataset.id);if(x){x.done=!x.done;save()}})}

async function enableNotifications(){if(!(window.Notification)){toast("Notifications unsupported on this browser");return false}let p=await Notification.requestPermission();if(p==="granted"){toast("Notifications enabled 🔔");return true}toast("Notification permission not granted");return false}
function showReminder(x){
 const body=x.title.replace(/^🔔\s*/,"");
 if(Notification.permission==="granted") new Notification("MyRoutine Reminder",{body,icon:"./icons/icon-192.png",tag:"myroutine-"+x.id});
 toast("🔔 "+body);
 x.lastNotified=T();localStorage.setItem(K,JSON.stringify(d));render();
}
function scheduleTick(){
 const now=new Date(),today=T(),hm=now.toTimeString().slice(0,5);
 d.reminders.forEach(x=>{if(isTodayOrDaily(x)&&x.time===hm&&x.lastNotified!==today)showReminder(x)});
 d.routines.filter(x=>isTodayOrDaily(x)).forEach(x=>{const key="routineNotified"+x.id; if(x.time===hm&&!localStorage.getItem(key+today)){if(Notification.permission==="granted")new Notification("MyRoutine Reminder",{body:x.title,icon:"./icons/icon-192.png",tag:"routine-"+x.id});toast("🔔 "+x.title);localStorage.setItem(key+today,"1")}});
 d.medicines.filter(x=>isTodayOrDaily(x)).forEach(x=>{const key="medicineNotified"+x.id; if(x.time===hm&&!localStorage.getItem(key+today)){if(Notification.permission==="granted")new Notification("MyRoutine Reminder",{body:x.title+(x.dose?" • "+x.dose:""),icon:"./icons/icon-192.png",tag:"medicine-"+x.id});toast("🔔 "+x.title);localStorage.setItem(key+today,"1")}});
}

Q("close").onclick=close;Q("backdrop").onclick=e=>{if(e.target===Q("backdrop"))close()};Q("add").onclick=menu;Q("addRoutine").onclick=()=>form("routine");Q("notify").onclick=enableNotifications;Q("settings").onclick=()=>open(`<h2>Settings</h2><p class=sub>Local-first version. Reminders are stored on this device.</p><button class=primary id=enableNow>Enable notifications 🔔</button><br><br><button class=secondary id=export>Export backup</button><br><br><button class=secondary id=clear>Clear all data</button>`);
document.addEventListener("click",e=>{let b=e.target.closest("[data-action]");if(b)form(b.dataset.action);if(e.target.closest("#enableNow"))enableNotifications();if(e.target.closest("#export")){let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:"application/json"}));a.download="myroutine-backup.json";a.click()}if(e.target.closest("#clear")&&confirm("Delete all data?")){localStorage.removeItem(K);location.reload()}});
let deferred=null;addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;Q("installBanner").hidden=false});Q("installBtn").onclick=async()=>{if(deferred){deferred.prompt();await deferred.userChoice;deferred=null;Q("installBanner").hidden=true}else toast("Chrome menu ⋮ → Install app / Add to Home screen")};Q("hideInstall").onclick=()=>Q("installBanner").hidden=true;addEventListener("appinstalled",()=>{Q("installBanner").hidden=true;toast("MyRoutine installed 📱")});
if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js");
render();scheduleTick();setInterval(scheduleTick,20000);document.addEventListener("visibilitychange",scheduleTick);addEventListener("focus",scheduleTick);


(function(){
  let deferredPrompt=null;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function allData(){
    const vals=[];
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      try{ const v=JSON.parse(localStorage.getItem(k)); if(v) vals.push(v); }catch(e){}
    }
    return vals;
  }
  function collect(){
    const out=[];
    const walk=x=>{
      if(!x||typeof x!=="object")return;
      if(Array.isArray(x)){x.forEach(walk);return;}
      const time=x.time||x.reminderTime||x.reminder_time||x.scheduledTime;
      const title=x.title||x.name||x.label||x.medicine||x.activity||x.type;
      if(time&&title) out.push({title,time,days:x.days||x.repeatDays||x.weekdays||x.repeat||"daily",enabled:x.enabled!==false&&x.active!==false});
      Object.values(x).forEach(walk);
    };
    allData().forEach(walk); return out;
  }
  function tm(s){
    const m=String(s).match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i); if(!m)return null;
    let h=+m[1],n=+m[2],a=m[3];
    if(a){a=a.toUpperCase();if(a==="PM"&&h<12)h+=12;if(a==="AM"&&h===12)h=0}
    return h<24&&n<60?{h,n}:null;
  }
  function today(days){
    if(!days||String(days).toLowerCase()==="daily"||String(days).toLowerCase()==="every day")return true;
    const d=["sun","mon","tue","wed","thu","fri","sat"][new Date().getDay()];
    return String(days).toLowerCase().includes(d);
  }
  function render(){
    const el=document.getElementById("todayRoutineList"); if(!el)return;
    const rs=collect().filter(r=>r.enabled&&tm(r.time)&&today(r.days));
    el.innerHTML=rs.length?rs.map(r=>`<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee"><span>🔔 ${esc(r.title)}</span><b>${esc(r.time)}</b></div>`).join(""):"No reminders scheduled for today.";
  }
  async function enableNotify(){
    if(!("Notification"in window)){setStatus("This browser does not support notifications.");return}
    const p=await Notification.requestPermission();
    setStatus(p==="granted"?"🔔 Notifications enabled.":"🔕 Notifications are blocked.");
  }
  function setStatus(s){const e=document.getElementById("myStatus");if(e)e.textContent=s}
  function check(){
    const now=new Date(), keyday=now.toISOString().slice(0,10);
    collect().filter(r=>r.enabled&&tm(r.time)&&today(r.days)).forEach(r=>{
      const p=tm(r.time); if(!p||p.h!==now.getHours()||p.n!==now.getMinutes())return;
      const k="mr-notified-"+keyday+"-"+p.h+"-"+p.n+"-"+r.title;
      if(localStorage.getItem(k))return;
      localStorage.setItem(k,"1");
      if(Notification.permission==="granted"){
        if(navigator.serviceWorker) navigator.serviceWorker.ready.then(reg=>reg.showNotification("🔔 MyRoutine Reminder",{body:"Time for: "+r.title,tag:k})).catch(()=>new Notification("🔔 MyRoutine Reminder",{body:"Time for: "+r.title}));
        else new Notification("🔔 MyRoutine Reminder",{body:"Time for: "+r.title});
      }
    });
  }
  window.addEventListener("beforeinstallprompt",e=>{
    e.preventDefault(); deferredPrompt=e;
    const b=document.getElementById("myInstallBtn"); if(b)b.textContent="📱 Install App";
  });
  window.addEventListener("appinstalled",()=>setStatus("✅ MyRoutine installed."));
  document.addEventListener("DOMContentLoaded",()=>{
    document.getElementById("myNotifyBtn")?.addEventListener("click",enableNotify);
    document.getElementById("myInstallBtn")?.addEventListener("click",async()=>{
      if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null}
      else setStatus("Chrome menu ⋮ → Install app (if available).");
    });
    render(); check(); setInterval(check,15000); setInterval(render,30000);
  });
  if("serviceWorker"in navigator) navigator.serviceWorker.register("./sw.js",{scope:"./"}).catch(()=>{});
})();
