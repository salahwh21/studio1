
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
    { id: 'merchant-2', name: 'Brands of less', email: '0775343162', roleId: 'merchant', avatar: '' },
    { id: 'merchant-3', name: 'Roosh Cosmetics', email: '0776807347', roleId: 'merchant', avatar: '' },
    { id: 'merchant-4', name: 'SoundRush', email: '0782099324', roleId: 'merchant', avatar: '' },
    { id: 'merchant-5', name: 'Stress Killer', email: '0791399935', roleId: 'merchant', avatar: '' },
    { id: 'merchant-6', name: 'Brandlet Outlet -1', email: '0790690352', roleId: 'merchant', avatar: '' },
    { id: 'merchant-7', name: 'زينة بري', email: '0790328445', roleId: 'merchant', avatar: '' },
    { id: 'merchant-8', name: 'NBL Botigas', email: '0795768540', roleId: 'merchant', avatar: '' },
    { id: 'merchant-9', name: 'D boutique -1', email: '0799453919', roleId: 'merchant', avatar: '' },
    { id: 'merchant-10', name: 'Maciame -1', email: '0799841174', roleId: 'merchant', avatar: '' },
    { id: 'merchant-11', name: 'Jackis NYC-1', email: '0780808111', roleId: 'merchant', avatar: '' },
    { id: 'merchant-12', name: 'حور', email: '0780809601', roleId: 'merchant', avatar: '' },
    { id: 'merchant-13', name: 'Luxury Baskets - 1', email: '0796356946', roleId: 'merchant', avatar: '' },
    { id: 'merchant-14', name: 'ستايل ستيشن - 1', email: '0791000036', roleId: 'merchant', avatar: '' },
    { id: 'merchant-15', name: 'Oceanfounds -1', email: '0788451904', roleId: 'merchant', avatar: '' },
    { id: 'merchant-16', name: 'Hutter Dady', email: '0798986540', roleId: 'merchant', avatar: '' },
    { id: 'merchant-17', name: 'Travelers Cart', email: '0798888646', roleId: 'merchant', avatar: '' },
    { id: 'merchant-18', name: 'uh_test', email: '0788240454', roleId: 'merchant', avatar: '' },
    { id: 'merchant-19', name: 'catchpiece -1', email: '0796362702', roleId: 'merchant', avatar: '' },
    { id: 'merchant-20', name: 'شركة الريشة الذهبية لمستلزمات القطط', email: '0778877835', roleId: 'merchant', avatar: '' },
    { id: 'merchant-21', name: 'Market - 1', email: '079560327', roleId: 'merchant', avatar: '' },
    { id: 'merchant-22', name: 'KADI MODA, 1', email: '0796031886', roleId: 'merchant', avatar: '' },
    { id: 'merchant-23', name: 'روز جاردن', email: '0798181203', roleId: 'merchant', avatar: '' },
    { id: 'merchant-24', name: 'cat cat gold', email: '0795851102', roleId: 'merchant', avatar: '' },
    { id: 'merchant-25', name: 'Only Shirts', email: '0788482523', roleId: 'merchant', avatar: '' },
    { id: 'merchant-26', name: 'ترف', email: '07980887', roleId: 'merchant', avatar: '' },
    { id: 'merchant-27', name: 'Tactical tart', email: '0798158148', roleId: 'merchant', avatar: '' },
    { id: 'merchant-28', name: 'سانسك يام', email: '0798152152', roleId: 'merchant', avatar: '' },
    { id: 'merchant-29', name: 'Yasmeen\'s Shop', email: '0797007540', roleId: 'merchant', avatar: '' },
    { id: 'merchant-30', name: 'ريماس ريماس', email: '0798391541', roleId: 'merchant', avatar: '' },
    { id: 'merchant-31', name: 'لآلئ', email: '0788708286', roleId: 'merchant', avatar: '' },
    { id: 'merchant-32', name: 'Elegance Home - 1', email: '0798029010', roleId: 'merchant', avatar: '' },
    { id: 'merchant-33', name: 'Sweet candle - 1', email: '0796820239', roleId: 'merchant', avatar: '' },
    { id: 'merchant-34', name: 'Glowy Things', email: '0778250541', roleId: 'merchant', avatar: '' },
    { id: 'merchant-35', name: 'حوالي خود', email: '0798989575', roleId: 'merchant', avatar: '' },
    { id: 'merchant-36', name: 'Beverly Home', email: '0795893675', roleId: 'merchant', avatar: '' },
    { id: 'merchant-37', name: 'ارابيا', email: '0786776268', roleId: 'merchant', avatar: '' },
    { id: 'merchant-38', name: 'شامي', email: '0796686544', roleId: 'merchant', avatar: '' },
    { id: 'merchant-39', name: 'شمسي چوپ', email: '0796033558', roleId: 'merchant', avatar: '' },
    { id: 'merchant-40', name: 'Watermelon', email: '0795909301', roleId: 'merchant', avatar: '' },
    { id: 'merchant-41', name: 'Visionary Closet', email: '0788076038', roleId: 'merchant', avatar: '' },
    { id: 'merchant-42', name: 'The Beauty Spot', email: '0796157767', roleId: 'merchant', avatar: '' },
    { id: 'merchant-43', name: 'K BY WOMEN', email: '0788616786', roleId: 'merchant', avatar: '' },
    { id: 'merchant-44', name: 'Virtmatios', email: '0798719429', roleId: 'merchant', avatar: '' },
    { id: 'merchant-45', name: 'bags art', email: '0775037586', roleId: 'merchant', avatar: '' },
    { id: 'merchant-46', name: 'Jules thalf', email: '0798148776', roleId: 'merchant', avatar: '' },
    { id: 'merchant-47', name: 'احمد الاحمد', email: '080048967', roleId: 'merchant', avatar: '' },
    { id: 'merchant-48', name: 'عودي عودي', email: '0791548273', roleId: 'merchant', avatar: '' },
    { id: 'merchant-49', name: 'اوراد رسمية', email: '07911751146', roleId: 'merchant', avatar: '' },
    { id: 'merchant-50', name: 'yari yari', email: '0797205140', roleId: 'merchant', avatar: '' },
    { id: 'merchant-51', name: 'مصطفى مصطفى', email: '0798659958', roleId: 'merchant', avatar: '' },
    { id: 'merchant-52', name: 'عمر الكفيف', email: '0798968907', roleId: 'merchant', avatar: '' },
    { id: 'merchant-53', name: 'mabarak gift', email: '0788962286', roleId: 'merchant', avatar: '' },
    { id: 'merchant-54', name: 'ريفان ريفان', email: '0796216146', roleId: 'merchant', avatar: '' },
    { id: 'merchant-55', name: 'Waves apart', email: '0796216227', roleId: 'merchant', avatar: '' },
    { id: 'merchant-56', name: 'ميريك ميريك', email: '0798075457', roleId: 'merchant', avatar: '' },
    { id: 'merchant-57', name: 'بوتيك بوتيك', email: '0797300127', roleId: 'merchant', avatar: '' },
    { id: 'merchant-58', name: 'يوني ارت', email: '0790212227', roleId: 'merchant', avatar: '' },
    { id: 'merchant-59', name: 'sneaker fever', email: '0798975131', roleId: 'merchant', avatar: '' },
    { id: 'merchant-60', name: 'we brand', email: '0795593048', roleId: 'merchant', avatar: '' },
    { id: 'merchant-61', name: 'منال حسن', email: '0796360206', roleId: 'merchant', avatar: '' },
    { id: 'merchant-62', name: 'شي ان سارة', email: '0796446987', roleId: 'merchant', avatar: '' },
    { id: 'merchant-63', name: 'سيلاون', email: '0797844097', roleId: 'merchant', avatar: '' },
    { id: 'merchant-64', name: 'دالا الحوامدة', email: '0777055604', roleId: 'merchant', avatar: '' },
    { id: 'merchant-65', name: 'I MODELS', email: '0791158528', roleId: 'merchant', avatar: '' },
    { id: 'merchant-66', name: 'Memories Store', email: '0798989504', roleId: 'merchant', avatar: '' },
    { id: 'merchant-67', name: 'artfully pieces', email: '0799973533', roleId: 'merchant', avatar: '' },
    { id: 'merchant-68', name: 'MELLOW', email: '0796630606', roleId: 'merchant', avatar: '' },
    { id: 'merchant-69', name: 'خالد ش', email: '0799965664', roleId: 'merchant', avatar: '' },
    { id: 'merchant-70', name: 'فريجال', email: '0788870887', roleId: 'merchant', avatar: '' },
    { id: 'merchant-71', name: 'SAMRA', email: '0795565272', roleId: 'merchant', avatar: '' },
    { id: 'merchant-72', name: 'Bambeno', email: '0786305521', roleId: 'merchant', avatar: '' },
    { id: 'merchant-73', name: 'كتب كتب', email: '0798086344', roleId: 'merchant', avatar: '' },
    { id: 'merchant-74', name: 'طاهر طاهر', email: '0777242400', roleId: 'merchant', avatar: '' },
    { id: 'merchant-75', name: 'cozy on cozy', email: '0789499940', roleId: 'merchant', avatar: '' },
    { id: 'merchant-76', name: 'sunglasses jo', email: '0788784211', roleId: 'merchant', avatar: '' },
    { id: 'merchant-77', name: 'aleph', email: '0788734211', roleId: 'merchant', avatar: '' },
    { id: 'merchant-78', name: 'Salst', email: '0798757540', roleId: 'merchant', avatar: '' },
    { id: 'merchant-79', name: 'مصطفى حافظي', email: '0798342540', roleId: 'merchant', avatar: '' },
    { id: 'merchant-80', name: 'UNICITY', email: '077607135', roleId: 'merchant', avatar: '' },
    { id: 'merchant-81', name: 'فارس عودة', email: '0798796506', roleId: 'merchant', avatar: '' },
    { id: 'merchant-82', name: 'Lucky pads', email: '079008026', roleId: 'merchant', avatar: '' },
    { id: 'merchant-83', name: 'Shein Mediator', email: '079666', roleId: 'merchant', avatar: '' },
    { id: 'merchant-84', name: 'OOTD', email: '077516214', roleId: 'merchant', avatar: '' },
    { id: 'merchant-85', name: 'هومكز', email: '0779527483', roleId: 'merchant', avatar: '' },
    { id: 'merchant-86', name: 'ديالا', email: '0798806826', roleId: 'merchant', avatar: '' },
    { id: 'merchant-87', name: 'تالا', email: '079004251', roleId: 'merchant', avatar: '' },
    { id: 'merchant-88', name: 'ارادة الشعور', email: '0789062180', roleId: 'merchant', avatar: '' },
    { id: 'merchant-89', name: 'زينة الشعور', email: '079981647', roleId: 'merchant', avatar: '' },
    { id: 'merchant-90', name: 'همس الخالده', email: '0795982727', roleId: 'merchant', avatar: '' },
    { id: 'merchant-91', name: 'Piece art', email: '0788352138', roleId: 'merchant', avatar: '' },
    { id: 'merchant-92', name: 'dot dot', email: '079176538', roleId: 'merchant', avatar: '' },
    { id: 'merchant-93', name: 'Ho Gougas', email: '079815849', roleId: 'merchant', avatar: '' },
    { id: 'merchant-94', name: 'barchacelona', email: '0795738622', roleId: 'merchant', avatar: '' },
    { id: 'merchant-95', name: 'OOF lingda', email: '079871649', roleId: 'merchant', avatar: '' },
    { id: 'merchant-96', name: 'اسيل بوتيك', email: '0795744905', roleId: 'merchant', avatar: '' },
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
