import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE + '/giao-vien/lop',
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
    }
});

export async function layDsLop({search, page, limit, truongId}) {
    try {
        const res = await api.get('', {
            params: {page, limit, search, truongId}
        })
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function taoLop(lop) {
    try {
        const res = await api.post('', JSON.stringify(lop));
        return res.data;
    } catch (error) {
        throw new Error(e.response?.data?.message);
    }
}


export async function sua(id, lop) {
    try {
        const res = await api.put(`/${id}`, JSON.stringify(lop));
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function xoaLop(id) {
    try {
        await api.delete(`/${id}`);
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}
