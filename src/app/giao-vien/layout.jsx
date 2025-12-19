'use client';

import {Avatar, Button, Dropdown, Layout, Menu, theme, Typography} from 'antd';
import {
    BarChartOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SafetyOutlined,
    TableOutlined,
    UserOutlined
} from '@ant-design/icons';
import {useCallback, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useModal} from "@/store/modal";
import {layThongTinCaNhanGiaoVien} from "@/services/auth";

const {Sider, Header, Content} = Layout;

export default function RootLayout({children}) {
    const router = useRouter();
    const {token} = theme.useToken();
    const {setIsEditOpen, SetIsUpdatePassOpen, isEditOpen} = useModal();

    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    /* ================= FETCH + MERGE CHUẨN ================= */
    const loadUserInfo = useCallback(async () => {
        const localUser = JSON.parse(localStorage.getItem("userInfo") || "{}");

        // ⛔ auth guard
        if (!localUser?.roles?.includes("TEACHER")) {
            router.replace("/login");
            return;
        }

        // ✅ LẤY DATA TRỰC TIẾP
        const teacherInfo = await layThongTinCaNhanGiaoVien();

        // ✅ MERGE NGAY TẠI ĐÂY
        const mergedUser = {
            ...localUser,
            ...teacherInfo,
        };

        setUserInfo(mergedUser);
        localStorage.setItem("userInfo", JSON.stringify(mergedUser));
    }, [router]);

    useEffect(() => {
        loadUserInfo();
    }, [loadUserInfo, isEditOpen]);

    if (!userInfo) return null;

    /* ================= ACTION ================= */
    const handleLogout = () => {
        localStorage.clear();
        router.push("/login");
    };

    const userMenuItems = [
        {
            key: "profile",
            label: "Thông tin tài khoản",
            icon: <UserOutlined/>,
            onClick: () => setIsEditOpen(true),
        },
        {
            key: "password",
            label: "Đổi mật khẩu",
            icon: <SafetyOutlined/>,
            onClick: () => SetIsUpdatePassOpen(true),
        },
        {
            key: "logout",
            label: "Đăng xuất",
            icon: <LogoutOutlined/>,
            onClick: handleLogout,
        },
    ];

    return (
        <Layout style={{minHeight: "100vh"}}>
            <Sider
                width={280}
                collapsible
                collapsed={collapsed}
                trigger={null}
                style={{background: "#fff"}}
            >
                {!collapsed && (
                    <div className="text-2xl font-bold text-center py-4">
                        Sổ chủ nhiệm điện tử
                    </div>
                )}

                <Menu
                    mode="inline"
                    items={[
                        {key: '/giao-vien/dashboard', label: 'Dashboard', icon: <BarChartOutlined/>},
                        {key: '/giao-vien/lop', label: 'Lớp', icon: <TableOutlined/>},
                        {key: '/giao-vien/hoc-sinh', label: 'Học sinh', icon: <UserOutlined/>},
                    ]}
                    onClick={({key}) => router.push(key)}
                />
            </Sider>

            <Layout>
                <Header
                    style={{
                        background: token.colorBgContainer,
                        padding: "0 16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                        onClick={() => setCollapsed(!collapsed)}
                    />

                    <Dropdown menu={{items: userMenuItems}} placement="bottomRight">
                        <div className="flex items-center gap-2 cursor-pointer">
                            <Avatar src={userInfo.avatar} icon={<UserOutlined/>}/>
                            <Typography.Text strong>
                                {userInfo.hoTen}
                            </Typography.Text>
                        </div>
                    </Dropdown>
                </Header>

                <Content
                    style={{
                        margin: 16,
                        padding: 24,
                        background: token.colorBgContainer,
                        borderRadius: token.borderRadiusLG,
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}
