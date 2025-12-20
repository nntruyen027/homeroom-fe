'use client';

import {useEffect, useState} from "react";
import {App, Card, Input, Rate, Spin, Timeline} from "antd";
import {layDsLogHuongNghiep} from "@/services/hoc-sinh/log-huong-nghiep";

const {TextArea} = Input;

export default function HuongNghiepLogTab() {
    const {message} = App.useApp();

    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);

    /* ================= FETCH ALL LOG ================= */
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await layDsLogHuongNghiep(
                {page: 1, limit: 100}
            );

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
    }, [])

    if (loading) return <Spin/>;


    return (
        <Timeline mode="alternate">
            {logs.map(item => {

                return (
                    <Timeline.Item
                        key={item.idHoatDong}
                        label={item.thoiGian || item.tenHoatDong}
                    >
                        <Card size="small">
                            
                            <p><b>Nghề nghiệp quan tâm:</b> {item.nnQuanTam}</p>
                            <p><b>Kỹ năng hạn chế:</b> {item.kyNangHanChe}</p>

                            <p>
                                <b>Mức độ hiểu biết:</b>{" "}
                                <Rate disabled value={item.mucDoHieuBiet}/>
                            </p>

                            <p><b>Cần cải thiện:</b> {item.caiThien}</p>

                            <p><b>Nhận xét của giáo viên:</b> {item.nhanXet}</p>
                        </Card>
                    </Timeline.Item>
                );
            })}
        </Timeline>
    );
}
