import type { MetadataRoute } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: `${basePath}/`,
    name: "UE5 Blueprints",
    short_name: "UE5 Blueprints",
    description:
      "Advanced Unreal Engine 5 blueprint documentation with interactive visual graphs, offline support, and installable app behavior.",
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#020617",
    theme_color: "#0f172a",
    categories: ["education", "developer", "productivity"],
    lang: "en",
    icons: [
      {
        src: `${basePath}/pwa-icon.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: `${basePath}/pwa-maskable.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Browse Blueprints",
        short_name: "Blueprints",
        url: `${basePath}/blueprints/`,
        icons: [{ src: `${basePath}/pwa-icon.svg`, sizes: "any" }],
      },
      {
        name: "Create Note",
        short_name: "New Note",
        url: `${basePath}/blueprints/new/`,
        icons: [{ src: `${basePath}/pwa-icon.svg`, sizes: "any" }],
      },
      {
        name: "Search",
        short_name: "Search",
        url: `${basePath}/search/`,
        icons: [{ src: `${basePath}/pwa-icon.svg`, sizes: "any" }],
      },
    ],
  };
}
