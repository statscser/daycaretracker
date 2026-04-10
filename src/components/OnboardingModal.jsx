import { useState } from "react";
import { M, CURRENCIES } from "../constants";
import { markPrivacySeen } from "../lib/storage";

export function OnboardingModal({ onSave }) {
  const today = new Date().toISOString().slice(0, 10);
  const [currency, setCurrency] = useState("USD");
  const [amount,   setAmount]   = useState("");
  const [startDate,setStartDate]= useState(today);
  const [sh,       setSh]       = useState(8);
  const [eh,       setEh]       = useState(18);
  const [amountErr,setAmountErr]= useState(false);

  const cur = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  const handleSave = () => {
    if (!amount || Number(amount) <= 0) { setAmountErr(true); return; }
    markPrivacySeen();
    onSave({
      settings:       { currency, sh, eh },
      tuitionHistory: [{ startDate, amount: Number(amount) }],
    });
  };

  return (
    // Backdrop doubles as flex centering container — no transform/calc needed
    <div style={{
      position:"fixed", top:0, left:0, right:0, bottom:0,
      background:`${M.cream}e0`,
      backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)",
      zIndex:200,
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"20px", boxSizing:"border-box",
    }}>
      <div style={{
        width:"100%", maxWidth:400,
        background:M.white, borderRadius:28,
        padding:"28px 22px 24px",
        boxShadow:`0 20px 60px rgba(0,0,0,0.15), 0 0 0 1.5px ${M.brown}20`,
        maxHeight:"calc(100vh - 40px)", overflowY:"auto",
        WebkitOverflowScrolling:"touch",
      }}>

        {/* Welcome header */}
        <div style={{ textAlign:"center", marginBottom:22 }}>
          <img src="/icon.svg" alt="icon" style={{ width:72, height:72, marginBottom:10 }} />
          <h2 style={{ margin:0, fontSize:17, fontWeight:800, color:M.char, lineHeight:1.4 }}>
            Hi，欢迎使用宝宝碎钞机！
          </h2>
          <p style={{ margin:"6px 0 0", fontSize:12, color:M.lChar, fontWeight:600, lineHeight:1.5 }}>
            先完成碎钞设定吧💰
          </p>
        </div>

        {/* Currency */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:12, fontWeight:700, color:M.lChar, display:"block", marginBottom:6 }}>
            💱 货币 / Currency
          </label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {CURRENCIES.map(c => (
              <button key={c.code} onClick={() => setCurrency(c.code)} style={{
                padding:"6px 12px", borderRadius:14, fontSize:12, fontWeight:700,
                fontFamily:"inherit", cursor:"pointer", transition:"all 0.15s",
                border: currency === c.code ? `2px solid ${M.sageDk}` : `1.5px solid ${M.brown}30`,
                background: currency === c.code ? `${M.sage}30` : M.white,
                color:M.char,
              }}>{c.label}</button>
            ))}
          </div>
        </div>

        {/* Tuition amount */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:12, fontWeight:700, color:M.lChar, display:"block", marginBottom:6 }}>
            💰 每月学费 ({cur.symbol})
          </label>
          <input
            type="number" inputMode="numeric" value={amount}
            placeholder={`请输入金额，如 ${currency === "CNY" ? "3000" : "2000"}`}
            onChange={e => { setAmount(e.target.value); setAmountErr(false); }}
            style={{
              width:"100%", boxSizing:"border-box", padding:"10px 14px",
              borderRadius:14,
              border: amountErr ? `1.5px solid ${M.roseDk}` : `1.5px solid ${M.brown}40`,
              fontSize:16, fontFamily:"inherit", fontWeight:600,
              background:M.white, color:M.char, outline:"none",
            }}
          />
          {amountErr && (
            <p style={{ margin:"4px 0 0", fontSize:11, color:M.roseDk, fontWeight:600 }}>
              学费不能为空，先填一下嘛 💸
            </p>
          )}
        </div>

        {/* Start date */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:12, fontWeight:700, color:M.lChar, display:"block", marginBottom:6 }}>
            📅 入园起始日期
          </label>
          <input
            type="date" value={startDate}
            onChange={e => setStartDate(e.target.value)}
            style={{
              width:"100%", boxSizing:"border-box", padding:"10px 14px",
              borderRadius:14, border:`1.5px solid ${M.brown}40`,
              fontSize:14, fontFamily:"inherit", fontWeight:600,
              background:M.white, color:M.char, outline:"none",
            }}
          />
        </div>

        {/* Drop-off / Pick-up */}
        <div style={{ display:"flex", gap:12, marginBottom:24 }}>
          {[
            { label:"🌅 入园时间", val:sh, setter:setSh, opts:Array.from({length:12},(_,i)=>i+6)  },
            { label:"🌆 离园时间", val:eh, setter:setEh, opts:Array.from({length:12},(_,i)=>i+12) },
          ].map((x, i) => (
            <div key={i} style={{ flex:1 }}>
              <label style={{ fontSize:12, fontWeight:700, color:M.lChar, display:"block", marginBottom:6 }}>
                {x.label}
              </label>
              <select value={x.val} onChange={e => x.setter(+e.target.value)} style={{
                width:"100%", padding:"10px 14px", borderRadius:14,
                border:`1.5px solid ${M.brown}40`, fontSize:13, fontWeight:600,
                fontFamily:"inherit", background:`${M.cream}80`, color:M.char, outline:"none",
              }}>
                {x.opts.map(h => (
                  <option key={h} value={h}>{String(h).padStart(2,"0")}:00</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Save */}
        <button onClick={handleSave} style={{
          width:"100%", padding:"12px 0",
          background:`linear-gradient(135deg, ${M.sage}, ${M.sageDk})`,
          border:"none", borderRadius:16, color:"white", fontSize:15, fontWeight:700,
          cursor:"pointer", fontFamily:"inherit",
          boxShadow:`0 4px 16px ${M.sage}50`,
          letterSpacing:0.3,
        }}>
          开始记账 ✨
        </button>

        <p style={{ textAlign:"center", margin:"12px 0 0", fontSize:10, color:`${M.lChar}88`, fontWeight:600 }}>
          这些设置之后随时可以改，放心填！
        </p>
        <p style={{ textAlign:"center", margin:"8px 0 0", fontSize:10, color:`${M.lChar}66`, fontWeight:500, lineHeight:1.5 }}>
          🔒 所有数据仅存储在您的设备本地，不会上传至任何服务器
        </p>
      </div>
    </div>
  );
}
