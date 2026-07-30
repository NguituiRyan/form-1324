const root = document.querySelector("#app");
const DATA = "https://cdn.jsdelivr.net/gh/NguituiRyan/form-1324@main/public/data/exercises.json";
const state = { all: [], added: JSON.parse(localStorage.getItem("form1324-builder") || "[]"), active: JSON.parse(localStorage.getItem("form1324-active") || "null"), done: JSON.parse(localStorage.getItem("form1324-completed") || "[]") };
const plans = [
  ["The Foundation","START HERE","A balanced full-body base. Learn the patterns, own the form.",3,45,["squat to overhead reach","push-up","walking lunge","front plank with twist","bench pull-ups","bodyweight standing calf raise"]],
  ["Pure Strength","GET STRONG","Classic compound lifts arranged for measurable progress.",4,60,["barbell bench press","barbell deadlift","barbell full squat","barbell standing close grip military press","pull-up","barbell bent over row"]],
  ["No Gym Needed","BODYWEIGHT","Build capacity anywhere with zero equipment and zero excuses.",3,30,["push-up","squat to overhead reach","reverse crunch","bodyweight incline side plank","walking lunge","burpee"]],
  ["Upper / Lower","BUILD MUSCLE","Four focused sessions with smart volume and simple progression.",4,50,["dumbbell bench press","dumbbell seated shoulder press","dumbbell biceps curl","dumbbell lunge","dumbbell romanian deadlift","dumbbell standing calf raise"]]
];
const title = s => s.replace(/\b\w/g, x => x.toUpperCase());
const find = n => state.all.find(x => x.id === n || x.name === n) || state.all.find(x => x.name.includes(n));
const glyph = part => `<div class="body-glyph" aria-label="${part} muscle map"><span class="glyph-head"></span><span class="glyph-torso"></span><span class="glyph-arm glyph-arm--left"></span><span class="glyph-arm glyph-arm--right"></span><span class="glyph-leg glyph-leg--left"></span><span class="glyph-leg glyph-leg--right"></span><span class="glyph-focus glyph-focus--${part.replace(" ","-")}"></span></div>`;

function shell() {
  root.innerHTML = `
  <header class="site-header"><a class="brand" href="#top"><span>FORM</span><i>/</i><b>1324</b></a><nav><a href="#plans">Plans</a><a href="#library">Exercises</a><a href="#builder">Build your own</a></nav><a class="header-cta" href="#today">My training <span>↗</span></a></header>
  <section class="hero" id="top"><div class="hero-copy"><p class="kicker"><span></span> TRAIN WITH INTENT</p><h1>Build a body<br>that <em>works.</em></h1><p class="hero-sub">Proven plans when you want direction. A deep exercise library when you want control. No noise—just your next good session.</p><div class="hero-actions"><a href="#plans" class="button button--primary">Find my plan <span>→</span></a><a href="#builder" class="text-link">Build my own <span>↗</span></a></div><div class="hero-stats"><div><strong>1,324</strong><span>exercises</span></div><div><strong>10</strong><span>body areas</span></div><div><strong>30+</strong><span>equipment types</span></div></div></div><div class="hero-visual"><div class="hero-orbit hero-orbit--one"></div><div class="hero-orbit hero-orbit--two"></div>${glyph("chest")}<div class="floating-card floating-card--top"><small>TODAY / PUSH</small><strong>6 movements</strong><span>45 min · moderate</span></div><div class="floating-card floating-card--bottom"><div class="pulse-dot"></div><span><small>WEEKLY RHYTHM</small><strong>3 of 4 sessions</strong></span></div></div></section>
  <section class="plans-section" id="plans"><div class="section-heading"><div><p class="kicker"><span></span> READY-MADE PROGRAMS</p><h2>Pick your path.</h2></div><p>Clear schedules, smart exercise selection, and room to progress. Choose one and start today.</p></div><div class="plans-grid" id="plans-grid"></div></section>
  <section class="today-section" id="today"><div class="section-heading section-heading--light"><div><p class="kicker"><span></span> YOUR TRAINING</p><h2 id="active-name">Nothing scheduled yet.</h2></div></div><div id="active-list" class="empty-training"><span>↗</span><p>Choose a ready-made plan above or build your own below. Your sessions will live here.</p></div></section>
  <section class="library-section" id="library"><div class="section-heading"><div><p class="kicker"><span></span> EXPLORE THE LIBRARY</p><h2>Know every move.</h2></div><p>Search 1,324 movements by muscle, equipment, or name. Every exercise includes clear technique steps.</p></div><div class="filters"><label class="search-box"><span>⌕</span><input id="search" placeholder="Search exercises, muscles, targets..."></label><select id="body"><option value="">All body areas</option></select><select id="equipment"><option value="">All equipment</option></select></div><div class="exercise-grid" id="grid"></div><button class="load-more" id="more">Explore more exercises <span>↓</span></button></section>
  <section class="builder-section" id="builder"><div class="builder-copy"><p class="kicker"><span></span> YOUR RULES</p><h2>Build your own.</h2><p>Pick movements from the library, arrange a focused session, and save it on this device.</p><ol><li><span>01</span> Search the exercise library</li><li><span>02</span> Tap + to add movements</li><li><span>03</span> Name it and save your plan</li></ol></div><div class="builder-board"><div class="builder-top"><label>PLAN NAME<input id="plan-name" value="My training week"></label><span id="count">0 / 12 MOVEMENTS</span></div><div class="builder-list" id="builder-list"></div><button class="save-plan" id="save">Save my plan <span>→</span></button></div></section>
  <footer><a class="brand brand--footer" href="#top"><span>FORM</span><i>/</i><b>1324</b></a><p>Train with intent. Progress with patience.</p><div>Exercise data from <a href="https://github.com/hasaneyldrm/exercises-dataset">hasaneyldrm/exercises-dataset</a> · MIT licensed.<br>This experience uses dataset text only; exercise media is not redistributed.</div></footer><div id="modal"></div>`;
}

function renderPlans() {
  document.querySelector("#plans-grid").innerHTML = plans.map((p,i) => `<article class="plan-card plan-card--${["lime","violet","coral","blue"][i]}"><div class="plan-index">0${i+1}</div><p>${p[1]}</p><h3>${p[0]}</h3><span class="plan-description">${p[2]}</span><div class="plan-rhythm">${["M","T","W","T","F","S","S"].map((d,n)=>`<i class="${n<p[3]?"active":""}">${d}</i>`).join("")}</div><div class="plan-meta"><span>${p[3]} days / week</span><span>${p[4]} min</span><span>${i?"Intermediate":"Beginner"}</span></div><button data-plan="${i}">Start this plan <span>→</span></button></article>`).join("");
}
function filtered() {
  const q = document.querySelector("#search").value.toLowerCase(), b=document.querySelector("#body").value, e=document.querySelector("#equipment").value;
  return state.all.filter(x => (!q || `${x.name} ${x.target} ${x.muscleGroup}`.includes(q)) && (!b || x.bodyPart===b) && (!e || x.equipment===e));
}
function renderGrid(limit=8) {
  document.querySelector("#grid").innerHTML = filtered().slice(0,limit).map(x => `<article class="exercise-card"><button class="exercise-visual" data-view="${x.id}">${glyph(x.bodyPart)}<span class="body-pill">${title(x.bodyPart)}</span><span class="exercise-number">#${x.id}</span></button><div class="exercise-info"><small>${title(x.equipment)}</small><h3>${title(x.name)}</h3><p>Targets ${title(x.target)}</p><div><button data-view="${x.id}">View form</button><button data-add="${x.id}" class="${state.added.includes(x.id)?"added":""}">${state.added.includes(x.id)?"✓":"+"}</button></div></div></article>`).join("");
}
function renderBuilder() {
  document.querySelector("#count").textContent=`${state.added.length} / 12 MOVEMENTS`;
  document.querySelector("#builder-list").innerHTML = state.added.length ? state.added.map((id,i)=>{const x=state.all.find(y=>y.id===id);return `<div><span class="drag-handle">⋮⋮</span><b>${String(i+1).padStart(2,"0")}</b><p><strong>${title(x.name)}</strong><small>${title(x.target)} · ${title(x.equipment)}</small></p><button data-remove="${id}">×</button></div>`}).join("") : `<div class="builder-empty"><span>+</span><p>Your plan is waiting.<br><small>Add exercises from the library above.</small></p></div>`;
}
function renderActive() {
  if(!state.active) return;
  const moves=state.active.ids.map(find).filter(Boolean);
  document.querySelector("#active-name").textContent=state.active.name;
  const list=document.querySelector("#active-list"); list.className="session-list";
  list.innerHTML=moves.map((x,i)=>`<button class="session-row ${state.done.includes(x.id)?"is-done":""}" data-done="${x.id}"><span class="session-check">${state.done.includes(x.id)?"✓":i+1}</span><span class="session-name"><strong>${title(x.name)}</strong><small>${title(x.target)} · ${title(x.equipment)}</small></span><span class="session-dose">3 × ${i%3?"12":"8"}</span><span class="session-action">${state.done.includes(x.id)?"Done":"Mark done"}</span></button>`).join("");
}
function showModal(x) {
  document.querySelector("#modal").innerHTML=`<div class="modal-backdrop"><article class="exercise-modal"><button class="modal-close">×</button><div class="modal-visual">${glyph(x.bodyPart)}<span>${title(x.bodyPart)}</span></div><div class="modal-content"><p class="kicker"><span></span> EXERCISE #${x.id}</p><h2>${title(x.name)}</h2><div class="modal-tags"><span>${title(x.target)}</span><span>${title(x.equipment)}</span></div><h3>How to do it</h3><ol>${x.steps.map((s,i)=>`<li><span>${String(i+1).padStart(2,"0")}</span><p>${s}</p></li>`).join("")}</ol><button class="button button--primary" data-add="${x.id}">Add to my plan <span>→</span></button></div></article></div>`;
}

shell();
fetch(DATA).then(r=>r.json()).then(data => {
  state.all=data; renderPlans(); renderBuilder(); renderActive();
  [...new Set(data.map(x=>x.bodyPart))].sort().forEach(x=>document.querySelector("#body").insertAdjacentHTML("beforeend",`<option>${x}</option>`));
  [...new Set(data.map(x=>x.equipment))].sort().forEach(x=>document.querySelector("#equipment").insertAdjacentHTML("beforeend",`<option>${x}</option>`));
  renderGrid();
});
document.addEventListener("input",e=>{if(["search","body","equipment"].includes(e.target.id))renderGrid()});
document.addEventListener("click",e=>{
  const el=e.target.closest("[data-plan],[data-add],[data-remove],[data-view],[data-done],#more,#save,.modal-close");
  if(!el)return;
  if(el.dataset.plan!==undefined){const p=plans[+el.dataset.plan];state.active={name:p[0],ids:p[5]};localStorage.setItem("form1324-active",JSON.stringify(state.active));renderActive();location.hash="today"}
  if(el.dataset.add){if(!state.added.includes(el.dataset.add)&&state.added.length<12)state.added.push(el.dataset.add);localStorage.setItem("form1324-builder",JSON.stringify(state.added));renderBuilder();renderGrid(60)}
  if(el.dataset.remove){state.added=state.added.filter(x=>x!==el.dataset.remove);localStorage.setItem("form1324-builder",JSON.stringify(state.added));renderBuilder();renderGrid()}
  if(el.dataset.view)showModal(state.all.find(x=>x.id===el.dataset.view));
  if(el.dataset.done){state.done=state.done.includes(el.dataset.done)?state.done.filter(x=>x!==el.dataset.done):[...state.done,el.dataset.done];localStorage.setItem("form1324-completed",JSON.stringify(state.done));renderActive()}
  if(el.id==="more")renderGrid(60);
  if(el.id==="save"){state.active={name:document.querySelector("#plan-name").value||"My training week",ids:state.added.map(id=>state.all.find(x=>x.id===id)?.name).filter(Boolean)};localStorage.setItem("form1324-active",JSON.stringify(state.active));renderActive();location.hash="today"}
  if(el.classList.contains("modal-close"))document.querySelector("#modal").innerHTML="";
});
