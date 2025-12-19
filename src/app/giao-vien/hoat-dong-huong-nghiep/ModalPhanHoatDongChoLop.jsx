'use client';

import {App, Modal, Select, Table} from "antd";
import {useEffect, useState} from "react";
import {useTruongLopSelect} from "@/hook/useTruongLop";
import {phanHoatDongChoLop} from "@/services/giao-vien/hoat-dong-huong-nghiep";

export default function ModalPhanHoatDongChoLop({
                                                    open,
                                                    onCancel,
                                                    hoatDong,
                                                    onSuccess
                                                }) {
    const {message} = App.useApp();

    const {
        dsTruong,
        setSearchTruong,
        truongPagi,
        setTruongPagi,

        truongId,
        setTruongId,

        dsLop,
        setSearchLop,
        lopPagi,
        setLopPagi
    } = useTruongLopSelect();

    const [selectedLopIds, setSelectedLopIds] = useState([]);

    /* ================= RESET KHI OPEN ================= */
    useEffect(() => {
        if (open) {
            setSelectedLopIds([]);
            setTruongId(null);
            setSearchTruong("");
            setSearchLop("");
        }
    }, [open]);

    useEffect(() => {
        if (open && hoatDong?.dsLopId) {
            setSelectedLopIds(hoatDong.dsLopId);
        }
    }, [open, hoatDong]);


    /* ================= SUBMIT ================= */
    const handleOk = async () => {

        try {
            await phanHoatDongChoLop(hoatDong.id, selectedLopIds);
            message.success("Gán hoạt động thành công");
            onSuccess?.();
            onCancel();
        } catch (e) {
            message.error(e.message || "Lỗi gán hoạt động");
        }
    };

    /* ================= TABLE CONFIG ================= */
    const columns = [
        {
            title: "Tên lớp",
            dataIndex: "ten",
            key: "ten"
        }
    ];

    const rowSelection = {
        selectedRowKeys: selectedLopIds,
        onChange: setSelectedLopIds
    };

    return (
        <Modal
            title="Gán hoạt động theo lớp"
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            okText="Gán hoạt động"
            cancelText="Hủy"
            width={700}
        >

            {/* ================= SELECT TRƯỜNG ================= */}
            <Select
                showSearch
                allowClear
                placeholder="Chọn trường"
                style={{width: '100%', marginBottom: 12}}
                filterOption={false}
                value={truongId}
                onChange={value => setTruongId(value)}
                onSearch={value => setSearchTruong(value)}
                onPopupScroll={(e) => {
                    const target = e.target;
                    if (
                        target.scrollTop + target.offsetHeight >= target.scrollHeight - 20 &&
                        dsTruong.length < truongPagi.total
                    ) {
                        setTruongPagi(p => ({...p, page: p.page + 1}));
                    }
                }}
                options={dsTruong.map(t => ({
                    value: t.id,
                    label: t.ten
                }))}
            />

            {/* ================= TABLE LỚP ================= */}
            <Table
                rowKey="id"
                columns={columns}
                dataSource={dsLop}
                rowSelection={rowSelection}
                pagination={{
                    current: lopPagi.page,
                    pageSize: lopPagi.limit,
                    total: lopPagi.total,
                    onChange: (page, pageSize) =>
                        setLopPagi(p => ({...p, page, limit: pageSize}))
                }}
            />
        </Modal>
    );
}
