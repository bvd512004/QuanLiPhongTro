import React from 'react';

const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const AdminUserTable = ({ items, loading, startIndex = 0, onBan, onUnban }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return <div className="text-center text-sm text-gray-500 py-6">Không có người dùng phù hợp.</div>;
  }

  return (
    <div className="overflow-x-hidden bg-white rounded-lg shadow">
      <table className="w-full table-fixed divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">STT</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
              Họ tên
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
              SĐT
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
              Verified
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-10 w-36">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((u, idx) => (
            <tr key={u.id}>
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                {startIndex + idx + 1}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 truncate whitespace-nowrap" title={u.email}>
                {u.email}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 truncate whitespace-nowrap hidden md:table-cell">{u.fullName}</td>
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis hidden lg:table-cell">{u.phone || '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-900 hidden xl:table-cell">
                {u.isVerified ? (
                  <span className="text-emerald-700 font-semibold">Yes</span>
                ) : (
                  <span className="text-amber-700 font-semibold">No</span>
                )}
              </td>
              <td className="px-4 py-3 text-xs">
                {u.isActive ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 font-medium">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-red-50 text-red-700 border border-red-100 px-2.5 py-1 font-medium">
                    Banned
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right sticky right-0 bg-white z-10 w-36">
                <div className="flex justify-end gap-2">
                  {u.isActive ? (
                    <button
                      type="button"
                      onClick={() => onBan(u.id)}
                      className="px-3 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"
                    >
                      Ban
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onUnban(u.id)}
                      className="px-3 py-1 text-xs rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Unban
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserTable;

