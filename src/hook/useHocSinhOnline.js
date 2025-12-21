'use client';

import {useEffect} from "react";
import {connectWS, disconnectWS} from "@/services/wsClient";

export default function useHocSinhOnline() {
    useEffect(() => {
    

        connectWS((c) => {
        });


        return () => {
            disconnectWS();
        };
    }, []);
}
