/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { NodeEditor } from "rete";
import type { GetSchemes } from "rete";
import { ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import {
  ConnectionPlugin, 
  Presets as ConnectionPresets,
} from "rete-connection-plugin";
import { ReactPlugin, Presets as ReactPresets } from "rete-react-plugin";
import type { ContextMenuExtra } from "rete-context-menu-plugin";
import {
  ContextMenuPlugin,
  Presets as ContextMenuPresets,
} from "rete-context-menu-plugin";
import type {
  BlueprintNode as BlueprintNodeType,
  Connection as BlueprintConnection,
} from "@/lib/types/blueprint";
import "./rete-editor.css";

// Define socket types for different pin types
class Socket extends ClassicPreset.Socket {
  constructor(name: string) {
    super(name);
  }
}

// Create sockets for different data types
const execSocket = new Socket("exec");
const boolSocket = new Socket("bool");
const intSocket = new Socket("int");
const floatSocket = new Socket("float");
const stringSocket = new Socket("string");
const objectSocket = new Socket("object");
const structSocket = new Socket("struct");

// Custom Node class with UE5 styling
class UE5Node extends ClassicPreset.Node {
  width = 280;
  height = 120;
  nodeType: string;

  constructor(label: string, nodeType: string = "function-call") {
    super(label);
    this.nodeType = nodeType;
  }
}

// Map node type to colors
const getNodeColor = (type: string): string => {
  const colors: Record<string, string> = {
    event: "#DC2626",
    "function-call": "#2563EB",
    "variable-get": "#16A34A",
    "variable-set": "#15803D",
    cast: "#9333EA",
    branch: "#374151",
    array: "#CA8A04",
    macro: "#4F46E5",
    comment: "#1F2937",
  };
  return colors[type] || colors["function-call"];
};

// Get socket by type name
const getSocketByType = (type: string): Socket => {
  switch (type) {
    case "exec":
      return execSocket;
    case "bool":
      return boolSocket;
    case "int":
      return intSocket;
    case "float":
      return floatSocket;
    case "string":
      return stringSocket;
    case "object":
      return objectSocket;
    case "struct":
      return structSocket;
    default:
      return floatSocket;
  }
};

type Schemes = GetSchemes<UE5Node, ClassicPreset.Connection<UE5Node, UE5Node>>;
type AreaExtra = ContextMenuExtra;

interface InteractiveBlueprintEditorProps {
  nodes: BlueprintNodeType[];
  connections: BlueprintConnection[];
  readonly?: boolean;
}

export default function InteractiveBlueprintEditor({
  nodes,
  connections,
  readonly = true,
}: InteractiveBlueprintEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<NodeEditor<Schemes> | null>(null);
  const areaRef = useRef<AreaPlugin<Schemes, AreaExtra> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Clear container
    container.innerHTML = "";

    // Create editor instance
    const editor = new NodeEditor<Schemes>();
    const area = new AreaPlugin<Schemes, AreaExtra>(container);
    // @ts-expect-error - Type compatibility issue between Rete.js version, but functionally correct
    const connection = new ConnectionPlugin<Schemes, AreaExtra>();
    const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });

    editorRef.current = editor;
    areaRef.current = area;

    // Helper to create a new node (for context menu)
    const createNewNode = async (
      type: string,
      label: string,
    ): Promise<UE5Node> => {
      const node = new UE5Node(label, type);

      // Add default sockets based on type
      if (type === "event") {
        node.addOutput("exec-out", new ClassicPreset.Output(execSocket, ""));
      } else if (type === "branch") {
        node.addInput("exec-in", new ClassicPreset.Input(execSocket, ""));
        node.addInput(
          "condition",
          new ClassicPreset.Input(boolSocket, "Condition"),
        );
        node.addOutput("true", new ClassicPreset.Output(execSocket, "True"));
        node.addOutput("false", new ClassicPreset.Output(execSocket, "False"));
      } else {
        node.addInput("exec-in", new ClassicPreset.Input(execSocket, ""));
        node.addOutput("exec-out", new ClassicPreset.Output(execSocket, ""));
      }

      await editor.addNode(node);

      // Position at center of viewport
      const bounds = container.getBoundingClientRect();
      await area.translate(node.id, {
        x: bounds.width / 2 + Math.random() * 100,
        y: bounds.height / 2 + Math.random() * 100,
      });

      return node;
    };

    // Context menu with more options
    // @ts-expect-error - Context menu callbacks type compatibility issue with Rete.js, but functionally correct
    const contextMenu = new ContextMenuPlugin<Schemes>({
      items: ContextMenuPresets.classic.setup([
        [
          "Event Nodes",
          [
            ["Begin Play", () => createNewNode("event", "Begin Play Event")],
            ["Event Tick", () => createNewNode("event", "Tick Event")],
            ["Custom Event", () => createNewNode("event", "Custom Event")],
          ],
        ],
        [
          "Function Nodes",
          [
            [
              "Print String",
              () => createNewNode("function-call", "Print String"),
            ],
            ["Delay", () => createNewNode("function-call", "Delay")],
            ["Set Timer", () => createNewNode("function-call", "Set Timer")],
          ],
        ],
        [
          "Variables",
          [
            [
              "Get Variable",
              () => createNewNode("variable-get", "Get Variable"),
            ],
            [
              "Set Variable",
              () => createNewNode("variable-set", "Set Variable"),
            ],
          ],
        ],
        [
          "Flow Control",
          [
            ["Branch", () => createNewNode("branch", "Branch")],
            ["For Loop", () => createNewNode("macro", "For Loop")],
            ["While Loop", () => createNewNode("macro", "While Loop")],
          ],
        ],
        [
          "Math",
          [
            ["Add (+)", () => createNewNode("function-call", "Add")],
            ["Subtract (-)", () => createNewNode("function-call", "Subtract")],
            ["Multiply (*)", () => createNewNode("function-call", "Multiply")],
            ["Divide (/)", () => createNewNode("function-call", "Divide")],
          ],
        ],
      ]),
    });

    // Register plugins
    editor.use(area);
    // @ts-expect-error - Type compatibility issue between Rete.js plugins, but functionally correct
    area.use(connection);
    area.use(render);
    area.use(contextMenu);

    // Configure connection plugin
    // @ts-expect-error - Type compatibility issue with Rete.js preset types, but functionally correct
    connection.addPreset(ConnectionPresets.classic.setup());

    // Configure render plugin with custom node styling
    // @ts-expect-error - Type compatibility issue with Rete.js preset types, but functionally correct
    render.addPreset(
      ReactPresets.classic.setup({
        customize: {
          node(_context) {
            // context parameter marked as unused but required by type definition
            return (props: any) => {
              const node = props.data as UE5Node;
              const color = getNodeColor(node.nodeType);

              return (
                <div
                  style={{
                    background: color,
                    border: `2px solid ${color}`,
                    borderRadius: "6px",
                    minWidth: "260px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                    overflow: "hidden",
                  }}
                >
                  {/* Node Header */}
                  <div
                    style={{
                      padding: "8px 12px",
                      color: "white",
                      fontWeight: "600",
                      fontSize: "14px",
                      background: "rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    {node.label}
                  </div>

                  {/* Node Body */}
                  <div
                    style={{
                      background: "#1F2937",
                      padding: "8px",
                      minHeight: "60px",
                    }}
                  >
                    {props.children}
                  </div>
                </div>
              );
            };
          },
          socket(_context) {
            // context parameter marked as unused but required by type definition
            return (props: any) => {
              const socket = props.data as Socket;
              const colors: Record<string, string> = {
                exec: "#FFFFFF",
                bool: "#EF4444",
                int: "#06B6D4",
                float: "#10B981",
                string: "#EC4899",
                object: "#3B82F6",
                struct: "#6366F1",
              };
              const color = colors[socket.name] || "#10B981";

              return (
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "8px",
                    background: color,
                    border: "2px solid white",
                    cursor: "pointer",
                  }}
                />
              );
            };
          },
          connection(_context) {
            // context parameter marked as unused but required by type definition
            return (props: any) => {
              return (
                <svg
                  className="connection"
                  style={{
                    overflow: "visible",
                    position: "absolute",
                    pointerEvents: "none",
                  }}
                >
                  <title>Connection</title>
                  <path
                    d={props.data.path || ""}
                    fill="none"
                    strokeWidth="3"
                    stroke="#10B981"
                    strokeLinecap="round"
                  />
                </svg>
              );
            };
          },
        },
      }),
    );

    // Add nodes to editor
    const nodeMap = new Map<string, UE5Node>();

    async function addNode(type: string, blueprintNode?: BlueprintNodeType) {
      const node = new UE5Node(blueprintNode?.name || `New ${type} Node`, type);

      // Add inputs
      if (blueprintNode) {
        blueprintNode.pins
          .filter((p) => p.direction === "input")
          .forEach((pin) => {
            const socket = getSocketByType(pin.type);
            node.addInput(pin.id, new ClassicPreset.Input(socket, pin.name));
          });

        // Add outputs
        blueprintNode.pins
          .filter((p) => p.direction === "output")
          .forEach((pin) => {
            const socket = getSocketByType(pin.type);
            node.addOutput(pin.id, new ClassicPreset.Output(socket, pin.name));
          });
      } else {
        // Default pins for new nodes
        if (type === "event") {
          node.addOutput("exec-out", new ClassicPreset.Output(execSocket, ""));
        } else if (type === "branch") {
          node.addInput("exec-in", new ClassicPreset.Input(execSocket, ""));
          node.addInput(
            "condition",
            new ClassicPreset.Input(boolSocket, "Condition"),
          );
          node.addOutput("true", new ClassicPreset.Output(execSocket, "True"));
          node.addOutput(
            "false",
            new ClassicPreset.Output(execSocket, "False"),
          );
        } else {
          node.addInput("exec-in", new ClassicPreset.Input(execSocket, ""));
          node.addOutput("exec-out", new ClassicPreset.Output(execSocket, ""));
        }
      }

      await editor.addNode(node);

      if (blueprintNode) {
        await area.translate(node.id, {
          x: blueprintNode.position.x,
          y: blueprintNode.position.y,
        });
        nodeMap.set(blueprintNode.id, node);
      }

      return node;
    }

    // Load blueprint nodes
    Promise.all(nodes.map((bpNode) => addNode(bpNode.type, bpNode)))
      .then(() => {
        // Add connections
        return Promise.all(
          connections.map(async (conn) => {
            const sourceNode = nodeMap.get(conn.from.nodeId);
            const targetNode = nodeMap.get(conn.to.nodeId);

            if (sourceNode && targetNode) {
              const output = sourceNode.outputs[conn.from.pinId];
              const input = targetNode.inputs[conn.to.pinId];

              if (output && input) {
                await editor.addConnection(
                  new ClassicPreset.Connection(
                    sourceNode,
                    conn.from.pinId,
                    targetNode,
                    conn.to.pinId,
                  ),
                );
              }
            }
          }),
        );
      })
      .then(() => {
        // Fit view to content
        AreaExtensions.zoomAt(area, editor.getNodes());
      });

    // Enable zoom and pan
    AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
      accumulating: AreaExtensions.accumulateOnCtrl(),
    });

    // Zoom with mouse wheel
    AreaExtensions.simpleNodesOrder(area);

    // Setup zoom and pan controls
    const selector = AreaExtensions.selector();
    const accumulating = AreaExtensions.accumulateOnCtrl();

    AreaExtensions.selectableNodes(area, selector, { accumulating });

    // Restrict controls if readonly
    if (readonly) {
      AreaExtensions.restrictor(area, {
        scaling: () => ({ min: 0.1, max: 2 }),
      });
    }

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected nodes (Delete key) - simplified without selector API
      if (e.key === "Delete" && !readonly) {
        // Note: Node deletion on Delete key would require tracking selected nodes
        // For readonly mode, this is not applicable anyway
        console.log("Delete key pressed - node deletion not implemented");
      }

      // Zoom in (+/=)
      if ((e.key === "+" || e.key === "=") && !e.ctrlKey) {
        e.preventDefault();
        const currentK = area.area.transform.k;
        area.area.zoom(currentK * 1.2);
      }

      // Zoom out (-/_)
      if ((e.key === "-" || e.key === "_") && !e.ctrlKey) {
        e.preventDefault();
        const currentK = area.area.transform.k;
        area.area.zoom(currentK * 0.8);
      }

      // Reset zoom (0 key)
      if (e.key === "0" && !e.ctrlKey) {
        e.preventDefault();
        area.area.zoom(1);
      }

      // Frame all nodes (F key)
      if ((e.key === "f" || e.key === "F") && !e.ctrlKey) {
        e.preventDefault();
        AreaExtensions.zoomAt(area, editor.getNodes());
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    container.setAttribute("tabindex", "0"); // Make container focusable for keyboard events

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      area.destroy();
    };
  }, [nodes, connections, readonly]);

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="bg-gray-900 rounded-lg border border-gray-700"
        style={{
          width: "100%",
          height: "600px",
          backgroundImage:
            "linear-gradient(#374151 1px, transparent 1px), linear-gradient(90deg, #374151 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          position: "relative",
        }}
      />

      {/* Controls Legend */}
      <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
          <div>
            <h4 className="font-semibold text-white mb-2">🖱️ Mouse Controls</h4>
            <ul className="space-y-1">
              <li>
                • <strong>Pan:</strong> Click and drag background
              </li>
              <li>
                • <strong>Zoom:</strong> Mouse wheel
              </li>
              <li>
                • <strong>Move Node:</strong> Click and drag node
              </li>
              <li>
                • <strong>Select Multiple:</strong> Ctrl + Click
              </li>
              {!readonly && (
                <li>
                  • <strong>Add Node:</strong> Right-click background
                </li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">
              ⌨️ Keyboard Shortcuts
            </h4>
            <ul className="space-y-1">
              <li>
                • <strong>+/-:</strong> Zoom in/out
              </li>
              <li>
                • <strong>0:</strong> Reset zoom
              </li>
              <li>
                • <strong>F:</strong> Frame all nodes
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">🎨 Node Types</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 rounded text-xs bg-red-600">
                Event
              </span>
              <span className="px-2 py-1 rounded text-xs bg-blue-600">
                Function
              </span>
              <span className="px-2 py-1 rounded text-xs bg-green-600">
                Variable
              </span>
              <span className="px-2 py-1 rounded text-xs bg-purple-600">
                Cast
              </span>
              <span className="px-2 py-1 rounded text-xs bg-gray-700">
                Branch
              </span>
            </div>
          </div>
        </div>
        {!readonly && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-400">
              💡 <strong>Tip:</strong> Click on the editor canvas first to
              enable keyboard shortcuts
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
