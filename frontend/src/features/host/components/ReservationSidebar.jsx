import React from 'react';
import { Link } from 'react-router-dom';

const MESSAGES = [
  {
    id: '1',
    sender: 'David Nguyen',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKCdBb3U7d2UyxyQvT3cv_FLhGHz6yzFiwOS7EL-dAzSrY7o9reCALLiB7eu50wi9uQUjWc0RuucG5z8go4xGeN104VPm4jvK6cr-GguLPrcFcR8ayNJK0XXbFQi0SZsB5nFnVBkAqDAWJNVdqE-0Ki9UGISDj4uXl0pgYmY4CF26hqWQ-xNq-1cCLMHfyBAOVxKyNk4YZvS_jDp2pQQ_v0dgkrAEQsp4ZfCWYmVCGecbLCF47teIqcJPTUXUk6XOut25lOryg_0U',
    content: 'Nhà mình có chỗ đậu xe hơi khô...',
    time: '2p',
    online: true,
  },
  {
    id: '2',
    sender: 'Linh Dan',
    avatar: null,
    initials: 'L',
    content: 'Cảm ơn bạn đã hỗ trợ!',
    time: '1h',
  },
];

const ReservationSidebar = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Tips Card */}
      <div className="bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="material-symbols-outlined text-primary">tips_and_updates</span>
          <h3 className="font-bold text-slate-900 dark:text-white">Mẹo cho Chủ nhà</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-gray-300 mb-4">
          Phản hồi nhanh trong vòng 1 giờ giúp tăng khả năng hiển thị chỗ ở của bạn lên 20%.
        </p>
        <a href="#" className="text-sm font-bold text-primary hover:underline">
          Xem thêm mẹo
        </a>
      </div>

      {/* Messages Card */}
      <div className="bg-white dark:bg-[#1A2633] rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white">Tin nhắn gần đây</h3>
          <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">2</span>
        </div>
        <div className="flex flex-col gap-4">
          {MESSAGES.map((msg) => (
            <Link to="/messages" key={msg.id} className="flex gap-3 items-center cursor-pointer group">
              <div className="relative">
                {msg.avatar ? (
                  <div
                    className="size-10 rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${msg.avatar}')` }}
                  />
                ) : (
                  <div className="size-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                    {msg.initials}
                  </div>
                )}
                {msg.online && (
                  <div className="absolute bottom-0 right-0 size-2.5 bg-green-500 border-2 border-white dark:border-[#1A2633] rounded-full"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                  {msg.sender}
                </p>
                <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{msg.content}</p>
              </div>
              <span className="text-[10px] text-gray-400">{msg.time}</span>
            </Link>
          ))}
        </div>
        <Link to="/messages" className="block w-full mt-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 bg-slate-50 dark:bg-gray-700 hover:bg-slate-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-center">
          Xem tất cả tin nhắn
        </Link>
      </div>
    </div>
  );
};

export default ReservationSidebar;

