import {useEffect} from "react";
import {connectWS, disconnectWS} from "@/services/wsClient";

export default function useTeacherRealtime(lopId, onUpdate) {
    useEffect(() => {
        if (!lopId) return; // không subscribe nếu lopId chưa có

        console.log("Connecting WS for lopId:", lopId); // ✅ debug

        connectWS((client) => {
            client.subscribe(
                `/topic/lop/${lopId}/online-count`,
                (msg) => {
                    console.log("Received online-count:", msg.body); // ✅ debug
                    onUpdate(lopId, "count", JSON.parse(msg.body));
                }
            );

            client.subscribe(
                `/topic/lop/${lopId}/online-list`,
                (msg) => {
                    console.log("Received online-list:", msg.body); // ✅ debug
                    onUpdate(lopId, "list", JSON.parse(msg.body));
                }
            );
        });

        return () => {
            console.log("Disconnecting WS for lopId:", lopId); // ✅ debug
            disconnectWS();
        };
    }, [lopId, onUpdate]);
}
