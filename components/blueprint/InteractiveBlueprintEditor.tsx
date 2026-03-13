"use client";

import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { ClassicPreset, NodeEditor } from "rete";
import type { GetSchemes } from "rete";
import { AreaExtensions, AreaPlugin } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from "rete-connection-plugin";
import { ReactPlugin, Presets as ReactPresets } from "rete-react-plugin";
import type { ReactArea2D } from "rete-react-plugin";
import {
  ContextMenuPlugin,
  Presets as ContextMenuPresets,
} from "rete-context-menu-plugin";
import type { ContextMenuExtra } from "rete-context-menu-plugin";
import { CommentExtensions, CommentPlugin } from "rete-comment-plugin";
import type { Comment as ReteComment } from "rete-comment-plugin";
import type {
  BlueprintEditorComment,
  BlueprintNode as BlueprintNodeType,
  Connection as BlueprintConnection,
  NodeType,
  Pin,
} from "@/lib/types/blueprint";
import {
  evaluateMaterialDataflow,
  type MaterialEvaluationResult,
} from "@/lib/blueprint/material-dataflow";
import BlueprintViewportBackdrop from "./BlueprintViewportBackdrop";
import "./rete-editor.css";

class Socket extends ClassicPreset.Socket {
  constructor(name: string) {
    super(name);
  }
}

const execSocket = new Socket("exec");
const boolSocket = new Socket("bool");
const intSocket = new Socket("int");
const floatSocket = new Socket("float");
const stringSocket = new Socket("string");
const objectSocket = new Socket("object");
const structSocket = new Socket("struct");

const nodeTypeColors: Record<NodeType, string> = {
  event: "#b91c1c",
  "function-call": "#1d4ed8",
  "variable-get": "#15803d",
  "variable-set": "#166534",
  cast: "#7e22ce",
  branch: "#374151",
  array: "#a16207",
  macro: "#4338ca",
  comment: "#475569",
};

const pinTypeColors: Record<string, string> = {
  exec: "#f8fafc",
  bool: "#ef4444",
  int: "#06b6d4",
  float: "#10b981",
  string: "#ec4899",
  object: "#3b82f6",
  struct: "#8b5cf6",
  array: "#f59e0b",
  delegate: "#f97316",
};

const socketByType = (type: string) => {
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

class UE5Node extends ClassicPreset.Node {
  width = 320;
  height = 180;
  comment?: string;
  nodeType: NodeType;

  constructor(label: string, nodeType: NodeType) {
    super(label);
    this.nodeType = nodeType;
  }

  clone() {
    const cloned = new UE5Node(this.label, this.nodeType);
    cloned.width = this.width;
    cloned.comment = this.comment;

    Object.entries(this.inputs).forEach(([key, input]) => {
      if (input) {
        const clonedInput = new ClassicPreset.Input(
          input.socket,
          input.label,
          input.multipleConnections,
        );
        clonedInput.index = input.index;
        cloned.addInput(key, clonedInput);
      }
    });

    Object.entries(this.outputs).forEach(([key, output]) => {
      if (output) {
        const clonedOutput = new ClassicPreset.Output(
          output.socket,
          output.label,
          output.multipleConnections,
        );
        clonedOutput.index = output.index;
        cloned.addOutput(key, clonedOutput);
      }
    });

    return cloned;
  }
}

type VisualNode = ClassicPreset.Node & {
  width: number;
  height: number;
  nodeType?: NodeType;
  comment?: string;
};

type Schemes = GetSchemes<
  VisualNode,
  ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;
type AreaExtra = ReactArea2D<Schemes> | ContextMenuExtra;

interface InteractiveBlueprintEditorProps {
  nodes: BlueprintNodeType[];
  connections: BlueprintConnection[];
  comments?: BlueprintEditorComment[];
  readonly?: boolean;
}

type LiveControlValues = Record<string, string>;

type DataflowState =
  | { status: "idle" | "loading" }
  | { status: "ready"; result: MaterialEvaluationResult }
  | { status: "error"; error: string };

function sortPorts<T extends { index?: number }>(
  ports: [string, T | undefined][],
): [string, T][] {
  return ports
    .filter((entry): entry is [string, T] => Boolean(entry[1]))
    .sort((left, right) => (left[1].index ?? 0) - (right[1].index ?? 0));
}

function formatNodeType(nodeType: NodeType) {
  return nodeType.replace(/-/g, " ");
}

function isMultiConnectionPin(pin: Pin) {
  if (pin.direction === "input") return false;
  return pin.type !== "exec";
}

function getControlKey(nodeId: string, pinId: string) {
  return `${nodeId}:${pinId}`;
}

function supportsInlineControl(pin: Pin) {
  return (
    pin.direction === "input" &&
    typeof pin.defaultValue !== "undefined" &&
    (pin.type === "float" || pin.type === "int" || pin.type === "string")
  );
}

function parseNumericValue(value: string | undefined) {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function createPinControl(
  pin: Pin,
  nodeId: string,
  readonly: boolean,
  onControlChange: (controlKey: string, value: string) => void,
) {
  if (!supportsInlineControl(pin)) return null;

  const controlKey = getControlKey(nodeId, pin.id);

  if (pin.type === "string") {
    return new ClassicPreset.InputControl("text", {
      readonly,
      initial: pin.defaultValue ?? "",
      change(value) {
        onControlChange(controlKey, String(value ?? ""));
      },
    });
  }

  return new ClassicPreset.InputControl("number", {
    readonly,
    initial: parseNumericValue(pin.defaultValue),
    change(value) {
      onControlChange(controlKey, String(value ?? ""));
    },
  });
}

function buildInitialControlValues(nodes: BlueprintNodeType[]) {
  const initialValues: LiveControlValues = {};

  nodes.forEach((node) => {
    node.pins.forEach((pin) => {
      if (supportsInlineControl(pin)) {
        initialValues[getControlKey(node.id, pin.id)] = pin.defaultValue ?? "";
      }
    });
  });

  return initialValues;
}

function createInput(
  pin: Pin,
  index: number,
  nodeId: string,
  readonly: boolean,
  onControlChange: (controlKey: string, value: string) => void,
) {
  const input = new ClassicPreset.Input(
    socketByType(pin.type),
    pin.name || " ",
    false,
  );
  input.index = index;

  const control = createPinControl(pin, nodeId, readonly, onControlChange);

  if (control) {
    input.addControl(control);
  }

  return input;
}

function createOutput(pin: Pin, index: number) {
  const output = new ClassicPreset.Output(
    socketByType(pin.type),
    pin.name || " ",
    isMultiConnectionPin(pin),
  );
  output.index = index;
  return output;
}

function applyPinSet(
  node: UE5Node,
  pins: Pin[],
  blueprintNodeId: string,
  readonly: boolean,
  onControlChange: (controlKey: string, value: string) => void,
) {
  pins.forEach((pin, index) => {
    if (pin.direction === "input") {
      node.addInput(
        pin.id,
        createInput(pin, index, blueprintNodeId, readonly, onControlChange),
      );
    } else {
      node.addOutput(pin.id, createOutput(pin, index));
    }
  });
}

function computeNodeWidth(node: BlueprintNodeType) {
  const longestPin = node.pins.reduce(
    (max, pin) => Math.max(max, pin.name.length),
    node.name.length,
  );

  return Math.min(430, Math.max(300, 210 + longestPin * 7));
}

function computeNodeHeight(node: BlueprintNodeType) {
  const pinRows = Math.max(
    node.pins.filter((pin) => pin.direction === "input").length,
    node.pins.filter((pin) => pin.direction === "output").length,
    1,
  );
  const commentHeight = node.comment ? 38 : 0;
  const controlHeight = node.pins.some((pin) => supportsInlineControl(pin))
    ? 28
    : 0;

  return 74 + pinRows * 34 + commentHeight + controlHeight;
}

function createBlueprintNode(
  blueprintNode: BlueprintNodeType,
  readonly: boolean,
  onControlChange: (controlKey: string, value: string) => void,
) {
  const node = new UE5Node(blueprintNode.name, blueprintNode.type);
  node.width = computeNodeWidth(blueprintNode);
  node.height = computeNodeHeight(blueprintNode);
  node.comment = blueprintNode.comment;
  applyPinSet(
    node,
    blueprintNode.pins,
    blueprintNode.id,
    readonly,
    onControlChange,
  );
  return node;
}

function buildFactoryPins(type: NodeType, label: string): Pin[] {
  switch (label) {
    case "Begin Play":
    case "Event Tick":
    case "Custom Event":
      return [
        {
          id: "exec-out",
          name: "Exec",
          type: "exec",
          direction: "output",
          connected: false,
        },
      ];
    case "Print String":
      return [
        {
          id: "exec-in",
          name: "Exec",
          type: "exec",
          direction: "input",
          connected: false,
        },
        {
          id: "in-string",
          name: "In String",
          type: "string",
          direction: "input",
          connected: false,
        },
        {
          id: "exec-out",
          name: "Then",
          type: "exec",
          direction: "output",
          connected: false,
        },
      ];
    case "Delay":
      return [
        {
          id: "exec-in",
          name: "Exec",
          type: "exec",
          direction: "input",
          connected: false,
        },
        {
          id: "duration",
          name: "Duration",
          type: "float",
          direction: "input",
          connected: false,
        },
        {
          id: "completed",
          name: "Completed",
          type: "exec",
          direction: "output",
          connected: false,
        },
      ];
    case "Set Timer":
      return [
        {
          id: "exec-in",
          name: "Exec",
          type: "exec",
          direction: "input",
          connected: false,
        },
        {
          id: "time",
          name: "Time",
          type: "float",
          direction: "input",
          connected: false,
        },
        {
          id: "looping",
          name: "Looping",
          type: "bool",
          direction: "input",
          connected: false,
        },
        {
          id: "exec-out",
          name: "Then",
          type: "exec",
          direction: "output",
          connected: false,
        },
      ];
    case "Get Variable":
      return [
        {
          id: "value-out",
          name: "Value",
          type: "float",
          direction: "output",
          connected: false,
        },
      ];
    case "Set Variable":
      return [
        {
          id: "exec-in",
          name: "Exec",
          type: "exec",
          direction: "input",
          connected: false,
        },
        {
          id: "value-in",
          name: "Value",
          type: "float",
          direction: "input",
          connected: false,
        },
        {
          id: "exec-out",
          name: "Then",
          type: "exec",
          direction: "output",
          connected: false,
        },
      ];
    case "Branch":
      return [
        {
          id: "exec-in",
          name: "Exec",
          type: "exec",
          direction: "input",
          connected: false,
        },
        {
          id: "condition",
          name: "Condition",
          type: "bool",
          direction: "input",
          connected: false,
        },
        {
          id: "true",
          name: "True",
          type: "exec",
          direction: "output",
          connected: false,
        },
        {
          id: "false",
          name: "False",
          type: "exec",
          direction: "output",
          connected: false,
        },
      ];
    case "For Loop":
      return [
        {
          id: "exec-in",
          name: "Exec",
          type: "exec",
          direction: "input",
          connected: false,
        },
        {
          id: "first-index",
          name: "First Index",
          type: "int",
          direction: "input",
          connected: false,
        },
        {
          id: "last-index",
          name: "Last Index",
          type: "int",
          direction: "input",
          connected: false,
        },
        {
          id: "loop-body",
          name: "Loop Body",
          type: "exec",
          direction: "output",
          connected: false,
        },
        {
          id: "index-out",
          name: "Index",
          type: "int",
          direction: "output",
          connected: false,
        },
        {
          id: "completed",
          name: "Completed",
          type: "exec",
          direction: "output",
          connected: false,
        },
      ];
    case "While Loop":
      return [
        {
          id: "exec-in",
          name: "Exec",
          type: "exec",
          direction: "input",
          connected: false,
        },
        {
          id: "condition",
          name: "Condition",
          type: "bool",
          direction: "input",
          connected: false,
        },
        {
          id: "loop-body",
          name: "Loop Body",
          type: "exec",
          direction: "output",
          connected: false,
        },
        {
          id: "completed",
          name: "Completed",
          type: "exec",
          direction: "output",
          connected: false,
        },
      ];
    case "Add":
    case "Subtract":
    case "Multiply":
    case "Divide":
      return [
        {
          id: "a-in",
          name: "A",
          type: "float",
          direction: "input",
          connected: false,
        },
        {
          id: "b-in",
          name: "B",
          type: "float",
          direction: "input",
          connected: false,
        },
        {
          id: "result-out",
          name: "Return Value",
          type: "float",
          direction: "output",
          connected: false,
        },
      ];
    case "Texture Coordinate":
      return [
        {
          id: "uv-out",
          name: "UV",
          type: "struct",
          direction: "output",
          connected: false,
        },
      ];
    case "Multiply UV Scale":
      return [
        {
          id: "uv-in",
          name: "UV",
          type: "struct",
          direction: "input",
          connected: false,
        },
        {
          id: "scale-in",
          name: "Scale",
          type: "float",
          direction: "input",
          connected: false,
          defaultValue: "1.0",
        },
        {
          id: "uv-out",
          name: "Scaled UV",
          type: "struct",
          direction: "output",
          connected: false,
        },
      ];
    case "Sample Texture":
      return [
        {
          id: "uv-in",
          name: "UV",
          type: "struct",
          direction: "input",
          connected: false,
        },
        {
          id: "color-out",
          name: "Color",
          type: "struct",
          direction: "output",
          connected: false,
        },
      ];
    case "Fresnel":
      return [
        {
          id: "exp-in",
          name: "Exponent",
          type: "float",
          direction: "input",
          connected: false,
          defaultValue: "4.0",
        },
        {
          id: "value-out",
          name: "Value",
          type: "float",
          direction: "output",
          connected: false,
        },
      ];
    case "Lerp Emissive":
      return [
        {
          id: "a-in",
          name: "A",
          type: "float",
          direction: "input",
          connected: false,
          defaultValue: "0.0",
        },
        {
          id: "b-in",
          name: "B",
          type: "float",
          direction: "input",
          connected: false,
          defaultValue: "5.0",
        },
        {
          id: "alpha-in",
          name: "Alpha",
          type: "float",
          direction: "input",
          connected: false,
        },
        {
          id: "emissive-out",
          name: "Emissive",
          type: "float",
          direction: "output",
          connected: false,
        },
      ];
    case "Material Output":
      return [
        {
          id: "base-color-in",
          name: "Base Color",
          type: "struct",
          direction: "input",
          connected: false,
        },
        {
          id: "roughness-in",
          name: "Roughness",
          type: "float",
          direction: "input",
          connected: false,
          defaultValue: "0.5",
        },
        {
          id: "emissive-in",
          name: "Emissive",
          type: "float",
          direction: "input",
          connected: false,
        },
      ];
    default:
      return type === "event"
        ? [
            {
              id: "exec-out",
              name: "Exec",
              type: "exec",
              direction: "output",
              connected: false,
            },
          ]
        : [
            {
              id: "exec-in",
              name: "Exec",
              type: "exec",
              direction: "input",
              connected: false,
            },
            {
              id: "exec-out",
              name: "Exec",
              type: "exec",
              direction: "output",
              connected: false,
            },
          ];
  }
}

function buildNodeFactory(type: NodeType, label: string) {
  return () => {
    const node = new UE5Node(label, type);
    node.height = 180;
    applyPinSet(node, buildFactoryPins(type, label), node.id, false, () => {});
    return node;
  };
}

function UnrealSocket({
  pinType,
  side,
}: {
  pinType: string;
  side: "input" | "output";
}) {
  const color = pinTypeColors[pinType] || pinTypeColors.float;
  const exec = pinType === "exec";

  return (
    <span
      className={`ue-socket ue-socket--${side} ${
        exec ? "ue-socket--exec" : "ue-socket--data"
      }`}
      style={{
        background: exec
          ? color
          : `radial-gradient(circle at 30% 30%, #ffffff, ${color})`,
        borderColor: exec ? "rgba(255,255,255,0.9)" : color,
        clipPath: exec
          ? side === "input"
            ? "polygon(100% 0, 35% 0, 0 50%, 35% 100%, 100% 100%, 72% 50%)"
            : "polygon(0 0, 65% 0, 100% 50%, 65% 100%, 0 100%, 28% 50%)"
          : undefined,
      }}
      title={`${side} ${pinType}`}
    />
  );
}

function UnrealNode({
  data,
  emit,
}: {
  data: VisualNode;
  emit: (props: ReactArea2D<Schemes>) => void;
}) {
  const node = data as UE5Node;
  const inputs = sortPorts(Object.entries(data.inputs));
  const outputs = sortPorts(Object.entries(data.outputs));
  const controls = sortPorts(Object.entries(data.controls));
  const rows = Math.max(inputs.length, outputs.length);
  const accent =
    nodeTypeColors[node.nodeType] || nodeTypeColors["function-call"];

  return (
    <div
      className={`ue-node ue-node--${node.nodeType}`}
      data-node-type={node.nodeType}
      style={{
        width: data.width ?? 320,
        borderColor: accent,
        ["--ue-node-accent" as string]: accent,
        boxShadow: data.selected
          ? `0 0 0 1px rgba(255,255,255,0.24), 0 0 0 3px ${accent}, 0 26px 60px rgba(2, 6, 23, 0.62)`
          : "0 18px 40px rgba(2, 6, 23, 0.48)",
      }}
      data-testid="node"
    >
      <div className="ue-node__sheen" />
      <div className="ue-node__header" style={{ background: accent }}>
        <div className="ue-node__title">{data.label}</div>
        <div className="ue-node__badge">{formatNodeType(node.nodeType)}</div>
      </div>

      {node.comment ? (
        <div className="ue-node__comment">{node.comment}</div>
      ) : null}

      {controls.length ? (
        <div className="ue-node__controls">
          {controls.map(([key, control]) => (
            <ReactPresets.classic.RefControl<Schemes>
              key={key}
              name="ue-node__control"
              emit={emit}
              payload={control}
            />
          ))}
        </div>
      ) : null}

      <div
        className="ue-node__pins"
        style={{ minHeight: `${Math.max(1, rows) * 34}px` }}
      >
        {Array.from({ length: rows }, (_, index) => {
          const input = inputs[index];
          const output = outputs[index];

          return (
            <div
              className="ue-node__row"
              key={`${data.id}-${input?.[0] ?? `input-${index}`}-${output?.[0] ?? `output-${index}`}`}
            >
              <div className="ue-node__pin ue-node__pin--input">
                {input ? (
                  <>
                    <ReactPresets.classic.RefSocket<Schemes>
                      name="ue-node__socket ue-node__socket--input"
                      emit={emit}
                      side="input"
                      socketKey={input[0]}
                      nodeId={data.id}
                      payload={input[1].socket}
                    />
                    <span className="ue-node__pin-copy">
                      <span className="ue-node__pin-label">
                        {input[1].label}
                      </span>
                      {input[1].control && input[1].showControl ? (
                        <ReactPresets.classic.RefControl<Schemes>
                          key={`${data.id}-${input[0]}-control`}
                          name="ue-node__inline-control"
                          emit={emit}
                          payload={input[1].control}
                        />
                      ) : null}
                    </span>
                  </>
                ) : (
                  <span className="ue-node__pin-spacer" />
                )}
              </div>

              <div className="ue-node__pin ue-node__pin--output">
                {output ? (
                  <>
                    <span className="ue-node__pin-label ue-node__pin-label--output">
                      {output[1].label}
                    </span>
                    <ReactPresets.classic.RefSocket<Schemes>
                      name="ue-node__socket ue-node__socket--output"
                      emit={emit}
                      side="output"
                      socketKey={output[0]}
                      nodeId={data.id}
                      payload={output[1].socket}
                    />
                  </>
                ) : (
                  <span className="ue-node__pin-spacer" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function InteractiveBlueprintEditor({
  nodes,
  connections,
  comments = [],
  readonly = false,
}: InteractiveBlueprintEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const commentActionsRef = useRef<{
    addInline: null | (() => void);
    addFrame: null | (() => void);
  }>({ addInline: null, addFrame: null });
  const [liveControlValues, setLiveControlValues] = useState<LiveControlValues>(
    () => buildInitialControlValues(nodes),
  );
  const [dataflowState, setDataflowState] = useState<DataflowState>({
    status: "idle",
  });

  useEffect(() => {
    setLiveControlValues(buildInitialControlValues(nodes));
  }, [nodes]);

  useEffect(() => {
    if (!nodes.some((node) => /material output/i.test(node.name))) {
      setDataflowState({ status: "idle" });
      return;
    }

    let cancelled = false;

    setDataflowState({ status: "loading" });

    void evaluateMaterialDataflow(nodes, connections, liveControlValues)
      .then((result) => {
        if (cancelled) return;

        if (!result) {
          setDataflowState({ status: "idle" });
          return;
        }

        setDataflowState({ status: "ready", result });
      })
      .catch((error: unknown) => {
        if (cancelled) return;

        setDataflowState({
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Dataflow evaluation failed",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [connections, liveControlValues, nodes]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = "";
    container.tabIndex = 0;

    const editor = new NodeEditor<Schemes>();
    const area = new AreaPlugin<Schemes, AreaExtra>(container);
    const connection = new ConnectionPlugin<Schemes, AreaExtra>();
    const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });
    const commentPlugin = new CommentPlugin<Schemes, AreaExtra>({
      edit: async (comment: ReteComment) => {
        if (readonly) return comment.text;

        const nextText = window.prompt("Edit comment", comment.text);
        return nextText === null ? comment.text : nextText;
      },
    });
    const contextMenu = new ContextMenuPlugin<Schemes>({
      items: ContextMenuPresets.classic.setup([
        [
          "Event Nodes",
          [
            ["Begin Play", buildNodeFactory("event", "Begin Play")],
            ["Event Tick", buildNodeFactory("event", "Event Tick")],
            ["Custom Event", buildNodeFactory("event", "Custom Event")],
          ],
        ],
        [
          "Function Nodes",
          [
            ["Print String", buildNodeFactory("function-call", "Print String")],
            ["Delay", buildNodeFactory("function-call", "Delay")],
            ["Set Timer", buildNodeFactory("function-call", "Set Timer")],
          ],
        ],
        [
          "Variables",
          [
            ["Get Variable", buildNodeFactory("variable-get", "Get Variable")],
            ["Set Variable", buildNodeFactory("variable-set", "Set Variable")],
          ],
        ],
        [
          "Flow Control",
          [
            ["Branch", buildNodeFactory("branch", "Branch")],
            ["For Loop", buildNodeFactory("macro", "For Loop")],
            ["While Loop", buildNodeFactory("macro", "While Loop")],
          ],
        ],
        [
          "Math",
          [
            ["Add (+)", buildNodeFactory("function-call", "Add")],
            ["Subtract (-)", buildNodeFactory("function-call", "Subtract")],
            ["Multiply (*)", buildNodeFactory("function-call", "Multiply")],
            ["Divide (/)", buildNodeFactory("function-call", "Divide")],
          ],
        ],
        [
          "Material Graph",
          [
            [
              "Texture Coordinate",
              buildNodeFactory("function-call", "Texture Coordinate"),
            ],
            [
              "Multiply UV Scale",
              buildNodeFactory("function-call", "Multiply UV Scale"),
            ],
            [
              "Sample Texture",
              buildNodeFactory("function-call", "Sample Texture"),
            ],
            ["Fresnel", buildNodeFactory("function-call", "Fresnel")],
            [
              "Lerp Emissive",
              buildNodeFactory("function-call", "Lerp Emissive"),
            ],
            [
              "Material Output",
              buildNodeFactory("function-call", "Material Output"),
            ],
          ],
        ],
      ]),
    });

    editor.use(area);
    area.use(connection);
    area.use(render);
    area.use(commentPlugin);

    if (!readonly) {
      area.use(contextMenu);
    }

    connection.addPreset(ConnectionPresets.classic.setup());
    render.addPreset(
      ReactPresets.classic.setup({
        customize: {
          node() {
            return UnrealNode;
          },
          socket(context) {
            return function SocketComponent() {
              return (
                <UnrealSocket
                  pinType={context.payload.name}
                  side={context.side}
                />
              );
            };
          },
          connection(context) {
            const sourceNode = editor.getNode(context.payload.source);
            const sourceOutput =
              sourceNode?.outputs?.[context.payload.sourceOutput];
            const pinType = sourceOutput?.socket?.name || "float";
            const stroke = pinTypeColors[pinType] || pinTypeColors.float;
            const strokeWidth = pinType === "exec" ? 4.5 : 3.2;
            const dashArray = pinType === "delegate" ? "9 5" : undefined;
            const glow = pinType === "exec" ? 14 : 10;

            return function ConnectionComponent(props) {
              return (
                <ReactPresets.classic.Connection
                  data={props.data}
                  styles={() =>
                    `stroke: ${stroke}; stroke-width: ${strokeWidth}px; opacity: 0.96; filter: drop-shadow(0 0 ${glow}px ${stroke});${
                      dashArray ? ` stroke-dasharray: ${dashArray};` : ""
                    }`
                  }
                />
              );
            };
          },
        },
      }),
    );
    render.addPreset(ReactPresets.contextMenu.setup());

    AreaExtensions.simpleNodesOrder(area);
    const selector = AreaExtensions.selector();
    const accumulating = AreaExtensions.accumulateOnCtrl();
    AreaExtensions.selectableNodes(area, selector, { accumulating });
    CommentExtensions.selectable(commentPlugin, selector, accumulating);
    AreaExtensions.showInputControl(area);
    AreaExtensions.restrictor(area, {
      scaling: { min: 0.25, max: 2 },
    });

    let disposed = false;
    const nodeMap = new Map<string, UE5Node>();
    const handleControlChange = (controlKey: string, value: string) => {
      setLiveControlValues((currentValues) => {
        if (currentValues[controlKey] === value) {
          return currentValues;
        }

        return {
          ...currentValues,
          [controlKey]: value,
        };
      });
    };

    const getViewportCenter = () => {
      const { x, y, k } = area.area.transform;

      return {
        x: (container.clientWidth / 2 - x) / k,
        y: (container.clientHeight / 2 - y) / k,
      };
    };

    const getSelectedNodeIds = () => {
      return Array.from(selector.entities.values())
        .filter((entity) => entity.label === "node")
        .map((entity) => entity.id);
    };

    const loadBlueprint = async () => {
      for (const blueprintNode of nodes) {
        const node = createBlueprintNode(
          blueprintNode,
          readonly,
          handleControlChange,
        );
        await editor.addNode(node);

        if (disposed) return;

        await area.translate(node.id, {
          x: blueprintNode.position.x,
          y: blueprintNode.position.y,
        });

        nodeMap.set(blueprintNode.id, node);
      }

      for (const blueprintConnection of connections) {
        const sourceNode = nodeMap.get(blueprintConnection.from.nodeId);
        const targetNode = nodeMap.get(blueprintConnection.to.nodeId);

        if (!sourceNode || !targetNode) continue;

        const sourceOutput = sourceNode.outputs[blueprintConnection.from.pinId];
        const targetInput = targetNode.inputs[blueprintConnection.to.pinId];

        if (!sourceOutput || !targetInput) continue;

        const editorConnection = new ClassicPreset.Connection(
          sourceNode as ClassicPreset.Node,
          blueprintConnection.from.pinId,
          targetNode as ClassicPreset.Node,
          blueprintConnection.to.pinId,
        );
        editorConnection.id = blueprintConnection.id;

        await editor.addConnection(editorConnection);
      }

      for (const seededComment of comments) {
        if (seededComment.type === "frame") {
          commentPlugin.addFrame(
            seededComment.text,
            seededComment.nodeIds ?? [],
          );
          continue;
        }

        const position: [number, number] = seededComment.position
          ? [seededComment.position.x, seededComment.position.y]
          : (() => {
              const viewportCenter = getViewportCenter();
              return [viewportCenter.x, viewportCenter.y] as [number, number];
            })();

        commentPlugin.addInline(
          seededComment.text,
          position,
          seededComment.linkNodeId,
        );
      }

      if (editor.getNodes().length) {
        await AreaExtensions.zoomAt(area, editor.getNodes());
      }
    };

    commentActionsRef.current = {
      addInline: readonly
        ? null
        : () => {
            const viewportCenter = getViewportCenter();
            const [selectedNodeId] = getSelectedNodeIds();
            const comment = commentPlugin.addInline(
              "New inline comment",
              [viewportCenter.x - 40, viewportCenter.y - 24],
              selectedNodeId,
            );

            void commentPlugin.editComment(comment.id);
          },
      addFrame: readonly
        ? null
        : () => {
            const selectedNodeIds = getSelectedNodeIds();
            const links = selectedNodeIds.length
              ? selectedNodeIds
              : editor.getNodes().map((node) => node.id);
            const comment = commentPlugin.addFrame("New module frame", links);

            if (!links.length) {
              const viewportCenter = getViewportCenter();
              void comment.translate(viewportCenter.x, viewportCenter.y);
            }

            void commentPlugin.editComment(comment.id);
          },
    };

    void loadBlueprint();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey) return;

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        void area.area.zoom(area.area.transform.k * 1.15, 0, 0);
      }

      if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        void area.area.zoom(area.area.transform.k * 0.85, 0, 0);
      }

      if (event.key === "0") {
        event.preventDefault();
        void area.area.zoom(1, 0, 0);
      }

      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        void AreaExtensions.zoomAt(area, editor.getNodes());
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    return () => {
      disposed = true;
      commentActionsRef.current = { addInline: null, addFrame: null };
      container.removeEventListener("keydown", handleKeyDown);
      area.destroy();
    };
  }, [comments, connections, nodes, readonly]);

  const frameModules = comments
    .filter((comment) => comment.type === "frame")
    .map((comment) => comment.text);
  const editablePins = nodes.flatMap((node) =>
    node.pins
      .filter((pin) => supportsInlineControl(pin))
      .map((pin) => ({
        id: getControlKey(node.id, pin.id),
        label: `${node.name} / ${pin.name}`,
        value:
          liveControlValues[getControlKey(node.id, pin.id)] ??
          pin.defaultValue ??
          "",
      })),
  );
  const materialEvaluation =
    dataflowState.status === "ready" ? dataflowState.result : null;

  return (
    <div className="relative w-full">
      <div className="blueprint-editor-shell overflow-hidden rounded-[28px] border border-slate-700/80 bg-slate-950 shadow-[0_40px_100px_rgba(2,6,23,0.55)]">
        <div className="blueprint-editor-shell__chrome">
          <div>
            <p className="blueprint-editor-shell__eyebrow">Viewport</p>
            <h3 className="blueprint-editor-shell__title">
              Blueprint Graph Space
            </h3>
          </div>
          <div className="blueprint-editor-shell__status">
            {comments.length ? (
              <span className="blueprint-editor-shell__pill">
                {comments.length} comments
              </span>
            ) : null}
            <span className="blueprint-editor-shell__pill">
              {nodes.length} nodes
            </span>
            <span className="blueprint-editor-shell__pill">
              {connections.length} links
            </span>
            <span className="blueprint-editor-shell__pill">
              {readonly ? "Preview" : "Interactive"}
            </span>
            {!readonly ? (
              <button
                type="button"
                className="blueprint-editor-shell__action"
                onClick={() => commentActionsRef.current.addInline?.()}
              >
                Inline Comment
              </button>
            ) : null}
            {!readonly ? (
              <button
                type="button"
                className="blueprint-editor-shell__action"
                onClick={() => commentActionsRef.current.addFrame?.()}
              >
                Frame Module
              </button>
            ) : null}
          </div>
        </div>

        <div className="blueprint-editor-shell__stage">
          <BlueprintViewportBackdrop nodes={nodes} />
          <div className="blueprint-editor-shell__orb blueprint-editor-shell__orb--blue" />
          <div className="blueprint-editor-shell__orb blueprint-editor-shell__orb--cyan" />
          <div className="blueprint-editor-shell__scanlines" />

          <div
            ref={containerRef}
            className="blueprint-editor"
            style={{
              width: "100%",
              height: "620px",
              position: "relative",
            }}
          />

          <div className="blueprint-editor-shell__legend" aria-hidden="true">
            <span className="blueprint-editor-shell__legend-item">
              <span className="blueprint-editor-shell__legend-swatch blueprint-editor-shell__legend-swatch--exec" />
              Exec flow
            </span>
            <span className="blueprint-editor-shell__legend-item">
              <span className="blueprint-editor-shell__legend-swatch blueprint-editor-shell__legend-swatch--data" />
              Data links
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-[24px] border border-slate-700/80 bg-slate-900/95 p-4 shadow-[0_20px_60px_rgba(2,6,23,0.35)] backdrop-blur-xl">
        <div className="grid grid-cols-1 gap-4 text-sm text-gray-300 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <h4 className="mb-2 font-semibold text-white">Mouse Controls</h4>
            <ul className="space-y-1">
              <li>Pan: drag the background</li>
              <li>Zoom: use the mouse wheel</li>
              <li>Move node: drag a node</li>
              <li>Retarget wire: drag to a new compatible pin</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-white">Keyboard</h4>
            <ul className="space-y-1">
              <li>+ / -: zoom in or out</li>
              <li>0: reset zoom</li>
              <li>F: frame all nodes</li>
              {!readonly ? <li>Right click: open the node menu</li> : null}
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-white">Modules</h4>
            <ul className="space-y-1">
              {frameModules.length ? (
                frameModules.map((moduleLabel) => (
                  <li key={moduleLabel}>{moduleLabel}</li>
                ))
              ) : (
                <li>No framed modules yet</li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-white">Dataflow</h4>
            <ul className="space-y-1">
              <li>{editablePins.length} editable defaults</li>
              <li>{connections.length} active graph edges</li>
              <li>{comments.length} Rete comments on canvas</li>
              <li>
                {materialEvaluation
                  ? `rete-engine executed ${materialEvaluation.intermediate.length + 1} nodes`
                  : "Controls collapse automatically when inputs are wired"}
              </li>
            </ul>
          </div>
        </div>

        {editablePins.length ? (
          <div className="mt-4 border-t border-slate-700/80 pt-4">
            <h4 className="mb-2 font-semibold text-white">Exposed Controls</h4>
            <div className="flex flex-wrap gap-2 text-xs text-slate-200">
              {editablePins.map((pin) => (
                <span
                  key={pin.id}
                  className="rounded-full border border-slate-600/80 bg-slate-800/90 px-3 py-1"
                >
                  {pin.label}: {pin.value}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {dataflowState.status === "loading" ? (
          <div className="mt-4 border-t border-slate-700/80 pt-4">
            <h4 className="mb-2 font-semibold text-white">Material Dataflow</h4>
            <p className="text-sm text-slate-300">
              Executing graph with rete-engine...
            </p>
          </div>
        ) : null}

        {dataflowState.status === "error" ? (
          <div className="mt-4 border-t border-slate-700/80 pt-4">
            <h4 className="mb-2 font-semibold text-white">Material Dataflow</h4>
            <p className="text-sm text-rose-300">{dataflowState.error}</p>
          </div>
        ) : null}

        {materialEvaluation ? (
          <div className="mt-4 border-t border-slate-700/80 pt-4">
            <h4 className="mb-2 font-semibold text-white">
              Material Codegen Preview
            </h4>
            <div className="mb-3 flex flex-wrap gap-2 text-xs text-slate-200">
              <span className="rounded-full border border-slate-600/80 bg-slate-800/90 px-3 py-1">
                BaseColor: {materialEvaluation.summary.baseColor.preview}
              </span>
              <span className="rounded-full border border-slate-600/80 bg-slate-800/90 px-3 py-1">
                Roughness: {materialEvaluation.summary.roughness.preview}
              </span>
              <span className="rounded-full border border-slate-600/80 bg-slate-800/90 px-3 py-1">
                Emissive: {materialEvaluation.summary.emissive.preview}
              </span>
            </div>
            <pre className="overflow-x-auto rounded-2xl border border-slate-700/80 bg-slate-950/90 p-4 text-xs text-cyan-100">
              {materialEvaluation.code}
            </pre>

            {materialEvaluation.intermediate.length ? (
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {materialEvaluation.intermediate.map((entry) => (
                  <div
                    key={entry.nodeId}
                    className="rounded-2xl border border-slate-700/80 bg-slate-950/60 p-3"
                  >
                    <p className="mb-2 text-sm font-semibold text-white">
                      {entry.nodeName}
                    </p>
                    <div className="space-y-1 text-xs text-slate-300">
                      {Object.entries(entry.outputs).map(([key, value]) => (
                        <p key={key}>
                          {key}: {value.preview}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
