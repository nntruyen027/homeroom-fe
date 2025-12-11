"use client";

import {App, Button, Form, Input, Modal} from "antd";
import {useEffect, useState} from "react";
import {capNhatThongTinQuanTri} from "@/services/auth";
import {useModal} from "@/store/modal";

export default function DoiThongTinModal({open, onClose}) {
    const {message} = App.useApp();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const {isEditOpen} = useModal()

    const handleCapNhatThongTin = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const user = await capNhatThongTinQuanTri(values);
            localStorage.setItem("userInfo", JSON.stringify(user));

            message.success("Cập nhật thông tin thành công!");
            form.resetFields();
            onClose();
        } catch (err) {
            message.error(
                err?.response?.data?.message ||
                err?.message ||
                "Có lỗi xảy ra"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('userInfo')) || {};
        form.setFieldsValue({
            hoTen: user.hoTen,
            avatar: user.avatar
        });
    }, [isEditOpen]);


    return (
        <Modal
            title="Cập nhật thông tin cá nhân"
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Hủy
                </Button>,
                <Button
                    key="ok"
                    type="primary"
                    loading={loading}
                    onClick={handleCapNhatThongTin}
                >
                    Cập nhật
                </Button>
            ]}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Họ tên"
                    name="hoTen"
                    rules={[{required: true, message: 'Họ tên là bắt buộc'}]}
                >
                    <Input/>
                </Form.Item>


                <Form.Item
                    label="Ảnh đại diện"
                    name="avatar"

                >
                    <Input/>
                </Form.Item>
            </Form>
        </Modal>
    );
}
