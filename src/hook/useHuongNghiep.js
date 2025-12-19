'use client';

import {useEffect, useRef, useState} from "react";
import {layDsHoatDong} from "@/services/giao-vien/hoat-dong-huong-nghiep";
import {useDebounce} from "@/hook/data";

export function useHdHuongNghiepSelect() {

    /* ===================== Trường ===================== */
    const [dsHdHuongNghiep, setDsHdHuongNghiep] = useState([]);
    const [searchHdHuongNghiep, setSearchHdHuongNghiep] = useState("");
    const debouncedHdHuongNghiep = useDebounce(searchHdHuongNghiep, 300);

    const [hdHuongNghiepPagi, setHdHuongNghiepPagi] = useState({
        page: 1,
        limit: 20,
        total: 0
    });

    const hdHuongNghiepCache = useRef({});

    const fetchHdHuongNghiep = async (reset = false) => {
        const page = reset ? 1 : hdHuongNghiepPagi.page;
        const key = `${debouncedHdHuongNghiep}_${page}`;

        if (hdHuongNghiepCache.current[key]) {
            setDsHdHuongNghiep(prev =>
                reset ? hdHuongNghiepCache.current[key] : [...prev, ...hdHuongNghiepCache.current[key]]
            );
            return;
        }

        const res = await layDsHoatDong({search: debouncedHdHuongNghiep, page, limit: hdHuongNghiepPagi.limit});

        hdHuongNghiepCache.current[key] = res.data || [];
        setDsHdHuongNghiep(prev => reset ? res.data : [...prev, ...res.data]);
        setHdHuongNghiepPagi(prev => ({
            ...prev,
            page,
            total: res.total || 0
        }));
    };


    /* ===================== EFFECT ===================== */

    // 🔹 tìm trường (debounce)
    useEffect(() => {
        setDsHdHuongNghiep([]);
        setHdHuongNghiepPagi(p => ({...p, page: 1}));
        fetchHdHuongNghiep(true);
    }, [debouncedHdHuongNghiep]);

    // 🔹 scroll trường
    useEffect(() => {
        if (hdHuongNghiepPagi.page > 1) fetchHdHuongNghiep();
    }, [hdHuongNghiepPagi.page]);

    return {
        dsHdHuongNghiep,
        setSearchHdHuongNghiep,
        hdHuongNghiepPagi,
        setHdHuongNghiepPagi,
        
    };
}
