import Link from "next/link";
import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { createServerCaller } from "@/trpc/server";
import { TaskForm } from "@/components/TaskForm";

export const dynamic = "force-dynamic";

interface EditTaskPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = await params;
  const caller = await createServerCaller();

  try {
    const task = await caller.task.getById({ id });

    return (
      <>
        <Link href="/" className="back-link">
          ← Back to list
        </Link>
        <h1>Edit Task</h1>
        <p className="subtitle">Update the task details below.</p>
        <TaskForm
          mode="edit"
          taskId={task.id}
          initialValues={{ titulo: task.titulo, descricao: task.descricao }}
        />
      </>
    );
  } catch (error) {
    // Task not found (e.g. invalid id or already deleted) -> 404 page.
    if (error instanceof TRPCError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }
}
