'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useRolesStore } from './roles-store';

export type User = {
    id: string;
    name: string;
    email: string;
    roleId: string;
    avatar: string;
};

const initialUsers: User[] = [
    { id: 'user-1', name: 'المدير المسؤول', email: 'admin@alwameed.com', roleId: 'admin', avatar: ''},
    { id: 'user-2', name: 'أحمد مشرف', email: 'ahmad@alwameed.com', roleId: 'supervisor', avatar: ''},
    { id: 'user-3', name: 'فاطمة خدمة عملاء', email: 'fatima@alwameed.com', roleId: 'customer_service', avatar: ''},
];

type UsersState = {
    users: User[];
    addUser: (newUser: Omit<User, 'id'>) => void;
    updateUser: (userId: string, updatedUser: Omit<User, 'id'>) => void;
    deleteUser: (userId: string) => void;
};

const generateId = () => `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const useUsersStore = create<UsersState>()(immer((set) => ({
    users: initialUsers,

    addUser: (newUser) => {
        set(state => {
            state.users.push({ ...newUser, id: generateId() });
        });
        useRolesStore.getState().incrementUserCount(newUser.roleId);
    },

    updateUser: (userId, updatedUser) => {
        set(state => {
            const userIndex = state.users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                const oldRole = state.users[userIndex].roleId;
                const newRole = updatedUser.roleId;
                if (oldRole !== newRole) {
                    useRolesStore.getState().decrementUserCount(oldRole);
                    useRolesStore.getState().incrementUserCount(newRole);
                }
                state.users[userIndex] = { ...state.users[userIndex], ...updatedUser };
            }
        });
    },

    deleteUser: (userId) => {
        const user = useUsersStore.getState().users.find(u => u.id === userId);
        if (user) {
            useRolesStore.getState().decrementUserCount(user.roleId);
        }
        set(state => {
            state.users = state.users.filter(u => u.id !== userId);
        });
    },
})));
