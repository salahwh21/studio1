
'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useRolesStore } from './roles-store';

export type User = {
    id: string;
    name: string;
    email: string; // Can be email or phone for login
    roleId: string;
    avatar: string;
    password?: string;
    whatsapp?: string; // Added for account settings
};

const initialUsers: User[] = [
    // Admins and Staff
    { id: 'user-1', name: 'المدير المسؤول', email: 'admin@alwameed.com', roleId: 'admin', avatar: '', password: '123456789', whatsapp: '962791234567' },
    { id: 'user-2', name: 'أحمد مشرف', email: 'ahmad@alwameed.com', roleId: 'supervisor', avatar: '', password: '123456789' },
    { id: 'user-3', name: 'فاطمة خدمة عملاء', email: 'fatima@alwameed.com', roleId: 'customer_service', avatar: '', password: '123456789' },
    // Drivers
    { id: 'driver-1', name: 'ابو العبد', email: '0799754316', roleId: 'driver', avatar: '', password: '123456789' },
    { id: 'driver-2', name: 'محمد سويد', email: '0799780790', roleId: 'driver', avatar: '', password: '123456789' },
    { id: 'driver-3', name: 'احمد عزاوي', email: '0787085576', roleId: 'driver', avatar: '', password: '123456789' },
    { id: 'driver-4', name: 'محافظات', email: '0778132881', roleId: 'driver', avatar: '', password: '123456789' },
    { id: 'driver-5', name: 'Ebox', email: '0797953190', roleId: 'driver', avatar: '', password: '123456789' },
    { id: 'driver-6', name: 'سامي سويد', email: '0797274740', roleId: 'driver', avatar: '', password: '123456789' },
    { id: 'driver-7', name: 'مجد كميل', email: '0789358393', roleId: 'driver', avatar: '', password: '123456789' },
    { id: 'driver-8', name: 'سامر الطباخي', email: '0790690353', roleId: 'driver', avatar: '', password: '123456789' },
    { id: 'driver-9', name: 'فارس الأسمر', email: '0795365013', roleId: 'driver', avatar: '', password: '123456789' },
    { id: 'driver-10', name: 'حسن زيغان', email: '0786112230', roleId: 'driver', avatar: '', password: '123456789' },
    // Merchants (The user's correct list)
    { id: "merchant-1", name: "السامي", email: "alsami@example.com", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-2", name: "جنان صغيرة", email: "jinan@example.com", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-3", name: "Brands of less", email: "brands@example.com", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-4", name: "عسل", email: "asal@example.com", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-5", name: "Roosh Cosmetics", email: "roosh@example.com", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-6", name: "SoundRush", email: "soundrush@example.com", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-7", name: "Stress Killer", email: "stresskiller@example.com", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-8", name: "Brandlet Outlet", email: "brandlet@example.com", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-9", name: "دولي", email: "dooli@example.com", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-10", name: "زينة بوتيك", email: "zeina@example.com", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-11", name: "Fares Store", email: "fares@example.com", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-12", name: "مكتبة قرطبة", email: "qurtuba@example.com", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-13", name: "مروة حماد", email: "marwa@example.com", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-14", name: "اميرة ابو الرب", email: "ameera.ar@example.com", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-15", name: "اميرة عبد النبي", email: "ameera.an@example.com", roleId: "merchant", avatar: "", password: "123" }
];

type UsersState = {
    users: User[];
    addUser: (newUser: Omit<User, 'id' | 'password'>) => void;
    updateUser: (userId: string, updatedUser: Partial<Omit<User, 'id'>>) => void;
    updateCurrentUser: (updatedFields: Partial<Omit<User, 'id' | 'roleId'>>) => void;
    deleteUser: (userId: string | string[]) => void;
};

const generateId = () => `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const useUsersStore = create<UsersState>()(immer((set, get) => ({
    users: initialUsers,

    addUser: (newUser) => {
        set(state => {
            state.users.push({ ...newUser, id: generateId(), password: '123' });
        });
        useRolesStore.getState().incrementUserCount(newUser.roleId);
    },

    updateUser: (userId, updatedUser) => {
        set(state => {
            const userIndex = state.users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                const oldRole = state.users[userIndex].roleId;
                const newRole = updatedUser.roleId;

                if (newRole && oldRole !== newRole) {
                    useRolesStore.getState().decrementUserCount(oldRole);
                    useRolesStore.getState().incrementUserCount(newRole);
                }
                
                state.users[userIndex] = { ...state.users[userIndex], ...updatedUser };
            }
        });
    },

    updateCurrentUser: (updatedFields) => {
        set(state => {
            const userIndex = state.users.findIndex(u => u.id === 'user-1'); // Hardcoded admin user ID
            if (userIndex !== -1) {
                state.users[userIndex] = { ...state.users[userIndex], ...updatedFields };
            }
        });
    },

    deleteUser: (userIds) => {
        const idsToDelete = Array.isArray(userIds) ? userIds : [userIds];
        const users = get().users;
        
        idsToDelete.forEach(id => {
            const user = users.find(u => u.id === id);
            if (user) {
                useRolesStore.getState().decrementUserCount(user.roleId);
            }
        });

        set(state => {
            state.users = state.users.filter(u => !idsToDelete.includes(u.id));
        });
    },
})));
