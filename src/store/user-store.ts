
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useRolesStore } from './roles-store';

export type User = {
    id: string;
    name: string;
    storeName?: string; // Optional: To be used for merchants
    email: string; // Can be email or phone for login
    roleId: string;
    avatar: string;
    password?: string;
    whatsapp?: string; // Added for account settings
    priceListId?: string; // To link merchant to a price list
};

/**
 * ⚠️ لا توجد بيانات محلية - جميع المستخدمين في قاعدة البيانات
 * استخدم loadUsersFromAPI() لجلب المستخدمين من قاعدة البيانات
 */
const initialUsers: User[] = [];



type UsersState = {
    users: User[];
    isLoading: boolean;
    error: string | null;
    loadUsersFromAPI: () => Promise<void>;
    addUser: (newUser: Omit<User, 'id' | 'password'>) => void;
    updateUser: (userId: string, updatedUser: Partial<Omit<User, 'id'>>) => void;
    updateCurrentUser: (updatedFields: Partial<Omit<User, 'id' | 'roleId'>>) => void;
    updateUsersRole: (userIds: string[], newRoleId: string) => Promise<void>;
    deleteUser: (userIds: string[]) => void;
};

const generateId = () => `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const createUserStore = () => create<UsersState>()(immer((set, get) => {
    // Auto-load users on first access if empty
    const autoLoad = () => {
        const state = get();
        if (state.users.length === 0 && !state.isLoading && !state.error) {
            console.log('🔄 Auto-loading users from API...');
            state.loadUsersFromAPI();
        }
    };

    // Trigger auto-load after a short delay
    if (typeof window !== 'undefined') {
        setTimeout(autoLoad, 1200);
    }

    return {
        users: initialUsers,
        isLoading: false,
        error: null,

        loadUsersFromAPI: async () => {
            try {
                console.log('📥 Loading users from API...');
                set((state) => {
                    state.isLoading = true;
                    state.error = null;
                });

                // Import api dynamically to avoid circular dependency
                const { default: api } = await import('@/lib/api');
                const response = await api.getUsers();
                console.log('📦 API Response:', response);

                // Handle different response formats
                const usersArray = Array.isArray(response) ? response : (response?.users || []);
                console.log('📋 Users array length:', usersArray.length);

                if (usersArray.length > 0) {
                    console.log('👤 Sample user from API:', usersArray[0]);
                }

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

                console.log('✅ Mapped users:', mappedUsers.length);
                const drivers = mappedUsers.filter(u => u.roleId === 'driver');
                console.log('🚗 Drivers found:', drivers.length, drivers.map(d => d.name));

                // Only update if we got valid data, otherwise keep initialUsers
                if (mappedUsers.length > 0) {
                    set((state) => {
                        state.users = mappedUsers;
                        state.isLoading = false;
                    });
                    console.log('✅ Users updated in store');
                } else {
                    console.log('⚠️ API returned empty users, keeping initial data');
                    set((state) => {
                        state.isLoading = false;
                    });
                }
            } catch (error: any) {
                console.error('❌ Failed to load users from API:', error);

                // Check if it's an authentication error
                const isAuthError = error.message?.includes('Access token') ||
                    error.message?.includes('401') ||
                    error.message?.includes('Unauthorized');

                if (isAuthError) {
                    console.log('🔐 Authentication required - using initial users as fallback');
                } else {
                    console.log('⚠️ API error - using initial users as fallback');
                }

                set((state) => {
                    state.error = isAuthError ? 'Authentication required' : 'Failed to load users';
                    state.isLoading = false;
                    // Keep initialUsers as fallback (already set as default)
                });
                console.log('📌 Using initial users as fallback:', initialUsers.length);
            }
        },

        addUser: async (newUser) => {
            try {
                const { default: api } = await import('@/lib/api');
                const createdUser = await api.createUser(newUser);
                set(state => {
                    state.users.push(createdUser);
                });
                useRolesStore.getState().incrementUserCount(newUser.roleId);
                console.log('✅ User created in database:', createdUser.id);
            } catch (error) {
                console.error('❌ Failed to create user in database, adding locally:', error);
                // Fallback to local
                set(state => {
                    state.users.push({ ...newUser, id: generateId(), password: '123' });
                });
                useRolesStore.getState().incrementUserCount(newUser.roleId);
            }
        },

        updateUser: async (userId, updatedUser) => {
            try {
                const { default: api } = await import('@/lib/api');
                await api.updateUser(userId, updatedUser);
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
                console.log('✅ User updated in database:', userId);
            } catch (error) {
                console.error('❌ Failed to update user in database:', error);
                // Still update locally
                set(state => {
                    const userIndex = state.users.findIndex(u => u.id === userId);
                    if (userIndex !== -1) {
                        state.users[userIndex] = { ...state.users[userIndex], ...updatedUser };
                    }
                });
            }
        },

        updateCurrentUser: (updatedFields) => {
            set(state => {
                const userIndex = state.users.findIndex(u => u.id === 'user-salahwh'); // Hardcoded admin user ID
                if (userIndex !== -1) {
                    state.users[userIndex] = { ...state.users[userIndex], ...updatedFields };
                }
            });
        },

        updateUsersRole: async (userIds: string[], newRoleId: string) => {
            const userIdsArray = Array.isArray(userIds) ? userIds : [userIds];
            // In a real app, call API for bulk update
            // await api.bulkUpdateRole(userIdsArray, newRoleId);

            userIdsArray.forEach(userId => {
                set(state => {
                    const userIndex = state.users.findIndex(u => u.id === userId);
                    if (userIndex !== -1) {
                        const oldRole = state.users[userIndex].roleId;
                        if (oldRole !== newRoleId) {
                            useRolesStore.getState().decrementUserCount(oldRole);
                            useRolesStore.getState().incrementUserCount(newRoleId);
                            state.users[userIndex].roleId = newRoleId;
                        }
                    }
                });
                // If we had an API call, we would do it here or outside the loop
                // For now, we update local state per user
                get().updateUser(userId, { roleId: newRoleId });
            });
        },

        deleteUser: async (userIds) => {
            const idsToDelete = Array.isArray(userIds) ? userIds : [userIds];
            const users = get().users;

            try {
                const { default: api } = await import('@/lib/api');
                if (idsToDelete.length === 1) {
                    await api.deleteUser(idsToDelete[0]);
                } else {
                    await api.bulkDeleteUsers(idsToDelete);
                }

                idsToDelete.forEach(id => {
                    const user = users.find(u => u.id === id);
                    if (user) {
                        useRolesStore.getState().decrementUserCount(user.roleId);
                    }
                });

                set(state => {
                    state.users = state.users.filter(u => !idsToDelete.includes(u.id));
                });
                console.log('✅ User(s) deleted from database:', idsToDelete.length);
            } catch (error) {
                console.error('❌ Failed to delete user(s) from database:', error);
                // Still delete locally
                idsToDelete.forEach(id => {
                    const user = users.find(u => u.id === id);
                    if (user) {
                        useRolesStore.getState().decrementUserCount(user.roleId);
                    }
                });
                set(state => {
                    state.users = state.users.filter(u => !idsToDelete.includes(u.id));
                });
            }
        },
    };
}));

export const usersStore = createUserStore();
export const useUsersStore = usersStore;
