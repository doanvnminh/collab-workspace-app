import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
    autoConnect: false,
});

export function connectSocket() {
    const token = localStorage.getItem("token");

    socket.auth = {
        token,
    };

    socket.connect();
}

export default socket;