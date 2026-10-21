import React from "react";
import { NavLink } from "react-router-dom";

import {
  FiBox,
  FiHome,
  FiArchive,
  FiUsers,
  FiPlus,
  FiLogOut,
  FiShoppingBag,
  FiSettings,
} from "react-icons/fi";

const menuitems = [
  { key: "dashboard", label: "داشبورد", icon: <FiHome />, path: "/", end: true },
  { key: "inventory", label: "موجودی انبار", icon: <FiArchive />, path: "/inventory" },
  { key: "outputs", label: "خروجی‌های انبار", icon: <FiShoppingBag />, path: "/outputs" },
  { key: "customers", label: "مشتریان", icon: <FiUsers />, path: "/customers" },
  { key: "addproduct", label: "افزودن محصول", icon: <FiPlus />, path: "/add-product" },
  { key: "settings", label: "تنظیمات", icon: <FiSettings />, path: "/settings" },
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