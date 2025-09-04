
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
    // Merchants (Restored Full List)
    { id: "merchant-101", name: "جنان صغيرة", email: "0786633891", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-102", name: "Brands of less", email: "0775343162", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-103", name: "عسل", email: "0776807347", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-104", name: "Roosh Cosmetics", email: "0782099324", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-105", name: "SoundRush", email: "0788741262", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-106", name: "سامر الطباخي", email: "0790690352", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-107", name: "Stress Killer", email: "0781399935", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-108", name: "Brandlet Outlet -1", email: "0776979308", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-109", name: "دولي", email: "0793204555", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-110", name: "زينة بوتيك", email: "0781223373", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-111", name: "Fares Store", email: "0788484646", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-112", name: "مكتبة قرطبة", email: "0799434313", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-113", name: "مروة حماد", email: "0795589100", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-114", name: "اميرة ابو الرب", email: "0796249566", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-115", name: "اميرة عبد النبي", email: "0795155913", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-116", name: "ميرا", email: "0795900130", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-117", name: "الاء", email: "0795773229", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-118", name: "ريما", email: "0796071850", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-119", name: "نور", email: "0795940417", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-120", name: "Ahmad AL-Hmouz", email: "0788220824", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-121", name: "اماني", email: "0798155919", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-122", name: "الاء اسعد", email: "0799190090", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-123", name: "اماني", email: "0798155919", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-124", name: "سارة", email: "0797766126", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-125", name: "لانا", email: "0791448842", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-126", name: "سناء", email: "0798058779", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-127", name: "هبة", email: "0791083103", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-128", name: "ميس", email: "0796633891", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-129", name: "نادية", email: "0795135811", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-130", name: "بتول", email: "0796859345", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-131", name: "مرح", email: "0795904838", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-132", name: "فرح", email: "0795904838", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-133", name: "امل", email: "0798933731", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-134", name: "سحر", email: "0795551221", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-135", name: "رشا", email: "0796633891", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-136", name: "رهف", email: "0795135811", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-137", name: "رغد", email: "0796859345", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-138", name: "شهد", email: "0795904838", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-139", name: "حنين", email: "0798933731", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-140", name: "روان", email: "0795551221", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-141", name: "اسيل", email: "0796633891", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-142", name: "اريج", email: "0795135811", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-143", name: "اسراء", email: "0796859345", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-144", name: "الين", email: "0795904838", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-145", name: "امينة", email: "0798933731", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-146", name: "براءة", email: "0795551221", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-147", name: "بشرى", email: "0796633891", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-148", name: "بيان", email: "0795135811", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-149", name: "تالا", email: "0796859345", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-150", name: "تسنيم", email: "0795904838", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-151", name: "تقى", email: "0798933731", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-152", name: "تمارا", email: "0795551221", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-153", name: "ثراء", email: "0796633891", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-154", name: "جنى", email: "0795135811", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-155", name: "جهان", email: "0796859345", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-156", name: "جود", email: "0795904838", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-157", name: "جوري", email: "0798933731", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-158", name: "جوليا", email: "0795551221", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-159", name: "جينا", email: "0796633891", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-160", name: "حلا", email: "0795135811", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-161", name: "حياة", email: "0796859345", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-162", name: "ختام", email: "0795904838", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-163", name: "خلود", email: "0798933731", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-164", name: "داليا", email: "0795551221", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-165", name: "دانا", email: "0796633891", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-166", name: "دانية", email: "0795135811", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-167", name: "دجى", email: "0796859345", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-168", name: "دعاء", email: "0795904838", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-169", name: "دلال", email: "0798933731", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-170", name: "ديمة", email: "0795551221", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-171", name: "دينا", email: "0796633891", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-172", name: "ديانا", email: "0795135811", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-173", name: "ذكرى", email: "0796859345", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-174", name: "رائدة", email: "0795904838", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-175", name: "رؤى", email: "0798933731", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-176", name: "رانية", email: "0795551221", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-177", name: "ربى", email: "0796633891", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-178", name: "رجاء", email: "0795135811", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-179", name: "رحمة", email: "0796859345", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-180", name: "رزان", email: "0795904838", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-181", name: "رسمية", email: "0798933731", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-182", name: "رشا", email: "0795551221", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-183", name: "رضوى", email: "0796633891", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-184", name: "رنا", email: "0795135811", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-185", name: "رنيم", email: "0796859345", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-186", name: "رند", email: "0795904838", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-187", name: "رندة", email: "0798933731", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-188", name: "رهام", email: "0795551221", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-189", name: "ريم", email: "0796633891", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-190", name: "ريما", email: "0795135811", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-191", name: "ريماس", email: "0796859345", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-192", name: "زاهرة", email: "0795904838", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-193", name: "زكية", email: "0798933731", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-194", name: "زمزم", email: "0795551221", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-195", name: "زهرة", email: "0796633891", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-196", name: "زهور", email: "0795135811", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-197", name: "زينب", email: "0796859345", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-198", name: "زينة", email: "0795904838", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-199", name: "سارة", email: "0798933731", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-200", name: "سالمة", email: "0795551221", roleId: "merchant", avatar: "", password: "123" },
    { id: "merchant-201", name: "سامية", email: "0796633891", roleId: "merchant", avatar: "", password: "123" },
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
