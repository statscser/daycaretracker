import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// ── 1. CONSTANTS ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const M = {
  cream: "#F5F0E8", white: "#FAF7F2", sage: "#B5C4B1", sageDk: "#8FA889",
  sageDeep: "#6B8A64", rose: "#D4A5A5", roseDk: "#C08585", lav: "#C5B9CD",
  gray: "#B8AFA6", brown: "#C4B5A4", char: "#4A4543", lChar: "#7A7572",
  peach: "#E8C9B0", mint: "#A8D5BA", yellow: "#F0E4C4",
  sickYellow: "#E8D78E", sickBg: "#FDF6E3",
  holiday: "#89B4C8", holidayBg: "#E3EEF4",
};

const CURRENCIES = [
  { code: "USD", symbol: "$",   label: "🇺🇸 USD" },
  { code: "CAD", symbol: "CA$", label: "🇨🇦 CAD" },
  { code: "CNY", symbol: "¥",   label: "🇨🇳 CNY" },
  { code: "AUD", symbol: "A$",  label: "🇦🇺 AUD" },
  { code: "GBP", symbol: "£",   label: "🇬🇧 GBP" },
  { code: "EUR", symbol: "€",   label: "🇪🇺 EUR" },
  { code: "SGD", symbol: "S$",  label: "🇸🇬 SGD" },
];

// Sunday-first week: 日 一 二 三 四 五 六
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS_CN = ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];

const HUMOR_USD = [
  (c) => `≈ ${Math.max(1,Math.floor(c/6.5))} 杯星巴克拿铁 ☕`,
  (c) => `≈ ${Math.max(1,Math.floor(c/18))} 顿 Chipotle 外卖 🌯`,
  (c) => `≈ ${Math.max(1,Math.floor(c/23))} 箱 Pampers 尿不湿 🧷`,
  (c) => `≈ ${Math.max(1,Math.floor(c/35))} 罐 Enfamil 奶粉 🍼`,
  (c) => `≈ ${Math.max(1,Math.floor(c/2.5))} 个 Trader Joe's 可颂面包 🥐`,
  (c) => `≈ ${Math.max(1,Math.floor(c/12))} 次 Target 冲动消费 🎯`,
  (c) => `≈ ${Math.max(1,Math.floor(c/19.99))} 个月 Netflix 订阅 📺`,
];
const HUMOR_CAD = [
  (c) => `≈ ${Math.max(1,Math.floor(c/7))} 杯 Tim Hortons ☕`,
  (c) => `≈ ${Math.max(1,Math.floor(c/22))} 顿 Swiss Chalet 🍗`,
  (c) => `≈ ${Math.max(1,Math.floor(c/45))} 罐 Kirkland 奶粉 🍼`,
  (c) => `≈ ${Math.max(1,Math.floor(c/16))} 箱 Costco 尿不湿 🧷`,
  (c) => `≈ ${Math.max(1,Math.floor(c/3))} 个 Timbits 甜甜圈 🍩`,
  (c) => `多买 ${Math.max(1,Math.floor(c/6))} 袋枫叶薯片了 eh 🍁`,
];
const HUMOR_CNY = [
  (c) => `≈ ${Math.max(1,Math.floor(c/18))} 杯瑞幸椰乳拿铁 ☕`,
  (c) => `≈ ${Math.max(1,Math.floor(c/25))} 顿美团外卖 🍜`,
  (c) => `≈ ${Math.max(1,Math.floor(c/280))} 罐飞鹤奶粉 🍼`,
  (c) => `≈ ${Math.max(1,Math.floor(c/3))} 张花王纸尿裤 🧴`,
  (c) => `≈ ${Math.max(1,Math.floor(c/15))} 杯奶茶 🧋`,
];
const HUMOR_DEFAULT = [
  (c) => `≈ ${Math.max(1,Math.floor(c/7))} 杯咖啡 ☕`,
  (c) => `≈ ${Math.max(1,Math.floor(c/20))} 顿外卖 🍜`,
  (c) => `≈ ${Math.max(1,Math.floor(c/40))} 罐奶粉 🍼`,
];
const HUMOR_MAP = { USD: HUMOR_USD, CAD: HUMOR_CAD, CNY: HUMOR_CNY };

const ABSENCE_QUOTES = [
  "宝宝今天在家修炼仙气 ✨", "小肉球不在，好空旷 🤧",
  "宝宝被窝龙缠身了 😴", "今天宝宝居家办公 🏠",
  "宝宝表示今天说走就走了 ✈️", "宝宝表示今天不营业 🫠",
];

const ABSENCE_REASONS = [
  { id: "sick",             label: "💊 生病",    icon: "💊", color: M.sickYellow },
  { id: "vacation",         label: "✈️ 旅行",    icon: "✈️", color: M.lav },
  { id: "holiday",          label: "📆 公共假期", icon: "📆", color: M.holiday },
  { id: "teacher_training", label: "💸 老师培训", icon: "💸", color: M.mint },
  { id: "other",            label: "💔 其他",    icon: "💔", color: M.gray },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ── 2. DATA SCHEMA & PERSISTENCE ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
//
// Unified key: "dc_v1_data"
// {
//   version: 1,
//   settings: { currency: string, sh: number, eh: number },
//   tuitionHistory: [{ startDate: "YYYY-MM-DD", amount: number }, ...],
//   absences: { "YYYY-M-D": { hours: number, reason: string }, ... }
// }
// absences keys intentionally keep the old "Y-M-D" format for drop-in compatibility.

const STORAGE_KEY = "dc_v1_data";

function getDefaultData() {
  return {
    version: 1,
    settings: { currency: "USD", sh: 8, eh: 18 },
    tuitionHistory: [{ startDate: "2020-01-01", amount: 2000 }],
    absences: {},
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1) {
        // Guard: ensure tuitionHistory is never empty
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

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── 3. PURE UTILITIES ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function getDays(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirst(y, m) { return new Date(y, m, 1).getDay(); }

/**
 * Returns the applicable monthly tuition for a given (yr, mo).
 * Picks the most-recent tuitionHistory entry whose startDate ≤ first day of that month.
 */
function getTuitionForMonth(tuitionHistory, yr, mo) {
  const monthStart = new Date(yr, mo, 1).getTime();
  let best = null;
  for (const entry of tuitionHistory) {
    const d = new Date(entry.startDate + "T00:00:00").getTime();
    if (d <= monthStart) {
      if (!best || d > new Date(best.startDate + "T00:00:00").getTime()) best = entry;
    }
  }
  return best ? best.amount : 0;
}

/** Stats for a single calendar month. */
function calculatePeriodStats(absences, year, month, config) {
  const { sh, eh, tuition } = config;
  const dh  = eh - sh;
  const dim = getDays(year, month);
  const mk  = `${year}-${month}`;

  let wdays = 0;
  for (let d = 1; d <= dim; d++) {
    const dow = new Date(year, month, d).getDay();
    if (dow !== 0 && dow !== 6) wdays++;
  }

  const dailyCost = wdays > 0 ? tuition / wdays : 0;
  const hrCost    = dh    > 0 ? dailyCost / dh  : 0;

  let totalAbsHrs = 0, sickDays = 0, vacDays = 0, holidayDays = 0, trainingDays = 0, otherDays = 0;
  for (let d = 1; d <= dim; d++) {
    const entry = absences[`${mk}-${d}`];
    if (entry && entry.hours > 0) {
      totalAbsHrs += entry.hours;
      if      (entry.reason === "sick")             sickDays++;
      else if (entry.reason === "vacation")         vacDays++;
      else if (entry.reason === "holiday")          holidayDays++;
      else if (entry.reason === "teacher_training") trainingDays++;
      else otherDays++;
    }
  }
  const totalAbsDays = dh > 0 ? totalAbsHrs / dh : 0;
  const sunk         = totalAbsHrs * hrCost;

  return { totalAbsHrs, totalAbsDays, sunk, wdays, dailyCost, hrCost,
           sickDays, vacDays, holidayDays, trainingDays, otherDays };
}

/** Aggregates stats across multiple months (for quarter / year views). */
function aggregateStats(absences, yr, months, tuitionHistory, sh, eh) {
  const acc = { totalAbsHrs: 0, totalAbsDays: 0, sunk: 0, wdays: 0,
                dailyCost: 0, hrCost: 0,
                sickDays: 0, vacDays: 0, holidayDays: 0, trainingDays: 0, otherDays: 0 };
  let totalTuition = 0;
  const dh = eh - sh;

  for (const mo of months) {
    const tuition = getTuitionForMonth(tuitionHistory, yr, mo);
    totalTuition += tuition;
    const s = calculatePeriodStats(absences, yr, mo, { sh, eh, tuition });
    acc.totalAbsHrs  += s.totalAbsHrs;
    acc.totalAbsDays += s.totalAbsDays;
    acc.sunk         += s.sunk;
    acc.wdays        += s.wdays;
    acc.sickDays     += s.sickDays;
    acc.vacDays      += s.vacDays;
    acc.holidayDays  += s.holidayDays;
    acc.trainingDays += s.trainingDays;
    acc.otherDays    += s.otherDays;
  }

  acc.dailyCost = acc.wdays > 0 ? totalTuition / acc.wdays : 0;
  acc.hrCost    = dh > 0 ? acc.dailyCost / dh : 0;
  return acc;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── 4. UI COMPONENTS ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function Ring({ ratio, size = 36, isToday, isEmpty, reason }) {
  const sw = size * 0.18, r = (size - sw) / 2;
  const circ = 2 * Math.PI * r, c = size / 2;
  const f = Math.max(0, Math.min(1, ratio));
  let col = M.sage;
  if (f < 1) {
    if      (reason === "sick")             col = M.sickYellow;
    else if (reason === "vacation")         col = M.lav;
    else if (reason === "holiday")          col = M.holiday;
    else if (reason === "teacher_training") col = M.mint;
    else if (f < 0.5)                       col = M.rose;
    else                                    col = M.sageDeep;
  }
  const iconMap = { sick: "💊", vacation: "✈️", holiday: "📆", teacher_training: "💸", other: "💔" };
  const showIcon = f < 1 && reason && iconMap[reason];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {!isEmpty && <>
        <circle cx={c} cy={c} r={r} fill="none" stroke={`${M.brown}40`} strokeWidth={sw} />
        <circle cx={c} cy={c} r={r} fill="none" stroke={col} strokeWidth={sw}
          strokeDasharray={`${f * circ} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${c} ${c})`}
          style={{ transition: "stroke-dasharray 0.5s ease, stroke 0.3s" }} />
        {f === 1 && <circle cx={c} cy={c} r={r * 0.22} fill={`${M.sage}55`} />}
        {showIcon && (
          <text x={c} y={c} textAnchor="middle" dominantBaseline="central"
            fontSize={size * 0.32} style={{ pointerEvents: "none" }}>
            {iconMap[reason]}
          </text>
        )}
      </>}
      {isToday && !isEmpty && (
        <circle cx={c} cy={c} r={r + sw / 2 + 2} fill="none"
          stroke={M.rose} strokeWidth={1.5} strokeDasharray="3 3" />
      )}
    </svg>
  );
}

function Face({ mood, size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="28" fill={M.yellow} stroke={M.brown} strokeWidth="1.5" />
      <ellipse cx="16" cy="34" rx="5" ry="3.5" fill={`${M.rose}60`} />
      <ellipse cx="44" cy="34" rx="5" ry="3.5" fill={`${M.rose}60`} />
      {mood === "happy" ? <>
        <path d="M20 26Q23 22 26 26" stroke={M.char} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M34 26Q37 22 40 26" stroke={M.char} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M24 36Q30 42 36 36" stroke={M.char} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      </> : mood === "cry" ? <>
        <circle cx="22" cy="25" r="2.5" fill={M.char}/><circle cx="38" cy="25" r="2.5" fill={M.char}/>
        <path d="M18 30Q16 36 20 34" stroke="#89CFF0" strokeWidth="1.5" fill="#89CFF060"/>
        <path d="M42 30Q44 36 40 34" stroke="#89CFF0" strokeWidth="1.5" fill="#89CFF060"/>
        <path d="M24 39Q30 35 36 39" stroke={M.char} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      </> : <>
        <circle cx="22" cy="25" r="2.5" fill={M.char}/><circle cx="38" cy="25" r="2.5" fill={M.char}/>
        <line x1="25" y1="37" x2="35" y2="37" stroke={M.char} strokeWidth="1.8" strokeLinecap="round"/>
      </>}
    </svg>
  );
}

// ── HeaderSection ─────────────────────────────────────────────────────────────
function HeaderSection({ onSettingsClick }) {
  return (
    <div style={{ position:"relative", textAlign:"center", marginBottom:8 }}>
      <button onClick={onSettingsClick} style={{
        position:"absolute", left:0, top:0,
        background:`${M.lav}35`, border:`1.5px solid ${M.lav}50`, borderRadius:14,
        width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center",
        cursor:"pointer", fontSize:18, lineHeight:1,
      }}>⚙️</button>
      <div style={{ fontSize:28, marginBottom:2 }}>👶💸</div>
      <h1 style={{
        fontSize:22, fontWeight:800, margin:0, letterSpacing:-0.5,
        background:`linear-gradient(135deg,${M.char},${M.lChar})`,
        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
      }}>宝宝碎钞机</h1>
    </div>
  );
}

// ── SegmentedControl: Month / Quarter / Year switcher ────────────────────────
function SegmentedControl({ value, onChange }) {
  const opts = [{ v:"month", l:"月" }, { v:"quarter", l:"季" }, { v:"year", l:"年" }];
  return (
    <div style={{
      display:"flex", background:`${M.brown}18`, borderRadius:18, padding:3, gap:2,
      margin:"8px 0 12px",
    }}>
      {opts.map(o => (
        <button key={o.v} onClick={() => onChange(o.v)} style={{
          flex:1, padding:"7px 0", borderRadius:15,
          border:"none", cursor:"pointer", fontFamily:"inherit",
          fontSize:13, fontWeight:700, transition:"all 0.2s",
          background: value === o.v ? M.white : "transparent",
          color: value === o.v ? M.char : M.lChar,
          boxShadow: value === o.v ? `0 2px 8px ${M.brown}25` : "none",
        }}>{o.l}</button>
      ))}
    </div>
  );
}

// ── SettingsModal ─────────────────────────────────────────────────────────────
function SettingsModal({ settings, tuitionHistory, onUpdateSettings, onUpdateTuitionHistory,
                         cur, fmt, onClose }) {
  const { currency, sh, eh } = settings;
  const [showAdd,  setShowAdd]  = useState(false);
  const [newStart, setNewStart] = useState("");
  const [newAmt,   setNewAmt]   = useState(
    () => tuitionHistory[tuitionHistory.length - 1]?.amount ?? 2000
  );

  const sorted = [...tuitionHistory].sort((a, b) => a.startDate.localeCompare(b.startDate));

  const addPhase = () => {
    if (!newStart) return;
    onUpdateTuitionHistory([...tuitionHistory, { startDate: newStart, amount: Number(newAmt) }]);
    setShowAdd(false);
    setNewStart("");
  };

  const deletePhase = (entry) => {
    if (tuitionHistory.length <= 1) return;
    onUpdateTuitionHistory(tuitionHistory.filter(e => e !== entry));
  };

  return (
    <>
      <div onClick={onClose} style={{
        position:"fixed", top:0, left:0, right:0, bottom:0,
        background:"rgba(0,0,0,0.3)", zIndex:200,
        backdropFilter:"blur(4px)", WebkitBackdropFilter:"blur(4px)",
      }}/>
      <div style={{
        position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
        width:"calc(100% - 40px)", maxWidth:400,
        background:M.white, borderRadius:28, padding:"24px 22px 20px",
        boxShadow:`0 20px 60px rgba(0,0,0,0.2)`, zIndex:210,
        maxHeight:"85vh", overflowY:"auto",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <span style={{ fontSize:16, fontWeight:800, color:M.char }}>⚙️ 碎钞参数设置</span>
          <button onClick={onClose} style={{
            background:`${M.rose}20`, border:"none", borderRadius:12, width:32, height:32,
            fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            color:M.char, fontFamily:"inherit",
          }}>✕</button>
        </div>

        {/* Currency */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:12, fontWeight:700, color:M.lChar, display:"block", marginBottom:6 }}>💱 货币 / Currency</label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {CURRENCIES.map(c => (
              <button key={c.code} onClick={() => onUpdateSettings({ currency: c.code })} style={{
                padding:"6px 12px", borderRadius:14, fontSize:12, fontWeight:700,
                fontFamily:"inherit", cursor:"pointer", transition:"all 0.15s",
                border: currency === c.code ? `2px solid ${M.sageDk}` : `1.5px solid ${M.brown}30`,
                background: currency === c.code ? `${M.sage}30` : M.white, color:M.char,
              }}>{c.label}</button>
            ))}
          </div>
        </div>

        {/* Tuition History */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:12, fontWeight:700, color:M.lChar, display:"block", marginBottom:8 }}>
            💰 学费历史 / Tuition Timeline
          </label>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {sorted.map((entry, i) => (
              <div key={`${entry.startDate}-${i}`} style={{
                display:"flex", alignItems:"center", gap:8,
                background:`${M.cream}80`, borderRadius:14, padding:"8px 12px",
                border:`1.5px solid ${M.brown}25`,
              }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10, color:M.lChar, fontWeight:600 }}>起始 {entry.startDate}</div>
                  <div style={{ fontSize:15, fontWeight:800, color:M.char }}>
                    {fmt(entry.amount)}
                    <span style={{ fontSize:10, fontWeight:600, color:M.lChar, marginLeft:3 }}>/月</span>
                  </div>
                </div>
                {sorted.length > 1 && (
                  <button onClick={() => deletePhase(entry)} style={{
                    background:`${M.rose}20`, border:"none", borderRadius:10,
                    width:28, height:28, fontSize:13, cursor:"pointer",
                    color:M.roseDk, fontFamily:"inherit",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>✕</button>
                )}
              </div>
            ))}
          </div>

          {!showAdd ? (
            <button onClick={() => setShowAdd(true)} style={{
              width:"100%", marginTop:8, padding:"8px 0",
              background:"transparent", border:`1.5px dashed ${M.brown}40`,
              borderRadius:14, fontSize:12, fontWeight:700, color:M.lChar,
              cursor:"pointer", fontFamily:"inherit",
            }}>＋ 添加新学费阶段</button>
          ) : (
            <div style={{
              marginTop:8, background:`${M.cream}80`, borderRadius:14,
              padding:12, border:`1.5px solid ${M.brown}25`,
            }}>
              <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                <div style={{ flex:1 }}>
                  <label style={{ fontSize:10, fontWeight:700, color:M.lChar, display:"block", marginBottom:4 }}>起始日期</label>
                  <input type="date" value={newStart} onChange={e => setNewStart(e.target.value)} style={{
                    width:"100%", boxSizing:"border-box", padding:"7px 10px", borderRadius:10,
                    border:`1.5px solid ${M.brown}40`, fontSize:13, fontFamily:"inherit",
                    background:M.white, color:M.char, outline:"none",
                  }}/>
                </div>
                <div style={{ flex:1 }}>
                  <label style={{ fontSize:10, fontWeight:700, color:M.lChar, display:"block", marginBottom:4 }}>
                    金额 ({cur.symbol})
                  </label>
                  <input type="number" value={newAmt}
                    onChange={e => setNewAmt(Math.max(0, +e.target.value))} style={{
                    width:"100%", boxSizing:"border-box", padding:"7px 10px", borderRadius:10,
                    border:`1.5px solid ${M.brown}40`, fontSize:13, fontFamily:"inherit",
                    background:M.white, color:M.char, outline:"none",
                  }}/>
                </div>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={() => setShowAdd(false)} style={{
                  flex:1, padding:"7px 0", background:`${M.rose}20`, border:"none",
                  borderRadius:12, fontSize:12, fontWeight:700,
                  cursor:"pointer", color:M.roseDk, fontFamily:"inherit",
                }}>取消</button>
                <button onClick={addPhase} style={{
                  flex:2, padding:"7px 0",
                  background:`linear-gradient(135deg,${M.sage},${M.sageDk})`,
                  border:"none", borderRadius:12, fontSize:12, fontWeight:700,
                  cursor:"pointer", color:"white", fontFamily:"inherit",
                }}>确认添加</button>
              </div>
            </div>
          )}
        </div>

        {/* Hours */}
        <div style={{ display:"flex", gap:12 }}>
          {[
            { label:"🌅 入园 / Drop-off", val:sh, key:"sh", opts:Array.from({length:12},(_,i)=>i+6) },
            { label:"🌆 离园 / Pick-up",  val:eh, key:"eh", opts:Array.from({length:12},(_,i)=>i+12) },
          ].map((x, i) => (
            <div key={i} style={{ flex:1 }}>
              <label style={{ fontSize:12, fontWeight:700, color:M.lChar, display:"block", marginBottom:6 }}>{x.label}</label>
              <select value={x.val} onChange={e => onUpdateSettings({ [x.key]: +e.target.value })} style={{
                width:"100%", padding:"10px 14px", borderRadius:16,
                border:`1.5px solid ${M.brown}40`, fontSize:14, fontWeight:600, fontFamily:"inherit",
                background:`${M.cream}80`, color:M.char, outline:"none",
              }}>
                {x.opts.map(h => <option key={h} value={h}>{String(h).padStart(2,"0")}:00</option>)}
              </select>
            </div>
          ))}
        </div>

        <button onClick={onClose} style={{
          width:"100%", padding:"10px 0", marginTop:20,
          background:`linear-gradient(135deg,${M.sage},${M.sageDk})`,
          border:"none", borderRadius:16, color:"white", fontSize:14, fontWeight:700,
          cursor:"pointer", fontFamily:"inherit", boxShadow:`0 4px 12px ${M.sage}40`,
        }}>设置完毕 ✓</button>
      </div>
    </>
  );
}

// ── DashboardCard ─────────────────────────────────────────────────────────────
function DashboardCard({ sunk, dailyCost, totalAbsDays, wdays, mood, fmt, getHumor,
                         viewMode, quarter }) {
  const reportTitle =
    viewMode === "month"   ? "当月份空气质量报告" :
    viewMode === "quarter" ? `Q${quarter + 1} 季度空气质量报告` :
                             "年度空气质量报告";
  const subTitle =
    viewMode === "month"   ? "本月已为 daycare 空气质量改善做出的超额贡献" :
    viewMode === "quarter" ? "本季度已为 daycare 空气质量改善做出的超额贡献" :
                             "本年度已为 daycare 空气质量改善做出的超额贡献";
  const emptyMsg =
    viewMode === "month"   ? "本月全勤，宝宝是 daycare 真模范 🌟" :
    viewMode === "quarter" ? "本季全勤，宝宝季度全勤奖 🏆" :
                             "全年全勤，宝宝年度模范员工 🎖️";
  const costLabel = viewMode === "month" ? "日费" : "日均费";

  return (
    <div style={{
      background:M.white, borderRadius:28, padding:"20px 20px 16px", margin:"12px 0",
      boxShadow:`0 8px 32px ${M.brown}15`, border:`1.5px solid ${M.brown}20`,
      textAlign:"center", position:"relative",
    }}>
      <div style={{ position:"absolute", top:14, right:18 }}><Face mood={mood}/></div>
      <p style={{ fontSize:11, color:M.lChar, margin:"0 0 2px", fontWeight:600 }}>📊 {reportTitle}</p>
      <p style={{ fontSize:10, color:`${M.lChar}99`, margin:"0 0 8px" }}>{subTitle}</p>
      <div style={{
        fontSize:40, fontWeight:800, letterSpacing:-1.5, lineHeight:1.1,
        color: sunk > 0 ? M.roseDk : M.sageDk, transition:"color 0.3s",
      }}>
        {fmt(sunk)}
        <span style={{ fontSize:14, fontWeight:600, letterSpacing:0, marginLeft:4, opacity:0.7 }}>已踏空</span>
      </div>
      {sunk > 0
        ? <p style={{ fontSize:12, color:M.rose, margin:"6px 0 0", fontWeight:600, lineHeight:1.4 }}>{getHumor(sunk)}</p>
        : <p style={{ fontSize:12, color:M.sage, margin:"6px 0 0", fontWeight:600 }}>{emptyMsg}</p>
      }
      <div style={{
        display:"flex", justifyContent:"center", gap:20, marginTop:14, paddingTop:12,
        borderTop:`1px dashed ${M.brown}30`, flexWrap:"wrap",
      }}>
        {[
          { l:"缺勤",    v:`${totalAbsDays.toFixed(1)}天`, i:"🏠" },
          { l:costLabel, v:fmt(dailyCost),                  i:"💰" },
          { l:"工作日",  v:`${wdays}天`,                    i:"📅" },
        ].map((x, i) => (
          <div key={i} style={{ textAlign:"center", minWidth:64 }}>
            <div style={{ fontSize:15 }}>{x.i}</div>
            <div style={{ fontSize:14, fontWeight:800, color:M.char }}>{x.v}</div>
            <div style={{ fontSize:9,  color:M.lChar, fontWeight:600 }}>{x.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AbsencePills ──────────────────────────────────────────────────────────────
function AbsencePills({ sickDays, vacDays, holidayDays, trainingDays, otherDays, totalAbsHrs }) {
  if (totalAbsHrs === 0) return null;
  return (
    <div style={{ display:"flex", gap:8, margin:"0 0 12px", justifyContent:"center", flexWrap:"wrap" }}>
      {[
        { label:"💊 生病",    count:sickDays,     color:M.sickYellow },
        { label:"✈️ 旅行",    count:vacDays,      color:M.lav },
        { label:"📆 假期",    count:holidayDays,  color:M.holiday },
        { label:"💸 老师培训", count:trainingDays, color:M.mint },
        { label:"💔 其他",    count:otherDays,    color:M.gray },
      ].filter(x => x.count > 0).map((x, i) => (
        <div key={i} style={{
          background:M.white, borderRadius:16, padding:"8px 14px", textAlign:"center",
          border:`1.5px solid ${x.color}50`, flex:"0 1 auto", minWidth:70,
        }}>
          <div style={{ fontSize:18, fontWeight:800, color:M.char }}>{x.count}</div>
          <div style={{ fontSize:10, fontWeight:700, color:M.lChar }}>{x.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── CalendarSection ───────────────────────────────────────────────────────────
function CalendarSection({ yr, mo, dim, first, dh, hrCost, fmt, getEntry, setEntry,
                           isWe, isToday, ratio, onPrev, onNext, onToday,
                           viewMode, quarter }) {
  const [sel,    setSel]    = useState(null);
  const [popPos, setPopPos] = useState({ x: 0, y: 0 });
  const calRef = useRef(null);

  useEffect(() => { setSel(null); }, [yr, mo]);

  const selEntry = sel !== null ? getEntry(sel) : { hours: 0, reason: "sick" };

  const clickDay = (d, e) => {
    if (isWe(d)) return;
    const r  = e.currentTarget.getBoundingClientRect();
    const cr = calRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    setPopPos({ x: r.left - cr.left + r.width / 2, y: r.top - cr.top - 10 });
    setSel(d);
  };

  const navLabel =
    viewMode === "quarter" ? (
      <>
        <span style={{ fontSize:17, fontWeight:800, color:M.char }}>Q{quarter + 1}</span>
        <span style={{ fontSize:12, fontWeight:600, color:M.lChar, marginLeft:6 }}>{yr}</span>
      </>
    ) : viewMode === "year" ? (
      <span style={{ fontSize:17, fontWeight:800, color:M.char }}>{yr} 年</span>
    ) : (
      <>
        <span style={{ fontSize:17, fontWeight:800, color:M.char }}>{MONTHS_CN[mo]}</span>
        <span style={{ fontSize:12, fontWeight:600, color:M.lChar, marginLeft:6 }}>{yr}</span>
      </>
    );

  return (
    <div ref={calRef} style={{
      background:M.white, borderRadius:28, padding:"16px 12px 12px",
      boxShadow:`0 8px 32px ${M.brown}12`, border:`1.5px solid ${M.brown}15`, position:"relative",
    }}>
      {/* Navigation row */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, padding:"0 4px" }}>
        <button onClick={onPrev} style={{ background:"none",border:"none",fontSize:20,cursor:"pointer",padding:"4px 8px",color:M.lChar,fontFamily:"inherit" }}>‹</button>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {navLabel}
          <button onClick={onToday} style={{
            background:`${M.brown}15`, border:`1px solid ${M.brown}30`, borderRadius:10,
            fontSize:11, fontWeight:700, color:M.lChar, padding:"3px 9px",
            cursor:"pointer", fontFamily:"inherit", lineHeight:1.4,
          }}>今</button>
        </div>
        <button onClick={onNext} style={{ background:"none",border:"none",fontSize:20,cursor:"pointer",padding:"4px 8px",color:M.lChar,fontFamily:"inherit" }}>›</button>
      </div>

      {/* Weekday headers */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:4 }}>
        {WEEKDAYS.map((d, i) => (
          <div key={d} style={{
            textAlign:"center", fontSize:10, fontWeight:700,
            color: (i === 0 || i === 6) ? `${M.rose}AA` : `${M.lChar}99`, padding:"2px 0",
          }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
        {Array.from({ length: first }).map((_, i) => (
          <div key={`e${i}`} style={{ aspectRatio:"1", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Ring ratio={1} size={36} isEmpty />
          </div>
        ))}
        {Array.from({ length: dim }, (_, i) => i + 1).map(d => {
          const we    = isWe(d);
          const entry = getEntry(d);
          const ab    = entry.hours;
          const td    = isToday(d);
          return (
            <div key={d} onClick={e => clickDay(d, e)} style={{
              aspectRatio:"1", display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center",
              cursor: we ? "default" : "pointer",
              borderRadius:14, position:"relative", transition:"all 0.15s",
              background: sel === d ? `${M.lav}25` : "transparent",
              opacity: we ? 0.4 : 1,
            }}>
              <Ring ratio={ratio(d)} size={36} isToday={td} isEmpty={false}
                reason={ab > 0 ? entry.reason : null} />
              <span style={{
                fontSize:9, fontWeight:700, marginTop:1,
                color: td ? M.rose : ab > 0 ? M.roseDk : M.lChar,
              }}>{d}</span>
            </div>
          );
        })}
      </div>

      {/* Day Popup */}
      {sel !== null && <>
        <div onClick={() => setSel(null)}
          style={{ position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:50 }}/>
        <div style={{
          position:"absolute",
          left: Math.min(Math.max(popPos.x - 140, 4), 170),
          top:  Math.max(popPos.y - 300, 4),
          width:280, background:M.white, borderRadius:24, padding:"18px 18px 14px",
          boxShadow:`0 12px 40px ${M.char}25`, border:`2px solid ${M.brown}25`, zIndex:100,
        }}>
          <div style={{ textAlign:"center", marginBottom:10 }}>
            <div style={{ fontSize:14, fontWeight:800 }}>{mo+1}月{sel}日</div>
            <div style={{ fontSize:11, color:M.lChar, fontWeight:600, marginTop:2, lineHeight:1.3 }}>
              {ABSENCE_QUOTES[sel % ABSENCE_QUOTES.length]}
            </div>
          </div>

          {/* Reason selector — auto-fills full-day hours when currently 0 */}
          <div style={{ display:"flex", gap:5, justifyContent:"center", marginBottom:10, flexWrap:"wrap" }}>
            {ABSENCE_REASONS.map(r => (
              <button key={r.id} onClick={() => {
                const hrs = selEntry.hours === 0 ? dh : selEntry.hours;
                setEntry(sel, hrs, r.id);
              }} style={{
                padding:"5px 9px", borderRadius:12, fontSize:11, fontWeight:700,
                fontFamily:"inherit", cursor:"pointer", transition:"all 0.15s",
                border: selEntry.reason === r.id ? `2px solid ${M.sageDk}` : `1.5px solid ${M.brown}25`,
                background: selEntry.reason === r.id ? `${M.sage}25` : "transparent", color:M.char,
              }}>{r.label}</button>
            ))}
          </div>

          <div style={{ textAlign:"center", marginBottom:6 }}>
            <span style={{ fontSize:28, fontWeight:800, color:selEntry.hours>0 ? M.roseDk : M.sageDk }}>
              {selEntry.hours}
            </span>
            <span style={{ fontSize:13, fontWeight:600, color:M.lChar, marginLeft:4 }}>小时缺勤</span>
          </div>
          <div style={{ padding:"0 4px", marginBottom:8 }}>
            <input type="range" min={0} max={dh} step={0.5} value={selEntry.hours}
              onChange={e => setEntry(sel, +e.target.value, selEntry.reason)}
              style={{ width:"100%", accentColor:M.rose, height:6 }}/>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:M.lChar, fontWeight:600, marginTop:2 }}>
              <span>全勤 ✨</span><span>全天消失 🐟</span>
            </div>
          </div>
          {selEntry.hours > 0 && (
            <div style={{
              textAlign:"center", fontSize:11, color:M.roseDk, fontWeight:700,
              background:`${M.rose}15`, borderRadius:12, padding:"5px 8px", marginBottom:8, lineHeight:1.5,
            }}>
              💸 今日踏空: {fmt(selEntry.hours * hrCost)}
              {selEntry.reason === "sick"             && <><br/><span style={{ fontSize:10, color:M.lChar }}>别忘了 copay 还要再花一笔 😳</span></>}
              {selEntry.reason === "vacation"         && <><br/><span style={{ fontSize:10, color:M.lChar }}>机票酒店另计，不堪细算 🫠</span></>}
              {selEntry.reason === "holiday"          && <><br/><span style={{ fontSize:10, color:M.lChar }}>Daycare 放假你不休，谁说的 💔</span></>}
              {selEntry.reason === "teacher_training" && <><br/><span style={{ fontSize:10, color:M.lChar }}>老师也要充电，你的钱也跟着充进去了 🔌</span></>}
            </div>
          )}
          <button onClick={() => setSel(null)} style={{
            width:"100%", padding:"8px 0",
            background:`linear-gradient(135deg,${M.sage},${M.sageDk})`,
            border:"none", borderRadius:14, color:"white", fontSize:13, fontWeight:700,
            cursor:"pointer", fontFamily:"inherit", boxShadow:`0 4px 12px ${M.sage}40`,
          }}>含泪确认</button>
        </div>
      </>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── 5. MAIN APP ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  const now = new Date();
  const [yr,       setYr]       = useState(now.getFullYear());
  const [mo,       setMo]       = useState(now.getMonth());
  const [viewMode, setViewMode] = useState("month");
  const [data,     setData]     = useState(() => loadData());
  const [setup,    setSetup]    = useState(false);
  const [humorIdx, setHumorIdx] = useState(0);

  // Persist unified data object on every change
  useEffect(() => { saveData(data); }, [data]);

  const { settings, tuitionHistory, absences } = data;
  const { currency, sh, eh } = settings;

  const updateSettings = (updates) =>
    setData(d => ({ ...d, settings: { ...d.settings, ...updates } }));

  const updateTuitionHistory = (history) =>
    setData(d => ({ ...d, tuitionHistory: history }));

  const updateAbsence = (key, entry) =>
    setData(d => ({ ...d, absences: { ...d.absences, [key]: entry } }));

  const cur = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  const dh  = eh - sh;
  const quarter = Math.floor(mo / 3);

  // Months to aggregate for the current view
  const periodMonths =
    viewMode === "month"   ? [mo] :
    viewMode === "quarter" ? [quarter*3, quarter*3+1, quarter*3+2] :
                             [0,1,2,3,4,5,6,7,8,9,10,11];

  const stats = aggregateStats(absences, yr, periodMonths, tuitionHistory, sh, eh);
  const { totalAbsHrs, totalAbsDays, sunk, wdays, dailyCost,
          sickDays, vacDays, holidayDays, trainingDays, otherDays } = stats;

  // hrCost used in the day popup always reflects the displayed calendar month
  const moTuition = getTuitionForMonth(tuitionHistory, yr, mo);
  const moStats   = calculatePeriodStats(absences, yr, mo, { sh, eh, tuition: moTuition });

  const getHumor = useCallback((cost) => {
    const pool = HUMOR_MAP[currency] || HUMOR_DEFAULT;
    return pool[humorIdx % pool.length](cost);
  }, [currency, humorIdx]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setHumorIdx(Math.floor(Math.random() * 10)); }, [totalAbsHrs > 0, mo, yr]);

  const mk       = `${yr}-${mo}`;
  const isWe     = (d) => { const w = new Date(yr, mo, d).getDay(); return w === 0 || w === 6; };
  const isToday  = (d) => yr === now.getFullYear() && mo === now.getMonth() && d === now.getDate();
  const getEntry = (d) => absences[`${mk}-${d}`] || { hours: 0, reason: "sick" };
  const setEntry = (d, hours, reason) => updateAbsence(`${mk}-${d}`, { hours, reason });
  const ratio    = (d) => isWe(d) ? 1 : Math.max(0, (dh - getEntry(d).hours) / dh);

  const mood = sunk === 0 ? "happy" : sunk > dailyCost * 5 ? "cry" : "neutral";

  const fmt = (v) => {
    const n = Number(v);
    if (currency === "CNY") return `${cur.symbol}${n.toFixed(0)}`;
    return `${cur.symbol}${n.toFixed(n >= 100 ? 0 : 2)}`;
  };

  const dim   = getDays(yr, mo);
  const first = getFirst(yr, mo);

  // Navigation: behaviour varies by viewMode
  const prev = () => {
    if (viewMode === "month") {
      mo === 0 ? (setMo(11), setYr(y => y - 1)) : setMo(m => m - 1);
    } else if (viewMode === "quarter") {
      if (quarter === 0) { setMo(9); setYr(y => y - 1); }
      else setMo((quarter - 1) * 3);
    } else {
      setYr(y => y - 1);
    }
  };

  const next = () => {
    if (viewMode === "month") {
      mo === 11 ? (setMo(0), setYr(y => y + 1)) : setMo(m => m + 1);
    } else if (viewMode === "quarter") {
      if (quarter === 3) { setMo(0); setYr(y => y + 1); }
      else setMo((quarter + 1) * 3);
    } else {
      setYr(y => y + 1);
    }
  };

  const goToday = () => { setYr(now.getFullYear()); setMo(now.getMonth()); };

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${M.cream} 0%, ${M.white} 40%, ${M.yellow}30 100%)`,
      fontFamily: "'Nunito', 'PingFang SC', 'Hiragino Sans GB', sans-serif",
      color: M.char, padding: "20px 16px 40px", maxWidth: 460, margin: "0 auto",
      position: "relative", overflow: "hidden",
    }}>
      {/* Decorative blobs */}
      <div style={{ position:"absolute",top:-60,right:-40,width:160,height:160,borderRadius:"50%",background:`${M.sage}18`,pointerEvents:"none"}}/>
      <div style={{ position:"absolute",top:200,left:-50,width:120,height:120,borderRadius:"50%",background:`${M.rose}15`,pointerEvents:"none"}}/>

      <HeaderSection onSettingsClick={() => setSetup(true)} />

      <SegmentedControl value={viewMode} onChange={setViewMode} />

      {setup && (
        <SettingsModal
          settings={settings}
          tuitionHistory={tuitionHistory}
          onUpdateSettings={updateSettings}
          onUpdateTuitionHistory={updateTuitionHistory}
          cur={cur} fmt={fmt}
          onClose={() => setSetup(false)}
        />
      )}

      <DashboardCard
        sunk={sunk} dailyCost={dailyCost} totalAbsDays={totalAbsDays}
        wdays={wdays} mood={mood} fmt={fmt} getHumor={getHumor}
        viewMode={viewMode} quarter={quarter}
      />

      <AbsencePills
        sickDays={sickDays} vacDays={vacDays} holidayDays={holidayDays}
        trainingDays={trainingDays} otherDays={otherDays} totalAbsHrs={totalAbsHrs}
      />

      <CalendarSection
        yr={yr} mo={mo} dim={dim} first={first}
        dh={dh} hrCost={moStats.hrCost} fmt={fmt}
        getEntry={getEntry} setEntry={setEntry}
        isWe={isWe} isToday={isToday} ratio={ratio}
        onPrev={prev} onNext={next} onToday={goToday}
        viewMode={viewMode} quarter={quarter}
      />

      {/* Legend */}
      <div style={{ display:"flex", justifyContent:"center", gap:10, marginTop:12, flexWrap:"wrap" }}>
        {[
          { c:M.sage,       l:"全勤 ✨" },
          { c:M.sickYellow, l:"生病 💊" },
          { c:M.lav,        l:"旅行 ✈️" },
          { c:M.holiday,    l:"假期 📆" },
          { c:M.mint,       l:"老师培训 💸" },
          { c:M.gray,       l:"其他 💔" },
        ].map((x, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:4 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:x.c }}/>
            <span style={{ fontSize:10, fontWeight:600, color:M.lChar }}>{x.l}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign:"center", marginTop:20, fontSize:10, color:`${M.lChar}88`, fontWeight:600, lineHeight:1.6 }}>
        <p style={{ margin:0 }}>「养娃就是一场看不到尽头的天使投资」</p>
        <p style={{ margin:"2px 0 0", fontSize:9 }}>—— 每一位含泪续费的爸妈</p>
      </div>
    </div>
  );
}
