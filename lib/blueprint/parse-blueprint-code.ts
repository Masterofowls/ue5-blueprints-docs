import type {
  BlueprintNode,
  Connection,
  NodeType,
  Pin,
  PinType,
} from "@/lib/types/blueprint";

interface ParsedPinReference {
  nodeName: string;
  pinId: string;
}

interface ParsedNode extends BlueprintNode {
  originalName: string;
  linkedPins: Array<{
    pinId: string;
    direction: "input" | "output";
    references: ParsedPinReference[];
  }>;
}

export interface ParsedBlueprintResult {
  nodes: BlueprintNode[];
  connections: Connection[];
  suggestedTitle: string;
  issues: string[];
}

const objectBlockPattern = /Begin Object[\s\S]*?End Object/g;
const customPinPattern =
  /CustomProperties Pin \(([\s\S]*?)\)\s*(?=(?:CustomProperties Pin \(|End Object|$))/g;

const categoryToPinType = new Map<string, PinType>([
  ["exec", "exec"],
  ["bool", "bool"],
  ["boolean", "bool"],
  ["int", "int"],
  ["integer", "int"],
  ["byte", "int"],
  ["float", "float"],
  ["real", "float"],
  ["double", "float"],
  ["string", "string"],
  ["text", "string"],
  ["name", "string"],
  ["object", "object"],
  ["class", "object"],
  ["softobject", "object"],
  ["interface", "object"],
  ["struct", "struct"],
  ["delegate", "delegate"],
  ["mcdelegate", "delegate"],
]);

const pureFunctionNames = new Set([
  "GetActorForwardVector",
  "GetActorLocation",
  "GetControlRotation",
  "Clamp",
  "Clamp (float)",
  "Float - Float",
  "Float + Float",
  "Float * Float",
  "Float / Float",
  "Add",
  "Subtract",
  "Multiply",
  "Divide",
]);

export function parseBlueprintCode(code: string): ParsedBlueprintResult {
  const normalizedCode = code.trim();

  if (!normalizedCode) {
    return {
      nodes: [],
      connections: [],
      suggestedTitle: "Untitled Blueprint Note",
      issues: ["Paste Blueprint Code to generate an interactive graph."],
    };
  }

  const blocks = normalizedCode.match(objectBlockPattern) ?? [];

  if (!blocks.length) {
    return {
      nodes: [],
      connections: [],
      suggestedTitle: "Untitled Blueprint Note",
      issues: [
        "No Unreal Blueprint object blocks were found. Expected `Begin Object ... End Object` sections.",
      ],
    };
  }

  const parsedNodes = blocks.map((block, index) =>
    parseNodeBlock(block, index),
  );
  const nodeIdByName = new Map(
    parsedNodes.map((node) => [node.originalName, node.id]),
  );
  const connections = buildConnections(parsedNodes, nodeIdByName);
  const issues: string[] = [];

  if (!connections.length && parsedNodes.length > 1) {
    issues.push(
      "Node links were not present in the pasted text, so the preview shows inferred node placement without wires.",
    );
  }

  return {
    nodes: parsedNodes.map(({ linkedPins, originalName, ...node }) => node),
    connections,
    suggestedTitle: suggestTitle(parsedNodes),
    issues,
  };
}

function parseNodeBlock(block: string, index: number): ParsedNode {
  const originalName =
    captureQuoted(block, /Name="([^"]+)"/) ?? `BlueprintNode_${index + 1}`;
  const className = captureValue(block, /Class=([^\s]+)/) ?? "";
  const nodeType = inferNodeType(block, className);
  const position = {
    x:
      Number.parseInt(captureValue(block, /NodePosX=(-?\d+)/) ?? "", 10) ||
      (index % 4) * 360,
    y:
      Number.parseInt(captureValue(block, /NodePosY=(-?\d+)/) ?? "", 10) ||
      Math.floor(index / 4) * 220,
  };
  const comment = captureQuoted(block, /NodeComment="([^"]+)"/)?.replace(
    /\\n/g,
    " ",
  );
  const label = inferNodeLabel(block, className, originalName);
  const pins = parsePins(block, nodeType, label);

  return {
    id: `parsed-node-${index + 1}`,
    originalName,
    type: nodeType,
    name: label,
    position,
    pins: pins.map((pin) => pin.pin),
    comment,
    linkedPins: pins.map((pin) => ({
      pinId: pin.pin.id,
      direction: pin.pin.direction,
      references: pin.references,
    })),
  };
}

function parsePins(block: string, nodeType: NodeType, label: string) {
  const pinSections = Array.from(block.matchAll(customPinPattern));

  if (!pinSections.length) {
    return buildFallbackPins(nodeType, label).map((pin) => ({
      pin,
      references: [] as ParsedPinReference[],
    }));
  }

  return pinSections.map((section, index) => {
    const body = section[1];
    const direction =
      captureValue(body, /Direction="([^"]+)"/) === "EGPD_Output"
        ? "output"
        : "input";
    const name =
      captureQuoted(body, /PinFriendlyName=NSLOCTEXT\([^)]*?,\s*"([^"]+)"\)/) ??
      captureQuoted(body, /PinName="([^"]+)"/) ??
      `${direction}-${index + 1}`;
    const pinId =
      captureValue(body, /PinId=([A-Fa-f0-9]+)/) ??
      `${direction}-${slugify(name)}-${index + 1}`;
    const rawCategory =
      captureQuoted(body, /PinType\.PinCategory="([^"]+)"/) ?? "exec";
    const rawSubCategory =
      captureQuoted(body, /PinType\.PinSubCategoryObject=.*?'([^']+)'/) ?? "";
    const linkedTo = captureValue(body, /LinkedTo=\(([^)]*)\)/) ?? "";
    const references = parseLinkedPins(linkedTo);

    return {
      pin: {
        id: pinId,
        name: normalizePinName(name),
        type: inferPinType(rawCategory, rawSubCategory, name),
        direction,
        connected: references.length > 0,
        defaultValue: captureQuoted(body, /DefaultValue="([^"]+)"/),
      } satisfies Pin,
      references,
    };
  });
}

function buildFallbackPins(nodeType: NodeType, label: string): Pin[] {
  switch (nodeType) {
    case "event":
      return [
        {
          id: "exec-out",
          name: "Exec",
          type: "exec",
          direction: "output",
          connected: false,
        },
      ];
    case "variable-get":
      return [
        {
          id: "value-out",
          name: "Value",
          type: "float",
          direction: "output",
          connected: false,
        },
      ];
    case "variable-set":
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
    case "cast":
      return [
        {
          id: "exec-in",
          name: "Exec",
          type: "exec",
          direction: "input",
          connected: false,
        },
        {
          id: "object-in",
          name: "Object",
          type: "object",
          direction: "input",
          connected: false,
        },
        {
          id: "exec-success",
          name: "Cast Succeeded",
          type: "exec",
          direction: "output",
          connected: false,
        },
        {
          id: "cast-result",
          name: "As Target",
          type: "object",
          direction: "output",
          connected: false,
        },
      ];
    case "branch":
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
    default:
      if (
        pureFunctionNames.has(label) ||
        /^Get[A-Z]/.test(label.replace(/\s+/g, ""))
      ) {
        return [
          {
            id: "value-out",
            name: "Return Value",
            type: "float",
            direction: "output",
            connected: false,
          },
        ];
      }

      return [
        {
          id: "exec-in",
          name: "Exec",
          type: "exec",
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
  }
}

function buildConnections(
  nodes: ParsedNode[],
  nodeIdByName: Map<string, string>,
) {
  const dedupe = new Set<string>();
  const connections: Connection[] = [];

  nodes.forEach((node) => {
    node.linkedPins.forEach((linkedPin) => {
      if (linkedPin.direction !== "output") return;

      linkedPin.references.forEach((reference) => {
        const targetNodeId = nodeIdByName.get(reference.nodeName);

        if (!targetNodeId) return;

        const key = [
          node.id,
          linkedPin.pinId,
          targetNodeId,
          reference.pinId,
        ].join("::");

        if (dedupe.has(key)) return;

        dedupe.add(key);
        connections.push({
          id: `parsed-connection-${connections.length + 1}`,
          from: { nodeId: node.id, pinId: linkedPin.pinId },
          to: { nodeId: targetNodeId, pinId: reference.pinId },
        });
      });
    });
  });

  return connections;
}

function parseLinkedPins(value: string) {
  return Array.from(value.matchAll(/([A-Za-z0-9_]+)\s+([A-Fa-f0-9]+)/g)).map(
    (match) => ({
      nodeName: match[1],
      pinId: match[2],
    }),
  );
}

function inferNodeType(block: string, className: string): NodeType {
  if (
    className.includes("InputAction") ||
    className.includes("ActorBoundEvent") ||
    className.includes("Event")
  ) {
    return "event";
  }

  if (className.includes("DynamicCast")) {
    return "cast";
  }

  if (className.includes("VariableGet")) {
    return "variable-get";
  }

  if (className.includes("VariableSet")) {
    return "variable-set";
  }

  if (className.includes("IfThenElse")) {
    return "branch";
  }

  if (className.includes("MacroInstance")) {
    return "macro";
  }

  if (className.includes("MakeArray") || className.includes("Array")) {
    return "array";
  }

  if (block.includes("NodeComment=")) {
    return "comment";
  }

  return "function-call";
}

function inferNodeLabel(
  block: string,
  className: string,
  fallbackName: string,
) {
  const functionName = captureQuoted(
    block,
    /FunctionReference=\(MemberName="([^"]+)"/,
  );

  if (functionName) {
    return prettifyIdentifier(functionName);
  }

  const inputAction = captureQuoted(block, /InputActionName="([^"]+)"/);

  if (inputAction) {
    return prettifyIdentifier(inputAction.replace(/^IA_/, "InputAction "));
  }

  const eventName =
    captureQuoted(block, /EventReference=\([^)]*MemberName="([^"]+)"/) ??
    captureQuoted(block, /DelegatePropertyName="([^"]+)"/);

  if (eventName) {
    return prettifyIdentifier(eventName.replace(/^On/, "Event "));
  }

  const variableName =
    captureQuoted(block, /VariableReference=\(MemberName="([^"]+)"/) ??
    captureQuoted(block, /MemberVariableToSet=\(MemberName="([^"]+)"/);

  if (variableName) {
    return `${className.includes("Set") ? "Set" : "Get"} ${prettifyIdentifier(variableName)}`;
  }

  const targetType = captureQuoted(block, /TargetType=.*?'([^']+)'/);

  if (className.includes("DynamicCast") && targetType) {
    const shortName = targetType.split(".").pop() ?? targetType;
    return `Cast to ${prettifyIdentifier(shortName)}`;
  }

  return prettifyIdentifier(
    fallbackName.replace(/^K2Node_/, "").replace(/_/g, " "),
  );
}

function inferPinType(
  category: string,
  subCategory: string,
  name: string,
): PinType {
  const normalizedCategory = category.toLowerCase();
  const mapped = categoryToPinType.get(normalizedCategory);

  if (mapped) {
    return mapped;
  }

  if (/vector|rotator|transform/i.test(subCategory)) {
    return "struct";
  }

  if (/bool|condition/i.test(name)) {
    return "bool";
  }

  if (/string|text|name/i.test(name)) {
    return "string";
  }

  if (/object|actor|component|target/i.test(name)) {
    return "object";
  }

  if (/index|count|id/i.test(name)) {
    return "int";
  }

  return "float";
}

function suggestTitle(nodes: ParsedNode[]) {
  const anchor = nodes.find((node) => node.type === "event") ?? nodes[0];

  if (!anchor) {
    return "Untitled Blueprint Note";
  }

  return anchor.name;
}

function captureQuoted(value: string, expression: RegExp) {
  return captureValue(value, expression);
}

function captureValue(value: string, expression: RegExp) {
  const match = value.match(expression);
  return match?.[1];
}

function prettifyIdentifier(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizePinName(value: string) {
  return prettifyIdentifier(value)
    .replace(/^Execute$/, "Exec")
    .replace(/^Then$/, "Then");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
