'use client';

import {useEffect, useState} from "react";
import {App, Button, Card, Input, Rate, Spin, Tag, Timeline} from "antd";
import {layDsLogHuongNghiep, nhanXetLog} from "@/services/giao-vien/log-huong-nghiep";

const {TextArea} = Input;

export default function HuongNghiepLogTab({hocSinhId}) {
    const {message} = App.useApp();

    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);

    // nhận xét theo từng hoạt động
    const [nhanXetMap, setNhanXetMap] = useState({});

    /* ================= FETCH ALL LOG ================= */
    const fetchData = async () => {
        if (!hocSinhId) return;

        setLoading(true);
        try {
            const res = await layDsLogHuongNghiep(
                hocSinhId,
                {page: 1, limit: 100}
            );

            const data = res.data || [];
            setLogs(data);

            // init nhận xét
            const init = {};
            data.forEach(item => {
                init[item.idHoatDong] = item.nhanXet || "";
            });
            setNhanXetMap(init);

        } catch (e) {
            message.error("Không lấy được nhật ký hướng nghiệp");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [hocSinhId]);

    /* ================= SUBMIT NHẬN XÉT ================= */
    const handleNhanXet = async (item) => {
        try {
            await nhanXetLog(
                hocSinhId,
                item.idHoatDong,
                {nhanXet: nhanXetMap[item.idHoatDong]}
            );
            message.success("Đã lưu nhận xét");
        } catch {
            message.error("Lưu nhận xét thất bại");
        }
    };

    if (loading) return <Spin/>;


    return (
        <Timeline mode="alternate">
            {logs.map(item => {
                const daNhanXet = !!item.nhanXet;

                return (
                    <Timeline.Item
                        key={item.idHoatDong}
                        color={daNhanXet ? "green" : "blue"}
                        label={item.thoiGian || item.tenHoatDong}
                    >
                        <Card size="small">
                            <div style={{marginBottom: 8}}>
                                <b>{item.tenHoatDong}</b>{" "}
                                {daNhanXet
                                    ? <Tag color="green">Đã nhận xét</Tag>
                                    : <Tag color="orange">Chưa nhận xét</Tag>
                                }
                            </div>

                            <p><b>Nghề nghiệp quan tâm:</b> {item.nnQuanTam}</p>
                            <p><b>Kỹ năng hạn chế:</b> {item.kyNangHanChe}</p>

                            <p>
                                <b>Mức độ hiểu biết:</b>{" "}
                                <Rate disabled value={item.mucDoHieuBiet}/>
                            </p>

                            <p><b>Cần cải thiện:</b> {item.caiThien}</p>

                            <TextArea
                                rows={3}
                                placeholder="Nhập nhận xét của giáo viên"
                                value={nhanXetMap[item.idHoatDong]}
                                onChange={e =>
                                    setNhanXetMap(prev => ({
                                        ...prev,
                                        [item.idHoatDong]: e.target.value
                                    }))
                                }
                            />

                            <div style={{textAlign: "right", marginTop: 8}}>
                                <Button
                                    type="primary"
                                    onClick={() => handleNhanXet(item)}
                                >
                                    Lưu nhận xét
                                </Button>
                            </div>
                        </Card>
                    </Timeline.Item>
                );
            })}
        </Timeline>
    );
}
