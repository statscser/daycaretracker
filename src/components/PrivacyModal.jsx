import { M } from "../constants";

export function PrivacyModal({ onDismiss }) {
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
          数据隐私说明
        </h3>
        <p style={{ margin:"0 0 18px", fontSize:12, color:M.lChar, fontWeight:600, lineHeight:1.6 }}>
          本应用的所有数据（学费、缺勤记录）<br/>
          <strong style={{ color:M.char }}>仅存储在您设备的浏览器本地</strong>，<br/>
          不会上传至任何服务器。清除浏览器缓存后数据将丢失，请注意备份。
        </p>
        <button onClick={onDismiss} style={{
          width:"100%", padding:"10px 0",
          background:`linear-gradient(135deg, ${M.sage}, ${M.sageDk})`,
          border:"none", borderRadius:14, color:"white",
          fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
          boxShadow:`0 4px 12px ${M.sage}40`,
        }}>
          明白了，开始用 👍
        </button>
      </div>
    </>
  );
}
