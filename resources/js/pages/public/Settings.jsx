import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./Settings.css";

function Settings() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState("account");
    const [editMode, setEditMode] = useState(false);

    // Account form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });

    // Security form state
    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // Fetch user data
    useEffect(() => {
        API.get("/user")
            .then((response) => {
                setUser(response.data);
                setFormData({
                    name: response.data.name,
                    email: response.data.email,
                    phone: response.data.phone || "",
                });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            await API.put("/user/profile", formData);
            setUser((prev) => ({
                ...prev,
                ...formData,
            }));
            setEditMode(false);
            setMessage("Profile updated successfully!");
            setTimeout(() => setMessage(""), 3000);
        } catch (error) {
            setMessage("Failed to update profile.");
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage("");

        if (passwordData.new_password !== passwordData.confirm_password) {
            setMessage("New passwords do not match.");
            return;
        }

        if (passwordData.new_password.length < 8) {
            setMessage("Password must be at least 8 characters.");
            return;
        }

        try {
            await API.post("/user/change-password", {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password,
            });
            setPasswordData({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });
            setMessage("Password changed successfully!");
            setTimeout(() => setMessage(""), 3000);
        } catch (error) {
            setMessage("Failed to change password.");
        }
    };

    if (loading) return <p className="loading-text">Loading settings...</p>;
    if (!user) return <p className="empty-text">Could not load settings.</p>;

    return (
        <div className="settings-page">
            <div className="settings-container">
                {/* Header */}
                <div className="settings-header">
                    <h1>Settings</h1>
                    <p className="settings-subtitle">Manage your account and preferences</p>
                </div>

                {/* Message Alert */}
                {message && (
                    <div className={`alert ${message.includes("successfully") ? "alert-success" : "alert-error"}`}>
                        {message}
                    </div>
                )}

                {/* Tabs */}
                <div className="settings-tabs">
                    <button
                        className={`tab-button ${activeTab === "account" ? "active" : ""}`}
                        onClick={() => {
                            setActiveTab("account");
                            setEditMode(false);
                            setMessage("");
                        }}
                    >
                        Account
                    </button>
                    <button
                        className={`tab-button ${activeTab === "security" ? "active" : ""}`}
                        onClick={() => {
                            setActiveTab("security");
                            setMessage("");
                        }}
                    >
                        Security
                    </button>
                </div>

                {/* Tab Content */}
                <div className="settings-content">
                    {/* Account Tab */}
                    {activeTab === "account" && (
                        <div className="settings-section">
                            <div className="section-header">
                                <h2>Account Information</h2>
                                {!editMode && (
                                    <button
                                        className="btn-secondary"
                                        onClick={() => setEditMode(true)}
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>

                            {!editMode ? (
                                <div className="account-display">
                                    <div className="info-field">
                                        <label>Full Name</label>
                                        <p>{user.name}</p>
                                    </div>
                                    <div className="info-field">
                                        <label>Email Address</label>
                                        <p>{user.email}</p>
                                    </div>
                                    <div className="info-field">
                                        <label>Phone Number</label>
                                        <p>{user.phone || "Not provided"}</p>
                                    </div>
                                    <div className="info-field">
                                        <label>Account Role</label>
                                        <p className="role-badge">{user.role}</p>
                                    </div>
                                    {user.created_at && (
                                        <div className="info-field">
                                            <label>Member Since</label>
                                            <p>{new Date(user.created_at).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleSaveProfile} className="edit-form">
                                    <div className="form-group">
                                        <label htmlFor="name">Full Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="email">Email Address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="phone">Phone Number</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="0917XXXXXXX"
                                        />
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            type="submit"
                                            className="btn-primary"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={() => setEditMode(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === "security" && (
                        <div className="settings-section">
                            <h2>Change Password</h2>

                            <form onSubmit={handleChangePassword} className="security-form">
                                <div className="form-group">
                                    <label htmlFor="current_password">Current Password</label>
                                    <div className="password-input-group">
                                        <input
                                            type={showPasswords.current ? "text" : "password"}
                                            id="current_password"
                                            name="current_password"
                                            value={passwordData.current_password}
                                            onChange={handlePasswordChange}
                                            required
                                            placeholder="Enter your current password"
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() =>
                                                setShowPasswords((prev) => ({
                                                    ...prev,
                                                    current: !prev.current,
                                                }))
                                            }
                                            title="Toggle visibility"
                                        >
                                            {showPasswords.current ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="new_password">New Password</label>
                                    <div className="password-input-group">
                                        <input
                                            type={showPasswords.new ? "text" : "password"}
                                            id="new_password"
                                            name="new_password"
                                            value={passwordData.new_password}
                                            onChange={handlePasswordChange}
                                            required
                                            placeholder="Enter new password (min. 8 characters)"
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() =>
                                                setShowPasswords((prev) => ({
                                                    ...prev,
                                                    new: !prev.new,
                                                }))
                                            }
                                            title="Toggle visibility"
                                        >
                                            {showPasswords.new ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirm_password">Confirm New Password</label>
                                    <div className="password-input-group">
                                        <input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            id="confirm_password"
                                            name="confirm_password"
                                            value={passwordData.confirm_password}
                                            onChange={handlePasswordChange}
                                            required
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() =>
                                                setShowPasswords((prev) => ({
                                                    ...prev,
                                                    confirm: !prev.confirm,
                                                }))
                                            }
                                            title="Toggle visibility"
                                        >
                                            {showPasswords.confirm ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                </div>

                                <div className="password-requirements">
                                    <p className="requirement-title">Password requirements:</p>
                                    <ul>
                                        <li>At least 8 characters long</li>
                                        <li>Contains uppercase and lowercase letters</li>
                                        <li>Contains at least one number</li>
                                    </ul>
                                </div>

                                <button type="submit" className="btn-primary">
                                    Update Password
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Settings;
