import Link from "next/link";
import { TaskForm } from "@/components/TaskForm";

export default function NewTaskPage() {
  return (
    <>
      <Link href="/" className="back-link">
        ← Back to list
      </Link>
      <h1>New Task</h1>
      <p className="subtitle">Fill in the details below to create a task.</p>
      <TaskForm mode="create" />
    </>
  );
}
