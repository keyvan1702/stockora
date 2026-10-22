import React, { useEffect, useRef, useState } from "react";
import { FiClock, FiX } from "react-icons/fi";
import { tofa } from "../utils/format";

const pad = (n) => String(n).padStart(2, "0");
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

// نمایش دو رقمی با ارقام فارسی (۰۵)
const faTwo = (n) => `${n < 10 ? "۰" : ""}${tofa(n)}`;

/**
 * انتخاب‌گر ساعت سفارشی (هماهنگ با DateField و Select)
 * value: "HH:MM" یا ""
 */
const TimeField = ({
  value,
  onChange,
  placeholder = "انتخاب ساعت",
  clearable = true,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const hourRef = useRef(null);
  const minuteRef = useRef(null);

  const [h, m] = value ? value.split(":").map(Number) : [null, null];

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  // اسکرول به مقدار انتخاب‌شده هنگام باز شدن
  useEffect(() => {
    if (!open) return;
    const scrollTo = (listRef, index) => {
      const el = listRef.current?.querySelector(`[data-i="${index}"]`);
      if (el && listRef.current) {
        listRef.current.scrollTop =
          el.offsetTop - listRef.current.clientHeight / 2 + el.clientHeight / 2;
      }
    };
    scrollTo(hourRef, h ?? 0);
    scrollTo(minuteRef, m ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const pick = (nextH, nextM) => onChange(`${pad(nextH)}:${pad(nextM)}`);

  return (
    <div
      ref={ref}
      className={`ctime ${open ? "is-open" : ""} ${className}`}
    >
      <button
        type="button"
        className="ctime-trigger"
        onClick={() => setOpen((s) => !s)}
      >
        <span className="ctime-icon">
          <FiClock />
        </span>
        <span className={`ctime-value ${value ? "" : "is-placeholder"}`}>
          {value ? `${faTwo(h)} : ${faTwo(m)}` : placeholder}
        </span>
      </button>

      {clearable && value && (
        <button
          type="button"
          className="ctime-clear"
          onClick={() => onChange("")}
          aria-label="پاک کردن ساعت"
        >
          <FiX />
        </button>
      )}

      {open && (
        <div className="ctime-menu">
          <div className="ctime-cols">
            <div className="ctime-col">
              <div className="ctime-colhead">ساعت</div>
              <div className="ctime-list" ref={hourRef}>
                {HOURS.map((i) => (
                  <button
                    type="button"
                    key={i}
                    data-i={i}
                    className={`ctime-item ${h === i ? "is-selected" : ""}`}
                    onClick={() => pick(i, m ?? 0)}
                  >
                    {faTwo(i)}
                  </button>
                ))}
              </div>
            </div>
            <div className="ctime-col">
              <div className="ctime-colhead">دقیقه</div>
              <div className="ctime-list" ref={minuteRef}>
                {MINUTES.map((i) => (
                  <button
                    type="button"
                    key={i}
                    data-i={i}
                    className={`ctime-item ${m === i ? "is-selected" : ""}`}
                    onClick={() => pick(h ?? 0, i)}
                  >
                    {faTwo(i)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="ctime-footer">
            <button
              type="button"
              className="ctime-now"
              onClick={() => {
                const d = new Date();
                pick(d.getHours(), d.getMinutes());
              }}
            >
              اکنون
            </button>
            <button
              type="button"
              className="ctime-ok"
              onClick={() => setOpen(false)}
            >
              تأیید
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeField;
