import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from "../../services/translationService.jsx";

const SelectField = ({ label, required, options = [], value, onChange, placeholder, valueKey = "id", labelKey = "name", error }) => {
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
        ? (typeof selectedOption === 'string'
            ? selectedOption
            : (typeof labelKey === 'function' ? labelKey(selectedOption) : selectedOption[labelKey]))
        : placeholder;

    return (
        <div ref={selectRef} className="relative w-full" style={{ marginBottom: 'var(--form-margin-bottom)', zIndex: isOpen ? 100 : 1 }}>
            <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)', zIndex: 10 }}>
                {label}{required && <span style={{ color: 'var(--secondary-color)' }} className="ml-1">*</span>}
            </label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    height: 'var(--input-height)',
                    padding: 'var(--input-padding)',
                    fontSize: 'var(--input-font-size)',
                    fontFamily: 'var(--font-family)',
                    border: `1px solid ${error ? '#ef4444' : 'var(--input-border-color)'}`,
                    borderRadius: 'var(--input-border-radius)',
                    backgroundColor: 'var(--input-bg-color)',
                    color: value ? 'var(--input-text-color)' : 'var(--input-placeholder-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative'
                }}
            >
                <span className="truncate pr-4">{displayValue || placeholder || t("Select...")}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
            </div>
            {isOpen && (
                <div
                    className="absolute top-full left-0 bg-white border border-gray-200 rounded-xl shadow-2xl z-[1000] w-full mt-1.5 overflow-y-auto max-h-60 animate-in fade-in slide-in-from-top-2 duration-200"
                    style={{ border: '1px solid #e5e7eb' }}
                >
                    {options.length === 0 ? (
                        <div className="px-4 py-3 text-xs text-gray-400 font-medium italic uppercase tracking-wider">{t("No options available")}</div>
                    ) : (
                        <div className="py-1">
                            {options.map((option, index) => {
                                const optValue = typeof option === 'string' ? option : option[valueKey];
                                const optLabel = typeof option === 'string'
                                    ? option
                                    : (typeof labelKey === 'function' ? labelKey(option) : option[labelKey]);
                                return (
                                    <div
                                        key={index}
                                        onClick={() => { onChange(optValue); setIsOpen(false); }}
                                        className={`px-4 py-2.5 text-sm hover:bg-gray-50 cursor-pointer transition-colors ${value == optValue ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-700 font-medium'}`}
                                    >
                                        {optLabel}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
            {error && (
                <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontFamily: 'var(--font-family)', display: 'block' }}>
                    {error}
                </span>
            )}
        </div>
    );
};

export default SelectField;
