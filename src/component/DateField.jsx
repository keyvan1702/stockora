import React, { useRef } from "react";
import * as DatePickerModule from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { FiCalendar, FiX } from "react-icons/fi";

// حل مشکل CJS/ESM در Vite: گاهی DatePickerModule.default آبجکت است
const DatePicker =
  DatePickerModule.default?.default || DatePickerModule.default || DatePickerModule;

const DateField = ({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  className = "",
  clearable = true,
}) => {
  const pickerRef = useRef(null);

  const dateValue = value
    ? new DateObject({
        date: value,
        calendar: persian,
        locale: persian_fa,
      })
    : null;

  const openPicker = () => {
    pickerRef.current?.openCalendar?.();
  };

  return (
    <div className={`cdate ${className}`}>
      <DatePicker
        ref={pickerRef}
        value={dateValue}
        onChange={(date) => {
          if (!date) {
            onChange("");
            return;
          }
          const gregorianDate = date.convert("gregorian", "en");
          const year = gregorianDate.year;
          const month = String(gregorianDate.month.number).padStart(2, "0");
          const day = String(gregorianDate.day).padStart(2, "0");
          onChange(`${year}-${month}-${day}`);
        }}
        calendar={persian}
        locale={persian_fa}
        calendarPosition="bottom-right"
        inputClass="cdate-input"
        containerClassName="cdate-container"
        placeholder={placeholder}
        format="YYYY/MM/DD"
        editable={false}
        arrow={false}
        portal
        zIndex={2000}
        hideOnScroll
      />

      {clearable && value && (
        <button
          type="button"
          className="cdate-clear"
          onClick={() => onChange("")}
          aria-label="پاک کردن تاریخ"
        >
          <FiX />
        </button>
      )}

      <button
        type="button"
        className="cdate-icon"
        onClick={openPicker}
        tabIndex={-1}
        aria-label="باز کردن تقویم"
      >
        <FiCalendar />
      </button>
    </div>
  );
};

export default DateField;