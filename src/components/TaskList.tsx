"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import type { Task } from "@/server/db";

interface TaskListPage {
  items: Task[];
  nextCursor: number | undefined;
  total: number;
}

interface TaskListProps {
  initialData: TaskListPage;
  pageSize: number;
}

export function TaskList({ initialData, pageSize }: TaskListProps) {
  const utils = trpc.useUtils();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const query = trpc.task.list.useInfiniteQuery(
    { limit: pageSize },
    {
      // Hydrates the first page with the result that already came from
      // SSR, avoiding a duplicate fetch as soon as the page loads on the client.
      initialData: () => ({
        pages: [initialData],
        pageParams: [0],
      }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const deleteMutation = trpc.task.delete.useMutation({
    onMutate: (variables) => {
      setDeletingId(variables.id);
      setFeedback(null);
    },
    onSuccess: async (removed) => {
      setFeedback({
        type: "success",
        message: `Task "${removed?.titulo}" was successfully deleted.`,
      });
      await utils.task.list.invalidate();
    },
    onError: (error) => {
      setFeedback({
        type: "error",
        message: `Error deleting task: ${error.message}`,
      });
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const tasks = query.data?.pages.flatMap((page) => page.items) ?? [];

  // --- Infinite scroll: observes a sentinel element at the end of the list ---
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry.isIntersecting &&
          query.hasNextPage &&
          !query.isFetchingNextPage
        ) {
          query.fetchNextPage();
        }
      },
      { rootMargin: "200px" } // starts loading a bit before reaching the end
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.hasNextPage, query.isFetchingNextPage, tasks.length]);

  function handleDelete(task: Task) {
    if (!confirm(`Delete task "${task.titulo}"?`)) return;
    deleteMutation.mutate({ id: task.id });
  }

  return (
    <div>
      {feedback && (
        <div
          className={
            feedback.type === "success" ? "alert alert-success" : "alert alert-error"
          }
          role="status"
        >
          {feedback.message}
        </div>
      )}

      {query.isError && (
        <div className="alert alert-error">
          Error loading tasks: {query.error.message}
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="empty-state">
          No tasks yet. Create the first one!
        </div>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={
                deletingId === task.id ? "task-card removing" : "task-card"
              }
            >
              <div className="task-info">
                <p className="task-title">{task.titulo}</p>
                {task.descricao && (
                  <p className="task-desc">{task.descricao}</p>
                )}
                <p className="task-date">
                  Created on {formatDate(task.dataCriacao)}
                </p>
              </div>
              <div className="task-actions">
                <Link
                  href={`/tasks/${task.id}/edit`}
                  className="btn btn-secondary"
                >
                  Edit
                </Link>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(task)}
                  disabled={deleteMutation.isPending && deletingId === task.id}
                >
                  {deleteMutation.isPending && deletingId === task.id
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Invisible sentinel that triggers loading of the next page */}
      <div ref={sentinelRef} />

      {query.isFetchingNextPage && (
        <p className="loading-more">Loading more tasks...</p>
      )}
      {!query.hasNextPage && tasks.length > 0 && (
        <p className="loading-more">All tasks have been loaded.</p>
      )}
    </div>
  );
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
