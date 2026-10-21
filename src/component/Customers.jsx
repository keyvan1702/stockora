import React, { useMemo, useState } from "react";
import {
  FiUsers,
  FiSearch,
  FiPhone,
  FiMapPin,
  FiTrendingUp,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiShoppingBag,
  FiPackage,
  FiChevronDown,
  FiChevronUp,
  FiX,
} from "react-icons/fi";
import { tofa, fmtDateTime, findType } from "../utils/format";

// نرمال‌سازی نام برای تطبیق مطمئن
const normalizeName = (name) => (name || "").trim().replace(/\s+/g, " ");

const Customers = ({
  customers = [],
  actions,
  products = [],
  productTypes = [],
  transactions = [],
}) => {
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", address: "" });
  const [expanded, setExpanded] = useState(null);
  const [purchaseModal, setPurchaseModal] = useState(null);
  const [purchaseForm, setPurchaseForm] = useState({ productId: "", qty: "", note: "" });
  const [busy, setBusy] = useState(false);

  // ⚠️ اصلاح: گروه‌بندی با نام نرمال‌شده
  const purchasesByCustomer = useMemo(() => {
    const map = new Map();
    transactions
      .filter((t) => t.kind === "sale" && t.buyerName)
      .forEach((t) => {
        const key = normalizeName(t.buyerName);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(t);
      });
    return map;
  }, [transactions]);

  const filtered = customers.filter(
    (c) =>
      c.name.includes(search) ||
      (c.phone || "").includes(search) ||
      (c.address || "").includes(search)
  );

  const openAdd = () => {
    setEditingId(null);
    setNewCustomer({ name: "", phone: "", address: "" });
    setShowAddModal(true);
  };

  const openEdit = (customer) => {
    setEditingId(customer.id);
    setNewCustomer({
      name: customer.name,
      phone: customer.phone || "",
      address: customer.address || "",
    });
    setShowAddModal(true);
  };

  const saveCustomer = async () => {
    if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
      alert("نام و شماره تماس الزامی است!");
      return;
    }
    try {
      if (editingId) await actions.updateCustomer({ id: editingId, ...newCustomer });
      else await actions.addCustomer(newCustomer);
      setNewCustomer({ name: "", phone: "", address: "" });
      setEditingId(null);
      setShowAddModal(false);
    } catch (e) {
      alert(e.message || "خطایی رخ داد");
    }
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm("آیا مطمئن‌اید؟")) return;
    try {
      await actions.deleteCustomer(id);
    } catch (e) {
      alert(e.message || "خطایی رخ داد");
    }
  };

  const openPurchase = (customer) => {
    setPurchaseForm({ productId: "", qty: "", note: "" });
    setPurchaseModal({ customerId: customer.id, customerName: customer.name });
  };

  const submitPurchase = async () => {
    if (!purchaseForm.productId || !purchaseForm.qty) {
      alert("لطفاً محصول و تعداد را وارد کنید!");
      return;
    }
    const product = products.find((p) => p.id === Number(purchaseForm.productId));
    if (!product) return;
    const qty = Number(purchaseForm.qty);
    if (qty <= 0) {
      alert("تعداد باید بزرگ‌تر از صفر باشد!");
      return;
    }
    if (qty > product.count) {
      alert(`موجودی کافی نیست! موجودی فعلی: ${tofa(product.count)}`);
      return;
    }
    setBusy(true);
    try {
      await actions.adjustStock({
        productId: product.id,
        delta: -qty,
        kind: "sale",
        reason: "فروش",
        // ⚠️ نام نرمال‌شده ذخیره شود
        buyerName: normalizeName(purchaseModal.customerName),
        note: purchaseForm.note,
      });
      setPurchaseModal(null);
      setPurchaseForm({ productId: "", qty: "", note: "" });
      // بلافاصله ردیف مشتری را باز می‌کنیم تا خرید جدید دیده شود
      setExpanded(purchaseModal.customerId);
    } catch (e) {
      alert(e.message || "خطایی رخ داد");
    } finally {
      setBusy(false);
    }
  };

  const productTypeOf = (product) => findType(productTypes, product.typeId);

  return (
    <div className="customerpage">
      <div className="customertitle">
        <FiUsers />
        <h2>مدیریت مشتریان</h2>
      </div>

      <div className="customertools">
        <div className="customersearch">
          <FiSearch />
          <input
            type="text"
            placeholder="جستجو در نام، تلفن یا آدرس..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="customerbtnAdd" onClick={openAdd}>
          <FiPlus />
          افزودن مشتری
        </button>
      </div>

      {/* مودال افزودن/ویرایش مشتری */}
      {showAddModal && (
        <div className="storemodal storemodaloverlay">
          <div className="storemodalcontent">
            <div className="storemodalheader">
              <h3>{editingId ? "ویرایش مشتری" : "افزودن مشتری جدید"}</h3>
              <button className="storemodalbtn-close" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>
            <div className="storemodalinputs">
              <div className="storemodalinputgroup">
                <label>نام مشتری *</label>
                <input
                  type="text"
                  placeholder="نام"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                />
              </div>
              <div className="storemodalinputgroup">
                <label>شماره تماس *</label>
                <input
                  type="text"
                  placeholder="۰۹..."
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                />
              </div>
              <div className="storemodalinputgroup">
                <label>آدرس</label>
                <input
                  type="text"
                  placeholder="آدرس"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                />
              </div>
            </div>
            <div className="storemodalfooter">
              <button className="storemodalcancel" onClick={() => setShowAddModal(false)}>
                لغو
              </button>
              <button className="storemodalsave" onClick={saveCustomer}>
                {editingId ? "ذخیره" : "افزودن"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال ثبت خرید */}
      {purchaseModal && (
        <div className="storemodal storemodaloverlay">
          <div className="storemodalcontent">
            <div className="storemodalheader">
              <h3>ثبت خرید برای {purchaseModal.customerName}</h3>
              <button className="storemodalbtn-close" onClick={() => setPurchaseModal(null)}>
                ✕
              </button>
            </div>
            <div className="storemodalinputs">
              <div className="storemodalinputgroup">
                <label>محصول *</label>
                <select
                  value={purchaseForm.productId}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, productId: e.target.value })}
                >
                  <option value="">انتخاب محصول...</option>
                  {products.map((p) => {
                    const t = productTypeOf(p);
                    return (
                      <option key={p.id} value={p.id} disabled={p.count <= 0}>
                        {p.name} — {tofa(p.count)} {t?.unit || ""} موجودی
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="storemodalinputgroup">
                <label>تعداد *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="تعداد"
                  value={purchaseForm.qty}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, qty: e.target.value })}
                />
              </div>
              <div className="storemodalinputgroup">
                <label>توضیحات (اختیاری)</label>
                <input
                  type="text"
                  value={purchaseForm.note}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, note: e.target.value })}
                />
              </div>
            </div>
            <div className="storemodalfooter">
              <button className="storemodalcancel" onClick={() => setPurchaseModal(null)}>
                لغو
              </button>
              <button className="storemodalsave" onClick={submitPurchase} disabled={busy}>
                {busy ? "در حال ثبت..." : "ثبت خرید"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* جدول مشتریان */}
      <div className="customertable">
        <table>
          <thead>
            <tr>
              <th style={{ width: 40 }}></th>
              <th>نام مشتری</th>
              <th>شماره تماس</th>
              <th>آدرس</th>
              <th>کل خرید</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="transactionempty">
                  هیچ مشتری ثبت نشده است
                </td>
              </tr>
            ) : (
              filtered.map((customer) => {
                const purchases =
                  purchasesByCustomer.get(normalizeName(customer.name)) || [];
                const isOpen = expanded === customer.id;
                return (
                  <React.Fragment key={customer.id}>
                    <tr>
                      <td>
                        <button
                          className="customerbtn-expand"
                          onClick={() => setExpanded(isOpen ? null : customer.id)}
                          title="مشاهده خریدها"
                        >
                          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                      </td>
                      <td className="customername">{customer.name}</td>
                      <td>
                        <span className="customerinfo">
                          <FiPhone />
                          {customer.phone}
                        </span>
                      </td>
                      <td>
                        <span className="customerinfo">
                          <FiMapPin />
                          {customer.address}
                        </span>
                      </td>
                      <td>
                        <span className="customerpurchase">
                          <FiTrendingUp />
                          {tofa(customer.totalPurchase)}
                        </span>
                      </td>
                      <td>
                        <div className="customeractions">
                          <button
                            className="customerbtn-buy"
                            onClick={() => openPurchase(customer)}
                            title="ثبت خرید"
                          >
                            <FiShoppingBag />
                          </button>
                          <button
                            className="customerbtn-edit"
                            onClick={() => openEdit(customer)}
                            title="ویرایش"
                          >
                            <FiEdit />
                          </button>
                          <button
                            className="customerbtn-delete"
                            onClick={() => deleteCustomer(customer.id)}
                            title="حذف"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="customerpurchasesrow">
                        <td colSpan="6">
                          <div className="customerpurchases">
                            <h4>
                              <FiPackage /> خریدهای {customer.name} ({tofa(purchases.length)})
                            </h4>
                            {purchases.length === 0 ? (
                              <p className="customerpurchasesempty">
                                هنوز خریدی برای این مشتری ثبت نشده است. با دکمه 🛍
                                ثبت خرید کنید.
                              </p>
                            ) : (
                              <div className="customerpurchaseslist">
                                {purchases.map((t) => (
                                  <div className="customerpurchaseitem" key={t.id}>
                                    <span className="customerpurchaseproduct">
                                      {t.productName}
                                      {t.variant && <small>{t.variant}</small>}
                                    </span>
                                    <span className="customerpurchaseqty">
                                      {tofa(Math.abs(t.change))} {t.unit}
                                    </span>
                                    <span className="customerpurchasedate">
                                      {fmtDateTime(t.createdAt)}
                                    </span>
                                    {t.note && (
                                      <span className="customerpurchasenote">{t.note}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;