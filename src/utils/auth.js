import axios from "axios";

export function getToken() {
    return localStorage.getItem('jwtToken');
}

export function isTokenExpired(token) {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() >= payload.exp * 1000;
    } catch (e) {
        return true;
    }
}


export async function isTokenValid() {
    const token = getToken();
    if (!token) return false;

    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BE}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const user = res.data;
        localStorage.setItem('userInfo', JSON.stringify(user));

        return true;
    } catch (err) {
        console.error('Token invalid or expired', err);
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userInfo');
        return false;
    }
}