/** Names of the legal region packs the API reports (backend: internal/findings/regions.go). */
const LABELS: Record<string, string> = {
  "uu-pdp": "UU PDP (Indonesia)",
  gdpr: "GDPR (EU)",
  ccpa: "CCPA (California)",
  "pdpa-sg": "PDPA (Singapore)",
  "pdpa-my": "PDPA (Malaysia)",
  "pdpa-th": "PDPA (Thailand)",
  "pdpa-ph": "Data Privacy Act (Philippines)",
};

export function regionLabel(id: string): string {
  return LABELS[id] ?? id;
}

export function regionList(ids: string[]): string {
  const names = ids.map(regionLabel);
  if (names.length <= 1) return names.join("");
  return names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
}