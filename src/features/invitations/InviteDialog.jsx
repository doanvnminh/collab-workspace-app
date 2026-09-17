import { useState } from "react";
import { X } from "lucide-react";
import { createInvitation } from "../../services/apiClient";
import styles from "./InviteDialog.module.css";

export default function InviteMember({ projectId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    function openModal() {
        setError("");
        setSuccess("");
        setIsOpen(true);
    }

    function closeModal() {
        if (!isSending) {
            setIsOpen(false);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setSuccess("");
        setIsSending(true);

        try {
            await createInvitation(projectId, {
                email: email.trim(),

            });

            setSuccess("Invitation sent successfully.");
            setEmail("");
            setRole("viewer");
        } catch (err) {
            setError(err.message || "Failed to send invitation.");
        } finally {
            setIsSending(false);
        }
    }

    return (
        <>
            <button
                type="button"
                className={styles.inviteButton}
                onClick={openModal}
                disabled={!projectId}
            >
                Invite
            </button>

            {isOpen && (
                <div className={styles.overlay} onClick={closeModal}>
                    <div
                        className={styles.modal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="invite-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <div>
                                <h2 id="invite-title">Invite a contributor</h2>
                                <p>Add someone to this workspace.</p>
                            </div>

                            <button
                                type="button"
                                className={styles.closeButton}
                                onClick={closeModal}
                                disabled={isSending}
                                aria-label="Close invite modal"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form className={styles.form} onSubmit={handleSubmit}>
                            <label htmlFor="invite-email">Email address</label>

                            <input
                                id="invite-email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />

                            <label htmlFor="invite-role">Role</label>



                            {error && <p className={styles.error}>{error}</p>}
                            {success && <p className={styles.success}>{success}</p>}

                            <div className={styles.actions}>
                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={closeModal}
                                    disabled={isSending}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                    disabled={isSending}
                                >
                                    {isSending ? "Sending..." : "Send invite"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}