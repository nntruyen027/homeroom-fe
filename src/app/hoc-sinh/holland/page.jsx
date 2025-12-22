'use client';

import {useEffect, useRef, useState} from "react";
import {Button, Card, Col, Modal, Progress, Row, Typography} from "antd";
import {lamBaiHolland} from "@/services/hoc-sinh/holland";
import questions from "./cau-hoi.json";
import {useRouter} from "next/navigation";

const {Title, Text} = Typography;

export default function HollandTestPage() {
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 phút
    const [ketQua, setKetQua] = useState(null);
    const [loading, setLoading] = useState(false);
    const [started, setStarted] = useState(false);
    const [showStartModal, setShowStartModal] = useState(true);
    const [showResultModal, setShowResultModal] = useState(false);

    const questionRefs = useRef({});
    const router = useRouter();
    const timerRef = useRef(null);

    // Đồng hồ đếm ngược
    useEffect(() => {
        if (!started || ketQua) return;
        timerRef.current = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(timerRef.current);
                    handleSubmit();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [started, ketQua]);

    const handleSelect = (qid, val) => {
        setAnswers((prev) => ({...prev, [qid]: val}));
    };

    const handleSubmit = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const diem = {diemR: 0, diemI: 0, diemA: 0, diemS: 0, diemE: 0, diemC: 0};
            questions.forEach((q) => {
                const val = answers[q.id] ?? 0;
                diem[`diem${q.type}`] += val;
            });
            diem.thoiGianLam = 60 * 60 - timeLeft;

            const res = await lamBaiHolland(diem);
            setKetQua(res);
            setShowResultModal(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const scrollToQuestion = (qid) => {
        questionRefs.current[qid]?.scrollIntoView({behavior: "smooth", block: "center"});
    };

    const answeredCount = Object.keys(answers).length;
    const totalQuestions = questions.length;

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60).toString().padStart(2, "0");
        const s = (sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const startTest = () => {
        setShowStartModal(false);
        setStarted(true);
    };

    const restartTest = () => {
        setAnswers({});
        setTimeLeft(60 * 60);
        setKetQua(null);
        setStarted(false);
        setShowResultModal(false);
        setShowStartModal(true);
    };

    return (
        <div style={{padding: 16}}>
            {/* Modal bắt đầu */}
            <Modal
                open={showStartModal}
                title="Bắt đầu bài Holland"
                footer={[
                    <Button key="start" type="primary" onClick={startTest}>Bắt đầu</Button>,
                    <Button key="back" onClick={() => router.back()}>Trở lại</Button>
                ]}
                closable={false}
            >
                <p>Bạn có 60 phút để hoàn thành bài trắc nghiệm.</p>
            </Modal>

            {/* Modal kết quả */}
            <Modal
                open={showResultModal}
                title="Kết quả Holland"
                footer={[
                    <Button key="restart" type="primary" onClick={restartTest}>Bắt đầu lại</Button>,
                    <Button key="close" onClick={() => setShowResultModal(false)}>Đóng</Button>
                ]}
                onCancel={() => setShowResultModal(false)}
                width={600}
            >
                {ketQua ? (
                    <div style={{display: "flex", flexDirection: "column", gap: 16}}>
                        <Text><b>Học sinh:</b> {ketQua.hoTen}</Text>
                        <Text><b>Mã Holland:</b> {ketQua.maHolland}</Text>
                        <Text><b>Thời gian làm bài:</b> {ketQua.thoiGianLam} giây</Text>

                        {['R', 'I', 'A', 'S', 'E', 'C'].map((type) => (
                            <div key={type}>
                                <Text strong>{type}</Text>
                                <Progress
                                    percent={Math.min(ketQua[`diem${type}`] * 20, 100)}
                                    status="active"
                                    strokeColor="#1890ff"
                                    showInfo
                                />
                            </div>
                        ))}
                    </div>
                ) : <p>Đang tải kết quả...</p>}
            </Modal>

            <Row gutter={16}>
                {/* Sidebar hiển thị trên mobile */}
                <Col xs={24} md={6} style={{order: 0}}>
                    <div style={{
                        position: "sticky",
                        left: 0,
                        top: 100,
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                        marginBottom: 16
                    }}>
                        <Card style={{textAlign: "center"}}>
                            <Title level={5}>Thời gian còn lại</Title>
                            <Text style={{fontSize: 24, fontWeight: "bold"}}>{formatTime(timeLeft)}</Text>
                        </Card>

                        <Progress
                            percent={(answeredCount / totalQuestions) * 100}
                            status={answeredCount === totalQuestions ? "success" : "active"}
                            format={() => `${answeredCount} / ${totalQuestions} câu`}
                        />

                        <Card style={{maxHeight: "60vh", overflowY: "auto"}}>
                            <Title level={5}>Trạng thái câu hỏi</Title>
                            <div style={{display: "flex", flexWrap: "wrap", gap: 4}}>
                                {questions.map((q) => (
                                    <div
                                        key={q.id}
                                        onClick={() => scrollToQuestion(q.id)}
                                        style={{
                                            width: 32,
                                            height: 32,
                                            lineHeight: "32px",
                                            textAlign: "center",
                                            borderRadius: 4,
                                            cursor: "pointer",
                                            backgroundColor: answers[q.id] !== undefined ? "#52c41a" : "#fff",
                                            border: "1px solid #ccc",
                                        }}
                                    >
                                        {q.id}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </Col>

                {/* Câu hỏi */}
                <Col xs={24} md={18} style={{order: 1}}>
                    {questions.map((q, index) => (
                        <Card
                            key={q.id}
                            ref={(el) => (questionRefs.current[q.id] = el)}
                            style={{
                                marginBottom: 16,
                                backgroundColor: answers[q.id] !== undefined ? "#f0fff0" : "#fff",
                            }}
                        >
                            <Title level={5}>{index + 1}. {q.text}</Title>
                            <div style={{display: "flex", gap: 8, flexWrap: "wrap"}}>
                                {[0, 1, 2, 3, 4, 5].map((val) => (
                                    <Button
                                        key={val}
                                        type={answers[q.id] === val ? "primary" : "default"}
                                        onClick={() => handleSelect(q.id, val)}
                                    >
                                        {val}
                                    </Button>
                                ))}
                            </div>
                        </Card>
                    ))}

                    <Button type="primary" onClick={handleSubmit} loading={loading} block>
                        Hoàn thành bài
                    </Button>
                </Col>
            </Row>
        </div>
    );
}
