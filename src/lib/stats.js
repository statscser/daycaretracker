export function getDays(y, m) { return new Date(y, m + 1, 0).getDate(); }
export function getFirst(y, m) { return new Date(y, m, 1).getDay(); }

/**
 * Returns the applicable monthly tuition for a given (yr, mo).
 * Picks the most-recent tuitionHistory entry whose startDate ≤ first day of that month.
 */
export function getTuitionForMonth(tuitionHistory, yr, mo) {
  const monthStart = new Date(yr, mo, 1).getTime();
  let best = null;
  for (const entry of tuitionHistory) {
    const d = new Date(entry.startDate + "T00:00:00").getTime();
    if (d <= monthStart) {
      if (!best || d > new Date(best.startDate + "T00:00:00").getTime()) best = entry;
    }
  }
  return best ? best.amount : 0;
}

/** Stats for a single calendar month. */
export function calculatePeriodStats(absences, year, month, config) {
  const { sh, eh, tuition } = config;
  const dh  = eh - sh;
  const dim = getDays(year, month);
  const mk  = `${year}-${month}`;

  let wdays = 0;
  for (let d = 1; d <= dim; d++) {
    const dow = new Date(year, month, d).getDay();
    if (dow !== 0 && dow !== 6) wdays++;
  }

  const dailyCost = wdays > 0 ? tuition / wdays : 0;
  const hrCost    = dh    > 0 ? dailyCost / dh  : 0;

  let totalAbsHrs = 0, sickDays = 0, vacDays = 0, holidayDays = 0, trainingDays = 0, otherDays = 0;
  for (let d = 1; d <= dim; d++) {
    const entry = absences[`${mk}-${d}`];
    if (entry && entry.hours > 0) {
      totalAbsHrs += entry.hours;
      if      (entry.reason === "sick")             sickDays++;
      else if (entry.reason === "vacation")         vacDays++;
      else if (entry.reason === "holiday")          holidayDays++;
      else if (entry.reason === "teacher_training") trainingDays++;
      else otherDays++;
    }
  }
  const totalAbsDays = dh > 0 ? totalAbsHrs / dh : 0;
  const sunk         = totalAbsHrs * hrCost;

  return { totalAbsHrs, totalAbsDays, sunk, wdays, dailyCost, hrCost,
           sickDays, vacDays, holidayDays, trainingDays, otherDays };
}

/** Aggregates stats across multiple months (for quarter / year views). */
export function aggregateStats(absences, yr, months, tuitionHistory, sh, eh) {
  const acc = { totalAbsHrs: 0, totalAbsDays: 0, sunk: 0, wdays: 0,
                dailyCost: 0, hrCost: 0,
                sickDays: 0, vacDays: 0, holidayDays: 0, trainingDays: 0, otherDays: 0 };
  let totalTuition = 0;
  const dh = eh - sh;

  for (const mo of months) {
    const tuition = getTuitionForMonth(tuitionHistory, yr, mo);
    totalTuition += tuition;
    const s = calculatePeriodStats(absences, yr, mo, { sh, eh, tuition });
    acc.totalAbsHrs  += s.totalAbsHrs;
    acc.totalAbsDays += s.totalAbsDays;
    acc.sunk         += s.sunk;
    acc.wdays        += s.wdays;
    acc.sickDays     += s.sickDays;
    acc.vacDays      += s.vacDays;
    acc.holidayDays  += s.holidayDays;
    acc.trainingDays += s.trainingDays;
    acc.otherDays    += s.otherDays;
  }

  acc.dailyCost = acc.wdays > 0 ? totalTuition / acc.wdays : 0;
  acc.hrCost    = dh > 0 ? acc.dailyCost / dh : 0;
  return acc;
}
