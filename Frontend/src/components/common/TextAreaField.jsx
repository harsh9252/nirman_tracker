import React from 'react';

const TextAreaField = ({ label, required, value, onChange, placeholder, rows = 3, maxLength, error, ...rest }) => (
    <div className="relative" style={{ marginBottom: 'var(--form-margin-bottom)' }}>
        <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)', zIndex: 1 }}>
            {label}{required && <span style={{ color: 'var(--secondary-color)' }} className="ml-1">*</span>}
        </label>
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            style={{
                width: '100%',
                minHeight: '80px',
                padding: 'var(--input-padding)',
                fontSize: 'var(--input-font-size)',
                fontFamily: 'var(--font-family)',
                border: `1px solid ${error ? 'var(--secondary-color)' : 'var(--input-border-color)'}`,
                borderRadius: 'var(--input-border-radius)',
                backgroundColor: 'var(--input-bg-color)',
                color: 'var(--input-text-color)',
                outline: 'none',
                transition: 'border-color 0.2s',
                resize: 'vertical',
            }}
            onFocus={(e) => e.target.style.borderColor = error ? 'var(--secondary-color)' : 'var(--input-focus-border-color)'}
            onBlur={(e) => e.target.style.borderColor = error ? 'var(--secondary-color)' : 'var(--input-border-color)'}
            {...rest}
        />
        {error && (
            <p style={{ color: 'var(--secondary-color)', fontSize: 'var(--error-font-size, 11px)', marginTop: '4px', fontFamily: 'var(--font-family)' }}>
                {error}
            </p>
        )}
        {maxLength && !error && (
            <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'var(--font-family)', marginTop: '4px', display: 'block' }}>
                {value?.length || 0}/{maxLength} characters
            </span>
        )}
    </div>
);

export default TextAreaField;
