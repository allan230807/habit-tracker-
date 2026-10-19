import { ImageResponse } from "next/og";
import { iconElement } from "@/lib/iconArt";

export function GET() {
  return new ImageResponse(iconElement(192), { width: 192, height: 192 });
}
