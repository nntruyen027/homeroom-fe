'use client';

import {Button} from "@mui/material";
import {useRouter} from "next/navigation";

export default function Home() {
    const router = useRouter();

    return (
        <div className="h-screen flex items-center justify-center gap-4">
            <Button onClick={() => router.push('/holland')} variant="contained" color="success">
                Bài kiểm tra Holland
            </Button>
            <Button
                variant="contained"
                color="info"
                onClick={() => router.push('/teacher')}
            >
                Dành cho giáo viên
            </Button>
        </div>
    );
}
