'use client';

import {Layout} from "antd";
import dynamic from "next/dynamic";

const AppHeader = dynamic(
    () => import("@/app/hoc-sinh/AppHeader"),
    {ssr: false} // 🔥 QUAN TRỌNG
);

const {Header, Content} = Layout;

export default function MainLayout({children}) {
    return (
        <Layout style={{minHeight: "100vh"}}>
            <Header style={{
                position: "sticky",
                top: 0,
                zIndex: 100,
                padding: "0 24px",
                background: "#fff",
                borderBottom: "1px solid #f0f0f0"
            }}>
                <AppHeader/>
            </Header>

            <Content style={{padding: 24}}>
                {children}
            </Content>
        </Layout>
    );
}
