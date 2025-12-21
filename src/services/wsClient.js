import SockJS from "sockjs-client";
import {Client} from "@stomp/stompjs";

let stompClient = null;

export function connectWS(onConnected, onError) {
    const token = localStorage.getItem("jwtToken");

    const url = `${process.env.NEXT_PUBLIC_BE}/ws?token=${token}`;

    stompClient = new Client({
        webSocketFactory: () => new SockJS(url, null, {transports: ['websocket']}), // ⚠️ chỉ dùng websocket
        reconnectDelay: 5000,
        onConnect: () => {
            onConnected && onConnected(stompClient);
        },
        onStompError: (frame) => {
            onError && onError(frame);
        }
    });

    stompClient.activate();
}

export function disconnectWS() {
    if (stompClient) {
        stompClient.deactivate(); // deactivate sẽ ngắt kết nối STOMP/SockJS
        stompClient = null;
    }
}
