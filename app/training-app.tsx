"use client";

import { useEffect, useMemo, useState } from "react";

type Exercise = {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  muscleGroup: string;
  secondaryMuscles: string[];
  steps: string[];
  image: string;
  gif: string;
  attribution: string;
};

type Plan = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  days: number;
  level: string;
  minutes: number;
  color: string;
  exerciseIds: string[];
};

type SavedPlan = { name: string; exerciseIds: string[] };

const planBlueprints = [
  {
    id: "foundation",
    name: "The Foundation",
    eyebrow: "START HERE",
    description: "A balanced full-body base. Learn the patterns, own the form.",
    days: 3,
    level: "Beginner",
    minutes: 45,
    color: "lime",
    names: ["squat to overhead reach", "push-up", "walking lunge", "front plank with twist", "bench pull-ups", "bodyweight standing calf raise"],
  },
  {
    id: "strength",
    name: "Pure Strength",
    eyebrow: "GET STRONG",
    description: "The classic compound lifts, arranged for measurable progress.",
    days: 4,
    level: "Intermediate",
    minutes: 60,
    color: "violet",
    names: ["barbell bench press", "barbell deadlift", "barbell full squat", "barbell standing close grip military press", "pull-up", "barbell bent over row"],
  },
  {
    id: "home",
    name: "No Gym Needed",
    eyebrow: "BODYWEIGHT",
    description: "Build capacity anywhere with zero equipment and zero excuses.",
    days: 3,
    level: "All levels",
    minutes: 30,
    color: "coral",
    names: ["push-up", "squat to overhead reach", "reverse crunch", "bodyweight incline side plank", "walking lunge", "burpee"],
  },
  {
    id: "sculpt",
    name: "Upper / Lower",
    eyebrow: "BUILD MUSCLE",
    description: "Four focused sessions with smart volume and simple progression.",
    days: 4,
    level: "Intermediate",
    minutes: 50,
    color: "blue",
    names: ["dumbbell bench press", "dumbbell seated shoulder press", "dumbbell biceps curl", "dumbbell lunge", "dumbbell romanian deadlift", "dumbbell standing calf raise"],
  },
];

const bodyColors: Record<string, string> = {
  chest: "#ff8b6a",
  back: "#9e7cff",
  shoulders: "#5fb8ff",
  "upper arms": "#f0d95e",
  "lower arms": "#f0d95e",
  waist: "#b8f34a",
  "upper legs": "#ff71a8",
  "lower legs": "#49d5bd",
  cardio: "#ff6f61",
  neck: "#c8a6ff",
};

const normalize = (value: string) => value.toLowerCase().replace(/[^\w]+/g, " ").trim();
const titleCase = (value: string) => value.replace(/\b\w/g, (letter) => letter.toUpperCase());

function resolveExercise(exercises: Exercise[], wanted: string) {
  return exercises.find((item) => normalize(item.name) === normalize(wanted))
    ?? exercises.find((item) => normalize(item.name).includes(normalize(wanted)));
}

const mediaUrl = (path: string) =>
  `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/${path}`;

function ExerciseMedia({
  exercise,
  compact = false,
  animated = false,
}: {
  exercise?: Exercise;
  compact?: boolean;
  animated?: boolean;
}) {
  if (!exercise) {
    return <div className={`exercise-media exercise-media--loading ${compact ? "exercise-media--compact" : ""}`} />;
  }
  return (
    <div
      className={`exercise-media ${compact ? "exercise-media--compact" : ""}`}
      style={{ "--muscle": bodyColors[exercise.bodyPart] ?? "#b8f34a" } as React.CSSProperties}
    >
      <img src={mediaUrl(animated ? exercise.gif : exercise.image)} alt={`${titleCase(exercise.name)} demonstration`} loading={compact ? "lazy" : "eager"} />
      {!compact && <small>© Gym visual</small>}
    </div>
  );
}

export default function TrainingApp() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [query, setQuery] = useState("");
  const [bodyFilter, setBodyFilter] = useState("all");
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [builderIds, setBuilderIds] = useState<string[]>([]);
  const [planName, setPlanName] = useState("My training week");
  const [savedPlan, setSavedPlan] = useState<SavedPlan | null>(null);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [libraryOpen, setLibraryOpen] = useState(false);

  useEffect(() => {
    fetch("/data/exercises.json")
      .then((response) => response.json())
      .then(setExercises)
      .catch(() => setExercises([]));
    const saved = localStorage.getItem("form1324-plan");
    const done = localStorage.getItem("form1324-completed");
    if (saved) setSavedPlan(JSON.parse(saved));
    if (done) setCompleted(JSON.parse(done));
  }, []);

  const plans = useMemo<Plan[]>(
    () =>
      planBlueprints.map(({ names, ...plan }) => ({
        ...plan,
        exerciseIds: names.map((name) => resolveExercise(exercises, name)?.id).filter(Boolean) as string[],
      })),
    [exercises],
  );

  const bodyParts = useMemo(() => [...new Set(exercises.map((item) => item.bodyPart))].sort(), [exercises]);
  const equipment = useMemo(() => [...new Set(exercises.map((item) => item.equipment))].sort(), [exercises]);
  const filtered = useMemo(() => {
    const needle = normalize(query);
    return exercises
      .filter(
        (item) =>
          (!needle || normalize(`${item.name} ${item.target} ${item.muscleGroup}`).includes(needle))
          && (bodyFilter === "all" || item.bodyPart === bodyFilter)
          && (equipmentFilter === "all" || item.equipment === equipmentFilter),
      )
      .slice(0, libraryOpen ? 60 : 8);
  }, [exercises, query, bodyFilter, equipmentFilter, libraryOpen]);

  const builderExercises = builderIds.map((id) => exercises.find((item) => item.id === id)).filter(Boolean) as Exercise[];
  const activeExercises = activePlan
    ? activePlan.exerciseIds.map((id) => exercises.find((item) => item.id === id)).filter(Boolean) as Exercise[]
    : savedPlan
      ? savedPlan.exerciseIds.map((id) => exercises.find((item) => item.id === id)).filter(Boolean) as Exercise[]
      : [];

  function toggleBuilder(id: string) {
    setBuilderIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 12 ? [...current, id] : current);
  }

  function saveCustomPlan() {
    const next = { name: planName.trim() || "My training week", exerciseIds: builderIds };
    localStorage.setItem("form1324-plan", JSON.stringify(next));
    setSavedPlan(next);
    setActivePlan(null);
    document.querySelector("#today")?.scrollIntoView({ behavior: "smooth" });
  }

  function toggleCompleted(id: string) {
    setCompleted((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem("form1324-completed", JSON.stringify(next));
      return next;
    });
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="FORM 1324 home"><span>FORM</span><i>/</i><b>1324</b></a>
        <nav aria-label="Primary navigation">
          <a href="#plans">Plans</a><a href="#library">Exercises</a><a href="#builder">Build your own</a>
        </nav>
        <a className="header-cta" href="#today">My training <span>↗</span></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker"><span /> TRAIN WITH INTENT</p>
          <h1>Build a body<br />that <em>works.</em></h1>
          <p className="hero-sub">Proven plans when you want direction. A deep exercise library when you want control. No noise—just your next good session.</p>
          <div className="hero-actions">
            <a href="#plans" className="button button--primary">Find my plan <span>→</span></a>
            <a href="#builder" className="text-link">Build my own <span>↗</span></a>
          </div>
          <div className="hero-stats">
            <div><strong>1,324</strong><span>exercises</span></div>
            <div><strong>10</strong><span>body areas</span></div>
            <div><strong>30+</strong><span>equipment types</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-orbit hero-orbit--one" /><div className="hero-orbit hero-orbit--two" />
          <ExerciseMedia exercise={exercises.find((exercise) => exercise.id === "0025")} animated />
          <div className="floating-card floating-card--top"><small>TODAY / PUSH</small><strong>6 movements</strong><span>45 min · moderate</span></div>
          <div className="floating-card floating-card--bottom"><div className="pulse-dot" /><span><small>WEEKLY RHYTHM</small><strong>3 of 4 sessions</strong></span></div>
          <span className="visual-label visual-label--chest">CHEST <i /></span>
          <span className="visual-label visual-label--legs">LEGS <i /></span>
        </div>
      </section>

      <section className="plans-section" id="plans">
        <div className="section-heading">
          <div><p className="kicker"><span /> READY-MADE PROGRAMS</p><h2>Pick your path.</h2></div>
          <p>Clear schedules, smart exercise selection, and room to progress. Choose one and start today.</p>
        </div>
        <div className="plans-grid">
          {plans.map((plan, index) => (
            <article className={`plan-card plan-card--${plan.color}`} key={plan.id}>
              <div className="plan-index">0{index + 1}</div><p>{plan.eyebrow}</p><h3>{plan.name}</h3>
              <span className="plan-description">{plan.description}</span>
              <div className="plan-rhythm">
                {Array.from({ length: 7 }).map((_, day) => <i key={day} className={day < plan.days ? "active" : ""}>{["M", "T", "W", "T", "F", "S", "S"][day]}</i>)}
              </div>
              <div className="plan-meta"><span>{plan.days} days / week</span><span>{plan.minutes} min</span><span>{plan.level}</span></div>
              <button onClick={() => { setActivePlan(plan); document.querySelector("#today")?.scrollIntoView({ behavior: "smooth" }); }}>Start this plan <span>→</span></button>
            </article>
          ))}
        </div>
      </section>

      <section className="today-section" id="today">
        <div className="section-heading section-heading--light">
          <div><p className="kicker"><span /> YOUR TRAINING</p><h2>{activePlan?.name ?? savedPlan?.name ?? "Nothing scheduled yet."}</h2></div>
          {activeExercises.length > 0 && (
            <div className="progress-ring"><strong>{Math.round((activeExercises.filter((e) => completed.includes(e.id)).length / activeExercises.length) * 100)}%</strong><span>complete</span></div>
          )}
        </div>
        {activeExercises.length ? (
          <div className="session-list">
            {activeExercises.map((exercise, index) => (
              <button className={`session-row ${completed.includes(exercise.id) ? "is-done" : ""}`} key={exercise.id} onClick={() => toggleCompleted(exercise.id)}>
                <span className="session-check">{completed.includes(exercise.id) ? "✓" : index + 1}</span>
                <ExerciseMedia exercise={exercise} compact />
                <span className="session-name"><strong>{titleCase(exercise.name)}</strong><small>{titleCase(exercise.target)} · {titleCase(exercise.equipment)}</small></span>
                <span className="session-dose">3 × {index % 3 === 0 ? "8" : "12"}</span>
                <span className="session-action">{completed.includes(exercise.id) ? "Done" : "Mark done"}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-training"><span>↗</span><p>Choose a ready-made plan above or build your own below. Your sessions will live here.</p></div>
        )}
      </section>

      <section className="library-section" id="library">
        <div className="section-heading">
          <div><p className="kicker"><span /> EXPLORE THE LIBRARY</p><h2>Know every move.</h2></div>
          <p>Search 1,324 movements by muscle, equipment, or name. Every exercise includes clear technique steps.</p>
        </div>
        <div className="filters">
          <label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search exercises, muscles, targets..." aria-label="Search exercises" /></label>
          <select value={bodyFilter} onChange={(event) => setBodyFilter(event.target.value)} aria-label="Filter by body area">
            <option value="all">All body areas</option>{bodyParts.map((part) => <option key={part} value={part}>{titleCase(part)}</option>)}
          </select>
          <select value={equipmentFilter} onChange={(event) => setEquipmentFilter(event.target.value)} aria-label="Filter by equipment">
            <option value="all">All equipment</option>{equipment.map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}
          </select>
        </div>
        <div className="exercise-grid">
          {filtered.map((exercise) => (
            <article className="exercise-card" key={exercise.id}>
              <button className="exercise-visual" onClick={() => setSelected(exercise)} aria-label={`View ${exercise.name}`}>
                <ExerciseMedia exercise={exercise} animated /><span className="body-pill">{titleCase(exercise.bodyPart)}</span><span className="exercise-number">#{exercise.id}</span>
              </button>
              <div className="exercise-info">
                <small>{titleCase(exercise.equipment)}</small><h3>{titleCase(exercise.name)}</h3><p>Targets {titleCase(exercise.target)}</p>
                <div><button onClick={() => setSelected(exercise)}>View form</button><button className={builderIds.includes(exercise.id) ? "added" : ""} onClick={() => toggleBuilder(exercise.id)} aria-label={`${builderIds.includes(exercise.id) ? "Remove" : "Add"} ${exercise.name}`}>{builderIds.includes(exercise.id) ? "✓" : "+"}</button></div>
              </div>
            </article>
          ))}
        </div>
        <button className="load-more" onClick={() => setLibraryOpen((value) => !value)}>{libraryOpen ? "Show fewer exercises" : "Explore more exercises"} <span>↓</span></button>
      </section>

      <section className="builder-section" id="builder">
        <div className="builder-copy">
          <p className="kicker"><span /> YOUR RULES</p><h2>Build your own.</h2>
          <p>Pick movements from the library, arrange a focused session, and save it on this device.</p>
          <ol><li><span>01</span> Search the exercise library</li><li><span>02</span> Tap + to add movements</li><li><span>03</span> Name it and save your plan</li></ol>
        </div>
        <div className="builder-board">
          <div className="builder-top"><label>PLAN NAME<input value={planName} onChange={(event) => setPlanName(event.target.value)} maxLength={48} /></label><span>{builderIds.length} / 12 MOVEMENTS</span></div>
          <div className="builder-list">
            {builderExercises.length ? builderExercises.map((exercise, index) => (
              <div key={exercise.id}><span className="drag-handle">⋮⋮</span><b>{String(index + 1).padStart(2, "0")}</b><ExerciseMedia exercise={exercise} compact /><p><strong>{titleCase(exercise.name)}</strong><small>{titleCase(exercise.target)} · {titleCase(exercise.equipment)}</small></p><button onClick={() => toggleBuilder(exercise.id)} aria-label={`Remove ${exercise.name}`}>×</button></div>
            )) : (
              <div className="builder-empty"><span>+</span><p>Your plan is waiting.<br /><small>Add exercises from the library above.</small></p></div>
            )}
          </div>
          <button className="save-plan" disabled={!builderIds.length} onClick={saveCustomPlan}>Save my plan <span>→</span></button>
        </div>
      </section>

      <footer>
        <a className="brand brand--footer" href="#top"><span>FORM</span><i>/</i><b>1324</b></a>
        <p>Train with intent. Progress with patience.</p>
        <div>Exercise data and demonstrations from <a href="https://github.com/hasaneyldrm/exercises-dataset" target="_blank" rel="noreferrer">hasaneyldrm/exercises-dataset</a>.<br />Exercise media © <a href="https://gymvisual.com/" target="_blank" rel="noreferrer">Gym visual</a>. Used with visible attribution.</div>
      </footer>

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
          <article className="exercise-modal" role="dialog" aria-modal="true" aria-label={selected.name} onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close exercise details">×</button>
            <div className="modal-visual"><ExerciseMedia exercise={selected} animated /><span>{titleCase(selected.bodyPart)}</span></div>
            <div className="modal-content">
              <p className="kicker"><span /> EXERCISE #{selected.id}</p><h2>{titleCase(selected.name)}</h2>
              <div className="modal-tags"><span>{titleCase(selected.target)}</span><span>{titleCase(selected.equipment)}</span><span>{titleCase(selected.muscleGroup)}</span></div>
              <h3>How to do it</h3>
              <ol>{selected.steps.map((step, index) => <li key={index}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
              <button className="button button--primary" onClick={() => toggleBuilder(selected.id)}>{builderIds.includes(selected.id) ? "Remove from plan" : "Add to my plan"} <span>→</span></button>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}
