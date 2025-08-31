
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
};

const initialUsers: User[] = [
    { id: 'user-1', name: 'المدير المسؤول', email: 'admin@alwameed.com', roleId: 'admin', avatar: '', password: '123456789' },
    { id: 'user-2', name: 'أحمد مشرف', email: 'ahmad@alwameed.com', roleId: 'supervisor', avatar: '', password: '123456789' },
    { id: 'user-3', name: 'فاطمة خدمة عملاء', email: 'fatima@alwameed.com', roleId: 'customer_service', avatar: '', password: '123456789' },
    // Drivers from image
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
    // Merchants from image
    { id: 'merchant-1', name: 'جنان صغيرة', email: '0786633891', roleId: 'merchant', avatar: '' },
    { id: 'merchant-2', name: 'عسل', email: '0775343162', roleId: 'merchant', avatar: '' },
    { id: 'merchant-3', name: 'سامر الطباخي', email: '0776807347', roleId: 'merchant', avatar: '' },
    { id: 'merchant-4', name: 'Roosh Cosmetics', email: '0782099324', roleId: 'merchant', avatar: '' },
    { id: 'merchant-5', name: 'Brandlet Outlet -1', email: '0790690352', roleId: 'merchant', avatar: '' },
    { id: 'merchant-6', name: 'Oceansfounds -1', email: '0776979308', roleId: 'merchant', avatar: '' },
    { id: 'merchant-7', name: 'KADI MODA -1', email: '0798453904', roleId: 'merchant', avatar: '' },
    { id: 'merchant-8', name: 'مهند محارمه', email: '0795001395', roleId: 'merchant', avatar: '' },
    { id: 'merchant-9', name: 'لافي لافي', email: '0795851162', roleId: 'merchant', avatar: '' },
    { id: 'merchant-10', name: 'Glowy Thingz', email: '0789749486', roleId: 'merchant', avatar: '' },
    { id: 'merchant-11', name: 'k by women', email: '0776529541', roleId: 'merchant', avatar: '' },
    { id: 'merchant-12', name: 'Mohammad Zamil', email: '0788870887', roleId: 'merchant', avatar: '' },
    { id: 'merchant-13', name: 'bags art', email: '0790719429', roleId: 'merchant', avatar: '' },
    { id: 'merchant-14', name: 'احمد الفريح', email: '0775697986', roleId: 'merchant', avatar: '' },
    { id: 'merchant-15', name: 'هودي هودي', email: '0796148776', roleId: 'merchant', avatar: '' },
    { id: 'merchant-16', name: 'ابرة وخيط', email: '0791558273', roleId: 'merchant', avatar: '' },
    { id: 'merchant-17', name: 'صلاتي صلاتي', email: '0791751140', roleId: 'merchant', avatar: '' },
    { id: 'merchant-18', name: 'طارق زیا', email: '0799059050', roleId: 'merchant', avatar: '' },
    { id: 'merchant-19', name: 'ریتان ریتان', email: '0788958226', roleId: 'merchant', avatar: '' },
    { id: 'merchant-20', name: 'Waves sport', email: '0796216115', roleId: 'merchant', avatar: '' },
    { id: 'merchant-21', name: 'يوني آرت', email: '0790212227', roleId: 'merchant', avatar: '' },
    { id: 'merchant-22', name: 'sneaker fever', email: '0798975131', roleId: 'merchant', avatar: '' },
    { id: 'merchant-23', name: 'we brand', email: '0795593048', roleId: 'merchant', avatar: '' },
    { id: 'merchant-24', name: 'I MODELS', email: '0780858758', roleId: 'merchant', avatar: '' },
    { id: 'merchant-25', name: 'MELLOW', email: '0796630606', roleId: 'merchant', avatar: '' },
    { id: 'merchant-26', name: 'بنان خضر', email: '0788360254', roleId: 'merchant', avatar: '' },
    { id: 'merchant-27', name: 'شي ان سارة', email: '0796446987', roleId: 'merchant', avatar: '' },
    { id: 'merchant-28', name: 'مجدولين مجدولين', email: '0777055604', roleId: 'merchant', avatar: '' },
    { id: 'merchant-29', name: 'دانا الحوامدة', email: '0775522889', roleId: 'merchant', avatar: '' },
    { id: 'merchant-30', name: 'artfully pieces', email: '0799973533', roleId: 'merchant', avatar: '' },
    { id: 'merchant-31', name: 'خالدش', email: '0799965664', roleId: 'merchant', avatar: '' },
    { id: 'merchant-32', name: 'فوغيش فوغيش', email: '0795595545', roleId: 'merchant', avatar: '' },
    { id: 'merchant-33', name: 'محمد ابو سمرة', email: '0790997378', roleId: 'merchant', avatar: '' },
    { id: 'merchant-34', name: 'SAMRA', email: '0795565272', roleId: 'merchant', avatar: '' },
    { id: 'merchant-35', name: 'مجد كميل صفحة', email: '0789358390', roleId: 'merchant', avatar: '' },
    { id: 'merchant-36' ,name: 'Bambeno', email: '0786305521', roleId: 'merchant', avatar: '' },
    { id: 'merchant-37', name: 'كتب كتب', email: '0798086344', roleId: 'merchant', avatar: '' },
    { id: 'merchant-38', name: 'ظاهر ظاهر', email: '0777242400', roleId: 'merchant', avatar: '' },
    { id: 'merchant-39', name: 'cozy on cozy', email: '0789499940', roleId: 'merchant', avatar: '' },
    { id: 'merchant-40', name: 'sunglasses jo', email: '0788784211', roleId: 'merchant', avatar: '' },
    { id: 'merchant-41', name: 'احمد الزهيري', email: '0790797946', roleId: 'merchant', avatar: '' },
    { id: 'merchant-42', name: 'جود سعد الدين', email: '0790349948', roleId: 'merchant', avatar: '' },
    { id: 'merchant-43', name: 'حديقتي حديقتي', email: '0790790506', roleId: 'merchant', avatar: '' },
    { id: 'merchant-44', name: 'قيس موبايل', email: '0775527463', roleId: 'merchant', avatar: '' },
    { id: 'merchant-45', name: 'هدومكم هدومكم', email: '0790350138', roleId: 'merchant', avatar: '' },
    { id: 'merchant-46', name: 'Roze art', email: '0791553834', roleId: 'merchant', avatar: '' },
    { id: 'merchant-47', name: 'dot dot', email: '0795639962', roleId: 'merchant', avatar: '' },
    { id: 'merchant-48', name: 'فراس بندك', email: '0795744905', roleId: 'merchant', avatar: '' },
    { id: 'merchant-49', name: 'اسيل بوتيك', email: '0795744905', roleId: 'merchant', avatar: '' },
];

type UsersState = {
    users: User[];
    addUser: (newUser: Omit<User, 'id' | 'password'>) => void;
    updateUser: (userId: string, updatedUser: Omit<User, 'id'>) => void;
    deleteUser: (userId: string) => void;
};

const generateId = () => `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const useUsersStore = create<UsersState>()(immer((set) => ({
    users: initialUsers,

    addUser: (newUser) => {
        set(state => {
            state.users.push({ ...newUser, id: generateId(), password: '123456789' });
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
                // Preserve existing password if not provided in update
                const existingPassword = state.users[userIndex].password;
                state.users[userIndex] = { ...state.users[userIndex], ...updatedUser, password: updatedUser.password || existingPassword };
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
