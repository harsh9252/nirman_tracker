import React from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import '../assets/CSS/TableActionButton.css';

const TableActionButton = ({ icon: Icon, type, title, onClick, disabled = false }) => {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      title={disabled ? `${title} (Disabled)` : title}
      className={`table-action-btn ${type} ${disabled ? 'disabled' : ''}`}
      disabled={disabled}
      style={disabled ? { cursor: 'not-allowed' } : {}}
    >
      <Icon className="icon" />
    </button>
  );
};

export default TableActionButton;
