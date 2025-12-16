import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE + '/giao-vien/truong',
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
    }
});

export async function layDsTruong({search, page, limit}) {
    try {
        const res = await api.get("", {
            params: {search, page, limit}
        })
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

