import React from 'react';

const InputField = ({ label, required, type = "text", value, onChange, placeholder, error, helperText, helperTextColor, ...rest }) => (
    <div className="relative" style={{ marginBottom: 'var(--form-margin-bottom)' }}>
        <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)', zIndex: 1 }}>
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
                fontSize: 'var(--input-font-size)',
                fontFamily: 'var(--font-family)',
                border: `1px solid ${error || helperTextColor === 'red' ? '#ef4444' : 'var(--input-border-color)'}`,
                borderRadius: 'var(--input-border-radius)',
                backgroundColor: 'var(--input-bg-color)',
                color: 'var(--input-text-color)',
                outline: 'none',
                transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = error || helperTextColor === 'red' ? '#ef4444' : 'var(--input-focus-border-color)'}
            onBlur={(e) => e.target.style.borderColor = error || helperTextColor === 'red' ? '#ef4444' : 'var(--input-border-color)'}
            {...rest}
        />
        {(error || helperText) && (
            <span style={{
                color: error ? '#ef4444' : (helperTextColor || '#6b7280'),
                fontSize: '11px',
                marginTop: '4px',
                fontFamily: 'var(--font-family)',
                display: 'block'
            }}>
                {error || helperText}
            </span>
        )}
    </div>
);

export default InputField;
