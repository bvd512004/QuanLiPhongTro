import { useEffect, useState } from "react";
import { getCurrentUser } from "../shared/services/authService";
import { Link } from "react-router-dom";

function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUser();
  }, []);

  if (!user) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8">

        {/* HEADER */}
        <div className="flex items-center gap-6 border-b pb-6">

          {/* AVATAR */}
          <div>
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="avatar"
                className="w-24 h-24 rounded-full object-cover border"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-500 text-white flex items-center justify-center text-3xl">
                {(user.firstName || user.email || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* BASIC INFO */}
          <div>
            <h2 className="text-2xl font-bold">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-500">{user.email}</p>

            <div className="mt-2 text-sm text-gray-600">
              {user.city && <span>{user.city}, </span>}
              {user.country}
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Thông tin cá nhân</h3>

            <p><b>Phone:</b> {user.phone || "N/A"}</p>
            <p><b>Date of Birth:</b> {user.dateOfBirth || "N/A"}</p>
            <p><b>Address:</b> {user.address || "N/A"}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Giới thiệu</h3>

            <p className="text-gray-700">
              {user.bio || "Chưa có mô tả"}
            </p>
          </div>

        </div>

        {/* BUTTON */}
        <div className="flex gap-4 mt-8">

          <Link
            to="/"
            className="flex-1 text-center bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition"
          >
            ⬅ Trang chủ
          </Link>

          <Link
            to="/profile/edit"
            className="flex-1 text-center bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
          >
            ✏ Chỉnh sửa
          </Link>

        </div>

      </div>
    </div>
  );
}

export default ProfilePage;