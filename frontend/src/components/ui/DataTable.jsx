import { useState } from 'react';
import { MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({
  columns = [],
  data = [],
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  pagination = null,
  actions = true,
}) => {
  const [menuOpen, setMenuOpen] = useState(null);

  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length;

  return (
    <div>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {selectable && (
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={el => { if (el) el.indeterminate = someSelected; }}
                    onChange={() => onSelectAll?.(!allSelected)}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
              )}
              {columns.map(col => (
                <th key={col.key || col.label} style={col.style || {}}>
                  {col.label}
                </th>
              ))}
              {actions && <th style={{ width: 60 }}>عملیات</th>}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={(selectable ? 1 : 0) + columns.length + (actions ? 1 : 0)}
                  style={{ textAlign: 'center', color: '#475569', padding: '32px 0' }}
                >
                  داده‌ای برای نمایش وجود ندارد
                </td>
              </tr>
            ) : data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={() => onRowClick?.(row)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {selectable && (
                  <td onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id || rowIndex)}
                      onChange={() => onSelectRow?.(row.id || rowIndex)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                )}
                {columns.map(col => (
                  <td key={col.key || col.label} style={col.cellStyle || {}}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
                {actions && (
                  <td onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
                    <button
                      className="btn-icon"
                      onClick={() => setMenuOpen(menuOpen === (row.id || rowIndex) ? null : (row.id || rowIndex))}
                    >
                      <MoreVertical size={15} />
                    </button>
                    {menuOpen === (row.id || rowIndex) && row._actions && (
                      <div style={{
                        position: 'absolute', left: 0, top: '100%', zIndex: 50,
                        background: '#1e293b', border: '1px solid #334155',
                        borderRadius: 10, minWidth: 140, overflow: 'hidden',
                        boxShadow: '0 8px 24px rgba(0,0,0,.4)',
                      }}>
                        {row._actions.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => { action.onClick(row); setMenuOpen(null); }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              width: '100%', padding: '10px 16px',
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: action.color || '#94a3b8',
                              fontFamily: 'inherit', fontSize: 13, textAlign: 'right',
                            }}
                          >
                            {action.icon && <action.icon size={14} />}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: '16px 0 4px' }}>
          <button
            className="btn btn-ghost btn-sm"
            disabled={pagination.page <= 1}
            onClick={() => pagination.onPageChange?.(pagination.page - 1)}
          >
            <ChevronRight size={16} />
          </button>
          <span style={{ color: '#94a3b8', fontSize: 13 }}>
            صفحه {pagination.page} از {pagination.pages}
            {pagination.total ? ` (${pagination.total.toLocaleString('fa-IR')} مورد)` : ''}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            disabled={pagination.page >= pagination.pages}
            onClick={() => pagination.onPageChange?.(pagination.page + 1)}
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;
