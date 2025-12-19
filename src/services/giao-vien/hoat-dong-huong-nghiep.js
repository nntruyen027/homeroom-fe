import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE + '/giao-vien/hoat-dong-huong-nghiep',
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
    }
});

export async function layDsHoatDong({search, page, limit}) {
    try {
        const res = await api.get('', {
            params: {page, limit, search}
        })
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function taoHoatDong(hoatDong) {
    try {
        const res = await api.post('', JSON.stringify(hoatDong));
        return res.data;
    } catch (error) {
        throw new Error(e.response?.data?.message);
    }
}


export async function suaHoatDong(id, hoatDong) {
    try {
        const res = await api.put(`/${id}`, JSON.stringify(hoatDong));
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function xoaHoatDong(id) {
    try {
        await api.delete(`/${id}`);
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function phanHoatDongChoLop(hdId, lopIds) {
    try {
        const res = await api.post(`/${hdId}/lop`, JSON.stringify(lopIds));
        return res.data;
    } catch (error) {
        throw new Error(e.response?.data?.message);
    }
}