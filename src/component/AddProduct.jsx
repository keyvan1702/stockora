import React, { useState } from "react";
import { FiPlus, FiBox } from "react-icons/fi";

const tofa = (n) => Number(n).toLocaleString("fa-IR");
const tolatin = (text) =>
  String(text)
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .replace(/[^0-9]/g, "");

const AddProduct = ({
  products = [],
  setProducts,
  setTransactions,
  currentUser = "مدیر",
}) => {
  const [form, setForm] = useState({
    type: "",
    material: "",
    width: "",
    cover: "",
    color: "",
    length: "",
    count: "",
    shade: "white",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.type.trim() ||
      !form.material.trim() ||
      !form.color.trim() ||
      !form.count.trim()
    ) {
      alert("لطفاً تمام فیلدهای الزامی را پر کنید!");
      return;
    }

    const initialCount = Number(tolatin(form.count)) || 0;
    const newId = Math.max(...products.map((p) => p.id), 0) + 1;

    const newProduct = {
      id: newId,
      type: form.type,
      material: form.material,
      width: Number(tolatin(form.width)) || 0,
      cover: form.cover,
      color: form.color,
      length: form.length,
      count: initialCount,
      shade: form.shade,
    };

    setProducts([...products, newProduct]);

    // لاگ تراکنش ثبت اولیه
    if (setTransactions && initialCount > 0) {
      setTransactions((prev) => [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleString("fa-IR"),
          productId: newId,
          productName: newProduct.type,
          productColor: newProduct.color,
          oldCount: 0,
          newCount: initialCount,
          change: initialCount,
          reason: "ثبت اولیه",
          buyerName: null,
          user: currentUser,
        },
        ...prev,
      ]);
    }

    setForm({
      type: "",
      material: "",
      width: "",
      cover: "",
      color: "",
      length: "",
      count: "",
      shade: "white",
    });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="addproductpage">
      <div className="addproducttitle">
        <FiBox />
        <h2>افزودن محصول جدید</h2>
      </div>

      {submitted && (
        <div className="addproductsuccess">✓ محصول با موفقیت اضافه شد!</div>
      )}

      <form className="addproductform" onSubmit={handleSubmit}>
        <div className="formrow">
          <div className="formgroup">
            <label>نوع محصول *</label>
            <input type="text" name="type" placeholder="مثلاً: گالوانیزه فوم‌دار" value={form.type} onChange={handleChange} />
          </div>
          <div className="formgroup">
            <label>جنس *</label>
            <input type="text" name="material" placeholder="مثلاً: گالوانیزه" value={form.material} onChange={handleChange} />
          </div>
        </div>

        <div className="formrow">
          <div className="formgroup">
            <label>عرض</label>
            <input type="text" name="width" placeholder="۸۰" value={form.width} onChange={handleChange} inputMode="numeric" />
          </div>
          <div className="formgroup">
            <label>پوشش</label>
            <input type="text" name="cover" placeholder="مثلاً: رنگ‌شده" value={form.cover} onChange={handleChange} />
          </div>
        </div>

        <div className="formrow">
          <div className="formgroup">
            <label>رنگ *</label>
            <input type="text" name="color" placeholder="مثلاً: سفید" value={form.color} onChange={handleChange} />
          </div>
          <div className="formgroup">
            <label>طول شاخه</label>
            <input type="text" name="length" placeholder="۶.۰۰ متر" value={form.length} onChange={handleChange} />
          </div>
        </div>

        <div className="formrow">
          <div className="formgroup">
            <label>تعداد شاخه *</label>
            <input type="text" name="count" placeholder="۰" value={form.count} onChange={handleChange} inputMode="numeric" />
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

        <button type="submit" className="addproductbtn">
          <FiPlus />
          افزودن محصول
        </button>
      </form>

      <div className="addproductlist">
        <h3>محصولات ثبت‌شده ({tofa(products.length)})</h3>
        <div className="productgrid">
          {products.map((p) => (
            <div key={p.id} className="productcard">
              <div className={`productshade productshade${p.shade}`}></div>
              <h4>{p.type}</h4>
              <p>{p.color}</p>
              <span className="productcount">{tofa(p.count)} شاخه</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddProduct;