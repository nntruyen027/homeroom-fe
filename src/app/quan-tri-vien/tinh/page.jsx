'use client';

import {useEffect, useRef, useState} from "react";
import {Button, Form, Input, message, Modal, Table} from "antd";
import {importTinh, layDsTinh, layFileImport, suaTinh, themTinh, xoaTinh} from "@/services/quan-tri-vien/tinh";

export default function Page() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({current: 1, pageSize: 10, total: 0});

    const [modalVisible, setModalVisible] = useState(false);
    const [editingTinh, setEditingTinh] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [form] = Form.useForm();
    const [importing, setImporting] = useState(false);

    const fileInputRef = useRef(null);

    // Load danh sách tỉnh
    const fetchData = async (page = 1, pageSize = 10, search = "") => {
        setLoading(true);
        try {
            const res = await layDsTinh({page, limit: pageSize, search});
            setData(res.data || []);
            setPagination(prev => ({
                ...prev,
                current: res.page || page,
                pageSize: res.size || pageSize,
                total: res.totalElements || 0,
            }));
        } catch (e) {
            message.error(e.message || "Lỗi khi tải danh sách tỉnh");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Thêm / Sửa tỉnh
    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingTinh) {
                await suaTinh(editingTinh.id, values);
                message.success("Cập nhật thành công");
            } else {
                await themTinh(values);
                message.success("Thêm tỉnh thành công");
            }
            setModalVisible(false);
            form.resetFields();
            setEditingTinh(null);
            fetchData(pagination.current, pagination.pageSize);
        } catch (e) {
            message.error(e.message || "Lỗi");
        }
    };

    const handleEdit = (record) => {
        setEditingTinh(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = (id) => {
        setDeletingId(id);
        setDeleteModalVisible(true);
    };

    const handleTableChange = (pag) => {
        fetchData(pag.current, pag.pageSize);
    };

    // Tải file mẫu
    const handleDownloadTemplate = async () => {
        try {
            await layFileImport();
        } catch (e) {
            message.error(e.message);
        }
    };

    // Import file
    const handleImportFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            setImporting(true);
            await importTinh(formData);
            message.success("Import thành công");
            fetchData(pagination.current, pagination.pageSize);
        } catch (err) {
            console.error("Upload error", err);
            message.error(err.message || "Lỗi import");
        } finally {
            setImporting(false);
            e.target.value = null; // reset input
        }
    };

    const columns = [
        {title: "ID", dataIndex: "id", key: "id", width: 80},
        {title: "Tên tỉnh", dataIndex: "ten", key: "ten"},
        {title: "Ghi chú", dataIndex: "ghiChu", key: "ghiChu"},
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <>
                    <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
                    <Button type="link" danger onClick={() => handleDelete(record.id)}>Xóa</Button>
                </>
            ),
        },
    ];

    return (
        <div style={{padding: 16}}>
            <div style={{marginBottom: 16, display: "flex", gap: 8}}>
                <Button type="primary" onClick={() => {
                    setModalVisible(true);
                    form.resetFields();
                    setEditingTinh(null);
                }}>
                    Thêm tỉnh
                </Button>
                <Button onClick={handleDownloadTemplate}>Tải file mẫu</Button>
                <Button onClick={() => fileInputRef.current.click()} loading={importing}>
                    Import file
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{display: "none"}}
                    accept=".xlsx"
                    onChange={handleImportFile}
                />
            </div>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                }}
                onChange={handleTableChange}
            />

            <Modal
                title={editingTinh ? "Sửa tỉnh" : "Thêm tỉnh"}
                open={modalVisible}
                onOk={handleOk}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingTinh(null);
                }}
            >
                <Form form={form} layout="vertical" initialValues={{ten: ""}}>
                    <Form.Item
                        label="Tên tỉnh"
                        name="ten"
                        rules={[{required: true, message: "Vui lòng nhập tên tỉnh"}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label="Ghi chú"
                        name="ghiChu"
                    >
                        <Input/>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Xác nhận xóa"
                open={deleteModalVisible}
                onOk={async () => {
                    try {
                        await xoaTinh(deletingId);
                        message.success("Xóa thành công");
                        fetchData(pagination.current, pagination.pageSize);
                    } catch (e) {
                        message.error(e.message);
                    } finally {
                        setDeleteModalVisible(false);
                        setDeletingId(null);
                    }
                }}
                onCancel={() => {
                    setDeleteModalVisible(false);
                    setDeletingId(null);
                }}
            >
                Bạn có chắc muốn xóa tỉnh này không?
            </Modal>
        </div>
    );
}
