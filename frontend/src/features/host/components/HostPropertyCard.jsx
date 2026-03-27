import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import  hostService  from '../services/host.service';

const HostPropertyCard = ({ property, onRefresh }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const formatPrice = (price) => {
    if (!price) return 'Price not set';
    return new Intl.NumberFormat('en-US').format(price);
  };

  const handleActivate = async () => {
    if (!window.confirm('Chuyển tin đăng về trạng thái INACTIVE để chỉnh sửa/gửi duyệt lại?')) return;

    setLoading(true);
    try {
      await hostService.updatePropertyStatus(Number(property.id), 'INACTIVE');
      alert('Đã chuyển trạng thái thành INACTIVE');
      onRefresh?.();
    } catch (error) {
      alert(error.message || 'Không thể cập nhật trạng thái tin đăng');
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) return;

    setLoading(true);
    try {
      await hostService.deleteProperty(property.id);
      alert('Property deleted successfully!');
      onRefresh?.();
    } catch (error) {
      alert(error.message || 'Failed to delete property');
    } finally {
      setLoading(false);
    }
  };

  const rawStatus = property.rawStatus;
  const displayStatus = property.status;
  const isActive = rawStatus === 'ACTIVE' || displayStatus === 'Active';
  const canMoveToInactive =
    rawStatus === 'ACTIVE' ||
    rawStatus === 'REJECTED' ||
    displayStatus === 'Active' ||
    displayStatus === 'Rejected';
  const isRejected = property.rawStatus === 'REJECTED';
  const canEdit = property.rawStatus !== 'ACTIVE';

  const handleEdit = () => {
    if (!canEdit) return;
    navigate(`/host/properties/${property.id}/edit`);
  };

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-blue-100 overflow-hidden hover:shadow-[0_14px_34px_rgba(59,130,246,0.12)] transition-all duration-300">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 ${isActive ? '' : 'opacity-85'}`}
          style={{ backgroundImage: `url("${property.imageUrl}")` }}
        />
        <div className="absolute top-3 right-3">
          <span className={`backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${
            property.rawStatus === 'ACTIVE'
              ? 'bg-green-500/90'
              : property.rawStatus === 'REJECTED'
                ? 'bg-red-500/90'
                : property.rawStatus === 'INACTIVE'
                  ? 'bg-amber-500/90'
                  : 'bg-slate-500/90'
          }`}>
            {property.status}
          </span>
        </div>
        <button
          onClick={handleEdit}
          disabled={!canEdit}
          title={canEdit ? 'Edit property' : 'Không thể chỉnh sửa khi trạng thái ACTIVE'}
          className="absolute top-3 left-3 bg-white/90 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px] text-slate-700">edit</span>
        </button>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{property.title}</h3>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              {property.location}
            </p>
          </div>

          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              disabled={loading}
              className="text-slate-400 hover:text-primary -mr-2 p-1 rounded-full hover:bg-blue-50 disabled:opacity-50"
            >
              <span className="material-symbols-outlined">more_vert</span>
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-blue-100 py-1 z-20">
                  {canMoveToInactive && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        handleActivate();
                      }}
                      className="w-full h-10 px-4 text-left text-sm text-slate-700 hover:bg-blue-50 flex items-center gap-2 whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-[18px] text-green-600">check_circle</span>
                      <span className="truncate">Chuyển về INACTIVE</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleEdit();
                    }}
                    disabled={!canEdit}
                    className="w-full h-10 px-4 text-left text-sm text-slate-700 hover:bg-blue-50 flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px] text-blue-600">edit</span>
                    <span className="truncate">{canEdit ? 'Edit Property' : 'Edit bị khóa khi ACTIVE'}</span>
                  </button>

                  <div className="border-t border-blue-100 my-1" />

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDelete();
                    }}
                    className="w-full h-10 px-4 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    <span className="truncate">Delete Property</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-auto pt-5 border-t border-blue-100">
          {isRejected && property.reason && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              <span className="font-semibold">Lý do từ chối:</span> {property.reason}
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <p className={`font-bold ${property.isPriceSet ? 'text-primary' : 'text-slate-400'}`}>
              {formatPrice(property.price)} 
              {property.isPriceSet && <span className="text-xs font-normal text-slate-500 ml-1">/ night</span>}
            </p>
            <div className={`flex items-center gap-1 ${property.rating ? 'text-amber-500' : 'text-slate-300'}`}>
              <span className={`material-symbols-outlined text-[18px] ${property.rating ? 'fill-1' : ''}`}>star</span>
              <span className="text-sm font-bold">{property.rating || '-'}</span>
            </div>
          </div>

          {canMoveToInactive ? (
            <button
              onClick={handleActivate}
              disabled={loading}
              className="flex items-center justify-center text-xs text-white font-bold bg-primary hover:bg-blue-600 p-2 rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin mr-1">progress_activity</span>
                  Đang gửi...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px] mr-1">check_circle</span>
                  Chuyển về INACTIVE
                </>
              )}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-blue-50 p-2.5 rounded-xl">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">event_upcoming</span>
                <span>{property.upcomingBookings || 0} upcoming</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-blue-400">visibility</span>
                <span>{property.views ? (property.views >= 1000 ? `${(property.views/1000).toFixed(1)}k` : property.views) : 0} views</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostPropertyCard;

