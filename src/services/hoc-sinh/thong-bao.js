import axios from "axios";

/**
 * Tạo axios instance an toàn cho Next.js (SSR + Client)
 */
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE + "/hoc-sinh/thong-bao",
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Gắn token khi request (chỉ chạy ở client)
 */
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("jwtToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

/* ================= API ================= */

export async function layDsThongBao({search, page, limit}) {
    try {
        const res = await api.get("", {
            params: {page, limit, search},
        });
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message || "Lỗi tải thông báo");
    }
}

export async function xemThongBao(id) {
    try {
        await api.get(`/${id}`);
    } catch (e) {
        throw new Error(e?.response?.data?.message || "Lỗi xem thông báo");
    }
}
