"use client";

import React from "react";
import type { BlueprintNode, Connection } from "@/lib/types/blueprint";

interface BlueprintCanvasProps {
  nodes: BlueprintNode[];
  connections: Connection[];
}

const nodeColors: Record<string, { bg: string; border: string; text: string }> =
  {
    event: { bg: "bg-red-600", border: "border-red-700", text: "text-white" },
    "function-call": {
      bg: "bg-blue-600",
      border: "border-blue-700",
      text: "text-white",
    },
    "variable-get": {
      bg: "bg-green-600",
      border: "border-green-700",
      text: "text-white",
    },
    "variable-set": {
      bg: "bg-green-700",
      border: "border-green-800",
      text: "text-white",
    },
    cast: {
      bg: "bg-purple-600",
      border: "border-purple-700",
      text: "text-white",
    },
    branch: {
      bg: "bg-gray-700",
      border: "border-gray-800",
      text: "text-white",
    },
    array: {
      bg: "bg-yellow-600",
      border: "border-yellow-700",
      text: "text-white",
    },
    macro: {
      bg: "bg-indigo-600",
      border: "border-indigo-700",
      text: "text-white",
    },
    comment: {
      bg: "bg-gray-800/40",
      border: "border-gray-600",
      text: "text-gray-300",
    },
  };

const pinColors: Record<string, string> = {
  exec: "bg-white",
  bool: "bg-red-500",
  int: "bg-cyan-500",
  float: "bg-green-500",
  string: "bg-pink-500",
  object: "bg-blue-500",
  struct: "bg-indigo-500",
  array: "bg-orange-500",
  delegate: "bg-purple-500",
};

export default function BlueprintCanvas({
  nodes,
  connections,
}: BlueprintCanvasProps) {
  const svgRef = React.useRef<SVGSVGElement>(null);

  // Calculate bounding box for all nodes
  const getBoundingBox = () => {
    if (nodes.length === 0) return { minX: 0, minY: 0, maxX: 800, maxY: 600 };

    const positions = nodes.map((n) => n.position);
    const minX = Math.min(...positions.map((p) => p.x)) - 50;
    const minY = Math.min(...positions.map((p) => p.y)) - 50;
    const maxX = Math.max(...positions.map((p) => p.x)) + 350;
    const maxY = Math.max(...positions.map((p) => p.y)) + 200;

    return { minX, minY, maxX, maxY };
  };

  const { minX, minY, maxX, maxY } = getBoundingBox();
  const width = maxX - minX;

  return (
    <div className="relative w-full overflow-x-auto">
      <div
        className="bg-gray-900 rounded-lg p-4 min-h-[500px] relative"
        style={{ minWidth: `${width}px` }}
      >
        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* SVG for connections */}
        <svg
          ref={svgRef}
          className="absolute inset-0 pointer-events-none"
          style={{ width: "100%", height: "100%" }}
        >
          {connections.map((conn) => {
            const fromNode = nodes.find((n) => n.id === conn.from.nodeId);
            const toNode = nodes.find((n) => n.id === conn.to.nodeId);

            if (!fromNode || !toNode) return null;

            const fromPin = fromNode.pins.find((p) => p.id === conn.from.pinId);
            const toPin = toNode.pins.find((p) => p.id === conn.to.pinId);

            // Calculate connection points
            const x1 = fromNode.position.x - minX + 280;
            const y1 = fromNode.position.y - minY + 50;
            const x2 = toNode.position.x - minX + 20;
            const y2 = toNode.position.y - minY + 50;

            // Bezier curve control points
            const dx = (x2 - x1) * 0.5;

            const isExec = fromPin?.type === "exec" || toPin?.type === "exec";
            const strokeColor = isExec ? "#ffffff" : "#88ff88";
            const strokeWidth = isExec ? 3 : 2;

            return (
              <path
                key={conn.id}
                d={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                opacity={0.8}
              />
            );
          })}
        </svg>

        {/* Blueprint Nodes */}
        <div className="relative">
          {nodes.map((node) => {
            const colors = nodeColors[node.type] || nodeColors["function-call"];
            const inputPins = node.pins.filter((p) => p.direction === "input");
            const outputPins = node.pins.filter(
              (p) => p.direction === "output",
            );

            return (
              <div
                key={node.id}
                className="absolute"
                style={{
                  left: `${node.position.x - minX}px`,
                  top: `${node.position.y - minY}px`,
                }}
              >
                <div
                  className={`${colors.bg} ${colors.border} border-2 rounded shadow-lg min-w-[260px]`}
                >
                  {/* Node Header */}
                  <div
                    className={`px-3 py-2 ${colors.text} font-semibold text-sm`}
                  >
                    {node.name}
                  </div>

                  {/* Node Body */}
                  <div className="bg-gray-800 p-2 space-y-1">
                    {/* Input Pins */}
                    {inputPins.map((pin) => (
                      <div
                        key={pin.id}
                        className="flex items-center gap-2 text-xs"
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${pinColors[pin.type]} border border-white`}
                        />
                        <span className="text-gray-300">{pin.name}</span>
                      </div>
                    ))}

                    {/* Output Pins */}
                    {outputPins.map((pin) => (
                      <div
                        key={pin.id}
                        className="flex items-center justify-end gap-2 text-xs"
                      >
                        <span className="text-gray-300">{pin.name}</span>
                        <div
                          className={`w-3 h-3 rounded-full ${pinColors[pin.type]} border border-white`}
                        />
                      </div>
                    ))}
                  </div>

                  {node.comment && (
                    <div className="px-3 py-1 bg-gray-700 text-gray-400 text-xs italic border-t border-gray-600">
                      {node.comment}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-white"></div>
          <span className="text-gray-400">Execution</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-400">Boolean</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
          <span className="text-gray-400">Integer</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-400">Float</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-400">Object</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pink-500"></div>
          <span className="text-gray-400">String</span>
        </div>
      </div>
    </div>
  );
}
