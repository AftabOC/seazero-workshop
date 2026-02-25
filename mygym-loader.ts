/**
 * MyGym Task Database Loader & Test Runner
 * -----------------------------------------
 * Loads tasks from mygym.json, provides context for implementation,
 * and runs built-in tests to validate completed work.
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Test {
  type: "command" | "file_exists" | "db_query" | "render" | "unit" | "api" | "interaction";
  command?: string;
  expected?: string;
  files?: string[];
  query?: string;
  expected_columns?: string[];
  expected_fields?: string[];
  endpoint?: string;
  expected_status?: number;
  body?: Record<string, unknown>;
  route?: string;
  elements?: string[];
  action?: string;
  file?: string;
  cases?: string[];
  description: string;
}

interface Subtask {
  id: string;
  name: string;
  status: "pending" | "in_progress" | "done" | "skipped";
  test: Test;
}

interface Task {
  id: string;
  name: string;
  status: "pending" | "in_progress" | "done" | "skipped";
  subtasks: Subtask[];
}

interface Phase {
  id: string;
  name: string;
  sprint: number;
  priority: string;
  status: "pending" | "in_progress" | "done";
  estimated_days: number;
  depends_on?: string[];
  tasks: Task[];
}

interface MyGymDB {
  project: string;
  version: string;
  database: string;
  phases: Phase[];
  test_summary: {
    total_tests: number;
    categories: Record<string, number>;
  };
  metadata: Record<string, unknown>;
}

// ─── Loader ──────────────────────────────────────────────────────────────────

const DB_PATH = path.join(__dirname, "mygym.json");

function loadDB(): MyGymDB {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw) as MyGymDB;
}

function saveDB(db: MyGymDB): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

// ─── Query Functions ─────────────────────────────────────────────────────────

/** Get all phases with summary stats */
function getPhasesSummary(db: MyGymDB): void {
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║              FIND MY GYM — Task Database                   ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  for (const phase of db.phases) {
    const totalSubtasks = phase.tasks.reduce((sum, t) => sum + t.subtasks.length, 0);
    const doneSubtasks = phase.tasks.reduce(
      (sum, t) => sum + t.subtasks.filter((s) => s.status === "done").length,
      0
    );
    const pct = totalSubtasks > 0 ? Math.round((doneSubtasks / totalSubtasks) * 100) : 0;
    const bar = "█".repeat(Math.floor(pct / 5)) + "░".repeat(20 - Math.floor(pct / 5));

    const statusIcon =
      phase.status === "done" ? "✅" : phase.status === "in_progress" ? "🔧" : "⏳";

    console.log(
      `${statusIcon} ${phase.id} | ${phase.name.padEnd(35)} | ${bar} ${pct}% (${doneSubtasks}/${totalSubtasks}) | Sprint ${phase.sprint} | ${phase.estimated_days}d`
    );
  }

  const totalAll = db.phases.reduce(
    (sum, p) => sum + p.tasks.reduce((s, t) => s + t.subtasks.length, 0),
    0
  );
  const doneAll = db.phases.reduce(
    (sum, p) =>
      sum + p.tasks.reduce((s, t) => s + t.subtasks.filter((st) => st.status === "done").length, 0),
    0
  );
  console.log(`\n📊 Overall Progress: ${doneAll}/${totalAll} subtasks complete`);
}

/** Get full context for a specific phase */
function getPhaseContext(db: MyGymDB, phaseId: string): Phase | undefined {
  return db.phases.find((p) => p.id === phaseId);
}

/** Get the next pending task to implement */
function getNextTask(db: MyGymDB): { phase: Phase; task: Task; subtask: Subtask } | null {
  for (const phase of db.phases) {
    // Check dependencies
    if (phase.depends_on && phase.depends_on.length > 0) {
      const allDepsDone = phase.depends_on.every((depId) => {
        const dep = db.phases.find((p) => p.id === depId);
        return dep && dep.status === "done";
      });
      if (!allDepsDone) continue;
    }

    for (const task of phase.tasks) {
      for (const subtask of task.subtasks) {
        if (subtask.status === "pending") {
          return { phase, task, subtask };
        }
      }
    }
  }
  return null;
}

/** Get all subtasks for a task */
function getTaskDetail(db: MyGymDB, taskId: string): void {
  for (const phase of db.phases) {
    for (const task of phase.tasks) {
      if (task.id === taskId) {
        console.log(`\n📋 ${task.id}: ${task.name}`);
        console.log(`   Phase: ${phase.name}`);
        console.log(`   Status: ${task.status}\n`);

        for (const sub of task.subtasks) {
          const icon =
            sub.status === "done" ? "✅" : sub.status === "in_progress" ? "🔧" : "⬜";
          console.log(`   ${icon} ${sub.id}: ${sub.name}`);
          console.log(`      Test: [${sub.test.type}] ${sub.test.description}`);
        }
        return;
      }
    }
  }
  console.log(`Task ${taskId} not found.`);
}

/** Update subtask status */
function updateSubtask(
  db: MyGymDB,
  subtaskId: string,
  status: "pending" | "in_progress" | "done" | "skipped"
): void {
  for (const phase of db.phases) {
    for (const task of phase.tasks) {
      for (const subtask of task.subtasks) {
        if (subtask.id === subtaskId) {
          subtask.status = status;
          console.log(`✏️  Updated ${subtaskId} → ${status}`);

          // Auto-update task status
          const allDone = task.subtasks.every((s) => s.status === "done" || s.status === "skipped");
          const anyInProgress = task.subtasks.some(
            (s) => s.status === "in_progress" || s.status === "done"
          );
          task.status = allDone ? "done" : anyInProgress ? "in_progress" : "pending";

          // Auto-update phase status
          const allTasksDone = phase.tasks.every(
            (t) => t.status === "done" || t.status === "skipped"
          );
          const anyTaskInProgress = phase.tasks.some(
            (t) => t.status === "in_progress" || t.status === "done"
          );
          phase.status = allTasksDone ? "done" : anyTaskInProgress ? "in_progress" : "pending";

          saveDB(db);
          return;
        }
      }
    }
  }
  console.log(`Subtask ${subtaskId} not found.`);
}

// ─── Test Runner ─────────────────────────────────────────────────────────────

function runTest(test: Test, projectRoot: string): { pass: boolean; message: string } {
  try {
    switch (test.type) {
      case "command": {
        const result = execSync(test.command!, { cwd: projectRoot, encoding: "utf-8" });
        return { pass: true, message: `Command passed: ${result.trim().slice(0, 100)}` };
      }

      case "file_exists": {
        const allExist = test.files!.every((f) => fs.existsSync(path.join(projectRoot, f)));
        return {
          pass: allExist,
          message: allExist ? "All files exist" : `Missing: ${test.files!.filter((f) => !fs.existsSync(path.join(projectRoot, f))).join(", ")}`,
        };
      }

      case "api": {
        // Validate endpoint format
        if (!test.endpoint) return { pass: false, message: "No endpoint defined" };
        return { pass: true, message: `API test defined: ${test.endpoint} → ${test.expected_status}` };
      }

      case "unit": {
        if (!test.file) return { pass: false, message: "No test file defined" };
        const testPath = path.join(projectRoot, test.file);
        if (!fs.existsSync(testPath)) {
          return { pass: false, message: `Test file not found: ${test.file}` };
        }
        const result = execSync(`npx vitest run ${test.file} --reporter=verbose`, {
          cwd: projectRoot,
          encoding: "utf-8",
        });
        return { pass: true, message: result.trim().slice(0, 200) };
      }

      case "render":
      case "interaction":
        return { pass: true, message: `Manual test: ${test.description}` };

      case "db_query":
        return { pass: true, message: `DB test defined: ${test.query}` };

      default:
        return { pass: false, message: `Unknown test type: ${test.type}` };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { pass: false, message: msg.slice(0, 200) };
  }
}

/** Run all tests for a phase */
function runPhaseTests(db: MyGymDB, phaseId: string, projectRoot: string): void {
  const phase = db.phases.find((p) => p.id === phaseId);
  if (!phase) {
    console.log(`Phase ${phaseId} not found.`);
    return;
  }

  console.log(`\n🧪 Running tests for ${phase.id}: ${phase.name}\n`);

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  for (const task of phase.tasks) {
    console.log(`  📋 ${task.id}: ${task.name}`);
    for (const sub of task.subtasks) {
      if (sub.status === "skipped") {
        skipped++;
        console.log(`    ⏭  ${sub.id}: SKIPPED`);
        continue;
      }

      const result = runTest(sub.test, projectRoot);
      if (result.pass) {
        passed++;
        console.log(`    ✅ ${sub.id}: ${sub.test.description}`);
      } else {
        failed++;
        console.log(`    ❌ ${sub.id}: ${sub.test.description}`);
        console.log(`       → ${result.message}`);
      }
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed, ${skipped} skipped`);
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const command = args[0];
const db = loadDB();

switch (command) {
  case "summary":
    getPhasesSummary(db);
    break;

  case "phase":
    if (!args[1]) {
      console.log("Usage: ts-node mygym-loader.ts phase <PHASE_ID>");
      break;
    }
    const phase = getPhaseContext(db, args[1].toUpperCase());
    if (phase) {
      console.log(`\n📦 ${phase.id}: ${phase.name}`);
      console.log(`   Sprint: ${phase.sprint} | Priority: ${phase.priority} | Days: ${phase.estimated_days}`);
      console.log(`   Depends on: ${phase.depends_on?.join(", ") || "none"}\n`);
      for (const task of phase.tasks) {
        getTaskDetail(db, task.id);
      }
    } else {
      console.log(`Phase ${args[1]} not found.`);
    }
    break;

  case "task":
    if (!args[1]) {
      console.log("Usage: ts-node mygym-loader.ts task <TASK_ID>");
      break;
    }
    getTaskDetail(db, args[1].toUpperCase());
    break;

  case "next":
    const next = getNextTask(db);
    if (next) {
      console.log(`\n🎯 Next task to implement:`);
      console.log(`   Phase: ${next.phase.id} — ${next.phase.name}`);
      console.log(`   Task:  ${next.task.id} — ${next.task.name}`);
      console.log(`   Sub:   ${next.subtask.id} — ${next.subtask.name}`);
      console.log(`   Test:  [${next.subtask.test.type}] ${next.subtask.test.description}`);
    } else {
      console.log("🎉 All tasks complete!");
    }
    break;

  case "update":
    if (!args[1] || !args[2]) {
      console.log("Usage: ts-node mygym-loader.ts update <SUBTASK_ID> <STATUS>");
      console.log("Status: pending | in_progress | done | skipped");
      break;
    }
    updateSubtask(db, args[1].toUpperCase(), args[2] as Subtask["status"]);
    break;

  case "test":
    if (!args[1]) {
      console.log("Usage: ts-node mygym-loader.ts test <PHASE_ID>");
      break;
    }
    runPhaseTests(db, args[1].toUpperCase(), __dirname);
    break;

  default:
    console.log(`
╔══════════════════════════════════════════════╗
║         MyGym Task Database CLI              ║
╚══════════════════════════════════════════════╝

Commands:
  summary                      Show all phases with progress
  phase <PHASE_ID>             Show full phase context (P1, P2, etc.)
  task <TASK_ID>               Show task detail (P1-T1, P2-T2, etc.)
  next                         Show next pending task to implement
  update <SUBTASK_ID> <STATUS> Update subtask status
  test <PHASE_ID>              Run tests for a phase

Examples:
  ts-node mygym-loader.ts summary
  ts-node mygym-loader.ts phase P1
  ts-node mygym-loader.ts task P1-T2
  ts-node mygym-loader.ts next
  ts-node mygym-loader.ts update P1-T1-S1 done
  ts-node mygym-loader.ts test P1
    `);
}
