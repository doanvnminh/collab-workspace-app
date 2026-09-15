import { useEffect, useState } from "react";
import {
    acceptInvitation,
    declineInvitation,
    getInvitations,
} from "../../services/apiClient";

function InvitationList({ onAccepted }) {
    const [invitations, setInvitations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadInvitations() {
            try {
                const data = await getInvitations();
                setInvitations(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        }

        loadInvitations();
    }, []);

    async function handleAccept(invitationId) {
        try {
            const data = await acceptInvitation(invitationId);

            setInvitations((current) =>
                current.filter(
                    (invitation) => invitation._id !== invitationId
                )
            );

            if (onAccepted) {
                onAccepted(data.project);
            }
        } catch (error) {
            window.alert(error.message);
        }
    }

    async function handleDecline(invitationId) {
        try {
            await declineInvitation(invitationId);

            setInvitations((current) =>
                current.filter(
                    (invitation) => invitation._id !== invitationId
                )
            );
        } catch (error) {
            window.alert(error.message);
        }
    }

    if (isLoading) {
        return <p>Loading invitations...</p>;
    }

    if (error) {
        return <p>Failed to load invitations: {error}</p>;
    }

    if (invitations.length === 0) {
        return null;
    }

    return (
        <section>
            <h2>Pending invitations</h2>

            {invitations.map((invitation) => (
                <div key={invitation._id}>
                    <div>
                        <strong>{invitation.project.name}</strong>
                        <p>
                            Invited by {invitation.invitedBy.name}
                        </p>
                        <p>Permission: {invitation.role}</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => handleAccept(invitation._id)}
                    >
                        Accept
                    </button>

                    <button
                        type="button"
                        onClick={() => handleDecline(invitation._id)}
                    >
                        Decline
                    </button>
                </div>
            ))}
        </section>
    );
}

export default InvitationList;