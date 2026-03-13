"use client";

import React, { useRef } from "react";
import type { Blueprint } from "@/lib/types/blueprint";
import dynamic from "next/dynamic";

// Dynamically import the interactive editor to avoid SSR issues
const InteractiveBlueprintEditor = dynamic(
  () => import("./InteractiveBlueprintEditor"),
  { ssr: false },
);

interface BlueprintViewerProps {
  blueprint: Blueprint;
}

export default function BlueprintViewer({ blueprint }: BlueprintViewerProps) {
  const codeRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (codeRef.current) {
      try {
        await navigator.clipboard.writeText(blueprint.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text:", err);
      }
    }
  };

  const handleManualCopy = () => {
    if (codeRef.current) {
      codeRef.current.select();
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="blueprint-viewer">
      <div className="mb-8">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 sm:text-xl dark:text-white">
          Interactive Blueprint Editor
        </h3>
        <InteractiveBlueprintEditor
          nodes={blueprint.nodes}
          connections={blueprint.connections}
          comments={blueprint.editorComments}
          readonly={false}
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label
              htmlFor="blueprint-code"
              className="text-base font-semibold text-gray-900 sm:text-lg dark:text-white"
            >
              Blueprint Code (Copy & Paste into Unreal Engine)
            </label>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 sm:min-h-10 sm:w-auto"
            >
              {copied ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <title>Copied</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <title>Copy code</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy Code
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <textarea
              ref={codeRef}
              id="blueprint-code"
              readOnly
              value={blueprint.code}
              className="h-56 w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-xs focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 sm:h-64 sm:p-4 sm:text-sm"
              onClick={handleManualCopy}
            />
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              <strong>How to use:</strong> Copy this code and paste it directly
              into your Unreal Engine 5 blueprint editor.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
