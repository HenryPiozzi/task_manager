"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { TRPCClientErrorLike } from "@trpc/client";
import { trpc } from "@/trpc/client";
import type { AppRouter } from "@/server/routers/_app";

interface TaskFormProps {
  mode: "create" | "edit";
  taskId?: string;
  initialValues?: { titulo: string; descricao?: string };
}

interface FormErrors {
  titulo?: string;
  descricao?: string;
  geral?: string;
}

export function TaskForm({ mode, taskId, initialValues }: TaskFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [titulo, setTitulo] = useState(initialValues?.titulo ?? "");
  const [descricao, setDescricao] = useState(initialValues?.descricao ?? "");
  const [errors, setErrors] = useState<FormErrors>({});

  const createMutation = trpc.task.create.useMutation({
    onSuccess: async () => {
      await utils.task.list.invalidate();
      router.push("/");
    },
    onError: (error) => handleMutationError(error),
  });

  const updateMutation = trpc.task.update.useMutation({
    onSuccess: async () => {
      await utils.task.list.invalidate();
      router.push("/");
    },
    onError: (error) => handleMutationError(error),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Translates validation errors coming from the backend (Zod, via tRPC)
  // into form field errors. Also handles "general" errors (e.g. NOT_FOUND).
  function handleMutationError(error: TRPCClientErrorLike<AppRouter>) {
    const fieldErrors = error.data?.zodError?.fieldErrors as
      | Record<string, string[]>
      | undefined;
    if (fieldErrors) {
      setErrors({
        titulo: fieldErrors.titulo?.[0],
        descricao: fieldErrors.descricao?.[0],
      });
    } else {
      setErrors({ geral: error.message });
    }
  }

  function validateClientSide(): boolean {
    const nextErrors: FormErrors = {};
    if (!titulo.trim()) {
      nextErrors.titulo = "Title is required.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});

    // Frontend validation, in addition to backend validation (defense in
    // depth): prevents submission before even calling the API.
    if (!validateClientSide()) return;

    const payload = {
      titulo: titulo.trim(),
      descricao: descricao.trim() || undefined,
    };

    if (mode === "create") {
      createMutation.mutate(payload);
    } else if (taskId) {
      updateMutation.mutate({ id: taskId, ...payload });
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errors.geral && <div className="alert alert-error">{errors.geral}</div>}

      <div className="form-group">
        <label htmlFor="titulo">Title *</label>
        <input
          id="titulo"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="E.g.: Review sales proposal"
          disabled={isPending}
        />
        {errors.titulo && <p className="field-error">{errors.titulo}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="descricao">Description (optional)</label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Additional details about the task..."
          disabled={isPending}
        />
        {errors.descricao && (
          <p className="field-error">{errors.descricao}</p>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending
            ? "Saving..."
            : mode === "create"
              ? "Create Task"
              : "Save Changes"}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => router.push("/")}
          disabled={isPending}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
