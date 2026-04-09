import { useState, useEffect, useRef } from "react";
import { M, WEEKDAYS, MONTHS_CN, ABSENCE_QUOTES, ABSENCE_REASONS } from "../constants";
import { Ring } from "./icons";
import { getDays, getFirst, getTuitionForMonth, calculatePeriodStats } from "../lib/stats";

const reasonColor = Object.fromEntries(ABSENCE_REASONS.map(r => [r.id, r.color]));

// ─── Pie chart: filled pie where absence reasons are colored slices ────────────
function PieChart({ wdays, sickDays, vacDays, holidayDays, trainingDays, otherDays, size = 32 }) {
  const c = size / 2;
  const R = size * 0.46;      // outer radius
  const pathR = R / 2;        // stroke-trick: path at R/2, strokeWidth = R fills center→edge
  const circ = 2 * Math.PI * pathR;

  if (wdays === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={c} cy={c} r={R} fill={`${M.brown}25`} />
      </svg>
    );
  }

  const slices = [
    { days: sickDays,     color: M.sickYellow },
    { days: vacDays,      color: M.mint },
    { days: holidayDays,  color: M.holiday },
    { days: trainingDays, color: M.lav },
    { days: otherDays,    color: M.gray },
  ].filter(s => s.days > 0);

  let cumulative = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Full sage base = attended days */}
      <circle cx={c} cy={c} r={R} fill={M.sage} />
      {/* Absence slices drawn on top via thick-stroke arc trick */}
      {slices.map((s, i) => {
        const len    = (s.days / wdays) * circ;
        const offset = -(cumulative / wdays) * circ;
        cumulative  += s.days;
        return (
          <circle key={i} cx={c} cy={c} r={pathR} fill="none"
            stroke={s.color} strokeWidth={R}
            strokeDasharray={`${len} ${circ}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${c} ${c})`} />
        );
      })}
    </svg>
  );
}

export function CalendarSection({ yr, mo, dim, first, dh, hrCost, fmt, getEntry, setEntry,
                                  isWe, isToday, ratio, onPrev, onNext,
                                  viewMode, quarter,
                                  absences, tuitionHistory, sh, eh,
                                  onGoToMonth, onToday }) {
  const [sel,    setSel]    = useState(null);
  const [popPos, setPopPos] = useState({ x: 0, y: 0 });
  const calRef = useRef(null);

  useEffect(() => { setSel(null); }, [yr, mo, viewMode]);

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

 const NavRow = () => (
    <div style={{ 
      position: "relative", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between", 
      marginBottom: 12, 
      padding: "0 4px",
      minHeight: "36px"
    }}>
      {/* 左箭头 */}
      <button onClick={onPrev} style={{ 
        background: "none", border: "none", fontSize: 24, cursor: "pointer", 
        padding: "4px 12px", color: M.lChar, fontFamily: "inherit", zIndex: 10 
      }}>‹</button>

      {/* 居中容器 */}
      <div style={{ 
        flex: 1,
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        overflow: "visible"
      }}>
        {/* 核心技巧：左侧占位符宽度 = 右侧按钮宽度，确保文字在物理中点 */}
        <div style={{ visibility: "hidden", display: "flex", alignItems: "center" }}>
          <button style={{ padding: "2px 8px", marginLeft: 6, fontSize: 11 }}>今天</button>
        </div>

        <span style={{
          fontSize: 16,
          fontWeight: 800,
          color: M.char,
          whiteSpace: "nowrap",
          margin: "0 6px"
        }}>
          {navLabel}
        </span>

        {/* 实际可见的按钮 */}
        <button onClick={onToday} style={{
          background: `${M.sage}22`,
          border: `1.5px solid ${M.sage}50`,
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 500,
          color: M.lChar,
          padding: "2px 8px",
          cursor: "pointer",
          fontFamily: "inherit",
          lineHeight: 1.5,
          whiteSpace: "nowrap"
        }}>今天</button>
      </div>

      {/* 右箭头 */}
      <button onClick={onNext} style={{ 
        background: "none", border: "none", fontSize: 24, cursor: "pointer", 
        padding: "4px 12px", color: M.lChar, fontFamily: "inherit", zIndex: 10 
      }}>›</button>
    </div>
  );

  const cardStyle = {
    background:M.white, borderRadius:28, padding:"16px 12px 12px",
    boxShadow:`0 8px 32px ${M.brown}12`, border:`1.5px solid ${M.brown}15`, position:"relative",
  };

  // ─── Quarter view ──────────────────────────────────────────────────────────
  if (viewMode === "quarter") {
    const qMonths = [quarter*3, quarter*3+1, quarter*3+2];

    // Pre-compute per-month stats for the summary strip
    const qStats = qMonths.map(m => {
      const tuition = getTuitionForMonth(tuitionHistory, yr, m);
      return calculatePeriodStats(absences, yr, m, { sh, eh, tuition });
    });

    return (
      <div ref={calRef} style={cardStyle}>
        <NavRow />

        {/* 3 mini dot-grid panels */}
        <div style={{ display:"flex", gap:8 }}>
          {qMonths.map(m => {
            const mDim   = getDays(yr, m);
            const mFirst = getFirst(yr, m);
            const mk     = `${yr}-${m}`;
            return (
              <div key={m} onClick={() => onGoToMonth(m)} style={{
                flex:1, cursor:"pointer", borderRadius:14, padding:"10px 8px 12px",
                background:`${M.cream}80`, border:`1px solid ${M.brown}15`,
                transition:"background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${M.sage}20`}
              onMouseLeave={e => e.currentTarget.style.background = `${M.cream}80`}
              >
                <div style={{ textAlign:"center", fontSize:11, fontWeight:800, color:M.char, marginBottom:6 }}>
                  {MONTHS_CN[m]}
                </div>
                {/* Mini weekday header */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:1, marginBottom:3 }}>
                  {["日","一","二","三","四","五","六"].map((wd, i) => (
                    <div key={wd} style={{
                      textAlign:"center", fontSize:6, fontWeight:700,
                      color: (i===0||i===6) ? `${M.rose}99` : `${M.lChar}77`,
                    }}>{wd}</div>
                  ))}
                </div>
                {/* Dot grid */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
                  {Array.from({ length: mFirst }).map((_, i) => (
                    <div key={`e${i}`} style={{ aspectRatio:"1" }} />
                  ))}
                  {Array.from({ length: mDim }, (_, i) => i + 1).map(d => {
                    const dow    = new Date(yr, m, d).getDay();
                    const isWknd = dow === 0 || dow === 6;
                    const entry  = absences[`${mk}-${d}`];
                    const hasAbs = entry && entry.hours > 0;
                    let dotColor;
                    if (isWknd)       dotColor = `${M.brown}22`;
                    else if (!hasAbs) dotColor = `${M.sage}80`;
                    else              dotColor = reasonColor[entry.reason] || M.rose;
                    return (
                      <div key={d} style={{
                        aspectRatio:"1", borderRadius:3,
                        background: dotColor,
                        opacity: isWknd ? 0.5 : 1,
                      }} />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary strip — per-month stats */}
        <div style={{ display:"flex", gap:8, marginTop:10 }}>
          {qMonths.map((m, qi) => {
            const s = qStats[qi];
            const reasonPills = ABSENCE_REASONS
              .map(r => ({
                icon: r.icon,
                color: r.color,
                count: r.id === "sick"             ? s.sickDays     :
                       r.id === "vacation"         ? s.vacDays      :
                       r.id === "holiday"          ? s.holidayDays  :
                       r.id === "teacher_training" ? s.trainingDays :
                                                     s.otherDays,
              }))
              .filter(p => p.count > 0);
            return (
              <div key={m} style={{
                flex:1, borderRadius:12, padding:"8px 6px",
                background:`${M.cream}50`, border:`1px solid ${M.brown}12`,
                textAlign:"center",
              }}>
                {/* Loss */}
                <div style={{ fontSize:13, fontWeight:800, lineHeight:1.2,
                  color: s.sunk > 0 ? M.roseDk : M.sageDk }}>
                  {s.sunk > 0 ? fmt(s.sunk) : "✨"}
                </div>
                {/* Absence days */}
                <div style={{ fontSize:9, color:M.lChar, fontWeight:600, margin:"2px 0 4px" }}>
                  {s.sunk > 0
                    ? `${s.totalAbsDays.toFixed(1)} 天缺勤`
                    : "全勤"}
                </div>
                {/* Reason pills */}
                {reasonPills.length > 0 && (
                  <div style={{ display:"flex", gap:3, justifyContent:"center", flexWrap:"wrap" }}>
                    {reasonPills.map((p, i) => (
                      <span key={i} style={{
                        fontSize:9, fontWeight:700, padding:"2px 5px",
                        borderRadius:8, background:`${p.color}40`,
                        color:M.char, lineHeight:1.4,
                      }}>{p.icon}×{p.count}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Year view: 12 month cards with pie chart ──────────────────────────────
  if (viewMode === "year") {
    const now2 = new Date();
    return (
      <div ref={calRef} style={cardStyle}>
        <NavRow />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
          {Array.from({ length: 12 }, (_, m) => {
            const tuition = getTuitionForMonth(tuitionHistory, yr, m);
            const s       = calculatePeriodStats(absences, yr, m, { sh, eh, tuition });
            const isCurMo = yr === now2.getFullYear() && m === now2.getMonth();
            return (
              <div key={m} onClick={() => onGoToMonth(m)} style={{
                borderRadius:14, padding:"8px 4px 8px", textAlign:"center",
                background: isCurMo ? `${M.sage}20` : `${M.cream}60`,
                border: isCurMo ? `1.5px solid ${M.sage}60` : `1px solid ${M.brown}15`,
                cursor:"pointer", transition:"background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${M.lav}30`}
              onMouseLeave={e => e.currentTarget.style.background = isCurMo ? `${M.sage}20` : `${M.cream}60`}
              >
                <div style={{ fontSize:10, fontWeight:800, color:M.char, marginBottom:4 }}>
                  {MONTHS_CN[m]}
                </div>
                <div style={{ display:"flex", justifyContent:"center", marginBottom:4 }}>
                  <PieChart size={34}
                    wdays={s.wdays}
                    sickDays={s.sickDays}       vacDays={s.vacDays}
                    holidayDays={s.holidayDays} trainingDays={s.trainingDays}
                    otherDays={s.otherDays} />
                </div>
                {s.sunk > 0 ? <>
                  <div style={{ fontSize:10, fontWeight:800, color:M.roseDk, lineHeight:1.2 }}>
                    {fmt(s.sunk)}
                  </div>
                  <div style={{ fontSize:9, color:M.lChar, fontWeight:600, marginTop:1 }}>
                    缺勤 {s.totalAbsDays.toFixed(0)} 天
                  </div>
                </> : (
                  <div style={{ fontSize:9, fontWeight:700, color:M.sageDk }}>✨ 全勤</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Month view ────────────────────────────────────────────────────────────
  return (
    <div ref={calRef} style={cardStyle}>
      <NavRow />

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

          {/* Reason selector */}
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
