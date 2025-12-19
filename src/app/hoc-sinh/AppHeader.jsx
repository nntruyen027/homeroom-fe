'use client';

import {Avatar, Dropdown, Menu, Space} from "antd";
import {LogoutOutlined, SafetyOutlined, UserOutlined} from "@ant-design/icons";
import {usePathname, useRouter} from "next/navigation";
import {useModal} from "@/store/modal";
import {useEffect, useState} from "react";
import {layThongTinCaNhanHocSinh} from "@/services/auth";

export default function AppHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const {SetIsUpdatePassOpen, setIsEditOpen, isEditOpen} = useModal();

    const [userInfo, setUserInfo] = useState(null);

    /* ================= MENU ================= */
    const menuItems = [
        {key: "/hoc-sinh/dashboard", label: "Trang chủ"},
        {key: "/hoc-sinh/huong-nghiep", label: "Hướng nghiệp"},
        // {key: "/hoc-sinh/ho-so", label: "Hồ sơ"},
    ];

    const userMenuItems = [
        {
            key: "profile",
            label: "Thông tin tài khoản",
            icon: <UserOutlined/>,
            onClick: () => setIsEditOpen(),
        },
        {
            key: "password",
            label: "Đổi mật khẩu",
            icon: <SafetyOutlined/>,
            onClick: () => SetIsUpdatePassOpen(),
        },
        {
            key: "logout",
            label: "Đăng xuất",
            icon: <LogoutOutlined/>,
            onClick: () => {
                localStorage.clear();
                router.replace("/login");
            }
        }
    ];

    /* ================= LOAD STUDENT ================= */
    useEffect(() => {
        let ignore = false;

        const loadStudent = async () => {
            try {
                const localUser = JSON.parse(localStorage.getItem("userInfo") || "{}");

                // auth guard
                if (!localUser?.roles?.includes("STUDENT")) {
                    router.replace("/login");
                    return;
                }

                // fetch chuẩn từ API
                const student = await layThongTinCaNhanHocSinh();

                if (ignore) return;

                const merged = {
                    ...localUser,
                    ...student,
                };

                setUserInfo(merged);

                // sync lại localStorage
                localStorage.setItem("userInfo", JSON.stringify(merged));
            } catch {
                router.replace("/login");
            }
        };

        loadStudent();

        return () => {
            ignore = true;
        };
    }, [router, isEditOpen]); // reload sau khi sửa profile

    if (!userInfo) return null;

    /* ================= RENDER ================= */
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
                height: 64,
                flex: 1,
                minWidth: 0
            }}
        >
            {/* LEFT */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 32,
                flex: 1,
                minWidth: 0
            }}>
                <div
                    style={{
                        fontWeight: 600,
                        fontSize: 18,
                        cursor: "pointer"
                    }}
                    onClick={() => router.push("/hoc-sinh")}
                >
                    🎓 Homeroom
                </div>

                <Menu
                    mode="horizontal"
                    selectedKeys={[pathname]}
                    items={menuItems}
                    onClick={({key}) => router.push(key)}
                    style={{
                        flex: 1,        // ⬅️ menu được giãn
                        minWidth: 0     // ⬅️ tránh bị collapse
                    }}
                />
            </div>

            {/* RIGHT */}
            <Dropdown
                menu={{items: userMenuItems}}
                trigger={["click"]}
                placement="bottomRight"
            >
                <Space style={{cursor: "pointer"}}>
                    <Avatar src={userInfo.avatar} icon={<UserOutlined/>}/>
                    <span>{userInfo.hoTen || "Học sinh"}</span>
                </Space>
            </Dropdown>
        </div>
    );
}
