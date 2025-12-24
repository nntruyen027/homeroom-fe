import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE + '/quan-tri/cau-hinh',
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
    }
});

export async function layDsCauHinh({search, page, limit}) {
    try {
        const res = await api.get("", {
            params: {search, page, limit}
        })
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function themCauHinh(cauHinh) {
    try {
        const res = await api.post("", JSON.stringify(cauHinh));
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function suaCauHinh(cauHinh) {
    try {
        const res = await api.put(``, JSON.stringify(cauHinh));
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}