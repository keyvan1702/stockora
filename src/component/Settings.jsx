import React, { useState } from "react";
import { FiSettings, FiSave, FiAlertCircle } from "react-icons/fi";

const Settings = () => {
  const [settings, setSettings] = useState({
    storeName: "مدیریت انبار استوکورا",
    adminEmail: "admin@stockora.ir",
    phone: "۰۲۱-۱۲۳۴۵۶۷۸",
    address: "تهران، خیابان انقلاب",
    minStock: "۵",
    currency: "تومان",
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="settingspage">
      <div className="settingstitle">
        <FiSettings />
        <h2>تنظیمات</h2>
      </div>

      {saved && (
        <div className="addproductsuccess">
          ✓ تنظیمات با موفقیت ذخیره شد!
        </div>
      )}

      <div className="settingscard">
        <h3>اطلاعات فروشگاه</h3>
        <div className="formrow">
          <div className="formgroup">
            <label>نام فروشگاه</label>
            <input
              type="text"
              name="storeName"
              value={settings.storeName}
              onChange={handleChange}
            />
          </div>
          <div className="formgroup">
            <label>ایمیل مدیر</label>
            <input
              type="email"
              name="adminEmail"
              value={settings.adminEmail}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="formrow">
          <div className="formgroup">
            <label>شماره تماس</label>
            <input
              type="tel"
              name="phone"
              value={settings.phone}
              onChange={handleChange}
            />
          </div>
          <div className="formgroup">
            <label>آدرس</label>
            <input
              type="text"
              name="address"
              value={settings.address}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="settingscard">
        <h3>تنظیمات موجودی</h3>
        <div className="formrow">
          <div className="formgroup">
            <label>حد کمینه موجودی</label>
            <input
              type="number"
              name="minStock"
              value={settings.minStock}
              onChange={handleChange}
            />
          </div>
          <div className="formgroup">
            <label>ارز</label>
            <input
              type="text"
              name="currency"
              value={settings.currency}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="settingsnote">
          <FiAlertCircle />
          محصولاتی که موجودی آن‌ها از این عدد کمتر باشد، هشدار داده می‌شوند.
        </div>
      </div>

      <button className="settingssavebtn" onClick={handleSave}>
        <FiSave />
        ذخیره تنظیمات
      </button>
    </div>
  );
};

export default Settings;