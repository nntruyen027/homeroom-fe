import api from "@/services/api";

export async function layDsHoatDong({search, page, limit}) {
    try {
        const res = await api.get(
            "/hoc-sinh/hoat-dong-huong-nghiep",
            {
                params: {search, page, limit},
            }
        );

        return res.data;
    } catch (e) {
        throw new Error(
            e?.response?.data?.message || "Không lấy được danh sách hoạt động"
        );
    }
}
