import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE + '/hoc-sinh/huong-nghiep/log',
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
    }
});


export async function layDsLogHuongNghiep({page, limit}) {
    try {
        const res = await api.get(``, {
            params: {page, limit}
        })
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function layLogHuongNghiepTheoHd(hdId) {
    try {
        const res = await api.get(`hoat-dong/${hdId}`,)
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}


export async function vietLog(hdId, body) {
    try {
        const res = await api.post(`${hdId}`, body)
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}