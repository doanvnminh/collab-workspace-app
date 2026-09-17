import { FileText, Users, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import styles from "./WorkspaceNavbar.module.css";

const links = [
    {
        label: "Documents",
        path: "/app",
        icon: FileText,
        end: true,
    },
    {
        label: "Contributors",
        path: "/app/contributors",
        icon: Users,
    },

    {
        label: "Settings",
        path: "/app/settings",
        icon: Settings,
    },
];

function WorkspaceNavbar() {
    return (
        <nav className={styles.navbar}>
            {links.map(({ label, path, icon: Icon, end }) => (
                <NavLink
                    key={path}
                    to={path}
                    end={end}
                    className={({ isActive }) =>
                        `${styles.link} ${isActive ? styles.active : ""
                        }`
                    }
                >
                    <Icon size={16} />
                    <span>{label}</span>
                </NavLink>
            ))}
        </nav>
    );
}

export default WorkspaceNavbar;