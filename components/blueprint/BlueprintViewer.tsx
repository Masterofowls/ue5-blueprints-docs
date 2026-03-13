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
      {/* Blueprint Visual Representation */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Interactive Blueprint Editor
        </h3>
        <InteractiveBlueprintEditor
          nodes={blueprint.nodes}
          connections={blueprint.connections}
          readonly={false}
        />
      </div>

      {/* Copy Code Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <label
              htmlFor="blueprint-code"
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              Blueprint Code (Copy & Paste into Unreal Engine)
            </label>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
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
              className="w-full h-64 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
