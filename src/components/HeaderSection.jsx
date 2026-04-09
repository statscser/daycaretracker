import { M } from "../constants";

export function HeaderSection({ onSettingsClick, onToday }) {
  return (
    <div style={{ position:"relative", textAlign:"center", marginBottom:8 }}>
      <button onClick={onSettingsClick} style={{
        position:"absolute", left:0, top:0,
        background:`${M.lav}35`, border:`1.5px solid ${M.lav}50`, borderRadius:14,
        width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center",
        cursor:"pointer", fontSize:18, lineHeight:1,
      }}>⚙️</button>
      <button onClick={onToday} style={{
        position:"absolute", right:0, top:6,
        background:`${M.sage}22`, border:`1.5px solid ${M.sage}50`, borderRadius:20,
        fontSize:11, fontWeight:700, color:M.lChar, padding:"5px 13px",
        cursor:"pointer", fontFamily:"inherit", lineHeight:1.4,
        transition:"background 0.15s",
      }}>回到当下</button>
      <div style={{ fontSize:28, marginBottom:2 }}>👶💸</div>
      <h1 style={{
        fontSize:22, fontWeight:800, margin:0, letterSpacing:-0.5,
        background:`linear-gradient(135deg,${M.char},${M.lChar})`,
        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
      }}>宝宝碎钞机</h1>
    </div>
  );
}
