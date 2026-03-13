import { ClassicPreset, NodeEditor } from "rete";
import type { GetSchemes } from "rete";
import { DataflowEngine } from "rete-engine";
import type {
  BlueprintNode,
  Connection as BlueprintConnection,
  Pin,
} from "@/lib/types/blueprint";

type LiveControlValues = Record<string, string>;

export interface EvaluatedValue {
  kind: "scalar" | "color" | "uv" | "unknown";
  expression: string;
  preview: string;
  numeric?: number;
}

interface MaterialSurface {
  kind: "material";
  baseColor: EvaluatedValue;
  roughness: EvaluatedValue;
  emissive: EvaluatedValue;
  code: string;
}

export interface MaterialEvaluationResult {
  rootNodeId: string;
  rootNodeName: string;
  code: string;
  summary: {
    baseColor: EvaluatedValue;
    roughness: EvaluatedValue;
    emissive: EvaluatedValue;
  };
  intermediate: Array<{
    nodeId: string;
    nodeName: string;
    outputs: Record<string, EvaluatedValue>;
  }>;
}

type DataflowNodeContract = {
  data(inputs: Record<string, unknown>): Record<string, unknown>;
};

const dataflowSocket = new ClassicPreset.Socket("dataflow");

class MaterialDataflowNode
  extends ClassicPreset.Node
  implements DataflowNodeContract
{
  blueprintNode: BlueprintNode;
  liveControlValues: LiveControlValues;
  pinMap: Map<string, Pin>;

  constructor(
    blueprintNode: BlueprintNode,
    liveControlValues: LiveControlValues,
  ) {
    super(blueprintNode.name);
    this.id = blueprintNode.id;
    this.blueprintNode = blueprintNode;
    this.liveControlValues = liveControlValues;
    this.pinMap = new Map(blueprintNode.pins.map((pin) => [pin.id, pin]));

    blueprintNode.pins.forEach((pin) => {
      if (pin.direction === "input") {
        this.addInput(
          pin.id,
          new ClassicPreset.Input(dataflowSocket, pin.name),
        );
      } else {
        this.addOutput(
          pin.id,
          new ClassicPreset.Output(dataflowSocket, pin.name),
        );
      }
    });
  }

  data(inputs: Record<string, unknown>) {
    const normalizedName = this.blueprintNode.name.toLowerCase();

    if (/texture coordinate/.test(normalizedName)) {
      return this.singleOutput(
        this.firstOutputId(),
        createValue("uv", "TexCoord[0]", "UV0"),
      );
    }

    if (/multiply uv scale/.test(normalizedName)) {
      const uv = this.readInput(
        inputs,
        "uv-in",
        createValue("uv", "TexCoord[0]", "UV0"),
      );
      const scale = this.readInput(
        inputs,
        "scale-in",
        this.defaultValue("scale-in", "scalar"),
      );

      return this.singleOutput(
        this.firstOutputId(),
        createValue(
          "uv",
          `${uv.expression} * ${scale.expression}`,
          `${uv.preview} scaled by ${scale.preview}`,
        ),
      );
    }

    if (/sample( base)? texture/.test(normalizedName)) {
      const uv = this.readInput(
        inputs,
        "uv-in",
        createValue("uv", "TexCoord[0]", "UV0"),
      );

      return this.singleOutput(
        this.firstOutputId(),
        createValue(
          "color",
          `TextureSample(${uv.expression})`,
          `Texture sampled at ${uv.preview}`,
        ),
      );
    }

    if (/vector parameter tint/.test(normalizedName)) {
      const outputId = this.firstOutputId();

      return this.singleOutput(
        outputId,
        outputId
          ? this.defaultValue(outputId, "color")
          : createValue("color", "Tint", "Tint"),
      );
    }

    if (/multiply tint/.test(normalizedName)) {
      const baseColor = this.readInput(
        inputs,
        "a-in",
        createValue("color", "BaseColor", "Base color"),
      );
      const tint = this.readInput(
        inputs,
        "b-in",
        createValue("color", "Tint", "Tint"),
      );

      return this.singleOutput(
        this.firstOutputId(),
        createValue(
          "color",
          `${baseColor.expression} * ${tint.expression}`,
          `${baseColor.preview} tinted by ${tint.preview}`,
        ),
      );
    }

    if (/fresnel/.test(normalizedName)) {
      const exponent = this.readInput(
        inputs,
        "exp-in",
        this.defaultValue("exp-in", "scalar"),
      );
      const numeric =
        typeof exponent.numeric === "number"
          ? Math.pow(0.5, exponent.numeric)
          : undefined;

      return this.singleOutput(
        this.firstOutputId(),
        createValue(
          "scalar",
          `Fresnel(${exponent.expression})`,
          numeric === undefined
            ? `Fresnel with exponent ${exponent.preview}`
            : numeric.toFixed(3),
          numeric,
        ),
      );
    }

    if (/lerp emissive/.test(normalizedName)) {
      const valueA = this.readInput(
        inputs,
        "a-in",
        this.defaultValue("a-in", "scalar"),
      );
      const valueB = this.readInput(
        inputs,
        "b-in",
        this.defaultValue("b-in", "scalar"),
      );
      const alpha = this.readInput(
        inputs,
        "alpha-in",
        createValue("scalar", "Alpha", "Alpha"),
      );
      const numeric =
        typeof valueA.numeric === "number" &&
        typeof valueB.numeric === "number" &&
        typeof alpha.numeric === "number"
          ? valueA.numeric + (valueB.numeric - valueA.numeric) * alpha.numeric
          : undefined;

      return this.singleOutput(
        this.firstOutputId(),
        createValue(
          "scalar",
          `lerp(${valueA.expression}, ${valueB.expression}, ${alpha.expression})`,
          numeric === undefined
            ? `${valueA.preview} -> ${valueB.preview}`
            : numeric.toFixed(3),
          numeric,
        ),
      );
    }

    if (/material output/.test(normalizedName)) {
      const baseColor = this.readInput(
        inputs,
        "base-color-in",
        createValue("color", "float3(1,1,1)", "Default base color"),
      );
      const roughness = this.readInput(
        inputs,
        "roughness-in",
        this.defaultValue("roughness-in", "scalar"),
      );
      const emissive = this.readInput(
        inputs,
        "emissive-in",
        createValue("scalar", "0.0", "0.0", 0),
      );
      const code = [
        `BaseColor = ${baseColor.expression};`,
        `Roughness = ${roughness.expression};`,
        `Emissive = ${emissive.expression};`,
      ].join("\n");

      return {
        material: {
          kind: "material",
          baseColor,
          roughness,
          emissive,
          code,
        } satisfies MaterialSurface,
      };
    }

    if (["add", "subtract", "multiply", "divide"].includes(normalizedName)) {
      const valueA = this.readInput(
        inputs,
        "a-in",
        this.defaultValue("a-in", "scalar"),
      );
      const valueB = this.readInput(
        inputs,
        "b-in",
        this.defaultValue("b-in", "scalar"),
      );
      const operator =
        normalizedName === "add"
          ? "+"
          : normalizedName === "subtract"
            ? "-"
            : normalizedName === "multiply"
              ? "*"
              : "/";
      const numeric =
        typeof valueA.numeric === "number" && typeof valueB.numeric === "number"
          ? applyOperator(valueA.numeric, valueB.numeric, operator)
          : undefined;

      return this.singleOutput(
        this.firstOutputId(),
        createValue(
          "scalar",
          `(${valueA.expression} ${operator} ${valueB.expression})`,
          numeric === undefined
            ? `${valueA.preview} ${operator} ${valueB.preview}`
            : numeric.toFixed(3),
          numeric,
        ),
      );
    }

    if (this.blueprintNode.type === "variable-get") {
      const outputId = this.firstOutputId();

      if (!outputId) {
        return {};
      }

      return this.singleOutput(
        outputId,
        this.defaultValue(outputId, "unknown"),
      );
    }

    const fallbackOutput = this.firstOutputId();

    if (!fallbackOutput) {
      return {};
    }

    const connectedInput = this.blueprintNode.pins.find(
      (pin) => pin.direction === "input",
    );

    return this.singleOutput(
      fallbackOutput,
      connectedInput
        ? this.readInput(
            inputs,
            connectedInput.id,
            this.defaultValue(connectedInput.id, "unknown"),
          )
        : createValue(
            "unknown",
            this.blueprintNode.name,
            this.blueprintNode.name,
          ),
    );
  }

  private firstOutputId() {
    return this.blueprintNode.pins.find((pin) => pin.direction === "output")
      ?.id;
  }

  private singleOutput(outputId: string | undefined, value: EvaluatedValue) {
    return outputId ? { [outputId]: value } : {};
  }

  private readInput(
    inputs: Record<string, unknown>,
    pinId: string,
    fallback: EvaluatedValue,
  ) {
    const rawValue = inputs[pinId];

    if (Array.isArray(rawValue) && rawValue.length > 0) {
      return normalizeEvaluatedValue(rawValue[0], fallback.kind);
    }

    return fallback;
  }

  private defaultValue(pinId: string, fallbackKind: EvaluatedValue["kind"]) {
    const pin = this.pinMap.get(pinId);
    const rawValue =
      this.liveControlValues[getControlKey(this.blueprintNode.id, pinId)] ??
      pin?.defaultValue ??
      "0.0";

    return inferValueFromLiteral(rawValue, fallbackKind);
  }
}

type EngineScheme = GetSchemes<
  MaterialDataflowNode & DataflowNodeContract,
  ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;

export async function evaluateMaterialDataflow(
  nodes: BlueprintNode[],
  connections: BlueprintConnection[],
  liveControlValues: LiveControlValues,
) {
  const materialOutputNode = nodes.find((node) =>
    /material output/i.test(node.name),
  );

  if (!materialOutputNode) {
    return null;
  }

  const editor = new NodeEditor<EngineScheme>();
  const engine = new DataflowEngine<EngineScheme>((node) => ({
    inputs: () => Object.keys(node.inputs),
    outputs: () =>
      /material output/i.test(node.blueprintNode.name)
        ? ["material"]
        : Object.keys(node.outputs),
  }));
  const nodeMap = new Map<string, MaterialDataflowNode>();

  editor.use(engine);

  for (const blueprintNode of nodes) {
    const engineNode = new MaterialDataflowNode(
      blueprintNode,
      liveControlValues,
    );
    await editor.addNode(engineNode);
    nodeMap.set(blueprintNode.id, engineNode);
  }

  for (const blueprintConnection of connections) {
    const sourceNode = nodeMap.get(blueprintConnection.from.nodeId);
    const targetNode = nodeMap.get(blueprintConnection.to.nodeId);

    if (!sourceNode || !targetNode) continue;
    if (!sourceNode.outputs[blueprintConnection.from.pinId]) continue;
    if (!targetNode.inputs[blueprintConnection.to.pinId]) continue;

    await editor.addConnection(
      new ClassicPreset.Connection(
        sourceNode as ClassicPreset.Node,
        blueprintConnection.from.pinId,
        targetNode as ClassicPreset.Node,
        blueprintConnection.to.pinId,
      ),
    );
  }

  const root = (await engine.fetch(materialOutputNode.id)) as {
    material: MaterialSurface;
  };
  const intermediate = await Promise.all(
    nodes
      .filter(
        (node) =>
          node.pins.some((pin) => pin.direction === "output") &&
          !/material output/i.test(node.name),
      )
      .map(async (node) => {
        const outputs = (await engine.fetch(node.id)) as Record<
          string,
          unknown
        >;

        return {
          nodeId: node.id,
          nodeName: node.name,
          outputs: Object.fromEntries(
            Object.entries(outputs).map(([key, value]) => [
              key,
              normalizeEvaluatedValue(value, "unknown"),
            ]),
          ),
        };
      }),
  );

  return {
    rootNodeId: materialOutputNode.id,
    rootNodeName: materialOutputNode.name,
    code: root.material.code,
    summary: {
      baseColor: root.material.baseColor,
      roughness: root.material.roughness,
      emissive: root.material.emissive,
    },
    intermediate,
  } satisfies MaterialEvaluationResult;
}

function getControlKey(nodeId: string, pinId: string) {
  return `${nodeId}:${pinId}`;
}

function createValue(
  kind: EvaluatedValue["kind"],
  expression: string,
  preview: string,
  numeric?: number,
): EvaluatedValue {
  return {
    kind,
    expression,
    preview,
    numeric,
  };
}

function inferValueFromLiteral(
  rawValue: string,
  fallbackKind: EvaluatedValue["kind"],
) {
  const numeric = Number(rawValue);

  if (Number.isFinite(numeric)) {
    return createValue("scalar", rawValue, rawValue, numeric);
  }

  return createValue(fallbackKind, rawValue, rawValue);
}

function normalizeEvaluatedValue(
  value: unknown,
  fallbackKind: EvaluatedValue["kind"],
): EvaluatedValue {
  if (isEvaluatedValue(value)) {
    return value;
  }

  if (typeof value === "number") {
    return createValue("scalar", String(value), String(value), value);
  }

  if (typeof value === "string") {
    return inferValueFromLiteral(value, fallbackKind);
  }

  return createValue(fallbackKind, String(value), String(value));
}

function isEvaluatedValue(value: unknown): value is EvaluatedValue {
  return Boolean(
    value &&
    typeof value === "object" &&
    "expression" in value &&
    "preview" in value,
  );
}

function applyOperator(left: number, right: number, operator: string) {
  switch (operator) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      return right === 0 ? 0 : left / right;
    default:
      return left;
  }
}
