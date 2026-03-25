import { useEffect, useState } from "react";
import { getCurrentUser, updateProfile, uploadImage } from "@/services/authService";
import { useNavigate } from "react-router-dom";

function UpdateProfilePage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    avatarUrl: "",
    dateOfBirth: "",   // ✅ thêm
    city: "",
    country: "",
    address: "",
    bio: "",
  });

  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  // load user
  useEffect(() => {
    const fetchUser = async () => {
      const res = await getCurrentUser();
      const user = res.data || res;

      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        avatarUrl: user.avatarUrl || "",
        dateOfBirth: user.dateOfBirth || "", // ✅ thêm
        city: user.city || "",
        country: user.country || "",
        address: user.address || "",
        bio: user.bio || "",
      });

      setPreview(user.avatarUrl);
    };

    fetchUser();
  }, []);

  // change input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // chọn ảnh
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    try {
      const res = await uploadImage(file);

      setForm((prev) => ({
        ...prev,
        avatarUrl: res.url,
      }));

    } catch (err) {
      console.log(err);
      alert("Upload ảnh thất bại ❌");
    }
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateProfile(form);
      alert("Update thành công 🔥");
      navigate("/profile");
    } catch (err) {
      console.log(err);
      alert("Update thất bại ❌");
    }
  };

  return (
    <div className="flex justify-center py-10 bg-gray-100 min-h-screen">
      <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-8 w-[600px]">

        <h2 className="text-2xl font-bold mb-6 text-center">
          ✏️ Update Profile
        </h2>

        {/* AVATAR */}
        <div className="flex flex-col items-center mb-4">
          <img
            src={preview || "https://placehold.co/100"}
            className="w-24 h-24 rounded-full object-cover mb-2"
          />

          <input type="file" onChange={handleFileChange} />
        </div>

        {/* FORM */}
        <div className="grid grid-cols-2 gap-3">
          <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" className="border p-2 rounded"/>
          <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" className="border p-2 rounded"/>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="border p-2 rounded"/>

          {/* ✅ DATE OF BIRTH */}
          <input
            type="date"
            name="dateOfBirth"
            value={form.dateOfBirth || ""}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="border p-2 rounded"/>
          <input name="country" value={form.country} onChange={handleChange} placeholder="Country" className="border p-2 rounded"/>
        </div>

        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="w-full border p-2 mt-3 rounded"/>

        <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Bio" className="w-full border p-2 mt-3 rounded"/>

        <button className="w-full bg-green-500 text-white py-2 mt-4 rounded-lg hover:bg-green-600">
          Save Changes
        </button>

      </form>
    </div>
  );
}

export default UpdateProfilePage;