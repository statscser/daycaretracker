import { useState, useEffect, useCallback } from "react";
import { M, CURRENCIES, HUMOR_MAP, HUMOR_DEFAULT, ABSENCE_REASONS } from "./constants";
import { loadData, saveData, isFirstTime, isPrivacySeen, markPrivacySeen } from "./lib/storage";
import { getDays, getFirst, getTuitionForMonth, calculatePeriodStats, aggregateStats } from "./lib/stats";
import { HeaderSection }    from "./components/HeaderSection";
import { SegmentedControl } from "./components/SegmentedControl";
import { SettingsModal }    from "./components/SettingsModal";
import { DashboardCard }    from "./components/DashboardCard";
import { CalendarSection }  from "./components/CalendarSection";
import { OnboardingModal }  from "./components/OnboardingModal";
import { PrivacyModal }     from "./components/PrivacyModal";

export default function App() {
  const now = new Date();
  const [yr,       setYr]       = useState(now.getFullYear());
  const [mo,       setMo]       = useState(now.getMonth());
  const [viewMode, setViewMode] = useState("month");
  const [data,     setData]     = useState(() => loadData());
  const [setup,    setSetup]    = useState(false);
  const [randomBase,   ]                = useState(() => Math.floor(Math.random() * 1000));
  const [needsSetup,   setNeedsSetup]   = useState(() => isFirstTime());
  // Show privacy notice once for existing users (new users see it embedded in onboarding)
  const [needsPrivacy, setNeedsPrivacy] = useState(() => !isFirstTime() && !isPrivacySeen());

  // Persist unified data object on every change
  useEffect(() => { saveData(data); }, [data]);

  const { settings, tuitionHistory, absences } = data;
  const { currency, sh, eh } = settings;

  const updateSettings = (updates) =>
    setData(d => ({ ...d, settings: { ...d.settings, ...updates } }));

  const updateTuitionHistory = (history) =>
    setData(d => ({ ...d, tuitionHistory: history }));

  const updateAbsence = (key, entry) =>
    setData(d => ({ ...d, absences: { ...d.absences, [key]: entry } }));

  const handleOnboardingSave = ({ settings: s, tuitionHistory: th }) => {
    setData(d => ({ ...d, settings: { ...d.settings, ...s }, tuitionHistory: th }));
    setNeedsSetup(false);
  };

  const cur     = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  const dh      = eh - sh;
  const quarter = Math.floor(mo / 3);

  // Months to aggregate for the current view
  const periodMonths =
    viewMode === "month"   ? [mo] :
    viewMode === "quarter" ? [quarter*3, quarter*3+1, quarter*3+2] :
                             [0,1,2,3,4,5,6,7,8,9,10,11];

  const stats = aggregateStats(absences, yr, periodMonths, tuitionHistory, sh, eh);
  const { totalAbsDays, sunk, wdays, dailyCost,
          sickDays, vacDays, holidayDays, trainingDays, otherDays } = stats;

  // hrCost for the day popup always reflects the displayed calendar month
  const moTuition = getTuitionForMonth(tuitionHistory, yr, mo);
  const moStats   = calculatePeriodStats(absences, yr, mo, { sh, eh, tuition: moTuition });

  const getHumor = useCallback((cost) => {
    const pool = HUMOR_MAP[currency] || HUMOR_DEFAULT;
    const d = new Date();
    const dayNum = d.getFullYear() * 366 +
      Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86_400_000);
    const modeOffset = viewMode === "month" ? 0 : viewMode === "quarter" ? 5 : 11;
    return pool[(randomBase + dayNum + modeOffset) % pool.length](cost);
  }, [currency, viewMode, randomBase]);

  const mk       = `${yr}-${mo}`;
  const isWe     = (d) => { const w = new Date(yr, mo, d).getDay(); return w === 0 || w === 6; };
  const isToday  = (d) => yr === now.getFullYear() && mo === now.getMonth() && d === now.getDate();
  const getEntry = (d) => absences[`${mk}-${d}`] || { hours: 0, reason: "sick" };
  const setEntry = (d, hours, reason) => updateAbsence(`${mk}-${d}`, { hours, reason });
  const ratio    = (d) => isWe(d) ? 1 : Math.max(0, (dh - getEntry(d).hours) / dh);

  const mood = sunk === 0 ? "happy" : sunk > dailyCost * 5 ? "cry" : "neutral";

  const fmt = (v) => {
    const n = Number(v);
    if (currency === "CNY") return `${cur.symbol}${n.toFixed(0)}`;
    return `${cur.symbol}${n.toFixed(n >= 100 ? 0 : 2)}`;
  };

  const dim   = getDays(yr, mo);
  const first = getFirst(yr, mo);

  // Navigation: behaviour varies by viewMode
  const prev = () => {
    if (viewMode === "month") {
      mo === 0 ? (setMo(11), setYr(y => y - 1)) : setMo(m => m - 1);
    } else if (viewMode === "quarter") {
      if (quarter === 0) { setMo(9); setYr(y => y - 1); }
      else setMo((quarter - 1) * 3);
    } else {
      setYr(y => y - 1);
    }
  };

  const next = () => {
    if (viewMode === "month") {
      mo === 11 ? (setMo(0), setYr(y => y + 1)) : setMo(m => m + 1);
    } else if (viewMode === "quarter") {
      if (quarter === 3) { setMo(0); setYr(y => y + 1); }
      else setMo((quarter + 1) * 3);
    } else {
      setYr(y => y + 1);
    }
  };


  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${M.cream} 0%, ${M.white} 40%, ${M.yellow}30 100%)`,
      fontFamily: "'Nunito', 'PingFang SC', 'Hiragino Sans GB', sans-serif",
      color: M.char, padding: "20px 16px 40px", maxWidth: 460, margin: "0 auto",
      position: "relative", overflow: "hidden",
    }}>
      {/* Decorative blobs */}
      <div style={{ position:"absolute",top:-60,right:-40,width:160,height:160,borderRadius:"50%",background:`${M.sage}18`,pointerEvents:"none"}}/>
      <div style={{ position:"absolute",top:200,left:-50,width:120,height:120,borderRadius:"50%",background:`${M.rose}15`,pointerEvents:"none"}}/>

      <HeaderSection onSettingsClick={() => setSetup(true)} />

      <SegmentedControl value={viewMode} onChange={setViewMode} />

      {needsSetup && (
        <OnboardingModal onSave={handleOnboardingSave} />
      )}

      {needsPrivacy && (
        <PrivacyModal onDismiss={() => { markPrivacySeen(); setNeedsPrivacy(false); }} />
      )}

      {setup && (
        <SettingsModal
          settings={settings}
          tuitionHistory={tuitionHistory}
          onUpdateSettings={updateSettings}
          onUpdateTuitionHistory={updateTuitionHistory}
          cur={cur} fmt={fmt}
          onClose={() => setSetup(false)}
        />
      )}

      <DashboardCard
        sunk={sunk} dailyCost={dailyCost} totalAbsDays={totalAbsDays}
        wdays={wdays} mood={mood} fmt={fmt} getHumor={getHumor}
        viewMode={viewMode} quarter={quarter}
        sickDays={sickDays} vacDays={vacDays} holidayDays={holidayDays}
        trainingDays={trainingDays} otherDays={otherDays}
      />

      <CalendarSection
        yr={yr} mo={mo} dim={dim} first={first}
        dh={dh} hrCost={moStats.hrCost} fmt={fmt}
        getEntry={getEntry} setEntry={setEntry}
        isWe={isWe} isToday={isToday} ratio={ratio}
        onPrev={prev} onNext={next}
        viewMode={viewMode} quarter={quarter}
        absences={absences} tuitionHistory={tuitionHistory} sh={sh} eh={eh}
        onGoToMonth={(m) => { setViewMode("month"); setMo(m); }}
        onToday={() => { setViewMode("month"); setYr(now.getFullYear()); setMo(now.getMonth()); }}
      />

      {/* Legend */}
      <div style={{ display:"flex", justifyContent:"center", gap:10, marginTop:12, flexWrap:"wrap" }}>
        {[{ c:M.sage, l:"全勤 ✨" }, ...ABSENCE_REASONS.map(r => ({ c:r.color, l:r.label }))].map((x, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:4 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:x.c }}/>
            <span style={{ fontSize:10, fontWeight:600, color:M.lChar }}>{x.l}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign:"center", marginTop:20, fontSize:10, color:`${M.lChar}88`, fontWeight:600, lineHeight:1.6 }}>
        <p style={{ margin:0 }}>「养娃就是一场看不到尽头的天使投资」</p>
        <p style={{ margin:"2px 0 0", fontSize:9 }}>—— 致每一位含泪续费的爸妈</p>
        <p style={{ margin:"10px 0 0", fontSize:10, color:`${M.lChar}77` }}>
          有建议或报错？请告诉我！&nbsp;
          <a href="https://xhslink.com/m/A11u8iECHmb" target="_blank" rel="noopener noreferrer"
            style={{ color:M.roseDk, textDecoration:"underline", fontWeight:600 }}>小红书</a>
          {" · "}
          <a href="mailto:miniappbygrace@gmail.com"
            style={{ color:M.roseDk, textDecoration:"underline", fontWeight:600 }}>邮箱</a>
        </p>
      </div>
    </div>
  );
}
