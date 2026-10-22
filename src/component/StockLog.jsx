import React, { useMemo, useState } from "react";
import {
  FiActivity,
  FiSearch,
  FiRotateCcw,
  FiSliders,
  FiX,
  FiTrendingUp,
  FiTrendingDown,
  FiPlusCircle,
  FiEdit,
  FiTrash2,
  FiBox,
  FiUsers,
} from "react-icons/fi";
import { tofa, fmtDateTime } from "../utils/format";
import Select from "./Select";
import DateField from "./DateField";
import TimeField from "./TimeField";

const KIND_META = {
  sale: { label: "فروش / خروج", icon: <FiTrendingDown />, tone: "danger" },
  restock: { label: "ورود کالا", icon: <FiTrendingUp />, tone: "success" },
  initial: { label: "ثبت اولیه محصول", icon: <FiPlusCircle />, tone: "info" },
  adjust: { label: "اصلاح موجودی", icon: <FiSliders />, tone: "warning" },
  product_add: { label: "افزودن محصول", icon: <FiBox />, tone: "info" },
  product_edit: { label: "ویرایش محصول", icon: <FiEdit />, tone: "warning" },
  product_delete: { label: "حذف محصول", icon: <FiTrash2 />, tone: "danger" },
  customer_add: { label: "افزودن مشتری", icon: <FiUsers />, tone: "info" },
  customer_edit: { label: "ویرایش مشتری", icon: <FiEdit />, tone: "warning" },
  customer_delete: { label: "حذف مشتری", icon: <FiTrash2 />, tone: "danger" },
};

const EMPTY_FILTERS = {
  search: "",
  kind: "",
  from: "",
  to: "",
  fromTime: "",
  toTime: "",
};

const toMinutes = (hhmm) => {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const StockLog = ({ transactions = [] }) => {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showMore, setShowMore] = useState(false);

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  const allEvents = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    [transactions]
  );

  const kindOptions = useMemo(() => {
    const set = new Set(allEvents.map((t) => t.kind));
    return [...set].map((k) => ({
      value: k,
      label: KIND_META[k]?.label || k,
    }));
  }, [allEvents]);

  const filtered = useMemo(() => {
    const fromDate = filters.from ? new Date(`${filters.from}T00:00:00`) : null;
    const toDate = filters.to ? new Date(`${filters.to}T23:59:59.999`) : null;
    const fromMin = toMinutes(filters.fromTime);
    const toMin = toMinutes(filters.toTime);
    const q = filters.search.trim().toLowerCase();

    return allEvents.filter((t) => {
      if (filters.kind && t.kind !== filters.kind) return false;

      const created = new Date(t.createdAt);
      if (fromDate && created < fromDate) return false;
      if (toDate && created > toDate) return false;

      if (fromMin !== null || toMin !== null) {
        const mins = created.getHours() * 60 + created.getMinutes();
        if (fromMin !== null && mins < fromMin) return false;
        if (toMin !== null && mins > toMin) return false;
      }

      if (
        q &&
        ![
          t.productName,
          t.variant,
          t.buyerName,
          t.customerName,
          t.note,
          t.reason,
          KIND_META[t.kind]?.label,
        ].some((v) => (v || "").toLowerCase().includes(q))
      )
        return false;

      return true;
    });
  }, [allEvents, filters]);

  const hasFilters = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);
  const moreFilterCount = [
    filters.kind,
    filters.from,
    filters.to,
    filters.fromTime,
    filters.toTime,
  ].filter(Boolean).length;

  const summary = useMemo(() => {
    let sales = 0;
    let inQty = 0;
    let outQty = 0;
    filtered.forEach((t) => {
      if (t.kind === "sale") {
        sales += 1;
        outQty += Math.abs(t.change);
      } else if (t.kind === "restock" || t.kind === "initial") {
        inQty += Math.abs(t.change);
      }
    });
    return { total: filtered.length, sales, inQty, outQty };
  }, [filtered]);

  const kindMeta = (kind) =>
    KIND_META[kind] || { label: kind, icon: <FiActivity />, tone: "info" };

  const changeCell = (t) => {
    if (t.change === 0 || t.change == null) {
      return <span className="lognochanges">—</span>;
    }
    const isPositive = t.change > 0;
    return (
      <span
        className={`logchange ${isPositive ? "logchange-in" : "logchange-out"}`}
      >
        {isPositive ? "+" : "−"} {tofa(Math.abs(t.change))} {t.unit || ""}
      </span>
    );
  };

  const subjectCell = (t) => {
    if (t.kind?.startsWith("customer")) {
      return (
        <span className="logsubject">
          <FiUsers /> {t.customerName || t.buyerName || "-"}
        </span>
      );
    }
    return (
      <span className="logsubject">
        {t.productName || "-"}
        {t.variant && <small>{t.variant}</small>}
      </span>
    );
  };

  return (
    <div className="logpage">
      <div className="logheader">
        <div className="logtitle">
          <FiActivity />
          <h2>لاگ انبار</h2>
          <span className="logtitlecount">{tofa(filtered.length)} رویداد</span>
        </div>
      </div>

      <div className="logtoolbar">
        <div className="logsearch">
          <FiSearch />
          <input
            type="text"
            placeholder="جستجو در محصول، مشتری یا توضیحات..."
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
          />
        </div>

        <Select
          value={filters.kind}
          onChange={(v) => setFilter("kind", v)}
          placeholder="همه رویدادها"
          options={kindOptions}
        />

        <button
          type="button"
          className={`outputsmorebtn ${showMore ? "outputsmorebtnactive" : ""}`}
          onClick={() => setShowMore((s) => !s)}
        >
          <FiSliders />
          فیلتر تاریخ و ساعت
          {moreFilterCount > 0 && (
            <span className="outputsmorebtnbadge">{tofa(moreFilterCount)}</span>
          )}
        </button>

        {hasFilters && (
          <button
            type="button"
            className="outputsreset"
            onClick={() => setFilters(EMPTY_FILTERS)}
            title="پاک کردن فیلترها"
          >
            <FiRotateCcw />
          </button>
        )}
      </div>

      {showMore && (
        <div className="outputsmore">
          <div className="outputsmoreheader">
            <span>فیلتر تاریخ و ساعت</span>
            <button type="button" onClick={() => setShowMore(false)}>
              <FiX />
            </button>
          </div>

          <div className="outputsmoregrid">
            <div className="outputsmorefield">
              <label>از تاریخ</label>
              <DateField
                value={filters.from}
                onChange={(v) => setFilter("from", v)}
                placeholder="از تاریخ"
              />
            </div>
            <div className="outputsmorefield">
              <label>تا تاریخ</label>
              <DateField
                value={filters.to}
                onChange={(v) => setFilter("to", v)}
                placeholder="تا تاریخ"
              />
            </div>
          </div>

          <div className="outputsmoregrid outputsmoregrid-time">
            <div className="outputsmorefield">
              <label>از ساعت</label>
              <TimeField
                value={filters.fromTime}
                onChange={(v) => setFilter("fromTime", v)}
                placeholder="انتخاب ساعت"
              />
            </div>
            <div className="outputsmorefield">
              <label>تا ساعت</label>
              <TimeField
                value={filters.toTime}
                onChange={(v) => setFilter("toTime", v)}
                placeholder="انتخاب ساعت"
              />
            </div>
          </div>
        </div>
      )}

      <div className="logsummary">
        <div className="logsummaryitem">
          <span>کل رویدادها</span>
          <strong>{tofa(summary.total)}</strong>
        </div>
        <div className="logsummaryitem">
          <span>تعداد خروج</span>
          <strong className="outputssummarydanger">{tofa(summary.sales)}</strong>
        </div>
        <div className="logsummaryitem">
          <span>مجموع خروج</span>
          <strong className="outputssummarydanger">{tofa(summary.outQty)}</strong>
        </div>
        <div className="logsummaryitem">
          <span>مجموع ورود</span>
          <strong className="outputssummarysuccess">{tofa(summary.inQty)}</strong>
        </div>
      </div>

      <div className="logtablewrap">
        <table className="logtable responsivetable">
          <thead>
            <tr>
              <th>تاریخ و ساعت</th>
              <th>رویداد</th>
              <th>موضوع</th>
              <th>تغییر موجودی</th>
              <th>توضیحات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="outputsempty">
                  رویدادی با این فیلترها یافت نشد.
                </td>
              </tr>
            ) : (
              filtered.map((t) => {
                const meta = kindMeta(t.kind);
                return (
                  <tr key={t.id}>
                    <td data-label="تاریخ">{fmtDateTime(t.createdAt)}</td>
                    <td data-label="رویداد">
                      <span className={`logkind logkind-${meta.tone}`}>
                        {meta.icon}
                        {meta.label}
                      </span>
                    </td>
                    <td className="mobileprimary" data-label="موضوع">
                      {subjectCell(t)}
                    </td>
                    <td data-label="تغییر موجودی">{changeCell(t)}</td>
                    <td data-label="توضیحات">{t.note || t.reason || "-"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockLog;