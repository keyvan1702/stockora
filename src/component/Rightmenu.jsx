import React from "react";
import { NavLink } from "react-router-dom";

import {
  FiBox,
  FiHome,
  FiArchive,
  FiUsers,
  FiPackage,
  FiLogOut,
  FiShoppingBag,
  FiSettings,
  FiActivity,
} from "react-icons/fi";

const menuitems = [
  { key: "dashboard", label: "داشبورد", short: "داشبورد", icon: <FiHome />, path: "/", end: true },
  { key: "inventory", label: "موجودی انبار", short: "انبار", icon: <FiArchive />, path: "/inventory" },
  { key: "outputs", label: "خروجی‌های انبار", short: "خروجی‌ها", icon: <FiShoppingBag />, path: "/outputs" },
  { key: "stock-log", label: "لاگ انبار", short: "لاگ", icon: <FiActivity />, path: "/stock-log" },
  { key: "customers", label: "مشتریان", short: "مشتریان", icon: <FiUsers />, path: "/customers" },
  { key: "addproduct", label: "مدیریت محصولات", short: "محصولات", icon: <FiPackage />, path: "/add-product" },
  { key: "settings", label: "تنظیمات", short: "تنظیمات", icon: <FiSettings />, path: "/settings" },
];

const Rightmenu = () => {
  return (
    <aside className="rightmenu">
      <div className="rightmenubrand">
        <div className="rightmenubrandicon">
          <FiBox />
        </div>
        <h1 className="rightmenubrandtitle">مدیریت انبار</h1>
      </div>

      <ul className="rightmenunav">
        {menuitems.map((item) => (
          <li key={item.key}>
            <NavLink
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `rightmenuitem ${isActive ? "rightmenuitemactive" : ""}`
              }
            >
              <span className="rightmenuitemicon">{item.icon}</span>
              <span className="rightmenuitemlabel">{item.label}</span>
              <span className="rightmenuitemshort">{item.short}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="rightmenufooter">
        <button
          type="button"
          className="rightmenulogout"
          onClick={() => {
            /* منطق خروج */
          }}
        >
          <span className="rightmenulogouticon">
            <FiLogOut />
          </span>
          <span className="rightmenulogoutlabel">خروج از حساب</span>
        </button>
      </div>
    </aside>
  );
};

export default Rightmenu;