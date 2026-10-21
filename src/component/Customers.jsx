import React, { useState } from "react";
import {
  FiUsers,
  FiSearch,
  FiPhone,
  FiMapPin,
  FiTrendingUp,
  FiPlus,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";

const tofa = (number) => {
  return Number(number).toLocaleString("fa-IR");
};

const Customers = ({ customers = [], setCustomers }) => {
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const filtered = customers.filter(
    (c) =>
      c.name.includes(search) ||
      c.phone.includes(search) ||
      c.address.includes(search)
  );

  const addCustomer = () => {
    if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
      alert("نام و شماره تماس الزامی است!");
      return;
    }

    const customer = {
      id: Math.max(...customers.map((c) => c.id), 0) + 1,
      ...newCustomer,
      totalPurchase: 0,
    };

    setCustomers([...customers, customer]);
    setNewCustomer({ name: "", phone: "", address: "" });
    setShowAddModal(false);
  };

  const deleteCustomer = (id) => {
    if (window.confirm("آیا مطمئن‌اید؟")) {
      setCustomers(customers.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="customerpage">
      <div className="customertitle">
        <FiUsers />
        <h2>مدیریت مشتریان</h2>
      </div>

      <div className="customertools">
        <div className="customersearch">
          <FiSearch />
          <input
            type="text"
            placeholder="جستجو..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="customerbtnAdd" onClick={() => setShowAddModal(true)}>
          <FiPlus />
          افزودن مشتری
        </button>
      </div>

      {showAddModal && (
        <div className="storemodal storemodaloverlay">
          <div className="storemodalcontent">
            <div className="storemodalheader">
              <h3>افزودن مشتری جدید</h3>
              <button
                className="storemodalbtn-close"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="storemodalinputs">
              <div className="storemodalinputgroup">
                <label>نام مشتری</label>
                <input
                  type="text"
                  placeholder="نام"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                />
              </div>
              <div className="storemodalinputgroup">
                <label>شماره تماس</label>
                <input
                  type="text"
                  placeholder="۰۹..."
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                />
              </div>
              <div className="storemodalinputgroup">
                <label>آدرس</label>
                <input
                  type="text"
                  placeholder="آدرس"
                  value={newCustomer.address}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, address: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="storemodalfooter">
              <button
                className="storemodalcancel"
                onClick={() => setShowAddModal(false)}
              >
                لغو
              </button>
              <button className="storemodalsave" onClick={addCustomer}>
                افزودن
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="customertable">
        <table>
          <thead>
            <tr>
              <th>نام مشتری</th>
              <th>شماره تماس</th>
              <th>آدرس</th>
              <th>کل خرید (شاخه)</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "#6b7488" }}>
                  هیچ مشتری ثبت نشده است
                </td>
              </tr>
            ) : (
              filtered.map((customer) => (
                <tr key={customer.id}>
                  <td className="customername">{customer.name}</td>
                  <td>
                    <span className="customerinfo">
                      <FiPhone />
                      {customer.phone}
                    </span>
                  </td>
                  <td>
                    <span className="customerinfo">
                      <FiMapPin />
                      {customer.address}
                    </span>
                  </td>
                  <td>
                    <span className="customerpurchase">
                      <FiTrendingUp />
                      {tofa(customer.totalPurchase)}
                    </span>
                  </td>
                  <td>
                    <div className="customeractions">
                      <button className="customerbtn-edit">
                        <FiEdit />
                      </button>
                      <button
                        className="customerbtn-delete"
                        onClick={() => deleteCustomer(customer.id)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;