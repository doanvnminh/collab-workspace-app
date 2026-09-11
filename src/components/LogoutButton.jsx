import { useNavigate } from "react-router-dom";

function LogoutButton() {
    const navigate = useNavigate();

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    }

    return (
        <button type="button" onClick={handleLogout}>
            Log out
        </button>
    );
}

export default LogoutButton;