'use client';

import {App, Avatar, Button, Col, DatePicker, Form, Input, Modal, Radio, Row, Select, Upload} from "antd";
import {useEffect, useState} from "react";
import {
    capNhatThongTinGiaoVien,
    capNhatThongTinHocSinh,
    capNhatThongTinQuanTri,
    layThongTinCaNhanGiaoVien,
    layThongTinCaNhanHocSinh
} from "@/services/auth";
import {useModal} from "@/store/modal";
import {getPublicFileUrl, uploadFile} from "@/services/file";
import {UploadOutlined, UserOutlined} from "@ant-design/icons";
import {useTinhXaSelect} from "@/hook/useTinhXa";
import dayjs from "dayjs";

export default function DoiThongTinModal({open, onClose}) {
    const {message} = App.useApp();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const {isEditOpen} = useModal();

    const {
        dsTinh, setSearchTinh, setTinhPagi,
        tinhId, setTinhId,
        dsXa, setSearchXa, setXaPagi
    } = useTinhXaSelect();

    const userInfo =
        typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("userInfo") || "{}")
            : {};

    const isTeacher = userInfo?.roles?.includes("TEACHER");
    const isStudent = userInfo?.roles?.includes("STUDENT");

    /* ================= UPLOAD AVATAR ================= */
    const handleUploadAvatar = async ({file}) => {
        try {
            const res = await uploadFile(file);
            const url = getPublicFileUrl(res.url);

            setAvatarUrl(url);
            form.setFieldsValue({avatar: url});
            message.success("Upload ảnh thành công");
        } catch {
            message.error("Upload ảnh thất bại");
        }
    };

    /* ================= SUBMIT ================= */
    const handleCapNhatThongTin = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            let user;
            if (userInfo.roles?.includes("ADMIN")) {
                user = await capNhatThongTinQuanTri(values);
            } else if (isTeacher) {
                user = await capNhatThongTinGiaoVien({
                    ...values,
                    ngaySinh: dayjs(values.ngaySinh).format("YYYY-MM-DD"),
                    avatar: avatarUrl || '',
                });
            } else if (isStudent) {
                user = await capNhatThongTinHocSinh({
                    ...values,
                    ngaySinh: dayjs(values.ngaySinh).format("YYYY-MM-DD"),
                    avatar: avatarUrl || '',
                });
            }

            localStorage.setItem("userInfo", JSON.stringify({
                ...userInfo,
                ...user
            }));

            message.success("Cập nhật thông tin thành công");
            onClose();
        } catch (err) {
            message.error(err?.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    /* ================= INIT (FIX XA HIỂN THỊ ID) ================= */
    useEffect(() => {
        if (!isEditOpen || (!isTeacher && !isStudent)) return;

        (async () => {
            let user = null;
            if (isTeacher)
                user = await layThongTinCaNhanGiaoVien();
            else if (isStudent)
                user = await layThongTinCaNhanHocSinh()

            const tinhIdFromApi = user?.xa?.tinh?.id;
            const xaIdFromApi = user?.xa?.id;

            // 1️⃣ set tỉnh trước
            setTinhId(tinhIdFromApi);

            form.setFieldsValue({
                ...user,
                ngaySinh: dayjs(user.ngaySinh),
                tinhId: tinhIdFromApi
            });

            setAvatarUrl(user.avatar || null);

            const waitForXa = setInterval(() => {
                if (dsXa.length > 0) {
                    form.setFieldsValue({xaId: xaIdFromApi});
                    clearInterval(waitForXa);
                }
            }, 100);
        })();
    }, [isEditOpen]);

    return (
        <Modal
            title="Cập nhật thông tin cá nhân"
            open={open}
            onCancel={onClose}
            width={720}
            bodyStyle={{
                maxHeight: "70vh",
                overflowY: "auto",
                paddingRight: 16
            }}
            footer={[
                <Button key="cancel" onClick={onClose}>Hủy</Button>,
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
                {/* ===== AVATAR ===== */}
                <div style={{textAlign: "center", marginBottom: 24}}>
                    <Avatar
                        size={96}
                        src={avatarUrl}
                        icon={<UserOutlined/>}
                    />
                    <div style={{marginTop: 12}}>
                        <Upload
                            showUploadList={false}
                            customRequest={handleUploadAvatar}
                            accept="image/*"
                        >
                            <Button icon={<UploadOutlined/>}>
                                Đổi ảnh đại diện
                            </Button>
                        </Upload>
                    </div>
                </div>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            label="Họ tên"
                            name="hoTen"
                            rules={[{required: true}]}
                        >
                            {isStudent ? <Input readOnly/> : <Input/>}
                        </Form.Item>
                    </Col>

                    {(isTeacher || isStudent) && (
                        <Col span={12}>
                            <Form.Item
                                label="Giới tính"
                                name="laNam"
                                rules={[{required: true}]}
                            >
                                <Radio.Group>
                                    <Radio value={true}>Nam</Radio>
                                    <Radio value={false}>Nữ</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    )}

                    {(isTeacher || isStudent) && (
                        <Col span={12}>
                            <Form.Item
                                label="Ngày sinh"
                                name="ngaySinh"
                                rules={[{required: true}]}
                            >
                                <DatePicker
                                    style={{width: "100%"}}
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                    )}

                    {isTeacher && (
                        <Col span={12}>
                            <Form.Item label="Bộ môn" name="boMon" rules={[{required: true}]}>
                                <Input/>
                            </Form.Item>
                        </Col>
                    )}

                    {isTeacher && (
                        <Col span={12}>
                            <Form.Item label="Chức vụ" name="chucVu" rules={[{required: true}]}>
                                <Input/>
                            </Form.Item>
                        </Col>
                    )}

                    {(isTeacher || isStudent) && (
                        <Col span={12}>
                            <Form.Item label="Tỉnh / Thành phố" name="tinhId" rules={[{required: true}]}>
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
                                        <Select.Option key={t.id} value={t.id}>
                                            {t.ten}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    )}

                    {(isTeacher || isStudent) && (
                        <Col span={12}>
                            <Form.Item label="Xã / Phường" name="xaId" rules={[{required: true}]}>
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
                                        <Select.Option key={x.id} value={x.id}>
                                            {x.ten}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    )}
                    {isStudent && (
                        <Col span={12}>
                            <Form.Item label="Môn học yêu thích" name="monHocYeuThich" rules={[{required: true}]}>
                                <Input/>
                            </Form.Item>
                        </Col>
                    )}
                    {isStudent && (
                        <Col span={12}>
                            <Form.Item label="Sở thích" name="soThich" rules={[{required: true}]}>
                                <Input/>
                            </Form.Item>
                        </Col>
                    )}
                    {isStudent && (
                        <Col span={12}>
                            <Form.Item label="Điểm mạnh" name="diemManh" rules={[{required: true}]}>
                                <Input/>
                            </Form.Item>
                        </Col>
                    )}
                    {isStudent && (
                        <Col span={12}>
                            <Form.Item label="Điểm yếu" name="diemYeu" rules={[{required: true}]}>
                                <Input/>
                            </Form.Item>
                        </Col>
                    )}
                </Row>
            </Form>
        </Modal>
    );
}
