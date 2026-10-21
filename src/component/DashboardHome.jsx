import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import {
  FiArchive,
  FiShoppingBag,
  FiUsers,
  FiPlus,
  FiSettings,
  FiArrowLeft,
  FiTrendingDown,
  FiClock,
  FiBox,
} from "react-icons/fi";
import { tofa, fmtDateTime } from "../utils/format";

const DashboardHome = ({
  products = [],
  productTypes = [],
  customers = [],
  transactions = [],
}) => {
  const today = new Date().toDateString();

  const sales = useMemo(
    () => transactions.filter((t) => t.kind === "sale"),
    [transactions]
  );

  const todaySales = useMemo(
    () => sales.filter((t) => new Date(t.createdAt).toDateString() === today),
    [sales, today]
  );

  const totalStock = products.reduce((s, p) => s + p.count, 0);

  const topProducts = useMemo(() => {
    const map = new Map();
    sales.forEach((t) => {
      const row = map.get(t.productId) || {
        id: t.productId,
        label: t.productName,
        variant: t.variant,
        unit: t.unit,
        qty: 0,
      };
      row.qty += -t.change;
      map.set(t.productId, row);
    });
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [sales]);

  const topBuyers = useMemo(() => {
    const map = new Map();
    sales.forEach((t) => {
      const name = t.buyerName || "ناشناس";
      const row = map.get(name) || { name, qty: 0, count: 0 };
      row.qty += -t.change;
      row.count += 1;
      map.set(name, row);
    });
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [sales]);

  const recentOutputs = sales.slice(0, 6);

  const quickLinks = [
    {
      to: "/inventory",
      icon: <FiArchive />,
      label: "موجودی انبار",
      desc: "مشاهده محصولات و فیلتر",
      color: "purple",
    },
    {
      to: "/outputs",
      icon: <FiShoppingBag />,
      label: "خروجی‌های انبار",
      desc: "تاریخچه فروش و خروج",
      color: "orange",
    },
    {
      to: "/customers",
      icon: <FiUsers />,
      label: "مشتریان",
      desc: "ثبت خرید برای مشتری",
      color: "green",
    },
    {
      to: "/add-product",
      icon: <FiPlus />,
      label: "افزودن محصول",
      desc: "ثبت محصول جدید",
      color: "blue",
    },
    {
      to: "/settings",
      icon: <FiSettings />,
      label: "تنظیمات",
      desc: "انواع محصول و متغیرها",
      color: "purple",
    },
  ];

  return (
    <div className="dashboardhome">
      <div className="dashboardhero">
        <div className="dashboardherotext">
          <h2>خلاصه‌ی امروز</h2>
          <p>
            {tofa(todaySales.length)} خروجی امروز ثبت شده — مجموعاً{" "}
            {tofa(todaySales.reduce((s, t) => s + -t.change, 0))} واحد کالا خارج شده
            است.
          </p>
        </div>
        <div className="dashboardheroicons">
          <NavLink to="/customers" className="dashboardherobtn primary">
            <FiShoppingBag />
            ثبت فروش جدید
          </NavLink>
          <NavLink to="/add-product" className="dashboardherobtn">
            <FiPlus />
            افزودن محصول
          </NavLink>
        </div>
      </div>

      <div className="dashboardstats">
        <div className="dashboardstat">
          <div className="dashboardstaticon purple">
            <FiArchive />
          </div>
          <div className="dashboardstatinfo">
            <span>موجودی کل</span>
            <strong>{tofa(totalStock)}</strong>
            <small>واحد</small>
          </div>
        </div>
        <div className="dashboardstat">
          <div className="dashboardstaticon orange">
            <FiTrendingDown />
          </div>
          <div className="dashboardstatinfo">
            <span>خروجی امروز</span>
            <strong>{tofa(todaySales.length)}</strong>
            <small>تراکنش</small>
          </div>
        </div>
        <div className="dashboardstat">
          <div className="dashboardstaticon green">
            <FiUsers />
          </div>
          <div className="dashboardstatinfo">
            <span>مشتریان</span>
            <strong>{tofa(customers.length)}</strong>
            <small>نفر</small>
          </div>
        </div>
        <div className="dashboardstat">
          <div className="dashboardstaticon blue">
            <FiBox />
          </div>
          <div className="dashboardstatinfo">
            <span>محصولات</span>
            <strong>{tofa(products.length)}</strong>
            <small>مورد</small>
          </div>
        </div>
      </div>

      <div className="dashboardsection">
        <div className="dashboardsectionheader">
          <h3>دسترسی سریع</h3>
        </div>
        <div className="dashboardquicklinks">
          {quickLinks.map((q) => (
            <NavLink key={q.to} to={q.to} className={`dashboardquicklink ${q.color}`}>
              <div className="dashboardquicklinkicon">{q.icon}</div>
              <div className="dashboardquicklinktext">
                <strong>{q.label}</strong>
                <small>{q.desc}</small>
              </div>
              <FiArrowLeft className="dashboardquicklinkarrow" />
            </NavLink>
          ))}
        </div>
      </div>

      <div className="dashboardgrid">
        <div className="dashboardcard">
          <div className="dashboardcardheader">
            <h3>
              <FiClock /> آخرین خروجی‌ها
            </h3>
            <NavLink to="/outputs" className="dashboardcardmore">
              مشاهده همه <FiArrowLeft />
            </NavLink>
          </div>
          {recentOutputs.length === 0 ? (
            <p className="dashboardempty">هنوز خروجی‌ای ثبت نشده است.</p>
          ) : (
            <ul className="dashboardrecentlist">
              {recentOutputs.map((t) => (
                <li key={t.id} className="dashboardrecentitem">
                  <div className="dashboardrecenticon">
                    <FiTrendingDown />
                  </div>
                  <div className="dashboardrecentinfo">
                    <strong>{t.productName}</strong>
                    <small>
                      {t.buyerName || "بدون خریدار"} · {fmtDateTime(t.createdAt)}
                    </small>
                  </div>
                  <span className="dashboardrecentqty">
                    {tofa(Math.abs(t.change))} {t.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dashboardcard">
          <div className="dashboardcardheader">
            <h3>
              <FiBox /> محصولات پرطرفدار
            </h3>
          </div>
          {topProducts.length === 0 ? (
            <p className="dashboardempty">داده‌ای برای نمایش نیست.</p>
          ) : (
            <ul className="dashboardranklist">
              {topProducts.map((p, i) => (
                <li key={p.id} className="dashboardrankitem">
                  <span className={`dashboardranknum rank${i + 1}`}>
                    {tofa(i + 1)}
                  </span>
                  <div className="dashboardrankinfo">
                    <strong>{p.label}</strong>
                    {p.variant && <small>{p.variant}</small>}
                  </div>
                  <span className="dashboardrankqty">
                    {tofa(p.qty)} {p.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dashboardcard">
          <div className="dashboardcardheader">
            <h3>
              <FiUsers /> خریداران برتر
            </h3>
          </div>
          {topBuyers.length === 0 ? (
            <p className="dashboardempty">داده‌ای برای نمایش نیست.</p>
          ) : (
            <ul className="dashboardranklist">
              {topBuyers.map((b, i) => (
                <li key={b.name} className="dashboardrankitem">
                  <span className={`dashboardranknum rank${i + 1}`}>
                    {tofa(i + 1)}
                  </span>
                  <div className="dashboardrankinfo">
                    <strong>{b.name}</strong>
                    <small>{tofa(b.count)} خرید</small>
                  </div>
                  <span className="dashboardrankqty">{tofa(b.qty)} واحد</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;