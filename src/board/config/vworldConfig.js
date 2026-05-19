export const VWORLD_API_KEY = import.meta.env.VITE_VWORLD_KEY;

export const VWORLD_BASE_MAP_URL = `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Base/{z}/{y}/{x}.png`;