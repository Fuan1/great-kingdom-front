import { User } from '@/types/User';
import { create } from 'zustand';

interface UserStore {
    // 상태
    user?: User;

    // 액션
    setUser: (user: User) => void;
    reset: () => void;
}

const useUserStore = create<UserStore>((set) => ({
    // 초기 상태
    user: undefined,

    // 액션 정의
    setUser: (user) => set({ user }),
    reset: () => set({ user: undefined }),
}));

export default useUserStore;
