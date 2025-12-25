'use client';

import {useEffect, useRef, useState} from "react";
import {App, Button, Dropdown, Form, Input, Modal, Select, Table} from "antd";
import {layDsLop, sua, taoLop, xoaLop} from "@/services/giao-vien/lop";
import {useDebounce} from "@/hook/data";
import {EllipsisOutlined} from "@ant-design/icons";
import {useTruongLopSelect} from "@/hook/useTruongLop";
import FileUploadUrl from "@/app/components/common/FileUploadUrl";


export default function Page() {

    /* --------------------------------------------
     * 1. STATE
     * -------------------------------------------- */

    const {message} = App.useApp()
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({current: 1, pageSize: 10, total: 0});

    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const [editingLop, setEditingLop] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const [truongId, setTinhId] = useState(null);
    const [searchText, setSearchText] = useState("");

    const debouncedSearch = useDebounce(searchText, 400);

    const {dsTruong, setSearchTruong, setTruongPagi, truongPagi} = useTruongLopSelect();


    /* --------------------------------------------
     * 2. REFS
     * -------------------------------------------- */
    const searchTruongRef = useRef(null);
    const [form] = Form.useForm();


    /* --------------------------------------------
     * 3. TABLE COLUMNS
     * -------------------------------------------- */
    const columns = [
        {
            title: "#",
            key: "stt",
            width: 80,
            align: "right",
            render: (text, record, index) =>
                (pagination.current - 1) * pagination.pageSize + index + 1
        },
        {title: "Tên lớp", dataIndex: "ten", key: "ten", width: 250},
        {
            title: "Tên trường",
            dataIndex: "truong",
            key: "truong",
            width: 200,
            render: (truong) => truong?.ten || ""
        },

        {
            title: "Thao tác",
            key: "thaoTac",
            render: (_, record) => {
                const items = [
                    {
                        key: "sua",
                        label: "Cập nhật",
                        onClick: () => handleEdit(record),
                    },
                    {
                        key: "xoa",
                        label: "Xóa",
                        onClick: () => handleDelete(record.id)
                    }
                ]
                return (
                    <Dropdown menu={{items}} trigger={['click']}>
                        <Button type="text" icon={<EllipsisOutlined/>}/>
                    </Dropdown>
                )
            }
        }
    ];


    /* --------------------------------------------
     * 4. FETCH DATA
     * -------------------------------------------- */
    const fetchData = async (page = 1, pageSize = 10, search = "") => {
        setLoading(true);
        try {
            const res = await layDsLop({page, limit: pageSize, search});
            setData(res.data || []);
            setPagination({
                current: res.page || page,
                pageSize: res.size || pageSize,
                total: res.totalElements || 0,
            });
        } catch (e) {
            message.error(e.message || "Lỗi khi tải danh sách lớp");
        } finally {
            setLoading(false);
        }
    };


    /* --------------------------------------------
     * 5. CRUD HANDLERS
     * -------------------------------------------- */
    const handleEdit = async (record) => {
        setEditingLop(record);

        const truong = record.truong.id

        form.setFieldsValue({
            ...record,
            truongId: truong,
        });

        setTinhId(truong);


        setModalVisible(true);
    };

    const handleDelete = (id) => {
        setDeletingId(id);
        setDeleteModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            if (editingLop) {
                await sua(editingLop.id, values);
                message.success("Cập nhật thành công");
            } else {
                await taoLop(values);
                message.success("Thêm lớp thành công");
            }

            setModalVisible(false);
            form.resetFields();
            setEditingLop(null);
            fetchData(pagination.current, pagination.pageSize);

        } catch (e) {
            message.error(e.message || "Lỗi");
        }
    };

    /* --------------------------------------------
     * 6. DOWNLOAD / IMPORT FILE
     * -------------------------------------------- */


    /* --------------------------------------------
     * 8. USE EFFECTS
     * -------------------------------------------- */
    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchData(1, pagination.pageSize, debouncedSearch);
    }, [debouncedSearch]);


    /* --------------------------------------------
     * 9. UI RENDER
     * -------------------------------------------- */
    return (
        <div style={{padding: 16}}>

            {/* SEARCH + ACTION BUTTONS */}
            <div style={{
                marginBottom: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>

                {/* SEARCH BOX */}
                <Input.Search
                    placeholder="Tìm kiếm lớp..."
                    allowClear
                    style={{width: 300}}
                    onChange={(e) => setSearchText(e.target.value)}
                />

                {/* ACTION BUTTONS */}
                <div style={{display: "flex", gap: 8}}>
                    <Button
                        type="primary"
                        onClick={() => {
                            setModalVisible(true);
                            form.resetFields();
                            setEditingLop(null);
                        }}
                    >
                        Thêm lớp
                    </Button>

                </div>
            </div>

            {/* TABLE */}
            <Table
                rowKey="id"
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={pagination}
                onChange={(pag) => fetchData(pag.current, pag.pageSize)}
            />

            {/* ADD / EDIT MODAL */}
            <Modal
                title={editingLop ? "Sửa lớp" : "Thêm lớp"}
                open={modalVisible}
                onOk={handleOk}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingLop(null);
                }}
            >
                <Form form={form} layout="vertical">

                    <Form.Item label="Tên lớp" name="ten" rules={[{required: true}]}>
                        <Input/>
                    </Form.Item>

                    <Form.Item label="Trường" name="truongId" rules={[{required: true}]}>
                        <Select
                            showSearch
                            placeholder="Chọn trường"
                            onPopupScroll={e => {
                                if (e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight - 5)
                                    setTruongPagi(p => ({...p, page: p.page + 1}));
                            }}
                            value={form.getFieldValue("truongId")}
                            onSearch={setSearchTruong}
                            filterOption={false}
                        >
                            {dsTruong?.map(t => (
                                <Select.Option key={t.id} value={t.id}>{t.ten}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>


                    <Form.Item label="Hình ảnh" name="hinhAnh">
                        <FileUploadUrl accept=".jpg,.png"/>
                    </Form.Item>

                </Form>

            </Modal>

            {/* DELETE CONFIRM MODAL */}
            <Modal
                title="Xác nhận xóa"
                open={deleteModalVisible}
                onOk={async () => {
                    try {
                        await xoaLop(deletingId);
                        message.success("Xóa thành công");

                        if (data.length === 1 && pagination.current > 1)
                            fetchData(pagination.current - 1, pagination.pageSize);
                        else
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
                Bạn có chắc muốn xóa lớp này không?
            </Modal>


        </div>
    );
}
