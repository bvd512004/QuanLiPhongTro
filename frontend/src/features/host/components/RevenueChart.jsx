import React, { useEffect, useState } from 'react';
import  hostService  from '../services/host.service';

const RevenueChart = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchMonthlyRevenue();
  }, [selectedYear]);

  const fetchMonthlyRevenue = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await hostService.getMonthlyRevenue(selectedYear);
      setMonthlyData(Array.isArray(response.items) ? response.items : []);
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
      setError(error instanceof Error ? error.message : 'Không thể tải dữ liệu doanh thu');
    } finally {
      setLoading(false);
    }
  };

  const maxRevenue = monthlyData.length > 0
    ? Math.max(...monthlyData.map(m => m.revenue), 1)
    : 1;

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M VND`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K VND`;
    }
    return `${amount.toFixed(0)} VND`;
  };

  const formatDetailedCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateMoMChange = (currentIndex) => {
    if (currentIndex === 0) return null;

    const currentRevenue = monthlyData[currentIndex].revenue;
    const previousRevenue = monthlyData[currentIndex - 1].revenue;

    if (previousRevenue === 0) {
      if (currentRevenue > 0) {
        return { percentChange: 100, isIncrease: true, previousRevenue };
      }
      return null;
    }

    const percentChange = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    return {
      percentChange: Math.abs(percentChange),
      isIncrease: percentChange >= 0,
      previousRevenue
    };
  };

  if (loading) {
    return (
      <div className="h-full p-7 rounded-2xl bg-white border border-blue-100 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-6 w-40 bg-slate-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex items-end justify-between h-64 gap-2 sm:gap-4 mt-4">
          {new Array(12).fill(0).map((_, i) => (
            <div key={`skeleton-${i}`} className="w-full bg-slate-200 rounded-t-lg animate-pulse" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full p-7 rounded-2xl bg-white border border-blue-100 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Biểu đồ doanh thu</h3>
            <p className="text-sm text-slate-600">Tổng quan năm {selectedYear}</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <span className="material-symbols-outlined text-red-500 !text-5xl mb-3">error</span>
          <p className="text-slate-900 font-medium mb-2">Lỗi tải dữ liệu</p>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <button
            onClick={fetchMonthlyRevenue}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const totalRevenue = monthlyData.reduce((sum, m) => sum + (m.revenue || 0), 0);

  const getYAxisLabels = () => {
    if (maxRevenue === 0) return [0];

    const maxWithPadding = maxRevenue * 1.1;
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxWithPadding)));
    const normalized = maxWithPadding / magnitude;

    let maxRounded;
    if (normalized <= 1) maxRounded = magnitude;
    else if (normalized <= 2) maxRounded = 2 * magnitude;
    else if (normalized <= 5) maxRounded = 5 * magnitude;
    else maxRounded = 10 * magnitude;

    return [
      maxRounded,
      maxRounded * 0.75,
      maxRounded * 0.5,
      maxRounded * 0.25,
      0
    ];
  };

  const formatYAxisValue = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toFixed(0);
  };

  const yAxisLabels = getYAxisLabels();
  const yAxisMax = yAxisLabels[0];

  return (
    <div className="h-full p-7 rounded-2xl bg-white border border-blue-100 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Biểu đồ doanh thu</h3>
          <p className="text-sm text-slate-600">
            Tổng quan năm {selectedYear}
            {totalRevenue > 0 && (
              <span className="ml-2 text-emerald-600 font-semibold">
                • {formatCurrency(totalRevenue)}
              </span>
            )}
          </p>
        </div>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="text-sm border border-blue-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm hover:border-blue-300 transition-colors cursor-pointer"
        >
          {[2024, 2025, 2026].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {monthlyData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <span className="material-symbols-outlined text-slate-400 !text-5xl mb-3">analytics</span>
          <p className="text-slate-900 font-medium mb-2">Chưa có dữ liệu</p>
          <p className="text-sm text-slate-600">Không có doanh thu trong năm {selectedYear}</p>
        </div>
      ) : (
        <div className="relative">
          <div className="relative p-4">
            <div className="flex gap-3">
              <div className="flex flex-col justify-between h-72 py-1 pr-3 relative z-10">
                {yAxisLabels.map((value, index) => (
                  <div key={`y-axis-${value}-${index}`} className="text-xs font-medium text-slate-600 text-right">
                    {formatYAxisValue(value)}
                  </div>
                ))}
              </div>

              <div className="flex-1 relative h-72">
                <div className="absolute inset-0 flex flex-col justify-between">
                  {yAxisLabels.map((value, index) => (
                    <div
                      key={`grid-${value}-${index}`}
                      className="border-t border-dashed border-blue-100"
                    ></div>
                  ))}
                </div>

                <div className="relative h-full flex items-end justify-between gap-3">
                  {monthlyData.map((monthData, index) => {
                    const heightPercent = yAxisMax > 0 ? (monthData.revenue / yAxisMax) * 100 : 0;
                    const hasRevenue = monthData.revenue > 0;
                    const momChange = calculateMoMChange(index);

                    return (
                      <div key={`${monthData.year}-${monthData.month}`} className="flex-1 group relative" style={{height: '100%'}}>
                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-8 left-1/2 -translate-x-1/2 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-2xl transition-all duration-200 whitespace-nowrap z-50 pointer-events-none border border-slate-700 min-w-[200px]">
                          <div className="p-3 space-y-2">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
                              <span className="material-symbols-outlined text-emerald-400 !text-lg">calendar_today</span>
                              <span className="font-bold text-sm">{monthData.monthName} {selectedYear}</span>
                            </div>

                            <div className="flex items-start gap-2">
                              <span className="material-symbols-outlined text-emerald-400 !text-lg mt-0.5">payments</span>
                              <div>
                                <div className="text-xs text-slate-400">Doanh thu</div>
                                <div className={`font-bold text-base ${hasRevenue ? 'text-emerald-300' : 'text-slate-400'}`}>
                                  {hasRevenue ? formatDetailedCurrency(monthData.revenue) : 'Không có doanh thu'}
                                </div>
                              </div>
                            </div>

                            {hasRevenue && momChange && (
                              <div className="flex items-start gap-2 pt-2 border-t border-slate-700">
                                <span className={`material-symbols-outlined !text-lg mt-0.5 ${momChange.isIncrease ? 'text-green-400' : 'text-red-400'}`}>
                                  {momChange.isIncrease ? 'trending_up' : 'trending_down'}
                                </span>
                                <div>
                                  <div className="text-xs text-slate-400">So với tháng trước</div>
                                  <div className={`font-bold text-sm ${momChange.isIncrease ? 'text-green-400' : 'text-red-400'}`}>
                                    {momChange.isIncrease ? '+' : '-'}{momChange.percentChange.toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                            )}

                            {hasRevenue && !momChange && (
                              <div className="flex items-start gap-2 pt-2 border-t border-slate-700">
                                <span className="material-symbols-outlined text-blue-400 !text-lg mt-0.5">info</span>
                                <div>
                                  <div className="text-xs text-slate-400">Tháng đầu tiên</div>
                                  <div className="text-sm text-blue-400">Không có dữ liệu so sánh</div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 rotate-45 border-r border-b border-slate-700"></div>
                        </div>

                        <div className="h-full flex flex-col justify-end items-center">
                          {hasRevenue && (
                            <div
                              className="w-full bg-gradient-to-t from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 rounded-t-md transition-all duration-500 ease-out shadow-lg relative"
                              style={{ height: `${heightPercent}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-md"></div>
                            </div>
                          )}
                        </div>

                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                          <span className={`text-xs font-semibold whitespace-nowrap transition-colors ${
                            hasRevenue 
                              ? 'text-slate-700'
                              : 'text-slate-400'
                          }`}>
                            {monthData.monthName}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;

