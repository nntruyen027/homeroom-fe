'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Box, Button, Paper, TextField, Typography} from '@mui/material';
import axios from 'axios';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BE}/auth/login`, {
                username,
                password,
            });

            const {token} = res.data;

            if (token) {
                localStorage.setItem('jwtToken', token);
                router.replace('/teacher'); // redirect về trang chủ giáo viên
            } else {
                setError('Login failed: token not received');
            }
        } catch (err) {
            console.error(err);
            setError('Tên đăng nhập hoặc mật khẩu không đúng');
        }
    };

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
            }}
        >
            <Paper sx={{p: 4, width: 400}} elevation={3}>
                <Typography variant="h5" component="h1" align="center" gutterBottom>
                    Sổ tay chủ nhiệm điện tử
                </Typography>

                {error && (
                    <Typography color="error" align="center" sx={{mb: 2}}>
                        {error}
                    </Typography>
                )}

                <form onSubmit={handleLogin}>
                    <TextField
                        label="Tên đăng nhập"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <TextField
                        label="Mật khẩu"
                        variant="outlined"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{mt: 2}}
                    >
                        Đăng nhập
                    </Button>
                </form>
            </Paper>
        </Box>
    );
}
