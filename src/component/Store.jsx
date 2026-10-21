import React, { useState } from "react";
import {
  FiBox,
  FiSearch,
  FiChevronDown,
  FiMinus,
  FiPlus,
  FiMoreVertical,
  FiInfo,
  FiChevronRight,
  FiChevronLeft,
  FiChevronsRight,
  FiChevronsLeft,
  FiTrendingDown,
  FiCheck,
} from "react-icons/fi";

const filterfields = [
  { key: "type", label: "نوع محصول" },
  { key: "material", label: "جنس محصول" },
  { key: "color", label: "رنگ" },
  { key: "cover", label: "پوشش" },
  { key: "length", label: "طول شاخه" },
];

const tofa = (number) => Number(number).toLocaleString("fa-IR");
const tolatin = (text) =>
  String(text)
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .replace(/[^0-9]/g, "");

const PAGE_SIZE = 8; // تعداد آیتم در هر صفحه

const Store = ({
  products = [],
  setProducts,
  setTransactions,
  currentUser = "مدیر",
  customers = [],
  setCustomers,
  onSaleRecorded, // callback اختیاری برای آپدیت آمار داشبورد
}) => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    material: "",
    color: "",
    cover: "",
    length: "",
  });
  const [page, setPage] = useState(1);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [buyerInfo, setBuyerInfo] = useState({ name: "", qty: "" });
  const [editQty, setEditQty] = useState({}); // { [id]: "مقدار در حال تایپ" }

  // --- ثبت یک تراکنش با ساختار یکسان ---
  const pushTransaction = (payload) => {
    if (!setTransactions) return;
    setTransactions((prev) => [
      {
        id: Date.now() + Math.random(),
        timestamp: new Date().toLocaleString("fa-IR"),
        user: currentUser,
        ...payload,
      },
      ...prev,
    ]);
  };

  // --- تغییر موجودی (بدون ثبت تراکنش؛ تراکنش را caller ثبت می‌کند) ---
  const applyCount = (id, newCount) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, count: newCount } : p))
    );
  };

  // --- +/- دکمه‌ها ---
  const step = (product, delta) => {
    const oldCount = product.count;
    const newCount = Math.max(0, oldCount + delta);
    if (newCount === oldCount) return;

    applyCount(product.id, newCount);
    pushTransaction({
      productId: product.id,
      productName: product.type,
      productColor: product.color,
      oldCount,
      newCount,
      change: newCount - oldCount,
      reason: delta > 0 ? "افزایش دستی" : "کاهش دستی",
      buyerName: null,
    });
  };

  // --- ثبت مقدار دستی (روی Enter یا blur یا دکمه) ---
  const commitManual = (product) => {
    const raw = editQty[product.id];
    if (raw === undefined) return;
    const newCount = Math.max(0, Number(tolatin(raw)) || 0);

    // پاک کردن مقدار ویرایشی این آیتم
    setEditQty((prev) => {
      const copy = { ...prev };
      delete copy[product.id];
      return copy;
    });

    if (newCount === product.count) return;

    applyCount(product.id, newCount);
    pushTransaction({
      productId: product.id,
      productName: product.type,
      productColor: product.color,
      oldCount: product.count,
      newCount,
      change: newCount - product.count,
      reason: "تعدیل دستی",
      buyerName: null,
    });
  };

  // --- ثبت فروش ---
  const recordSale = () => {
    if (!buyerInfo.name.trim() || !buyerInfo.qty) {
      alert("لطفاً نام خریدار و تعداد را وارد کنید!");
      return;
    }

    const qty = Number(tolatin(buyerInfo.qty)) || 0;
    const product = products.find((p) => p.id === selectedProductId);

    if (!product) return;
    if (qty <= 0) {
      alert("تعداد باید بزرگ‌تر از صفر باشد!");
      return;
    }
    if (qty > product.count) {
      alert(
        `موجودی کافی نیست! موجودی فعلی: ${tofa(product.count)} شاخه`
      );
      return;
    }

    const oldCount = product.count;
    const newCount = oldCount - qty;
    applyCount(product.id, newCount);

    // فقط یک تراکنش ثبت می‌شود
    pushTransaction({
      productId: product.id,
      productName: product.type,
      productColor: product.color,
      oldCount,
      newCount,
      change: -qty,
      qty,
      reason: "فروش",
      buyerName: buyerInfo.name,
    });

    // آپدیت مشتری (اگر وجود داشت، افزایش می‌دهیم؛ وگرنه اضافه می‌کنیم)
    if (setCustomers) {
      setCustomers((prev) => {
        const exists = prev.find((c) => c.name === buyerInfo.name);
        if (exists) {
          const currentTotal = Number(tolatin(String(exists.totalPurchase))) || 0;
          return prev.map((c) =>
            c.id === exists.id
              ? { ...c, totalPurchase: currentTotal + qty }
              : c
          );
        }
        return [
          ...prev,
          {
            id: Math.max(...prev.map((c) => c.id), 0) + 1,
            name: buyerInfo.name,
            phone: "",
            address: "",
            totalPurchase: qty,
          },
        ];
      });
    }

    if (onSaleRecorded) onSaleRecorded({ qty, product });

    setBuyerInfo({ name: "", qty: "" });
    setShowSaleModal(false);
    setSelectedProductId(null);
  };

  const options = (key) => [...new Set(products.map((item) => item[key]))];

  const shown = products.filter((item) => {
    const matchSearch =
      item.type.includes(search) || item.color.includes(search);
    const matchFilters = filterfields.every(
      (field) => !filters[field.key] || item[field.key] === filters[field.key]
    );
    return matchSearch && matchFilters;
  });

  const totalPages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedShown = shown.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  return (
    <div className="store">
      <div className="storetitle">
        <FiBox />
        <h2>لیست محصولات</h2>
      </div>

      <div className="storetools">
        <div className="storefilters">
          {filterfields.map((field) => (
            <div className="storefilter" key={field.key}>
              <label className="storefilterlabel">{field.label}</label>
              <div className="storeselectwrap">
                <select
                  className="storeselect"
                  value={filters[field.key]}
                  onChange={(e) => {
                    setPage(1);
                    setFilters({ ...filters, [field.key]: e.target.value });
                  }}
                >
                  <option value="">همه</option>
                  {options(field.key).map((option) => (
                    <option value={option} key={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="storeselecticon">
                  <FiChevronDown />
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="storesearch">
          <span className="storesearchicon">
            <FiSearch />
          </span>
          <input
            className="storesearchinput"
            type="text"
            placeholder="جستجو..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="storetablewrap">
        <table className="storetable">
          <thead>
            <tr>
              <th className="storecolimage"></th>
              <th className="storecoltype">نوع تیغه</th>
              <th>عرض</th>
              <th>پوشش</th>
              <th>رنگ</th>
              <th>طول شاخه</th>
              <th>تعداد شاخه</th>
              <th className="storecolactions">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {pagedShown.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "24px", color: "#6b7488" }}>
                  محصولی یافت نشد
                </td>
              </tr>
            ) : (
              pagedShown.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className={`storethumb storethumb${item.shade}`}></div>
                  </td>
                  <td className="storecelltype">{item.type}</td>
                  <td>{tofa(item.width)}</td>
                  <td>{item.cover}</td>
                  <td>{item.color}</td>
                  <td>{item.length}</td>
                  <td>{tofa(item.count)}</td>
                  <td>
                    <div className="storeactions">
                      <button
                        className="storemore"
                        onClick={() => {
                          setSelectedProductId(item.id);
                          setShowSaleModal(true);
                        }}
                        title="ثبت فروش"
                      >
                        <FiTrendingDown />
                      </button>
                      <button
                        className="storeqtybtn storeplus"
                        onClick={() => step(item, +1)}
                        title="افزایش"
                      >
                        <FiPlus />
                      </button>
                      <input
                        className="storeqtyinput"
                        type="text"
                        inputMode="numeric"
                        value={
                          editQty[item.id] !== undefined
                            ? editQty[item.id]
                            : tofa(item.count)
                        }
                        onChange={(e) =>
                          setEditQty({ ...editQty, [item.id]: e.target.value })
                        }
                        onBlur={() => commitManual(item)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            commitManual(item);
                            e.target.blur();
                          }
                        }}
                      />
                      <button
                        className="storeqtybtn storeminus"
                        onClick={() => step(item, -1)}
                        title="کاهش"
                      >
                        <FiMinus />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showSaleModal && (
        <div className="storemodal storemodaloverlay">
          <div className="storemodalcontent">
            <div className="storemodalheader">
              <h3>ثبت فروش محصول</h3>
              <button
                className="storemodalbtn-close"
                onClick={() => setShowSaleModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="storemodalinputs">
              <div className="storemodalinputgroup">
                <label>نام خریدار</label>
                <input
                  type="text"
                  list="customer-names"
                  placeholder="نام خریدار را وارد کنید"
                  value={buyerInfo.name}
                  onChange={(e) =>
                    setBuyerInfo({ ...buyerInfo, name: e.target.value })
                  }
                />
                <datalist id="customer-names">
                  {customers.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>
              <div className="storemodalinputgroup">
                <label>تعداد</label>
                <input
                  type="text"
                  placeholder="تعداد شاخه"
                  inputMode="numeric"
                  value={buyerInfo.qty}
                  onChange={(e) =>
                    setBuyerInfo({ ...buyerInfo, qty: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="storemodalfooter">
              <button
                className="storemodalcancel"
                onClick={() => setShowSaleModal(false)}
              >
                لغو
              </button>
              <button className="storemodalsave" onClick={recordSale}>
                ثبت فروش
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="storefooter">
        <div className="storenote">
          <FiInfo />
          <span>موجودی‌ها به‌صورت تعداد شاخه نمایش داده می‌شوند.</span>
        </div>
        <div className="storepages">
          <button
            className="storepagebtn"
            disabled={safePage === 1}
            onClick={() => setPage(1)}
          >
            <FiChevronsRight />
          </button>
          <button
            className="storepagebtn"
            disabled={safePage === 1}
            onClick={() => setPage(safePage - 1)}
          >
            <FiChevronRight />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((n) => Math.abs(n - safePage) <= 2 || n === 1 || n === totalPages)
            .map((number, idx, arr) => (
              <React.Fragment key={number}>
                {idx > 0 && arr[idx - 1] !== number - 1 && (
                  <span style={{ padding: "0 4px" }}>…</span>
                )}
                <button
                  className={`storepagebtn ${
                    safePage === number ? "storepagebtnactive" : ""
                  }`}
                  onClick={() => setPage(number)}
                >
                  {tofa(number)}
                </button>
              </React.Fragment>
            ))}
          <button
            className="storepagebtn"
            disabled={safePage === totalPages}
            onClick={() => setPage(safePage + 1)}
          >
            <FiChevronLeft />
          </button>
          <button
            className="storepagebtn"
            disabled={safePage === totalPages}
            onClick={() => setPage(totalPages)}
          >
            <FiChevronsLeft />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Store;