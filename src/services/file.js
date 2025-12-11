import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_BE + "/files";

export async function getAllFiles(page, size) {
    const res = await axios.get(API_BASE, {
        params: {page, size}
    });
    return res.data;
}

export async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(`${API_BASE}/upload`, formData, {
        headers: {"Content-Type": "multipart/form-data"},
    });
    return res.data;
}

export async function deleteFile(id) {
    await axios.delete(`${API_BASE}/${id}`);
}

export function getPublicFileUrl(fileName) {
    return `${API_BASE}/public/${fileName}`;
}
