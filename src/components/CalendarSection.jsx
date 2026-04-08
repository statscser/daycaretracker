import { useState, useEffect, useRef } from "react";
import { M, WEEKDAYS, MONTHS_CN, ABSENCE_QUOTES, ABSENCE_REASONS } from "../constants";
import { Ring } from "./icons";

export function CalendarSection({ yr, mo, dim, first, dh, hrCost, fmt, getEntry, setEntry,
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
