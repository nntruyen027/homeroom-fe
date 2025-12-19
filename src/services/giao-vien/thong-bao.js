import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE + '/giao-vien/thong-bao',
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
    }
});

export async function layDsThongBao({search, page, limit, lopId}) {
    try {
        const res = await api.get('', {
            params: {page, limit, search, lopId}
        })
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function taoThongBao(lopId, body) {
    try {
        const res = await api.post(`/${lopId}`, JSON.stringify(body));
        return res.data;
    } catch (error) {
        throw new Error(e.response?.data?.message);
    }
}


export async function suaThongBao(id, body) {
    try {
        const res = await api.put(`/${id}`, JSON.stringify(body));
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function xoaThongBao(id) {
    try {
        await api.delete(`/${id}`);
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}
