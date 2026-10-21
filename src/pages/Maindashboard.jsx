import React, { useMemo, useState } from "react";
import Rightmenu from "../component/Rightmenu";
import {
  FiSearch,
  FiChevronDown,
  FiUser,
  FiBox,
  FiPackage,
  FiAlertTriangle,
  FiUsers,
} from "react-icons/fi";
import Store from "../component/Store";
import TransactionLog from "../component/TransactionLog";
import Customers from "../component/Customers";
import AddProduct from "../component/AddProduct";
import Settings from "../component/Settings";

const tofa = (n) => Number(n).toLocaleString("fa-IR");

// --- داشبورد: الان داده واقعی می‌گیره ---
const Dashboard = ({
  products,
  customers,
  transactions,
  setProducts,
  setTransactions,
  setCustomers,
  currentUser,
  setActiveTab,
}) => {
  const stats = useMemo(() => {
    const totalStock = products.reduce((s, p) => s + p.count, 0);
    const lowStock = products.filter((p) => p.count < 10).length;
    return {
      totalStock,
      lowStock,
      productTypes: products.length,
      customersCount: customers.length,
    };
  }, [products, customers]);

  return (
    <div className="dashboardpage">
      <div className="topheader">
        <div className="topheaderbar">
          <div className="topheadersearch">
            <span className="topheadersearchicon">
              <FiSearch />
            </span>
            <input
              className="topheadersearchinput"
              type="text"
              placeholder="جستجو..."
            />
          </div>
          <div className="topheaderuser">
            <div className="topheaderavatar">
              <FiUser />
            </div>
            <div className="topheaderusertext">
              <div className="topheadername">{currentUser}</div>
              <div className="topheaderrole">مدیر</div>
            </div>
            <span className="topheaderchevron">
              <FiChevronDown />
            </span>
          </div>
        </div>

        <div className="topheaderwelcome">
          <div className="topheaderwelcomeinfo">
            <div className="topheaderwelcomeicon">
              <FiBox />
            </div>
            <div className="topheaderwelcometexts">
              <h2 className="topheaderwelcometitle">
                به پنل مدیریت انبار خوش آمدید
              </h2>
              <p className="topheaderwelcometext">
                در این بخش می‌توانید موجودی تیغه‌ها و مشتریان خود را مدیریت
                کنید.
              </p>
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
                <div className="topheaderstatunit">شاخه</div>
              </div>
            </div>

            <div className="topheaderstat topheaderstatorange">
              <div className="topheaderstaticon">
                <FiAlertTriangle />
              </div>
              <div className="topheaderstatinfo">
                <div className="topheaderstatlabel">موجودی کم</div>
                <div className="topheaderstatvalue">{tofa(stats.lowStock)}</div>
              </div>
            </div>

            <div className="topheaderstat topheaderstatgreen">
              <div className="topheaderstaticon">
                <FiBox />
              </div>
              <div className="topheaderstatinfo">
                <div className="topheaderstatlabel">کل محصولات</div>
                <div className="topheaderstatvalue">
                  {tofa(stats.productTypes)}
                </div>
              </div>
            </div>

            <div className="topheaderstat topheaderstatblue">
              <div className="topheaderstaticon">
                <FiUsers />
              </div>
              <div className="topheaderstatinfo">
                <div className="topheaderstatlabel">کل مشتریان</div>
                <div className="topheaderstatvalue">
                  {tofa(stats.customersCount)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="content">
        <Store
          products={products}
          setProducts={setProducts}
          setTransactions={setTransactions}
          currentUser={currentUser}
          customers={customers}
          setCustomers={setCustomers}
        />
        <TransactionLog transactions={transactions} />
      </div>
    </div>
  );
};

const Maindashboard = () => {
  const currentUser = "علی کیوانلو";

  const [activeTab, setActiveTab] = useState("dashboard");
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([
    { id: 1, type: "گالوانیزه فوم‌دار", material: "گالوانیزه", width: 80, cover: "رنگ‌شده", color: "سفید", length: "۶.۰۰ متر", count: 72, shade: "white" },
    { id: 2, type: "گالوانیزه فوم‌دار", material: "گالوانیزه", width: 80, cover: "رنگ‌شده", color: "سفید", length: "۶.۵۵ متر", count: 103, shade: "cream" },
    { id: 3, type: "گالوانیزه فوم‌دار", material: "گالوانیزه", width: 80, cover: "رنگ‌شده", color: "کرم", length: "۶.۰۰ متر", count: 56, shade: "white" },
    { id: 4, type: "گالوانیزه فوم‌دار", material: "گالوانیزه", width: 80, cover: "رنگ‌شده", color: "مشکی", length: "۶.۵۰ متر", count: 82, shade: "black" },
    { id: 5, type: "آلومینیومی تک‌رول", material: "آلومینیوم", width: 80, cover: "خودرنگ", color: "سفید", length: "۵.۲۵ متر", count: 88, shade: "white" },
    { id: 6, type: "آلومینیومی تک‌رول", material: "آلومینیوم", width: 80, cover: "خودرنگ", color: "مشکی", length: "۶.۰۰ متر", count: 64, shade: "black" },
  ]);
  const [customers, setCustomers] = useState([
    { id: 1, name: "کمپانی الف", phone: "۰۹۱۲۳۴۵۶۷۸۹", address: "تهران", totalPurchase: 3200 },
    { id: 2, name: "مجموعه ب", phone: "۰۹۸۷۶۵۴۳۲۱۰", address: "تبریز", totalPurchase: 1850 },
  ]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            products={products}
            customers={customers}
            transactions={transactions}
            setProducts={setProducts}
            setTransactions={setTransactions}
            setCustomers={setCustomers}
            currentUser={currentUser}
            setActiveTab={setActiveTab}
          />
        );
      case "inventory":
        return (
          <Store
            products={products}
            setProducts={setProducts}
            setTransactions={setTransactions}
            currentUser={currentUser}
            customers={customers}
            setCustomers={setCustomers}
          />
        );
      case "transactions":
        return <TransactionLog transactions={transactions} />;
      case "customers":
        return <Customers customers={customers} setCustomers={setCustomers} />;
      case "addproduct":
        return (
          <AddProduct
            products={products}
            setProducts={setProducts}
            setTransactions={setTransactions}
            currentUser={currentUser}
          />
        );
      case "settings":
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <div className="maindashboard">
      <div className="right">
        <Rightmenu activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <div className="left">
        <div className="pagecontent">{renderContent()}</div>
      </div>
    </div>
  );
};

export default Maindashboard;