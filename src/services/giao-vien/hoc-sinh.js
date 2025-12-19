import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE + '/giao-vien/hoc-sinh',
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
    }
});

export async function layDsHocSinhTheoLop(lopId, {search, limit, page}) {
    try {
        const res = await api.get(`/lop/${lopId}`, {
            params: {
                search,
                limit,
                page
            }
        });
        return res.data;
    } catch (error) {
        throw new Error(e.response?.data?.message);
    }
}

export async function layHocSinhTheoId(id) {
    try {
        const res = await api.get(`/${id}`,);
        return res.data;
    } catch (error) {
        throw new Error(e.response?.data?.message);
    }
}

export async function taoHocSinh(body) {
    try {
        const res = await api.post('', JSON.stringify(body));
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}


export async function suaHocSinh(id, body) {
    try {
        const res = await api.put(`${id}`, JSON.stringify(body));
        return res.data;
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}

export async function xoaHocSinh(id) {
    try {
        const res = await api.delete(`/${id}`)
    } catch (e) {
        throw new Error(e.response?.data?.message);
    }
}


export async function layFileImport() {
    try {
        const response = await api.get("/importer/template", {
            responseType: "blob",
        });

        // Tạo blob đúng loại file Excel
        const blob = new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);

        // Lấy tên file từ header
        const contentDisposition = response.headers["content-disposition"];
        let fileName = "file_import.xlsx";

        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?(.+)"?/);
            if (match?.[1]) fileName = match[1];
        }

        // Tạo link tải xuống
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);

        return response.data;
    } catch (e) {
        throw new Error(e.response?.data?.message || "Tải file thất bại");
    }
}


export async function importHocSinh(lopId, formData) {
    try {
        const response = await axios.post(
            process.env.NEXT_PUBLIC_BE + `/giao-vien/hoc-sinh/lop/${lopId}/importer`,
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
