import React, { useState } from "react";
import {
  FiBox,
  FiHome,
  FiArchive,
  FiUsers,
  FiPlus,
  FiBarChart2,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

const menuitems = [
  { key: "dashboard", label: "داشبورد", icon: <FiHome /> },
  { key: "inventory", label: "موجودی انبار", icon: <FiArchive /> },
  { key: "customers", label: "مشتریان", icon: <FiUsers /> },
  { key: "addproduct", label: "افزودن محصول", icon: <FiPlus /> },
  { key: "settings", label: "تنظیمات", icon: <FiSettings /> },
];

const Rightmenu = () => {
  let [active, setactive] = useState("dashboard");
  return (
    <div className="rightmenu">
      <div className="rightmenubrand">
        <div className="rightmenubrandicon">
          <FiBox />
        </div>
        <h1 className="rightmenubrandtitle">مدیریت انبار</h1>
      </div>
      <ul className="rightmenunav">
        {menuitems.map((item) => (
          <li
            key={item.key}
            className={`rightmenuitem ${
              active === item.key ? "rightmenuitemactive" : ""
            }`}
            onClick={() => {
              setactive(item.key);
            }}
          >
            <span className="rightmenuitemicon">{item.icon}</span>
            <span className="rightmenuitemlabel">{item.label}</span>
          </li>
        ))}
      </ul>
      <div className="rightmenufooter">
        <button className="rightmenulogout">
          <span className="rightmenulogouticon">
            <FiLogOut />
          </span>
          <span className="rightmenulogoutlabel">خروج از حساب</span>
        </button>
      </div>
    </div>
  );
};

export default Rightmenu;
