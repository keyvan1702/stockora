import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FiPlus,
  FiPackage,
  FiInfo,
  FiSliders,
  FiTrendingUp,
  FiTrendingDown,
  FiTarget,
  FiSave,
} from "react-icons/fi";
import { tofa, tolatin, normDecimal, findType, variantLabel } from "../utils/format";
import { useToast } from "./ToastContext";
import Select from "./Select";

const emptyForm = (typeId = "") => ({
  typeId,
  name: "",
  attrs: {},
  count: "",
});

const STOCK_MODES = [
  { key: "increase", label: "افزایش موجودی", icon: <FiTrendingUp /> },
  { key: "decrease", label: "کاهش موجودی", icon: <FiTrendingDown /> },
  { key: "set", label: "تنظیم عدد دقیق", icon: <FiTarget /> },
];

/* ---------------------------------------------------------
   تغییر دستی موجودی
   --------------------------------------------------------- */
const ManualStock = ({ products, productTypes, actions }) => {
  const toast = useToast();
  const [productId, setProductId] = useState("");
  const [mode, setMode] = useState("increase");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const product = productId ? products.find((p) => String(p.id) === String(productId)) : null;
  const type = product ? findType(productTypes, product.typeId) : null;

  const options = useMemo(
    () =>
      products.map((p) => {
        const t = findType(productTypes, p.typeId);
        const v = variantLabel(t, p);
        return {
          value: p.id,
          label: `${p.name}${v ? ` — ${v}` : ""} (${tofa(p.count)} ${t?.unit || ""})`,
        };
      }),
    [products, productTypes]
  );

  const amount = Number(tolatin(qty)) || 0;
  const current = product?.count ?? 0;
  const next =
    mode === "increase" ? current + amount : mode === "decrease" ? current - amount : amount;
  const invalid = !product || qty === "" || (mode !== "set" && amount <= 0) || next < 0;
  const unchanged = product && next === current;

  const submit = async () => {
    if (!product) {
      toast.error("لطفاً محصول را انتخاب کنید!");
      return;
    }
    if (qty === "" || (mode !== "set" && amount <= 0)) {
      toast.error("مقدار واردشده معتبر نیست!");
      return;
    }
    if (next < 0) {
      toast.error(`موجودی کافی نیست! موجودی فعلی: ${tofa(current)}`);
      return;
    }
    if (unchanged) {
      toast.error("مقدار جدید با موجودی فعلی برابر است.");
      return;
    }

    const payload =
      mode === "increase"
        ? { delta: amount, kind: "restock", reason: "ورود کالا" }
        : mode === "decrease"
        ? { delta: -amount, kind: "adjust", reason: "کاهش دستی موجودی" }
        : { setTo: amount, kind: "adjust", reason: "تنظیم دستی موجودی" };

    setBusy(true);
    try {
      await actions.adjustStock({ productId: product.id, note, ...payload });
      setQty("");
      setNote("");
    } catch {
      /* toast از Maindashboard */
    } finally {
      setBusy(false);
    }
  };

  if (products.length === 0) {
    return (
      <div className="settingsnote">
        <FiInfo />
        هنوز محصولی ثبت نشده است. اول از تب «افزودن محصول» یک محصول اضافه کنید.
      </div>
    );
  }

  return (
    <div className="addproductform">
      <div className="settingsnote stocknote">
        <FiInfo />
        <span>
          از این بخش می‌توانید موجودی هر محصول را به‌صورت دستی افزایش، کاهش یا
          با یک عدد دقیق جایگزین کنید. همه‌ی تغییرات در «لاگ انبار» ثبت می‌شوند.
        </span>
      </div>

      <div className="formrow">
        <div className="formgroup">
          <label>محصول *</label>
          <Select
            value={productId}
            onChange={setProductId}
            placeholder="انتخاب محصول..."
            options={options}
          />
        </div>
      </div>

      <div className="stockmodes">
        {STOCK_MODES.map((m) => (
          <button
            type="button"
            key={m.key}
            className={`stockmode ${mode === m.key ? "stockmodeactive" : ""}`}
            onClick={() => setMode(m.key)}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      <div className="formrow">
        <div className="formgroup">
          <label>
            {mode === "set" ? "موجودی جدید" : "تعداد"}
            {type ? ` (${type.unit})` : ""} *
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="مثلاً ۵۰"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            disabled={!product}
          />
        </div>
        <div className="formgroup">
          <label>توضیحات (اختیاری)</label>
          <input
            type="text"
            placeholder="مثلاً: شمارش انبارگردانی"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            disabled={!product}
          />
        </div>
      </div>

      {product && (
        <div className="stockpreview">
          <div>
            <span>موجودی فعلی</span>
            <strong>
              {tofa(current)} {type?.unit}
            </strong>
          </div>
          <div>
            <span>موجودی بعد از تغییر</span>
            <strong className={next < 0 ? "stockpreviewbad" : "stockpreviewgood"}>
              {qty === "" ? "—" : `${tofa(next)} ${type?.unit || ""}`}
            </strong>
          </div>
        </div>
      )}

      <button
        type="button"
        className="addproductbtn"
        onClick={submit}
        disabled={busy || invalid}
      >
        <FiSave />
        {busy ? "در حال ثبت..." : "ثبت تغییر موجودی"}
      </button>
    </div>
  );
};

/* ---------------------------------------------------------
   صفحه‌ی مدیریت محصولات
   --------------------------------------------------------- */
const AddProduct = ({ products = [], productTypes = [], actions }) => {
  const toast = useToast();
  const [tab, setTab] = useState("add");
  const [form, setForm] = useState(emptyForm());
  const [busy, setBusy] = useState(false);

  const type = form.typeId ? findType(productTypes, Number(form.typeId)) : null;
  const typeFields = type?.fields || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleTypeChange = (v) => {
    setForm(emptyForm(v));
  };

  const handleAttr = (field, value) => {
    const clean = field.kind === "number" ? normDecimal(value) : value;
    setForm({ ...form, attrs: { ...form.attrs, [field.key]: clean } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!type) {
      toast.error("لطفاً نوع محصول را انتخاب کنید!");
      return;
    }
    const missing =
      !form.name.trim() ||
      !form.count.trim() ||
      typeFields.some(
        (f) => f.required && !String(form.attrs[f.key] ?? "").trim()
      );
    if (missing) {
      toast.error("لطفاً تمام فیلدهای الزامی را پر کنید!");
      return;
    }

    const attrs = {};
    typeFields.forEach((f) => {
      const v = form.attrs[f.key];
      if (v === undefined || v === "") attrs[f.key] = "";
      else attrs[f.key] = f.kind === "number" ? Number(v) || 0 : v;
    });

    setBusy(true);
    try {
      await actions.addProduct({
        typeId: type.id,
        name: form.name.trim(),
        attrs,
        count: Number(tolatin(form.count)) || 0,
        shade: "white",
      });
      setForm(emptyForm(String(type.id)));
    } catch {
      /* toast از Maindashboard */
    } finally {
      setBusy(false);
    }
  };

  const title = (
    <div className="addproducttitle">
      <FiPackage />
      <h2>مدیریت محصولات</h2>
    </div>
  );

  if (productTypes.length === 0) {
    return (
      <div className="addproductpage">
        {title}
        <div className="settingsnote">
          هنوز هیچ نوع محصولی تعریف نشده است. اول از بخش{" "}
          <NavLink to="/settings">تنظیمات</NavLink> یک نوع محصول بسازید و متغیرهایش
          را تعریف کنید.
        </div>
      </div>
    );
  }

  return (
    <div className="addproductpage">
      {title}

      <div className="pmtabs">
        <button
          type="button"
          className={`pmtab ${tab === "add" ? "pmtabactive" : ""}`}
          onClick={() => setTab("add")}
        >
          <FiPlus />
          افزودن محصول
        </button>
        <button
          type="button"
          className={`pmtab ${tab === "stock" ? "pmtabactive" : ""}`}
          onClick={() => setTab("stock")}
        >
          <FiSliders />
          تغییر دستی موجودی
        </button>
      </div>

      {tab === "stock" ? (
        <ManualStock products={products} productTypes={productTypes} actions={actions} />
      ) : (
        <form className="addproductform" onSubmit={handleSubmit}>
          <div className="formrow">
            <div className="formgroup">
              <label>نوع محصول *</label>
              <Select
                value={form.typeId}
                onChange={handleTypeChange}
                placeholder="انتخاب کنید..."
                options={productTypes.map((t) => ({
                  value: t.id,
                  label: `${t.name} (${tofa(t.fields.length)} متغیر)`,
                }))}
              />
            </div>
            <div className="formgroup">
              <label>نام محصول *</label>
              <input
                type="text"
                name="name"
                placeholder="مثلاً: گالوانیزه فوم‌دار"
                value={form.name}
                onChange={handleChange}
                disabled={!type}
              />
            </div>
          </div>

          {type && (
            <>
              {typeFields.length === 0 ? (
                <div className="settingsnote" style={{ marginBottom: 16 }}>
                  <FiInfo />
                  این نوع محصول هیچ متغیری ندارد. می‌توانید از بخش{" "}
                  <NavLink to="/settings">تنظیمات</NavLink> متغیر اضافه کنید.
                </div>
              ) : (
                <>
                  <div className="typefieldstitle" style={{ marginTop: 0 }}>
                    متغیرهای «{type.name}» (از تنظیمات)
                  </div>
                  {Array.from({ length: Math.ceil(typeFields.length / 2) }, (_, i) =>
                    typeFields.slice(i * 2, i * 2 + 2)
                  ).map((pair, idx) => (
                    <div className="formrow" key={idx}>
                      {pair.map((f) => (
                        <div className="formgroup" key={f.key}>
                          <label>
                            {f.label}
                            {f.required ? " *" : ""}
                          </label>
                          {f.kind === "select" ? (
                            <Select
                              value={form.attrs[f.key] || ""}
                              onChange={(v) => handleAttr(f, v)}
                              placeholder="انتخاب کنید..."
                              options={f.options.map((o) => ({ value: o, label: o }))}
                            />
                          ) : (
                            <input
                              type="text"
                              inputMode={f.kind === "number" ? "decimal" : "text"}
                              value={form.attrs[f.key] ?? ""}
                              onChange={(e) => handleAttr(f, e.target.value)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              )}

              <div className="formrow">
                <div className="formgroup">
                  <label>موجودی اولیه ({type.unit}) *</label>
                  <input
                    type="text"
                    name="count"
                    placeholder="۰"
                    value={form.count}
                    onChange={handleChange}
                    inputMode="numeric"
                  />
                </div>
              </div>
            </>
          )}

          <button type="submit" className="addproductbtn" disabled={!type || busy}>
            <FiPlus />
            {busy ? "در حال افزودن..." : "افزودن محصول"}
          </button>
        </form>
      )}

      <div className="addproductlist">
        <h3>محصولات ثبت‌شده ({tofa(products.length)})</h3>
        <div className="productgrid">
          {products.map((p) => {
            const t = findType(productTypes, p.typeId);
            return (
              <div key={p.id} className="productcard">
                <h4>{p.name}</h4>
                <p>
                  {t?.name}
                  {variantLabel(t, p) ? ` · ${variantLabel(t, p)}` : ""}
                </p>
                <span className="productcount">
                  {tofa(p.count)} {t?.unit}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
