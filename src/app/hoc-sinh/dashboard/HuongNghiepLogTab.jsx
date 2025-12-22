'use client';

import {useEffect, useState} from "react";
import {App, Card, Grid, Rate, Spin, Timeline} from "antd";
import {layDsLogHuongNghiep} from "@/services/hoc-sinh/log-huong-nghiep";

export default function HuongNghiepLogTab() {
    const {message} = App.useApp();
    const screens = Grid.useBreakpoint();

    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);

    /* ================= FETCH ALL LOG ================= */
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await layDsLogHuongNghiep({page: 1, limit: 100});
            const data = res.data || [];
            setLogs(data);
        } catch (e) {
            message.error("Không lấy được nhật ký hướng nghiệp");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData()
    }, []);

    if (loading) return (
        <div style={{textAlign: 'center', padding: 40}}>
            <Spin size="large"/>
        </div>
    );

    return (
        <Timeline mode={screens.xs ? "left" : "alternate"}>
            {logs.map(item => (
                <Timeline.Item
                    key={item.idHoatDong}
                    label={item.thoiGian || item.tenHoatDong}
                    style={{paddingBottom: 24}}
                >
                    <Card size="small" style={{borderRadius: 8}}>
                        {item.nnQuanTam && <p><b>Nghề nghiệp quan tâm:</b> {item.nnQuanTam}</p>}
                        {item.kyNangHanChe && <p><b>Kỹ năng hạn chế:</b> {item.kyNangHanChe}</p>}
                        {item.mucDoHieuBiet != null && (
                            <p>
                                <b>Mức độ hiểu biết:</b>{" "}
                                <Rate disabled value={item.mucDoHieuBiet}/>
                            </p>
                        )}
                        {item.caiThien && <p><b>Cần cải thiện:</b> {item.caiThien}</p>}
                        {item.nhanXet && <p><b>Nhận xét của giáo viên:</b> {item.nhanXet}</p>}
                    </Card>
                </Timeline.Item>
            ))}
        </Timeline>
    );
}
