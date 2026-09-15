import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { loginUser } from "../services/apiClient";
import styles from "./LoginPage.module.css";

function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setError("");
            setIsSubmitting(true);

            const data = await loginUser({
                email,
                password,
            });

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            navigate("/app");
        } catch (error) {
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <AuthLayout>
            <h1 className={styles.title}>Welcome back</h1>

            <p className={styles.subtitle}>
                Log in to continue to your workspace.
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="email">
                        Email
                    </label>

                    <input
                        className={styles.input}
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label} htmlFor="password">
                        Password
                    </label>

                    <input
                        className={styles.input}
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <button
                    className={styles.submitButton}
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Logging in..." : "Log in"}
                </button>
            </form>

            <p className={styles.footer}>
                Don’t have an account?{" "}
                <Link className={styles.link} to="/register">
                    Create one
                </Link>
            </p>
        </AuthLayout>
    );
}

export default LoginPage;