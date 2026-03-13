"use client";

import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { categories } from "@/lib/data/categories";
import { parseBlueprintCode } from "@/lib/blueprint/parse-blueprint-code";
import {
  createBlueprintNoteId,
  saveBlueprintNote,
} from "@/lib/blueprint/user-blueprints";
import type { Blueprint, BlueprintCategory } from "@/lib/types/blueprint";

const InteractiveBlueprintEditor = dynamic(
  () => import("@/components/blueprint/InteractiveBlueprintEditor"),
  { ssr: false },
);

export default function NewBlueprintNotePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<BlueprintCategory>("utilities");
  const [difficulty, setDifficulty] =
    useState<Blueprint["difficulty"]>("intermediate");
  const [ueVersion, setUeVersion] = useState("5.7");
  const [tags, setTags] = useState("notes, generated");
  const [author, setAuthor] = useState("Local Author");
  const [code, setCode] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const deferredCode = useDeferredValue(code);
  const [parsed, setParsed] = useState(() => parseBlueprintCode(""));

  useEffect(() => {
    startTransition(() => {
      setParsed(parseBlueprintCode(deferredCode));
    });
  }, [deferredCode]);

  useEffect(() => {
    if (!title.trim() && parsed.suggestedTitle !== "Untitled Blueprint Note") {
      setTitle(parsed.suggestedTitle);
    }
  }, [parsed.suggestedTitle, title]);

  const previewBlueprint: Blueprint = {
    id: "preview-note",
    title: title.trim() || parsed.suggestedTitle,
    description:
      description.trim() ||
      "Generated from pasted Blueprint Code. Save this note to keep the interactive graph locally.",
    category,
    difficulty,
    ueVersion,
    tags: normalizeTags(tags),
    author: author.trim() || "Local Author",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    code,
    nodes: parsed.nodes,
    connections: parsed.connections,
  };

  const canSave = parsed.nodes.length > 0 && code.trim().length > 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!canSave) {
      setSubmitError("Paste valid Blueprint Code before saving a note.");
      return;
    }

    setIsSaving(true);

    const now = new Date().toISOString();
    const blueprint: Blueprint = {
      ...previewBlueprint,
      id: createBlueprintNoteId(title.trim() || parsed.suggestedTitle),
      title: title.trim() || parsed.suggestedTitle,
      description:
        description.trim() ||
        "Generated from pasted Blueprint Code and stored as a local blueprint note.",
      createdAt: now,
      updatedAt: now,
    };

    saveBlueprintNote(blueprint);
    router.push(`/blueprints/${blueprint.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_32%),linear-gradient(135deg,#0f172a,#1d4ed8)] py-16 text-white">
        <div className="container mx-auto px-4">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Post A Blueprint Note
          </h1>
          <p className="max-w-3xl text-xl text-blue-50">
            Paste Unreal Blueprint Code, let the app generate the interactive
            viewport, then save the note locally for browsing, search, and
            revisit on this device.
          </p>
        </div>
      </div>

      <div className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="grid gap-4">
            <Field label="Title">
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="My Interaction Blueprint"
                className={inputClassName}
              />
            </Field>

            <Field label="Description">
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                placeholder="What this blueprint does and why the note exists."
                className={`${inputClassName} resize-y`}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Category">
                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as BlueprintCategory)
                  }
                  className={inputClassName}
                >
                  {categories.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Difficulty">
                <select
                  value={difficulty}
                  onChange={(event) =>
                    setDifficulty(event.target.value as Blueprint["difficulty"])
                  }
                  className={inputClassName}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="UE Version">
                <input
                  type="text"
                  value={ueVersion}
                  onChange={(event) => setUeVersion(event.target.value)}
                  className={inputClassName}
                />
              </Field>

              <Field label="Author">
                <input
                  type="text"
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  className={inputClassName}
                />
              </Field>
            </div>

            <Field label="Tags">
              <input
                type="text"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="interaction, notes, prototype"
                className={inputClassName}
              />
            </Field>

            <Field label="Blueprint Code">
              <textarea
                value={code}
                onChange={(event) => setCode(event.target.value)}
                rows={16}
                placeholder="Paste copied Unreal Blueprint text here..."
                className={`${inputClassName} font-mono text-sm resize-y`}
              />
            </Field>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-100">
              <p className="font-semibold">Auto-generation</p>
              <p className="mt-1">
                The preview updates from the pasted text. If pin link metadata
                exists, connections are generated automatically. Otherwise the
                graph still renders the discovered nodes and positions.
              </p>
            </div>

            {submitError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                {submitError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!canSave || isSaving}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isSaving ? "Saving..." : "Save Blueprint Note"}
            </button>
          </div>
        </form>

        <div className="space-y-6">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Interactive Preview
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {parsed.nodes.length} nodes, {parsed.connections.length}{" "}
                  connections
                </p>
              </div>
            </div>

            {parsed.nodes.length > 0 ? (
              <InteractiveBlueprintEditor
                nodes={previewBlueprint.nodes}
                connections={previewBlueprint.connections}
                comments={previewBlueprint.editorComments}
                readonly={false}
              />
            ) : (
              <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-center text-gray-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
                Paste Blueprint Code to generate the viewport.
              </div>
            )}
          </section>

          {parsed.issues.length > 0 ? (
            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/40 dark:bg-amber-950/30">
              <h3 className="mb-3 text-lg font-semibold text-amber-900 dark:text-amber-100">
                Parser Notes
              </h3>
              <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                {parsed.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
        {label}
      </span>
      {children}
    </div>
  );
}

function normalizeTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

const inputClassName =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-900";
