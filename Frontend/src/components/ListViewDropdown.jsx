// ListViewDropdown.jsx - Salesforce Style with Star Icon Inside
import React, { useEffect, useRef, useState } from "react";

/**
 * Props:
 * - views: [{ id, name, pinned? }, ...]
 * - currentViewId
 * - onChange(viewId)
 * - onPinToggle(viewId)
 * - className (optional)
 *
 * Example:
 * <ListViewDropdown
 *   views={[{id:1,name:"My Tasks",pinned:true},{id:2,name:"All Tasks"}]}
 *   currentViewId={1}
 *   onChange={id => setView(id)}
 *   onPinToggle={id => togglePin(id)}
 * />
 */

export default function ListViewDropdown({
  views = [],
  currentViewId = null,
  onChange = () => {},
  onPinToggle = () => {},
  className = ""
}) {
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const ref = useRef(null);
  const listRef = useRef(null);

  const currentView = views.find(v => v.id === currentViewId) || views[0] || { name: "All Tasks" };

  useEffect(() => {
    const onDocClick = (e) => {
      if (open && ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex(i => Math.min(i + 1, views.length - 1));
        scrollToHighlighted();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex(i => Math.max(i - 1, 0));
        scrollToHighlighted();
      }
      if (e.key === "Enter" && highlightIndex >= 0) {
        const v = views[highlightIndex];
        if (v) {
          onChange(v.id);
          setOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line
  }, [open, views, highlightIndex]);

  useEffect(()=> {
    if (open) setHighlightIndex(views.findIndex(v=>v.id===currentViewId));
    else setHighlightIndex(-1);
  }, [open, currentViewId, views]);

  const scrollToHighlighted = () => {
    if (!listRef.current) return;
    const item = listRef.current.querySelector(`[data-index='${highlightIndex}']`);
    if (item) item.scrollIntoView({ block: "nearest" });
  };

  return (
    <div ref={ref} className={`inline-flex items-center ${className}`}>
      <div className="relative">
        <button
          onClick={() => setOpen(s => !s)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex items-center gap-0 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 active:shadow-md transition-all shadow-sm w-48"
          style={{ height: '30px' }}
          title="Select list view"
        >
          <div className="flex items-center justify-center w-7 h-full bg-gray-100 rounded-l-lg border-r border-gray-300 ">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="flex-1" style={{ fontWeight: '400', fontSize: '12px', lineHeight: '18px', padding: '0 8px' }}>
            {currentView.name}
          </span>

          {/* Caret Down Icon */}
          <svg className={`w-4 h-4 transition-transform mr-1 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>


        </button>

        {/* Dropdown */}
        {open && (
          <div
            className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-[10000]"
            role="listbox"
            aria-label="Saved list views"
          >
            {/* Views List */}
            <div ref={listRef} className="max-h-64 overflow-y-auto">
              {views.length === 0 && <div className="p-4 text-sm text-gray-500 text-center">No saved views</div>}
              {views.map((v, idx) => (
                <div
                  key={v.id}
                  data-index={idx}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  onClick={() => { onChange(v.id); setOpen(false); }}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-blue-50 ${highlightIndex===idx ? "bg-blue-50 border-r-2 border-blue-500" : ""}`}
                  role="option"
                  aria-selected={v.id === currentViewId}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{v.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
