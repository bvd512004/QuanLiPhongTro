import { useState, useContext } from "react";
import { login as loginApi } from '../services/authService'
import { useNavigate, Link } from "react-router-dom";
import { AuthActionsContext } from '../providers/AuthProvider';

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthActionsContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);

    try {
      const res = await loginApi(email, password);

      localStorage.setItem("token", res.accessToken);

      login({
        token: res.accessToken,
        ...res.user
      });

      alert("Login success");
      navigate("/");

    } catch (err) {
      console.error(err);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white shadow-xl rounded-2xl p-8 w-[400px]">

        <h2 className="text-2xl font-bold text-center mb-6">
          Welcome Back 👋
        </h2>

        <div className="flex flex-col gap-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </div>

        <p className="text-center mt-6 text-sm">
          Don't have an account?
          <Link to="/register" className="text-blue-500 ml-1 hover:underline">
            Register
          </Link>
        </p>

      </div>

    </div>
  );
}

export default LoginPage;