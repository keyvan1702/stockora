import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
  FiUser,
  FiAlertCircle,
} from "react-icons/fi";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const menuitems = [
  { key: "dashboard", label: "داشبورد", short: "داشبورد", icon: <FiHome />, path: "/", end: true },
  { key: "inventory", label: "موجودی انبار", short: "انبار", icon: <FiArchive />, path: "/inventory" },
  { key: "outputs", label: "خروجی‌های انبار", short: "خروجی‌ها", icon: <FiShoppingBag />, path: "/outputs" },
  { key: "stock-log", label: "لاگ انبار", short: "لاگ", icon: <FiActivity />, path: "/stock-log" },
  { key: "customers", label: "مشتریان", short: "مشتریان", icon: <FiUsers />, path: "/customers" },
  { key: "addproduct", label: "مدیریت محصولات", short: "محصولات", icon: <FiPackage />, path: "/add-product" },
  { key: "settings", label: "تنظیمات", short: "تنظیمات", icon: <FiSettings />, path: "/settings" },
];

const Rightmenu = ({ collapsed = false }) => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const displayName = user?.name || "مدیر";
  const displayRole = user?.role || "مدیر";

  useEffect(() => {
    if (!confirmOpen) return;
    const onEsc = (e) => e.key === "Escape" && setConfirmOpen(false);
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [confirmOpen]);

  const handleLogout = () => {
    logout();
    toast.info("از حساب خارج شدید");
    navigate("/login", { replace: true });
  };

  return (
    <aside className={`rightmenu ${collapsed ? "rightmenu-collapsed" : ""}`}>
      <div className="rightmenubrand">
        <div className="rightmenubrandicon">
          <FiBox />
        </div>
        <div className="rightmenubrandtext">
          <h1 className="rightmenubrandtitle">مدیریت انبار</h1>
          <span className="rightmenubrandsub">
            <span className="rightmenubranddot" /> آنلاین
          </span>
        </div>
      </div>

      <nav className="rightmenunav" aria-label="منوی اصلی">
        {menuitems.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `rightmenuitem ${isActive ? "rightmenuitemactive" : ""}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="rightmenuitemicon">{item.icon}</span>
            <span className="rightmenuitemlabel">{item.label}</span>
            <span className="rightmenuitemshort">{item.short}</span>
            <span className="rightmenuitemtooltip">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="rightmenufooter">
        <div className="rightmenuuser">
          <div className="rightmenuuseravatar">
            <FiUser />
          </div>
          <div className="rightmenuusertext">
            <strong>{displayName}</strong>
            <small>{displayRole}</small>
          </div>
        </div>

        <button
          type="button"
          className="rightmenulogout"
          onClick={() => setConfirmOpen(true)}
        >
          <span className="rightmenulogouticon">
            <FiLogOut />
          </span>
          <span className="rightmenulogoutlabel">خروج از حساب</span>
        </button>
      </div>

      {confirmOpen && (
        <div
          className="logoutmodal"
          onClick={() => setConfirmOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
        >
          <div className="logoutmodal-card" onClick={(e) => e.stopPropagation()}>
            <div className="logoutmodal-icon">
              <FiAlertCircle />
            </div>

            <h3 id="logout-title" className="logoutmodal-title">
              خروج از حساب
            </h3>
            <p className="logoutmodal-text">
              آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟
            </p>

            <div className="logoutmodal-actions">
              <button
                type="button"
                className="logoutmodal-cancel"
                onClick={() => setConfirmOpen(false)}
              >
                لغو
              </button>
              <button
                type="button"
                className="logoutmodal-confirm"
                onClick={handleLogout}
              >
                <FiLogOut /> خروج
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Rightmenu;