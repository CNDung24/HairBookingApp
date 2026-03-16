import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Web polyfill cho AsyncStorage sử dụng localStorage
const WebAsyncStorage = {
  getItem: async (key) => {
    try {
      return localStorage.getItem(key) || null;
    } catch (e) {
      console.log(e);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      localStorage.setItem(key, value);
      return null;
    } catch (e) {
      console.log(e);
      return null;
    }
  },
  removeItem: async (key) => {
    try {
      localStorage.removeItem(key);
      return null;
    } catch (e) {
      console.log(e);
      return null;
    }
  },
  clear: async () => {
    try {
      localStorage.clear();
      return null;
    } catch (e) {
      console.log(e);
      return null;
    }
  },
};

export const Storage = Platform.OS === 'web' ? WebAsyncStorage : AsyncStorage;
