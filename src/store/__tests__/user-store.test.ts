import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usersStore } from '../user-store';

describe('Users Store', () => {
  // Don't reset users in beforeEach since we want to test with initial data
  
  describe('Initial State', () => {
    it('should have initial users', () => {
      const state = usersStore.getState();
      expect(state.users.length).toBeGreaterThan(0);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('addUser', () => {
    it('should add a new user', () => {
      const initialCount = usersStore.getState().users.length;
      
      usersStore.getState().addUser({
        name: 'Test User',
        email: 'test@example.com',
        roleId: 'driver',
        storeName: 'Test Store',
        avatar: '',
      });

      const state = usersStore.getState();
      expect(state.users.length).toBe(initialCount + 1);
      expect(state.users[state.users.length - 1].name).toBe('Test User');
      expect(state.users[state.users.length - 1].email).toBe('test@example.com');
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', () => {
      const users = usersStore.getState().users;
      const firstUser = users[0];

      usersStore.getState().updateUser(firstUser.id, {
        name: 'Updated Name',
      });

      const state = usersStore.getState();
      const updatedUser = state.users.find(u => u.id === firstUser.id);
      expect(updatedUser?.name).toBe('Updated Name');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by ID', () => {
      const users = usersStore.getState().users;
      const initialCount = users.length;
      const userToDelete = users[0];

      usersStore.getState().deleteUser([userToDelete.id]);

      const state = usersStore.getState();
      expect(state.users.length).toBe(initialCount - 1);
      expect(state.users.find(u => u.id === userToDelete.id)).toBeUndefined();
    });

    it('should delete multiple users', () => {
      const users = usersStore.getState().users;
      const initialCount = users.length;
      const idsToDelete = [users[0].id, users[1].id];

      usersStore.getState().deleteUser(idsToDelete);

      const state = usersStore.getState();
      expect(state.users.length).toBe(initialCount - 2);
    });
  });

  describe('User Roles', () => {
    it('should have drivers', () => {
      const state = usersStore.getState();
      const drivers = state.users.filter(u => u.roleId === 'driver');
      expect(drivers.length).toBeGreaterThan(0);
    });

    it('should have merchants', () => {
      const state = usersStore.getState();
      const merchants = state.users.filter(u => u.roleId === 'merchant');
      expect(merchants.length).toBeGreaterThan(0);
    });

    it('should have admin or supervisor', () => {
      const state = usersStore.getState();
      const admins = state.users.filter(u => u.roleId === 'admin' || u.roleId === 'supervisor');
      expect(admins.length).toBeGreaterThan(0);
    });
  });
});
