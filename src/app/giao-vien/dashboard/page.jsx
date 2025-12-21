'use client';

import {Card, Col, Row, Statistic} from "antd";
import {useEffect, useState} from "react";
import {layStatisticGiaoVien} from "@/services/auth";

export default function Page() {
    const [data, setData] = useState();

    useEffect(() => {
        const fetchStatistic = async () => {
            try {
                const res = await layStatisticGiaoVien();
                setData(res); // ok, React sẽ schedule render
            } catch (err) {
                console.error(err);
            }
        };

        fetchStatistic();
    }, []); // gọi 1 lần sau mount

    // nếu muốn log khi data thay đổi
    useEffect(() => {
        if (data) console.log("Statistic:", data);
    }, [data]);

    return (
        <Row gutter={20}>
            <Col span={6}>
                <Card>
                    <Statistic
                        title="Tuần học hiện tại"
                        precision={0}
                        value={data?.tuanHocHienTai || 0}
                    />
                </Card>

            </Col>
            <Col span={6}>
                <Card>
                    <Statistic
                        title="Số hoạt động hướng nghiệp"
                        precision={0}
                        value={data?.tongSoHdhn || 0}
                    />
                </Card>

            </Col>
            <Col span={6}>
                <Card>
                    <Statistic
                        title="Số học sinh"
                        precision={0}
                        value={data?.tongSoHsCn || 0}
                    />
                </Card>

            </Col>
            <Col span={6}>
                <Card>
                    <Statistic
                        title="Số lớp"
                        precision={0}
                        value={data?.tongSoLopCn || 0}
                    />
                </Card>

            </Col>

        </Row>
    );
}
