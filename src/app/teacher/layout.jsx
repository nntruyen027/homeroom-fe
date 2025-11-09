'use client';

import {useEffect} from "react";
import {usePathname, useRouter} from "next/navigation";
import {isTokenValid} from "@/utils/auth";

export default function RootLayout({children}) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = async () => {
            const valid = await isTokenValid();
            if (!valid && pathname !== '/login') {
                router.replace('/login');
            }
            if (valid && pathname === '/login') {
                router.replace('/teacher');
            }
        };

        checkAuth();
    }, [pathname, router]);

    return (
        <div>{children}</div>
        
    );
}
