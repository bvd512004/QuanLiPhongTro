import React from 'react';

const GuestSelector = ({ guests, onChange, onClose }) => {
  const updateCount = (type, delta) => {
    const newValue = Math.max(0, guests[type] + delta);

    // Adults must be at least 1 if there are children/infants
    if (type === 'adults' && newValue === 0 && (guests.children > 0 || guests.infants > 0)) {
      return;
    }

    // Max limits
    const maxLimits = {
      adults: 16,
      children: 15,
      infants: 5,
      pets: 5
    };

    if (newValue > maxLimits[type]) return;

    onChange({ ...guests, [type]: newValue });
  };

  const guestTypes = [
    {
      key: 'adults',
      label: 'Adults',
      description: 'Ages 13 or above',
    },
    {
      key: 'children',
      label: 'Children',
      description: 'Ages 2-12',
    },
    {
      key: 'infants',
      label: 'Infants',
      description: 'Under 2',
    },
    {
      key: 'pets',
      label: 'Pets',
      description: 'Bringing a service animal?',
    },
  ];

  const totalGuests = guests.adults + guests.children;

  return (
    <div className="absolute top-full left-0 right-0 md:left-auto md:right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-[9999] w-full md:w-[400px]">
      <div className="space-y-6">
        {guestTypes.map((type) => (
          <div key={type.key} className="flex items-center justify-between">
            <div>
              <div className="flex font-medium text-gray-900">{type.label}</div>
              <div className="flex text-sm text-gray-500">{type.description}</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateCount(type.key, -1)}
                disabled={guests[type.key] === 0 || (type.key === 'adults' && guests[type.key] === 1 && totalGuests > 1)}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined !text-[18px]">remove</span>
              </button>
              <span className="w-8 text-center font-medium text-gray-900">
                {guests[type.key]}
              </span>
              <button
                onClick={() => updateCount(type.key, 1)}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-500 transition-colors"
              >
                <span className="material-symbols-outlined !text-[18px]">add</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-semibold text-gray-900 underline hover:text-primary"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default GuestSelector;