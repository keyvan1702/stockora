// ابزارهای مشترک نمایش و تبدیل اعداد/تاریخ

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

const toLatinDigits = (text) =>
  String(text ?? "")
    .replace(/[۰-۹]/g, (d) => FA_DIGITS.indexOf(d))
    .replace(/[٠-٩]/g, (d) => AR_DIGITS.indexOf(d));

export const tofa = (n) => Number(n || 0).toLocaleString("fa-IR");

// فقط رقم (برای تعداد صحیح)
export const tolatin = (text) => toLatinDigits(text).replace(/[^0-9]/g, "");

// عدد اعشاری (برای فیلدهای عددی مثل عرض)
export const normDecimal = (text) =>
  toLatinDigits(text).replace(/٫/g, ".").replace(/[^0-9.]/g, "");

export const fmtDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleString("fa-IR");
};

export const findType = (types = [], id) => types.find((t) => t.id === id);

// نمایش مقدار یک ویژگی بر اساس نوع فیلد
export const attrDisplay = (field, value) => {
  if (value === "" || value === undefined || value === null) return "-";
  return field?.kind === "number" ? tofa(value) : String(value);
};

// خلاصه مشخصات محصول، مثلاً: «سفید · ۶.۰۰ متر»
export const variantLabel = (type, product) => {
  if (!type || !product?.attrs) return "";
  return type.fields
    .map((f) => ({ f, v: product.attrs[f.key] }))
    .filter(({ v }) => v !== "" && v !== undefined && v !== null)
    .map(({ f, v }) => attrDisplay(f, v))
    .join(" · ");
};

// حد کمینه: اول تنظیم همان نوع، اگر نبود تنظیم کلی
export const getMinStock = (type, settings) =>
  Number(type?.minStock) > 0 ? Number(type.minStock) : Number(settings?.minStock) || 0;

export const isLowStock = (product, types, settings) =>
  product.count < getMinStock(findType(types, product.typeId), settings);

export const KIND_LABELS = {
  sale: "فروش",
  restock: "ورود کالا",
  adjust: "تعدیل دستی",
  initial: "ثبت اولیه",
};
