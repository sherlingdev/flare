import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

/**
 * Authentication and User Management Library
 * 
 * This module provides comprehensive authentication functionality including:
 * - User registration and login with secure password hashing
 * - JWT token generation and validation
 * - Password and email validation
 * - Rate limiting to prevent brute force attacks
 * - In-memory user storage (should be replaced with database in production)
 */

// In-memory user storage (replace with database in production)
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  lastLogin?: string;
}

// Temporary in-memory storage for users
// TODO: Replace with database (PostgreSQL, MongoDB, etc.) in production
const users: User[] = [];

// JWT secret key for signing tokens
// In production, this should be a strong, randomly generated secret stored in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

/**
 * Validates password strength according to security requirements
 * 
 * @param password - The password to validate
 * @returns Object with validation result and error messages
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check minimum length requirement
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Check for uppercase letter requirement
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letter requirement
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for numeric character requirement
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special character requirement
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates email format using regex pattern
 * 
 * @param email - The email address to validate
 * @returns True if email format is valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Securely hashes a password using bcrypt with salt rounds
 * 
 * @param password - The plain text password to hash
 * @returns Promise resolving to the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Higher rounds = more secure but slower
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verifies a plain text password against its hash
 * 
 * @param password - The plain text password to verify
 * @param hashedPassword - The stored hash to compare against
 * @returns Promise resolving to true if password matches, false otherwise
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generates a JWT token for user authentication
 * 
 * @param user - User object without password field
 * @returns Signed JWT token string
 */
export function generateToken(user: Omit<User, 'password'>): string {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    iat: Math.floor(Date.now() / 1000), // Issued at timestamp
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // Expires in 24 hours
  };

  return jwt.sign(payload, JWT_SECRET);
}

/**
 * Verifies and decodes a JWT token
 * 
 * @param token - The JWT token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Retrieves user information from a JWT token
 * 
 * @param token - The JWT token containing user information
 * @returns User object without password field, or null if token is invalid
 */
export function getUserFromToken(token: string): Omit<User, 'password'> | null {
  try {
    const decoded = verifyToken(token);
    const user = users.find(u => u.id === decoded.id);
    if (user) {
      // Remove password field before returning user data
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}

/**
 * Creates a new user account with validation and secure password hashing
 * 
 * @param userData - Object containing name, email, and password
 * @returns Promise resolving to user object (without password) and JWT token
 * @throws Error if user already exists, email is invalid, or password doesn't meet requirements
 */
export async function createUser(userData: { name: string; email: string; password: string }): Promise<{ user: Omit<User, 'password'>; token: string }> {
  // Check if user already exists (case-insensitive email check)
  const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Validate email format
  if (!validateEmail(userData.email)) {
    throw new Error('Invalid email format');
  }

  // Validate password strength
  const passwordValidation = validatePassword(userData.password);
  if (!passwordValidation.isValid) {
    throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
  }

  // Hash the password securely
  const hashedPassword = await hashPassword(userData.password);

  // Create new user object with unique ID and timestamp
  const newUser: User = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Generate unique ID
    name: userData.name.trim(),
    email: userData.email.toLowerCase().trim(), // Normalize email
    password: hashedPassword, // Store hashed password, never plain text
    createdAt: new Date().toISOString()
  };

  // Add user to in-memory storage
  users.push(newUser);

  // Generate JWT token for immediate login
  const { password, ...userWithoutPassword } = newUser;
  const token = generateToken(userWithoutPassword);

  return {
    user: userWithoutPassword,
    token
  };
}

/**
 * Authenticates a user with email and password
 * 
 * @param email - User's email address
 * @param password - User's plain text password
 * @returns Promise resolving to user object (without password) and JWT token
 * @throws Error if credentials are invalid (same error message for security)
 */
export async function authenticateUser(email: string, password: string): Promise<{ user: Omit<User, 'password'>; token: string }> {
  // Find user by email (case-insensitive search)
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    // Use generic error message to prevent email enumeration attacks
    throw new Error('Invalid email or password');
  }

  // Verify password using secure bcrypt comparison
  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword) {
    // Use same error message for consistency and security
    throw new Error('Invalid email or password');
  }

  // Update last login timestamp
  user.lastLogin = new Date().toISOString();

  // Generate new JWT token for this session
  const { password: _, ...userWithoutPassword } = user;
  const token = generateToken(userWithoutPassword);

  return {
    user: userWithoutPassword,
    token
  };
}

/**
 * Retrieves all users (for development and debugging only)
 * WARNING: This should be removed or restricted in production
 * 
 * @returns Array of user objects without password fields
 */
export function getAllUsers(): Omit<User, 'password'>[] {
  return users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
}

/**
 * Retrieves a user by their unique ID
 * 
 * @param id - The user's unique identifier
 * @returns User object without password field, or null if not found
 */
export function getUserById(id: string): Omit<User, 'password'> | null {
  const user = users.find(u => u.id === id);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
}

// Rate limiting storage (in production, use Redis or similar)
// TODO: Replace with Redis or database-backed rate limiting for production
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Checks if a request should be rate limited to prevent abuse
 * 
 * @param identifier - Unique identifier for the client (IP, user ID, etc.)
 * @param maxRequests - Maximum number of requests allowed in the time window
 * @param windowMs - Time window in milliseconds (default: 15 minutes)
 * @returns True if request is allowed, false if rate limited
 */
export function checkRateLimit(identifier: string, maxRequests: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const key = identifier;

  const current = rateLimitStore.get(key);

  // If no record exists or window has expired, create new record
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  // Check if max requests exceeded
  if (current.count >= maxRequests) {
    return false; // Rate limited
  }

  // Increment request count
  current.count++;
  return true;
}

/**
 * Extracts client IP address from NextRequest headers
 * Handles various proxy configurations (X-Forwarded-For, X-Real-IP)
 * 
 * @param request - NextRequest object containing headers
 * @returns Client IP address string, or 'unknown' if not found
 */
export function getClientIP(request: NextRequest): string {
  // Check X-Forwarded-For header (common in proxy setups)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  // Fallback if no proxy headers are present
  return 'unknown';
}


