import React from "react";
import { FiCheck } from "react-icons/fi";

export default function FilterPopup({ isOpen, onClose, onApply, currentStatus }) {
  const [selectedStatus, setSelectedStatus] = React.useState(currentStatus);
  const popupRef = React.useRef(null);

  // Calculate responsive position based on screen size
  const getResponsivePosition = () => {
    if (typeof window === 'undefined') return { top: '200px', right: '100px' };

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Desktop: larger screens
    if (width >= 1024) {
      return {
        top: `${height * 0.41}px`, // 41vh equivalent
        right: `${width * 0.07}px`  // 7vw equivalent
      };
    }
    // Tablet: medium screens
    else if (width >= 768) {
      return {
        top: `${height * 0.42}px`, // 42vh equivalent
        right: `${width * 0.06}px`  // 6vw equivalent
      };
    }
    // Mobile: small screens
    else {
      return {
        top: `${height * 0.41}px`, // Higher position for mobile
        right: `${width * 0.05}px`  // 5vw equivalent
      };
    }
  };

  const [position, setPosition] = React.useState(getResponsivePosition());

  const statusOptions = [
    { value: "All", label: "All Status" },
    { value: "New", label: "New" },
    { value: "Contacted", label: "Contacted" },
    { value: "Qualified", label: "Qualified" },
    { value: "Proposal", label: "Proposal" },
    { value: "Negotiation", label: "Negotiation" }
  ];

  const handleOptionClick = (value) => {
    setSelectedStatus(value);
    onApply(value);
    // Don't close popup immediately, let user see all options
  };

  // Update position on window resize for responsiveness
  React.useEffect(() => {
    const handleResize = () => {
      setPosition(getResponsivePosition());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle clicks outside the popup to close it
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={popupRef} className="fixed z-[1000] bg-white border border-gray-200 rounded-lg shadow-lg w-32 py-1" style={{
      top: position.top,
      right: position.right
    }}>
      {statusOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => handleOptionClick(option.value)}
          className={`w-full flex items-center justify-between px-3 py-1.5 text-left text-sm hover:bg-gray-50 transition-colors ${
            selectedStatus === option.value
              ? "bg-blue-50 text-blue-600 font-medium"
              : "text-gray-700"
          }`}
        >
          <span>{option.label}</span>
          {selectedStatus === option.value && (
            <FiCheck className="text-blue-600" size={14} />
          )}
        </button>
      ))}
    </div>
  );
}
