// Images in public/projects, matched to a project by its exact title.
// Use fit "contain" for logos that shouldn't be cropped.
export const PROJECT_IMAGES: Record<
  string,
  { src: string; fit?: "cover" | "contain" }
> = {
  MarmarArts: { src: "/projects/marmararts.jpg" },
  WeatherCast: { src: "/projects/weathercast.jpg" },
  "Dynamic Portfolio Website": { src: "/projects/portfolio.jpg" },
  "PEWPEWPANIC!": { src: "/projects/pewpewpanic.png", fit: "contain" },
};
