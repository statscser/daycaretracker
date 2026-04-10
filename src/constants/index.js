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
  // ... 原有的 20 刀以下选项
  (c) => `≈ ${Math.max(1, Math.floor(c / 6.5))} 杯星巴克拿铁`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 18))} 顿 Chipotle 外卖`,
  (c) => `≈ ${Math.max(1,Math.floor(c/19.99))} 个月 Netflix 订阅`,

  // $50 - $150：中等扎心
  (c) => `≈ ${Math.max(1, Math.floor(c / 65))} 年 Costco 会员费`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 98))} 条 Lululemon Align 瑜伽裤`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 139))} 年 Amazon Prime 会员费`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 150))} 张迪士尼乐园门票`,
  
  // $200 - $500：深度扎心
  (c) => `≈ ${Math.max(1, Math.floor(c / 249))} 副 AirPods Pro 耳机`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 499))} 台 Dyson 吹风机`,
  
  // $600 - $1200+：终极扎心
  (c) => `≈ ${Math.max(1, Math.floor(c / 799))} 部 iPhone 17`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 999))} 台 13寸MacBook Air`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 1000))} 次往返国内的机票 ✈️`,
];
export const HUMOR_CAD = [
  (c) => `≈ ${Math.max(1, Math.floor(c / 7))} 杯 Tim Hortons`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 3))} 个 Timbits 甜甜圈`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 25))} 顿 Swiss Chalet 外卖`,
  // $100 - $300 
  (c) => `≈ ${Math.max(1, Math.floor(c / 98))} 条 Lululemon Align 瑜伽裤`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 98))} 件 Roots 连帽衫`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 198))} 件 Aritzia 羊毛外套`,
  // $300+ 
  (c) => `≈ ${Math.max(1, Math.floor(c / 350))} 次 Costco 大采购`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 450))} 个 Dyson 吸尘器`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 700))} 张回国往返机票 ✈️`,
];

export const HUMOR_CNY = [
  (c) => `≈ ${Math.max(1, Math.floor(c / 18))} 杯瑞幸拿铁`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 25))} 杯喜茶/奈雪`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 69))} 个泡泡玛特盲盒`,
  // 300 - 800
  (c) => `≈ ${Math.max(1, Math.floor(c / 350))} 罐飞鹤星飞帆奶粉`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 599))} 张迪士尼乐园门票`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 800))} 次山姆超市大采购`,
  // 1000+
  (c) => `≈ ${Math.max(1, Math.floor(c / 1200))} 套海蓝之谜`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 5999))} 部 iPhone 17`,
];

export const HUMOR_EUR = [
  (c) => `≈ ${Math.max(1, Math.floor(c / 3))} 个中号 Croissant`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 5))} 杯浓缩咖啡 Espresso`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 35))} 顿当地 Bistro 晚餐`,
  // 80 - 200
  (c) => `≈ ${Math.max(1, Math.floor(c / 80))} 件 Zara 换季新装`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 120))} 个 Longchamp 饺子包`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 150))} 台 Nespresso 咖啡机`,
  // 200+
  (c) => `≈ ${Math.max(1, Math.floor(c / 100))} 次 Ryanair 廉航往返 ✈️`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 400))} 次 IKEA 搬家式采购`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 900))} 台 Miele 洗衣机`,
];

export const HUMOR_DEFAULT = [
  (c) => `≈ ${Math.max(1, Math.floor(c / 7))} 杯高品质咖啡`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 25))} 顿丰盛外卖`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 50))} 罐进口奶粉`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 150))} 双新款运动鞋`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 200))} 次超市家庭装采购`,
  (c) => `≈ ${Math.max(1, Math.floor(c / 800))} 部旗舰级手机`,
];
export const HUMOR_MAP = { USD: HUMOR_USD, CAD: HUMOR_CAD, CNY: HUMOR_CNY };

// ─── Absence copy & reasons ───────────────────────────────────────────────────
export const ABSENCE_QUOTES = [
  "宝宝今天在家修炼仙气 ✨", "小肉球不在，好空旷 🤧",
  "宝宝说今天要窝在沙发里 😴", "今天宝宝居家办公 🏠",
  "宝宝表示今天说走就走了 ✈️", "宝宝表示今天不营业 🫠",
];

export const ABSENCE_REASONS = [
  { id: "sick",             label: "💊 生病",    icon: "💊", color: M.sickYellow },
  { id: "vacation",         label: "✈️ 旅行",    icon: "✈️", color: M.mint },
  { id: "holiday",          label: "📆 公共假期", icon: "📆", color: M.holiday },
  { id: "teacher_training", label: "💸 老师培训", icon: "💸", color: M.lav },
  { id: "other",            label: "💔 其他",    icon: "💔", color: M.gray },
];
