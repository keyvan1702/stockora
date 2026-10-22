import React, { useState } from "react";
import {
  FiSettings,
  FiSave,
  FiAlertCircle,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiLayers,
  FiX,
  FiInfo,
} from "react-icons/fi";
import { tofa } from "../utils/format";
import { useToast } from "./ToastContext";
import Select from "./Select";

const KIND_OPTIONS = [
  { value: "text", label: "متن" },
  { value: "number", label: "عدد" },
  { value: "select", label: "انتخابی (لیست)" },
];

const newField = () => ({
  tmp: `n_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
  label: "",
  kind: "text",
  required: false,
  optionsText: "",
});

const typeToEditor = (t) => ({
  id: t.id,
  name: t.name,
  unit: t.unit,
  fields: t.fields.map((f) => ({
    ...f,
    optionsText: (f.options || []).join("، "),
  })),
});

const Settings = ({ productTypes = [], products = [], actions }) => {
  const toast = useToast();
  const [editor, setEditor] = useState(null);

  const startNew = () => setEditor({ name: "", unit: "عدد", fields: [newField()] });

  const patchEditor = (patch) => setEditor({ ...editor, ...patch });

  const patchField = (index, patch) =>
    patchEditor({
      fields: editor.fields.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    });

  const removeField = (index) =>
    patchEditor({ fields: editor.fields.filter((_, i) => i !== index) });

  const saveType = async () => {
    if (!editor.name.trim()) {
      toast.error("نام نوع محصول الزامی است!");
      return;
    }
    if (!editor.unit.trim()) {
      toast.error("واحد شمارش الزامی است!");
      return;
    }
    const invalidField = editor.fields.find((f) => !f.label.trim());
    if (invalidField) {
      toast.error("عنوان همه‌ی متغیرها را پر کنید (یا متغیر خالی را حذف کنید).");
      return;
    }
    const invalidSelect = editor.fields.find(
      (f) => f.kind === "select" && !f.optionsText.trim()
    );
    if (invalidSelect) {
      toast.error(`متغیر «${invalidSelect.label}» از نوع انتخابی است و باید گزینه داشته باشد.`);
      return;
    }

    const payload = {
      id: editor.id,
      name: editor.name.trim(),
      unit: editor.unit.trim(),
      fields: editor.fields.map(({ tmp, optionsText, ...f }) => ({
        ...f,
        label: f.label.trim(),
        options:
          f.kind === "select"
            ? optionsText
                .split(/[,،\n]/)
                .map((o) => o.trim())
                .filter(Boolean)
            : [],
      })),
    };

    try {
      await actions.saveProductType(payload);
      setEditor(null);
    } catch {
      /* toast از Maindashboard */
    }
  };

  const deleteType = async (t) => {
    const count = products.filter((p) => p.typeId === t.id).length;
    if (count > 0) {
      toast.error(`این نوع ${tofa(count)} محصول دارد و قابل حذف نیست.`);
      return;
    }
    if (!window.confirm(`نوع «${t.name}» حذف شود؟`)) return;
    try {
      await actions.deleteProductType(t.id);
    } catch {
      /* toast از Maindashboard */
    }
  };

  return (
    <div className="settingspage">
      <div className="settingstitle">
        <FiSettings />
        <h2>تنظیمات محصولات و متغیرها</h2>
        {!editor && (
          <button type="button" className="settingsaddtypebtn" onClick={startNew}>
            <FiPlus />
            نوع جدید
          </button>
        )}
      </div>

      <div className="settingsnote">
        <FiInfo />
        <span>
          در این بخش انواع محصول را تعریف کنید و برای هر نوع، متغیرهای اختصاصی
          (مثل رنگ، سایز، جنس...) را مشخص کنید. این متغیرها هنگام افزودن محصول و
          فیلتر کردن لیست محصولات استفاده می‌شوند.
        </span>
      </div>

      {!editor && (
        <div className="typelist">
          {productTypes.length === 0 ? (
            <div className="settingsempty">
              <FiLayers />
              <p>هنوز هیچ نوع محصولی تعریف نشده است.</p>
              <button type="button" className="settingsaddtypebtn" onClick={startNew}>
                <FiPlus />
                اولین نوع محصول را بسازید
              </button>
            </div>
          ) : (
            productTypes.map((t) => {
              const productCount = products.filter((p) => p.typeId === t.id).length;
              return (
                <div className="typeitem" key={t.id}>
                  <div className="typeiteminfo">
                    <div className="typeitemtitle">
                      <strong>{t.name}</strong>
                      <span className="typeitemunit">واحد: {t.unit}</span>
                      <span className="typeitemcount">
                        {tofa(productCount)} محصول
                      </span>
                    </div>
                    <div className="typeitemfields">
                      {t.fields.length === 0 ? (
                        <span className="typechip typechipmuted">بدون متغیر</span>
                      ) : (
                        t.fields.map((f) => (
                          <span className="typechip" key={f.key}>
                            {f.label}
                            {f.required ? " *" : ""}
                            {f.kind === "select" && (
                              <em className="typechipoptions">
                                {f.options.join(" / ")}
                              </em>
                            )}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="typeitemactions">
                    <button
                      type="button"
                      className="customerbtn-edit"
                      title="ویرایش"
                      onClick={() => setEditor(typeToEditor(t))}
                    >
                      <FiEdit />
                    </button>
                    <button
                      type="button"
                      className="customerbtn-delete"
                      title="حذف"
                      onClick={() => deleteType(t)}
                      disabled={productCount > 0}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {editor && (
        <div className="typeeditor">
          <div className="typeeditorheader">
            <h3>{editor.id ? "ویرایش نوع محصول" : "افزودن نوع محصول جدید"}</h3>
          </div>

          <div className="formrow">
            <div className="formgroup">
              <label>نام نوع *</label>
              <input
                type="text"
                placeholder="مثلاً: تیغه"
                value={editor.name}
                onChange={(e) => patchEditor({ name: e.target.value })}
              />
            </div>
            <div className="formgroup">
              <label>واحد شمارش *</label>
              <input
                type="text"
                placeholder="مثلاً: شاخه، عدد، متر"
                value={editor.unit}
                onChange={(e) => patchEditor({ unit: e.target.value })}
              />
            </div>
          </div>

          <div className="typefieldstitle">
            <FiLayers />
            متغیرها
            <span className="typefieldsdesc">
              (این فیلدها هنگام افزودن محصول از این نوع پر می‌شوند)
            </span>
          </div>

          {editor.fields.length === 0 && (
            <div className="settingsnote" style={{ marginTop: 0 }}>
              <FiAlertCircle />
              این نوع هیچ متغیری ندارد. با دکمه زیر اضافه کنید.
            </div>
          )}

          {editor.fields.map((f, i) => (
            <div className="typefieldrow" key={f.key || f.tmp}>
              <input
                type="text"
                placeholder="عنوان متغیر (مثلاً رنگ)"
                value={f.label}
                onChange={(e) => patchField(i, { label: e.target.value })}
              />
              <Select
                value={f.kind}
                onChange={(v) => patchField(i, { kind: v })}
                options={KIND_OPTIONS.map((k) => ({ value: k.value, label: k.label }))}
              />
              {f.kind === "select" && (
                <input
                  type="text"
                  className="typefieldoptions"
                  placeholder="گزینه‌ها با ویرگول (مثلاً: قرمز، آبی، سبز)"
                  value={f.optionsText}
                  onChange={(e) => patchField(i, { optionsText: e.target.value })}
                />
              )}
              <label className="typefieldrequired">
                <input
                  type="checkbox"
                  checked={f.required}
                  onChange={(e) => patchField(i, { required: e.target.checked })}
                />
                الزامی
              </label>
              <button
                type="button"
                className="typefieldremove"
                title="حذف متغیر"
                onClick={() => removeField(i)}
              >
                <FiX />
              </button>
            </div>
          ))}

          <button
            type="button"
            className="typefieldadd"
            onClick={() => patchEditor({ fields: [...editor.fields, newField()] })}
          >
            <FiPlus />
            افزودن متغیر
          </button>

          <div className="typeeditorfooter">
            <button
              type="button"
              className="typecancelbtn"
              onClick={() => setEditor(null)}
            >
              لغو
            </button>
            <button type="button" className="settingssavebtn" onClick={saveType}>
              <FiSave />
              ذخیره نوع محصول
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;