import React, { useState, useEffect } from 'react';

const STATUS_OPTIONS = ['INACTIVE', 'PENDING', 'UNDER_REVIEW', 'ACTIVE', 'REJECTED'];

const AdminPropertyFilter = ({ initialStatus = 'INACTIVE', onChange }) => {
  const [status, setStatus] = useState(initialStatus);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange({ status, keyword });
    }, 500);

    return () => clearTimeout(handler);
  }, [status, keyword]);

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setStatus(value);
    onChange({ status: value, keyword });
  };

  const handleKeywordChange = (e) => {
    setKeyword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onChange({ status, keyword });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col md:flex-row gap-4 md:items-end bg-white p-4 rounded-lg shadow mb-6"
    >
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          value={status}
          onChange={handleStatusChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-[2]">
        <label className="block text-sm font-medium text-gray-700 mb-1">Keyword</label>
        <input
          type="text"
          value={keyword}
          onChange={handleKeywordChange}
          placeholder="Tìm theo title hoặc host email..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="md:w-auto">
        <button
          type="submit"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors w-full md:w-auto"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default AdminPropertyFilter;

