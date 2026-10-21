/* =========================================================
   لایه‌ی داده (API)
   ---------------------------------------------------------
   همه‌ی کامپوننت‌ها فقط با همین فایل با داده کار می‌کنند.
   الان USE_REMOTE = false است و داده در localStorage ذخیره می‌شود
   (مرورگر خودت). وقتی بک‌اند آماده شد:
     1) USE_REMOTE را true کن
     2) در فایل .env مقدار VITE_API_URL را بگذار
   و فقط اگر شکل پاسخ سرور فرق داشت، بخش remote را تنظیم کن.

   endpointهای مورد انتظار:
     GET    /settings                 PUT    /settings
     GET    /product-types            POST   /product-types
     PUT    /product-types/:id        DELETE /product-types/:id
     GET    /products                 POST   /products          → { product, transaction }
     POST   /products/:id/stock       → { product, transaction, customer? }
     GET    /transactions
     GET    /customers                POST   /customers
     PUT    /customers/:id            DELETE /customers/:id

   نکته‌ی مهم: کم/زیاد کردن موجودی و ثبت تراکنش باید در سرور
   در «یک عملیات» انجام شود (POST /products/:id/stock).
   ========================================================= */

import { findType, variantLabel } from "../utils/format";

const USE_REMOTE = false;
const BASE_URL = import.meta.env?.VITE_API_URL || "/api";

/* ---------------- REMOTE ---------------- */

const http = async (method, url, body) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "خطا در ارتباط با سرور");
  return data;
};

const remote = {
  getSettings: () => http("GET", "/settings"),
  saveSettings: (s) => http("PUT", "/settings", s),

  getProductTypes: () => http("GET", "/product-types"),
  saveProductType: (t) =>
    t.id ? http("PUT", `/product-types/${t.id}`, t) : http("POST", "/product-types", t),
  deleteProductType: (id) => http("DELETE", `/product-types/${id}`),

  getProducts: () => http("GET", "/products"),
  createProduct: (data) => http("POST", "/products", data),
  adjustStock: ({ productId, ...rest }) =>
    http("POST", `/products/${productId}/stock`, rest),

  getTransactions: () => http("GET", "/transactions"),

  getCustomers: () => http("GET", "/customers"),
  addCustomer: (c) => http("POST", "/customers", c),
  updateCustomer: (c) => http("PUT", `/customers/${c.id}`, c),
  deleteCustomer: (id) => http("DELETE", `/customers/${id}`),
};

/* ---------------- LOCAL (localStorage) ---------------- */

const PREFIX = "stockora:";

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    throw new Error("ذخیره‌سازی در مرورگر ممکن نیست");
  }
};

const nextId = (list) => Math.max(0, ...list.map((i) => Number(i.id) || 0)) + 1;
const newTxId = () => `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const DEFAULT_SETTINGS = {
  storeName: "مدیریت انبار استوکورا",
  adminEmail: "admin@stockora.ir",
  phone: "۰۲۱-۱۲۳۴۵۶۷۸",
  address: "تهران، خیابان انقلاب",
  minStock: 5,
  currency: "تومان",
};

const DEFAULT_TYPES = [
  {
    id: 1,
    name: "تیغه",
    unit: "شاخه",
    minStock: 0,
    fields: [
      { key: "material", label: "جنس", kind: "text", required: true, options: [] },
      { key: "width", label: "عرض", kind: "number", required: false, options: [] },
      { key: "cover", label: "پوشش", kind: "text", required: false, options: [] },
      { key: "color", label: "رنگ", kind: "text", required: true, options: [] },
      { key: "length", label: "طول شاخه", kind: "text", required: false, options: [] },
    ],
  },
];

const mk = (id, name, material, cover, color, length, count, shade) => ({
  id,
  typeId: 1,
  name,
  attrs: { material, width: 80, cover, color, length },
  count,
  shade,
});

const DEFAULT_PRODUCTS = [
  mk(1, "گالوانیزه فوم‌دار", "گالوانیزه", "رنگ‌شده", "سفید", "۶.۰۰ متر", 72, "white"),
  mk(2, "گالوانیزه فوم‌دار", "گالوانیزه", "رنگ‌شده", "سفید", "۶.۵۵ متر", 103, "cream"),
  mk(3, "گالوانیزه فوم‌دار", "گالوانیزه", "رنگ‌شده", "کرم", "۶.۰۰ متر", 56, "white"),
  mk(4, "گالوانیزه فوم‌دار", "گالوانیزه", "رنگ‌شده", "مشکی", "۶.۵۰ متر", 82, "black"),
  mk(5, "آلومینیومی تک‌رول", "آلومینیوم", "خودرنگ", "سفید", "۵.۲۵ متر", 88, "white"),
  mk(6, "آلومینیومی تک‌رول", "آلومینیوم", "خودرنگ", "مشکی", "۶.۰۰ متر", 64, "black"),
];

const DEFAULT_CUSTOMERS = [
  { id: 1, name: "کمپانی الف", phone: "۰۹۱۲۳۴۵۶۷۸۹", address: "تهران", totalPurchase: 3200 },
  { id: 2, name: "مجموعه ب", phone: "۰۹۸۷۶۵۴۳۲۱۰", address: "تبریز", totalPurchase: 1850 },
];

const ensureSeed = () => {
  if (read("seeded", false)) return;
  write("settings", DEFAULT_SETTINGS);
  write("productTypes", DEFAULT_TYPES);
  write("products", DEFAULT_PRODUCTS);
  write("customers", DEFAULT_CUSTOMERS);
  write("transactions", []);
  write("seeded", true);
};

const buildTransaction = (product, type, extra) => ({
  id: newTxId(),
  createdAt: new Date().toISOString(),
  productId: product.id,
  productName: product.name,
  typeId: product.typeId,
  typeName: type?.name || "",
  unit: type?.unit || "",
  variant: variantLabel(type, product),
  buyerName: null,
  note: "",
  ...extra,
});

const cleanType = (t) => {
  const name = String(t.name || "").trim();
  if (!name) throw new Error("نام نوع محصول الزامی است");
  const fields = (t.fields || []).map((f) => {
    const label = String(f.label || "").trim();
    if (!label) throw new Error("همه‌ی فیلدها باید عنوان داشته باشند");
    return {
      key: f.key || `f_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
      label,
      kind: ["text", "number", "select"].includes(f.kind) ? f.kind : "text",
      required: !!f.required,
      options:
        f.kind === "select"
          ? [...new Set((f.options || []).map((o) => String(o).trim()).filter(Boolean))]
          : [],
    };
  });
  return {
    id: t.id,
    name,
    unit: String(t.unit || "").trim() || "عدد",
    minStock: Number(t.minStock) > 0 ? Number(t.minStock) : 0,
    fields,
  };
};

const local = {
  async getSettings() {
    ensureSeed();
    return { ...DEFAULT_SETTINGS, ...read("settings", {}) };
  },
  async saveSettings(s) {
    const clean = { ...s, minStock: Math.max(0, Number(s.minStock) || 0) };
    write("settings", clean);
    return clean;
  },

  async getProductTypes() {
    ensureSeed();
    return read("productTypes", []);
  },
  async saveProductType(t) {
    const list = read("productTypes", []);
    const clean = cleanType(t);
    if (list.some((x) => x.id !== clean.id && x.name === clean.name)) {
      throw new Error("نوعی با این نام قبلاً تعریف شده است");
    }
    if (clean.id) {
      write("productTypes", list.map((x) => (x.id === clean.id ? clean : x)));
      return clean;
    }
    const created = { ...clean, id: nextId(list) };
    write("productTypes", [...list, created]);
    return created;
  },
  async deleteProductType(id) {
    const used = read("products", []).some((p) => p.typeId === id);
    if (used) throw new Error("این نوع محصول دارد و قابل حذف نیست");
    write("productTypes", read("productTypes", []).filter((t) => t.id !== id));
    return { ok: true };
  },

  async getProducts() {
    ensureSeed();
    return read("products", []);
  },
  async createProduct({ typeId, name, attrs = {}, count = 0, shade = "white", user }) {
    const types = read("productTypes", []);
    const type = findType(types, typeId);
    if (!type) throw new Error("نوع محصول انتخاب نشده است");
    if (!String(name || "").trim()) throw new Error("نام محصول الزامی است");
    for (const f of type.fields) {
      const v = attrs[f.key];
      if (f.required && (v === "" || v === undefined || v === null)) {
        throw new Error(`فیلد «${f.label}» الزامی است`);
      }
    }
    const products = read("products", []);
    const product = {
      id: nextId(products),
      typeId,
      name: String(name).trim(),
      attrs,
      count: Math.max(0, Number(count) || 0),
      shade,
    };
    write("products", [...products, product]);

    let transaction = null;
    if (product.count > 0) {
      transaction = buildTransaction(product, type, {
        kind: "initial",
        reason: "ثبت اولیه",
        oldCount: 0,
        newCount: product.count,
        change: product.count,
        user,
      });
      write("transactions", [transaction, ...read("transactions", [])]);
    }
    return { product, transaction };
  },

  // کم/زیاد کردن موجودی + ثبت تراکنش در یک عملیات
  async adjustStock({
    productId,
    delta,
    setTo,
    kind = "adjust",
    reason,
    buyerName = null,
    note = "",
    user,
  }) {
    const products = read("products", []);
    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error("محصول پیدا نشد");

    const oldCount = product.count;
    const newCount = setTo !== undefined ? Number(setTo) : oldCount + Number(delta);
    if (!Number.isFinite(newCount)) throw new Error("عدد واردشده معتبر نیست");
    if (newCount < 0) {
      throw new Error(`موجودی کافی نیست! موجودی فعلی: ${oldCount.toLocaleString("fa-IR")}`);
    }
    const change = newCount - oldCount;
    if (change === 0) return { product, transaction: null, customer: null };

    const cleanBuyer = String(buyerName || "").trim();
    if (kind === "sale") {
      if (!cleanBuyer) throw new Error("نام خریدار الزامی است");
      if (change >= 0) throw new Error("تعداد فروش باید بزرگ‌تر از صفر باشد");
    }

    const updated = { ...product, count: newCount };
    write("products", products.map((p) => (p.id === productId ? updated : p)));

    const type = findType(read("productTypes", []), product.typeId);
    const transaction = buildTransaction(updated, type, {
      kind,
      reason: reason || { sale: "فروش", restock: "ورود کالا", adjust: "تعدیل دستی" }[kind] || "",
      oldCount,
      newCount,
      change,
      buyerName: kind === "sale" ? cleanBuyer : null,
      note: String(note || "").trim(),
      user,
    });
    write("transactions", [transaction, ...read("transactions", [])]);

    let customer = null;
    if (kind === "sale") {
      const customers = read("customers", []);
      const found = customers.find((c) => c.name === cleanBuyer);
      const qty = -change;
      if (found) {
        customer = { ...found, totalPurchase: (Number(found.totalPurchase) || 0) + qty };
        write("customers", customers.map((c) => (c.id === found.id ? customer : c)));
      } else {
        customer = {
          id: nextId(customers),
          name: cleanBuyer,
          phone: "",
          address: "",
          totalPurchase: qty,
        };
        write("customers", [...customers, customer]);
      }
    }
    return { product: updated, transaction, customer };
  },

  async getTransactions() {
    ensureSeed();
    return read("transactions", []).sort((a, b) =>
      String(b.createdAt).localeCompare(String(a.createdAt))
    );
  },

  async getCustomers() {
    ensureSeed();
    return read("customers", []);
  },
  async addCustomer(c) {
    const list = read("customers", []);
    if (!String(c.name || "").trim() || !String(c.phone || "").trim()) {
      throw new Error("نام و شماره تماس الزامی است!");
    }
    const created = {
      id: nextId(list),
      name: c.name.trim(),
      phone: c.phone.trim(),
      address: (c.address || "").trim(),
      totalPurchase: 0,
    };
    write("customers", [...list, created]);
    return created;
  },
  async updateCustomer(c) {
    const list = read("customers", []);
    const old = list.find((x) => x.id === c.id);
    if (!old) throw new Error("مشتری پیدا نشد");
    if (!String(c.name || "").trim() || !String(c.phone || "").trim()) {
      throw new Error("نام و شماره تماس الزامی است!");
    }
    const updated = {
      ...old,
      name: c.name.trim(),
      phone: c.phone.trim(),
      address: (c.address || "").trim(),
    };
    write("customers", list.map((x) => (x.id === c.id ? updated : x)));
    return updated;
  },
  async deleteCustomer(id) {
    write("customers", read("customers", []).filter((c) => c.id !== id));
    return { ok: true };
  },
};

const api = USE_REMOTE ? remote : local;
export default api;
