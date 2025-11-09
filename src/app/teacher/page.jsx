'use client';

import {useRouter} from 'next/navigation';
import {BarChartOutlined, UsergroupAddOutlined} from '@ant-design/icons';

export default function Teacher() {
    const router = useRouter();

    // Chiều rộng cố định cho các nút
    const buttonWidth = "400px";

    return (
        <div
            className="flex flex-row items-center justify-center min-h-screen gap-12 bg-gray-900 bg-cover bg-center"
            style={{backgroundImage: "url('/image.jpg')"}}
        >
            {/* Nút Quản lý học sinh */}
            <div
                onClick={() => router.push('/teacher/students')}
                className="flex items-center justify-center gap-4 cursor-pointer py-12 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white text-3xl md:text-4xl select-none"
                style={{width: buttonWidth}}
            >
                <UsergroupAddOutlined style={{fontSize: 40}}/>
                Quản lý học sinh
            </div>

            {/* Nút Thống kê */}
            <div
                onClick={() => router.push('/teacher/thong-ke')}
                className="flex items-center justify-center gap-4 cursor-pointer py-12 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-200 bg-green-600 hover:bg-green-700 text-white text-3xl md:text-4xl select-none"
                style={{width: buttonWidth}}
            >
                <BarChartOutlined style={{fontSize: 40}}/>
                Thống kê
            </div>
        </div>
    );
}
