'use client';

import {useRouter} from 'next/navigation';
import {ReadOutlined, UserOutlined} from '@ant-design/icons';

export default function Home() {
    const router = useRouter();

    return (
        <div
            className="h-screen w-screen flex flex-col md:flex-row items-center justify-center gap-12 bg-cover bg-center"
            style={{backgroundImage: "url('/image.jpg')"}}
        >
            {/* Nút Holland */}
            <div
                onClick={() => router.push('/holland')}
                className="flex items-center justify-center gap-4 cursor-pointer px-16 py-12 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white text-3xl md:text-4xl select-none"
            >
                <ReadOutlined style={{fontSize: 40}}/>
                Bài kiểm tra Holland
            </div>

            {/* Nút Giáo viên */}
            <div
                onClick={() => router.push('/teacher')}
                className="flex items-center justify-center gap-4 cursor-pointer px-16 py-12 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-200 bg-green-600 hover:bg-green-700 text-white text-3xl md:text-4xl select-none"
            >
                <UserOutlined style={{fontSize: 40}}/>
                Dành cho giáo viên
            </div>
        </div>
    );
}
