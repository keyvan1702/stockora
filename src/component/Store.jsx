import React, { useMemo, useState } from "react";
import {
  FiBox,
  FiSearch,
  FiInfo,
  FiChevronRight,
  FiChevronLeft,
  FiChevronsRight,
  FiChevronsLeft,
  FiFilter,
  FiX,
} from "react-icons/fi";
import { tofa, findType, attrDisplay, variantLabel } from "../utils/format";
import Select from "./Select";

const PAGE_SIZE = 8;

const Store = ({ products = [], productTypes = [] }) => {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("");
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);

  const currentType = activeType ? findType(productTypes, Number(activeType)) : null;
  const typeFields = currentType ? currentType.fields : [];

  const optionsByField = useMemo(() => {
    const result = {};
    typeFields.forEach((field) => {
      const set = new Set();
      products
        .filter((p) => p.typeId === currentType.id)
        .forEach((p) => {
          const v = p.attrs?.[field.key];
          if (v !== "" && v !== undefined && v !== null) set.add(v);
        });
      result[field.key] = [...set];
    });
    return result;
  }, [typeFields, products, currentType]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const shown = products.filter((item) => {
    if (currentType && item.typeId !== currentType.id) return false;

    const itemType = findType(productTypes, item.typeId);
    const haystack = [item.name, itemType?.name, ...Object.values(item.attrs || {})]
      .join(" ")
      .toLowerCase();
    if (search && !haystack.includes(search.trim().toLowerCase())) return false;

    return typeFields.every(
      (f) => !filters[f.key] || String(item.attrs?.[f.key]) === String(filters[f.key])
    );
  });

  const totalPages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedShown = shown.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const colCount = 2 + (currentType ? typeFields.length : 2);

  const setType = (val) => {
    setActiveType(val);
    setFilters({});
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  return (
    <div className="store">
      <div className="storetitle">
        <FiBox />
        <h2>لیست محصولات</h2>
        <span className="storetitlecount">{tofa(products.length)} محصول</span>
      </div>

      <div className="storetypetabs">
        <button
          type="button"
          className={`storetypetab ${activeType === "" ? "storetypetabactive" : ""}`}
          onClick={() => setType("")}
        >
          همه ({tofa(products.length)})
        </button>
        {productTypes.map((t) => (
          <button
            type="button"
            key={t.id}
            className={`storetypetab ${
              activeType === String(t.id) ? "storetypetabactive" : ""
            }`}
            onClick={() => setType(String(t.id))}
          >
            {t.name} ({tofa(products.filter((p) => p.typeId === t.id).length)})
          </button>
        ))}
      </div>

      <div className="storetools">
        <div className="storesearch">
          <FiSearch />
          <input
            type="text"
            placeholder="جستجو در محصولات..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

        {currentType && typeFields.length > 0 && (
          <div className="storefilters">
            <div className="storefiltersheader">
              <FiFilter />
              <span>فیلتر متغیرها</span>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  className="storefiltersclear"
                  onClick={clearFilters}
                >
                  <FiX /> پاک کردن
                </button>
              )}
            </div>
            <div className="storefiltersgrid">
              {typeFields.map((field) => (
                <div className="storefilter" key={field.key}>
                  <label className="storefilterlabel">{field.label}</label>
                  <Select
                    value={filters[field.key] || ""}
                    onChange={(v) => {
                      setPage(1);
                      setFilters({ ...filters, [field.key]: v });
                    }}
                    placeholder="همه"
                    size="sm"
                    options={optionsByField[field.key].map((option) => ({
                      value: option,
                      label: field.kind === "number" ? tofa(option) : option,
                    }))}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="storetablewrap">
        <table className="storetable responsivetable">
          <thead>
            <tr>
              <th className="storecoltype">نام محصول</th>
              {currentType ? (
                typeFields.map((f) => <th key={f.key}>{f.label}</th>)
              ) : (
                <>
                  <th>نوع</th>
                  <th>مشخصات</th>
                </>
              )}
              <th>موجودی</th>
            </tr>
          </thead>
          <tbody>
            {pagedShown.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="transactionempty">
                  {activeFilterCount > 0 || search
                    ? "با این فیلترها محصولی یافت نشد"
                    : "محصولی یافت نشد"}
                </td>
              </tr>
            ) : (
              pagedShown.map((item) => {
                const itemType = findType(productTypes, item.typeId);
                return (
                  <tr key={item.id}>
                    <td className="storecelltype mobileprimary" data-label="نام محصول">
                      {item.name}
                    </td>
                    {currentType ? (
                      typeFields.map((f) => (
                        <td key={f.key} data-label={f.label}>
                          {attrDisplay(f, item.attrs?.[f.key])}
                        </td>
                      ))
                    ) : (
                      <>
                        <td data-label="نوع">
                          <span className="storetypebadge">{itemType?.name || "-"}</span>
                        </td>
                        <td data-label="مشخصات">{variantLabel(itemType, item) || "-"}</td>
                      </>
                    )}
                    <td data-label="موجودی">
                      <span className="storestockcell">
                        {tofa(item.count)}
                        <small>{itemType?.unit}</small>
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="storefooter">
        <div className="storenote">
          <FiInfo />
          <span>
            {shown.length !== products.length
              ? `${tofa(shown.length)} محصول از ${tofa(products.length)} نمایش داده می‌شود`
              : "فروش از بخش «مشتریان» و تغییر دستی موجودی از «مدیریت محصولات» ثبت می‌شود"}
          </span>
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