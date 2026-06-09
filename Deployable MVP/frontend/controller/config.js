import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native'; // Import Platform to detect Web vs Mobile

export const baseURL = 'https://ai-study-tracker-wrip.onrender.com'
export async function loadToken() { 
    if (Platform.OS === 'web') {
        return localStorage.getItem('userToken');
    } else {
        return await SecureStore.getItemAsync('userToken');
    }
}