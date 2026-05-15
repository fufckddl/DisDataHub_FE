import { create } from "zustand";

const useAuthStore = create(set => ({
    userInfo: null,

    login: param => {
        set({ userInfo: param });
    },
    logout: () => {
        set({userInfo: null});
    }
}));

export default useAuthStore;