import React from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { FiMail, FiPhone, FiCalendar, FiUserPlus } from "react-icons/fi";
import TableActionButton from "./TableActionButton";

// Helper function for date formatting
const formatDate = (dateString) => {
  if (!dateString) return "No date";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function Table({
  data,
  columns,
  loading,
  emptyMessage = "No data found",
  emptyDescription = "Get started by adding a new item.",
  onEdit,
  onDelete,
  renderCell,
  renderMobileCard,
  formatDate: customFormatDate,
  loadingMessage = "Loading data...",
  keyField = "id",
  user, // Add user prop for role-based visibility
}) {
  // Use custom formatDate or default
  const formatDateFunc = customFormatDate || formatDate;

  return (
    <div className="bg-white ">
      {/* TABLE VIEW */}
      <div className="hidden sm:block overflow-x-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">{loadingMessage}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900">
              {emptyMessage}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{emptyDescription}</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead
              style={{
                backgroundColor: "var(--light-primary-bg)",
                boxShadow: "0 2px 6px rgba(255, 255, 0, 0.7)",
              }}
              className="shadow-md"
            >
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={`header-${column.key}-${index}`}
                    style={{
                      color: "#181D27",
                      fontSize: "13px",
                      lineHeight: "20px",
                      fontWeight: "600",
                      padding: "8px 24px",
                      textAlign: column.align || "left",
                      width: column.width || "auto",
                      borderRight:
                        index < columns.length - 1
                          ? "1px solid #e5e7eb"
                          : "none",
                    }}
                    className="whitespace-nowrap"
                  >
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white ">
              {data.map((item) => (
                <tr
                  key={item[keyField]}
                  className="hover:bg-gray-50 hover:shadow-md transition-all duration-200 border-b border-gray-200"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={`cell-${item[keyField]}-${column.key}`}
                      style={{
                        color: "#6B7280",
                        fontSize: "13px",
                        lineHeight: "20px",
                        fontWeight: "400",
                        padding: "8px 24px",
                        textAlign: column.align || "left",
                      }}
                      className="whitespace-nowrap"
                    >
                      {renderCell ? (
                        renderCell(column.key, item)
                      ) : column.key === "actions" ? (
                        <div className="flex justify-center gap-1 sm:gap-2">
                          <TableActionButton
                            icon={FaPencilAlt}
                            type="edit"
                            title="Edit"
                            onClick={() => onEdit?.(item[keyField])}
                            disabled={item.status === "Completed"}
                            mobileSize={false}
                            extraSmall={true}
                          />
                          <TableActionButton
                            icon={FaTrash}
                            type="delete"
                            title="Delete"
                            onClick={() => onDelete?.(item[keyField])}
                            disabled={item.status === "Completed"}
                            mobileSize={false}
                            extraSmall={true}
                          />
                        </div>
                      ) : (
                        <span className="truncate max-w-[200px]">
                          {item[column.key]}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>


    </div>
  );
}
