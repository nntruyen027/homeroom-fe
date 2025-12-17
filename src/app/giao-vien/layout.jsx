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

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useModal} from "@/store/modal";

const {Sider, Header, Content} = Layout;


const adminMenuItems = [
    {key: '/giao-vien/dashboard', label: 'Dashboard', icon: <BarChartOutlined/>},
    {
        key: 'danh-muc',
        label: 'Quản lý danh mục',
        icon: <TableOutlined/>,
        children: [
            {key: '/giao-vien/lop', label: 'Lớp'},
            {key: '/giao-vien/hoc-sinh', label: 'Học sinh'},
        ],
    }
];

export default function RootLayout({children}) {
    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const router = useRouter();

    const {token: {colorBgContainer, borderRadiusLG}} = theme.useToken();
    const {SetIsUpdatePassOpen, setIsEditOpen, isEditOpen} = useModal();

    // Fetch userInfo & auth check
    useEffect(() => {
        const info = JSON.parse(localStorage.getItem('userInfo') || "{}");

        if (!info?.roles || !info.roles?.includes('TEACHER')) {
            router.replace('/login');
            return;
        }
        setUserInfo(info);
    }, [router, isEditOpen]);

    if (!userInfo) return null;

    const userName = userInfo.hoTen || "Người dùng";

    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("userInfo");
        router.push('/login');
    };

    const userMenu = (
        <Menu
            items={[
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
                    onClick: handleLogout,
                },
            ]}
        />
    );

    return (
        <Layout>

            {/* SIDEBAR */}
            <Sider
                width={300}
                collapsible
                collapsed={collapsed}
                trigger={null}
                style={{
                    maxHeight: "100vh",
                    height: "100vh",
                    background: "white",
                    overflowY: "auto",
                }}
            >
                {!collapsed && (
                    <div className="text-black text-2xl pb-10 text-center p-2 font-black bg-white">
                        Sổ chủ nhiệm điện tử
                    </div>
                )}

                <Menu
                    style={{fontSize: 18}}
                    mode="inline"
                    items={adminMenuItems}
                    onClick={({key}) => key.startsWith("/") && router.push(key)}
                />
            </Sider>

            {/* MAIN CONTENT */}
            <Layout>

                {/* HEADER */}
                <Header
                    className="flex justify-between items-center"
                    style={{background: colorBgContainer, paddingLeft: 0}}
                >
                    <div className="flex items-center gap-4">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{fontSize: 16, width: 64, height: 64}}
                        />
                        <Typography.Text style={{fontSize: 18}}>
                            Giáo viên
                        </Typography.Text>
                    </div>

                    <Dropdown overlay={userMenu} placement="bottomRight">
                        <div className="flex items-center gap-2 cursor-pointer">
                            <Avatar src={userInfo.avatar} size="large" icon={<UserOutlined/>}/>
                            <Typography.Text className="font-medium text-lg">
                                {userName}
                            </Typography.Text>
                        </div>
                    </Dropdown>
                </Header>

                {/* PAGE CONTENT */}
                <Content
                    style={{
                        margin: "24px 16px",
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {children}
                </Content>

            </Layout>
        </Layout>
    );
}
