import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import styles from "./AppLayout.module.css";
import { Outlet } from "react-router-dom";

export default function AppLayout({ title }) {
    return (
        <div className={styles.app}>
            <Sidebar />
            <div className={styles.main}>
                <Topbar title={title} />
                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
