'use client';

import {useEffect, useRef, useState} from "react";
import {App, Button, DatePicker, Dropdown, Form, Input, Modal, Table} from "antd";
import {layDsHoatDong, suaHoatDong, taoHoatDong, xoaHoatDong} from "@/services/giao-vien/hoat-dong-huong-nghiep";
import {useDebounce} from "@/hook/data";
import {EllipsisOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import ModalPhanHoatDongChoLop from "@/app/giao-vien/hoat-dong-huong-nghiep/ModalPhanHoatDongChoLop";


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

    const [editingHoatDong, setEditingHoatDong] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const [searchText, setSearchText] = useState("");

    const debouncedSearch = useDebounce(searchText, 400);
    const [phanLopModalOpen, setPhanLopModalOpen] = useState(false);
    const [selectedHoatDong, setSelectedHoatDong] = useState(null);


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
        {title: "Tên hoạt động", dataIndex: "tenHoatDong", key: "tenHoatDong", width: 300},
        {title: "Ghi chú", dataIndex: "ghiChu", key: "ghiChu"},

        {
            title: "Thời gian bắt đầu", dataIndex: "thoiGianBatDau", key: "thoiGianBatDau", render:
                (value) => dayjs(value).format("DD/MM/YYYY")
        },
        {
            title: "Thời gian kết thúc", dataIndex: "thoiGianKetThuc", key: "thoiGianKetThuc", render:
                (value) => dayjs(value).format("DD/MM/YYYY")
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
                    },
                    {
                        key: 'phan-hoat-dong',
                        label: 'Gán hoạt động cho lớp',
                        onClick: () => handleGanHoatDong(record),
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
            const res = await layDsHoatDong({page, limit: pageSize, search});
            setData(res.data || []);
            setPagination({
                current: res.page || page,
                pageSize: res.size || pageSize,
                total: res.totalElements || 0,
            });
        } catch (e) {
            message.error(e.message || "Lỗi khi tải danh sách hoạt động");
        } finally {
            setLoading(false);
        }
    };


    /* --------------------------------------------
     * 5. CRUD HANDLERS
     * -------------------------------------------- */
    const handleEdit = async (record) => {
        setEditingHoatDong(record);
        console.log(record);
        form.setFieldsValue({
            ...record,
            thoiGianBatDau: dayjs(record.thoiGianBatDau),
            thoiGianKetThuc: dayjs(record.thoiGianKetThuc)
        });


        setModalVisible(true);
    };

    const handleGanHoatDong = (record) => {
        setSelectedHoatDong(record);
        setPhanLopModalOpen(true);
    };


    const handleDelete = (id) => {
        setDeletingId(id);
        setDeleteModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const body = {
                ...values,
                thoiGianBatDau: dayjs(values.thoiGianBatDau).format("YYYY-MM-DD"),
                thoiGianKetThuc: dayjs(values.thoiGianKetThuc).format("YYYY-MM-DD")
            }


            if (editingHoatDong) {
                await suaHoatDong(editingHoatDong.id, body);
                message.success("Cập nhật thành công");
            } else {
                await taoHoatDong(body);
                message.success("Thêm hoạt động thành công");
            }

            setModalVisible(false);
            form.resetFields();
            setEditingHoatDong(null);
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
                    placeholder="Tìm kiếm hoạt động..."
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
                            setEditingHoatDong(null);
                        }}
                    >
                        Thêm hoạt động
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
                title={editingHoatDong ? "Sửa hoạt động" : "Thêm hoạt động"}
                open={modalVisible}
                onOk={handleOk}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingHoatDong(null);
                }}
            >
                <Form form={form} layout="vertical">

                    <Form.Item label="Tên hoạt động" name="tenHoatDong"
                               rules={[{required: true, message: 'Nhập tên hoạt động'}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item label={"Ghi chú"} name={"ghiChu"}>
                        <Input.TextArea/>
                    </Form.Item>

                    <Form.Item
                        label="Thời gian bắt đầu"
                        name="thoiGianBatDau"
                        rules={[{required: true, message: 'Nhập thời gian bắt đầu'}]}
                    >
                        <DatePicker
                            format="DD/MM/YYYY"
                            placeholder="DD/MM/YYYY"
                            style={{width: '100%'}}
                            inputReadOnly={false}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Thời gian kết thúc"
                        name="thoiGianKetThuc"
                        rules={[{required: true, message: 'Nhập thời gian kết thúc'}]}
                    >
                        <DatePicker
                            format="DD/MM/YYYY"
                            placeholder="DD/MM/YYYY"
                            style={{width: '100%'}}
                            inputReadOnly={false}
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
                        await xoaHoatDong(deletingId);
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
                Bạn có chắc muốn xóa hoạt động này không?
            </Modal>

            <ModalPhanHoatDongChoLop
                open={phanLopModalOpen}
                hoatDong={selectedHoatDong}
                onCancel={() => {
                    setPhanLopModalOpen(false);
                    setSelectedHoatDong(null);
                }}
                onSuccess={() =>
                    fetchData(pagination.current, pagination.pageSize, debouncedSearch)
                }
            />
        </div>
    );
}
