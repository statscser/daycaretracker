import { M } from "../constants";
import { getStrings } from "../lib/i18n";
import { Face } from "./icons";

export function DashboardCard({ sunk, dailyCost, totalAbsDays, wdays, mood, fmt, getHumor,
                                viewMode, quarter, lang,
                                sickDays, vacDays, holidayDays, trainingDays, otherDays }) {
  const s = getStrings(lang);
  const reasonItems = [
    { icon:"💊", count:sickDays     },
    { icon:"✈️", count:vacDays      },
    { icon:"📆", count:holidayDays  },
    { icon:"💸", count:trainingDays },
    { icon:"💔", count:otherDays    },
  ].filter(r => r.count > 0);

  const reportTitle =
    viewMode === "month"   ? s.reportMonth :
    viewMode === "quarter" ? s.reportQuarter(quarter + 1) :
                             s.reportYear;
  const subTitle =
    viewMode === "month"   ? s.subMonth :
    viewMode === "quarter" ? s.subQuarter :
                             s.subYear;
  const emptyMsg =
    viewMode === "month"   ? s.emptyMonth :
    viewMode === "quarter" ? s.emptyQuarter :
                             s.emptyYear;

  return (
    <div style={{
      background:M.white, borderRadius:28, padding:"20px 20px 16px", margin:"12px 0",
      boxShadow:`0 8px 32px ${M.brown}15`, border:`1.5px solid ${M.brown}20`,
      textAlign:"center", position:"relative",
    }}>
      <div style={{ position:"absolute", top:14, right:18 }}><Face mood={mood}/></div>
      <p style={{ fontSize:11, color:M.lChar, margin:"0 0 2px", fontWeight:600, paddingLeft:44, paddingRight:44 }}>📊 {reportTitle}</p>
      <p style={{ fontSize:10, color:`${M.lChar}99`, margin:"0 0 8px", paddingLeft:44, paddingRight:44 }}>{subTitle}</p>
      <div style={{
        fontSize:40, fontWeight:800, letterSpacing:-1.5, lineHeight:1.1,
        color: sunk > 0 ? M.roseDk : M.sageDk, transition:"color 0.3s",
      }}>
        {fmt(sunk)}
        <span style={{ fontSize:14, fontWeight:600, letterSpacing:0, marginLeft:4, opacity:0.7 }}>{s.evaporated}</span>
      </div>
      {sunk > 0
        ? <p style={{ fontSize:12, color:M.rose, margin:"6px 0 0", fontWeight:600, lineHeight:1.4 }}>{getHumor(sunk)}</p>
        : <p style={{ fontSize:12, color:M.sage, margin:"6px 0 0", fontWeight:600 }}>{emptyMsg}</p>
      }

      {/* ── Bottom: 3-stat row ── */}
      <div style={{
        display:"flex", justifyContent:"center", gap:20, marginTop:14, paddingTop:12,
        borderTop:`1px dashed ${M.brown}30`, flexWrap:"wrap",
      }}>
        {[
          { l:s.statSchoolDays, v:s.daysInt(wdays),                    i:"📅" },
          { l:s.statDailyRate,  v:fmt(dailyCost),                       i:"💰" },
          { l:s.statMissed,     v:s.daysFloat(totalAbsDays.toFixed(1)), i:"🏠" },
        ].map((x, idx) => (
          <div key={idx} style={{ textAlign:"center", minWidth:64 }}>
            <div style={{ fontSize:15 }}>{x.i}</div>
            <div style={{ fontSize:14, fontWeight:800, color:M.char }}>{x.v}</div>
            <div style={{ fontSize:9,  color:M.lChar, fontWeight:600 }}>{x.l}</div>
          </div>
        ))}
      </div>

      {/* ── Reason breakdown strip ── */}
      {reasonItems.length > 0 && (
        <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:8, flexWrap:"wrap" }}>
          {reasonItems.map((r, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:3,
              background:`${M.cream}80`, borderRadius:10, padding:"3px 8px",
            }}>
              <span style={{ fontSize:12 }}>{r.icon}</span>
              <span style={{ fontSize:11, fontWeight:700, color:M.char }}>{s.daysFloat(r.count)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
