"use client";

import { useEffect, useMemo, useState } from "react";

type Exercise = {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  steps: string[];
  image: string;
  gif: string;
};

type ActivePlan = { name: string; ids: string[] };

const MEDIA = "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/";
const fallbackNames = ["barbell bench press", "barbell deadlift", "barbell full squat", "pull-up", "dumbbell seated shoulder press", "walking lunge"];
const title = (value: string) => value.replace(/\b\w/g, (letter) => letter.toUpperCase());

const sources = [
  {
    source: "Jeff Nippard",
    date: "Aug 2025",
    title: "Which Workout Split Is Actually Best?",
    takeaway: "Ranks popular splits, but the practical winner is the one that fits your schedule, recovery and weekly volume.",
    url: "https://www.youtube.com/watch?v=5RtVbWCX5y0",
    tag: "LATEST SPLIT BREAKDOWN",
  },
  {
    source: "RP Strength",
    date: "2026",
    title: "Build a Split That Actually Works",
    takeaway: "Start with a realistic weekly frequency, distribute overlap intelligently and train priorities while energy is highest.",
    url: "https://rpstrength.com/blogs/video-guides/how-to-build-a-training-split-that-actually-works",
    tag: "CURRENT COACHING GUIDE",
  },
  {
    source: "Journal of Strength & Conditioning Research",
    date: "2024",
    title: "Split vs Full Body: The Evidence",
    takeaway: "A meta-analysis found no meaningful difference in strength or hypertrophy when weekly training volume was equated.",
    url: "https://pubmed.ncbi.nlm.nih.gov/38595233/",
    tag: "PEER-REVIEWED",
  },
];

export default function RoutinePage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [plan, setPlan] = useState<ActivePlan | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/exercises.json").then((response) => response.json()).then(setExercises);
    const active = localStorage.getItem("form1324-active");
    const custom = localStorage.getItem("form1324-plan");
    const completed = localStorage.getItem("form1324-completed");
    if (active) setPlan(JSON.parse(active));
    else if (custom) {
      const saved = JSON.parse(custom);
      setPlan({ name: saved.name, ids: saved.exerciseIds });
    }
    if (completed) setDone(JSON.parse(completed));
  }, []);

  const routine = useMemo(() => {
    if (!exercises.length) return [];
    const identifiers = plan?.ids?.length ? plan.ids : fallbackNames;
    return identifiers.map((key) => exercises.find((item) => item.id === key || item.name === key) ?? exercises.find((item) => item.name.includes(key))).filter(Boolean) as Exercise[];
  }, [exercises, plan]);

  const days = useMemo(() => [
    { label: "MON", name: "Session A", moves: routine.slice(0, 2) },
    { label: "WED", name: "Session B", moves: routine.slice(2, 4) },
    { label: "FRI", name: "Session C", moves: routine.slice(4, 6) },
  ], [routine]);

  function toggleDone(id: string) {
    setDone((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem("form1324-completed", JSON.stringify(next));
      return next;
    });
  }

  return (
    <main className="routine-page">
      <header className="site-header">
        <a className="brand" href="/"><span>FORM</span><i>/</i><b>1324</b></a>
        <nav><a href="/#plans">Plans</a><a href="/#library">Exercises</a><a href="#research">Split research</a></nav>
        <a className="header-cta" href="/">Edit plan <span>↗</span></a>
      </header>

      <section className="routine-hero">
        <div>
          <p className="kicker"><span /> YOUR TRAINING ROOM</p>
          <h1>Your<br /><em>routine.</em></h1>
        </div>
        <div className="routine-summary">
          <span>ACTIVE PROGRAM</span>
          <strong>{plan?.name ?? "The Foundation"}</strong>
          <p>{routine.length} movements · 3 sessions · repeat weekly</p>
          <div className="routine-progress"><i style={{ width: `${routine.length ? (routine.filter((item) => done.includes(item.id)).length / routine.length) * 100 : 0}%` }} /></div>
          <small>{routine.filter((item) => done.includes(item.id)).length} of {routine.length} movements complete</small>
        </div>
      </section>

      <section className="routine-workspace">
        <aside className="week-rail">
          <p>THIS WEEK</p>
          {days.map((day, index) => (
            <a href={`#day-${index}`} key={day.label}><b>{day.label}</b><span>{day.name}<small>{day.moves.length} exercises</small></span></a>
          ))}
          <div className="recovery-note"><span>RECOVERY</span><strong>Tue · Thu · Weekend</strong><p>Easy movement, food and sleep do the adaptation work.</p></div>
        </aside>
        <div className="routine-days">
          {days.map((day, dayIndex) => (
            <article className="routine-day" id={`day-${dayIndex}`} key={day.label}>
              <header><span>0{dayIndex + 1} / {day.label}</span><h2>{day.name}</h2><p>{dayIndex === 0 ? "Strength focus" : dayIndex === 1 ? "Volume focus" : "Technique focus"}</p></header>
              {day.moves.map((exercise, index) => (
                <div className={`routine-exercise ${done.includes(exercise.id) ? "is-done" : ""}`} key={exercise.id}>
                  <button className="routine-check" onClick={() => toggleDone(exercise.id)}>{done.includes(exercise.id) ? "✓" : String(index + 1).padStart(2, "0")}</button>
                  <img src={`${MEDIA}${exercise.gif}`} alt={`${exercise.name} demonstration`} />
                  <div className="routine-exercise-copy"><small>{title(exercise.bodyPart)} · {title(exercise.equipment)}</small><h3>{title(exercise.name)}</h3><p>{title(exercise.target)}</p></div>
                  <div className="prescription"><strong>3 × {dayIndex === 0 ? "6–8" : "8–12"}</strong><small>{dayIndex === 2 ? "2–3 RIR" : "1–3 RIR"}</small></div>
                  <button className="cue-toggle" onClick={() => setOpenId(openId === exercise.id ? null : exercise.id)}>Cues {openId === exercise.id ? "−" : "+"}</button>
                  {openId === exercise.id && (
                    <div className="exercise-cues">
                      <b>SETUP</b><p>{exercise.steps[0]}</p>
                      <b>EXECUTE</b><p>{exercise.steps[1] ?? exercise.steps[0]}</p>
                      <b>CONTROL</b><p>Use a controlled lowering phase, keep the target muscle loaded, and stop the set when technique meaningfully changes.</p>
                    </div>
                  )}
                </div>
              ))}
            </article>
          ))}
        </div>
      </section>

      <section className="live-tips">
        <div><p className="kicker"><span /> WHILE YOU LIFT</p><h2>Good reps<br />over ego reps.</h2></div>
        <div className="tips-grid">
          <article><b>01</b><h3>Brace before you move</h3><p>Take a breath, make your torso rigid, then begin the rep. Re-brace when needed instead of rushing.</p></article>
          <article><b>02</b><h3>Own the lowering phase</h3><p>Control the eccentric. Don’t turn “slow” into arbitrary counting—keep tension and stay stable.</p></article>
          <article><b>03</b><h3>Keep reps in reserve</h3><p>Most working sets can finish with roughly 1–3 good reps left. Save true failure for suitable, lower-risk movements.</p></article>
          <article><b>04</b><h3>Progress one variable</h3><p>Add a rep, a little load, or cleaner execution. You do not need to beat every metric in every session.</p></article>
          <article><b>05</b><h3>Rest long enough</h3><p>Start the next set when breathing and focus are ready for another high-quality effort—often 2–3 minutes on compounds.</p></article>
          <article><b>06</b><h3>Pain changes the plan</h3><p>Effort and muscle burn are expected; sharp or escalating joint pain is not. Stop and get qualified help when needed.</p></article>
        </div>
      </section>

      <section className="research-section" id="research">
        <div className="section-heading"><div><p className="kicker"><span /> EVIDENCE + COACHING</p><h2>Choose the split<br />you can repeat.</h2></div><p>There is no universally superior split. When weekly volume is matched, the schedule is mainly a tool for distributing quality work and recovery.</p></div>
        <div className="split-cards">
          <article><span>3 DAYS</span><h3>Full body</h3><p>Best starting point when time is limited. Frequent practice, simple progression, fewer weekly gym trips.</p><b>MON · WED · FRI</b></article>
          <article className="featured"><span>4 DAYS / MOST FLEXIBLE</span><h3>Upper / lower</h3><p>A strong default for intermediate lifters: manageable sessions, each area trained twice, recovery days built in.</p><b>UP · LOW · REST · UP · LOW</b></article>
          <article><span>5–6 DAYS</span><h3>Push / pull / legs</h3><p>Useful when higher volume makes sessions too long. Requires more gym days and honest recovery management.</p><b>PUSH · PULL · LEGS · REPEAT</b></article>
        </div>
        <div className="source-feed">
          {sources.map((source) => (
            <a href={source.url} target="_blank" rel="noreferrer" key={source.title}>
              <span>{source.tag}</span><small>{source.source} · {source.date}</small><h3>{source.title}</h3><p>{source.takeaway}</p><b>Read / watch ↗</b>
            </a>
          ))}
        </div>
        <p className="medical-note">General educational guidance—not individualized medical or coaching advice. If you have pain, an injury, a medical condition, or uncertainty about technique, work with an appropriately qualified professional.</p>
      </section>
    </main>
  );
}
