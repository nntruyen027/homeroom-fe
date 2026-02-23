import "./globals.css";
import "antd/dist/reset.css";
import ClientLayout from "./ClientLayout";

export const metadata = {
    title: 'Hồ sơ hướng nghiệp cá nhân',
    icons: {
        icon: "/favicon.png",
        shortcut: "/favicon.png",
        apple: "/favicon.png",
    }
};

export default function RootLayout({children}) {
    return (
        <html lang="en">
        <body className="h-screen w-screen p-0 m-0 overflow-x-hidden">
        <ClientLayout>{children}</ClientLayout>
        </body>
        </html>
    );
}
