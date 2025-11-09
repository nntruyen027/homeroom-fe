'use client';

import {useState} from 'react';
import {Button, Card, DatePicker, Form, Input, message, Progress, Radio, Select, Typography} from 'antd';
import {hollandQuestions} from './questions';
import dayjs from 'dayjs';

const {Title, Text, Paragraph} = Typography;
const {Option} = Select;
const pageSize = 6;

// Bảng mô tả và ngành nghề phù hợp theo nhóm RIASEC
const hollandDescriptions = {
    R: {
        name: 'R - Realistic (Thực tế)',
        description:
            'Nhóm người thích hoạt động thể chất, làm việc với công cụ, máy móc, động cơ, hoặc ngoài trời. Họ thường thích các công việc cụ thể, có quy trình rõ ràng.',
        careers: [
            'Kỹ sư cơ khí, kỹ sư điện, kỹ thuật viên, thợ điện, thợ hàn, công nhân sản xuất, kỹ thuật ô tô, nông nghiệp, kiến trúc sư công trình, nhân viên bảo trì.'
        ]
    },
    I: {
        name: 'I - Investigative (Nghiên cứu)',
        description:
            'Nhóm người thích tìm tòi, khám phá, quan sát, phân tích, và giải quyết vấn đề. Họ thường có tư duy logic và yêu thích khoa học.',
        careers: [
            'Bác sĩ, nhà nghiên cứu, kỹ sư phần mềm, nhà khoa học, nhà phân tích dữ liệu, giảng viên, nhà tâm lý học, chuyên viên thống kê.'
        ]
    },
    A: {
        name: 'A - Artistic (Nghệ thuật)',
        description:
            'Nhóm người sáng tạo, có trí tưởng tượng phong phú, thích thể hiện bản thân qua các hình thức nghệ thuật. Họ không thích bị gò bó bởi quy tắc cứng nhắc.',
        careers: [
            'Nhà thiết kế đồ họa, họa sĩ, nhạc sĩ, diễn viên, đạo diễn, nhà văn, nhà thiết kế thời trang, nhiếp ảnh gia.'
        ]
    },
    S: {
        name: 'S - Social (Xã hội)',
        description:
            'Nhóm người thân thiện, giàu cảm xúc, thích giúp đỡ và dạy dỗ người khác. Họ giỏi giao tiếp và thường có khả năng thấu hiểu cảm xúc.',
        careers: [
            'Giáo viên, nhân viên xã hội, tư vấn tâm lý, y tá, bác sĩ, hướng dẫn viên du lịch, huấn luyện viên, chuyên viên nhân sự.'
        ]
    },
    E: {
        name: 'E - Enterprising (Quản lý, kinh doanh)',
        description:
            'Nhóm người có khả năng lãnh đạo, thuyết phục, và thích ra quyết định. Họ thường tự tin, năng động, và hướng đến thành công.',
        careers: [
            'Doanh nhân, quản lý, nhân viên kinh doanh, luật sư, nhân viên marketing, giám đốc, nhà chính trị, người sáng lập startup.'
        ]
    },
    C: {
        name: 'C - Conventional (Công vụ, hành chính)',
        description:
            'Nhóm người cẩn thận, chu đáo, thích công việc có tổ chức và theo quy trình. Họ thường giỏi về quản lý dữ liệu, tài liệu và hành chính.',
        careers: [
            'Kế toán, nhân viên hành chính, thư ký, nhân viên ngân hàng, chuyên viên tài chính, thống kê viên, quản lý văn phòng.'
        ]
    }
};

export default function HollandSurvey() {
    const [step, setStep] = useState('info'); // 'info' | 'survey' | 'result'
    const [userInfo, setUserInfo] = useState({
        fullName: '',
        className: '',
        dob: null,
        laNam: null,
        soThich: '',
        monHocYeuThich: '',
        diemManh: '',
        diemYeu: '',
        ngheNghiepMongMuon: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [form] = Form.useForm();

    const totalPages = Math.ceil(hollandQuestions.length / pageSize);

    const startSurvey = async () => {
        try {
            await form.validateFields();
            setStep('survey');
        } catch {
            message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        }
    };

    const goBackToInfo = () => setStep('info');

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({...prev, [questionId]: value}));
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleSubmit = async () => {
        const scores = {R: 0, I: 0, A: 0, S: 0, E: 0, C: 0};
        hollandQuestions.forEach(q => {
            const val = answers[q.id] || 0;
            scores[q.type] += val;
        });

        const maxScore = Math.max(...Object.values(scores));
        const mainTypes = Object.entries(scores)
            .filter(([_, score]) => score === maxScore)
            .map(([type]) => type);

        const resultData = {scores, mainTypes};
        setResult(resultData);
        setStep('result');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BE}/students`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    hoTen: userInfo.fullName,
                    lop: userInfo.className,
                    ngaySinh: dayjs(userInfo.dob).format('DD/MM/YYYY'),
                    laNam: userInfo.laNam,
                    soThich: userInfo.soThich,
                    monHocYeuThich: userInfo.monHocYeuThich,
                    diemManh: userInfo.diemManh,
                    diemYeu: userInfo.diemYeu,
                    ngheNghiepMongMuon: userInfo.ngheNghiepMongMuon,
                    realisticScore: scores.R,
                    investigativeScore: scores.I,
                    artisticScore: scores.A,
                    socialScore: scores.S,
                    enterprisingScore: scores.E,
                    conventionalScore: scores.C,
                    assessmentResult: mainTypes.join(', ')
                })
            });
            if (!res.ok) throw new Error('Lưu dữ liệu thất bại');
            message.success('Dữ liệu đã được lưu thành công!');
        } catch {
            message.error('Không thể gửi dữ liệu lên server');
        }
    };

    const startIndex = (currentPage - 1) * pageSize;
    const currentQuestions = hollandQuestions.slice(startIndex, startIndex + pageSize);
    const progressPercent = Math.round((Object.keys(answers).length / hollandQuestions.length) * 100);

    return (
        <div style={{maxWidth: 800, margin: '50px auto', overflowX: 'hidden'}}>
            <Title level={3} style={{textAlign: 'center'}}>
                Sổ tay chủ nhiệm điện tử - Khảo sát Holland
            </Title>

            {/* Step 1 - Thông tin cá nhân */}
            {step === 'info' && (
                <Card style={{padding: 24}}>
                    <Form layout="vertical" form={form}>
                        <Form.Item label="Họ và tên" name="fullName" rules={[{required: true}]}>
                            <Input onChange={e => setUserInfo(prev => ({...prev, fullName: e.target.value}))}/>
                        </Form.Item>
                        <Form.Item label="Lớp" name="className" rules={[{required: true}]}>
                            <Input onChange={e => setUserInfo(prev => ({...prev, className: e.target.value}))}/>
                        </Form.Item>
                        <Form.Item label="Ngày sinh" name="dob" rules={[{required: true}]}>
                            <DatePicker
                                style={{width: '100%'}}
                                format="DD/MM/YYYY"
                                onChange={date => setUserInfo(prev => ({...prev, dob: date ? date.toDate() : null}))}
                            />
                        </Form.Item>
                        <Form.Item label="Giới tính" name="laNam" rules={[{required: true}]}>
                            <Select onChange={val => setUserInfo(prev => ({...prev, laNam: val}))}>
                                <Option value={true}>Nam</Option>
                                <Option value={false}>Nữ</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="Sở thích" name="soThich" rules={[{required: true}]}>
                            <Input onChange={e => setUserInfo(prev => ({...prev, soThich: e.target.value}))}/>
                        </Form.Item>
                        <Form.Item label="Môn học yêu thích" name="monHocYeuThich" rules={[{required: true}]}>
                            <Input onChange={e => setUserInfo(prev => ({...prev, monHocYeuThich: e.target.value}))}/>
                        </Form.Item>
                        <Form.Item label="Điểm mạnh" name="diemManh" rules={[{required: true}]}>
                            <Input onChange={e => setUserInfo(prev => ({...prev, diemManh: e.target.value}))}/>
                        </Form.Item>
                        <Form.Item label="Điểm yếu" name="diemYeu" rules={[{required: true}]}>
                            <Input onChange={e => setUserInfo(prev => ({...prev, diemYeu: e.target.value}))}/>
                        </Form.Item>
                        <Form.Item label="Nghề nghiệp mong muốn" name="ngheNghiepMongMuon" rules={[{required: true}]}>
                            <Input
                                onChange={e => setUserInfo(prev => ({...prev, ngheNghiepMongMuon: e.target.value}))}/>
                        </Form.Item>

                        <Button type="primary" block onClick={startSurvey}>
                            Bắt đầu khảo sát
                        </Button>
                    </Form>
                </Card>
            )}

            {/* Step 2 - Câu hỏi */}
            {step === 'survey' && (
                <>
                    <Progress percent={progressPercent} status="active" style={{marginBottom: 20}}/>
                    {currentQuestions.map(q => (
                        <Card key={q.id} style={{marginBottom: 16}}>
                            <Text strong>
                                {q.id}. {q.text}
                            </Text>
                            <div style={{marginTop: 20, display: 'flex', justifyContent: 'space-around'}}>
                                <Radio.Group
                                    value={answers[q.id]}
                                    onChange={e => handleAnswerChange(q.id, e.target.value)}
                                >
                                    <Radio value={0}>Không phù hợp</Radio>
                                    <Radio value={1}>Bình thường</Radio>
                                    <Radio value={2}>Rất phù hợp</Radio>
                                </Radio.Group>
                            </div>
                        </Card>
                    ))}

                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 20}}>
                        {currentPage === 1 ? (
                            <Button onClick={goBackToInfo}>Quay lại thông tin</Button>
                        ) : (
                            <Button onClick={handlePrev}>Trở lại</Button>
                        )}
                        {currentPage < totalPages ? (
                            <Button type="primary" onClick={handleNext}>
                                Tiếp tục
                            </Button>
                        ) : (
                            <Button type="primary" onClick={handleSubmit}>
                                Hoàn tất khảo sát
                            </Button>
                        )}
                    </div>
                </>
            )}

            {/* Step 3 - Kết quả */}
            {step === 'result' && result && (
                <Card title="Kết quả trắc nghiệm Holland" style={{marginTop: 30}}>
                    <Text strong>Nhóm nổi bật: {result.mainTypes.join(', ')}</Text>
                    <div style={{marginTop: 10}}>
                        {Object.entries(result.scores).map(([type, score]) => (
                            <p key={type}>
                                <strong>{type}</strong>: {score}
                            </p>
                        ))}
                    </div>

                    <Title level={4}>Phân tích & Gợi ý nghề nghiệp</Title>
                    {result.mainTypes.map(type => {
                        const info = hollandDescriptions[type];
                        return (
                            <div key={type} style={{marginTop: 20}}>
                                <Paragraph>
                                    <strong>{info.name}</strong><br/>
                                    {info.description}
                                </Paragraph>
                                <Paragraph>
                                    <strong>Ngành nghề phù hợp:</strong> {info.careers.join(', ')}
                                </Paragraph>
                            </div>
                        );
                    })}

                    <div style={{textAlign: 'center', marginTop: 30}}>
                        <Button onClick={() => setStep('info')} style={{marginRight: 8}}>
                            Làm lại khảo sát
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
