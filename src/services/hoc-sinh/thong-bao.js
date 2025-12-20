import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE + '/hoc-sinh/thong-bao',
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
    }
});

export async function layDsThongBao({search, page, limit}) {
    try {
        const res = await api.get('', {
            params: {page, limit, search}
        })
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function xemThongBao(id) {
    try {
        await api.get(`${id}`)
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}
