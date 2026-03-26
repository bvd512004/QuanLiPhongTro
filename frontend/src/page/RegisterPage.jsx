import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from '../services/api';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: ""
  });

  const [errors, setErrors] = useState({}); // lưu lỗi validation

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({}); // reset lỗi cũ

    try {
      await api.register(form);
      alert("Register success");
      navigate("/login");
    } catch (err) {
      console.log(err);

      // nếu backend trả về map lỗi validation
      if (err.data) {
        setErrors(err.data);
      } else {
        alert(err.message || "Register failed");
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="w-[400px] p-6 shadow-lg rounded-lg bg-white"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Register
        </h2>

        {/* FIRST NAME */}
        <input
          name="firstName"
          placeholder="First Name"
          value={form.firstName}
          onChange={handleChange}
          className="w-full border p-2 mb-1 rounded"
        />
        {errors.firstName && <p className="text-red-500 text-sm mb-2">{errors.firstName}</p>}

        {/* LAST NAME */}
        <input
          name="lastName"
          placeholder="Last Name"
          value={form.lastName}
          onChange={handleChange}
          className="w-full border p-2 mb-1 rounded"
        />
        {errors.lastName && <p className="text-red-500 text-sm mb-2">{errors.lastName}</p>}

        {/* EMAIL */}
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border p-2 mb-1 rounded"
        />
        {errors.email && <p className="text-red-500 text-sm mb-2">{errors.email}</p>}

        {/* PHONE */}
        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full border p-2 mb-1 rounded"
        />
        {errors.phone && <p className="text-red-500 text-sm mb-2">{errors.phone}</p>}

        {/* PASSWORD */}
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border p-2 mb-1 rounded"
        />
        {errors.password && <p className="text-red-500 text-sm mb-2">{errors.password}</p>}

        <button
          className="w-full bg-blue-500 text-white p-2 rounded mt-3 hover:bg-blue-600 transition"
        >
          Register
        </button>

        <p className="text-center mt-4">
          Already have account?
          <Link to="/login" className="text-blue-500 ml-1">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;