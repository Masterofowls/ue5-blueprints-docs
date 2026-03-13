import type { CategoryInfo } from "../types/blueprint";

export const categories: CategoryInfo[] = [
  {
    id: "basics",
    name: "Basics",
    description: "Fundamental blueprint concepts and building blocks",
    icon: "📚",
    color: "#4299E1",
  },
  {
    id: "character",
    name: "Character Blueprints",
    description: "Player characters, NPCs, and character movement",
    icon: "🎮",
    color: "#48BB78",
  },
  {
    id: "level",
    name: "Level Blueprints",
    description: "Level scripting, triggers, and world interactions",
    icon: "🗺️",
    color: "#9F7AEA",
  },
  {
    id: "animation",
    name: "Animation",
    description: "Animation blueprints, montages, and blend spaces",
    icon: "💃",
    color: "#ED8936",
  },
  {
    id: "ai",
    name: "AI & Behavior",
    description: "Behavior trees, AI controllers, and enemy logic",
    icon: "🤖",
    color: "#E53E3E",
  },
  {
    id: "interface",
    name: "Interfaces",
    description: "Blueprint interfaces for communication between blueprints",
    icon: "🔌",
    color: "#38B2AC",
  },
  {
    id: "physics",
    name: "Physics",
    description: "Physics simulation, collision, and forces",
    icon: "⚡",
    color: "#D69E2E",
  },
  {
    id: "networking",
    name: "Networking",
    description: "Multiplayer, replication, and server/client logic",
    icon: "🌐",
    color: "#3182CE",
  },
  {
    id: "gameplay",
    name: "Gameplay",
    description: "Game mechanics, scoring, inventory, and progression",
    icon: "🎯",
    color: "#805AD5",
  },
  {
    id: "ui",
    name: "UI & HUD",
    description: "User interfaces, menus, and HUD widgets",
    icon: "🖥️",
    color: "#DD6B20",
  },
  {
    id: "materials",
    name: "Materials",
    description: "Material instances and parameter manipulation",
    icon: "🎨",
    color: "#C53030",
  },
  {
    id: "particles",
    name: "Particles & VFX",
    description: "Particle systems, Niagara, and visual effects",
    icon: "✨",
    color: "#B83280",
  },
  {
    id: "audio",
    name: "Audio",
    description: "Sound cues, audio playback, and music systems",
    icon: "🔊",
    color: "#319795",
  },
  {
    id: "utilities",
    name: "Utilities",
    description: "Helper functions, macros, and common utilities",
    icon: "🛠️",
    color: "#718096",
  },
];

export function getCategoryById(id: string): CategoryInfo | undefined {
  return categories.find((cat) => cat.id === id);
}

export function getCategoryColor(id: string): string {
  const category = getCategoryById(id);
  return category?.color || "#718096";
}
