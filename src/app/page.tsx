"use client";

import { useEffect, useMemo, useState } from "react";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

type Filter = "all" | "active" | "completed";

const STORAGE_KEY = "minimal-pretty-todos";

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const loadTodos = (): Todo[] => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as Todo[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (todo) =>
        typeof todo.id === "string" &&
        typeof todo.text === "string" &&
        typeof todo.completed === "boolean" &&
        typeof todo.createdAt === "number"
    );
  } catch {
    return [];
  }
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    setTodos(loadTodos());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((todo) => todo.completed).length;
    return { total, completed, remaining: total - completed };
  }, [todos]);

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((todo) => !todo.completed);
      case "completed":
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  }, [filter, todos]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const nextTodo: Todo = {
      id: createId(),
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
    };
    setTodos((prev) => [nextTodo, ...prev]);
    setText("");
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 px-4 py-12 text-zinc-900 dark:from-zinc-950 dark:via-black dark:to-zinc-900 dark:text-zinc-50">
      <main className="mx-auto w-full max-w-2xl">
        <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-8 shadow-2xl shadow-zinc-200/40 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/80 dark:shadow-black/60">
          <header className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white dark:bg-white dark:text-zinc-900">
              Minimal TODO
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Keep tasks calm, focused, and delightful.
              </h1>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Everything stays locally on your device. No accounts, no clutter.
              </p>
            </div>
          </header>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <label className="sr-only" htmlFor="todo-input">
              Add a task
            </label>
            <input
              id="todo-input"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Add something meaningful..."
              className="flex-1 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-800 dark:bg-zinc-900/60 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/20"
            />
            <button
              type="submit"
              className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-zinc-900/20 transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              Add task
            </button>
          </form>

          <section className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                  {stats.remaining} remaining
                </span>
                <span>{stats.completed} completed</span>
              </div>
              <button
                type="button"
                onClick={clearCompleted}
                className="text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Clear completed
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {([
                { key: "all", label: "All" },
                { key: "active", label: "Active" },
                { key: "completed", label: "Completed" },
              ] as const).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    filter === item.key
                      ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900"
                      : "border border-zinc-200 text-zinc-500 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <ul className="space-y-3">
              {filteredTodos.length === 0 ? (
                <li className="rounded-2xl border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
                  Nothing here yet. Add a task to get started.
                </li>
              ) : (
                filteredTodos.map((todo) => (
                  <li
                    key={todo.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200/70 bg-white px-4 py-3 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleTodo(todo.id)}
                        aria-pressed={todo.completed}
                        className={`flex h-6 w-6 items-center justify-center rounded-full border transition ${
                          todo.completed
                            ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                            : "border-zinc-300 text-transparent hover:border-zinc-500 dark:border-zinc-700 dark:hover:border-zinc-500"
                        }`}
                      >
                        <span className="text-xs">✓</span>
                      </button>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            todo.completed
                              ? "text-zinc-400 line-through dark:text-zinc-500"
                              : "text-zinc-900 dark:text-zinc-100"
                          }`}
                        >
                          {todo.text}
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">
                          {new Date(todo.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteTodo(todo.id)}
                      className="rounded-full px-3 py-1 text-xs font-semibold text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                      Remove
                    </button>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
