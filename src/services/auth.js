import {useAuthStore} from "@/store/auth";
import api from "@/services/api";

/* ================= LOGIN ================= */

export async function login(username, password) {
    try {
        const res = await api.post("/auth/login", {username, password});

        const token = res.data.token;
        if (!token) throw new Error("Không nhận được token!");

        if (typeof window !== "undefined") {
            localStorage.setItem("jwtToken", token);
        }

        const resMe = await api.get("/auth/me");
        const user = resMe.data;

        if (typeof window !== "undefined") {
            localStorage.setItem("userInfo", JSON.stringify(user));
        }

        useAuthStore.getState().setAuth(token, user);

        return {token, user};
    } catch (e) {
        throw new Error(e?.response?.data?.message || "Sai tài khoản hoặc mật khẩu");
    }
}

/* ================= ĐỊA CHỈ ================= */

export async function getTinh(search, page = 1, limit = 10) {
    const res = await api.get("/auth/tinh", {
        params: {search, page, limit},
    });
    return {
        dsTinh: res.data.data,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
    };
}

export async function getXa(search, tinhId, page = 1, limit = 10) {
    const res = await api.get(`/auth/tinh/${tinhId}/xa`, {
        params: {search, page, limit},
    });
    return {
        dsXa: res.data.data,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
    };
}

/* ================= ĐĂNG KÝ ================= */

export async function dangKyGiaoVien(body) {
    const res = await api.post("/auth/dang-ky-giao-vien", body);
    return res.data;
}

/* ================= TÀI KHOẢN ================= */

export async function doiMatKhau(body) {
    await api.put("/auth/doi-mat-khau", body);
}

export async function capNhatThongTinQuanTri(body) {
    const res = await api.put("/quan-tri", body);
    return res.data;
}

export async function capNhatThongTinGiaoVien(body) {
    const res = await api.put("/giao-vien", body);
    return res.data;
}

export async function capNhatThongTinHocSinh(body) {
    const res = await api.put("/hoc-sinh", body);
    return res.data;
}

export async function layThongTinCaNhanGiaoVien() {
    const res = await api.get("/giao-vien");
    return res.data;
}

export async function layThongTinCaNhanHocSinh() {
    const res = await api.get("/hoc-sinh");
    return res.data;
}
