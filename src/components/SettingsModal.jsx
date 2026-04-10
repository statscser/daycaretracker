import { useState } from "react";
import { M, CURRENCIES } from "../constants";

export function SettingsModal({ settings, tuitionHistory, onUpdateSettings, onUpdateTuitionHistory,
                                cur, fmt, onClose }) {
  const { currency, sh, eh } = settings;
  const [showAdd,  setShowAdd]  = useState(false);
  const [newStart, setNewStart] = useState("");
  const [newAmt,   setNewAmt]   = useState(
    () => tuitionHistory[tuitionHistory.length - 1]?.amount ?? 2000
  );

  const sorted = [...tuitionHistory].sort((a, b) => a.startDate.localeCompare(b.startDate));

  const addPhase = () => {
    if (!newStart) return;
    onUpdateTuitionHistory([...tuitionHistory, { startDate: newStart, amount: Number(newAmt) }]);
    setShowAdd(false);
    setNewStart("");
  };

  const deletePhase = (entry) => {
    if (tuitionHistory.length <= 1) return;
    onUpdateTuitionHistory(tuitionHistory.filter(e => e !== entry));
  };

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
              <button key={c.code} onClick={() => onUpdateSettings({ currency: c.code })} style={{
                padding:"6px 12px", borderRadius:14, fontSize:12, fontWeight:700,
                fontFamily:"inherit", cursor:"pointer", transition:"all 0.15s",
                border: currency === c.code ? `2px solid ${M.sageDk}` : `1.5px solid ${M.brown}30`,
                background: currency === c.code ? `${M.sage}30` : M.white, color:M.char,
              }}>{c.label}</button>
            ))}
          </div>
        </div>

        {/* Tuition History */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:12, fontWeight:700, color:M.lChar, display:"block", marginBottom:8 }}>
            💰 学费历史 / Tuition Timeline
          </label>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {sorted.map((entry, i) => (
              <div key={`${entry.startDate}-${i}`} style={{
                display:"flex", alignItems:"center", gap:8,
                background:`${M.cream}80`, borderRadius:14, padding:"8px 12px",
                border:`1.5px solid ${M.brown}25`,
              }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10, color:M.lChar, fontWeight:600 }}>起始 {entry.startDate}</div>
                  <div style={{ fontSize:15, fontWeight:800, color:M.char }}>
                    {fmt(entry.amount)}
                    <span style={{ fontSize:10, fontWeight:600, color:M.lChar, marginLeft:3 }}>/月</span>
                  </div>
                </div>
                {sorted.length > 1 && (
                  <button onClick={() => deletePhase(entry)} style={{
                    background:`${M.rose}20`, border:"none", borderRadius:10,
                    width:28, height:28, fontSize:13, cursor:"pointer",
                    color:M.roseDk, fontFamily:"inherit",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>✕</button>
                )}
              </div>
            ))}
          </div>

          {!showAdd ? (
            <button onClick={() => setShowAdd(true)} style={{
              width:"100%", marginTop:8, padding:"8px 0",
              background:"transparent", border:`1.5px dashed ${M.brown}40`,
              borderRadius:14, fontSize:12, fontWeight:700, color:M.lChar,
              cursor:"pointer", fontFamily:"inherit",
            }}>＋ 添加新学费阶段</button>
          ) : (
            <div style={{
              marginTop:8, background:`${M.cream}80`, borderRadius:14,
              padding:12, border:`1.5px solid ${M.brown}25`,
            }}>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:8 }}>
                <div>
                  <label style={{ fontSize:10, fontWeight:700, color:M.lChar, display:"block", marginBottom:4 }}>起始日期</label>
                  <input type="date" value={newStart} onChange={e => setNewStart(e.target.value)} style={{
                    width:"100%", minWidth:0, boxSizing:"border-box", padding:"7px 10px", borderRadius:10,
                    border:`1.5px solid ${M.brown}40`, fontSize:13, fontFamily:"inherit",
                    background:M.white, color:M.char, outline:"none",
                    WebkitAppearance:"none", appearance:"none",
                  }}/>
                </div>
                <div>
                  <label style={{ fontSize:10, fontWeight:700, color:M.lChar, display:"block", marginBottom:4 }}>
                    金额 ({cur.symbol})
                  </label>
                  <input type="number" value={newAmt}
                    onChange={e => setNewAmt(Math.max(0, +e.target.value))} style={{
                    width:"100%", boxSizing:"border-box", padding:"7px 10px", borderRadius:10,
                    border:`1.5px solid ${M.brown}40`, fontSize:13, fontFamily:"inherit",
                    background:M.white, color:M.char, outline:"none",
                  }}/>
                </div>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={() => setShowAdd(false)} style={{
                  flex:1, padding:"7px 0", background:`${M.rose}20`, border:"none",
                  borderRadius:12, fontSize:12, fontWeight:700,
                  cursor:"pointer", color:M.roseDk, fontFamily:"inherit",
                }}>取消</button>
                <button onClick={addPhase} style={{
                  flex:2, padding:"7px 0",
                  background:`linear-gradient(135deg,${M.sage},${M.sageDk})`,
                  border:"none", borderRadius:12, fontSize:12, fontWeight:700,
                  cursor:"pointer", color:"white", fontFamily:"inherit",
                }}>确认添加</button>
              </div>
            </div>
          )}
        </div>

        {/* Hours */}
        <div style={{ display:"flex", gap:12 }}>
          {[
            { label:"🌅 入园 / Drop-off", val:sh, key:"sh", opts:Array.from({length:12},(_,i)=>i+6) },
            { label:"🌆 离园 / Pick-up",  val:eh, key:"eh", opts:Array.from({length:12},(_,i)=>i+12) },
          ].map((x, i) => (
            <div key={i} style={{ flex:1 }}>
              <label style={{ fontSize:12, fontWeight:700, color:M.lChar, display:"block", marginBottom:6 }}>{x.label}</label>
              <select value={x.val} onChange={e => onUpdateSettings({ [x.key]: +e.target.value })} style={{
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

        <p style={{ textAlign:"center", margin:"12px 0 0", fontSize:10, color:`${M.lChar}77`, fontWeight:500, lineHeight:1.5 }}>
          🔒 所有数据仅存储在您的设备本地，不会上传任何服务器
        </p>
      </div>
    </>
  );
}
