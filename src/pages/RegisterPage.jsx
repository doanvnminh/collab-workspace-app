import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { registerUser } from "../services/apiClient";
import styles from "./LoginPage.module.css";

function RegisterPage() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setError("");
            setIsSubmitting(true);

            await registerUser({
                name,
                email,
                password,
            });

            setIsRegistered(true);

            window.setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <AuthLayout>
            <h1 className={styles.title}>Create an account</h1>

            <p className={styles.subtitle}>
                Start organizing your collaborative workspace.
            </p>
            {isRegistered ? (
                <div className={styles.successMessage} role="status">
                    <h2>Account created successfully</h2>
                    <p>Redirecting you to login...</p>
                </div>
            ) : (
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="name">
                            Name
                        </label>

                        <input
                            className={styles.input}
                            id="name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="register-email">
                            Email
                        </label>

                        <input
                            className={styles.input}
                            id="register-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="register-password">
                            Password
                        </label>

                        <input
                            className={styles.input}
                            id="register-password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            minLength={6}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="confirm-password">
                            Confirm password
                        </label>

                        <input
                            className={styles.input}
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                            minLength={6}
                            required
                        />
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button
                        className={styles.submitButton}
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating account..." : "Create account"}
                    </button>
                </form>
            )}

            <p className={styles.footer}>
                Already have an account?{" "}
                <Link className={styles.link} to="/login">
                    Log in
                </Link>
            </p>
        </AuthLayout>
    );
}

export default RegisterPage;