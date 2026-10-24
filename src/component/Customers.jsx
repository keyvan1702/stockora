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
} from "react-icons/fi";
import { tofa, fmtDateTime, findType } from "../utils/format";
import { useToast } from "./ToastContext";
import Select from "./Select";

const normalizeName = (name) => (name || "").trim().replace(/\s+/g, " ");

const buildAddress = ({ city, street, alley, plaque }) => {
  const parts = [];
  if (city?.trim()) parts.push(`شهر: ${city.trim()}`);
  if (street?.trim()) parts.push(`خیابان: ${street.trim()}`);
  if (alley?.trim()) parts.push(`کوچه: ${alley.trim()}`);
  if (plaque?.trim()) parts.push(`پلاک: ${plaque.trim()}`);
  return parts.join("، ");
};

const parseAddress = (address) => {
  const empty = { city: "", street: "", alley: "", plaque: "" };
  if (!address || !address.trim()) return empty;

  const s = address.trim();
  if (/^شهر\s*:/.test(s)) {
    const parts = s.split(/،\s*/);
    const result = { ...empty };
    parts.forEach((p) => {
      const [k, ...rest] = p.split(":");
      const key = k.trim();
      const value = rest.join(":").trim();
      if (key === "شهر") result.city = value;
      else if (key === "خیابان") result.street = value;
      else if (key === "کوچه") result.alley = value;
      else if (key === "پلاک") result.plaque = value;
    });
    return result;
  }

  return { ...empty, street: s };
};

const emptyCustomerForm = () => ({
  name: "",
  phone: "",
  city: "",
  street: "",
  alley: "",
  plaque: "",
});

const Customers = ({
  customers = [],
  actions,
  products = [],
  productTypes = [],
  transactions = [],
}) => {
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCustomer, setNewCustomer] = useState(emptyCustomerForm());
  const [expanded, setExpanded] = useState(null);
  const [purchaseModal, setPurchaseModal] = useState(null);
  const [purchaseForm, setPurchaseForm] = useState({ productId: "", qty: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [purchasesModal, setPurchasesModal] = useState(null);

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
    setNewCustomer(emptyCustomerForm());
    setShowAddModal(true);
  };

  const openEdit = (customer) => {
    setEditingId(customer.id);
    const parsed = parseAddress(customer.address);
    setNewCustomer({
      name: customer.name,
      phone: customer.phone || "",
      ...parsed,
    });
    setShowAddModal(true);
  };

  const saveCustomer = async () => {
    if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
      toast.error("نام و شماره تماس الزامی است!");
      return;
    }

    const address = buildAddress(newCustomer);
    const payload = {
      name: newCustomer.name.trim(),
      phone: newCustomer.phone.trim(),
      address,
    };

    try {
      if (editingId) await actions.updateCustomer({ id: editingId, ...payload });
      else await actions.addCustomer(payload);
      setNewCustomer(emptyCustomerForm());
      setEditingId(null);
      setShowAddModal(false);
    } catch {
      /* toast از Maindashboard */
    }
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm("آیا مطمئن‌اید؟")) return;
    try {
      await actions.deleteCustomer(id);
    } catch {
      /* toast از Maindashboard */
    }
  };

  const openPurchase = (customer) => {
    setPurchaseForm({ productId: "", qty: "", note: "" });
    setPurchaseModal({ customerId: customer.id, customerName: customer.name });
  };

  const submitPurchase = async () => {
    if (!purchaseForm.productId || !purchaseForm.qty) {
      toast.error("لطفاً محصول و تعداد را وارد کنید!");
      return;
    }
    const product = products.find((p) => p.id === Number(purchaseForm.productId));
    if (!product) return;
    const qty = Number(purchaseForm.qty);
    if (qty <= 0) {
      toast.error("تعداد باید بزرگ‌تر از صفر باشد!");
      return;
    }
    if (qty > product.count) {
      toast.error(`موجودی کافی نیست! موجودی فعلی: ${tofa(product.count)}`);
      return;
    }
    setBusy(true);
    try {
      await actions.adjustStock({
        productId: product.id,
        delta: -qty,
        kind: "sale",
        reason: "فروش",
        buyerName: normalizeName(purchaseModal.customerName),
        note: purchaseForm.note,
      });
      setPurchaseModal(null);
      setPurchaseForm({ productId: "", qty: "", note: "" });
      setExpanded(purchaseModal.customerId);
    } catch {
      /* toast از Maindashboard */
    } finally {
      setBusy(false);
    }
  };

  const productTypeOf = (product) => findType(productTypes, product.typeId);

  const openPurchasesModal = (customer) => {
    const items = purchasesByCustomer.get(normalizeName(customer.name)) || [];
    setPurchasesModal({
      customerName: customer.name,
      phone: customer.phone || "",
      address: customer.address || "",
      items,
    });
  };

  const modalSummary = useMemo(() => {
    if (!purchasesModal) return { count: 0, totalQty: 0, products: 0 };
    const items = purchasesModal.items;
    const totalQty = items.reduce((s, t) => s + Math.abs(t.change), 0);
    const products = new Set(items.map((t) => t.productId)).size;
    return { count: items.length, totalQty, products };
  }, [purchasesModal]);

  // برای دکمه‌ی «ثبت خرید جدید» داخل مودال خریدها
  const openPurchaseFromModal = () => {
    const name = purchasesModal?.customerName;
    const current = customers.find((c) => normalizeName(c.name) === normalizeName(name));
    setPurchasesModal(null);
    if (current) openPurchase(current);
  };

  const purchaseFormValid = !!purchaseForm.productId && !!purchaseForm.qty;

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

              <div className="storemodaladdress">
                <div className="storemodaladdress-title">
                  <FiMapPin /> آدرس <span>(اختیاری)</span>
                </div>

                <div className="storemodaladdress-grid">
                  <div className="storemodalinputgroup">
                    <label>شهر</label>
                    <input
                      type="text"
                      placeholder="مثلاً تهران"
                      value={newCustomer.city}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, city: e.target.value })
                      }
                    />
                  </div>
                  <div className="storemodalinputgroup">
                    <label>خیابان</label>
                    <input
                      type="text"
                      placeholder="مثلاً ولیعصر"
                      value={newCustomer.street}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, street: e.target.value })
                      }
                    />
                  </div>
                  <div className="storemodalinputgroup">
                    <label>کوچه</label>
                    <input
                      type="text"
                      placeholder="مثلاً بهار"
                      value={newCustomer.alley}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, alley: e.target.value })
                      }
                    />
                  </div>
                  <div className="storemodalinputgroup">
                    <label>پلاک</label>
                    <input
                      type="text"
                      placeholder="مثلاً ۱۲"
                      value={newCustomer.plaque}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, plaque: e.target.value })
                      }
                    />
                  </div>
                </div>
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
                <Select
                  value={purchaseForm.productId}
                  onChange={(v) => setPurchaseForm({ ...purchaseForm, productId: v })}
                  placeholder="انتخاب محصول..."
                  options={products.map((p) => {
                    const t = productTypeOf(p);
                    return {
                      value: p.id,
                      label: `${p.name} — ${tofa(p.count)} ${t?.unit || ""} موجودی`,
                      disabled: p.count <= 0,
                    };
                  })}
                />
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
              <button
                className="storemodalsave"
                onClick={submitPurchase}
                disabled={busy || !purchaseFormValid}
              >
                {busy ? "در حال ثبت..." : "ثبت خرید"}
              </button>
            </div>
          </div>
        </div>
      )}

      {purchasesModal && (
        <div className="storemodal storemodaloverlay">
          <div className="storemodalcontent purchasesmodal">
            <div className="storemodalheader">
              <h3>خریدهای {purchasesModal.customerName}</h3>
              <button
                className="storemodalbtn-close"
                onClick={() => setPurchasesModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="storemodalinputs purchasesmodal-body">
              {(purchasesModal.phone || purchasesModal.address) && (
                <div className="purchasesmodal-meta">
                  {purchasesModal.phone && (
                    <span>
                      <FiPhone /> {purchasesModal.phone}
                    </span>
                  )}
                  {purchasesModal.address && (
                    <span>
                      <FiMapPin /> {purchasesModal.address}
                    </span>
                  )}
                </div>
              )}

              <div className="purchasesmodal-summary">
                <div className="purchasesmodal-stat">
                  <span>تعداد خریدها</span>
                  <strong>{tofa(modalSummary.count)}</strong>
                </div>
                <div className="purchasesmodal-stat">
                  <span>مجموع تعداد کالا</span>
                  <strong>{tofa(modalSummary.totalQty)}</strong>
                </div>
                <div className="purchasesmodal-stat">
                  <span>تنوع محصولات</span>
                  <strong>{tofa(modalSummary.products)}</strong>
                </div>
              </div>

              {purchasesModal.items.length === 0 ? (
                <p className="purchasesmodal-empty">
                  هنوز خریدی برای این مشتری ثبت نشده است.
                </p>
              ) : (
                <div className="purchasesmodal-list">
                  {purchasesModal.items.map((t) => (
                    <div className="purchasesmodal-item" key={t.id}>
                      <div className="purchasesmodal-item-main">
                        <strong>{t.productName}</strong>
                        {t.variant && <small>{t.variant}</small>}
                      </div>
                      <span className="purchasesmodal-item-qty">
                        {tofa(Math.abs(t.change))} {t.unit}
                      </span>
                      <span className="purchasesmodal-item-date">
                        {fmtDateTime(t.createdAt)}
                      </span>
                      {t.note && (
                        <span className="purchasesmodal-item-note">{t.note}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="purchasesmodal-actions">
                <button
                  type="button"
                  className="storemodalsave"
                  onClick={openPurchaseFromModal}
                >
                  <FiShoppingBag /> ثبت خرید جدید
                </button>
              </div>
            </div>

            <div className="storemodalfooter">
              <button
                className="storemodalcancel"
                onClick={() => setPurchasesModal(null)}
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="customertable">
        <table className="responsivetable">
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
                      <td className="mobileexpand">
                        <button
                          className="customerbtn-expand"
                          onClick={() => setExpanded(isOpen ? null : customer.id)}
                          title="مشاهده خریدها"
                        >
                          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                      </td>
                      <td className="customername mobileprimary" data-label="نام مشتری">
                        {customer.name}
                      </td>
                      <td data-label="شماره تماس">
                        <span className="customerinfo">
                          <FiPhone />
                          {customer.phone}
                        </span>
                      </td>
                      <td data-label="آدرس">
                        <span className="customerinfo">
                          <FiMapPin />
                          {customer.address || "—"}
                        </span>
                      </td>
                      <td data-label="کل خرید">
                        <button
                          type="button"
                          className="customerpurchase customerpurchase-btn"
                          onClick={() => openPurchasesModal(customer)}
                          title="مشاهده جزئیات خریدها"
                        >
                          <FiTrendingUp />
                          {tofa(customer.totalPurchase)}
                        </button>
                      </td>
                      <td className="mobileactions">
                        <div className="customeractions">
                          <button
                            className="customerbtn-buy"
                            onClick={() => openPurchase(customer)}
                            title="ثبت خرید"
                          >
                            <FiShoppingBag />
                            <span className="mobilebtnlabel">ثبت خرید</span>
                          </button>
                          <button
                            className="customerbtn-edit"
                            onClick={() => openEdit(customer)}
                            title="ویرایش"
                          >
                            <FiEdit />
                            <span className="mobilebtnlabel">ویرایش</span>
                          </button>
                          <button
                            className="customerbtn-delete"
                            onClick={() => deleteCustomer(customer.id)}
                            title="حذف"
                          >
                            <FiTrash2 />
                            <span className="mobilebtnlabel">حذف</span>
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