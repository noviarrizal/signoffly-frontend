import { ImageResponse } from "next/og";
import { SEAL_CHECK_PATH } from "@/lib/brand";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS ignores transparency, so the mark sits on a solid white tile.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF" }}>
        <svg width="132" height="132" viewBox="0 0 256 256">
          <path fill="#2338D6" d={SEAL_CHECK_PATH} />
        </svg>
      </div>
    ),
    size,
  );
}
