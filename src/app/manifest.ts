import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Trakr", short_name: "Trakr", start_url: "/today", display: "standalone",
    background_color: "#0b0c0e", theme_color: "#0b0c0e",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
