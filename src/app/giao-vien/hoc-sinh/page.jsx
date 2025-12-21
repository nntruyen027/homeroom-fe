'use client';

import {useEffect, useRef, useState} from "react";
import {App, Button, DatePicker, Dropdown, Form, Input, Modal, Radio, Select, Table} from "antd";
import {sua} from "@/services/giao-vien/lop";
import {useDebounce} from "@/hook/data";
import {EllipsisOutlined} from "@ant-design/icons";
import {useTruongLopSelect} from "@/hook/useTruongLop";
import {
    importHocSinh,
    layDsHocSinhTheoLop,
    layFileImport,
    suaHocSinh,
    taoHocSinh,
    xoaHocSinh
} from "@/services/giao-vien/hoc-sinh";
import {useTinhXaSelect} from "@/hook/useTinhXa";
import dayjs from 'dayjs';
import {useRouter} from "next/navigation";
import useTeacherRealtime from "@/hook/useTeacherRealtime";


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
    const [importing, setImporting] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const debouncedSearch = useDebounce(searchText, 400);

    // -----------------------------
    const fileInputRef = useRef(null);

    const router = useRouter();

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

    const {
        dsTinh,
        dsXa,
        setSearchTinh,
        setSearchXa,
        setTinhId,
        setTinhPagi,
        setXaPagi,
        tinhId,
        tinhPagi,
        xaPagi
    } = useTinhXaSelect()

    useTeacherRealtime(lopId, (lopId, type, payload) => {
        if (type === "list") {
            setOnlineUsers(payload?.map(hs => hs?.userId));
        }
    });
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
        {title: "Tên học sinh", dataIndex: "hoTen", key: "hoTen", width: 250},
        {title: "Tên đăng nhập", dataIndex: "username", key: "username"},
        {title: "Giới tính", dataIndex: "laNam", width: 100, key: "laNam", render: (obj) => obj ? 'Nam' : 'Nữ'},
        {title: "Môn học yêu thích", dataIndex: "monHocYeuThich", key: "monHocYeuThich"},
        {
            title: "Hoạt động",
            key: "hoatDong",
            width: 150,
            align: "center",
            render: (_, record) => {

                const isOnline = onlineUsers.includes(record.id);
                return (
                    <span
                        style={{
                            display: "inline-block",
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: isOnline ? "green" : "gray",
                        }}
                    />
                );
            }
        },
        {
            title: "Thao tác",
            key: "thaoTac",
            render: (_, record) => {
                const items = [
                    {
                        key: "xem",
                        label: "Xem hồ sơ",
                        onClick: () => {
                            router.push("/giao-vien/hoc-sinh/" + record.id);
                        }
                    },
                    {
                        key: "sua",
                        label: "Cập nhật",
                        onClick: () => {
                            setEditingLop(record);
                            setTinhId(record.xa?.tinh?.id);
                            form.setFieldsValue({
                                ...record,
                                tinhId: record.xa?.tinh?.id,
                                xaId: record.xa?.id,
                                ngaySinh: dayjs(record.ngaySinh)
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
            const res = await layDsHocSinhTheoLop(lopId, {page, limit: pageSize, search});
            setData(res.data || []);
            setPagination({
                current: res.page || page,
                pageSize: res.size || pageSize,
                total: res.totalElements || 0,
            });
        } catch (e) {
            message.error(e.message || "Lỗi khi tải danh sách học sinh");
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
                await suaHocSinh(editingLop.id, {
                    ...values,
                    lopId

                });
                message.success("Cập nhật thành công");
            } else {
                await taoHocSinh({
                    ...values,
                    lopId
                });
                message.success("Thêm học sinh thành công");
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

    const handleDownloadTemplate = async () => {
        try {
            await layFileImport();
        } catch (e) {
            message.error(e.message);
        }
    };

    const handleImportFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        if (!lopId) {
            message.warning('Vui lòng chọn lớp');
            return
        }

        try {
            setImporting(true);

            await importHocSinh(lopId, formData);

            message.success("Import thành công");
            await fetchData(pagination.current, pagination.pageSize, debouncedSearch);

        } catch (err) {
            message.error(err.message || err || "Lỗi import");
        } finally {
            setImporting(false);
            e.target.value = null;
        }
    };
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
                        placeholder="Tìm kiếm học sinh..."
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
                    <Button onClick={handleDownloadTemplate}>Tải file mẫu</Button>

                    <Button disabled={!lopId} onClick={() => fileInputRef.current.click()} loading={importing}>
                        Import file
                    </Button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{display: "none"}}
                        accept=".xlsx"
                        onChange={handleImportFile}
                    />
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
                        Thêm học sinh
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
                title={editingLop ? "Sửa học sinh" : "Thêm học sinh"}
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
                    {/* INPUT MỒI CHỐNG AUTOFILL */}
                    <input
                        type="text"
                        name="fake-username"
                        autoComplete="username"
                        style={{display: 'none'}}
                    />
                    <input
                        type="password"
                        name="fake-password"
                        autoComplete="current-password"
                        style={{display: 'none'}}
                    />

                    <Form.Item
                        label="Tên học sinh"
                        name="hoTen"
                        rules={[{required: true, message: 'Tên học sinh là bắt buộc'}]}
                    >
                        <Input autoComplete="off"/>
                    </Form.Item>

                    <Form.Item
                        label="Tên đăng nhập"
                        name="username"
                        rules={[{required: true, message: 'Vui lòng nhập tên đăng nhập'}]}
                    >
                        <Input
                            autoComplete="new-username"
                            name="username_fake"
                        />
                    </Form.Item>

                    {
                        editingLop ? <></> : (<Form.Item
                            label="Mật khẩu"
                            name="password"
                            rules={[{required: true, message: 'Vui lòng nhập mật khẩu'}]}
                        >
                            <Input.Password
                                autoComplete="new-password"
                                name="password_fake"
                            />
                        </Form.Item>)
                    }


                    <Form.Item
                        label="Giới tính"
                        name="laNam"
                        rules={[{required: true, message: 'Vui lòng chọn giới tính'}]}
                    >
                        <Radio.Group>
                            <Radio value={true}>Nam</Radio>
                            <Radio value={false}>Nữ</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item
                        name="tinhId"
                        label="Tỉnh"
                        rules={[{required: true, message: 'Vui lòng chọn tỉnh/thành phố'}]}
                    >
                        <Select
                            showSearch
                            onSearch={setSearchTinh}
                            onPopupScroll={(e) => {
                                if (
                                    e.target.scrollTop + e.target.offsetHeight >=
                                    e.target.scrollHeight - 5
                                ) {
                                    setTinhPagi(p => ({...p, page: p.page + 1}));
                                }
                            }}
                            onChange={(val) => {
                                setTinhId(val);
                                form.setFieldsValue({xaId: null});
                            }}
                            filterOption={false}
                        >
                            {dsTinh.map(t => (
                                <Select.Option key={t.id} value={t.id}>
                                    {t.ten}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>


                    <Form.Item
                        name="xaId"
                        label="Xã"
                        rules={[{required: true, message: 'Vui lòng chọn xã/phường'}]}
                    >
                        <Select
                            showSearch
                            disabled={!tinhId}
                            onSearch={setSearchXa}
                            onPopupScroll={(e) => {
                                if (
                                    e.target.scrollTop + e.target.offsetHeight >=
                                    e.target.scrollHeight - 5
                                ) {
                                    setXaPagi(p => ({...p, page: p.page + 1}));
                                }
                            }}
                            filterOption={false}
                        >
                            {dsXa.map(x => (
                                <Select.Option key={x.id} value={x.id}>
                                    {x.ten}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Địa chỉ chi tiết"
                        name="diaChiChiTiet"
                    >
                        <Input autoComplete="off"/>
                    </Form.Item>

                    <Form.Item
                        label="Ngày sinh"
                        name="ngaySinh"
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
                        await xoaHocSinh(deletingId);
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
                Bạn có chắc muốn xóa học sinh này không?
            </Modal>


        </div>
    );
}
