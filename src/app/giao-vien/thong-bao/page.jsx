'use client';

import {useEffect, useState} from "react";
import {App, Button, Dropdown, Form, Input, Modal, Select, Table} from "antd";
import {sua} from "@/services/giao-vien/lop";
import {useDebounce} from "@/hook/data";
import {EllipsisOutlined} from "@ant-design/icons";
import {useTruongLopSelect} from "@/hook/useTruongLop";
import dayjs from 'dayjs';
import {layDsThongBao, suaThongBao, taoThongBao, xoaThongBao} from "@/services/giao-vien/thong-bao";


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
    const [lopId, setLopId] = useState();

    const [searchText, setSearchText] = useState("");

    const debouncedSearch = useDebounce(searchText, 400);


    const {
        dsTruong,
        setSearchTruong,
        setTruongPagi,
        truongPagi,
        lopPagi,
        setLopPagi,
        dsLop,
        setSearchLop,
        setTruongId,
        truongId
    } = useTruongLopSelect();


    /* --------------------------------------------
     * 2. REFS
     * -------------------------------------------- */
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
        {title: "Tiêu đề", dataIndex: "tieuDe", key: "tieuDe", width: 250},
        {title: "Nội dung", dataIndex: "noiDung", key: "noiDung"},
        {
            title: "Thời gian tạo", dataIndex: "thoiGianTao", key: "thoiGianTao", render: (text, record, index) => {
                return (dayjs(text).format("DD/MM/YYYY HH:mm:ss"))
            }
        },
        {
            title: "Thao tác",
            key: "thaoTac",
            render: (_, record) => {
                record.id = record.thongBaoId;
                const items = [
                    {
                        key: "sua",
                        label: "Cập nhật",
                        onClick: () => {
                            setEditingLop(record);
                            form.setFieldsValue({
                                ...record,
                            });
                            setModalVisible(true);
                        },
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
        if (!lopId) {
            setData([])
            setPagination(
                {
                    current: 1,
                    pageSize: 10,
                    total: 0,
                }
            )
            return;
        }
        setLoading(true);
        try {
            const res = await layDsThongBao({lopId, page, limit: pageSize, search});
            setData(res.data || []);
            setPagination({
                current: res.page || page,
                pageSize: res.size || pageSize,
                total: res.totalElements || 0,
            });
        } catch (e) {
            message.error(e.message || "Lỗi khi tải danh sách thông báo");
        } finally {
            setLoading(false);
        }
    };


    /* --------------------------------------------
     * 5. CRUD HANDLERS
     * -------------------------------------------- */

    const handleDelete = (id) => {
        setDeletingId(id);
        setDeleteModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            if (editingLop) {
                await suaThongBao(editingLop.id, {
                    ...values,
                    lopId

                });
                message.success("Cập nhật thành công");
            } else {
                await taoThongBao(lopId, {
                    ...values
                });
                message.success("Thêm thông báo thành công");
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
    }, [lopId]);

    useEffect(() => {
        fetchData(1, pagination.pageSize, debouncedSearch);
    }, [lopId, debouncedSearch]);


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
                <div style={{display: "flex", gap: 8}}>
                    {/* SEARCH BOX */}
                    <Input.Search
                        placeholder="Tìm kiếm thông báo..."
                        allowClear
                        style={{width: 300}}
                        onChange={(e) => setSearchText(e.target.value)}
                    />

                    <Select
                        showSearch
                        allowClear
                        style={{
                            width: 200,
                        }}
                        placeholder="Chọn trường"
                        onPopupScroll={e => {
                            if (e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight - 5)
                                setTruongPagi(p => ({...p, page: p.page + 1}));
                        }}
                        onSearch={setSearchTruong}
                        onChange={(val) => {
                            setTruongId(val)
                            if (!val)
                                setLopId(null);
                        }}
                        filterOption={false}
                    >
                        {dsTruong?.map(t => (
                            <Select.Option key={t.id} value={t.id}>{t.ten}</Select.Option>
                        ))}
                    </Select>

                    <Select
                        showSearch
                        allowClear
                        disabled={!truongId}
                        style={{
                            width: 100,
                        }}
                        placeholder="Chọn lớp"
                        value={lopId}
                        onPopupScroll={e => {
                            if (e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight - 5)
                                setLopPagi(p => ({...p, page: p.page + 1}));
                        }}
                        onSearch={setSearchLop}
                        onChange={(val) => {
                            setLopId(val)
                        }}
                        filterOption={false}
                    >
                        {dsLop?.map(t => (
                            <Select.Option key={t.id} value={t.id}>{t.ten}</Select.Option>
                        ))}
                    </Select>
                </div>


                {/* ACTION BUTTONS */}
                <div style={{display: "flex", gap: 8}}>


                    <Button
                        type="primary"
                        disabled={!lopId}
                        onClick={() => {
                            if (!lopId) {
                                message.warning('Vui lòng chọn lớp')
                                return
                            }
                            setModalVisible(true);
                            form.resetFields();
                            setEditingLop(null);
                        }}
                    >
                        Thêm thông báo
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
                title={editingLop ? "Sửa thông báo" : "Thêm thông báo"}
                open={modalVisible}
                onOk={handleOk}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingLop(null);
                }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    autoComplete="off"
                >

                    <Form.Item
                        label="Tiêu đề"
                        name="tieuDe"
                        rules={[{required: true, message: 'Tiêu đề là bắt buộc'}]}
                    >
                        <Input autoComplete="off"/>
                    </Form.Item>

                    <Form.Item
                        label="Nội dung"
                        name="noiDung"
                    >
                        <Input.TextArea
                        />
                    </Form.Item>
                </Form>


            </Modal>

            {/* DELETE CONFIRM MODAL */}
            <Modal
                title="Xác nhận xóa"
                open={deleteModalVisible}
                onOk={async () => {
                    try {
                        await xoaThongBao(deletingId);
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
                Bạn có chắc muốn xóa thông báo này không?
            </Modal>


        </div>
    );
}
