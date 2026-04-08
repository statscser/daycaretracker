import { M } from "../constants";

export function AbsencePills({ sickDays, vacDays, holidayDays, trainingDays, otherDays, totalAbsHrs }) {
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
