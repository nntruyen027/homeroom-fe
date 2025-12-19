import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE + '/giao-vien/huong-nghiep/log',
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
    }
});

export async function layDsLogHuongNghiep(userId, {page, limit}) {
    try {
        const res = await api.get(`/${userId}`, {
            params: {page, limit}
        })
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

const apiText = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE + '/giao-vien/huong-nghiep/log',
    headers: {
        "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
        "Content-Type": "text/plain",
    }
});

export async function nhanXetLog(userId, hdId, nhanXet) {
    const res = await apiText.post(`/${hdId}/hoc-sinh/${userId}`, nhanXet.nhanXet);
    return res.data;
}