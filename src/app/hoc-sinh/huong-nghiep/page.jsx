'use client';

import {useEffect, useState} from "react";
import {App, Button, Dropdown, Form, Input, Modal, Rate, Table} from "antd";
import {layDsHoatDong} from "@/services/hoc-sinh/hoat-dong-huong-nghiep";
import {useDebounce} from "@/hook/data";
import {EllipsisOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {layLogHuongNghiepTheoHd, vietLog} from "@/services/hoc-sinh/log-huong-nghiep";

export default function Page() {
    const {message} = App.useApp()
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({current: 1, pageSize: 10, total: 0});
    const [modalVisible, setModalVisible] = useState(false);
    const [editingHoatDong, setEditingHoatDong] = useState(null);
    const [searchText, setSearchText] = useState("");
    const debouncedSearch = useDebounce(searchText, 400);
    const [form] = Form.useForm();

    const columns = [
        {
            title: "#",
            key: "stt",
            width: 60,
            align: "right",
            render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1
        },
        {title: "Tên hoạt động", dataIndex: "tenHoatDong", key: "tenHoatDong", responsive: ['sm']},
        {title: "Ghi chú", dataIndex: "ghiChu", key: "ghiChu", responsive: ['md']},
        {
            title: "Thời gian bắt đầu",
            dataIndex: "thoiGianBatDau",
            key: "thoiGianBatDau",
            render: value => dayjs(value).format("DD/MM/YYYY"),
            responsive: ['lg']
        },
        {
            title: "Thời gian kết thúc",
            dataIndex: "thoiGianKetThuc",
            key: "thoiGianKetThuc",
            render: value => dayjs(value).format("DD/MM/YYYY"),
            responsive: ['lg']
        },
        {
            title: "Thao tác",
            key: "thaoTac",
            render: (_, record) => {
                const items = [
                    {key: "sua", label: "Viết nhật ký", onClick: () => handleEdit(record)}
                ];
                return (
                    <Dropdown menu={{items}} trigger={['click']}>
                        <Button type="text" icon={<EllipsisOutlined/>}/>
                    </Dropdown>
                )
            }
        }
    ];

    const fetchData = async (page = 1, pageSize = 10, search = "") => {
        setLoading(true);
        try {
            const res = await layDsHoatDong({page, limit: pageSize, search});
            setData(res.data || []);
            setPagination({current: res.page || page, pageSize: res.size || pageSize, total: res.totalElements || 0});
        } catch (e) {
            message.error(e.message || "Lỗi khi tải danh sách hoạt động");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (record) => {
        setEditingHoatDong(record.id);
        const log = await layLogHuongNghiepTheoHd(record.id);
        form.setFieldsValue(log);
        setModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            await vietLog(editingHoatDong, values);
            message.success("Lưu thành công");
            setModalVisible(false);
            form.resetFields();
            setEditingHoatDong(null);
            fetchData(pagination.current, pagination.pageSize);
        } catch (e) {
            message.error(e.message || "Lỗi");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    useEffect(() => {
        fetchData(1, pagination.pageSize, debouncedSearch);
    }, [debouncedSearch]);

    return (
        <div style={{padding: 16}}>
            <div style={{marginBottom: 16, display: "flex", flexDirection: "column", gap: 8}}>
                <Input.Search
                    placeholder="Tìm kiếm hoạt động..."
                    allowClear
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{width: "100%", maxWidth: 400}}
                />
            </div>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={pagination}
                onChange={(pag) => fetchData(pag.current, pag.pageSize)}
                scroll={{x: 700}} // cho table cuộn ngang khi màn hình nhỏ
            />

            <Modal
                title="Nhật ký"
                open={modalVisible}
                onOk={handleOk}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingHoatDong(null);
                }}
                width="90%" // responsive modal
                style={{maxWidth: 600}}
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="Nghề nghiệp quan tâm" name="nnQuanTam"
                               rules={[{required: true, message: 'Nhập nghề nghiệp quan tâm'}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item label="Mức độ hiểu biết" name="mucDoHieuBiet"
                               rules={[{required: true, message: 'Nhập mức độ hiểu biết'}]}>
                        <Rate/>
                    </Form.Item>
                    <Form.Item label="Kỹ năng hạn chế" name="kyNangHanChe"
                               rules={[{required: true, message: 'Nhập kỹ năng hạn chế'}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item label="Cải thiện" name="caiThien" rules={[{required: true, message: 'Nhập cải thiện'}]}>
                        <Input/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
