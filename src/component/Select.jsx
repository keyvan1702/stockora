import React, { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";

/**
 * Select سفارشی
 * props:
 *  - value, onChange
 *  - options: [{ value, label, disabled? }] یا [string]
 *  - placeholder
 *  - icon: آیکون اختیاری سمت راست (مثلاً FiFilter)
 *  - size: "sm" | "md"
 *  - disabled
 *  - className
 */
const Select = ({
  value,
  onChange,
  options = [],
  placeholder = "انتخاب کنید...",
  icon = null,
  size = "md",
  disabled = false,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const normalized = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );

  const selected = normalized.find((o) => String(o.value) === String(value));

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

  const choose = (opt) => {
    if (opt.disabled) return;
    onChange?.(opt.value);
    setOpen(false);
  };

  return (
    <div
      ref={ref}
      className={`cselect cselect-${size} ${open ? "is-open" : ""} ${
        disabled ? "is-disabled" : ""
      } ${className}`}
    >
      <button
        type="button"
        className="cselect-trigger"
        onClick={() => !disabled && setOpen((s) => !s)}
        disabled={disabled}
      >
        {icon && <span className="cselect-icon">{icon}</span>}
        <span className={`cselect-value ${selected ? "" : "is-placeholder"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="cselect-chevron">
          <FiChevronDown />
        </span>
      </button>

      {open && (
        <div className="cselect-menu" role="listbox">
          {normalized.length === 0 ? (
            <div className="cselect-empty">گزینه‌ای موجود نیست</div>
          ) : (
            normalized.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  type="button"
                  key={String(opt.value)}
                  role="option"
                  aria-selected={isSelected}
                  className={`cselect-option ${
                    isSelected ? "is-selected" : ""
                  } ${opt.disabled ? "is-option-disabled" : ""}`}
                  onClick={() => choose(opt)}
                  disabled={opt.disabled}
                >
                  <span className="cselect-optionlabel">{opt.label}</span>
                  {isSelected && (
                    <span className="cselect-check">
                      <FiCheck />
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Select;