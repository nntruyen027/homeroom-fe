'use client';

import {useRouter} from 'next/navigation';
import {useEffect} from "react";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/login");
    }, [])

    return (
        <div
            className="h-screen w-screen flex flex-col md:flex-row items-center justify-center gap-12 bg-cover bg-center"
        >

        </div>
    );
}
