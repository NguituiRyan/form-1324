import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const source = process.argv[2];
if (!source) throw new Error("Pass the source exercises.json path.");

const records = JSON.parse(await readFile(source, "utf8"));
const compact = records.map((exercise) => ({
  id: exercise.id,
  name: exercise.name,
  bodyPart: exercise.body_part,
  equipment: exercise.equipment,
  target: exercise.target,
  muscleGroup: exercise.muscle_group,
  secondaryMuscles: exercise.secondary_muscles ?? [],
  steps: exercise.instruction_steps?.en ?? [],
}));

const output = resolve("public/data/exercises.json");
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(compact));
console.log(`Wrote ${compact.length} exercises to ${output}`);
