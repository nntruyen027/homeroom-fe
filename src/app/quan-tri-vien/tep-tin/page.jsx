"use client";

import {useEffect, useState} from "react";
import {App, Button, Pagination, Table, Upload} from "antd";
import {DeleteOutlined, UploadOutlined} from "@ant-design/icons";
import {deleteFile, getAllFiles, uploadFile} from "@/services/file";

export default function FileManager() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const {message} = App.useApp();

    // -------------------------
    // Load file từ API
    // -------------------------
    const loadFiles = async (p = page, size = pageSize) => {
        setLoading(true);
        try {
            const data = await getAllFiles(p, size); // API trả về Spring Page object
            const list = Array.isArray(data) ? data : data?.content || [];
            setFiles(list);
            setTotal(data?.totalElements ?? list.length);
            setPage(p);
            setPageSize(size);
        } catch (err) {
            console.error(err);
            message.error("Không tải được danh sách file");
        } finally {
            setLoading(false);
        }
    };

    // -------------------------
    // Xóa file
    // -------------------------
    const handleDelete = async (id) => {
        if (!confirm("Bạn có chắc muốn xóa file này?")) return;
        try {
            await deleteFile(id);
            message.success("Xóa file thành công");
            // Nếu xóa file cuối trang, trở về trang trước
            const lastPage = Math.ceil((total - 1) / pageSize) || 1;
            loadFiles(page > lastPage ? lastPage : page, pageSize);
        } catch (err) {
            console.error(err);
            message.error("Xóa thất bại");
        }
    };

    // -------------------------
    // Upload file
    // -------------------------
    const handleUpload = async ({file, onSuccess, onError}) => {
        try {
            await uploadFile(file);
            message.success(`${file.name} upload thành công`);
            onSuccess?.();
            loadFiles(1, pageSize); // sau upload, quay về trang 1
        } catch (err) {
            console.error(err);
            message.error("Upload thất bại");
            onError?.();
        }
    };

    useEffect(() => {
        loadFiles();
    }, []);

    // -------------------------
    // Table Columns
    // -------------------------
    const columns = [
        {
            title: "Tên File",
            dataIndex: "fileName",
            key: "fileName",
            render: (text, record) => (
                <a href={record.url} target="_blank" rel="noreferrer">
                    {text}
                </a>
            ),
        },
        {
            title: "Loại tệp tin",
            dataIndex: "contentType",
            key: "contentType",
        },
        {
            title: "Size",
            dataIndex: "size",
            key: "size",
            render: (size) => `${(size / 1024).toFixed(2)} KB`,
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Button danger icon={<DeleteOutlined/>} onClick={() => handleDelete(record.id)}>
                    Xóa
                </Button>
            ),
        },
    ];

    return (
        <div style={{padding: 20}}>
            <h2>Quản lý File</h2>

            <Upload customRequest={handleUpload} showUploadList={false}>
                <Button icon={<UploadOutlined/>}>Upload File</Button>
            </Upload>

            <Table
                style={{marginTop: 20}}
                columns={columns}
                dataSource={files}
                rowKey="id"
                loading={loading}
                pagination={false} // tắt pagination của table
            />

            {total > pageSize && (
                <Pagination
                    style={{marginTop: 16, textAlign: "right"}}
                    current={page}
                    pageSize={pageSize}
                    total={total}
                    showSizeChanger
                    onChange={(p, size) => loadFiles(p, size)}
                    onShowSizeChange={(current, size) => loadFiles(1, size)} // đổi pageSize quay về trang 1
                />
            )}
        </div>
    );
}
