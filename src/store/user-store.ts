
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
    priceListId?: string; // To link merchant to a price list
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
    { id: 'merchant-jenan', name: 'جنان صغيرة - جنان صغيرة', email: '0786633891', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-brands-of-less', name: 'Brands of less - Brands of less', email: '0775343162', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
    { id: 'merchant-asal', name: 'عسل - عسل', email: '0776807347', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-roosh-cosmetics', name: 'Roosh Cosmetics - Roosh Cosmetics', email: '0782099324', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-stress-killer', name: 'Stress Killer - Stress Killer', email: '0781399935', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
    { id: 'merchant-brandlet-outlet', name: 'Brandlet Outlet -1 - Brandlet Outlet -1', email: '0776979308', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
    { id: 'merchant-zeina-boutique', name: 'زينة بوتيك - زينة بوتيك', email: '0781223373', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_2_5' },
    { id: 'merchant-nl-botique', name: 'N&L Botique - 0795768540', email: '0795768540', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
    { id: 'merchant-d-boutique', name: 'D boutique -1 - D boutique -1', email: '0799453019', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
    { id: 'merchant-macrame', name: 'Macrame -1 - Macrame -1', email: '0799417458', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3_5' },
    { id: 'merchant-jacks-nyc', name: 'Jacks NYC-1 - Jacks NYC-1', email: '0799585111', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
    { id: 'merchant-bader', name: 'بدر - بدر', email: '0788069001', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_3_3_5' },
    { id: 'merchant-oud-aljadail', name: 'عود الجدايل - عود الجدايل', email: '0795865900', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
    { id: 'merchant-luxury-baskets', name: 'Luxury Baskets - 1 - Luxury Baskets - 1', email: '0795350016', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3_5' },
    { id: 'merchant-malek-mobile', name: 'مالك موبايل - 1 - مالك موبايل - 1', email: '0791808036', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
    { id: 'merchant-oceansfounds', name: 'Oceansfounds -1 - Oceansfounds -1', email: '0798453904', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
    { id: 'merchant-rubber-ducky', name: 'Rubber Ducky - Rubber Ducky', email: '0790965593', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5' },
    { id: 'merchant-travelers-cart', name: 'Travelers Cart - Travelers Cart', email: '0790989646', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3_5' },
    { id: 'merchant-outofpiece', name: 'outofpiece -1 - outofpiece -1', email: '0796365702', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-golden-lily', name: 'شركة الزنبقة الذهبية لمستحضرات التجميل - د. قصي المحاسنة', email: '0778877889', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
    { id: 'merchant-kadi-moda', name: 'KADI MODA -1 - KADI MODA -1', email: '0795001395', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-oud-w-mesk', name: 'عود ومسك - عمرو النبتيتي', email: '0790181203', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-oud-gold', name: 'oud gold - عمرو النبتيتي', email: '0790181202', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-nitrous', name: 'Nitrous - مهند محارمه', email: '0795851162', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_nitrous' },
    { id: 'merchant-glowy-thingz', name: 'Glowy Thingz - Glowy  Thingz', email: '0776529541', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-vintage', name: 'Vintage - منى  قباني', email: '0798908709', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-layali', name: 'ليالي - ليالي كعوش', email: '0796779264', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3_5' },
    { id: 'merchant-alsami-jadeed', name: 'السامي جديد - السامي السامي', email: '0795595544', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_alsami' },
    { id: 'merchant-watermelon', name: 'Watermelon - Watermelon Watermelon', email: '0795032558', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-visionary-closet', name: 'Visionary Closet - Visionary Closet', email: '0799996991', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
    { id: 'merchant-the-beauty-spot', name: 'The beauty Spot - حلا مراد', email: '0507963858', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-ibra-w-khayt', name: 'ابرة وخيط - ابرة وخيط', email: '0791751140', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3_5' },
    { id: 'merchant-mashghal-saif', name: 'مشغل سيف - مشغل سيف', email: '0796157766', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-vintromatica', name: 'Vintromatica - Mohammad Zamil', email: '0790719429', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3_5' },
    { id: 'merchant-salati', name: 'صلاتي - صلاتي صلاتي', email: '0799059050', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-yari-jewelry', name: 'Yari Jewelry - yari yari', email: '0792856814', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3_5' },
    { id: 'merchant-durar-alkuwait', name: 'اطباب درر الكويت - درر الكويت', email: '0795865907', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
    { id: 'merchant-biotech', name: 'بيوتيك - بيوتيك بيوتيك', email: '0797300177', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3_5' },
    { id: 'merchant-uniart', name: 'Uniart - يوني آرت', email: '0798975131', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3_5' },
    { id: 'merchant-sneaker-fever', name: 'sneaker fever - sneaker fever', email: '0795593048', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-salat', name: 'Salat - جود سعد الدين', email: '0790797946', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
    { id: 'merchant-unicity', name: 'UNICICTY - بنان شهوان', email: '0799013502', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-qais-mobile', name: 'قيس موبايل - قيس موبايل', email: '0790790506', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-hadikati', name: 'حديقتي - حديقتي حديقتي', email: '0790349948', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-lucky-pads', name: 'Lucky pads - Lucky pads', email: '0792002676', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-shein-mediator', name: 'Shein Mediator - Shein  Mediator', email: '0796447494', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-ootd', name: 'OOTD - OOTD OOTD', email: '0775165727', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-hedoomcom', name: 'هدومكم - هدومكم هدومكم', email: '0775527463', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3_5' },
    { id: 'merchant-by-zee', name: 'متجر - باي زي', email: '0790682649', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-sunglasses-jo', name: 'Sunglasses - sunglasses jo', email: '0789499940', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-aleph', name: 'aleph - احمد  الزهيري', email: '0788784211', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-attara-zaloom', name: 'زلوم - عطارة زلوم', email: '0797422180', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3_5' },
    { id: 'merchant-arqia-perfumes', name: 'ارقية للبخور - ارقية للبخور', email: '0799063180', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
    { id: 'merchant-jules-thrift', name: 'Jules thrift - احمد  الفريح', email: '0796148776', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-dashdasha', name: 'دشداشة - تولين دشداشة', email: '0791880567', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-yasmeen-shop', name: 'Yasmeen\'s Shop - Yasmeen Shop', email: '0798891541', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3_5' },
    { id: 'merchant-beauty-home', name: 'بيوتي هوم - Beauty Home بيوتي هوم', email: '0790989675', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-al-etimad', name: 'الاعتماد - الاعتماد الاعتماد', email: '0004895785', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3_5' },
    { id: 'merchant-hodi-hodi', name: 'هودي - هودي هودي', email: '0791558273', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
    { id: 'merchant-waves-sport', name: 'Waves sport - Waves sport', email: '0790212227', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3_5' },
    { id: 'merchant-bouquet', name: 'بوكيه - بوكيه بوكيه', email: '0796679457', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-we-brand', name: 'we brand - we brand', email: '0780858758', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-yafa-store', name: 'يافا ستور - بنان  خضر', email: '0796630606', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
    { id: 'merchant-shein-sara', name: 'شي ان سارة - شي ان سارة', email: '0788360254', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-aseel-boutique', name: 'اسيل بوتيك - اسيل بوتيك', email: '0795744905', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
    { id: 'merchant-k-by-women', name: 'K BY WOMEN - k by women', email: '0788870887', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_3_5' },
    { id: 'merchant-kutub-kutub', name: 'كتب - كتب كتب', email: '0786305521', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_abu_saif' },
    { id: 'merchant-barchastation', name: 'Barchastation - فراس بندك', email: '0795639962', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-memories-store', name: 'Memories Store - Memories Store', email: '0791150329', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
    { id: 'merchant-stakarz', name: 'متجر stakarz - ظاهر ظاهر', email: '0798086344', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-cozy-on-cozy', name: 'cozy on - cozy on cozy', email: '0777242400', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-mellow', name: 'MELLOW - MELLOW', email: '0799973533', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
    { id: 'merchant-i-models', name: 'I MODELS - I MODELS', email: '0775522889', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3_5' },
    { id: 'merchant-samra', name: 'SAMRA - محمد  ابو سمرة', email: '0795565272', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-huda-altarada', name: 'هدى الطردة - هدى الطردة', email: '0799168727', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3_5' },
    { id: 'merchant-roze-art', name: 'Roze art - Roze art', email: '0790350138', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5' },
    { id: 'merchant-dot-dot', name: 'dot - dot dot', email: '0791553834', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_2_5' },
    { id: 'merchant-bags-art', name: 'bags art - bags art', email: '0775697986', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-bambeno', name: 'Bambeno - مجد كميل صفحة', email: '0789358390', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-ritan', name: 'ريتان - ريتان ريتان', email: '0796216115', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-fougish', name: 'فوغيش - فوغيش فوغيش', email: '0790997378', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5' },
    { id: 'merchant-mubarak-gift', name: 'mubarak gift - طارق زيا', email: '0788958226', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-ro-designs', name: 'Ro Designs - Razan Taha', email: '0798156099', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-only-shirts', name: 'Only Shirts - Only Shirts', email: '0798482623', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-tactical-tent', name: 'Tactical tent-1 - Tactical tent', email: '0799887458', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
    { id: 'merchant-alsami-medical', name: 'السامي للمستلزمات الطبية - خالد ش', email: '0795595545', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_alsami' },
    { id: 'merchant-majd', name: 'ماجد - جواد العبادي', email: '0785000035', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_majd' },
    { id: 'merchant-ma3an-lidamsk', name: 'معا لنمسك بيدهم - معا لنمسك بيدهم', email: '0798150153', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-basmetics', name: 'basmetics - غازي  المر', email: '0797907918', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-lafi', name: 'لافي - لافي لافي', email: '0789749486', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
    { id: 'merchant-vamos', name: 'Vamos -1 - زيد خليفة', email: '0781039259', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
    { id: 'merchant-elegance-home', name: 'Elegance Home -1 - Elegance Home', email: '0792928010', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3_5' },
    { id: 'merchant-sweet-candle', name: 'Sweet candle - 1 - Sweet  candle', email: '0799685239', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
    { id: 'merchant-artfully-pieces', name: 'artfully pieces - artfully pieces', email: '0799965664', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3_5' },
    { id: 'merchant-majdoulin', name: 'مجدولين - مجدولين مجدولين', email: '0796446987', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
    { id: 'merchant-oof-lingerie', name: 'OOF lingerie - OOF  lingerie', email: '0797538609', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
    { id: 'merchant-danahawamdeh', name: 'دانا حوامدة - دانا الحوامدة', email: '0777055604', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3_5' },
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

    