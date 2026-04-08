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
// ── 2. PURE UTILITIES ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function lsGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    return JSON.parse(v);
  } catch { return fallback; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

function getDays(y, m) { return new Date(y, m + 1, 0).getDate(); }
// Sunday-first: getDay() → 0=Sun,1=Mon,...,6=Sat — use directly as grid offset
function getFirst(y, m) { return new Date(y, m, 1).getDay(); }

/**
 * calculatePeriodStats — reusable for single-month, quarter, or year views.
 * @param {object} absData  - full absence record map from localStorage
 * @param {number} year     - full 4-digit year
 * @param {number} month    - 0-indexed month (0 = Jan … 11 = Dec)
 * @param {object} config   - { sh: dropoff hour, eh: pickup hour, tuition: monthly amount }
 * @returns stats object with totals for the requested period
 */
function calculatePeriodStats(absData, year, month, config) {
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
    const entry = absData[`${mk}-${d}`];
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

// ═══════════════════════════════════════════════════════════════════════════════
// ── 3. UI COMPONENTS ────────────────────────────────────────────────────────
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

// ── HeaderSection: title bar with settings button ────────────────────────────
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

// ── SettingsModal: fullscreen overlay with all configuration controls ─────────
function SettingsModal({ tuition, setTuition, currency, setCurrency, sh, setSh, eh, setEh,
                         cur, wdays, dailyCost, fmt, onClose }) {
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
              <button key={c.code} onClick={() => setCurrency(c.code)} style={{
                padding:"6px 12px", borderRadius:14, fontSize:12, fontWeight:700,
                fontFamily:"inherit", cursor:"pointer", transition:"all 0.15s",
                border: currency === c.code ? `2px solid ${M.sageDk}` : `1.5px solid ${M.brown}30`,
                background: currency === c.code ? `${M.sage}30` : M.white, color:M.char,
              }}>{c.label}</button>
            ))}
          </div>
        </div>

        {/* Tuition */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:12, fontWeight:700, color:M.lChar, display:"block", marginBottom:6 }}>
            💰 学费 / Monthly Tuition
          </label>
          <div style={{ position:"relative" }}>
            <span style={{
              position:"absolute", left:14, top:"50%", transform:"translateY(-50%)",
              fontSize:14, fontWeight:700, color:M.lChar,
            }}>{cur.symbol}</span>
            <input type="number" value={tuition}
              onChange={e => setTuition(Math.max(0, +e.target.value))}
              style={{
                width:"100%", boxSizing:"border-box", padding:"10px 14px 10px 44px", borderRadius:16,
                border:`1.5px solid ${M.brown}40`, fontSize:16, fontWeight:700, fontFamily:"inherit",
                background:`${M.cream}80`, color:M.char, outline:"none",
              }}/>
          </div>
          <p style={{ fontSize:10, color:`${M.lChar}88`, margin:"4px 0 0", fontWeight:600 }}>
            公式: {fmt(tuition)} ÷ {wdays}工作日 = {fmt(dailyCost)}/天
          </p>
        </div>

        {/* Hours */}
        <div style={{ display:"flex", gap:12 }}>
          {[
            { label:"🌅 入园 / Drop-off", val:sh, set:setSh, opts:Array.from({length:12},(_,i)=>i+6) },
            { label:"🌆 离园 / Pick-up",  val:eh, set:setEh, opts:Array.from({length:12},(_,i)=>i+12) },
          ].map((x, i) => (
            <div key={i} style={{ flex:1 }}>
              <label style={{ fontSize:12, fontWeight:700, color:M.lChar, display:"block", marginBottom:6 }}>{x.label}</label>
              <select value={x.val} onChange={e => x.set(+e.target.value)} style={{
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

// ── DashboardCard: face icon + sunk cost amount + summary stats ───────────────
function DashboardCard({ sunk, dailyCost, totalAbsDays, wdays, mood, fmt, getHumor }) {
  return (
    <div style={{
      background:M.white, borderRadius:28, padding:"20px 20px 16px", margin:"12px 0",
      boxShadow:`0 8px 32px ${M.brown}15`, border:`1.5px solid ${M.brown}20`,
      textAlign:"center", position:"relative",
    }}>
      <div style={{ position:"absolute", top:14, right:18 }}><Face mood={mood}/></div>
      <p style={{ fontSize:11, color:M.lChar, margin:"0 0 2px", fontWeight:600 }}>📊 当月份空气质量报告</p>
      <p style={{ fontSize:10, color:`${M.lChar}99`, margin:"0 0 8px" }}>本月已为 daycare 空气质量改善做出的超额贡献</p>
      <div style={{
        fontSize:40, fontWeight:800, letterSpacing:-1.5, lineHeight:1.1,
        color: sunk > 0 ? M.roseDk : M.sageDk, transition:"color 0.3s",
      }}>
        {fmt(sunk)}
        <span style={{ fontSize:14, fontWeight:600, letterSpacing:0, marginLeft:4, opacity:0.7 }}>已踏空</span>
      </div>
      {sunk > 0
        ? <p style={{ fontSize:12, color:M.rose, margin:"6px 0 0", fontWeight:600, lineHeight:1.4 }}>{getHumor(sunk)}</p>
        : <p style={{ fontSize:12, color:M.sage, margin:"6px 0 0", fontWeight:600 }}>本月全勤，宝宝是 daycare 真模范 🌟</p>
      }
      <div style={{
        display:"flex", justifyContent:"center", gap:20, marginTop:14, paddingTop:12,
        borderTop:`1px dashed ${M.brown}30`, flexWrap:"wrap",
      }}>
        {[
          { l:"缺勤",  v:`${totalAbsDays.toFixed(1)}天`, i:"🏠" },
          { l:"日费",  v:fmt(dailyCost),                  i:"💰" },
          { l:"工作日", v:`${wdays}天`,                   i:"📅" },
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

// ── AbsencePills: per-reason absence count badges (hidden when all zero) ──────
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

// ── CalendarSection: month nav + grid + day popup (owns sel/popPos/calRef) ────
function CalendarSection({ yr, mo, dim, first, dh, hrCost, fmt, getEntry, setEntry,
                           isWe, isToday, ratio, onPrev, onNext }) {
  const [sel,    setSel]    = useState(null);
  const [popPos, setPopPos] = useState({ x: 0, y: 0 });
  const calRef = useRef(null);

  // Clear popup whenever the viewed month changes
  useEffect(() => { setSel(null); }, [yr, mo]);

  const selEntry = sel !== null ? getEntry(sel) : { hours: 0, reason: "sick" };

  const clickDay = (d, e) => {
    if (isWe(d)) return;
    const r  = e.currentTarget.getBoundingClientRect();
    const cr = calRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    setPopPos({ x: r.left - cr.left + r.width / 2, y: r.top - cr.top - 10 });
    setSel(d);
  };

  return (
    <div ref={calRef} style={{
      background:M.white, borderRadius:28, padding:"16px 12px 12px",
      boxShadow:`0 8px 32px ${M.brown}12`, border:`1.5px solid ${M.brown}15`, position:"relative",
    }}>
      {/* Month navigation */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, padding:"0 4px" }}>
        <button onClick={onPrev} style={{ background:"none",border:"none",fontSize:20,cursor:"pointer",padding:"4px 8px",color:M.lChar,fontFamily:"inherit" }}>‹</button>
        <div>
          <span style={{ fontSize:17, fontWeight:800, color:M.char }}>{MONTHS_CN[mo]}</span>
          <span style={{ fontSize:12, fontWeight:600, color:M.lChar, marginLeft:6 }}>{yr}</span>
        </div>
        <button onClick={onNext} style={{ background:"none",border:"none",fontSize:20,cursor:"pointer",padding:"4px 8px",color:M.lChar,fontFamily:"inherit" }}>›</button>
      </div>

      {/* Weekday headers: 日 一 二 三 四 五 六 */}
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

          {/* Reason selector */}
          <div style={{ display:"flex", gap:5, justifyContent:"center", marginBottom:10, flexWrap:"wrap" }}>
            {ABSENCE_REASONS.map(r => (
              <button key={r.id} onClick={() => setEntry(sel, selEntry.hours, r.id)} style={{
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
// ── 4. MAIN APP ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  const now = new Date();
  const [yr, setYr] = useState(now.getFullYear());
  const [mo, setMo] = useState(now.getMonth());

  // Persisted settings (lazy initializers read localStorage once)
  const [tuition,  setTuition]  = useState(() => lsGet("dc_tuition",  2000));
  const [currency, setCurrency] = useState(() => lsGet("dc_currency", "USD"));
  const [sh,       setSh]       = useState(() => lsGet("dc_sh",       8));
  const [eh,       setEh]       = useState(() => lsGet("dc_eh",       18));
  const [absData,  setAbsData]  = useState(() => lsGet("dc_absData",  {}));
  const [setup,    setSetup]    = useState(false);
  const [humorIdx, setHumorIdx] = useState(0);

  // Persist on every change
  useEffect(() => { lsSet("dc_tuition",  tuition);  }, [tuition]);
  useEffect(() => { lsSet("dc_currency", currency); }, [currency]);
  useEffect(() => { lsSet("dc_sh",       sh);       }, [sh]);
  useEffect(() => { lsSet("dc_eh",       eh);       }, [eh]);
  useEffect(() => { lsSet("dc_absData",  absData);  }, [absData]);

  const cur = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  const dh  = eh - sh;
  const dim   = getDays(yr, mo);
  const first = getFirst(yr, mo);

  // All period stats via the reusable helper (swap in a list of months for quarter/year views)
  const { totalAbsHrs, totalAbsDays, sunk, wdays, dailyCost, hrCost,
          sickDays, vacDays, holidayDays, trainingDays, otherDays } =
    calculatePeriodStats(absData, yr, mo, { sh, eh, tuition });

  const getHumor = useCallback((cost) => {
    const pool = HUMOR_MAP[currency] || HUMOR_DEFAULT;
    return pool[humorIdx % pool.length](cost);
  }, [currency, humorIdx]);

  // Re-randomise humor when month changes or absence data first appears
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setHumorIdx(Math.floor(Math.random() * 10)); }, [totalAbsHrs > 0, mo, yr]);

  const mk       = `${yr}-${mo}`;
  const isWe     = (d) => { const w = new Date(yr, mo, d).getDay(); return w === 0 || w === 6; };
  const isToday  = (d) => yr === now.getFullYear() && mo === now.getMonth() && d === now.getDate();
  const getEntry = (d) => absData[`${mk}-${d}`] || { hours: 0, reason: "sick" };
  const setEntry = (d, hours, reason) =>
    setAbsData(p => ({ ...p, [`${mk}-${d}`]: { hours, reason } }));
  const ratio    = (d) => isWe(d) ? 1 : Math.max(0, (dh - getEntry(d).hours) / dh);

  const mood = sunk === 0 ? "happy" : sunk > dailyCost * 5 ? "cry" : "neutral";

  const fmt = (v) => {
    const n = Number(v);
    if (currency === "CNY") return `${cur.symbol}${n.toFixed(0)}`;
    return `${cur.symbol}${n.toFixed(n >= 100 ? 0 : 2)}`;
  };

  const prev = () => { mo === 0  ? (setMo(11), setYr(y => y-1)) : setMo(m => m-1); };
  const next = () => { mo === 11 ? (setMo(0),  setYr(y => y+1)) : setMo(m => m+1); };

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

      {setup && (
        <SettingsModal
          tuition={tuition} setTuition={setTuition}
          currency={currency} setCurrency={setCurrency}
          sh={sh} setSh={setSh} eh={eh} setEh={setEh}
          cur={cur} wdays={wdays} dailyCost={dailyCost} fmt={fmt}
          onClose={() => setSetup(false)}
        />
      )}

      <DashboardCard
        sunk={sunk} dailyCost={dailyCost} totalAbsDays={totalAbsDays}
        wdays={wdays} mood={mood} fmt={fmt} getHumor={getHumor}
      />

      <AbsencePills
        sickDays={sickDays} vacDays={vacDays} holidayDays={holidayDays}
        trainingDays={trainingDays} otherDays={otherDays} totalAbsHrs={totalAbsHrs}
      />

      <CalendarSection
        yr={yr} mo={mo} dim={dim} first={first}
        dh={dh} hrCost={hrCost} fmt={fmt}
        getEntry={getEntry} setEntry={setEntry}
        isWe={isWe} isToday={isToday} ratio={ratio}
        onPrev={prev} onNext={next}
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
