const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// جميع المستخدمين من الـ store
const allUsers = [
  // Admins and Staff
  { id: 'user-salahwh', name: 'salahwh', storeName: 'salahwh', email: 'admin@alwameed.com', roleId: 'admin', avatar: '', password: '123' },
  { id: 'user-rami', name: 'رامي عوده الله', storeName: 'رامي عوده الله', email: '0790984807', roleId: 'supervisor', avatar: '', password: '123' },
  { id: 'user-moayad', name: 'مؤيد', storeName: 'مؤيد', email: '0096721759', roleId: 'customer_service', avatar: '', password: '123' },
  { id: 'user-razan', name: 'رزان', storeName: 'رزان', email: '0793204777', roleId: 'supervisor', avatar: '', password: '123' },
  { id: 'user-bahaa', name: 'bahaa', storeName: 'bahaa', email: '0788741261', roleId: 'supervisor', avatar: '', password: '123' },
  
  // Drivers
  { id: 'driver-1', name: 'ابو العبد', storeName: 'ابو العبد', email: '0799754316', roleId: 'driver', avatar: '', password: '123' },
  { id: 'driver-2', name: 'محمد سويد', storeName: 'محمد سويد', email: '0799780790', roleId: 'driver', avatar: '', password: '123' },
  { id: 'driver-3', name: 'احمد عزاوي', storeName: 'احمد عزاوي', email: '0787085576', roleId: 'driver', avatar: '', password: '123' },
  { id: 'driver-4', name: 'محافظات', storeName: 'محافظات', email: '0778132881', roleId: 'driver', avatar: '', password: '123' },
  { id: 'driver-5', name: 'Ebox', storeName: 'Ebox', email: '0797953190', roleId: 'driver', avatar: '', password: '123' },
  { id: 'driver-6', name: 'سامي سويد', storeName: 'سامي سويد', email: '0797274740', roleId: 'driver', avatar: '', password: '123' },
  { id: 'driver-7', name: 'مجد كميل', storeName: 'مجد كميل', email: '0789358393', roleId: 'driver', avatar: '', password: '123' },
  { id: 'driver-8', name: 'سامر الطباخي', storeName: 'سامر الطباخي', email: '0790690353', roleId: 'driver', avatar: '', password: '123', priceListId: 'pl_1-5_3' },
  { id: 'driver-9', name: 'فارس الأسمر', storeName: 'فارس الأسمر', email: '0795365013', roleId: 'driver', avatar: '', password: '123' },
  { id: 'driver-10', name: 'حسن زيغان', storeName: 'حسن زيغان', email: '0786112230', roleId: 'driver', avatar: '', password: '123' },

  // Merchants (96 تاجر)
  { id: 'merchant-1', name: 'جنان صغيرة', storeName: 'جنان صغيرة', email: '0786633891', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-2', name: 'Brands of less', storeName: 'Brands of less', email: '0775343162', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
  { id: 'merchant-3', name: 'عسل', storeName: 'عسل', email: '0776807347', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-4', name: 'Roosh Cosmetics', storeName: 'Roosh Cosmetics', email: '0782099324', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-5', name: 'Stress Killer', storeName: 'Stress Killer', email: '0781399935', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
  { id: 'merchant-6', name: 'Brandlet Outlet -1', storeName: 'Brandlet Outlet -1', email: '0776979308', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
  { id: 'merchant-7', name: 'زينة بوتيك', storeName: 'زينة بوتيك', email: '0781223373', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_2_5' },
  { id: 'merchant-8', name: '0795768540', storeName: 'N&L Botique', email: '0795768540', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
  { id: 'merchant-9', name: 'D boutique -1', storeName: 'D boutique -1', email: '0799453019', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
  { id: 'merchant-10', name: 'Macrame -1', storeName: 'Macrame -1', email: '0799417458', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5_3_5' },
  { id: 'merchant-11', name: 'Jacks NYC-1', storeName: 'Jacks NYC-1', email: '0799585111', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
  { id: 'merchant-12', name: 'بدر', storeName: 'بدر', email: '0788069001', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_3_3_5' },
  { id: 'merchant-13', name: 'عود الجدايل', storeName: 'عود الجدايل', email: '0795865900', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
  { id: 'merchant-14', name: 'Luxury Baskets - 1', storeName: 'Luxury Baskets - 1', email: '0795350016', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5_3_5' },
  { id: 'merchant-15', name: 'مالك موبايل - 1', storeName: 'مالك موبايل - 1', email: '0791808036', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
  { id: 'merchant-16', name: 'Oceansfounds -1', storeName: 'Oceansfounds -1', email: '0798453904', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
  { id: 'merchant-17', name: 'Rubber Ducky', storeName: 'Rubber Ducky', email: '0790965593', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5' },
  { id: 'merchant-18', name: 'Travelers Cart', storeName: 'Travelers Cart', email: '0790989646', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5_3_5' },
  { id: 'merchant-19', name: 'outofpiece -1', storeName: 'outofpiece -1', email: '0796365702', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-20', name: 'د. قصي المحاسنة', storeName: 'شركة الزنبقة الذهبية لمستحضرات التجميل', email: '0778877889', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
  { id: 'merchant-21', name: 'KADI MODA -1', storeName: 'KADI MODA -1', email: '0795001395', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-22', name: 'عمرو النبتيتي', storeName: 'عود ومسك', email: '0790181203', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-23', name: 'عمرو النبتيتي', storeName: 'oud gold', email: '0790181202', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-24', name: 'Glowy Thingz', storeName: 'Glowy Thingz', email: '0776529541', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-25', name: 'منى قباني', storeName: 'Vintage', email: '0798908709', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-26', name: 'ليالي كعوش', storeName: 'ليالي', email: '0796779264', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5_3_5' },
  { id: 'merchant-27', name: 'السامي السامي', storeName: 'السامي جديد', email: '0795595544', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_alsami' },
  { id: 'merchant-28', name: 'Watermelon Watermelon', storeName: 'Watermelon', email: '0795032558', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-29', name: 'Visionary Closet', storeName: 'Visionary Closet', email: '0799996991', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
  { id: 'merchant-30', name: 'حلا مراد', storeName: 'The beauty Spot', email: '0507963858', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-31', name: 'ابرة وخيط', storeName: 'ابرة وخيط', email: '0791751140', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5_3_5' },
  { id: 'merchant-32', name: 'مشغل سيف', storeName: 'مشغل سيف', email: '0796157766', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-33', name: 'Mohammad Zamil', storeName: 'Vintromatica', email: '0790719429', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5_3_5' },
  { id: 'merchant-34', name: 'صلاتي صلاتي', storeName: 'صلاتي', email: '0799059050', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-35', name: 'yari yari', storeName: 'Yari Jewelry', email: '0792856814', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5_3_5' },
  { id: 'merchant-36', name: 'درر الكويت', storeName: 'اطباب درر الكويت', email: '0795865907', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
  { id: 'merchant-37', name: 'بيوتيك بيوتيك', storeName: 'بيوتيك', email: '0797300177', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5_3_5' },
  { id: 'merchant-38', name: 'يوني آرت', storeName: 'Uniart', email: '0798975131', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5_3_5' },
  { id: 'merchant-39', name: 'sneaker fever', storeName: 'sneaker fever', email: '0795593048', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-40', name: 'جود سعد الدين', storeName: 'Salat', email: '0790797946', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
  { id: 'merchant-41', name: 'بنان شهوان', storeName: 'UNICICTY', email: '0799013502', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-42', name: 'قيس موبايل', storeName: 'قيس موبايل', email: '0790790506', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-43', name: 'حديقتي حديقتي', storeName: 'حديقتي', email: '0790349948', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-44', name: 'Lucky pads', storeName: 'Lucky pads', email: '0792002676', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-45', name: 'Shein Mediator', storeName: 'Shein Mediator', email: '0796447494', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-46', name: 'OOTD OOTD', storeName: 'OOTD', email: '0775165727', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-47', name: 'هدومكم هدومكم', storeName: 'هدومكم', email: '0775527463', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5_3_5' },
  { id: 'merchant-48', name: 'باي زي', storeName: 'متجر', email: '0790682649', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-49', name: 'sunglasses jo', storeName: 'Sunglasses', email: '0789499940', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-50', name: 'احمد الزهيري', storeName: 'aleph', email: '0788784211', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-51', name: 'عطارة زلوم', storeName: 'زلوم', email: '0797422180', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5_3_5' },
  { id: 'merchant-52', name: 'ارقية للبخور', storeName: 'ارقية للبخور', email: '0799063180', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
  { id: 'merchant-53', name: 'احمد الفريح', storeName: 'Jules thrift', email: '0796148776', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-54', name: 'تولين دشداشة', storeName: 'دشداشة', email: '0791880567', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-55', name: 'Yasmeen Shop', storeName: 'Yasmeen\'s Shop', email: '0798891541', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5_3_5' },
  { id: 'merchant-56', name: 'Beauty Home بيوتي هوم', storeName: 'بيوتي هوم', email: '0790989675', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-57', name: 'الاعتماد الاعتماد', storeName: 'الاعتماد', email: '0004895785', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5_3_5' },
  { id: 'merchant-58', name: 'هودي هودي', storeName: 'هودي', email: '0791558273', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
  { id: 'merchant-59', name: 'Waves sport', storeName: 'Waves sport', email: '0790212227', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5_3_5' },
  { id: 'merchant-60', name: 'بوكيه بوكيه', storeName: 'بوكيه', email: '0796679457', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-61', name: 'we brand', storeName: 'we brand', email: '0780858758', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-62', name: 'بنان خضر', storeName: 'يافا ستور', email: '0796630606', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
  { id: 'merchant-63', name: 'شي ان سارة', storeName: 'شي ان سارة', email: '0788360254', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-64', name: 'اسيل بوتيك', storeName: 'اسيل بوتيك', email: '0795744905', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
  { id: 'merchant-65', name: 'k by women', storeName: 'K BY WOMEN', email: '0788870887', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_3_5' },
  { id: 'merchant-66', name: 'كتب كتب', storeName: 'كتب', email: '0786305521', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_abu_saif' },
  { id: 'merchant-67', name: 'فراس بندك', storeName: 'Barchastation', email: '0795639962', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-68', name: 'Memories Store', storeName: 'Memories Store', email: '0791150329', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
  { id: 'merchant-69', name: 'ظاهر ظاهر', storeName: 'متجر stakarz', email: '0798086344', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-70', name: 'cozy on cozy', storeName: 'cozy on', email: '0777242400', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-71', name: 'MELLOW', storeName: 'MELLOW', email: '0799973533', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
  { id: 'merchant-72', name: 'I MODELS', storeName: 'I MODELS', email: '0775522889', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5_3_5' },
  { id: 'merchant-73', name: 'محمد ابو سمرة', storeName: 'SAMRA', email: '0795565272', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-74', name: 'هدى الطردة', storeName: 'هدى الطردة', email: '0799168727', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5_3_5' },
  { id: 'merchant-75', name: 'Roze art', storeName: 'Roze art', email: '0790350138', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5' },
  { id: 'merchant-76', name: 'dot dot', storeName: 'dot', email: '0791553834', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_2_5' },
  { id: 'merchant-77', name: 'bags art', storeName: 'bags art', email: '0775697986', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-78', name: 'مجد كميل صفحة', storeName: 'Bambeno', email: '0789358390', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-79', name: 'ريتان ريتان', storeName: 'ريتان', email: '0796216115', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-80', name: 'فوغيش فوغيش', storeName: 'فوغيش', email: '0790997378', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5' },
  { id: 'merchant-81', name: 'طارق زيا', storeName: 'mubarak gift', email: '0788958226', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-82', name: 'Razan Taha', storeName: 'Ro Designs', email: '0798156099', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-83', name: 'Only Shirts', storeName: 'Only Shirts', email: '0798482623', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-84', name: 'Tactical tent', storeName: 'Tactical tent-1', email: '0799887458', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
  { id: 'merchant-85', name: 'خالد ش', storeName: 'السامي للمستلزمات الطبية', email: '0795595545', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_alsami' },
  { id: 'merchant-86', name: 'جواد العبادي', storeName: 'ماجد', email: '0785000035', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_majd' },
  { id: 'merchant-87', name: 'معا لنمسك بيدهم', storeName: 'معا لنمسك بيدهم', email: '0798150153', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-88', name: 'غازي المر', storeName: 'basmetics', email: '0797907918', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-89', name: 'لافي لافي', storeName: 'لافي', email: '0789749486', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
  { id: 'merchant-90', name: 'زيد خليفة', storeName: 'Vamos -1', email: '0781039259', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
  { id: 'merchant-91', name: 'Elegance Home', storeName: 'Elegance Home -1', email: '0792928010', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5_3_5' },
  { id: 'merchant-92', name: 'Sweet candle', storeName: 'Sweet candle - 1', email: '0799685239', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
  { id: 'merchant-93', name: 'artfully pieces', storeName: 'artfully pieces', email: '0799965664', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5_3_5' },
  { id: 'merchant-94', name: 'مجدولين مجدولين', storeName: 'مجدولين', email: '0796446987', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2-5_3' },
  { id: 'merchant-95', name: 'OOF lingerie', storeName: 'OOF lingerie', email: '0797538609', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_1' },
  { id: 'merchant-96', name: 'دانا الحوامدة', storeName: 'دانا حوامدة', email: '0777055604', roleId: 'merchant', avatar: '', password: '123', priceListId: 'pl_2_5_3_5' },
];

// جميع المدن والمناطق
const allCities = [
  { id: 'CITY_AMM', name: 'عمان' },
  { id: 'CITY_IRB', name: 'إربد' },
  { id: 'CITY_ZRQ', name: 'الزرقاء' },
  { id: 'CITY_AQB', name: 'العقبة' },
  { id: 'CITY_KRK', name: 'الكرك' },
  { id: 'CITY_MAN', name: 'معان' },
  { id: 'CITY_SLT', name: 'السلط' },
  { id: 'CITY_MAD', name: 'مأدبا' },
];

const allRegions = [
  // عمان - 15 منطقة
  { id: 'REG_AMM_001', name: 'تلاع العلي', cityId: 'CITY_AMM' },
  { id: 'REG_AMM_002', name: 'عبدون', cityId: 'CITY_AMM' },
  { id: 'REG_AMM_003', name: 'الصويفية', cityId: 'CITY_AMM' },
  { id: 'REG_AMM_004', name: 'دابوق', cityId: 'CITY_AMM' },
  { id: 'REG_AMM_005', name: 'خلدا', cityId: 'CITY_AMM' },
  { id: 'REG_AMM_006', name: 'الجاردنز', cityId: 'CITY_AMM' },
  { id: 'REG_AMM_007', name: 'مرج الحمام', cityId: 'CITY_AMM' },
  { id: 'REG_AMM_008', name: 'الجبيهة', cityId: 'CITY_AMM' },
  { id: 'REG_AMM_009', name: 'جبل الحسين', cityId: 'CITY_AMM' },
  { id: 'REG_AMM_010', name: 'جبل عمان', cityId: 'CITY_AMM' },
  { id: 'REG_AMM_011', name: 'الشميساني', cityId: 'CITY_AMM' },
  { id: 'REG_AMM_012', name: 'العبدلي', cityId: 'CITY_AMM' },
  { id: 'REG_AMM_013', name: 'دير غبار', cityId: 'CITY_AMM' },
  { id: 'REG_AMM_014', name: 'ماركا', cityId: 'CITY_AMM' },
  { id: 'REG_AMM_015', name: 'أبو نصير', cityId: 'CITY_AMM' },
  
  // إربد - 4 مناطق
  { id: 'REG_IRB_001', name: 'وسط البلد', cityId: 'CITY_IRB' },
  { id: 'REG_IRB_002', name: 'حي الحصن', cityId: 'CITY_IRB' },
  { id: 'REG_IRB_003', name: 'الحي الشرقي', cityId: 'CITY_IRB' },
  { id: 'REG_IRB_004', name: 'شارع الجامعة', cityId: 'CITY_IRB' },
  
  // الزرقاء - 4 مناطق
  { id: 'REG_ZRQ_001', name: 'وسط الزرقاء', cityId: 'CITY_ZRQ' },
  { id: 'REG_ZRQ_002', name: 'الزرقاء الجديدة', cityId: 'CITY_ZRQ' },
  { id: 'REG_ZRQ_003', name: 'جبل طارق', cityId: 'CITY_ZRQ' },
  { id: 'REG_ZRQ_004', name: 'الهاشمية', cityId: 'CITY_ZRQ' },
  
  // باقي المدن
  { id: 'REG_AQB_001', name: 'وسط العقبة', cityId: 'CITY_AQB' },
  { id: 'REG_KRK_001', name: 'وسط الكرك', cityId: 'CITY_KRK' },
  { id: 'REG_MAN_001', name: 'وسط معان', cityId: 'CITY_MAN' },
  { id: 'REG_SLT_001', name: 'وسط السلط', cityId: 'CITY_SLT' },
  { id: 'REG_MAD_001', name: 'وسط مأدبا', cityId: 'CITY_MAD' },
];

async function importData() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 بدء استيراد البيانات الموجودة...\n');
    await client.query('BEGIN');

    // 0. حذف المستخدمين القدامى فقط (نحافظ على المدن والمناطق)
    console.log('🗑️  حذف المستخدمين القدامى...');
    await client.query('DELETE FROM users');
    console.log('✅ تم حذف المستخدمين القدامى\n');

    // 1. استيراد المستخدمين
    console.log('👥 استيراد المستخدمين...');
    const hashedPassword = await bcrypt.hash('123', 10);
    
    let adminCount = 0, driverCount = 0, merchantCount = 0, otherCount = 0;
    
    for (const user of allUsers) {
      await client.query(
        `INSERT INTO users (id, name, email, password, role_id, store_name, avatar, price_list_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE 
         SET name = $2, email = $3, role_id = $5, store_name = $6, avatar = $7, price_list_id = $8`,
        [
          user.id, 
          user.name, 
          user.email, 
          hashedPassword, 
          user.roleId, 
          user.storeName || user.name,
          user.avatar || '',
          user.priceListId || null
        ]
      );
      
      // عد المستخدمين حسب النوع
      if (user.roleId === 'admin' || user.roleId === 'supervisor' || user.roleId === 'customer_service') {
        adminCount++;
      } else if (user.roleId === 'driver') {
        driverCount++;
      } else if (user.roleId === 'merchant') {
        merchantCount++;
      } else {
        otherCount++;
      }
    }
    
    console.log(`✅ تم استيراد ${allUsers.length} مستخدم:`);
    console.log(`   - ${adminCount} مدير/موظف`);
    console.log(`   - ${driverCount} سائق`);
    console.log(`   - ${merchantCount} تاجر`);
    if (otherCount > 0) console.log(`   - ${otherCount} آخرين`);
    console.log('');

    // 2. تحديث عدد المستخدمين في جدول الأدوار
    console.log('🔄 تحديث عدد المستخدمين في الأدوار...');
    const roleCounts = await client.query(`
      SELECT role_id, COUNT(*) as count 
      FROM users 
      GROUP BY role_id
    `);
    
    for (const row of roleCounts.rows) {
      await client.query(
        `UPDATE roles SET user_count = $1 WHERE id = $2`,
        [parseInt(row.count), row.role_id]
      );
    }
    console.log('✅ تم تحديث عدد المستخدمين في الأدوار\n');

    await client.query('COMMIT');
    
    console.log('🎉 تم استيراد المستخدمين بنجاح!\n');
    console.log('📊 ملخص:');
    console.log(`   ✓ ${allUsers.length} مستخدم (${adminCount} موظف، ${driverCount} سائق، ${merchantCount} تاجر)`);
    console.log('\n✨ المدن والمناطق محفوظة في قاعدة البيانات!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ خطأ في استيراد البيانات:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

importData().catch(console.error);
