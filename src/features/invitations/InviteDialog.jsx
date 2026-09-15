import { useState } from "react";
import { createInvitation } from "../../services/apiClient";

function InviteMemberDialog({ projectId, onClose }) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("viewer");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setMessage("");
            setError("");
            setIsSubmitting(true);

            await createInvitation(projectId, {
                email,
                role,
            });

            setMessage("Invitation created successfully.");
            setEmail("");
        } catch (error) {
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div>
            <div>
                <h2>Invite to project</h2>

                <button type="button" onClick={onClose}>
                    Close
                </button>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="invite-email">
                        Email
                    </label>

                    <input
                        id="invite-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="user@example.com"
                        required
                    />

                    <label htmlFor="invite-role">
                        Permission
                    </label>

                    <select
                        id="invite-role"
                        value={role}
                        onChange={(event) => setRole(event.target.value)}
                    >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                    </select>

                    {message && <p>{message}</p>}
                    {error && <p>{error}</p>}

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Inviting..." : "Send invitation"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default InviteMemberDialog;