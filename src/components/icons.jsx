import { M } from "../constants";

export function Ring({ ratio, size = 36, isToday, isEmpty, reason, responsive = false }) {
  const sw = size * 0.18, r = (size - sw) / 2;
  const circ = 2 * Math.PI * r, c = size / 2;
  const f = Math.max(0, Math.min(1, ratio));
  let col = M.sage;
  if (f < 1) {
    if      (reason === "sick")             col = M.sickYellow;
    else if (reason === "vacation")         col = M.mint;
    else if (reason === "holiday")          col = M.holiday;
    else if (reason === "teacher_training") col = M.lav;
    else if (reason === "other")            col = M.gray;
    else if (f < 0.5)                       col = M.rose;
    else                                    col = M.sageDeep;
  }
  const iconMap = { sick: "💊", vacation: "✈️", holiday: "📆", teacher_training: "💸", other: "💔" };
  const showIcon = f < 1 && reason && iconMap[reason];
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={responsive ? "100%" : size}
      height={responsive ? "100%" : size}
      style={responsive ? { display:"block" } : undefined}
    >
      {!isEmpty && <>
        <circle cx={c} cy={c} r={r} fill="none" stroke={`${M.brown}40`} strokeWidth={sw} />
        <circle cx={c} cy={c} r={r} fill="none" stroke={col} strokeWidth={sw}
          strokeDasharray={`${f * circ} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${c} ${c})`}
          style={{ transition: "stroke-dasharray 0.5s ease, stroke 0.3s" }} />
        {f === 1 && <circle cx={c} cy={c} r={r * 0.22} fill={`${M.sage}55`} />}
        {showIcon && (
          <text x={c} y={c} textAnchor="middle" dominantBaseline="central"
            fontSize={size * 0.32} style={{ pointerEvents: "none" }}>
            {iconMap[reason]}
          </text>
        )}
      </>}
      {isToday && !isEmpty && (
        <circle cx={c} cy={c} r={r + sw / 2 + 2} fill="none"
          stroke={M.rose} strokeWidth={1.5} strokeDasharray="3 3" />
      )}
    </svg>
  );
}

export function Face({ mood, size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="28" fill={M.yellow} stroke={M.brown} strokeWidth="1.5" />
      <ellipse cx="16" cy="34" rx="5" ry="3.5" fill={`${M.rose}60`} />
      <ellipse cx="44" cy="34" rx="5" ry="3.5" fill={`${M.rose}60`} />
      {mood === "happy" ? <>
        <path d="M20 26Q23 22 26 26" stroke={M.char} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M34 26Q37 22 40 26" stroke={M.char} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M24 36Q30 42 36 36" stroke={M.char} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      </> : mood === "cry" ? <>
        <circle cx="22" cy="25" r="2.5" fill={M.char}/><circle cx="38" cy="25" r="2.5" fill={M.char}/>
        <path d="M18 30Q16 36 20 34" stroke="#89CFF0" strokeWidth="1.5" fill="#89CFF060"/>
        <path d="M42 30Q44 36 40 34" stroke="#89CFF0" strokeWidth="1.5" fill="#89CFF060"/>
        <path d="M24 39Q30 35 36 39" stroke={M.char} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      </> : <>
        <circle cx="22" cy="25" r="2.5" fill={M.char}/><circle cx="38" cy="25" r="2.5" fill={M.char}/>
        <line x1="25" y1="37" x2="35" y2="37" stroke={M.char} strokeWidth="1.8" strokeLinecap="round"/>
      </>}
    </svg>
  );
}
