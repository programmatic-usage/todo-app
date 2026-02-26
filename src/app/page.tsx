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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-100 px-4 py-12 text-zinc-900">
      <main className="mx-auto w-full max-w-2xl">
        <div className="rounded-3xl border border-amber-200/70 bg-white/90 p-8 shadow-2xl shadow-amber-200/40 backdrop-blur">
          <header className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Minimal TODO
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Keep tasks calm, focused, and delightful.
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
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
              className="flex-1 rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
            <button
              type="submit"
              className="rounded-2xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-600/20 transition hover:bg-amber-500"
            >
              Add task
            </button>
          </form>

          <section className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-zinc-500">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
                  {stats.remaining} remaining
                </span>
                <span>{stats.completed} completed</span>
              </div>
              <button
                type="button"
                onClick={clearCompleted}
                className="text-zinc-600 transition hover:text-amber-700"
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
                      ? "bg-amber-600 text-white shadow-sm"
                      : "border border-amber-200 text-zinc-500 hover:text-amber-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <ul className="space-y-3">
              {filteredTodos.length === 0 ? (
                <li className="rounded-2xl border border-dashed border-amber-200 px-4 py-6 text-center text-sm text-zinc-400">
                  Nothing here yet. Add a task to get started.
                </li>
              ) : (
                filteredTodos.map((todo) => (
                  <li
                    key={todo.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200/70 bg-white px-4 py-3 shadow-sm transition hover:border-amber-300"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleTodo(todo.id)}
                        aria-pressed={todo.completed}
                        className={`flex h-6 w-6 items-center justify-center rounded-full border transition ${
                          todo.completed
                            ? "border-amber-600 bg-amber-600 text-white"
                            : "border-amber-300 text-transparent hover:border-amber-500"
                        }`}
                      >
                        <span className="text-xs">✓</span>
                      </button>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            todo.completed
                              ? "text-zinc-400 line-through"
                              : "text-zinc-900"
                          }`}
                        >
                          {todo.text}
                        </p>
                        <p className="text-xs text-zinc-400">
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
                      className="rounded-full px-3 py-1 text-xs font-semibold text-zinc-400 transition hover:bg-amber-50 hover:text-amber-700"
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
