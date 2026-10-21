import React, { useState } from "react";
import {
  FiArrowDown,
  FiArrowUp,
  FiClock,
  FiUser,
  FiFilter,
  FiDownload,
} from "react-icons/fi";

const tofa = (n) => Number(n).toLocaleString("fa-IR");

const TransactionLog = ({ transactions = [] }) => {
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = transactions.filter((t) => {
    if (filterType === "sale" && t.reason !== "فروش") return false;
    if (filterType === "increase" && t.change <= 0) return false;
    if (filterType === "decrease" && t.change >= 0) return false;
    if (
      search &&
      !t.productName.includes(search) &&
      !(t.buyerName || "").includes(search) &&
      !(t.user || "").includes(search)
    )
      return false;
    return true;
  });

  const downloadReport = () => {
    let csv = "\uFEFFتاریخ,محصول,رنگ,تغییر,خریدار,کاربر,دلیل\n";
    filtered.forEach((t) => {
      csv += `"${t.timestamp}","${t.productName}","${t.productColor}",${t.change},"${t.buyerName || "-"}","${t.user}","${t.reason}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `گزارش-انبار-${Date.now()}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="transactionlog">
      <div className="transactionlogheader">
        <div className="transactionlogtitle">
          <FiClock />
          <h3>تاریخچه تغییرات ({tofa(filtered.length)})</h3>
        </div>
        <div className="transactionlogtools">
          <input
            type="text"
            placeholder="جستجو در گزارش..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #e3e8f2",
              borderRadius: 8,
              font: "inherit",
              fontSize: 13,
            }}
          />
          <div className="transactionlogfilter">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">همه</option>
              <option value="sale">فروش</option>
              <option value="increase">افزایش</option>
              <option value="decrease">کاهش</option>
            </select>
            <FiFilter />
          </div>
          <button className="transactionlogdownload" onClick={downloadReport}>
            <FiDownload />
            دانلود گزارش
          </button>
        </div>
      </div>

      <div className="transactionlogtable">
        <table>
          <thead>
            <tr>
              <th>تاریخ و ساعت</th>
              <th>محصول</th>
              <th>تغییر</th>
              <th>خریدار</th>
              <th>کاربر</th>
              <th>دلیل</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "24px", color: "#6b7488" }}>
                  هیچ تراکنشی ثبت نشده است
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id}>
                  <td>{t.timestamp}</td>
                  <td>
                    <span className="transactionproduct">
                      {t.productName}
                      <small>{t.productColor}</small>
                    </span>
                  </td>
                  <td>
                    <span className={`transactionchange ${t.change < 0 ? "decrease" : "increase"}`}>
                      {t.change < 0 ? <FiArrowDown /> : <FiArrowUp />}
                      {tofa(Math.abs(t.change))}
                    </span>
                  </td>
                  <td>{t.buyerName || "-"}</td>
                  <td>
                    <span className="transactionuser">
                      <FiUser />
                      {t.user}
                    </span>
                  </td>
                  <td>{t.reason}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionLog;