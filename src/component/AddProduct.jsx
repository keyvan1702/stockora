import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiPlus, FiBox, FiInfo } from "react-icons/fi";
import { tofa, tolatin, normDecimal, findType, variantLabel } from "../utils/format";

const emptyForm = (typeId = "") => ({
  typeId,
  name: "",
  attrs: {},
  count: "",
  shade: "white",
});

const AddProduct = ({ products = [], productTypes = [], actions }) => {
  const [form, setForm] = useState(emptyForm());
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const type = form.typeId ? findType(productTypes, Number(form.typeId)) : null;
  const typeFields = type?.fields || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleTypeChange = (e) => {
    setForm({ ...emptyForm(e.target.value), shade: form.shade });
  };

  const handleAttr = (field, value) => {
    const clean = field.kind === "number" ? normDecimal(value) : value;
    setForm({ ...form, attrs: { ...form.attrs, [field.key]: clean } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!type) {
      alert("لطفاً نوع محصول را انتخاب کنید!");
      return;
    }
    const missing =
      !form.name.trim() ||
      !form.count.trim() ||
      typeFields.some(
        (f) => f.required && !String(form.attrs[f.key] ?? "").trim()
      );
    if (missing) {
      alert("لطفاً تمام فیلدهای الزامی را پر کنید!");
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
        shade: form.shade,
      });
      setForm({ ...emptyForm(String(type.id)), shade: "white" });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      alert(err.message || "خطایی رخ داد");
    } finally {
      setBusy(false);
    }
  };

  if (productTypes.length === 0) {
    return (
      <div className="addproductpage">
        <div className="addproducttitle">
          <FiBox />
          <h2>افزودن محصول جدید</h2>
        </div>
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
      <div className="addproducttitle">
        <FiBox />
        <h2>افزودن محصول جدید</h2>
      </div>

      {submitted && <div className="addproductsuccess">✓ محصول با موفقیت اضافه شد!</div>}

      <form className="addproductform" onSubmit={handleSubmit}>
        <div className="formrow">
          <div className="formgroup">
            <label>نوع محصول *</label>
            <select name="typeId" value={form.typeId} onChange={handleTypeChange}>
              <option value="">انتخاب کنید...</option>
              {productTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({tofa(t.fields.length)} متغیر)
                </option>
              ))}
            </select>
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
                          <select
                            value={form.attrs[f.key] || ""}
                            onChange={(e) => handleAttr(f, e.target.value)}
                          >
                            <option value="">انتخاب کنید...</option>
                            {f.options.map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
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
              <div className="formgroup">
                <label>رنگ نمایش</label>
                <select name="shade" value={form.shade} onChange={handleChange}>
                  <option value="white">سفید</option>
                  <option value="cream">کرم</option>
                  <option value="black">مشکی</option>
                </select>
              </div>
            </div>
          </>
        )}

        <button type="submit" className="addproductbtn" disabled={!type || busy}>
          <FiPlus />
          {busy ? "در حال افزودن..." : "افزودن محصول"}
        </button>
      </form>

      <div className="addproductlist">
        <h3>محصولات ثبت‌شده ({tofa(products.length)})</h3>
        <div className="productgrid">
          {products.map((p) => {
            const t = findType(productTypes, p.typeId);
            return (
              <div key={p.id} className="productcard">
                <div className={`productshade productshade${p.shade}`}></div>
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