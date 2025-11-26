import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setError("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
      navigate("/game");
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="center">
      <section style={styles.card}>
        <h1>TicTacTournament</h1>
        <p>Register or log in to play a 5-level Tic-Tac-Toe tournament.</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === "register" && (
            <input
              required
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
            />
          )}
          <input
            required
            name="email"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
          />
          <input
            required
            name="password"
            type="password"
            placeholder="Password (min 6 characters)"
            value={form.password}
            onChange={handleChange}
          />
          {error && <span style={styles.error}>{error}</span>}
          <button type="submit" disabled={busy}>
            {busy
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Create account"}
          </button>
        </form>
        <button style={styles.secondaryBtn} type="button" onClick={toggleMode}>
          {mode === "login"
            ? "Don't have an account? Register"
            : "Already registered? Login"}
        </button>
      </section>
    </main>
  );
};

const styles = {
  card: {
    background: "#ffffff",
    padding: "2.75rem 2.25rem",
    borderRadius: "1.25rem",
    width: "100%",
    maxWidth: "430px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)",
    textAlign: "center",
    border: "1px solid #f1f5f9",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem",
    marginTop: "1.5rem",
  },

  error: {
    color: "#d32f2f",
    fontSize: "0.85rem",
    marginTop: "0.25rem",
  },

  secondaryBtn: {
    marginTop: "1.25rem",
    background: "none",
    border: "none",
    color: "#1d4ed8",
    cursor: "pointer",
    fontSize: "0.95rem",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
    transition: "color .2s ease",
  },
};

export default AuthPage;
