import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/services/api";

const RegisterPage = () => {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {

      await api.register(form);

      alert("Register success");

      navigate("/login");

    } catch (error) {

      alert("Register failed");

      console.error(error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">

      <form
        onSubmit={handleRegister}
        className="w-[400px] p-6 shadow-lg rounded-lg bg-white"
      >

        <h2 className="text-2xl font-bold mb-4 text-center">
          Register
        </h2>

        <input
          name="firstName"
          placeholder="First Name"
          onChange={handleChange}
          className="w-full border p-2 mb-3"
        />

        <input
          name="lastName"
          placeholder="Last Name"
          onChange={handleChange}
          className="w-full border p-2 mb-3"
        />

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full border p-2 mb-3"
        />

        <input
          name="phone"
          placeholder="Phone"
          onChange={handleChange}
          className="w-full border p-2 mb-3"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full border p-2 mb-3"
        />

        <button
          className="w-full bg-blue-500 text-white p-2 rounded"
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
