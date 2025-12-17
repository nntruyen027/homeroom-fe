'use client';

import {useEffect, useRef, useState} from "react";
import {layDsTruong} from "@/services/giao-vien/truong";
import {layDsLop} from "@/services/giao-vien/lop";
import {useDebounce} from "@/hook/data";

export function useTruongLopSelect() {

    /* ===================== Trường ===================== */
    const [dsTruong, setDsTruong] = useState([]);
    const [searchTruong, setSearchTruong] = useState("");
    const debouncedTruong = useDebounce(searchTruong, 300);

    const [truongPagi, setTruongPagi] = useState({
        page: 1,
        limit: 20,
        total: 0
    });

    const truongCache = useRef({});

    const fetchTruong = async (reset = false) => {
        const page = reset ? 1 : truongPagi.page;
        const key = `${debouncedTruong}_${page}`;

        if (truongCache.current[key]) {
            setDsTruong(prev =>
                reset ? truongCache.current[key] : [...prev, ...truongCache.current[key]]
            );
            return;
        }

        const res = await layDsTruong({search: debouncedTruong, page, limit: truongPagi.limit});

        truongCache.current[key] = res.data || [];
        setDsTruong(prev => reset ? res.data : [...prev, ...res.data]);
        setTruongPagi(prev => ({
            ...prev,
            page,
            total: res.total || 0
        }));
    };


    /*=============== Lớp =========================*/
    const [truongId, setTruongId] = useState(null);
    const [dsLop, setDsLop] = useState([]);
    const [searchLop, setSearchLop] = useState("");
    const debouncedLop = useDebounce(searchLop, 300);

    const [lopPagi, setLopPagi] = useState({
        page: 1,
        limit: 20,
        total: 0
    });

    const lopCache = useRef({});

    const fetchLop = async (reset = false) => {
        if (!truongId) return;

        const page = reset ? 1 : lopPagi.page;
        const key = `${truongId}_${debouncedLop}_${page}`;

        if (lopCache.current[key]) {
            setDsLop(prev =>
                reset ? lopCache.current[key] : [...prev, ...lopCache.current[key]]
            );
            return;
        }

        const res = await layDsLop({search: debouncedLop, truongId, page, limit: lopPagi.limit});

        lopCache.current[key] = res.data || [];
        setDsLop(prev => reset ? res.data : [...prev, ...res.data]);
        setLopPagi(prev => ({
            ...prev,
            page,
            total: res.total || 0
        }));
    };

    /* ===================== EFFECT ===================== */

    // 🔹 tìm trường (debounce)
    useEffect(() => {
        setDsTruong([]);
        setTruongPagi(p => ({...p, page: 1}));
        fetchTruong(true);
    }, [debouncedTruong]);

    // 🔹 scroll trường
    useEffect(() => {
        if (truongPagi.page > 1) fetchTruong();
    }, [truongPagi.page]);

    useEffect(() => {
        if (!truongId) return;

        setDsLop([]);
        setLopPagi(p => ({...p, page: 1}));
        fetchLop(true);
    }, [truongId, debouncedLop]);

    // 🔹 scroll xã
    useEffect(() => {
        if (lopPagi.page > 1) fetchLop();
    }, [lopPagi.page]);

    return {
        dsTruong,
        setSearchTruong,
        truongPagi,
        setTruongPagi,

        truongId,
        setTruongId,

        dsLop,
        setSearchLop,
        lopPagi,
        setLopPagi
    };
}
