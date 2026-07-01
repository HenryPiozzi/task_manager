/**
 * In-memory "database" for tasks.
 *
 * Design decision: since the challenge does not require real persistence,
 * we keep an in-memory array inside the Node.js server process. This is
 * enough to demonstrate the CRUD operations via tRPC, but it has an
 * important limitation: data is lost on every server restart (and in
 * serverless/edge environments with multiple instances, each instance
 * would have its own state). In production, this would be replaced by
 * a real database (Postgres, SQLite, etc.).
 */

export interface Task {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: number; // timestamp (Date.now())
}

// We use globalThis to survive Next.js hot-reload in dev mode
// (without this, every recompilation would recreate the array and we
// would "lose" tasks even without actually restarting the server).
const globalForStore = globalThis as unknown as {
  __tasks?: Task[];
};

function seedTasks(): Task[] {
  const now = Date.now();
  return [
    {
      id: crypto.randomUUID(),
      titulo: "Set up NextJS + tRPC project",
      descricao: "Initial structure for the technical challenge",
      dataCriacao: now - 1000 * 60 * 60 * 3,
    },
    {
      id: crypto.randomUUID(),
      titulo: "Implement task CRUD",
      descricao: "Create, list, update and delete via tRPC",
      dataCriacao: now - 1000 * 60 * 60 * 2,
    },
    {
      id: crypto.randomUUID(),
      titulo: "Review form validations",
      dataCriacao: now - 1000 * 60 * 30,
    },
  ];
}

export const tasksStore: Task[] = globalForStore.__tasks ?? seedTasks();
globalForStore.__tasks = tasksStore;
