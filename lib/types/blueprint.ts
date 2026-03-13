// Core Blueprint Types for Unreal Engine 5 Documentation

export type NodeType =
  | "event"
  | "function-call"
  | "variable-get"
  | "variable-set"
  | "cast"
  | "branch"
  | "array"
  | "macro"
  | "comment";

export type PinType =
  | "exec"
  | "bool"
  | "int"
  | "float"
  | "string"
  | "object"
  | "struct"
  | "array"
  | "delegate";

export interface Pin {
  id: string;
  name: string;
  type: PinType;
  direction: "input" | "output";
  connected: boolean;
  defaultValue?: string;
  linkedTo?: string[];
}

export interface BlueprintNode {
  id: string;
  type: NodeType;
  name: string;
  position: { x: number; y: number };
  pins: Pin[];
  color?: string;
  comment?: string;
}

export interface Connection {
  id: string;
  from: { nodeId: string; pinId: string };
  to: { nodeId: string; pinId: string };
}

export interface Blueprint {
  id: string;
  title: string;
  description: string;
  category: BlueprintCategory;
  difficulty: "beginner" | "intermediate" | "advanced";
  ueVersion: string;
  nodes: BlueprintNode[];
  connections: Connection[];
  code: string; // The raw UE blueprint text
  thumbnail?: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
}

export type BlueprintCategory =
  | "basics"
  | "character"
  | "level"
  | "animation"
  | "ai"
  | "interface"
  | "physics"
  | "networking"
  | "gameplay"
  | "ui"
  | "materials"
  | "particles"
  | "audio"
  | "utilities";

export interface CategoryInfo {
  id: BlueprintCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface SearchFilters {
  category?: BlueprintCategory;
  difficulty?: string;
  tags?: string[];
  searchTerm?: string;
}
