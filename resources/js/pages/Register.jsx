import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Register.css";

function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [role, setRole] = useState("buyer");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await API.post("/register", {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
                role,
            });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            navigate("/");
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                const msgs = Object.values(errors).flat().join(" ");
                setError(msgs);
            } else {
                setError("Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-card">
                <h1>Create Account</h1>
                <p className="register-subtitle">Join Sinina Co. today</p>

                {error && <p className="register-error">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Juan Dela Cruz"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Minimum 6 characters"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password_confirmation">Confirm Password</label>
                        <input
                            id="password_confirmation"
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                            placeholder="Repeat your password"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Register as</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="buyer">Buyer</option>
                            <option value="seller">Seller</option>
                        </select>
                    </div>

                    <button type="submit" className="register-btn" disabled={loading}>
                        {loading ? "Creating account..." : "Register"}
                    </button>
                </form>

                <p className="register-footer">
                    Already have an account?{" "}
                    <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
