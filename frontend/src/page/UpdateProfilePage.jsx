import { useEffect, useState } from "react";
import { getCurrentUser, updateProfile } from '../services/authService';
import { useNavigate } from "react-router-dom";

function UpdateProfilePage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    city: "",
    bio: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();

        setForm({
          firstName: res.firstName || "",
          lastName: res.lastName || "",
          city: res.city || "",
          bio: res.bio || "",
        });
      } catch (err) {
        console.log(err);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateProfile(form);
      alert("Update thành công 🔥");
      navigate("/profile"); // quay lại profile
    } catch (err) {
      console.log(err);
      alert("Update thất bại ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-[500px]"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          ✏️ Update Profile
        </h2>

        <input
          name="firstName"
          placeholder="First Name"
          value={form.firstName}
          onChange={handleChange}
          className="w-full border p-2 mb-3 rounded"
        />

        <input
          name="lastName"
          placeholder="Last Name"
          value={form.lastName}
          onChange={handleChange}
          className="w-full border p-2 mb-3 rounded"
        />

        <input
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          className="w-full border p-2 mb-3 rounded"
        />

        <textarea
          name="bio"
          placeholder="Bio"
          value={form.bio}
          onChange={handleChange}
          className="w-full border p-2 mb-3 rounded"
        />

        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
        >
          Save Changes
        </button>
      </form>

    </div>
  );
}

export default UpdateProfilePage;