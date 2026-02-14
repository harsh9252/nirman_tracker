import React, { useState, useEffect, useRef } from "react";
import { FiX, FiUser } from "react-icons/fi";
import apiService from "../services/api";
import { useTranslation } from "../services/translationService.jsx";

const InputField = ({ label, required, type = "text", value, onChange, placeholder, error, ...rest }) => (
    <div className="relative" style={{ marginBottom: 'var(--form-margin-bottom)' }}>
        <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
            {label}{required && <span style={{ color: 'var(--secondary-color)' }} className="ml-1">*</span>}
        </label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            style={{
                width: '100%',
                height: 'var(--input-height)',
                padding: 'var(--input-padding)',
                paddingTop: '16px',
                paddingLeft: '12px',
                fontSize: 'var(--placeholder-font-size)',
                fontFamily: 'var(--font-family)',
                border: `1px solid ${error ? 'var(--secondary-color)' : 'var(--input-border-color)'}`,
                borderRadius: 'var(--input-border-radius)',
                backgroundColor: 'var(--input-bg-color)',
                color: 'var(--input-text-color)',
                outline: 'none',
            }}
            {...rest}
        />
        {error && (
            <p style={{ color: 'var(--secondary-color)', fontSize: 'var(--error-font-size)', marginTop: '4px' }}>
                {error}
            </p>
        )}
    </div>
);

const SelectField = ({ label, required, options = [], value, onChange, placeholder, valueKey = "id", labelKey = "name" }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isOpen && selectRef.current && !selectRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const selectedOption = options.find(opt =>
        (typeof opt === 'string' ? opt === value : opt[valueKey] == value)
    );

    const displayValue = selectedOption
        ? (typeof selectedOption === 'string' ? selectedOption : selectedOption[labelKey])
        : placeholder;

    return (
        <div ref={selectRef} className="relative" style={{ marginBottom: 'var(--form-margin-bottom)' }}>
            <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                {label}{required && <span style={{ color: 'var(--secondary-color)' }} className="ml-1">*</span>}
            </label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    height: 'var(--input-height)',
                    padding: 'var(--input-padding)',
                    paddingTop: '16px',
                    paddingLeft: '12px',
                    fontSize: 'var(--placeholder-font-size)',
                    fontFamily: 'var(--font-family)',
                    border: '1px solid var(--input-border-color)',
                    borderRadius: 'var(--input-border-radius)',
                    backgroundColor: 'var(--input-bg-color)',
                    color: 'var(--input-text-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <span className="truncate pr-4">{displayValue}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
            </div>
            {isOpen && (
                <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-full mt-1 overflow-y-auto max-h-60">
                    {options.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500 italic">{t("No options available")}</div>
                    ) : (
                        options.map((option, index) => {
                            const optValue = typeof option === 'string' ? option : option[valueKey];
                            const optLabel = typeof option === 'string' ? option : option[labelKey];
                            return (
                                <div
                                    key={index}
                                    onClick={() => { onChange(optValue); setIsOpen(false); }}
                                    className={`px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer text-gray-700 ${value == optValue ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                                >
                                    {optLabel}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default function EmployeeFormPopup({ isOpen, onClose, onSubmit, editEmployee }) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: "",
        designation: "",
        department: "",
        phone: "",
        email: "",
        joining_date: "",
        salary: "",
        status: "Active",
        project_id: "",
        bank_name: "",
        account_number: "",
        ifsc_code: "",
        employment_type: "Monthly",
        aadhaar_number: "",
        pan_number: "",
        profile_image: ""
    });
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const results = await apiService.getProjects();
                setProjects(results || []);
            } catch (err) {
                console.error("Error fetching projects:", err);
            }
        };

        if (isOpen) {
            fetchProjects();
        }
    }, [isOpen]);

    useEffect(() => {
        if (editEmployee) {
            setFormData({
                name: editEmployee.name || "",
                designation: editEmployee.designation || "",
                department: editEmployee.department || "",
                phone: editEmployee.phone || "",
                email: editEmployee.email || "",
                joining_date: editEmployee.joining_date ? editEmployee.joining_date.split('T')[0] : "",
                salary: editEmployee.salary || "",
                status: editEmployee.status || "Active",
                project_id: editEmployee.project_id || "",
                bank_name: editEmployee.bank_name || "",
                account_number: editEmployee.account_number || "",
                ifsc_code: editEmployee.ifsc_code || "",
                employment_type: editEmployee.employment_type || "Monthly",
                aadhaar_number: editEmployee.aadhaar_number || "",
                pan_number: editEmployee.pan_number || "",
                profile_image: editEmployee.profile_image || ""
            });
        } else {
            setFormData({
                name: "",
                designation: "",
                department: "",
                phone: "",
                email: "",
                joining_date: "",
                salary: "",
                status: "Active",
                project_id: "",
                bank_name: "",
                account_number: "",
                ifsc_code: "",
                employment_type: "Monthly",
                aadhaar_number: "",
                pan_number: "",
                profile_image: ""
            });
        }
    }, [editEmployee, isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!formData.name) {
            setError(t("Employee name is required"));
            return;
        }

        setLoading(true);
        setError("");

        try {
            if (editEmployee) {
                await apiService.updateEmployee(editEmployee.id, formData);
            } else {
                await apiService.createEmployee(formData);
            }
            onSubmit();
        } catch (err) {
            console.error("Error saving employee:", err);
            setError(err.message || t("Failed to save employee"));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-4 overflow-auto">
            <div className="w-full max-w-4xl bg-white rounded-xl flex flex-col max-h-[95vh] shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b-2 sticky top-0 bg-white z-10 rounded-t-xl" style={{ borderBottomColor: 'var(--primary-color)' }}>
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                            <FiX size={24} />
                        </button>
                        <h2 className="text-xl font-bold" style={{ color: 'var(--primary-color)' }}>
                            {editEmployee ? t('EDIT LABOUR/EMPLOYEE') : t('ADD LABOUR/EMPLOYEE')}
                        </h2>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2 rounded-xl text-white font-medium shadow-md transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: 'var(--primary-color)' }}
                    >
                        {loading ? t('Saving...') : t('Save')}
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        <InputField
                            label={t("NAME")}
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder={t("Enter labour name")}
                        />
                        <InputField
                            label={t("DESIGNATION")}
                            name="designation"
                            value={formData.designation}
                            onChange={handleInputChange}
                            placeholder={t("Enter designation")}
                        />
                        <InputField
                            label={t("DEPARTMENT")}
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            placeholder={t("Enter department")}
                        />
                        <InputField
                            label={t("PHONE")}
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder={t("Enter phone number")}
                        />
                        <InputField
                            label={t("EMAIL")}
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder={t("Enter email address")}
                        />
                        <InputField
                            label={t("JOINING DATE")}
                            name="joining_date"
                            type="date"
                            value={formData.joining_date}
                            onChange={handleInputChange}
                        />
                        <InputField
                            label={t("SALARY")}
                            name="salary"
                            type="number"
                            value={formData.salary}
                            onChange={handleInputChange}
                            placeholder={t("Enter salary")}
                        />
                        <SelectField
                            label={t("ASSIGN PROJECT")}
                            options={projects}
                            value={formData.project_id}
                            onChange={(val) => handleSelectChange("project_id", val)}
                            placeholder={t("Select a project")}
                            valueKey="id"
                            labelKey="project_name"
                        />
                        <SelectField
                            label={t("STATUS")}
                            options={["Active", "Inactive", "On Leave", "Pantry"]}
                            value={formData.status}
                            onChange={(val) => handleSelectChange("status", val)}
                        />

                        {/* SECTION: BANK DETAILS */}
                        <div className="md:col-span-2 pt-4 pb-2">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">{t("BANK DETAILS")}</h3>
                        </div>
                        <InputField
                            label={t("BANK NAME")}
                            name="bank_name"
                            value={formData.bank_name}
                            onChange={handleInputChange}
                            placeholder={t("Enter bank name")}
                        />
                        <InputField
                            label={t("ACCOUNT NUMBER")}
                            name="account_number"
                            value={formData.account_number}
                            onChange={handleInputChange}
                            placeholder={t("Enter account number")}
                        />
                        <InputField
                            label={t("IFSC CODE")}
                            name="ifsc_code"
                            value={formData.ifsc_code}
                            onChange={handleInputChange}
                            placeholder={t("Enter IFSC code")}
                        />
                        <SelectField
                            label={t("EMPLOYMENT TYPE")}
                            options={["Monthly", "Part-time", "Daily Wage", "Contract"]}
                            value={formData.employment_type}
                            onChange={(val) => handleSelectChange("employment_type", val)}
                        />

                        {/* SECTION: PERSONAL IDENTIFICATION */}
                        <div className="md:col-span-2 pt-4 pb-2">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">{t("PERSONAL IDENTIFICATION")}</h3>
                        </div>
                        <InputField
                            label={t("AADHAAR NUMBER")}
                            name="aadhaar_number"
                            value={formData.aadhaar_number}
                            onChange={handleInputChange}
                            placeholder={t("Enter 12-digit Aadhaar number")}
                        />
                        <InputField
                            label={t("PAN NUMBER")}
                            name="pan_number"
                            value={formData.pan_number}
                            onChange={handleInputChange}
                            placeholder={t("Enter 10-digit PAN number")}
                        />
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t("PROFILE IMAGE")}
                            </label>
                            <div className="flex items-center gap-6 p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors group">
                                <div className="relative w-20 h-20 flex-shrink-0">
                                    {formData.profile_image ? (
                                        <div className="relative w-full h-full">
                                            <img
                                                src={formData.profile_image}
                                                alt="Preview"
                                                className="w-full h-full rounded-xl object-cover shadow-sm border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, profile_image: "" }))}
                                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                            >
                                                <FiX size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                                            <FiUser size={32} className="opacity-20" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-700 mb-1">{t("Upload profile photo")}</p>
                                    <p className="text-xs text-gray-500 mb-3">{t("Supported formats: JPG, PNG. Max size: 2MB")}</p>
                                    <input
                                        type="file"
                                        id="profile-image-upload"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                if (file.size > 2 * 1024 * 1024) {
                                                    setError(t("File size should be less than 2MB"));
                                                    return;
                                                }
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    setFormData(prev => ({ ...prev, profile_image: event.target.result }));
                                                    setError("");
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="profile-image-upload"
                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer transition-all active:scale-95"
                                    >
                                        {formData.profile_image ? t("CHANGE PHOTO") : t("CHOOSE FILE")}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
