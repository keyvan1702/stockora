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
} from "react-icons/fi";

const filterfields = [
  { key: "type", label: "نوع محصول" },
  { key: "material", label: "جنس محصول" },
  { key: "color", label: "رنگ" },
  { key: "cover", label: "پوشش" },
  { key: "length", label: "طول شاخه" },
];

const firstproducts = [
  { id: 1, type: "گالوانیزه فوم‌دار", material: "گالوانیزه", width: 80, cover: "رنگ‌شده", color: "سفید", length: "۶.۰۰ متر", count: 72, shade: "white" },
  { id: 2, type: "گالوانیزه فوم‌دار", material: "گالوانیزه", width: 80, cover: "رنگ‌شده", color: "سفید", length: "۶.۵۵ متر", count: 103, shade: "cream" },
  { id: 3, type: "گالوانیزه فوم‌دار", material: "گالوانیزه", width: 80, cover: "رنگ‌شده", color: "کرم", length: "۶.۰۰ متر", count: 56, shade: "white" },
  { id: 4, type: "گالوانیزه فوم‌دار", material: "گالوانیزه", width: 80, cover: "رنگ‌شده", color: "مشکی", length: "۶.۵۰ متر", count: 82, shade: "black" },
  { id: 5, type: "آلومینیومی تک‌رول", material: "آلومینیوم", width: 80, cover: "خودرنگ", color: "سفید", length: "۵.۲۵ متر", count: 88, shade: "white" },
  { id: 6, type: "آلومینیومی تک‌رول", material: "آلومینیوم", width: 80, cover: "خودرنگ", color: "مشکی", length: "۶.۰۰ متر", count: 64, shade: "black" },
];

const total = 28;

const tofa = (number) => {
  return Number(number).toLocaleString("fa-IR");
};

const tolatin = (text) => {
  return text
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .replace(/[^0-9]/g, "");
};

const Store = () => {
  let [products, setproducts] = useState(firstproducts);
  let [search, setsearch] = useState("");
  let [filters, setfilters] = useState({
    type: "",
    material: "",
    color: "",
    cover: "",
    length: "",
  });
  let [page, setpage] = useState(1);

  const changecount = (id, value) => {
    setproducts(
      products.map((item) =>
        item.id === id ? { ...item, count: Math.max(0, value) } : item
      )
    );
  };

  const options = (key) => {
    return [...new Set(firstproducts.map((item) => item[key]))];
  };

  const shown = products.filter((item) => {
    const matchsearch =
      item.type.includes(search) || item.color.includes(search);
    const matchfilters = filterfields.every(
      (field) => !filters[field.key] || item[field.key] === filters[field.key]
    );
    return matchsearch && matchfilters;
  });

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
                    setfilters({ ...filters, [field.key]: e.target.value });
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
              setsearch(e.target.value);
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
            {shown.map((item) => (
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
                    <button className="storemore">
                      <FiMoreVertical />
                    </button>
                    <button
                      className="storeqtybtn storeplus"
                      onClick={() => {
                        changecount(item.id, item.count + 1);
                      }}
                    >
                      <FiPlus />
                    </button>
                    <input
                      className="storeqtyinput"
                      type="text"
                      inputMode="numeric"
                      value={tofa(item.count)}
                      onChange={(e) => {
                        changecount(item.id, Number(tolatin(e.target.value)));
                      }}
                    />
                    <button
                      className="storeqtybtn storeminus"
                      onClick={() => {
                        changecount(item.id, item.count - 1);
                      }}
                    >
                      <FiMinus />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="storefooter">
        <div className="storenote">
          <FiInfo />
          <span>موجودی‌ها به‌صورت تعداد شاخه نمایش داده می‌شوند.</span>
        </div>
        <div className="storepages">
          <button className="storepagebtn">
            <FiChevronsRight />
          </button>
          <button className="storepagebtn">
            <FiChevronRight />
          </button>
          {[1, 2, 3, 4, 5].map((number) => (
            <button
              key={number}
              className={`storepagebtn ${
                page === number ? "storepagebtnactive" : ""
              }`}
              onClick={() => {
                setpage(number);
              }}
            >
              {tofa(number)}
            </button>
          ))}
          <button className="storepagebtn">
            <FiChevronLeft />
          </button>
          <button className="storepagebtn">
            <FiChevronsLeft />
          </button>
        </div>
        <div className="storecount">
          نمایش {tofa(1)} تا {tofa(shown.length)} از {tofa(total)} محصول
        </div>
      </div>
    </div>
  );
};

export default Store;