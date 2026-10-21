import React, { useMemo, useState } from "react";
import {
  FiShoppingBag,
  FiUser,
  FiSearch,
  FiDownload,
  FiChevronDown,
  FiRotateCcw,
  FiTrendingDown,
  FiSliders,
  FiX,
} from "react-icons/fi";
import { tofa, fmtDateTime } from "../utils/format";

const toInputDate = (d) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const rangeFromDays = (days) => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { from: toInputDate(from), to: toInputDate(to) };
};

const csvCell = (value) => {
  let s = String(value ?? "");
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

const emptyFilters = { search: "", productId: "", buyer: "", user: "", from: "", to: "" };

const Outputs = ({ transactions = [] }) => {
  const [filters, setFilters] = useState(emptyFilters);
  const [showMore, setShowMore] = useState(false);
  const [view, setView] = useState("history");
  const [activeRange, setActiveRange] = useState("");

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  const applyRange = (label, days) => {
    setActiveRange(label);
    setFilters((f) => ({ ...f, ...rangeFromDays(days) }));
  };

  const outputs = useMemo(
    () => transactions.filter((t) => t.kind === "sale"),
    [transactions]
  );

  const productOptions = useMemo(() => {
    const map = new Map();
    outputs.forEach((t) => {
      if (!map.has(t.productId)) {
        map.set(t.productId, `${t.productName}${t.variant ? ` (${t.variant})` : ""}`);
      }
    });
    return [...map.entries()];
  }, [outputs]);

  const buyerOptions = useMemo(
    () => [...new Set(outputs.map((t) => t.buyerName).filter(Boolean))],
    [outputs]
  );
  const userOptions = useMemo(
    () => [...new Set(outputs.map((t) => t.user).filter(Boolean))],
    [outputs]
  );

  const filtered = useMemo(() => {
    const from = filters.from ? new Date(`${filters.from}T00:00:00`) : null;
    const to = filters.to ? new Date(`${filters.to}T23:59:59.999`) : null;
    const q = filters.search.trim();
    return outputs.filter((t) => {
      if (filters.productId && String(t.productId) !== filters.productId) return false;
      if (filters.buyer && t.buyerName !== filters.buyer) return false;
      if (filters.user && t.user !== filters.user) return false;
      const created = new Date(t.createdAt);
      if (from && created < from) return false;
      if (to && created > to) return false;
      if (
        q &&
        ![t.productName, t.variant, t.buyerName, t.user, t.note].some((v) =>
          (v || "").includes(q)
        )
      )
        return false;
      return true;
    });
  }, [outputs, filters]);

  const summary = useMemo(() => {
    let qty = 0;
    const buyers = new Set();
    const products = new Set();
    filtered.forEach((t) => {
      qty += -t.change;
      if (t.buyerName) buyers.add(t.buyerName);
      products.add(t.productId);
    });
    return { count: filtered.length, qty, buyers: buyers.size, products: products.size };
  }, [filtered]);

  const byBuyer = useMemo(() => {
    const map = new Map();
    filtered.forEach((t) => {
      const key = t.buyerName || "ناشناس";
      const row = map.get(key) || { name: key, count: 0, qty: 0, last: t.createdAt, items: [] };
      row.count += 1;
      row.qty += -t.change;
      if (t.createdAt > row.last) row.last = t.createdAt;
      row.items.push(t);
      map.set(key, row);
    });
    return [...map.values()].sort((a, b) => b.qty - a.qty);
  }, [filtered]);

  const byProduct = useMemo(() => {
    const map = new Map();
    filtered.forEach((t) => {
      const row = map.get(t.productId) || {
        id: t.productId,
        label: t.productName,
        variant: t.variant,
        unit: t.unit,
        sold: 0,
        buyers: new Set(),
      };
      row.sold += -t.change;
      if (t.buyerName) row.buyers.add(t.buyerName);
      map.set(t.productId, row);
    });
    return [...map.values()].sort((a, b) => b.sold - a.sold);
  }, [filtered]);

  const hasFilters = JSON.stringify(filters) !== JSON.stringify(emptyFilters);
  const moreFilterCount = [filters.productId, filters.user].filter(Boolean).length;

  const downloadReport = () => {
    const head = [
      "تاریخ",
      "محصول",
      "مشخصات",
      "تعداد خروج",
      "واحد",
      "خریدار",
      "کاربر ثبت‌کننده",
      "توضیحات",
    ];
    const lines = filtered.map((t) =>
      [
        fmtDateTime(t.createdAt),
        t.productName,
        t.variant,
        -t.change,
        t.unit,
        t.buyerName || "-",
        t.user,
        t.note,
      ]
        .map(csvCell)
        .join(",")
    );
    const csv = "\uFEFF" + [head.map(csvCell).join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `خروجی‌های-انبار-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const select = (value, onChange, placeholder, items) => (
    <div className="outputsfilter">
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {items.map(([val, label]) => (
          <option key={val} value={val}>
            {label}
          </option>
        ))}
      </select>
      <FiChevronDown />
    </div>
  );

  return (
    <div className="outputspage">
      <div className="outputsheader">
        <div className="outputstitle">
          <FiShoppingBag />
          <h2>خروجی‌های انبار</h2>
          <span className="outputstitlecount">{tofa(filtered.length)}</span>
        </div>
        <button className="outputsdownload" onClick={downloadReport}>
          <FiDownload />
          دانلود گزارش
        </button>
      </div>

      <div className="outputstoolbar">
        <div className="outputssearch">
          <FiSearch />
          <input
            type="text"
            placeholder="جستجو در محصول، خریدار یا توضیحات..."
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
          />
        </div>

        <div className="outputsranges">
          <button
            type="button"
            className={activeRange === "today" ? "is-active" : ""}
            onClick={() => applyRange("today", 0)}
          >
            امروز
          </button>
          <button
            type="button"
            className={activeRange === "7d" ? "is-active" : ""}
            onClick={() => applyRange("7d", 7)}
          >
            ۷ روز
          </button>
          <button
            type="button"
            className={activeRange === "30d" ? "is-active" : ""}
            onClick={() => applyRange("30d", 30)}
          >
            ۳۰ روز
          </button>
        </div>

        {select(
          filters.buyer,
          (v) => setFilter("buyer", v),
          "همه خریداران",
          buyerOptions.map((b) => [b, b])
        )}

        <button
          type="button"
          className={`outputsmorebtn ${showMore ? "outputsmorebtnactive" : ""}`}
          onClick={() => setShowMore((s) => !s)}
        >
          <FiSliders />
          فیلترهای بیشتر
          {moreFilterCount > 0 && (
            <span className="outputsmorebtnbadge">{tofa(moreFilterCount)}</span>
          )}
        </button>

        {hasFilters && (
          <button
            type="button"
            className="outputsreset"
            onClick={() => {
              setFilters(emptyFilters);
              setActiveRange("");
            }}
            title="پاک کردن فیلترها"
          >
            <FiRotateCcw />
          </button>
        )}
      </div>

      {showMore && (
        <div className="outputsmore">
          <div className="outputsmoreheader">
            <span>فیلترهای بیشتر</span>
            <button type="button" onClick={() => setShowMore(false)}>
              <FiX />
            </button>
          </div>
          <div className="outputsmoregrid">
            <div className="outputsmorefield">
              <label>محصول</label>
              {select(
                filters.productId,
                (v) => setFilter("productId", v),
                "همه محصولات",
                productOptions.map(([id, label]) => [String(id), label])
              )}
            </div>
            <div className="outputsmorefield">
              <label>کاربر ثبت‌کننده</label>
              {select(
                filters.user,
                (v) => setFilter("user", v),
                "همه کاربران",
                userOptions.map((u) => [u, u])
              )}
            </div>
            <div className="outputsmorefield">
              <label>از تاریخ</label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => setFilter("from", e.target.value)}
              />
            </div>
            <div className="outputsmorefield">
              <label>تا تاریخ</label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => setFilter("to", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="outputssummary">
        <div className="outputssummaryitem">
          <span>تعداد خروجی</span>
          <strong>{tofa(summary.count)}</strong>
        </div>
        <div className="outputssummaryitem">
          <span>مجموع تعداد خروج</span>
          <strong className="outputssummarydanger">{tofa(summary.qty)}</strong>
        </div>
        <div className="outputssummaryitem">
          <span>تعداد خریداران</span>
          <strong>{tofa(summary.buyers)}</strong>
        </div>
        <div className="outputssummaryitem">
          <span>تعداد محصولات</span>
          <strong className="outputssummarysuccess">{tofa(summary.products)}</strong>
        </div>
      </div>

      <div className="outputstabs">
        {[
          ["history", "تاریخچه"],
          ["customers", "به تفکیک خریدار"],
          ["products", "به تفکیک محصول"],
        ].map(([key, label]) => (
          <button
            type="button"
            key={key}
            className={view === key ? "outputstabactive" : ""}
            onClick={() => setView(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="outputstablewrap">
        {view === "history" && (
          <table className="outputstable">
            <thead>
              <tr>
                <th>تاریخ و ساعت</th>
                <th>محصول</th>
                <th>تعداد خروج</th>
                <th>خریدار</th>
                <th>کاربر</th>
                <th>توضیحات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="outputsempty">
                    هیچ خروجی‌ای یافت نشد
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id}>
                    <td>{fmtDateTime(t.createdAt)}</td>
                    <td>
                      <span className="outputsproduct">
                        {t.productName}
                        {t.variant && <small>{t.variant}</small>}
                      </span>
                    </td>
                    <td>
                      <span className="outputsqty">
                        <FiTrendingDown />
                        {tofa(Math.abs(t.change))} {t.unit}
                      </span>
                    </td>
                    <td>
                      <span className="outputsuser">
                        <FiUser />
                        {t.buyerName || "-"}
                      </span>
                    </td>
                    <td>{t.user}</td>
                    <td>{t.note || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {view === "customers" && (
          <table className="outputstable">
            <thead>
              <tr>
                <th>خریدار</th>
                <th>تعداد خروجی</th>
                <th>مجموع تعداد</th>
                <th>آخرین خروجی</th>
                <th>محصولات</th>
              </tr>
            </thead>
            <tbody>
              {byBuyer.length === 0 ? (
                <tr>
                  <td colSpan="5" className="outputsempty">
                    خروجی‌ای ثبت نشده است
                  </td>
                </tr>
              ) : (
                byBuyer.map((b) => (
                  <tr key={b.name}>
                    <td>
                      <span className="outputsuser">
                        <FiUser />
                        {b.name}
                      </span>
                    </td>
                    <td>{tofa(b.count)}</td>
                    <td>{tofa(b.qty)}</td>
                    <td>{fmtDateTime(b.last)}</td>
                    <td>
                      <div className="outputschips">
                        {b.items.slice(0, 3).map((it) => (
                          <span className="typechip" key={it.id}>
                            {it.productName} × {tofa(Math.abs(it.change))}
                          </span>
                        ))}
                        {b.items.length > 3 && (
                          <span className="typechip">+{tofa(b.items.length - 3)}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {view === "products" && (
          <table className="outputstable">
            <thead>
              <tr>
                <th>محصول</th>
                <th>مجموع خروج</th>
                <th>تعداد خریدار</th>
              </tr>
            </thead>
            <tbody>
              {byProduct.length === 0 ? (
                <tr>
                  <td colSpan="3" className="outputsempty">
                    موردی یافت نشد
                  </td>
                </tr>
              ) : (
                byProduct.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className="outputsproduct">
                        {p.label}
                        {p.variant && <small>{p.variant}</small>}
                      </span>
                    </td>
                    <td>
                      {tofa(p.sold)} {p.unit}
                    </td>
                    <td>{tofa(p.buyers.size)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Outputs;