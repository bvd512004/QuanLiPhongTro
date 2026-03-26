import React from 'react';
import { Link } from 'react-router-dom';

const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const formatPrice = (value) => {
  if (value == null) return '';
  try {
    const number = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(number)) return value;
    return number.toLocaleString('vi-VN');
  } catch (e) {
    return value;
  }
};

const AdminPropertyTable = ({ items, loading, startIndex = 0 }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return <div className="text-center text-sm text-gray-500 py-6">Không có property nào phù hợp.</div>;
  }

  return (
    <div className="overflow-x-hidden bg-white rounded-lg shadow">
      <table className="w-full table-fixed divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">STT</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Address</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/night</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Host email</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Host name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Created at</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-10 w-44">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item, idx) => (
            <tr key={item.id}>
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{startIndex + idx + 1}</td>
              <td className="px-4 py-3 text-sm text-gray-900 truncate whitespace-nowrap" title={item.title}>
                {item.title}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 truncate whitespace-nowrap hidden md:table-cell" title={item.address}>
                {item.address}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{item.city}</td>
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{formatPrice(item.pricePerNight)}</td>
              <td className="px-4 py-3 text-xs">
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-800">
                  {item.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis hidden lg:table-cell">{item.hostEmail}</td>
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis hidden lg:table-cell">{item.hostFullName}</td>
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis hidden xl:table-cell">{formatDateTime(item.createdAt)}</td>
              <td className="px-4 py-3 text-sm text-right sticky right-0 bg-white z-10 w-44">
                <div className="flex justify-end gap-2">
                  <Link
                    to={`/admin/properties/moderation/${item.id}`}
                    className="px-3 py-1 text-xs rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  >
                    Hồ sơ
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPropertyTable;

