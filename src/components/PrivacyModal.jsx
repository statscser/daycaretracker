import { M } from "../constants";
import { getStrings } from "../lib/i18n";

export function PrivacyModal({ onDismiss, lang }) {
  const s = getStrings(lang);
  return (
    <>
      <div onClick={onDismiss} style={{
        position:"fixed", top:0, left:0, right:0, bottom:0,
        background:"rgba(0,0,0,0.25)",
        backdropFilter:"blur(4px)", WebkitBackdropFilter:"blur(4px)",
        zIndex:200,
      }}/>
      <div style={{
        position:"fixed",
        top:"50%", left:"50%",
        transform:"translate(-50%, -50%)",
        width:"calc(100% - 48px)", maxWidth:360,
        background:M.white, borderRadius:24,
        padding:"24px 20px 20px",
        boxShadow:`0 16px 48px rgba(0,0,0,0.14), 0 0 0 1.5px ${M.brown}20`,
        zIndex:210,
        textAlign:"center",
      }}>
        <div style={{ fontSize:32, marginBottom:10 }}>🔒</div>
        <h3 style={{ margin:"0 0 8px", fontSize:15, fontWeight:800, color:M.char }}>
          {s.privacyTitle}
        </h3>
        <p style={{ margin:"0 0 18px", fontSize:12, color:M.lChar, fontWeight:600, lineHeight:1.6 }}>
          {s.privacyLine1}<br/>
          <strong style={{ color:M.char }}>{s.privacyLine2}</strong>
          {s.privacyLine3}
        </p>
        <button onClick={onDismiss} style={{
          width:"100%", padding:"10px 0",
          background:`linear-gradient(135deg, ${M.sage}, ${M.sageDk})`,
          border:"none", borderRadius:14, color:"white",
          fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
          boxShadow:`0 4px 12px ${M.sage}40`,
        }}>
          {s.privacyBtn}
        </button>
      </div>
    </>
  );
}
