import { useEffect, useState } from "react";
import { getCurrentUser } from "@/shared/services/authService.js";
import { Link } from "react-router-dom";

function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUser();
  }, []);

  if (!user) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-[500px]">

        <h2 className="text-2xl font-bold mb-6 text-center">
          👤 User Profile
        </h2>

        <div className="space-y-3">
          <p><b>Email:</b> {user.email}</p>
          <p><b>Name:</b> {user.firstName} {user.lastName}</p>
          <p><b>City:</b> {user.city || "N/A"}</p>
          <p><b>Bio:</b> {user.bio || "N/A"}</p>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 mt-6">

          <Link
            to="/"
            className="flex-1 text-center bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
          >
            ⬅ Home
          </Link>

          <Link
            to="/profile/edit"
            className="flex-1 text-center bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            ✏ Edit
          </Link>

        </div>

      </div>
    </div>
  );
}

export default ProfilePage;