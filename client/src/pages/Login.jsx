import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.message || "Login failed");
        return;
      }
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err) {
      setError("Server ku connect aagala");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });
      const data = await res.json();
      console.log(data);
      if (!res.ok) {
        setError(data.error || data.message || "Google login failed");
        return;
      }
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err) {
      setError("Server ku connect aagala");
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: "80px auto" }}>
      <h2>AcadVision Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <br /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br /><br />
        <button type="submit">Login</button>
      </form>

      <p>or</p>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => setError("Google login failed")}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Login;