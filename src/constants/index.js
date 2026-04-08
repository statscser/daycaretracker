// ─── Design tokens ────────────────────────────────────────────────────────────
export const M = {
  cream: "#F5F0E8", white: "#FAF7F2", sage: "#B5C4B1", sageDk: "#8FA889",
  sageDeep: "#6B8A64", rose: "#D4A5A5", roseDk: "#C08585", lav: "#C5B9CD",
  gray: "#B8AFA6", brown: "#C4B5A4", char: "#4A4543", lChar: "#7A7572",
  peach: "#E8C9B0", mint: "#A8D5BA", yellow: "#F0E4C4",
  sickYellow: "#E8D78E", sickBg: "#FDF6E3",
  holiday: "#89B4C8", holidayBg: "#E3EEF4",
};

// ─── Currency options ─────────────────────────────────────────────────────────
export const CURRENCIES = [
  { code: "USD", symbol: "$",   label: "🇺🇸 USD" },
  { code: "CAD", symbol: "CA$", label: "🇨🇦 CAD" },
  { code: "CNY", symbol: "¥",   label: "🇨🇳 CNY" },
  { code: "AUD", symbol: "A$",  label: "🇦🇺 AUD" },
  { code: "GBP", symbol: "£",   label: "🇬🇧 GBP" },
  { code: "EUR", symbol: "€",   label: "🇪🇺 EUR" },
  { code: "SGD", symbol: "S$",  label: "🇸🇬 SGD" },
];

// ─── Calendar labels ──────────────────────────────────────────────────────────
// Sunday-first: 日 一 二 三 四 五 六
export const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
export const MONTHS_CN = [
  "一月","二月","三月","四月","五月","六月",
  "七月","八月","九月","十月","十一月","十二月",
];

// ─── Humor lines (no emoji) ───────────────────────────────────────────────────
export const HUMOR_USD = [
  (c) => `≈ ${Math.max(1,Math.floor(c/6.5))} 杯星巴克拿铁`,
  (c) => `≈ ${Math.max(1,Math.floor(c/18))} 顿 Chipotle 外卖`,
  (c) => `≈ ${Math.max(1,Math.floor(c/23))} 箱 Pampers 尿不湿`,
  (c) => `≈ ${Math.max(1,Math.floor(c/35))} 罐 Enfamil 奶粉`,
  (c) => `≈ ${Math.max(1,Math.floor(c/2.5))} 个 Trader Joe's 可颂面包`,
  (c) => `≈ ${Math.max(1,Math.floor(c/12))} 次 Target 冲动消费`,
  (c) => `≈ ${Math.max(1,Math.floor(c/19.99))} 个月 Netflix 订阅`,
];
export const HUMOR_CAD = [
  (c) => `≈ ${Math.max(1,Math.floor(c/7))} 杯 Tim Hortons`,
  (c) => `≈ ${Math.max(1,Math.floor(c/22))} 顿 Swiss Chalet`,
  (c) => `≈ ${Math.max(1,Math.floor(c/45))} 罐 Kirkland 奶粉`,
  (c) => `≈ ${Math.max(1,Math.floor(c/16))} 箱 Costco 尿不湿`,
  (c) => `≈ ${Math.max(1,Math.floor(c/3))} 个 Timbits 甜甜圈`,
  (c) => `多买 ${Math.max(1,Math.floor(c/6))} 袋枫叶薯片了 eh`,
];
export const HUMOR_CNY = [
  (c) => `≈ ${Math.max(1,Math.floor(c/18))} 杯瑞幸椰乳拿铁`,
  (c) => `≈ ${Math.max(1,Math.floor(c/25))} 顿美团外卖`,
  (c) => `≈ ${Math.max(1,Math.floor(c/280))} 罐飞鹤奶粉`,
  (c) => `≈ ${Math.max(1,Math.floor(c/3))} 张花王纸尿裤`,
  (c) => `≈ ${Math.max(1,Math.floor(c/15))} 杯奶茶`,
];
export const HUMOR_DEFAULT = [
  (c) => `≈ ${Math.max(1,Math.floor(c/7))} 杯咖啡`,
  (c) => `≈ ${Math.max(1,Math.floor(c/20))} 顿外卖`,
  (c) => `≈ ${Math.max(1,Math.floor(c/40))} 罐奶粉`,
];
export const HUMOR_MAP = { USD: HUMOR_USD, CAD: HUMOR_CAD, CNY: HUMOR_CNY };

// ─── Absence copy & reasons ───────────────────────────────────────────────────
export const ABSENCE_QUOTES = [
  "宝宝今天在家修炼仙气 ✨", "小肉球不在，好空旷 🤧",
  "宝宝被窝龙缠身了 😴", "今天宝宝居家办公 🏠",
  "宝宝表示今天说走就走了 ✈️", "宝宝表示今天不营业 🫠",
];

export const ABSENCE_REASONS = [
  { id: "sick",             label: "💊 生病",    icon: "💊", color: M.sickYellow },
  { id: "vacation",         label: "✈️ 旅行",    icon: "✈️", color: M.lav },
  { id: "holiday",          label: "📆 公共假期", icon: "📆", color: M.holiday },
  { id: "teacher_training", label: "💸 老师培训", icon: "💸", color: M.mint },
  { id: "other",            label: "💔 其他",    icon: "💔", color: M.gray },
];
