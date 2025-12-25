'use client';
import {useEffect} from 'react';
import {layThamSo} from '@/services/auth';

export default function DynamicFavicon() {
    useEffect(() => {
        const fetchFavicon = async () => {
            try {
                const res = await layThamSo('FAVICON');
                if (!res?.giaTri) return;
                const link =
                    document.querySelector("link[rel~='icon']") ||
                    document.createElement('link');
                link.rel = 'icon';
                link.href = `${res.giaTri}?v=${Date.now()}`; // client-side, safe
                if (!link.parentNode) document.head.appendChild(link);
            } catch (e) {
                console.error('Lấy favicon thất bại', e);
            }
        };
        fetchFavicon();
    }, []);

    return null;
}
