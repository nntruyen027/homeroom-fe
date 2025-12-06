import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE + '/quan-tri/tinh',
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
    }
});

export async function layDsTinh({search, page, limit}) {
    try {
        const res = await api.get("", {
            params: {search, page, limit}
        })
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function themTinh(tinh) {
    try {
        const res = await api.post("", JSON.stringify(tinh));
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function suaTinh(id, tinh) {
    try {
        const res = await api.put(`/${id}`, JSON.stringify(tinh));
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function xoaTinh(id) {
    try {
        await api.delete(`/${id}`);
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function layFileImport() {
    try {
        const response = await api.get("/importer/template", {
            responseType: 'blob'
        })
        const url = window.URL.createObjectURL(new Blob([response.data]));

        // Lấy tên file từ header nếu có
        const contentDisposition = response.headers['content-disposition'];
        let fileName = "file_download";
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?(.+)"?/);
            if (match.length === 2) fileName = match[1];
        }

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function importTinh(formData) {
    try {
        // không dùng api.headers mặc định "Content-Type"
        const response = await axios.post(
            process.env.NEXT_PUBLIC_BE + '/quan-tri/tinh/importer',
            formData,
            {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`
                }
            }
        );
        return response.data;
    } catch (e) {
        throw new Error(e.response?.data?.message || "Lỗi import");
    }
}
