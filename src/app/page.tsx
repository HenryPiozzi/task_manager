import Link from "next/link";
import { createServerCaller } from "@/trpc/server";
import { TaskList } from "@/components/TaskList";

// Ensures the page always fetches data on the server for every request
// ("pure" SSR) instead of using a static cache — important because tasks
// change frequently (create/edit/delete).
export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

export default async function HomePage() {
  const caller = await createServerCaller();

  // SSR: the first page of tasks is already ready in the initial HTML,
  // with no loading flash on first load.
  const initialData = await caller.task.list({ limit: PAGE_SIZE, cursor: 0 });

  return (
    <>
      <div className="toolbar">
        <div>
          <h1>My Tasks</h1>
          <p className="subtitle">
            {initialData.total} task{initialData.total === 1 ? "" : "s"} in
            total
          </p>
        </div>
        <Link href="/tasks/new" className="btn btn-primary">
          + New Task
        </Link>
      </div>

      <TaskList initialData={initialData} pageSize={PAGE_SIZE} />
    </>
  );
}
