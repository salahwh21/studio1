
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
    { id: 'user-salahwh', name: 'Salah WH', email: 'admin@alwameed.com', roleId: 'admin', avatar: '', password: '123' },
    { id: 'user-rami', name: 'رامي عوده الله', email: '0790984807', roleId: 'supervisor', avatar: '', password: '123' },
    { id: 'user-moayad', name: 'مؤيد', email: '0096721759', roleId: 'customer_service', avatar: '', password: '123' },
    { id: 'user-razan', name: 'رزان', email: '0793204777', roleId: 'supervisor', avatar: '', password: '123' },
    { id: 'user-bahaa', name: 'bahaa', email: '0788741261', roleId: 'supervisor', avatar: '', password: '123' },

    // Drivers
    { id: 'driver-1', name: 'ابو العبد', email: '0799754316', roleId: 'driver', avatar: '', password: '123' },
    { id: 'driver-2', name: 'محمد سويد', email: '0799780790', roleId: 'driver', avatar: '', password: '123' },
    { id: 'driver-3', name: 'احمد عزاوي', email: '0787085576', roleId: 'driver', avatar: '', password: '123' },
    { id: 'driver-4', name: 'محافظات', email: '0778132881', roleId: 'driver', avatar: '', password: '123' },
    { id: 'driver-5', name: 'Ebox', email: '0797953190', roleId: 'driver', avatar: '', password: '123' },
    { id: 'driver-6', name: 'سامي سويد', email: '0797274740', roleId: 'driver', avatar: '', password: '123' },
    { id: 'driver-7', name: 'مجد كميل', email: '0789358393', roleId: 'driver', avatar: '', password: '123' },
    { id: 'driver-8', name: 'سامر الطباخي', email: '0790690353', roleId: 'driver', avatar: '', password: '123' },
    { id: 'driver-9', name: 'فارس الأسمر', email: '0795365013', roleId: 'driver', avatar: '', password: '123' },
    { id: 'driver-10', name: 'حسن زيغان', email: '0786112230', roleId: 'driver', avatar: '', password: '123' },

    // Merchants
    { id: 'merchant-5', name: 'SoundRush', email: '0788741262', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-stress-killer', name: 'Stress Killer', email: '0790690352', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-brandlet-outlet', name: 'Brandlet Outlet -1', email: '0781399935', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-nl-botique', name: 'N&L Botique', email: '0781223373', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-d-boutique', name: 'D boutique -1', email: '0795768540', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-macrame', name: 'Macrame -1', email: '0799453019', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-jacks-nyc', name: 'Jacks NYC-1', email: '0799417458', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-bader', name: 'بدر', email: '0788069001', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-oud-aljadail', name: 'عود الجدايل', email: '0795865900', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-luxury-baskets', name: 'Luxury Baskets - 1', email: '0795350016', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-malek-mobile', name: 'مالك موبايل - 1', email: '0791808036', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-oceansfounds', name: 'Oceansfounds -1', email: '0798453904', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-rubber-ducky', name: 'Rubber Ducky', email: '0790965593', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-travelers-cart', name: 'Travelers Cart', email: '0790989646', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-outofpiece', name: 'outofpiece -1', email: '0796365702', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-kadi-moda', name: 'KADI MODA -1', email: '0778877889', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-oud-w-mesk', name: 'عود ومسك', email: '0795001395', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-oud-gold', name: 'oud gold', email: '0790181203', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-amro-alnabtiti', name: 'عمرو النبتيتي', email: '0790181202', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-glowy-thingz', name: 'Glowy Thingz', email: '0776529541', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-vintage', name: 'Vintage', email: '0798908709', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-layali', name: 'ليالي', email: '0796779264', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-alsami-jadeed', name: 'السامي جديد', email: '0795595544', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-alsami', name: 'السامي', email: '0795032558', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-watermelon', name: 'Watermelon', email: '0799996991', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-visionary-closet', name: 'Visionary Closet', email: '0507963858', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-the-beauty-spot', name: 'The beauty Spot', email: '0799996991', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-ibra-w-khayt', name: 'ابرة وخيط', email: '0791751140', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-mashghal-saif', name: 'مشغل سيف', email: '0796157766', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-vintromatica', name: 'Vintromatica', email: '0790719429', roleId: 'merchant', avatar: '', password: '123' },
];


type UsersState = {
    users: User[];
    addUser: (newUser: Omit<User, 'id' | 'password'>) => void;
    updateUser: (userId: string, updatedUser: Partial<Omit<User, 'id'>>) => void;
    updateCurrentUser: (updatedFields: Partial<Omit<User, 'id' | 'roleId'>>) => void;
    deleteUser: (userIds: string[]) => void;
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
            const userIndex = state.users.findIndex(u => u.id === 'user-salahwh'); // Hardcoded admin user ID
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
