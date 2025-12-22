'use client';

import {useEffect, useState} from "react";
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {layLichSuLamBai} from "@/services/hoc-sinh/holland";
import {Card, Col, Divider, Grid, Row, Statistic} from "antd";
import hollandTypes from './y-nghia.json';

export default function HollandTab() {
    const [data, setData] = useState([]);
    const screens = Grid.useBreakpoint();

    useEffect(() => {
        async function fetchData() {
            try {
                const raw = await layLichSuLamBai();
                const formatted = raw.map(item => ({
                    ngay: new Date(item.ngayDanhGia).toLocaleDateString(),
                    R: item.diemR,
                    I: item.diemI,
                    A: item.diemA,
                    S: item.diemS,
                    E: item.diemE,
                    C: item.diemC,
                    maHolland: item.maHolland,
                }));
                setData(formatted);
            } catch (err) {
                console.error(err);
            }
        }

        fetchData();
    }, []);

    const stats = [
        {key: "A", color: "#73d13d"},
        {key: "C", color: "#13c2c2"},
        {key: "E", color: "#9254de"},
        {key: "I", color: "#40a9ff"},
        {key: "R", color: "#ff4d4f"},
        {key: "S", color: "#ffa940"},
    ];

    return (
        <div style={{width: "100%"}} className="flex flex-col gap-5">
            {/* ===== Holland Code & Description ===== */}
            <div className='text-center px-4'>
                <div
                    className='font-extrabold mb-4'
                    style={{fontSize: screens.xs ? 36 : 64, color: "#fa8c16", textShadow: "1px 1px 2px #ccc"}}
                >
                    {data?.[0]?.maHolland || "--"}
                </div>
                <div className='w-full text-center' style={{padding: screens.xs ? "0 8px" : "0 40px"}}>
                    {data?.[0]?.maHolland?.split('').map(key =>
                        hollandTypes.find(h => h.key === key)
                    ).map((g, i) => (
                        <span key={i}
                              style={{display: "inline-block", margin: "0 4px", fontSize: screens.xs ? 12 : 14}}>
                            {g?.description}
                        </span>
                    ))}
                </div>
            </div>

            <Divider/>

            {/* ===== Stats Cards ===== */}
            <Row gutter={[16, 16]} justify="center">
                {stats.map((item) => (
                    <Col
                        key={item.key}
                        xs={12} sm={8} md={4}
                    >
                        <Card
                            style={{
                                background: item.color,
                                textAlign: "center",
                                borderRadius: 8
                            }}
                        >
                            <Statistic
                                title={<span style={{
                                    fontSize: screens.xs ? 16 : 20,
                                    fontWeight: 700,
                                    color: "#fff"
                                }}>{item.key}</span>}
                                value={data?.[0]?.[item.key] ?? 0}
                                precision={0}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Divider/>

            {/* ===== Line Chart ===== */}
            <div style={{width: "100%", height: screens.xs ? 300 : 400}}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="ngay" minTickGap={10}/>
                        <YAxis/>
                        <Tooltip/>
                        <Legend/>
                        <Line type="monotone" dataKey="R" stroke="#ff4d4f"/>
                        <Line type="monotone" dataKey="I" stroke="#40a9ff"/>
                        <Line type="monotone" dataKey="A" stroke="#73d13d"/>
                        <Line type="monotone" dataKey="S" stroke="#ffa940"/>
                        <Line type="monotone" dataKey="E" stroke="#9254de"/>
                        <Line type="monotone" dataKey="C" stroke="#13c2c2"/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
