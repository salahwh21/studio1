import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useRolesStore } from './roles-store';

export type User = {
    id: string;
    name: string;
    storeName?: string;
    email: string;
    roleId: string;
    avatar: string;
    password?: string;
    whatsapp?: string;
    priceListId?: string;
};

// بيانات افتراضية للتطوير عندما لا يكون الـ backend متاحاً
const fallbackUsers: User[] = [
    {
        id: 'user-admin-1',
        name: 'صلاح الوحيدي',
        email: 'admin@alwameed.com',
        roleId: 'admin',
        avatar: '',
        storeName: 'الإدارة',
    },
];

type UsersState = {
    users: User[];
    isLoading: boolean;
    error: string | null;
    isFromAPI: boolean;
    loadUsersFromAPI: () => Promise<void>;
    addUser: (newUser: Omit<User, 'id' | 'password'>) => Promise<void>;
    updateUser: (userId: string, updatedUser: Partial<Omit<User, 'id'>>) => Promise<void>;
    updateCurrentUser: (updatedFields: Partial<Omit<User, 'id' | 'roleId'>>) => void;
    updateUsersRole: (userIds: string[], newRoleId: string) => Promise<void>;
    deleteUser: (userIds: string[] | User[]) => Promise<void>;
    syncRoleUserCounts: () => void; // دالة لمزامنة عدد المستخدمين مع الأدوار
    getUserCountByRole: (roleId: string) => number; // دالة للحصول على عدد المستخدمين لدور معين
};

const generateId = () => `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const createUserStore = () =>
    create<UsersState>()(
        persist(
            immer((set, get) => {
                // Auto-load from API when backend is ready
                const autoLoad = () => {
                    const state = get();
                    const backendReady =
                        typeof window !== 'undefined' &&
                        sessionStorage.getItem('backendReady') === '1';
                    
                    if (!state.isLoading && backendReady) {
                        console.log('🔄 Auto-loading users from API...');
                        state.loadUsersFromAPI();
                    }
                };

                if (typeof window !== 'undefined') {
                    setTimeout(autoLoad, 1500);
                }

                return {
                    users: fallbackUsers,
                    isLoading: false,
                    error: null,
                    isFromAPI: false,

                    loadUsersFromAPI: async () => {
                        try {
                            set((state) => {
                                state.isLoading = true;
                                state.error = null;
                            });

                            const { default: api } = await import('@/lib/api');
                            const response = await api.getUsers();
                            const usersArray = Array.isArray(response)
                                ? response
                                : response?.users || [];

                            const mappedUsers: User[] = usersArray.map((u: any) => ({
                                id: u.id,
                                name: u.name,
                                storeName: u.storeName || u.store_name || u.name,
                                email: u.email,
                                roleId: u.roleId || u.role_id,
                                avatar: u.avatar || '',
                                whatsapp: u.whatsapp,
                                priceListId: u.priceListId || u.price_list_id,
                            }));

                            if (mappedUsers.length > 0) {
                                set((state) => {
                                    state.users = mappedUsers;
                                    state.isLoading = false;
                                    state.isFromAPI = true;
                                });
                                console.log('✅ Users loaded from database:', mappedUsers.length);
                            } else {
                                set((state) => {
                                    state.isLoading = false;
                                });
                            }
                        } catch (error: any) {
                            console.warn('⚠️ Could not load users from API, using local data');
                            set((state) => {
                                state.error = 'Using local data';
                                state.isLoading = false;
                                state.isFromAPI = false;
                            });
                        }
                    },

                    addUser: async (newUser) => {
                        // Try API first
                        try {
                            const { default: api } = await import('@/lib/api');
                            const createdUser = await api.createUser(newUser);
                            set((s) => {
                                s.users.push({
                                    id: createdUser.id,
                                    name: createdUser.name,
                                    storeName: createdUser.storeName,
                                    email: createdUser.email,
                                    roleId: createdUser.roleId,
                                    avatar: createdUser.avatar || '',
                                    whatsapp: createdUser.whatsapp,
                                    priceListId: createdUser.priceListId,
                                });
                            });
                            console.log('✅ User created in database:', createdUser.id);
                            return;
                        } catch {
                            // API failed, add locally
                        }

                        // Fallback: add locally
                        const newId = generateId();
                        set((s) => {
                            s.users.push({
                                ...newUser,
                                id: newId,
                                password: '123',
                            });
                        });
                        useRolesStore.getState().incrementUserCount(newUser.roleId);
                        console.log('📝 User added locally:', newId);
                    },

                    updateUser: async (userId, updatedUser) => {
                        // Try API first
                        try {
                            const { default: api } = await import('@/lib/api');
                            await api.updateUser(userId, updatedUser);
                            console.log('✅ User updated in database:', userId);
                        } catch {
                            // API failed, update locally only
                        }

                        // Always update local state
                        set((state) => {
                            const userIndex = state.users.findIndex((u) => u.id === userId);
                            if (userIndex !== -1) {
                                const oldRole = state.users[userIndex].roleId;
                                const newRole = updatedUser.roleId;

                                if (newRole && oldRole !== newRole) {
                                    useRolesStore.getState().decrementUserCount(oldRole);
                                    useRolesStore.getState().incrementUserCount(newRole);
                                }

                                state.users[userIndex] = {
                                    ...state.users[userIndex],
                                    ...updatedUser,
                                };
                            }
                        });
                    },

                    updateCurrentUser: (updatedFields) => {
                        set((state) => {
                            const userIndex = state.users.findIndex(
                                (u) => u.roleId === 'admin'
                            );
                            if (userIndex !== -1) {
                                state.users[userIndex] = {
                                    ...state.users[userIndex],
                                    ...updatedFields,
                                };
                            }
                        });
                    },

                    updateUsersRole: async (userIds: string[], newRoleId: string) => {
                        const userIdsArray = Array.isArray(userIds) ? userIds : [userIds];

                        for (const userId of userIdsArray) {
                            await get().updateUser(userId, { roleId: newRoleId });
                        }
                    },

                    deleteUser: async (userIds) => {
                        // Handle both string[] and User[] inputs
                        const idsToDelete = Array.isArray(userIds) 
                            ? userIds.map(u => typeof u === 'string' ? u : u.id)
                            : [typeof userIds === 'string' ? userIds : (userIds as User).id];
                        
                        const users = get().users;

                        // Try API first
                        try {
                            const { default: api } = await import('@/lib/api');
                            if (idsToDelete.length === 1) {
                                await api.deleteUser(idsToDelete[0]);
                            } else {
                                await api.bulkDeleteUsers(idsToDelete);
                            }
                            console.log('✅ User(s) deleted from database:', idsToDelete.length);
                        } catch {
                            // API failed, delete locally only
                        }

                        // Always update local state
                        idsToDelete.forEach((id) => {
                            const user = users.find((u) => u.id === id);
                            if (user) {
                                useRolesStore.getState().decrementUserCount(user.roleId);
                            }
                        });

                        set((state) => {
                            state.users = state.users.filter(
                                (u) => !idsToDelete.includes(u.id)
                            );
                        });
                    },

                    // مزامنة عدد المستخدمين مع الأدوار
                    syncRoleUserCounts: () => {
                        const users = get().users;
                        const roleCounts: Record<string, number> = {};
                        
                        // حساب عدد المستخدمين لكل دور
                        users.forEach(user => {
                            roleCounts[user.roleId] = (roleCounts[user.roleId] || 0) + 1;
                        });
                        
                        // تحديث الأدوار
                        const rolesStore = useRolesStore.getState();
                        rolesStore.roles.forEach(role => {
                            const actualCount = roleCounts[role.id] || 0;
                            if (role.userCount !== actualCount) {
                                // تحديث العدد مباشرة
                                useRolesStore.setState(state => ({
                                    roles: state.roles.map(r => 
                                        r.id === role.id ? { ...r, userCount: actualCount } : r
                                    )
                                }));
                            }
                        });
                        
                        console.log('✅ Role user counts synced:', roleCounts);
                    },

                    // الحصول على عدد المستخدمين لدور معين
                    getUserCountByRole: (roleId: string) => {
                        return get().users.filter(u => u.roleId === roleId).length;
                    },
                };
            }),
            {
                name: 'users-storage',
                storage: createJSONStorage(() => localStorage),
                partialize: (state) => ({ 
                    users: state.users,
                    isFromAPI: state.isFromAPI 
                }),
            }
        )
    );

export const usersStore = createUserStore();
export const useUsersStore = usersStore;
