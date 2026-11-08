const DAYS = ["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"];
const SHORT = ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"];
const schedule = {
  1:[["16:00–18:00","ТАР ОЖ"]],
  2:[["19:00–20:30","МАТ КС"]],
  3:[["15:00–16:30","МАТ ЛС"],["17:00–18:00","ИНФО ЛС"],["18:30–20:00","МС ЛС"]],
  4:[["15:00–16:30","ИНФО ЛС"],["20:00–21:00","МС КС"]],
  5:[["15:00–16:00","ТАР ЛС"],["18:00–21:00","МС СТ"],["21:00–22:00","ТАР НТ"]],
  6:[["Время уточнить","3 СТ · около 4,5 часа"]],
  0:[["","Генеральная уборка · 3–4 часа"]]
};
const seedTasks = [
 ["МАТ","ТС","Вторник"],["МАТ","Конспект","Вторник"],["МАТ","ДЗ","Четверг"],["МАТ","Квиз","Пятница"],["МАТ","Работа над ошибками","Пятница"],["МАТ","Доп. ДЗ","Пятница"],["МАТ","Доп. доп. ДЗ","Пятница"],
 ["ИНФО","ТС","Вторник"],["ИНФО","ПС","Вторник"],["ИНФО","ДЗ","Четверг"],["ИНФО","Квиз","Пятница"],["ИНФО","Доп. ДЗ","Пятница"],["ИНФО","Теория","Пятница"],["ИНФО","Работа над ошибками","Пятница"],["ИНФО","БТ","Пятница"],["ИНФО","Парная работа","Через 1,5 недели"],
 ["МС","ТС","Среда"],["МС","ПС","Среда"],["МС","ДЗ","Четверг"],["МС","Работа над ошибками ДЗ","Пятница"],["МС","Дополнительное ДЗ","Пятница"],["МС","Куиз","Пятница"],["МС","БТ","Пятница"],
 ["ТАР","ТС","Среда"],["ТАР","ПС","Четверг"],["ТАР","ДЗ","Четверг"],["ТАР","Куиз","Пятница"],["ТАР","БТ","Пятница"],["ТАР","Читать базу / книгу","Без дедлайна"],
 ["Личное","Английский · 45 минут","Ежедневно"],["Личное","Стажировка: найти и написать 3–4 компаниям","Ежедневно"]
];
const dayIndex = name => ({Понедельник:1,Вторник:2,Среда:3,Четверг:4,Пятница:5,Суббота:6,Воскресенье:0}[name] ?? 8);
const mondayOf = d => {const x=new Date(d); x.setHours(0,0,0,0); x.setDate(x.getDate() - ((x.getDay()+6)%7)); return x;};
const dateKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const weekKey = d => dateKey(mondayOf(d));
let offset=0, data=loadData(), toastTimer;
function loadData(){try{return JSON.parse(localStorage.getItem("myStudyPlannerV1"))||{done:{},custom:[]}}catch{return {done:{},custom:[]}}}
function save(){localStorage.setItem("myStudyPlannerV1",JSON.stringify(data));}
function notify(s){const t=document.getElementById("toast");t.textContent=s;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2200)}
function weekDates(){const m=mondayOf(new Date());m.setDate(m.getDate()+offset*7);return Array.from({length:7},(_,i)=>{const d=new Date(m);d.setDate(m.getDate()+i);return d})}
function taskId(t,w){return `${w}|${t.id || `${t.subject}|${t.title}|${t.day}`}`}
function tasksForWeek(){const w=weekKey(weekDates()[0]);const base=seedTasks.flatMap((x,i)=>x[2]==="Ежедневно"?[1,2,3,4,5,6,0].map(d=>({id:`seed-${i}-${d}`,subject:x[0],title:x[1],day:DAYS[d],seed:true})): [{id:`seed-${i}`,subject:x[0],title:x[1],day:x[2],seed:true}]);return [...base,...data.custom].map(t=>({...t,key:taskId(t,w),week:w}));}
function isDone(t){return !!data.done[t.key]}
function markDone(key,checked){data.done[key]=checked;save();render()}
function dateForDay(day){const dates=weekDates();if(day==="Ежедневно")return "Каждый день";if(day==="Без дедлайна")return "Без срока";if(day==="Через 1,5 недели")return "Через 1,5 недели";const idx=dayIndex(day);return idx===8?"":dates.find(d=>d.getDay()===idx)?.toLocaleDateString("ru-RU",{day:"numeric",month:"short"})||day}
function renderStats(){const tasks=tasksForWeek();const done=tasks.filter(isDone).length;const total=tasks.length;const pct=total?Math.round(done/total*100):0;document.getElementById("doneCount").textContent=done;document.getElementById("remainingCount").textContent=total-done;document.getElementById("progressText").textContent=pct+"%";document.getElementById("progressBar").style.width=pct+"%";document.getElementById("taskBadge").textContent=total-done}
function taskHTML(t){const estimate=(t.title==="ТС"||t.title==="ДЗ")?" · 1,5+ ч на предмет":"";return `<label class="task-row ${isDone(t)?"done":""}"><input class="check" type="checkbox" data-key="${escapeAttr(t.key)}" ${isDone(t)?"checked":""}><span class="task-info"><strong>${escapeHTML(t.title)}</strong><small>${escapeHTML(t.subject)} · ${escapeHTML(t.day)}${estimate}</small></span><span class="due">${escapeHTML(dateForDay(t.day))}</span></label>`}
function renderOverview(){const today=new Date();const idx=today.getDay();const selected=weekDates()[idx===0?6:idx-1];const label=DAYS[idx];document.getElementById("dayHeading").textContent=label;const lessons=schedule[idx]||[];document.getElementById("todayLessons").innerHTML=lessons.length?lessons.map(x=>`<div class="lesson-row"><span class="time">${escapeHTML(x[0]||"Личное")}</span><span class="lesson-info"><strong>${escapeHTML(x[1])}</strong><small>Постоянное событие недели</small></span></div>`).join(""):`<div class="empty">На сегодня постоянных занятий нет. Можно спокойно распределить задания и отдохнуть.</div>`;
 const tasks=tasksForWeek().filter(t=>!isDone(t)).sort((a,b)=>dayIndex(a.day)-dayIndex(b.day)).slice(0,5);document.getElementById("upcomingTasks").innerHTML=tasks.length?tasks.map(taskHTML).join(""):`<div class="empty">Все задачи отмечены. Отличная работа!</div>`;
}
function renderTasks(){const f=document.getElementById("filterSelect").value;let tasks=tasksForWeek();if(f!=="all")tasks=tasks.filter(t=>t.subject===f);tasks.sort((a,b)=>{const da=dayIndex(a.day),db=dayIndex(b.day);return (da===8?9:da)-(db===8?9:db)});document.getElementById("allTasks").innerHTML=tasks.length?tasks.map(taskHTML).join(""):`<div class="empty">Задач пока нет. Добавь первую выше.</div>`}
function renderSchedule(){document.getElementById("fullSchedule").innerHTML=[1,2,3,4,5,6,0].map(d=>`<article class="day-card"><h3>${DAYS[d]}</h3>${(schedule[d]||[]).map(x=>`<div class="day-item"><span>${escapeHTML(x[0]||"")}</span><span>${escapeHTML(x[1])}</span></div>`).join("")}</article>`).join("")}
function renderWeek(){const dates=weekDates();const fmt=d=>d.toLocaleDateString("ru-RU",{day:"numeric",month:"short"});document.getElementById("weekRange").textContent=`${fmt(dates[0])} — ${fmt(dates[6])}`;document.getElementById("weekNumber").textContent=offset===0?"Текущая неделя":offset<0?`${Math.abs(offset)} нед. назад`:`Через ${offset} нед.`;document.getElementById("todayLabel").textContent=new Date().toLocaleDateString("ru-RU",{weekday:"short",day:"numeric",month:"short"});}
function render(){renderWeek();renderStats();renderOverview();renderTasks();renderSchedule()}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function escapeAttr(s){return escapeHTML(s)}
document.addEventListener("change",e=>{if(e.target.matches(".check"))markDone(e.target.dataset.key,e.target.checked)});
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));["overview","tasks","schedule"].forEach(n=>document.getElementById(n+"Panel").classList.toggle("hidden",n!==b.dataset.tab));}));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>document.querySelector(`[data-tab="${b.dataset.goto}"]`).click()));
document.getElementById("prevWeek").onclick=()=>{offset--;render()};document.getElementById("nextWeek").onclick=()=>{offset++;render()};document.getElementById("goToday").onclick=()=>{offset=0;render()};
document.getElementById("filterSelect").onchange=renderTasks;
document.getElementById("addTaskForm").onsubmit=e=>{e.preventDefault();const title=document.getElementById("newTaskTitle").value.trim();if(!title)return;data.custom.push({id:"custom-"+Date.now(),subject:document.getElementById("newTaskSubject").value,title,day:DAYS[Number(document.getElementById("newTaskDay").value)]});save();e.target.reset();render();notify("Задача добавлена")};
document.getElementById("exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="my-study-progress.json";a.click();URL.revokeObjectURL(a.href);notify("Файл прогресса экспортирован")};
document.getElementById("importBtn").onclick=()=>document.getElementById("importFile").click();
document.getElementById("importFile").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const parsed=JSON.parse(await f.text());if(!parsed.done||!Array.isArray(parsed.custom))throw Error();data=parsed;save();render();notify("Прогресс импортирован")}catch{notify("Не удалось прочитать файл прогресса")}e.target.value=""};
document.getElementById("resetBtn").onclick=()=>{if(confirm("Сбросить отметки выполнения для всех задач? Свои задачи останутся.")){data.done={};save();render();notify("Отметки сброшены")}};
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
render();
