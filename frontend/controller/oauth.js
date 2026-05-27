import {baseURL, loadToken} from './config'
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native'; // Add this import

export const loginWithGoogle = () => {
    window.location.href = `${baseURL}/auth/google`;
};

export const getuser = async () => {
    try {
        const token = await loadToken()
        const response = await fetch(`${baseURL}/oauth/profile`, {credentials: 'include', headers: {"Authorization": `Bearer ${token}`}});
        const data = await response.json()
        return data
    } catch (err) {
        throw err
    }
}

export const check_email_exists = async (email) => {
    try {
        const response = await fetch(`${baseURL}/oauth/emailexists/${email}`, {credentials: 'include'});
        const data = await response.json()
        return data
    } catch (err) {
        throw err
    }
}

export const post_sign_up = async (name, email, password, degree, picked) => {
    try {
        const response = await fetch(`${baseURL}/oauth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json", 
            },
            body: JSON.stringify({
                email: email,
                full_name: name,
                degree: degree,
                password: password
            })
        })
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Sign up failed");
        }

        const data = await response.json();

        // Save the token securely in Expo
        if (data && data.access_token) {
            if (Platform.OS === 'web') {
                localStorage.setItem('userToken', data.access_token);
            } else {
                await SecureStore.setItemAsync('userToken', data.access_token);
            }
        }

        return data;
    } catch (err){
        console.error("Network error:", err);
    }
}

export const postLogin = async (email, password) => {
    try {
        const formData = new URLSearchParams();
        formData.append('username', email); // OAuth2 expects 'username' field for the login identifier
        formData.append('password', password);
        const response = await fetch(`${baseURL}/oauth/login`, {
            method: "POST",
            headers: {
                // Change Content-Type to form-urlencoded
                "Content-Type": "application/x-www-form-urlencoded", 
            },
            body: formData.toString()
        })
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Sign in failed");
        }

        const data = await response.json();

        // Save the token securely in Expo
        if (data && data.access_token) {
            if (Platform.OS === 'web') {
                localStorage.setItem('userToken', data.access_token);
            } else {
                await SecureStore.setItemAsync('userToken', data.access_token);
            }
        }

        return data;
} catch (err){
        console.error("Network error:", err);
    }
};
