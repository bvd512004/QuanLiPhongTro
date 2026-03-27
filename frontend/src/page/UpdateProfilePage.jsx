    import { useEffect, useState } from "react";
import { getCurrentUser, updateProfile } from "@/shared/services/authService.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function UpdateProfilePage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    avatarUrl: "",
    dateOfBirth: "",
    city: "",
    country: "",
    address: "",
    bio: "",
  });

  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

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
        dateOfBirth: user.dateOfBirth || "",
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

    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  // ✅ UPLOAD AVATAR
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // preview ngay
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);

      const res = await axios.post(
        "http://localhost:8080/api/v1/files/upload-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const url = res.data.data.url;

      setForm((prev) => ({
        ...prev,
        avatarUrl: url,
      }));

    } catch (err) {
      console.log(err);
      alert("Upload thất bại ❌");
    } finally {
      setUploading(false);
    }
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await updateProfile(form);
      alert("Update thành công 🔥");
      navigate("/profile");
    } catch (err) {
      console.log(err);

      if (err?.response?.data?.data) {
        setErrors(err.response.data.data);
      } else {
        alert("Update thất bại ❌");
      }
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
            className="w-24 h-24 rounded-full object-cover mb-2 border"
          />

          <input type="file" onChange={handleFileChange} />

          {uploading && (
            <p className="text-blue-500 text-sm mt-1">Uploading...</p>
          )}
        </div>

        {/* FORM */}
        <div className="grid grid-cols-2 gap-3">

          <div>
            <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" className="border p-2 rounded w-full"/>
            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
          </div>

          <div>
            <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" className="border p-2 rounded w-full"/>
            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
          </div>

          <div>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="border p-2 rounded w-full"/>
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
          </div>

          <div>
            <input type="date" name="dateOfBirth" value={form.dateOfBirth || ""} onChange={handleChange} className="border p-2 rounded w-full"/>
            {errors.dateOfBirth && <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>}
          </div>

          <div>
            <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="border p-2 rounded w-full"/>
          </div>

          <div>
            <input name="country" value={form.country} onChange={handleChange} placeholder="Country" className="border p-2 rounded w-full"/>
          </div>
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