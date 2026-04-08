import { M } from "../constants";

export function SegmentedControl({ value, onChange }) {
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
