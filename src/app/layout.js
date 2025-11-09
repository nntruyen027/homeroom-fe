'use client';

import "./globals.css";

export default function RootLayout({children}) {

    return (
        <html lang="en">
        <body className={'h-screen w-screen p-0 m-0 overflow-x-hidden'}>
        {children}
        </body>
        </html>
    );
}
