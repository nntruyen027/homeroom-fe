"use client";

import {App, Button, Form, Input, Modal} from "antd";
import {useState} from "react";
import {doiMatKhau} from "@/services/auth";
import {isStrongPassword} from "@/utils/valid";

export default function ChangePasswordModal({open, onClose}) {
    const {message} = App.useApp();
    const [passForm] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleUpdatePassword = async () => {
        try {
            const values = await passForm.validateFields();
            setLoading(true);

            await doiMatKhau(values);

            message.success("Đổi mật khẩu thành công!");
            passForm.resetFields();
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

    return (
        <Modal
            title="Đổi mật khẩu"
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
                    onClick={handleUpdatePassword}
                >
                    Cập nhật
                </Button>
            ]}
        >
            <Form form={passForm} layout="vertical">
                <Form.Item
                    label="Mật khẩu cũ"
                    name="oldPass"
                    rules={[{required: true}]}
                >
                    <Input.Password/>
                </Form.Item>

                <Form.Item
                    label="Mật khẩu mới"
                    name="newPass"
                    rules={[
                        {required: true},
                        () => ({
                            validator(_, value) {
                                if (!value || isStrongPassword(value)) return Promise.resolve();
                                return Promise.reject(
                                    new Error("Mật khẩu phải ≥8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.")
                                );
                            }
                        })
                    ]}
                >
                    <Input.Password/>
                </Form.Item>

                <Form.Item
                    label="Nhập lại mật khẩu"
                    name="repeatNewPass"
                    dependencies={["newPass"]}
                    rules={[
                        {required: true},
                        ({getFieldValue}) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("newPass") === value)
                                    return Promise.resolve();
                                return Promise.reject(new Error("Mật khẩu nhập lại không khớp"));
                            }
                        })
                    ]}
                >
                    <Input.Password/>
                </Form.Item>
            </Form>
        </Modal>
    );
}
