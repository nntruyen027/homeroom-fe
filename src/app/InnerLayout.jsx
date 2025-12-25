"use client";

import {App} from "antd";
import {usePathname, useRouter} from "next/navigation";
import {useEffect} from "react";
import {useModal} from "@/store/modal";
import {isTokenValid} from "@/utils/auth";
import DoiMatKhauModal from "./DoiMatKhauModal";
import DoiThongTinModal from "@/app/DoiThongTinModal";
import DynamicFavicon from "@/hook/useDynamicFavicon";

export default function InnerLayout({children}) {

    const {message} = App.useApp();
    const router = useRouter();
    const pathname = usePathname();
    const {isUpdatePassOpen, SetIsUpdatePassClose, isEditOpen, setIsEditClose} = useModal();

    useEffect(() => {
        const checkAuth = async () => {
            const valid = await isTokenValid();

            if (!valid && pathname !== "/login") {
                router.replace("/login");
                return;
            }

            if (valid && pathname === "/login") {
                const user = JSON.parse(localStorage.getItem("userInfo"));
                if (!user) return;

                if (user.roles?.includes("ADMIN")) router.replace("/quan-tri-vien/dashboard");
                else if (user.roles?.includes("TEACHER")) router.replace("/giao-vien/dashboard");
                else if (user.roles?.includes("PARENT")) router.replace("/phu-huynh/dashboard");
                else router.replace("/hoc-sinh/dashboard");
            }
        };

        checkAuth();
    }, [pathname, router]);

    return (
        <>
            <DynamicFavicon/>
            <DoiMatKhauModal
                open={isUpdatePassOpen}
                onClose={SetIsUpdatePassClose}
            />
            <DoiThongTinModal
                open={isEditOpen}
                onClose={setIsEditClose}
            />
            {children}
        </>
    );
}
