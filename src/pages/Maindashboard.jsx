import React, { useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import Rightmenu from "../component/Rightmenu";
import {
  FiUser,
  FiBox,
  FiPackage,
  FiUsers,
  FiCalendar,
  FiSun,
  FiMoon,
  FiLogIn,
  FiShield,
  FiX,
  FiChevronsRight,
  FiChevronsLeft,
} from "react-icons/fi";
import api from "../services/api";
import { tofa, fmtDateTime } from "../utils/format";
import { useTheme } from "../component/ThemeContext";
import { useToast } from "../component/ToastContext";
import { useAuth } from "../component/AuthContext";

const CURRENT_USER = "مدیر";

const Maindashboard = () => {
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const { user } = useAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let alive = true;
    Promise.all([
      api.getProducts(),
      api.getProductTypes(),
      api.getCustomers(),
      api.getTransactions(),
      api.getSettings(),
    ])
      .then(([p, t, c, tx, s]) => {
        if (!alive) return;
        setProducts(p);
        setProductTypes(t);
        setCustomers(c);
        setTransactions(tx);
        setSettings(s);
      })
      .catch((e) => alive && setLoadError(e.message || "خطا در دریافت اطلاعات"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    const onEsc = (e) => e.key === "Escape" && setProfileOpen(false);
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [profileOpen]);

  const upsertCustomer = (customer) => {
    if (!customer) return;
    setCustomers((prev) =>
      prev.some((c) => c.id === customer.id)
        ? prev.map((c) => (c.id === customer.id ? customer : c))
        : [...prev, customer]
    );
  };

  const refreshTransactions = async () => {
    try {
      const tx = await api.getTransactions();
      setTransactions(tx);
    } catch {
      /* silent */
    }
  };

  const wrap = (fn, okMessage) => async (...args) => {
    try {
      const res = await fn(...args);
      if (okMessage) toast.success(okMessage);
      return res;
    } catch (e) {
      toast.error(e?.message || "خطایی رخ داد");
      throw e;
    }
  };

  const actions = {
    addProduct: wrap(async (data) => {
      const { product, transaction } = await api.createProduct({
        ...data,
        user: CURRENT_USER,
      });
      setProducts((prev) => [...prev, product]);
      if (transaction) setTransactions((prev) => [transaction, ...prev]);
      return product;
    }, "محصول با موفقیت اضافه شد"),

    adjustStock: wrap(async (payload) => {
      const { product, transaction, customer } = await api.adjustStock({
        ...payload,
        user: CURRENT_USER,
      });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
      if (transaction) setTransactions((prev) => [transaction, ...prev]);
      upsertCustomer(customer);
      await refreshTransactions();

      const label =
        payload?.kind === "sale"
          ? "فروش با موفقیت ثبت شد"
          : payload?.kind === "restock"
          ? "ورود کالا با موفقیت ثبت شد"
          : "موجودی با موفقیت اصلاح شد";
      toast.success(label);
      return product;
    }, null),

    saveSettings: wrap(async (next) => {
      const saved = await api.saveSettings(next);
      setSettings(saved);
      return saved;
    }, "تنظیمات ذخیره شد"),

    saveProductType: wrap(async (type) => {
      const saved = await api.saveProductType(type);
      setProductTypes((prev) =>
        prev.some((t) => t.id === saved.id)
          ? prev.map((t) => (t.id === saved.id ? saved : t))
          : [...prev, saved]
      );
      return saved;
    }, "نوع محصول ذخیره شد"),

    deleteProductType: wrap(async (id) => {
      await api.deleteProductType(id);
      setProductTypes((prev) => prev.filter((t) => t.id !== id));
    }, "نوع محصول حذف شد"),

    addCustomer: wrap(async (data) => {
      const created = await api.addCustomer(data);
      setCustomers((prev) => [...prev, created]);
      return created;
    }, "مشتری با موفقیت اضافه شد"),

    updateCustomer: wrap(async (data) => {
      const updated = await api.updateCustomer(data);
      upsertCustomer(updated);
      return updated;
    }, "اطلاعات مشتری ویرایش شد"),

    deleteCustomer: wrap(async (id) => {
      await api.deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    }, "مشتری حذف شد"),
  };

  const stats = useMemo(() => {
    const totalStock = products.reduce((s, p) => s + p.count, 0);
    const outToday = transactions.filter(
      (t) =>
        t.kind === "sale" &&
        new Date(t.createdAt).toDateString() === new Date().toDateString()
    ).length;
    return {
      totalStock,
      productTypes: products.length,
      customersCount: customers.length,
      outToday,
    };
  }, [products, customers, transactions]);

  const outletContext = {
    products,
    productTypes,
    settings,
    customers,
    transactions,
    actions,
  };

  const displayName = user?.name || CURRENT_USER;
  const displayRole = user?.role || "مدیر";
  const loggedInAt = user?.loggedInAt;

  return (
    <div className={`maindashboard ${sidebarCollapsed ? "maindashboard-collapsed" : ""}`}>
      <div className="right">
        <Rightmenu collapsed={sidebarCollapsed} />
      </div>

      <div className="left">
        <header className="topheader">
          <div className="topheaderbar">
            <div className="topheaderleft">
              <button
                type="button"
                className={`topheadertoggle ${sidebarCollapsed ? "is-collapsed" : ""}`}
                onClick={() => setSidebarCollapsed((s) => !s)}
                title={sidebarCollapsed ? "باز کردن منو" : "بستن منو"}
                aria-label={sidebarCollapsed ? "باز کردن منو" : "بستن منو"}
              >
                {sidebarCollapsed ? <FiChevronsLeft /> : <FiChevronsRight />}
              </button>

              <div className="topheaderwelcomeinline">
                <span className="topheaderwelcomeemoji">👋</span>
                <div>
                  <div className="topheadername">سلام {displayName}!</div>
                  <div className="topheaderrole">
                    امروز {tofa(stats.outToday)} خروجی ثبت شده است
                  </div>
                </div>
              </div>
            </div>

            <div className="topheaderbarright">
              <button
                className="topheadertheme"
                onClick={toggleTheme}
                title={theme === "dark" ? "حالت روشن" : "حالت تاریک"}
              >
                {theme === "dark" ? <FiSun /> : <FiMoon />}
              </button>
              <div className="topheaderdate">
                <FiCalendar />
                <span>
                  {new Intl.DateTimeFormat("fa-IR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  }).format(new Date())}
                </span>
              </div>
              <button
                type="button"
                className={`topheaderuser ${profileOpen ? "is-open" : ""}`}
                onClick={() => setProfileOpen((s) => !s)}
                aria-haspopup="dialog"
                aria-expanded={profileOpen}
                title="مشاهده‌ی پروفایل"
              >
                <div className="topheaderavatar">
                  <FiUser />
                </div>
                <div className="topheaderusertext">
                  <div className="topheadername">{displayName}</div>
                  <div className="topheaderrole">{displayRole}</div>
                </div>
              </button>
            </div>
          </div>

          <div className="topheaderstats">
            <div className="topheaderstat topheaderstatpurple">
              <div className="topheaderstaticon">
                <FiPackage />
              </div>
              <div className="topheaderstatinfo">
                <div className="topheaderstatlabel">موجودی کل</div>
                <div className="topheaderstatvalue">{tofa(stats.totalStock)}</div>
                <div className="topheaderstatunit">واحد</div>
              </div>
            </div>

            <div className="topheaderstat topheaderstatgreen">
              <div className="topheaderstaticon">
                <FiBox />
              </div>
              <div className="topheaderstatinfo">
                <div className="topheaderstatlabel">کل محصولات</div>
                <div className="topheaderstatvalue">{tofa(stats.productTypes)}</div>
              </div>
            </div>

            <div className="topheaderstat topheaderstatblue">
              <div className="topheaderstaticon">
                <FiUsers />
              </div>
              <div className="topheaderstatinfo">
                <div className="topheaderstatlabel">کل مشتریان</div>
                <div className="topheaderstatvalue">{tofa(stats.customersCount)}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="content">
          {loading ? (
            <div className="pagestatus">در حال دریافت اطلاعات...</div>
          ) : loadError ? (
            <div className="pagestatus pagestatuserror">{loadError}</div>
          ) : (
            <Outlet context={outletContext} />
          )}
        </div>
      </div>

      {profileOpen && (
        <div
          className="profileoverlay"
          onClick={() => setProfileOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="مشخصات کاربر"
        >
          <div
            className="profilecard"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profilecard-head">
              <div className="profilecard-avatar">
                <FiUser />
              </div>
              <div className="profilecard-name">
                <strong>{displayName}</strong>
                <span>{displayRole}</span>
              </div>
              <button
                type="button"
                className="profilecard-close"
                onClick={() => setProfileOpen(false)}
                aria-label="بستن"
              >
                <FiX />
              </button>
            </div>

            <ul className="profilecard-list">
              <li>
                <span className="profilecard-label">
                  <FiUser /> نام
                </span>
                <span className="profilecard-value">{displayName}</span>
              </li>
              <li>
                <span className="profilecard-label">
                  <FiShield /> نقش
                </span>
                <span className="profilecard-value">{displayRole}</span>
              </li>
              <li>
                <span className="profilecard-label">
                  <FiLogIn /> زمان ورود
                </span>
                <span className="profilecard-value">
                  {loggedInAt ? fmtDateTime(new Date(loggedInAt).toISOString()) : "—"}
                </span>
              </li>
              <li>
                <span className="profilecard-label">
                  <FiCalendar /> امروز
                </span>
                <span className="profilecard-value">
                  {new Intl.DateTimeFormat("fa-IR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(new Date())}
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maindashboard;