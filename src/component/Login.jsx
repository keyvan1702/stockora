import React, { useMemo, useState } from "react";
import {
  FiUser,
  FiLock,
  FiEye,
  FiEyeOff,
  FiLogIn,
  FiBox,
  FiSun,
  FiMoon,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiUsers,
  FiActivity,
  FiPackage,
  FiZap,
  FiHeadphones,
} from "react-icons/fi";
import { useTheme } from "./ThemeContext";

/**
 * صفحه‌ی لاگین — آماده برای اتصال به API
 *
 * 🔌 محل اتصال API: تابع fakeLogin را با درخواست واقعی جایگزین کن.
 */

const MAX_LEN = 20;

// فقط کاراکترهای چاپ‌شدنی انگلیسی (ASCII) — برای فیلد نام کاربری: حرف، عدد و @._-
const sanitizeUsername = (v) => v.replace(/[^A-Za-z0-9@._-]/g, "").slice(0, MAX_LEN);
// برای رمز عبور: همه‌ی کاراکترهای چاپ‌شدنی انگلیسی (بدون فاصله)
const sanitizePassword = (v) => v.replace(/[^\x21-\x7E]/g, "").slice(0, MAX_LEN);

const Login = ({ onSuccess }) => {
  const { theme, toggleTheme } = useTheme();

  const [form, setForm] = useState({ username: "", password: "", remember: true });
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const setField = (key, value) => {
    let next = value;
    if (key === "username") next = sanitizeUsername(value);
    else if (key === "password") next = sanitizePassword(value);
    setForm((f) => ({ ...f, [key]: next }));
  };

  const markTouched = (key) => setTouched((t) => ({ ...t, [key]: true }));

  const fieldErrors = useMemo(
    () => ({
      username: !form.username.trim()
        ? "نام کاربری الزامی است"
        : form.username.length > MAX_LEN
        ? `حداکثر ${MAX_LEN} کاراکتر`
        : "",
      password: !form.password.trim()
        ? "رمز عبور الزامی است"
        : form.password.length < 4
        ? "رمز عبور حداقل ۴ کاراکتر باشد"
        : form.password.length > MAX_LEN
        ? `حداکثر ${MAX_LEN} کاراکتر`
        : "",
    }),
    [form.username, form.password]
  );

  const formValid = !fieldErrors.username && !fieldErrors.password;

  const fakeLogin = async ({ username, password }) => {
    await new Promise((r) => setTimeout(r, 700));
    if (username.trim().toLowerCase() === "error") {
      throw new Error("نام کاربری یا رمز عبور اشتباه است");
    }
    return { name: username.trim(), role: "مدیر" };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMsg("");
    setTouched({ username: true, password: true });
    if (!formValid) return;

    setBusy(true);
    try {
      const user = await fakeLogin(form);
      setSuccessMsg(`خوش آمدید ${user.name}!`);
      if (typeof onSuccess === "function") onSuccess(user);
    } catch (err) {
      setServerError(err.message || "خطا در ورود");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="loginpage">
      <button
        type="button"
        className="logintheme"
        onClick={toggleTheme}
        title={theme === "dark" ? "حالت روشن" : "حالت تاریک"}
      >
        {theme === "dark" ? <FiSun /> : <FiMoon />}
      </button>

      <div className="loginbg">
        <span className="loginblob loginblob1" />
        <span className="loginblob loginblob2" />
        <span className="loginblob loginblob3" />
      </div>

      <div className="loginwrap">
        <aside className="loginhero">
          <div className="loginhero-mesh" />
          <div className="loginhero-sheen" />

          <div className="loginhero-floaters" aria-hidden="true">
            <span className="floater floater-1">
              <FiPackage />
            </span>
            <span className="floater floater-2">
              <FiTrendingUp />
            </span>
            <span className="floater floater-3">
              <FiActivity />
            </span>
            <span className="floater floater-4">
              <FiUsers />
            </span>
          </div>

          <div className="loginhero-inner">
            <span className="loginhero-eyebrow">
              <FiZap /> Stockora · مدیریت انبار
            </span>

            <h1 className="loginhero-title">
              <span className="loginhero-title-line">همه‌ی انبار</span>
              <span className="loginhero-title-line loginhero-title-accent">
                در یک نگاه
              </span>
            </h1>

            <p className="loginhero-sub">
              موجودی، فروش، مشتریان و لاگ — یک داشبورد ساده، سریع و
              حرفه‌ای برای مدیریت روزانه‌ی انبار.
            </p>

            <ul className="loginhero-features">
              <li>
                <span className="loginhero-featureicon">
                  <FiTrendingUp />
                </span>
                <div>
                  <strong>موجودی هوشمند</strong>
                  <small>رهگیری دقیق لحظه‌ای</small>
                </div>
              </li>
              <li>
                <span className="loginhero-featureicon">
                  <FiUsers />
                </span>
                <div>
                  <strong>مشتری و فروش</strong>
                  <small>ثبت خرید و خروج سریع</small>
                </div>
              </li>
              <li>
                <span className="loginhero-featureicon">
                  <FiActivity />
                </span>
                <div>
                  <strong>لاگ شفاف</strong>
                  <small>هر رویداد قابل ردیابی</small>
                </div>
              </li>
            </ul>
          </div>

          <div className="loginhero-foot">

          </div>
        </aside>

        <section className="logincard">
          <header className="loginhead">
            <div className="loginhead-icon">
              <FiShield />
            </div>
            <h2>ورود به پنل</h2>
            <p>برای ادامه، اطلاعات حساب خود را وارد کنید</p>
          </header>

          <form className="loginform" onSubmit={handleSubmit} noValidate>
            <div
              className={`loginfield ${
                touched.username && fieldErrors.username ? "has-error" : ""
              }`}
            >
              <label htmlFor="login-username" className="loginfield-label">
                نام کاربری
              </label>
              <div className="logininput">
                <span className="logininput-icon">
                  <FiUser />
                </span>
                <input
                  id="login-username"
                  type="text"
                  placeholder="نام کاربری را وارد کنید"
                  autoComplete="username"
                  value={form.username}
                  onChange={(e) => setField("username", e.target.value)}
                  onBlur={() => markTouched("username")}
                  maxLength={MAX_LEN}
                  dir="ltr"
                  disabled={busy}
                />
              </div>
              {touched.username && fieldErrors.username && (
                <span className="loginfield-error">
                  <FiAlertCircle /> {fieldErrors.username}
                </span>
              )}
            </div>

            <div
              className={`loginfield ${
                touched.password && fieldErrors.password ? "has-error" : ""
              }`}
            >
              <label htmlFor="login-password" className="loginfield-label">
                رمز عبور
              </label>
              <div className="logininput">
                <span className="logininput-icon">
                  <FiLock />
                </span>
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  placeholder="رمز عبور را وارد کنید"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  onBlur={() => markTouched("password")}
                  maxLength={MAX_LEN}
                  dir="ltr"
                  disabled={busy}
                />
                <button
                  type="button"
                  className="logininput-eye"
                  onClick={() => setShowPass((s) => !s)}
                  tabIndex={-1}
                  aria-label={showPass ? "مخفی کردن رمز" : "نمایش رمز"}
                >
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {touched.password && fieldErrors.password && (
                <span className="loginfield-error">
                  <FiAlertCircle /> {fieldErrors.password}
                </span>
              )}
            </div>

            <div className="loginrow">
              <label className="logincheck">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => setField("remember", e.target.checked)}
                  disabled={busy}
                />
                <span className="logincheck-box">
                  <FiCheckCircle />
                </span>
                <span>مرا به خاطر بسپار</span>
              </label>
            </div>

            {serverError && (
              <div className="loginerror">
                <FiAlertCircle />
                <span>{serverError}</span>
              </div>
            )}
            {successMsg && (
              <div className="loginsuccess">
                <FiCheckCircle />
                <span>{successMsg}</span>
              </div>
            )}

            <button type="submit" className="loginbtn" disabled={busy}>
              <span className="loginbtn-glow" />
              {busy ? (
                <>
                  <span className="loginspinner" />
                  <span className="loginbtn-text">در حال ورود...</span>
                </>
              ) : (
                <>
                  <FiLogIn className="loginbtn-icon" />
                  <span className="loginbtn-text">ورود به داشبورد</span>
                </>
              )}
            </button>
          </form>

        
        </section>
      </div>
    </div>
  );
};

export default Login;