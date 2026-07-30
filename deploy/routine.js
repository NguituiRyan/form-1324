const root = document.querySelector("#app");
const DATA = window.FORM_DATA;
const MEDIA = "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/";
const fallback = ["barbell bench press","barbell deadlift","barbell full squat","pull-up","dumbbell seated shoulder press","walking lunge"];
const title = s => s.replace(/\b\w/g,x=>x.toUpperCase());
const state = { all:[], plan:JSON.parse(localStorage.getItem("form1324-active")||"null"), done:JSON.parse(localStorage.getItem("form1324-completed")||"[]"), open:null };
const sources = [
  ["LATEST SPLIT BREAKDOWN","Jeff Nippard · Aug 2025","Which Workout Split Is Actually Best?","Ranks popular splits, but the practical winner is the one that fits your schedule, recovery and weekly volume.","https://www.youtube.com/watch?v=5RtVbWCX5y0"],
  ["CURRENT COACHING GUIDE","RP Strength · 2026","Build a Split That Actually Works","Start with realistic frequency, distribute overlap intelligently and train priorities while energy is highest.","https://rpstrength.com/blogs/video-guides/how-to-build-a-training-split-that-actually-works"],
  ["PEER-REVIEWED","J Strength Cond Res · 2024","Split vs Full Body: The Evidence","A meta-analysis found no meaningful difference in strength or hypertrophy when weekly volume was equated.","https://pubmed.ncbi.nlm.nih.gov/38595233/"]
];
function getRoutine(){
  const keys=state.plan?.ids?.length?state.plan.ids:fallback;
  return keys.map(k=>state.all.find(x=>x.id===k||x.name===k)||state.all.find(x=>x.name.includes(k))).filter(Boolean).slice(0,12);
}
function render(){
  const routine=getRoutine(), days=[routine.slice(0,2),routine.slice(2,4),routine.slice(4,6)], complete=routine.filter(x=>state.done.includes(x.id)).length;
  root.innerHTML=`
  <header class="site-header"><a class="brand" href="/"><span>NGUITUI</span><i>/</i><b>FITNESS</b></a><nav><a href="/#plans">Plans</a><a href="/#library">Exercises</a><a href="#research">Split research</a></nav><a class="header-cta" href="/">Edit plan <span>↗</span></a></header>
  <section class="routine-hero" id="top"><div><p class="kicker"><span></span> YOUR TRAINING ROOM</p><h1>Your<br><em>routine.</em></h1></div><div class="routine-summary"><span>ACTIVE PROGRAM</span><strong>${state.plan?.name||"The Foundation"}</strong><p>${routine.length} movements · 3 sessions · repeat weekly</p><div class="routine-progress"><i style="width:${routine.length?complete/routine.length*100:0}%"></i></div><small>${complete} of ${routine.length} movements complete</small></div></section><div class="motion-ribbon motion-ribbon--dark"><div>YOUR WEEK <i>✦</i> QUALITY REPS <i>✦</i> TRACK PROGRESS <i>✦</i> RECOVER HARD <i>✦</i> YOUR WEEK <i>✦</i></div></div>
  <section class="routine-workspace reveal"><aside class="week-rail"><p>THIS WEEK</p>${["MON","WED","FRI"].map((d,i)=>`<a href="#day-${i}"><b>${d}</b><span>Session ${String.fromCharCode(65+i)}<small>${days[i].length} exercises</small></span></a>`).join("")}<div class="recovery-note"><span>RECOVERY</span><strong>Tue · Thu · Weekend</strong><p>Easy movement, food and sleep do the adaptation work.</p></div></aside><div class="routine-days">${days.map((moves,di)=>`<article class="routine-day" id="day-${di}"><header><span>0${di+1} / ${["MON","WED","FRI"][di]}</span><h2>Session ${String.fromCharCode(65+di)}</h2><p>${["Strength","Volume","Technique"][di]} focus</p></header>${moves.map((x,i)=>exercise(x,i,di)).join("")}</article>`).join("")}</div></section>
  <section class="live-tips reveal"><div><p class="kicker"><span></span> WHILE YOU LIFT</p><h2>Good reps<br>over ego reps.</h2></div><div class="tips-grid">
  ${tip("01","Brace before you move","Take a breath, make your torso rigid, then begin the rep. Re-brace when needed instead of rushing.")}
  ${tip("02","Own the lowering phase","Control the eccentric. Don’t turn “slow” into arbitrary counting—keep tension and stay stable.")}
  ${tip("03","Keep reps in reserve","Most working sets can finish with roughly 1–3 good reps left. Save true failure for suitable, lower-risk movements.")}
  ${tip("04","Progress one variable","Add a rep, a little load, or cleaner execution. You do not need to beat every metric in every session.")}
  ${tip("05","Rest long enough","Start the next set when breathing and focus are ready—often 2–3 minutes on compound lifts.")}
  ${tip("06","Pain changes the plan","Effort and muscle burn are expected; sharp or escalating joint pain is not. Stop and get qualified help.")}
  </div></section>
  <section class="research-section reveal" id="research"><div class="section-heading"><div><p class="kicker"><span></span> EVIDENCE + COACHING</p><h2>Choose the split<br>you can repeat.</h2></div><p>There is no universally superior split. When weekly volume is matched, the schedule is mainly a tool for distributing quality work and recovery.</p></div><div class="split-cards">
  ${split("3 DAYS","Full body","Best starting point when time is limited. Frequent practice, simple progression, fewer weekly gym trips.","MON · WED · FRI")}
  ${split("4 DAYS / MOST FLEXIBLE","Upper / lower","A strong default for intermediate lifters: manageable sessions, each area trained twice, recovery built in.","UP · LOW · REST · UP · LOW",true)}
  ${split("5–6 DAYS","Push / pull / legs","Useful when higher volume makes sessions too long. Requires more gym days and honest recovery management.","PUSH · PULL · LEGS · REPEAT")}
  </div><div class="source-feed">${sources.map(s=>`<a href="${s[4]}" target="_blank" rel="noreferrer"><span>${s[0]}</span><small>${s[1]}</small><h3>${s[2]}</h3><p>${s[3]}</p><b>Read / watch ↗</b></a>`).join("")}</div><p class="medical-note">General educational guidance—not individualized medical or coaching advice. If you have pain, an injury, a medical condition, or uncertainty about technique, work with an appropriately qualified professional.</p></section><nav class="mobile-dock"><a href="/"><b>⌂</b><span>Home</span></a><a href="/#plans"><b>◫</b><span>Plans</span></a><a href="#research"><b>◎</b><span>Research</span></a><a href="#top" class="active"><b>↗</b><span>Routine</span></a></nav>`;
}
function exercise(x,i,di){
  const open=state.open===x.id;
  return `<div class="routine-exercise ${state.done.includes(x.id)?"is-done":""}"><button class="routine-check" data-done="${x.id}">${state.done.includes(x.id)?"✓":String(i+1).padStart(2,"0")}</button><img src="${MEDIA}${x.gif}" alt="${title(x.name)} demonstration"><div class="routine-exercise-copy"><small>${title(x.bodyPart)} · ${title(x.equipment)}</small><h3>${title(x.name)}</h3><p>${title(x.target)}</p></div><div class="prescription"><strong>3 × ${di?"8–12":"6–8"}</strong><small>${di===2?"2–3":"1–3"} RIR</small></div><button class="cue-toggle" data-cue="${x.id}">Cues ${open?"−":"+"}</button>${open?`<div class="exercise-cues"><b>SETUP</b><p>${x.steps[0]}</p><b>EXECUTE</b><p>${x.steps[1]||x.steps[0]}</p><b>CONTROL</b><p>Use a controlled lowering phase, keep the target muscle loaded, and stop when technique meaningfully changes.</p></div>`:""}</div>`;
}
const tip=(n,h,p)=>`<article><b>${n}</b><h3>${h}</h3><p>${p}</p></article>`;
const split=(tag,h,p,b,featured=false)=>`<article class="${featured?"featured":""}"><span>${tag}</span><h3>${h}</h3><p>${p}</p><b>${b}</b></article>`;
function activateMotion(){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.isIntersecting&&entry.target.classList.add("is-visible")),{threshold:.08});
  document.querySelectorAll(".reveal").forEach(item=>observer.observe(item));
}
fetch(DATA).then(r=>r.json()).then(d=>{state.all=d;render();activateMotion()});
document.addEventListener("click",e=>{
  const el=e.target.closest("[data-done],[data-cue]");if(!el)return;
  if(el.dataset.done){state.done=state.done.includes(el.dataset.done)?state.done.filter(x=>x!==el.dataset.done):[...state.done,el.dataset.done];localStorage.setItem("form1324-completed",JSON.stringify(state.done))}
  if(el.dataset.cue)state.open=state.open===el.dataset.cue?null:el.dataset.cue;
  render(); activateMotion();
});
