
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
    { id: 'user-salahwh', name: 'salahwh', email: 'admin@alwameed.com', roleId: 'admin', avatar: '', password: '123' },
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
    { id: 'merchant-salaty', name: 'صلاتي صلاتي', email: '0799059050', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-yari-jewelry', name: 'Yari Jewelry', email: '0792856814', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-uniart', name: 'Uniart', email: '0798975131', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-sneaker-fever', name: 'sneaker fever', email: '0795593048', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-lucky-pads', name: 'Lucky pads', email: '0792002676', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-shein-mediator', name: 'Shein Mediator', email: '0796447494', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-ootd', name: 'OOTD', email: '0775165727', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-sunglasses', name: 'Sunglasses', email: '0789499940', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-aleph', name: 'aleph', email: '0788784211', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-jules-thrift', name: 'Jules thrift', email: '0796148776', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-yasmeen-shop', name: 'Yasmeen\'s Shop', email: '0798891541', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-beauty-home', name: 'Beauty Home', email: '0790989675', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-waves-sport', name: 'Waves sport', email: '0790212227', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-we-brand', name: 'we brand', email: '0780858758', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-kbywomen', name: 'k by women', email: '0788870887', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-kutubkutub', name: 'كتب كتب - ابو سيف', email: '0786305521', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-barchastation', name: 'Barchastation - فراس بندك', email: '0795639962', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-memoriesstore', name: 'Memories Store', email: '0791150329', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-stakarz', name: 'متجر stakarz - ظاهر ظاهر', email: '0798086344', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-cozyoncozy', name: 'cozy on cozy', email: '0777242400', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-mellow', name: 'MELLOW', email: '0799973533', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-imodels', name: 'I MODELS', email: '0775522889', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-samra', name: 'SAMRA - محمد ابو سمرة', email: '0795565272', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-hudaaltarada', name: 'هدى الطردة', email: '0799168727', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-rozeart', name: 'Roze art', email: '0790350138', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-dotdot', name: 'dot dot', email: '0791553834', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-bagsart', name: 'bags art', email: '0775697986', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-bambeno', name: 'Bambeno - مجد كميل صفحة', email: '0789358390', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-raytan', name: 'ريتان ريتان', email: '0796216115', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-fuaish', name: 'فوعيش فوعيش', email: '0790997378', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-mubarakgift', name: 'mubarak gift - طارق ريا', email: '0788958226', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-rodesigns', name: 'Ro Designs', email: '0798156099', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-onlyshirts', name: 'Only Shirts', email: '0798482623', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-tacticaltent', name: 'Tactical tent-1', email: '0799887458', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-alsami-medical', name: 'السامي للمستلزمات الطبية - خالد ش', email: '0795595545', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-majd', name: 'ماجد - جواد العبادي', email: '0785000035', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-maaldamask', name: 'معا لدمسك بيدهم', email: '0798150153', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-basmetics', name: 'basmetics - عاري المر', email: '0797907918', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-lafi', name: 'لافي لاقي', email: '0789749486', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-vamos', name: 'Vamos-1 - زيد خليفة', email: '0781039259', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-elegancehome', name: 'Elegance Home-1', email: '0792928010', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-sweetcandle', name: 'Sweet candle-1', email: '0799685239', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-artfullypieces', name: 'artfully pieces', email: '0799965664', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-ooflingerie', name: 'OOF lingerie - مجدولين مجدولين', email: '0796446987', roleId: 'merchant', avatar: '', password: '123' },
    { id: 'merchant-danahawamdeh', name: 'دانا الحوامدة', email: '0777055604', roleId: 'merchant', avatar: '', password: '123' },
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
