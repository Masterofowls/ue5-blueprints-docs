import type { Blueprint } from "../types/blueprint";

// 1. Basic Character Movement Blueprint
export const characterMovementBlueprint: Blueprint = {
  id: "character-movement-basic",
  title: "Basic Character Movement",
  description:
    "Simple forward/backward movement with input handling for third-person character using Enhanced Input System",
  category: "character",
  difficulty: "beginner",
  ueVersion: "5.7",
  tags: ["movement", "input", "character", "enhanced-input"],
  author: "Documentation Team",
  createdAt: "2026-03-13",
  updatedAt: "2026-03-13",
  nodes: [
    {
      id: "node-1",
      type: "event",
      name: "InputAction MoveForward",
      position: { x: 0, y: 0 },
      pins: [
        {
          id: "exec-out",
          name: "Triggered",
          type: "exec",
          direction: "output",
          connected: true,
        },
        {
          id: "value-out",
          name: "Action Value",
          type: "float",
          direction: "output",
          connected: true,
        },
      ],
    },
    {
      id: "node-2",
      type: "function-call",
      name: "Add Movement Input",
      position: { x: 320, y: 0 },
      pins: [
        {
          id: "exec-in",
          name: "",
          type: "exec",
          direction: "input",
          connected: true,
        },
        {
          id: "world-dir",
          name: "World Direction",
          type: "struct",
          direction: "input",
          connected: true,
        },
        {
          id: "scale",
          name: "Scale Value",
          type: "float",
          direction: "input",
          connected: true,
        },
      ],
    },
    {
      id: "node-3",
      type: "function-call",
      name: "Get Actor Forward Vector",
      position: { x: 0, y: 120 },
      pins: [
        {
          id: "vector-out",
          name: "Return Value",
          type: "struct",
          direction: "output",
          connected: true,
        },
      ],
    },
  ],
  connections: [
    {
      id: "conn-1",
      from: { nodeId: "node-1", pinId: "exec-out" },
      to: { nodeId: "node-2", pinId: "exec-in" },
    },
    {
      id: "conn-2",
      from: { nodeId: "node-3", pinId: "vector-out" },
      to: { nodeId: "node-2", pinId: "world-dir" },
    },
    {
      id: "conn-3",
      from: { nodeId: "node-1", pinId: "value-out" },
      to: { nodeId: "node-2", pinId: "scale" },
    },
  ],
  code: `Begin Object Class=/Script/BlueprintGraph.K2Node_InputAction Name="K2Node_InputAction_MoveForward"
   InputActionName="IA_MoveForward"
   NodePosX=0
   NodePosY=0
   NodeGuid=4D8A3B4C4F6E8A1B2C3D4E5F6A7B8C9D
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_AddMovementInput"
   FunctionReference=(MemberName="AddMovementInput")
   NodePosX=320
   NodePosY=0
   NodeGuid=5E9B4C5D6F7E9A2C3D4E5F6A7B8C9D0E
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_GetActorForward"
   FunctionReference=(MemberName="GetActorForwardVector")
   NodePosX=0
   NodePosY=120
   NodeGuid=6F0C5D6E7F8E0A3D4E5F6A7B8C9D0E1F
End Object`,
  thumbnail: "/images/blueprints/character-movement.png",
};

// 2. Simple Door Opening Blueprint
export const doorOpenBlueprint: Blueprint = {
  id: "simple-door-open",
  title: "Automatic Door Opening",
  description:
    "Interactive door that opens smoothly when player overlaps a trigger box using Timeline for smooth animation",
  category: "level",
  difficulty: "beginner",
  ueVersion: "5.7",
  tags: ["interaction", "overlap", "doors", "timeline", "level-design"],
  author: "Documentation Team",
  createdAt: "2026-03-13",
  updatedAt: "2026-03-13",
  nodes: [
    {
      id: "node-1",
      type: "event",
      name: "ActorBeginOverlap",
      position: { x: 0, y: 0 },
      pins: [
        {
          id: "exec-out",
          name: "",
          type: "exec",
          direction: "output",
          connected: true,
        },
        {
          id: "other-actor",
          name: "Other Actor",
          type: "object",
          direction: "output",
          connected: true,
        },
      ],
    },
    {
      id: "node-2",
      type: "cast",
      name: "Cast to Character",
      position: { x: 320, y: 0 },
      pins: [
        {
          id: "exec-in",
          name: "",
          type: "exec",
          direction: "input",
          connected: true,
        },
        {
          id: "exec-success",
          name: "Cast Succeeded",
          type: "exec",
          direction: "output",
          connected: true,
        },
        {
          id: "exec-fail",
          name: "Cast Failed",
          type: "exec",
          direction: "output",
          connected: false,
        },
        {
          id: "object-in",
          name: "Object",
          type: "object",
          direction: "input",
          connected: true,
        },
      ],
    },
    {
      id: "node-3",
      type: "function-call",
      name: "Timeline Play",
      position: { x: 640, y: 0 },
      pins: [
        {
          id: "exec-in",
          name: "",
          type: "exec",
          direction: "input",
          connected: true,
        },
      ],
      comment: "Plays door animation timeline",
    },
  ],
  connections: [
    {
      id: "conn-1",
      from: { nodeId: "node-1", pinId: "exec-out" },
      to: { nodeId: "node-2", pinId: "exec-in" },
    },
    {
      id: "conn-2",
      from: { nodeId: "node-1", pinId: "other-actor" },
      to: { nodeId: "node-2", pinId: "object-in" },
    },
    {
      id: "conn-3",
      from: { nodeId: "node-2", pinId: "exec-success" },
      to: { nodeId: "node-3", pinId: "exec-in" },
    },
  ],
  code: `Begin Object Class=/Script/BlueprintGraph.K2Node_ActorBoundEvent Name="K2Node_ActorBoundEvent_BeginOverlap"
   DelegatePropertyName="OnActorBeginOverlap"
   EventReference=(MemberParent="/Script/Engine.Actor",MemberName="OnActorBeginOverlap")
   bInternalEvent=True
   NodePosX=0
   NodePosY=0
   NodeGuid=1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_DynamicCast Name="K2Node_DynamicCast_Character"
   TargetType=/Script/CoreUObject.Class'/Script/Engine.Character'
   NodePosX=320
   NodePosY=0
   NodeGuid=2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_TimelinePlay"
   FunctionReference=(MemberName="Play",MemberGuid=(A=1234567890,B=1234567890))
   NodePosX=640
   NodePosY=0
   NodeGuid=3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F
End Object`,
  thumbnail: "/images/blueprints/door-open.png",
};

// 3. Health System Blueprint
export const healthSystemBlueprint: Blueprint = {
  id: "health-system-basic",
  title: "Basic Health System",
  description:
    "Complete health system with damage handling, death check, and health clamping",
  category: "gameplay",
  difficulty: "intermediate",
  ueVersion: "5.7",
  tags: ["health", "damage", "gameplay", "variables"],
  author: "Documentation Team",
  createdAt: "2026-03-13",
  updatedAt: "2026-03-13",
  nodes: [
    {
      id: "node-1",
      type: "event",
      name: "Event AnyDamage",
      position: { x: 0, y: 0 },
      pins: [
        {
          id: "exec-out",
          name: "",
          type: "exec",
          direction: "output",
          connected: true,
        },
        {
          id: "damage",
          name: "Damage",
          type: "float",
          direction: "output",
          connected: true,
        },
      ],
    },
    {
      id: "node-2",
      type: "variable-get",
      name: "GET Health",
      position: { x: 0, y: 120 },
      pins: [
        {
          id: "value-out",
          name: "Health",
          type: "float",
          direction: "output",
          connected: true,
        },
      ],
    },
    {
      id: "node-3",
      type: "function-call",
      name: "Float - Float",
      position: { x: 320, y: 60 },
      pins: [
        {
          id: "a",
          name: "A",
          type: "float",
          direction: "input",
          connected: true,
        },
        {
          id: "b",
          name: "B",
          type: "float",
          direction: "input",
          connected: true,
        },
        {
          id: "result",
          name: "",
          type: "float",
          direction: "output",
          connected: true,
        },
      ],
    },
    {
      id: "node-4",
      type: "function-call",
      name: "Clamp (float)",
      position: { x: 640, y: 0 },
      pins: [
        {
          id: "exec-in",
          name: "",
          type: "exec",
          direction: "input",
          connected: true,
        },
        {
          id: "value",
          name: "Value",
          type: "float",
          direction: "input",
          connected: true,
        },
        {
          id: "min",
          name: "Min",
          type: "float",
          direction: "input",
          connected: false,
          defaultValue: "0.0",
        },
        {
          id: "max",
          name: "Max",
          type: "float",
          direction: "input",
          connected: false,
          defaultValue: "100.0",
        },
        {
          id: "exec-out",
          name: "",
          type: "exec",
          direction: "output",
          connected: true,
        },
        {
          id: "result",
          name: "Return Value",
          type: "float",
          direction: "output",
          connected: true,
        },
      ],
    },
    {
      id: "node-5",
      type: "variable-set",
      name: "SET Health",
      position: { x: 960, y: 0 },
      pins: [
        {
          id: "exec-in",
          name: "",
          type: "exec",
          direction: "input",
          connected: true,
        },
        {
          id: "value-in",
          name: "Health",
          type: "float",
          direction: "input",
          connected: true,
        },
        {
          id: "exec-out",
          name: "",
          type: "exec",
          direction: "output",
          connected: true,
        },
      ],
    },
    {
      id: "node-6",
      type: "branch",
      name: "Branch",
      position: { x: 1280, y: 0 },
      pins: [
        {
          id: "exec-in",
          name: "",
          type: "exec",
          direction: "input",
          connected: true,
        },
        {
          id: "condition",
          name: "Condition",
          type: "bool",
          direction: "input",
          connected: true,
        },
        {
          id: "exec-true",
          name: "True",
          type: "exec",
          direction: "output",
          connected: true,
        },
        {
          id: "exec-false",
          name: "False",
          type: "exec",
          direction: "output",
          connected: false,
        },
      ],
    },
    {
      id: "node-7",
      type: "function-call",
      name: "<= (float)",
      position: { x: 960, y: 140 },
      pins: [
        {
          id: "a",
          name: "A",
          type: "float",
          direction: "input",
          connected: true,
        },
        {
          id: "b",
          name: "B",
          type: "float",
          direction: "input",
          connected: false,
          defaultValue: "0.0",
        },
        {
          id: "result",
          name: "",
          type: "bool",
          direction: "output",
          connected: true,
        },
      ],
    },
    {
      id: "node-8",
      type: "variable-get",
      name: "GET Health",
      position: { x: 640, y: 180 },
      pins: [
        {
          id: "value-out",
          name: "Health",
          type: "float",
          direction: "output",
          connected: true,
        },
      ],
    },
    {
      id: "node-9",
      type: "function-call",
      name: "Print String",
      position: { x: 1600, y: 0 },
      pins: [
        {
          id: "exec-in",
          name: "",
          type: "exec",
          direction: "input",
          connected: true,
        },
        {
          id: "string",
          name: "In String",
          type: "string",
          direction: "input",
          connected: false,
          defaultValue: "Player Died!",
        },
      ],
      comment: "Death notification",
    },
  ],
  connections: [
    {
      id: "conn-1",
      from: { nodeId: "node-1", pinId: "exec-out" },
      to: { nodeId: "node-4", pinId: "exec-in" },
    },
    {
      id: "conn-2",
      from: { nodeId: "node-2", pinId: "value-out" },
      to: { nodeId: "node-3", pinId: "a" },
    },
    {
      id: "conn-3",
      from: { nodeId: "node-1", pinId: "damage" },
      to: { nodeId: "node-3", pinId: "b" },
    },
    {
      id: "conn-4",
      from: { nodeId: "node-3", pinId: "result" },
      to: { nodeId: "node-4", pinId: "value" },
    },
    {
      id: "conn-5",
      from: { nodeId: "node-4", pinId: "exec-out" },
      to: { nodeId: "node-5", pinId: "exec-in" },
    },
    {
      id: "conn-6",
      from: { nodeId: "node-4", pinId: "result" },
      to: { nodeId: "node-5", pinId: "value-in" },
    },
    {
      id: "conn-7",
      from: { nodeId: "node-5", pinId: "exec-out" },
      to: { nodeId: "node-6", pinId: "exec-in" },
    },
    {
      id: "conn-8",
      from: { nodeId: "node-8", pinId: "value-out" },
      to: { nodeId: "node-7", pinId: "a" },
    },
    {
      id: "conn-9",
      from: { nodeId: "node-7", pinId: "result" },
      to: { nodeId: "node-6", pinId: "condition" },
    },
    {
      id: "conn-10",
      from: { nodeId: "node-6", pinId: "exec-true" },
      to: { nodeId: "node-9", pinId: "exec-in" },
    },
  ],
  code: `Begin Object Class=/Script/BlueprintGraph.K2Node_Event Name="K2Node_Event_AnyDamage"
   EventReference=(MemberParent="/Script/Engine.Actor",MemberName="ReceiveAnyDamage")
   bOverrideFunction=True
   NodePosX=0
   NodePosY=0
   NodeGuid=7D8E9F0A1B2C3D4E5F6A7B8C9D0E1F2A
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_VariableGet Name="K2Node_VariableGet_Health_1"
   VariableReference=(MemberName="Health",MemberGuid=8E9F0A1B2C3D4E5F6A7B8C9D0E1F2A3B)
   NodePosX=0
   NodePosY=120
   NodeGuid=8E9F0A1B2C3D4E5F6A7B8C9D0E1F2A3B
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_Subtract"
   FunctionReference=(MemberName="Subtract_FloatFloat")
   NodePosX=320
   NodePosY=60
   NodeGuid=9F0A1B2C3D4E5F6A7B8C9D0E1F2A3B4C
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_Clamp"
   FunctionReference=(MemberName="FClamp")
   NodePosX=640
   NodePosY=0
   NodeGuid=0A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_VariableSet Name="K2Node_VariableSet_Health"
   VariableReference=(MemberName="Health",MemberGuid=1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E)
   NodePosX=960
   NodePosY=0
   NodeGuid=1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_IfThenElse Name="K2Node_IfThenElse_DeathCheck"
   NodePosX=1280
   NodePosY=0
   NodeGuid=2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F
End Object`,
  thumbnail: "/images/blueprints/health-system.png",
};

// 4. Play Animation Montage Blueprint
export const animationMontageBlueprint: Blueprint = {
  id: "animation-montage-play",
  title: "Play Animation Montage on Input",
  description:
    "Trigger an animation montage when player presses a button, with proper animation system integration",
  category: "animation",
  difficulty: "intermediate",
  ueVersion: "5.7",
  tags: ["animation", "montage", "character", "input"],
  author: "Documentation Team",
  createdAt: "2026-03-13",
  updatedAt: "2026-03-13",
  nodes: [
    {
      id: "node-1",
      type: "event",
      name: "InputAction Attack",
      position: { x: 0, y: 0 },
      pins: [
        {
          id: "exec-out",
          name: "Triggered",
          type: "exec",
          direction: "output",
          connected: true,
        },
      ],
    },
    {
      id: "node-2",
      type: "function-call",
      name: "Get Mesh",
      position: { x: 0, y: 120 },
      pins: [
        {
          id: "mesh-out",
          name: "Return Value",
          type: "object",
          direction: "output",
          connected: true,
        },
      ],
    },
    {
      id: "node-3",
      type: "function-call",
      name: "Play Anim Montage",
      position: { x: 320, y: 0 },
      pins: [
        {
          id: "exec-in",
          name: "",
          type: "exec",
          direction: "input",
          connected: true,
        },
        {
          id: "target",
          name: "Target",
          type: "object",
          direction: "input",
          connected: true,
        },
        {
          id: "montage",
          name: "Anim Montage",
          type: "object",
          direction: "input",
          connected: false,
        },
        {
          id: "exec-out",
          name: "",
          type: "exec",
          direction: "output",
          connected: false,
        },
      ],
      comment: "Attack animation",
    },
  ],
  connections: [
    {
      id: "conn-1",
      from: { nodeId: "node-1", pinId: "exec-out" },
      to: { nodeId: "node-3", pinId: "exec-in" },
    },
    {
      id: "conn-2",
      from: { nodeId: "node-2", pinId: "mesh-out" },
      to: { nodeId: "node-3", pinId: "target" },
    },
  ],
  code: `Begin Object Class=/Script/BlueprintGraph.K2Node_InputAction Name="K2Node_InputAction_Attack"
   InputActionName="IA_Attack"
   NodePosX=0
   NodePosY=0
   NodeGuid=3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_GetMesh"
   FunctionReference=(MemberName="GetMesh")
   NodePosX=0
   NodePosY=120
   NodeGuid=4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_PlayAnimMontage"
   FunctionReference=(MemberName="Montage_Play")
   NodePosX=320
   NodePosY=0
   NodeGuid=5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C
End Object`,
  thumbnail: "/images/blueprints/animation-montage.png",
};

// 5. AI Chase Player Blueprint
export const aiChaseBlueprint: Blueprint = {
  id: "ai-chase-player",
  title: "AI Chase Player",
  description:
    "AI behavior that detects player within range and moves toward them using AI Movement system",
  category: "ai",
  difficulty: "intermediate",
  ueVersion: "5.7",
  tags: ["ai", "pathfinding", "chase", "behavior-tree"],
  author: "Documentation Team",
  createdAt: "2026-03-13",
  updatedAt: "2026-03-13",
  nodes: [
    {
      id: "node-1",
      type: "event",
      name: "Event Tick",
      position: { x: 0, y: 0 },
      pins: [
        {
          id: "exec-out",
          name: "",
          type: "exec",
          direction: "output",
          connected: true,
        },
        {
          id: "delta",
          name: "Delta Seconds",
          type: "float",
          direction: "output",
          connected: false,
        },
      ],
    },
    {
      id: "node-2",
      type: "function-call",
      name: "Get Player Character",
      position: { x: 320, y: 0 },
      pins: [
        {
          id: "exec-in",
          name: "",
          type: "exec",
          direction: "input",
          connected: true,
        },
        {
          id: "exec-out",
          name: "",
          type: "exec",
          direction: "output",
          connected: true,
        },
        {
          id: "player",
          name: "Return Value",
          type: "object",
          direction: "output",
          connected: true,
        },
      ],
    },
    {
      id: "node-3",
      type: "function-call",
      name: "AI MoveTo",
      position: { x: 640, y: 0 },
      pins: [
        {
          id: "exec-in",
          name: "",
          type: "exec",
          direction: "input",
          connected: true,
        },
        {
          id: "pawn",
          name: "Pawn",
          type: "object",
          direction: "input",
          connected: false,
        },
        {
          id: "dest",
          name: "Destination",
          type: "object",
          direction: "input",
          connected: true,
        },
        {
          id: "exec-success",
          name: "On Success",
          type: "exec",
          direction: "output",
          connected: false,
        },
        {
          id: "exec-fail",
          name: "On Fail",
          type: "exec",
          direction: "output",
          connected: false,
        },
      ],
      comment: "Move AI to player location",
    },
  ],
  connections: [
    {
      id: "conn-1",
      from: { nodeId: "node-1", pinId: "exec-out" },
      to: { nodeId: "node-2", pinId: "exec-in" },
    },
    {
      id: "conn-2",
      from: { nodeId: "node-2", pinId: "exec-out" },
      to: { nodeId: "node-3", pinId: "exec-in" },
    },
    {
      id: "conn-3",
      from: { nodeId: "node-2", pinId: "player" },
      to: { nodeId: "node-3", pinId: "dest" },
    },
  ],
  code: `Begin Object Class=/Script/BlueprintGraph.K2Node_Event Name="K2Node_Event_Tick"
   EventReference=(MemberParent="/Script/Engine.Actor",MemberName="ReceiveTick")
   bOverrideFunction=True
   NodePosX=0
   NodePosY=0
   NodeGuid=6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_GetPlayerCharacter"
   FunctionReference=(MemberName="GetPlayerCharacter")
   NodePosX=320
   NodePosY=0
   NodeGuid=7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E
End Object
Begin Object Class=/Script/AIModule.K2Node_AIMoveTo Name="K2Node_AIMoveTo_Chase"
   ProxyFactoryFunctionName="CreateProxyObjectForAIMoveTo"
   ProxyClass=/Script/AIModule.AIAsyncTaskBlueprintProxy
   NodePosX=640
   NodePosY=0
   NodeGuid=8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F
End Object`,
  thumbnail: "/images/blueprints/ai-chase.png",
};

// 6. Apply Physics Impulse Blueprint
export const physicsImpulseBlueprint: Blueprint = {
  id: "physics-impulse",
  title: "Apply Physics Impulse on Hit",
  description:
    "Apply impulse force to physics-enabled objects when they are hit by projectiles",
  category: "physics",
  difficulty: "beginner",
  ueVersion: "5.7",
  tags: ["physics", "force", "impulse", "collision"],
  author: "Documentation Team",
  createdAt: "2026-03-13",
  updatedAt: "2026-03-13",
  nodes: [
    {
      id: "node-1",
      type: "event",
      name: "Event Hit",
      position: { x: 0, y: 0 },
      pins: [
        {
          id: "exec-out",
          name: "",
          type: "exec",
          direction: "output",
          connected: true,
        },
        {
          id: "hit-result",
          name: "Hit",
          type: "struct",
          direction: "output",
          connected: true,
        },
      ],
    },
    {
      id: "node-2",
      type: "function-call",
      name: "Break Hit Result",
      position: { x: 0, y: 140 },
      pins: [
        {
          id: "hit-in",
          name: "Hit",
          type: "struct",
          direction: "input",
          connected: true,
        },
        {
          id: "normal",
          name: "Normal",
          type: "struct",
          direction: "output",
          connected: true,
        },
        {
          id: "component",
          name: "Component",
          type: "object",
          direction: "output",
          connected: true,
        },
      ],
    },
    {
      id: "node-3",
      type: "function-call",
      name: "Vector * Float",
      position: { x: 320, y: 180 },
      pins: [
        {
          id: "vector",
          name: "A",
          type: "struct",
          direction: "input",
          connected: true,
        },
        {
          id: "scalar",
          name: "B",
          type: "float",
          direction: "input",
          connected: false,
          defaultValue: "1000.0",
        },
        {
          id: "result",
          name: "",
          type: "struct",
          direction: "output",
          connected: true,
        },
      ],
    },
    {
      id: "node-4",
      type: "function-call",
      name: "Add Impulse",
      position: { x: 640, y: 0 },
      pins: [
        {
          id: "exec-in",
          name: "",
          type: "exec",
          direction: "input",
          connected: true,
        },
        {
          id: "target",
          name: "Target",
          type: "object",
          direction: "input",
          connected: true,
        },
        {
          id: "impulse",
          name: "Impulse",
          type: "struct",
          direction: "input",
          connected: true,
        },
      ],
      comment: "Apply force to object",
    },
  ],
  connections: [
    {
      id: "conn-1",
      from: { nodeId: "node-1", pinId: "exec-out" },
      to: { nodeId: "node-4", pinId: "exec-in" },
    },
    {
      id: "conn-2",
      from: { nodeId: "node-1", pinId: "hit-result" },
      to: { nodeId: "node-2", pinId: "hit-in" },
    },
    {
      id: "conn-3",
      from: { nodeId: "node-2", pinId: "normal" },
      to: { nodeId: "node-3", pinId: "vector" },
    },
    {
      id: "conn-4",
      from: { nodeId: "node-3", pinId: "result" },
      to: { nodeId: "node-4", pinId: "impulse" },
    },
    {
      id: "conn-5",
      from: { nodeId: "node-2", pinId: "component" },
      to: { nodeId: "node-4", pinId: "target" },
    },
  ],
  code: `Begin Object Class=/Script/BlueprintGraph.K2Node_Event Name="K2Node_Event_Hit"
   EventReference=(MemberParent="/Script/Engine.Actor",MemberName="ReceiveHit")
   bOverrideFunction=True
   NodePosX=0
   NodePosY=0
   NodeGuid=9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F4A
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_BreakStruct Name="K2Node_BreakHitResult"
   StructType=/Script/CoreUObject.ScriptStruct'/Script/Engine.HitResult'
   NodePosX=0
   NodePosY=140
   NodeGuid=0E1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_Multiply"
   FunctionReference=(MemberName="Multiply_VectorFloat")
   NodePosX=320
   NodePosY=180
   NodeGuid=1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_AddImpulse"
   FunctionReference=(MemberName="AddImpulse")
   NodePosX=640
   NodePosY=0
   NodeGuid=2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D
End Object`,
  thumbnail: "/images/blueprints/physics-impulse.png",
};

export const sampleBlueprints: Blueprint[] = [
  characterMovementBlueprint,
  doorOpenBlueprint,
  healthSystemBlueprint,
  animationMontageBlueprint,
  aiChaseBlueprint,
  physicsImpulseBlueprint,
];

export function getBlueprintById(id: string): Blueprint | undefined {
  return sampleBlueprints.find((bp) => bp.id === id);
}

export function getBlueprintsByCategory(category: string): Blueprint[] {
  return sampleBlueprints.filter((bp) => bp.category === category);
}

export function searchBlueprints(searchTerm: string): Blueprint[] {
  const term = searchTerm.toLowerCase();
  return sampleBlueprints.filter(
    (bp) =>
      bp.title.toLowerCase().includes(term) ||
      bp.description.toLowerCase().includes(term) ||
      bp.tags.some((tag) => tag.toLowerCase().includes(term)),
  );
}
