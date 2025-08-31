
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
    // New Merchants list
    { id: 'merchant-1', name: 'جنان صغيرة', email: '0786633891', roleId: 'merchant', avatar: '' },
    { id: 'merchant-2', name: 'Brands of less', email: '0775343162', roleId: 'merchant', avatar: '' },
    { id: 'merchant-3', name: 'عسل', email: '0776807347', roleId: 'merchant', avatar: '' },
    { id: 'merchant-4', name: 'Roosh Cosmetics', email: '0782099324', roleId: 'merchant', avatar: '' },
    { id: 'merchant-5', name: 'SoundRush', email: '0788741262', roleId: 'merchant', avatar: '' },
    { id: 'merchant-6', name: 'سامر الطباخي', email: '0790690352', roleId: 'merchant', avatar: '' },
    { id: 'merchant-7', name: 'Stress Killer', email: '0781399935', roleId: 'merchant', avatar: '' },
    { id: 'merchant-8', name: 'Brandlet Outlet -1', email: '0776979308', roleId: 'merchant', avatar: '' },
    { id: 'merchant-9', name: 'دولي', email: '0793204555', roleId: 'merchant', avatar: '' },
    { id: 'merchant-10', name: 'زينة بوتيك', email: '0781223373', roleId: 'merchant', avatar: '' },
    { id: 'merchant-11', name: '0795768540', email: '0795768540', roleId: 'merchant', avatar: '' },
    { id: 'merchant-12', name: 'D boutique -1', email: '0799453019', roleId: 'merchant', avatar: '' },
    { id: 'merchant-13', name: 'Macrame -1', email: '0799417458', roleId: 'merchant', avatar: '' },
    { id: 'merchant-14', name: 'Jacks NYC-1', email: '0799585111', roleId: 'merchant', avatar: '' },
    { id: 'merchant-15', name: 'بدر', email: '0788069001', roleId: 'merchant', avatar: '' },
    { id: 'merchant-16', name: 'عود الجدايل', email: '0795865900', roleId: 'merchant', avatar: '' },
    { id: 'merchant-17', name: 'Luxury Baskets - 1', email: '0795350016', roleId: 'merchant', avatar: '' },
    { id: 'merchant-18', name: 'مالك موبايل - 1', email: '0791808036', roleId: 'merchant', avatar: '' },
    { id: 'merchant-19', name: 'Oceansfounds -1', email: '0798453904', roleId: 'merchant', avatar: '' },
    { id: 'merchant-20', name: 'Rubber Ducky', email: '0790965593', roleId: 'merchant', avatar: '' },
    { id: 'merchant-21', name: 'Travelers Cart', email: '0790989646', roleId: 'merchant', avatar: '' },
    { id: 'merchant-22', name: 'wh_test', email: '0788845484', roleId: 'merchant', avatar: '' },
    { id: 'merchant-23', name: 'outofpiece -1', email: '0796365702', roleId: 'merchant', avatar: '' },
    { id: 'merchant-24', name: 'د. قصي المحاسنة', email: '0778877889', roleId: 'merchant', avatar: '' },
    { id: 'merchant-25', name: 'Iconhill - 1', email: '0795032782', roleId: 'merchant', avatar: '' },
    { id: 'merchant-26', name: 'KADI MODA -1', email: '0795001395', roleId: 'merchant', avatar: '' },
    { id: 'merchant-27', name: 'عمرو النبتيتي', email: '0790181203', roleId: 'merchant', avatar: '' },
    { id: 'merchant-28', name: 'عمرو النبتيتي', email: '0790181202', roleId: 'merchant', avatar: '' },
    { id: 'merchant-29', name: 'مهند محارمه', email: '0795851162', roleId: 'merchant', avatar: '' },
    { id: 'merchant-30', name: 'Only Shirts', email: '0798482623', roleId: 'merchant', avatar: '' },
    { id: 'merchant-31', name: 'تولين دشداشة', email: '0791880567', roleId: 'merchant', avatar: '' },
    { id: 'merchant-32', name: 'Tactical tent', email: '0799887458', roleId: 'merchant', avatar: '' },
    { id: 'merchant-33', name: 'معا لنمسك بيدهم', email: '0798150153', roleId: 'merchant', avatar: '' },
    { id: 'merchant-34', name: 'غازي المر', email: '0797907918', roleId: 'merchant', avatar: '' },
    { id: 'merchant-35', name: 'Yasmeen Shop', email: '0798891541', roleId: 'merchant', avatar: '' },
    { id: 'merchant-36', name: 'زيد خليفة', email: '0781039259', roleId: 'merchant', avatar: '' },
    { id: 'merchant-37', name: 'لافي لافي', email: '0789749486', roleId: 'merchant', avatar: '' },
    { id: 'merchant-38', name: 'Elegance Home', email: '0792928010', roleId: 'merchant', avatar: '' },
    { id: 'merchant-39', name: 'Sweet candle', email: '0799685239', roleId: 'merchant', avatar: '' },
    { id: 'merchant-40', name: 'Glowy Thingz', email: '0776529541', roleId: 'merchant', avatar: '' },
    { id: 'merchant-41', name: 'Beauty Home بيوتي هوم', email: '0790989675', roleId: 'merchant', avatar: '' },
    { id: 'merchant-42', name: 'منى قباني', email: '0798908709', roleId: 'merchant', avatar: '' },
    { id: 'merchant-43', name: 'ليالي كعوش', email: '0796779264', roleId: 'merchant', avatar: '' },
    { id: 'merchant-44', name: 'السامي السامي', email: '0795595544', roleId: 'merchant', avatar: '' },
    { id: 'merchant-45', name: 'Watermelon Watermelon', email: '0795032558', roleId: 'merchant', avatar: '' },
    { id: 'merchant-46', name: 'Visionary Closet', email: '0799996991', roleId: 'merchant', avatar: '' },
    { id: 'merchant-47', name: 'حلا مراد', email: '0507963858', roleId: 'merchant', avatar: '' },
    { id: 'merchant-48', name: 'k by women', email: '0788870887', roleId: 'merchant', avatar: '' },
    { id: 'merchant-49', name: 'مشغل سيف', email: '0796157766', roleId: 'merchant', avatar: '' },
    { id: 'merchant-50', name: 'Mohammad Zamil', email: '0790719429', roleId: 'merchant', avatar: '' },
    { id: 'merchant-51', name: 'bags art', email: '0775697986', roleId: 'merchant', avatar: '' },
    { id: 'merchant-52', name: 'احمد الفريح', email: '0796148776', roleId: 'merchant', avatar: '' },
    { id: 'merchant-53', name: 'الاعتماد الاعتماد', email: '0004895785', roleId: 'merchant', avatar: '' },
    { id: 'merchant-54', name: 'هودي هودي', email: '0791558273', roleId: 'merchant', avatar: '' },
    { id: 'merchant-55', name: 'ابرة وخيط', email: '0791751140', roleId: 'merchant', avatar: '' },
    { id: 'merchant-56', name: 'yari yari', email: '0792856814', roleId: 'merchant', avatar: '' },
    { id: 'merchant-57', name: 'صلاتي صلاتي', email: '0799059050', roleId: 'merchant', avatar: '' },
    { id: 'merchant-58', name: 'درر الكويت', email: '0795865907', roleId: 'merchant', avatar: '' },
    { id: 'merchant-59', name: 'طارق زيا', email: '0788958226', roleId: 'merchant', avatar: '' },
    { id: 'merchant-60', name: 'ريتان ريتان', email: '0796216115', roleId: 'merchant', avatar: '' },
    { id: 'merchant-61', name: 'Waves sport', email: '0790212227', roleId: 'merchant', avatar: '' },
    { id: 'merchant-62', name: 'بوكيه بوكيه', email: '0796679457', roleId: 'merchant', avatar: '' },
    { id: 'merchant-63', name: 'بيوتيك بيوتيك', email: '0797300177', roleId: 'merchant', avatar: '' },
    { id: 'merchant-64', name: 'يوني آرت', email: '0798975131', roleId: 'merchant', avatar: '' },
    { id: 'merchant-65', name: 'sneaker fever', email: '0795593048', roleId: 'merchant', avatar: '' },
    { id: 'merchant-66', name: 'we brand', email: '0780858758', roleId: 'merchant', avatar: '' },
    { id: 'merchant-67', name: 'بنان خضر', email: '0796630606', roleId: 'merchant', avatar: '' },
    { id: 'merchant-68', name: 'شي ان سارة', email: '0788360254', roleId: 'merchant', avatar: '' },
    { id: 'merchant-69', name: 'مجدولين مجدولين', email: '0796446987', roleId: 'merchant', avatar: '' },
    { id: 'merchant-70', name: 'دانا الحوامدة', email: '0777055604', roleId: 'merchant', avatar: '' },
    { id: 'merchant-71', name: 'I MODELS', email: '0775522889', roleId: 'merchant', avatar: '' },
    { id: 'merchant-72', name: 'Memories Store', email: '0791150329', roleId: 'merchant', avatar: '' },
    { id: 'merchant-73', name: 'artfully pieces', email: '0799965664', roleId: 'merchant', avatar: '' },
    { id: 'merchant-74', name: 'MELLOW', email: '0799973533', roleId: 'merchant', avatar: '' },
    { id: 'merchant-75', name: 'خالد ش', email: '0795595545', roleId: 'merchant', avatar: '' },
    { id: 'merchant-76', name: 'فوغيش فوغيش', email: '0790997378', roleId: 'merchant', avatar: '' },
    { id: 'merchant-77', name: 'محمد ابو سمرة', email: '0795565272', roleId: 'merchant', avatar: '' },
    { id: 'merchant-78', name: 'مجد كميل صفحة', email: '0789358390', roleId: 'merchant', avatar: '' },
    { id: 'merchant-79', name: 'كتب كتب', email: '0786305521', roleId: 'merchant', avatar: '' },
    { id: 'merchant-80', name: 'ظاهر ظاهر', email: '0798086344', roleId: 'merchant', avatar: '' },
    { id: 'merchant-81', name: 'cozy on cozy', email: '0777242400', roleId: 'merchant', avatar: '' },
    { id: 'merchant-82', name: 'sunglasses jo', email: '0789499940', roleId: 'merchant', avatar: '' },
    { id: 'merchant-83', name: 'احمد الزهيري', email: '0788784211', roleId: 'merchant', avatar: '' },
    { id: 'merchant-84', name: 'جود سعد الدين', email: '0790797946', roleId: 'merchant', avatar: '' },
    { id: 'merchant-85', name: 'حديقتي حديقتي', email: '0790349948', roleId: 'merchant', avatar: '' },
    { id: 'merchant-86', name: 'بنان شهوان', email: '0799013502', roleId: 'merchant', avatar: '' },
    { id: 'merchant-87', name: 'قيس موبايل', email: '0790790506', roleId: 'merchant', avatar: '' },
    { id: 'merchant-88', name: 'Lucky pads', email: '0792002676', roleId: 'merchant', avatar: '' },
    { id: 'merchant-89', name: 'Shein Mediator', email: '0796447494', roleId: 'merchant', avatar: '' },
    { id: 'merchant-90', name: 'OOTD OOTD', email: '0775165727', roleId: 'merchant', avatar: '' },
    { id: 'merchant-91', name: 'هدومكم هدومكم', email: '0775527463', roleId: 'merchant', avatar: '' },
    { id: 'merchant-92', name: 'باي زي', email: '0790682649', roleId: 'merchant', avatar: '' },
    { id: 'merchant-93', name: 'عطارة زلوم', email: '0797422180', roleId: 'merchant', avatar: '' },
    { id: 'merchant-94', name: 'ارقية للبخور', email: '0799063180', roleId: 'merchant', avatar: '' },
    { id: 'merchant-95', name: 'هدى الطردة', email: '0799168727', roleId: 'merchant', avatar: '' },
    { id: 'merchant-96', name: 'Roze art', email: '0790350138', roleId: 'merchant', avatar: '' },
    { id: 'merchant-97', name: 'dot dot', email: '0791553834', roleId: 'merchant', avatar: '' },
    { id: 'merchant-98', name: 'Razan Taha', email: '0798156099', roleId: 'merchant', avatar: '' },
    { id: 'merchant-99', name: 'فراس بندك', email: '0795639962', roleId: 'merchant', avatar: '' },
    { id: 'merchant-100', name: 'OOF lingerie', email: '0797538609', roleId: 'merchant', avatar: '' },
    { id: 'merchant-101', name: 'اسيل بوتيك', email: '0795744905', roleId: 'merchant', avatar: '' },
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

    