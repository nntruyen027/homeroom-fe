import api from "@/services/api";

/**
 * Lấy danh sách log hướng nghiệp
 */
export async function layDsLogHuongNghiep({page, limit}) {
    try {
        const res = await api.get(
            "/hoc-sinh/huong-nghiep/log",
            {
                params: {page, limit},
            }
        );
        return res.data;
    } catch (e) {
        throw new Error(
            e?.response?.data?.message || "Không lấy được danh sách log"
        );
    }
}

/**
 * Lấy log theo hoạt động
 */
export async function layLogHuongNghiepTheoHd(hdId) {
    try {
        const res = await api.get(
            `/hoc-sinh/huong-nghiep/log/hoat-dong/${hdId}`
        );
        return res.data;
    } catch (e) {
        throw new Error(
            e?.response?.data?.message || "Không lấy được log theo hoạt động"
        );
    }
}

/**
 * Viết log hướng nghiệp
 */
export async function vietLog(hdId, body) {
    try {
        const res = await api.post(
            `/hoc-sinh/huong-nghiep/log/${hdId}`,
            body
        );
        return res.data;
    } catch (e) {
        throw new Error(
            e?.response?.data?.message || "Không thể viết log"
        );
    }
}
