'use client';

import {useEffect, useState} from "react";
import {App, Button, DatePicker, Dropdown, Form, Input, InputNumber, Modal, Select, Table} from "antd";
import {EllipsisOutlined} from "@ant-design/icons";
import {useDebounce} from "@/hook/data";
import {layDsCauHinh, suaCauHinh, themCauHinh} from "@/services/quan-tri-vien/cau-hinh";
import dayjs from "dayjs";

const KIEU_DU_LIEU = [
    {id: 7, value: 'BOOLEAN'},
    {id: 1, value: 'VARCHAR'},
    {id: 6, value: 'TEXT'},
    {id: 2, value: 'INTEGER'},
    {id: 3, value: 'BIGINT'},
    {id: 4, value: 'TIMESTAMP'},
    {id: 5, value: 'DATE'},
];

export default function Page() {

    // -----------------------------
    // STATE
    // -----------------------------
    const {message} = App.useApp();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({current: 1, pageSize: 10, total: 0});

    const [modalVisible, setModalVisible] = useState(false);
    const [editingThamSo, setEditingThamSo] = useState(null);
    const [kieuDuLieuSelected, setKieuDuLieuSelected] = useState(null);

    const [searchText, setSearchText] = useState("");
    const debouncedSearch = useDebounce(searchText, 400);
    const [form] = Form.useForm();

    // -----------------------------
    // FETCH DATA
    // -----------------------------
    const fetchData = async (page = 1, pageSize = 10, search = "") => {
        setLoading(true);
        try {
            const res = await layDsCauHinh({page, limit: pageSize, search});
            setData(res.data || []);
            setPagination({
                current: res.page || page,
                pageSize: res.size || pageSize,
                total: res.totalElements || 0,
            });
        } catch (e) {
            message.error(e.message || "Lỗi khi tải danh sách tham số");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1, pagination.pageSize, debouncedSearch);
    }, [debouncedSearch]);

    useEffect(() => {
        fetchData();
    }, []);

    // -----------------------------
    // SUBMIT
    // -----------------------------
    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            // Format DATE / TIMESTAMP
            if (values.kieuDuLieu === "DATE") {
                values.giaTri = values.giaTri.format("YYYY-MM-DD");
            }
            if (values.kieuDuLieu === "TIMESTAMP") {
                values.giaTri = values.giaTri.format("YYYY-MM-DD HH:mm:ss");
            }

            if (editingThamSo) {
                await suaCauHinh(values);
                message.success("Cập nhật thành công");
            } else {
                await themCauHinh(values);
                message.success("Thêm tham số thành công");
            }

            setModalVisible(false);
            setEditingThamSo(null);
            setKieuDuLieuSelected(null);
            form.resetFields();
            fetchData(pagination.current, pagination.pageSize, debouncedSearch);

        } catch (e) {
            message.error(e.message || "Lỗi");
        }
    };

    const handleEdit = (record) => {
        setEditingThamSo(record);
        setKieuDuLieuSelected(record.kieuDuLieu);

        let giaTri = record.giaTri;
        if (record.kieuDuLieu === "DATE") {
            giaTri = dayjs(record.giaTri);
        }
        if (record.kieuDuLieu === "TIMESTAMP") {
            giaTri = dayjs(record.giaTri);
        }

        form.setFieldsValue({...record, giaTri});
        setModalVisible(true);
    };

    // -----------------------------
    // TABLE
    // -----------------------------
    const columns = [
        {
            title: "#",
            width: 80,
            align: "right",
            render: (_, __, index) =>
                (pagination.current - 1) * pagination.pageSize + index + 1
        },
        {title: "Khóa", dataIndex: "khoa"},
        {title: "Kiểu dữ liệu", dataIndex: "kieuDuLieu"},
        {title: "Giá trị", dataIndex: "giaTri"},
        {
            title: "Thao tác",
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            {
                                key: "sua",
                                label: "Cập nhật",
                                onClick: () => handleEdit(record),
                            },
                        ],
                    }}
                >
                    <Button type="text" icon={<EllipsisOutlined/>}/>
                </Dropdown>
            ),
        },
    ];

    // -----------------------------
    // INPUT GIA TRI
    // -----------------------------
    const renderGiaTriInput = () => {
        switch (kieuDuLieuSelected) {
            case "BOOLEAN":
                return (
                    <Select placeholder="Chọn giá trị">
                        <Select.Option value="true">True</Select.Option>
                        <Select.Option value="false">False</Select.Option>
                    </Select>
                );
            case "INTEGER":
            case "BIGINT":
                return <InputNumber style={{width: "100%"}}/>;
            case "DATE":
                return <DatePicker style={{width: "100%"}} format="YYYY-MM-DD"/>;
            case "TIMESTAMP":
                return <DatePicker showTime style={{width: "100%"}} format="YYYY-MM-DD HH:mm:ss"/>;
            case "TEXT":
                return <Input.TextArea rows={4}/>;
            default:
                return <Input/>;
        }
    };

    // -----------------------------
    // RENDER
    // -----------------------------
    return (
        <div style={{padding: 16}}>
            <div style={{marginBottom: 16, display: "flex", justifyContent: "space-between"}}>
                <Input.Search
                    placeholder="Tìm tham số..."
                    allowClear
                    style={{width: 300}}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <Button
                    type="primary"
                    onClick={() => {
                        setModalVisible(true);
                        setEditingThamSo(null);
                        setKieuDuLieuSelected(null);
                        form.resetFields();
                    }}
                >
                    Thêm tham số
                </Button>
            </div>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={pagination}
                onChange={(pag) => fetchData(pag.current, pag.pageSize, debouncedSearch)}
            />

            <Modal
                title={editingThamSo ? "Sửa tham số" : "Thêm tham số"}
                open={modalVisible}
                onOk={handleOk}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingThamSo(null);
                    setKieuDuLieuSelected(null);
                    form.resetFields();
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Khóa"
                        name="khoa"
                        rules={[{required: true, message: "Vui lòng nhập khóa"}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="Kiểu dữ liệu"
                        name="kieuDuLieu"
                        rules={[{required: true, message: "Vui lòng chọn kiểu dữ liệu"}]}
                    >
                        <Select
                            placeholder="Chọn kiểu dữ liệu"
                            onChange={(v) => {
                                setKieuDuLieuSelected(v);
                                form.setFieldValue("giaTri", undefined);
                            }}
                        >
                            {KIEU_DU_LIEU.map(item => (
                                <Select.Option key={item.value} value={item.value}>
                                    {item.value}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Giá trị"
                        name="giaTri"
                        rules={[{required: true, message: "Vui lòng nhập giá trị"}]}
                    >
                        {renderGiaTriInput()}
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
