import { ImageResponse } from "next/og";
import { SEAL_CHECK_PATH } from "@/lib/brand";
import { t } from "@/lib/messages";

export const alt = t("meta.og.alt");
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#121212";
const INK_2 = "#4A4A47";
const ACCENT = "#2338D6";

/** The link preview for every page: the hero line and the signed off stamp (design guide 5.4). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "#FFFFFF", color: INK }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 40, fontWeight: 600, letterSpacing: "-0.03em" }}>
          <svg width="52" height="52" viewBox="0 0 256 256">
            <path fill={ACCENT} d={SEAL_CHECK_PATH} />
          </svg>
          {t("brand")}
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 680 }}>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 84, lineHeight: 1.05, letterSpacing: "-0.045em" }}>
              <span>{t("hero.title.before")}</span>
              <span style={{ color: ACCENT }}>{t("hero.title.emphasis")}</span>
            </div>
            <div style={{ marginTop: 28, fontSize: 27, lineHeight: 1.35, color: INK_2 }}>{t("hero.sub")}</div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: 8,
              border: `4px solid ${ACCENT}`,
              borderRadius: 20,
              color: ACCENT,
              transform: "rotate(-7deg)",
              marginBottom: 24,
              marginRight: 16,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "18px 28px", border: `2px solid ${ACCENT}`, borderRadius: 12, opacity: 0.95 }}>
              <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase" }}>{t("verdict.signed_off")}</span>
              <span style={{ marginTop: 6, fontSize: 18, letterSpacing: "0.1em" }}>{t("stamp.by")}</span>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
