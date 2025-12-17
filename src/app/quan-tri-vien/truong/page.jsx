'use client';

import {useEffect, useRef, useState} from "react";
import {App, Button, Dropdown, Form, Input, Modal, Select, Table} from "antd";
import {importTruong, layDsTruong, suaTruong, themTruong, xoaTruong} from "@/services/quan-tri-vien/truong";
import {EllipsisOutlined} from "@ant-design/icons";
import {useDebounce} from "@/hook/data";
import {useTinhXaSelect} from "@/hook/useTinhXa";

export default function Page() {
    const {message} = App.useApp();
    const [form] = Form.useForm();
    const fileInputRef = useRef(null);

    /* ---------------- TABLE ---------------- */
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({current: 1, pageSize: 10, total: 0});
    const [searchText, setSearchText] = useState("");
    const debouncedSearch = useDebounce(searchText, 400);

    /* ---------------- MODAL ---------------- */
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [editingTruong, setEditingTruong] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    /* ---------------- IMPORT ---------------- */
    const [importing, setImporting] = useState(false);

    /* ---------------- TỈNH / XÃ ---------------- */
    const {
        dsTinh, setSearchTinh, tinhPagi, setTinhPagi,
        tinhId, setTinhId,
        dsXa, setSearchXa, xaPagi, setXaPagi
    } = useTinhXaSelect();

    /* ---------------- FETCH TABLE ---------------- */
    const fetchData = async (page = 1, pageSize = 10, search = "") => {
        setLoading(true);
        try {
            const res = await layDsTruong({page, limit: pageSize, search});
            setData(res.data || []);
            setPagination({
                current: res.page,
                pageSize: res.size,
                total: res.totalElements
            });
        } catch (e) {
            message.error(e.message);
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

    /* ---------------- CRUD ---------------- */
    const handleOk = async () => {
        const values = await form.validateFields();
        if (editingTruong) {
            await suaTruong(editingTruong.id, values);
            message.success("Cập nhật thành công");
        } else {
            await themTruong(values);
            message.success("Thêm thành công");
        }
        setModalVisible(false);
        form.resetFields();
        setEditingTruong(null);
        fetchData(pagination.current, pagination.pageSize);
    };

    /* ---------------- IMPORT ---------------- */
    const handleImportFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            setImporting(true);
            await importTruong(formData);
            message.success("Import thành công");
            fetchData();
        } catch (e) {
            message.error(e.message);
        } finally {
            setImporting(false);
            e.target.value = null;
        }
    };

    /* ---------------- COLUMNS ---------------- */
    const columns = [
        {
            title: "#",
            width: 80,
            render: (_, __, index) =>
                (pagination.current - 1) * pagination.pageSize + index + 1
        },
        {title: "Tên trường", dataIndex: "ten"},
        {
            title: "Xã",
            render: r => r.xa?.ten
        },
        {
            title: "Tỉnh",
            render: r => r.xa?.tinh?.ten
        },
        {
            title: "Thao tác",
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            {
                                key: "edit",
                                label: "Sửa",
                                onClick: () => {
                                    setEditingTruong(record);
                                    setTinhId(record.xa?.tinh?.id);
                                    form.setFieldsValue({
                                        ...record,
                                        tinhId: record.xa?.tinh?.id,
                                        xaId: record.xa?.id
                                    });
                                    setModalVisible(true);
                                }
                            },
                            {
                                key: "delete",
                                label: "Xóa",
                                onClick: () => {
                                    setDeletingId(record.id);
                                    setDeleteModalVisible(true);
                                }
                            }
                        ]
                    }}
                >
                    <Button type="text" icon={<EllipsisOutlined/>}/>
                </Dropdown>
            )
        }
    ];

    return (
        <div style={{padding: 16}}>
            <div className={'flex justify-between'}>
                <Input.Search
                    placeholder="Tìm kiếm trường..."
                    style={{width: 300, marginBottom: 16}}
                    onChange={e => setSearchText(e.target.value)}
                />

                <div>
                    <Button type="primary" onClick={() => setModalVisible(true)}>Thêm trường</Button>
                    <Button onClick={() => fileInputRef.current.click()} loading={importing} style={{marginLeft: 8}}>
                        Import
                    </Button>

                    <input hidden ref={fileInputRef} type="file" accept=".xlsx" onChange={handleImportFile}/>
                </div>

            </div>


            <Table
                rowKey="id"
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={pagination}
                onChange={p => fetchData(p.current, p.pageSize)}
            />

            {/* MODAL */}
            <Modal open={modalVisible} onOk={handleOk} onCancel={() => setModalVisible(false)}>
                <Form form={form} layout="vertical">
                    <Form.Item name="ten" label="Tên trường" rules={[{required: true}]}>
                        <Input/>
                    </Form.Item>

                    <Form.Item name="tinhId" label="Tỉnh" rules={[{required: true}]}>
                        <Select
                            showSearch
                            onSearch={setSearchTinh}
                            onPopupScroll={e => {
                                if (e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight - 5)
                                    setTinhPagi(p => ({...p, page: p.page + 1}));
                            }}
                            onChange={val => {
                                setTinhId(val);
                                form.setFieldsValue({xaId: null});
                            }}
                            filterOption={false}
                        >
                            {dsTinh.map(t => (
                                <Select.Option key={t.id} value={t.id}>{t.ten}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="xaId" label="Xã" rules={[{required: true}]}>
                        <Select
                            showSearch
                            disabled={!tinhId}
                            onSearch={setSearchXa}
                            onPopupScroll={e => {
                                if (e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight - 5)
                                    setXaPagi(p => ({...p, page: p.page + 1}));
                            }}
                            filterOption={false}
                        >
                            {dsXa.map(x => (
                                <Select.Option key={x.id} value={x.id}>{x.ten}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* DELETE */}
            <Modal
                open={deleteModalVisible}
                onOk={async () => {
                    await xoaTruong(deletingId);
                    message.success("Đã xóa");
                    setDeleteModalVisible(false);
                    fetchData();
                }}
                onCancel={() => setDeleteModalVisible(false)}
            >
                Xác nhận xóa?
            </Modal>
        </div>
    );
}
