import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { register, login, getProfile, changePassword } from '../../controllers/auth.controller';
import { db } from '../../db/knex';
import { generateToken } from '../../utils/jwt';
import { mockRequest, mockResponse, mockNext } from '../utils/test-helpers';
import { createMockUser } from '../factories/user.factory';

// Mock dependencies
jest.mock('../../db/knex', () => ({
  db: jest.fn(),
}));

jest.mock('../../utils/jwt', () => ({
  generateToken: jest.fn(),
}));

jest.mock('bcrypt');

describe('Auth Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = createMockUser();
      req.body = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
      };

      const mockDbChain = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null), // No existing user
        insert: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockUser]),
      };

      (db as jest.Mock).mockReturnValue(mockDbChain);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (generateToken as jest.Mock).mockReturnValue('mock.jwt.token');

      await register(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.objectContaining({
          user: expect.any(Object),
          token: 'mock.jwt.token',
        }),
      });
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = { email: 'test@example.com' };

      await expect(register(req as Request, res as Response, next)).rejects.toThrow(
        'Email, name, and password are required'
      );
    });

    it('should return 400 if password is too short', async () => {
      req.body = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'short',
      };

      await expect(register(req as Request, res as Response, next)).rejects.toThrow(
        'Password must be at least 8 characters'
      );
    });

    it('should return 409 if email already exists', async () => {
      req.body = {
        email: 'existing@example.com',
        name: 'Test User',
        password: 'password123',
      };

      const mockDbChain = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ id: 1 }), // Existing user
      };

      (db as jest.Mock).mockReturnValue(mockDbChain);

      await expect(register(req as Request, res as Response, next)).rejects.toThrow(
        'Email already registered'
      );
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      const mockUser = createMockUser();
      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockDbChain = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({
          ...mockUser,
          password_hash: 'hashed_password',
        }),
      };

      (db as jest.Mock).mockReturnValue(mockDbChain);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (generateToken as jest.Mock).mockReturnValue('mock.jwt.token');

      await login(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.objectContaining({
          user: expect.any(Object),
          token: 'mock.jwt.token',
        }),
      });
    });

    it('should return 400 if email or password is missing', async () => {
      req.body = { email: 'test@example.com' };

      await expect(login(req as Request, res as Response, next)).rejects.toThrow(
        'Email and password are required'
      );
    });

    it('should return 401 if user not found', async () => {
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const mockDbChain = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      };

      (db as jest.Mock).mockReturnValue(mockDbChain);

      await expect(login(req as Request, res as Response, next)).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should return 401 if password is invalid', async () => {
      const mockUser = createMockUser();
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockDbChain = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({
          ...mockUser,
          password_hash: 'hashed_password',
        }),
      };

      (db as jest.Mock).mockReturnValue(mockDbChain);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(login(req as Request, res as Response, next)).rejects.toThrow(
        'Invalid email or password'
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      const mockUser = createMockUser();
      req.user = { userId: 1, email: 'test@example.com', role: 'user' };

      const mockDbChain = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockUser),
      };

      (db as jest.Mock).mockReturnValue(mockDbChain);

      await getProfile(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.objectContaining({
          user: mockUser,
        }),
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      req.user = undefined;

      await expect(getProfile(req as Request, res as Response, next)).rejects.toThrow(
        'Authentication required'
      );
    });

    it('should return 404 if user not found', async () => {
      req.user = { userId: 999, email: 'test@example.com', role: 'user' };

      const mockDbChain = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      };

      (db as jest.Mock).mockReturnValue(mockDbChain);

      await expect(getProfile(req as Request, res as Response, next)).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const mockUser = createMockUser();
      req.user = { userId: 1, email: 'test@example.com', role: 'user' };
      req.body = {
        current_password: 'oldpassword',
        new_password: 'newpassword123',
      };

      const mockDbChain = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({
          id: mockUser.id,
          password_hash: 'old_hashed_password',
        }),
        update: jest.fn().mockResolvedValue(1),
      };

      (db as jest.Mock).mockReturnValue(mockDbChain);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');

      await changePassword(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Password updated successfully',
      });
    });

    it('should return 400 if required fields are missing', async () => {
      req.user = { userId: 1, email: 'test@example.com', role: 'user' };
      req.body = { current_password: 'oldpassword' };

      await expect(changePassword(req as Request, res as Response, next)).rejects.toThrow(
        'Current password and new password are required'
      );
    });

    it('should return 400 if new password is too short', async () => {
      req.user = { userId: 1, email: 'test@example.com', role: 'user' };
      req.body = {
        current_password: 'oldpassword',
        new_password: 'short',
      };

      await expect(changePassword(req as Request, res as Response, next)).rejects.toThrow(
        'New password must be at least 8 characters'
      );
    });

    it('should return 401 if current password is incorrect', async () => {
      const mockUser = createMockUser();
      req.user = { userId: 1, email: 'test@example.com', role: 'user' };
      req.body = {
        current_password: 'wrongpassword',
        new_password: 'newpassword123',
      };

      const mockDbChain = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({
          id: mockUser.id,
          password_hash: 'old_hashed_password',
        }),
      };

      (db as jest.Mock).mockReturnValue(mockDbChain);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(changePassword(req as Request, res as Response, next)).rejects.toThrow(
        'Current password is incorrect'
      );
    });
  });
});
