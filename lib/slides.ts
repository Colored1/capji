export type SlideMedia = {
  id: string;
  kind: "image" | "video";
  src: string;
  title: string;
  subtitle?: string;
};
