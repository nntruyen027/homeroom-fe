'use client'

import {useEffect, useState} from 'react'
import {Card, Col, Row, Spin, Typography} from 'antd'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts'
import {hollandCareers} from './data'

const {Title} = Typography

const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
    '#9B59B6', '#E74C3C', '#2ECC71', '#3498DB',
    '#F1C40F', '#E67E22', '#1ABC9C', '#9B59B6',
    '#34495E', '#95A5A6', '#D35400', '#7F8C8D',
    '#BDC3C7', '#16A085'
]

const hollandMapping = {
    1: ['realistic', 'investigative'],
    2: ['realistic'],
    3: ['artistic'],
    4: ['artistic', 'social'],
    5: ['social'],
    6: ['enterprising'],
    7: ['conventional', 'enterprising'],
    8: ['enterprising', 'conventional'],
    9: ['conventional', 'social'],
    10: ['investigative'],
    11: ['realistic', 'investigative'],
    12: ['social'],
    13: ['social', 'enterprising'],
    14: ['artistic', 'investigative'],
    15: ['realistic'],
    16: ['enterprising', 'artistic'],
    17: ['social', 'artistic'],
    18: ['realistic', 'conventional']
}

const studentKeyMap = {
    realistic: 'realisticScore',
    investigative: 'investigativeScore',
    artistic: 'artisticScore',
    social: 'socialScore',
    enterprising: 'enterprisingScore',
    conventional: 'conventionalScore'
}

export default function ThongKePage() {
    const [chartData, setChartData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fake dữ liệu học sinh
                const students = Array.from({length: 35}, (_, i) => ({
                    realisticScore: Math.floor(Math.random() * 10),
                    investigativeScore: Math.floor(Math.random() * 10),
                    artisticScore: Math.floor(Math.random() * 10),
                    socialScore: Math.floor(Math.random() * 10),
                    enterprisingScore: Math.floor(Math.random() * 10),
                    conventionalScore: Math.floor(Math.random() * 10),
                }))

                // Tính tổng điểm cho từng nhóm nghề
                const data = hollandCareers.map((career) => {
                    const keys = hollandMapping[career.id] || []
                    if (keys.length === 0) return {name: career.name, value: 0}

                    let total = 0
                    students.forEach(student => {
                        total += keys.reduce((acc, key) => acc + (student[studentKeyMap[key]] || 0), 0)
                    })
                    return {name: career.name, value: total}
                })

                setChartData(data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Fake Pie chart cố định 60%, 25%, 15%
    const pieData = [
        {name: 'Công nghệ', value: 60},
        {name: 'Sáng tạo nội dung', value: 25},
        {name: 'Ngành nghề khác', value: 15},
    ]

    return (
        <div className="p-10 min-h-screen bg-gray-50">
            <Title level={2} style={{textAlign: 'center', marginBottom: 40}}>
                Thống kê kết quả khảo sát Holland theo 18 nhóm nghề
            </Title>

            <Row gutter={[32, 32]} justify="center">
                {/* Pie chart */}
                <Col xs={24} md={12}>
                    <Card bordered={false} style={{borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}}>
                        <Title level={4} style={{textAlign: 'center', marginBottom: 16}}>Biểu đồ tròn (%)</Title>
                        {loading ? (
                            <div style={{textAlign: 'center'}}><Spin/></div>
                        ) : (
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={150}
                                        dataKey="value"
                                        label={({name, value}) => `${name} (${value}%)`}
                                    >
                                        {pieData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value}%`}/>
                                    <Legend/>
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Col>

                {/* Bar chart */}
                <Col xs={24} md={12}>
                    <Card bordered={false} style={{borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}}>
                        <Title level={4} style={{textAlign: 'center', marginBottom: 16}}>Biểu đồ cột (Tổng điểm)</Title>
                        {loading ? (
                            <div style={{textAlign: 'center'}}><Spin/></div>
                        ) : (
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis
                                        dataKey="name"
                                        tick={{fontSize: 12}}
                                        interval={0}
                                        angle={-35}
                                        textAnchor="end"
                                        height={100}
                                    />
                                    <YAxis/>
                                    <Tooltip/>
                                    <Bar dataKey="value">
                                        {chartData.map((_, index) => (
                                            <Cell key={`cell-bar-${index}`} fill={COLORS[index % COLORS.length]}/>
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    )
}
