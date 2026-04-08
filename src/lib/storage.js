// ─── Unified localStorage schema ─────────────────────────────────────────────
// Key: "dc_v1_data"
// {
//   version: 1,
//   settings: { currency: string, sh: number, eh: number },
//   tuitionHistory: [{ startDate: "YYYY-MM-DD", amount: number }, ...],
//   absences: { "YYYY-M-D": { hours: number, reason: string }, ... }
// }
// absences keys keep the old "Y-M-D" format for drop-in compatibility.

export const STORAGE_KEY = "dc_v1_data";

export function getDefaultData() {
  return {
    version: 1,
    settings: { currency: "USD", sh: 8, eh: 18 },
    tuitionHistory: [{ startDate: "2020-01-01", amount: 2000 }],
    absences: {},
  };
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1) {
        if (!Array.isArray(parsed.tuitionHistory) || parsed.tuitionHistory.length === 0) {
          parsed.tuitionHistory = getDefaultData().tuitionHistory;
        }
        return parsed;
      }
    }
  } catch { /* ignore */ }

  // Migration: recover data from old per-key localStorage format
  const def = getDefaultData();
  try {
    const oldTuition  = localStorage.getItem("dc_tuition");
    const oldCurrency = localStorage.getItem("dc_currency");
    const oldSh       = localStorage.getItem("dc_sh");
    const oldEh       = localStorage.getItem("dc_eh");
    const oldAbsData  = localStorage.getItem("dc_absData");
    if (oldTuition  !== null) def.tuitionHistory[0].amount = JSON.parse(oldTuition);
    if (oldCurrency !== null) def.settings.currency        = JSON.parse(oldCurrency);
    if (oldSh       !== null) def.settings.sh              = JSON.parse(oldSh);
    if (oldEh       !== null) def.settings.eh              = JSON.parse(oldEh);
    if (oldAbsData  !== null) def.absences                 = JSON.parse(oldAbsData);
  } catch { /* ignore */ }

  return def;
}

export function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}
