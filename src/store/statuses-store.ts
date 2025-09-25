
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type Status = {
  id: string;
  code: string;
  name: string;
  icon: string;
  color: string;
  isActive: boolean;
  reasonCodes: string[];
  setByRoles: string[];
  visibleTo: {
    admin: boolean;
    driver: boolean;
    merchant: boolean;
  };
  permissions: {
    driver: {
      canSet: boolean;
      requireProof: boolean;
      allowCODCollection: boolean;
    };
    merchant: {
      showInPortal: boolean;
      showInReports: boolean;
    };
    admin: {
      lockPriceEdit: boolean;
      lockAddressEdit: boolean;
    };
  };
  flow: {
    isEntry: boolean;
    isFinal: boolean;
    nextCodes: string[];
    blockedFrom: string[];
  };
  triggers: {
    requiresReason: boolean;
    createsReturnTask: boolean;
    sendsCustomerMessage: boolean;
    updatesDriverAccount: boolean;
  };
};

const initialStatuses: Status[] = [
  {
    id: "STS_001",
    code: "PENDING",
    name: "بالانتظار",
    icon: "Clock",
    color: "#607D8B",
    isActive: true,
    reasonCodes: [],
    setByRoles: ["admin", "merchant"],
    visibleTo: { admin: true, driver: true, merchant: true },
    permissions: {
      driver: { canSet: false, requireProof: false, allowCODCollection: false },
      merchant: { showInPortal: true, showInReports: true },
      admin: { lockPriceEdit: false, lockAddressEdit: false },
    },
    flow: { isEntry: true, isFinal: false, nextCodes: ["OUT_FOR_DELIVERY", "CANCELLED"], blockedFrom: [] },
    triggers: { requiresReason: false, createsReturnTask: false, sendsCustomerMessage: false, updatesDriverAccount: false },
  },
  {
    id: "STS_002",
    code: "OUT_FOR_DELIVERY",
    name: "جاري التوصيل",
    icon: "Truck",
    color: "#1976D2",
    isActive: true,
    reasonCodes: [],
    setByRoles: ["admin"],
    visibleTo: { admin: true, driver: true, merchant: true },
    permissions: {
      driver: { canSet: true, requireProof: false, allowCODCollection: false },
      merchant: { showInPortal: true, showInReports: true },
      admin: { lockPriceEdit: true, lockAddressEdit: false },
    },
    flow: { isEntry: false, isFinal: false, nextCodes: ["DELIVERED", "POSTPONED", "RETURNED", "REFUSED_PAID", "REFUSED_UNPAID", "NO_ANSWER"], blockedFrom: ["DELIVERED"] },
    triggers: { requiresReason: false, createsReturnTask: false, sendsCustomerMessage: true, updatesDriverAccount: false },
  },
  {
    id: "STS_003",
    code: "DELIVERED",
    name: "تم التوصيل",
    icon: "PackageCheck",
    color: "#2E7D32",
    isActive: true,
    reasonCodes: [],
    setByRoles: ["driver"],
    visibleTo: { admin: true, driver: true, merchant: true },
    permissions: {
      driver: { canSet: true, requireProof: true, allowCODCollection: true },
      merchant: { showInPortal: true, showInReports: true },
      admin: { lockPriceEdit: true, lockAddressEdit: true },
    },
    flow: { isEntry: false, isFinal: true, nextCodes: ["MONEY_RECEIVED"], blockedFrom: [] },
    triggers: { requiresReason: false, createsReturnTask: false, sendsCustomerMessage: true, updatesDriverAccount: false },
  },
  {
    id: "STS_004",
    code: "POSTPONED",
    name: "مؤجل",
    icon: "CalendarClock",
    color: "#F9A825",
    isActive: true,
    reasonCodes: ["بناء على طلب العميل", "لا يوجد رد على الهاتف"],
    setByRoles: ["driver", "admin"],
    visibleTo: { admin: true, driver: true, merchant: true },
    permissions: {
      driver: { canSet: true, requireProof: false, allowCODCollection: false },
      merchant: { showInPortal: true, showInReports: true },
      admin: { lockPriceEdit: false, lockAddressEdit: false },
    },
    flow: { isEntry: false, isFinal: false, nextCodes: ["OUT_FOR_DELIVERY", "CANCELLED"], blockedFrom: [] },
    triggers: { requiresReason: true, createsReturnTask: false, sendsCustomerMessage: true, updatesDriverAccount: false },
  },
  {
    id: "STS_005",
    code: "RETURNED",
    name: "مرتجع",
    icon: "Undo2",
    color: "#8E24AA",
    isActive: true,
    reasonCodes: ["رفض العميل الاستلام", "عنوان غير صحيح", "المنتج تالف"],
    setByRoles: ["driver", "admin"],
    visibleTo: { admin: true, driver: true, merchant: true },
    permissions: {
      driver: { canSet: true, requireProof: true, allowCODCollection: false },
      merchant: { showInPortal: true, showInReports: true },
      admin: { lockPriceEdit: false, lockAddressEdit: true },
    },
    flow: { isEntry: false, isFinal: true, nextCodes: ["BRANCH_RETURNED"], blockedFrom: [] },
    triggers: { requiresReason: true, createsReturnTask: true, sendsCustomerMessage: true, updatesDriverAccount: false },
  },
  {
    id: "STS_006",
    code: "CANCELLED",
    name: "ملغي",
    icon: "XCircle",
    color: "#D32F2F",
    isActive: true,
    reasonCodes: ["بناء على طلب العميل", "بناء على طلب التاجر"],
    setByRoles: ["admin", "merchant"],
    visibleTo: { admin: true, driver: false, merchant: true },
    permissions: {
      driver: { canSet: false, requireProof: false, allowCODCollection: false },
      merchant: { showInPortal: true, showInReports: true },
      admin: { lockPriceEdit: false, lockAddressEdit: false },
    },
    flow: { isEntry: false, isFinal: true, nextCodes: [], blockedFrom: [] },
    triggers: { requiresReason: true, createsReturnTask: true, sendsCustomerMessage: true, updatesDriverAccount: false },
  },
  {
    id: "STS_007",
    code: "MONEY_RECEIVED",
    name: "تم استلام المال في الفرع",
    icon: "HandCoins",
    color: "#004D40",
    isActive: true,
    reasonCodes: [],
    setByRoles: ["admin"],
    visibleTo: { admin: true, driver: false, merchant: true },
    permissions: {
      driver: { canSet: false, requireProof: false, allowCODCollection: false },
      merchant: { showInPortal: true, showInReports: true },
      admin: { lockPriceEdit: true, lockAddressEdit: true },
    },
    flow: { isEntry: false, isFinal: true, nextCodes: ["COMPLETED"], blockedFrom: [] },
    triggers: { requiresReason: false, createsReturnTask: false, sendsCustomerMessage: false, updatesDriverAccount: true },
  },
  {
    id: "STS_008",
    code: "COMPLETED",
    name: "مكتمل",
    icon: "CheckCheck",
    color: "#1B5E20",
    isActive: true,
    reasonCodes: [],
    setByRoles: ["admin"],
    visibleTo: { admin: true, driver: false, merchant: true },
    permissions: {
      driver: { canSet: false, requireProof: false, allowCODCollection: false },
      merchant: { showInPortal: true, showInReports: true },
      admin: { lockPriceEdit: true, lockAddressEdit: true },
    },
    flow: { isEntry: false, isFinal: true, nextCodes: [], blockedFrom: [] },
    triggers: { requiresReason: false, createsReturnTask: false, sendsCustomerMessage: false, updatesDriverAccount: true },
  },
  {
    id: "STS_009",
    code: "EXCHANGE",
    name: "تبديل",
    icon: "Repeat",
    color: "#fb923c",
    isActive: true,
    reasonCodes: ["قياس غير مناسب", "لون مختلف", "منتج آخر"],
    setByRoles: ["driver", "admin"],
    visibleTo: { admin: true, driver: true, merchant: true },
    permissions: {
      driver: { canSet: true, requireProof: false, allowCODCollection: true },
      merchant: { showInPortal: true, showInReports: true },
      admin: { lockPriceEdit: false, lockAddressEdit: false },
    },
    flow: { isEntry: false, isFinal: false, nextCodes: ["OUT_FOR_DELIVERY", "BRANCH_RETURNED"], blockedFrom: [] },
    triggers: { requiresReason: true, createsReturnTask: true, sendsCustomerMessage: true, updatesDriverAccount: false },
  },
  {
    id: "STS_010",
    code: "REFUSED_PAID",
    name: "رفض ودفع أجور",
    icon: "ThumbsDown",
    color: "#ef4444",
    isActive: true,
    reasonCodes: ["رفض الاستلام مع دفع الأجور"],
    setByRoles: ["driver"],
    visibleTo: { admin: true, driver: true, merchant: true },
    permissions: {
      driver: { canSet: true, requireProof: false, allowCODCollection: true },
      merchant: { showInPortal: true, showInReports: true },
      admin: { lockPriceEdit: true, lockAddressEdit: true },
    },
    flow: { isEntry: false, isFinal: true, nextCodes: ["BRANCH_RETURNED"], blockedFrom: [] },
    triggers: { requiresReason: true, createsReturnTask: true, sendsCustomerMessage: true, updatesDriverAccount: true },
  },
  {
    id: "STS_011",
    code: "REFUSED_UNPAID",
    name: "رفض ولم يدفع أجور",
    icon: "Ban",
    color: "#b91c1c",
    isActive: true,
    reasonCodes: ["رفض الاستلام ولم يدفع الأجور"],
    setByRoles: ["driver"],
    visibleTo: { admin: true, driver: true, merchant: true },
    permissions: {
      driver: { canSet: true, requireProof: true, allowCODCollection: false },
      merchant: { showInPortal: true, showInReports: true },
      admin: { lockPriceEdit: true, lockAddressEdit: true },
    },
    flow: { isEntry: false, isFinal: true, nextCodes: ["BRANCH_RETURNED"], blockedFrom: [] },
    triggers: { requiresReason: true, createsReturnTask: true, sendsCustomerMessage: true, updatesDriverAccount: false },
  },
  {
    id: "STS_012",
    code: "BRANCH_RETURNED",
    name: "مرجع للفرع",
    icon: "Building",
    color: "#7e22ce",
    isActive: true,
    reasonCodes: [],
    setByRoles: ["admin"],
    visibleTo: { admin: true, driver: false, merchant: true },
    permissions: {
      driver: { canSet: false, requireProof: false, allowCODCollection: false },
      merchant: { showInPortal: true, showInReports: true },
      admin: { lockPriceEdit: true, lockAddressEdit: true },
    },
    flow: { isEntry: false, isFinal: true, nextCodes: ["MERCHANT_RETURNED"], blockedFrom: [] },
    triggers: { requiresReason: false, createsReturnTask: false, sendsCustomerMessage: false, updatesDriverAccount: false },
  },
  {
    id: "STS_013",
    code: "MERCHANT_RETURNED",
    name: "مرجع للتاجر",
    icon: "Undo2",
    color: "#581c87",
    isActive: true,
    reasonCodes: [],
    setByRoles: ["admin"],
    visibleTo: { admin: true, driver: false, merchant: true },
    permissions: {
      driver: { canSet: false, requireProof: false, allowCODCollection: false },
      merchant: { showInPortal: true, showInReports: true },
      admin: { lockPriceEdit: true, lockAddressEdit: true },
    },
    flow: { isEntry: false, isFinal: true, nextCodes: [], blockedFrom: [] },
    triggers: { requiresReason: false, createsReturnTask: false, sendsCustomerMessage: false, updatesDriverAccount: false },
  },
  {
    id: "STS_014",
    code: "ARCHIVED",
    name: "مؤرشف",
    icon: "Archive",
    color: "#4b5563",
    isActive: false,
    reasonCodes: [],
    setByRoles: ["admin"],
    visibleTo: { admin: true, driver: false, merchant: false },
    permissions: {
      driver: { canSet: false, requireProof: false, allowCODCollection: false },
      merchant: { showInPortal: false, showInReports: false },
      admin: { lockPriceEdit: true, lockAddressEdit: true },
    },
    flow: { isEntry: false, isFinal: true, nextCodes: [], blockedFrom: [] },
    triggers: { requiresReason: false, createsReturnTask: false, sendsCustomerMessage: false, updatesDriverAccount: false },
  },
  {
    id: "STS_015",
    code: "NO_ANSWER",
    name: "لا رد",
    icon: "PhoneOff",
    color: "#f59e0b",
    isActive: true,
    reasonCodes: ["الهاتف مغلق", "لا يوجد رد", "رقم خاطئ"],
    setByRoles: ["driver", "admin"],
    visibleTo: { admin: true, driver: true, merchant: true },
    permissions: {
      driver: { canSet: true, requireProof: false, allowCODCollection: false },
      merchant: { showInPortal: true, showInReports: true },
      admin: { lockPriceEdit: false, lockAddressEdit: false },
    },
    flow: { isEntry: false, isFinal: false, nextCodes: ["OUT_FOR_DELIVERY", "POSTPONED"], blockedFrom: [] },
    triggers: { requiresReason: true, createsReturnTask: false, sendsCustomerMessage: true, updatesDriverAccount: false },
  },
   {
    id: "STS_016",
    code: "ARRIVAL_NO_ANSWER",
    name: "وصول وعدم رد",
    icon: "UserX",
    color: "#e11d48",
    isActive: true,
    reasonCodes: [],
    setByRoles: ["driver"],
    visibleTo: { admin: true, driver: true, merchant: true },
    permissions: {
      driver: { canSet: true, requireProof: true, allowCODCollection: false },
      merchant: { showInPortal: true, showInReports: true },
      admin: { lockPriceEdit: true, lockAddressEdit: true },
    },
    flow: { isEntry: false, isFinal: true, nextCodes: ["BRANCH_RETURNED"], blockedFrom: [] },
    triggers: { requiresReason: false, createsReturnTask: true, sendsCustomerMessage: true, updatesDriverAccount: false },
  },
];


type StatusesState = {
  statuses: Status[];
  setStatuses: (statuses: Status[]) => void;
  addStatus: (newStatus: Omit<Status, 'id'>) => void;
  updateStatus: (statusId: string, updatedStatus: Partial<Status>) => void;
  deleteStatus: (statusId: string) => void;
};

const generateId = () => `STS_${Date.now()}`;

export const useStatusesStore = create<StatusesState>()(immer((set) => ({
  statuses: initialStatuses,
  
  setStatuses: (newStatuses) => {
    set({ statuses: newStatuses });
  },

  addStatus: (newStatus) => {
    set(state => {
      state.statuses.push({
        ...newStatus,
        id: generateId(),
      });
    });
  },

  updateStatus: (statusId, updatedStatus) => {
      set(state => {
          const status = state.statuses.find(s => s.id === statusId);
          if (status) {
              Object.assign(status, updatedStatus);
          }
      });
  },

  deleteStatus: (statusId) => {
      set(state => {
          state.statuses = state.statuses.filter(s => s.id !== statusId);
      });
  },
})));
