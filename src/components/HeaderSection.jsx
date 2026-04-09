import { M } from "../constants";
import iconUrl from "../assets/icon.svg";

export function HeaderSection({ onSettingsClick }) {
  return (
    <div style={{ position:"relative", textAlign:"center", marginBottom:8 }}>
      <button onClick={onSettingsClick} style={{
        position:"absolute", left:0, top:0,
        background:`${M.lav}35`, border:`1.5px solid ${M.lav}50`, borderRadius:14,
        width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center",
        cursor:"pointer", fontSize:18, lineHeight:1,
      }}>⚙️</button>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:2 }}>
        <img src={iconUrl} alt="" width={36} height={36} style={{ display:"block" }} />
        <h1 style={{
          fontSize:22, fontWeight:800, margin:0, letterSpacing:-0.5,
          background:`linear-gradient(135deg,${M.char},${M.lChar})`,
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
        }}>宝宝碎钞机</h1>
      </div>
    </div>
  );
}
