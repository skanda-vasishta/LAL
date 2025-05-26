'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from './prisma';

console.log('Actions file loaded, prisma client:', !!prisma);

export async function authenticate(
  email: string,
  password: string,
) {
  try {
    await signIn('credentials', { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials.' };
        default:
          return { error: 'Something went wrong.' };
      }
    }
    throw error;
  }
}

export async function signOutAction() {
  'use server';
  await signOut();
}

export async function register(
  name: string,
  email: string,
  password: string,
) {
  try {
    console.log('Starting registration process...');
    console.log('Prisma client in register function:', !!prisma);
    console.log('Prisma client keys:', Object.keys(prisma));
    console.log('Prisma user model:', !!prisma.user);
    
    // Validate input
    const validatedFields = z
      .object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
      })
      .safeParse({ name, email, password });

    if (!validatedFields.success) {
      console.log('Validation failed:', validatedFields.error);
      return { error: 'Invalid input data' };
    }

    console.log('Checking for existing user...');
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('User already exists');
      return { error: 'User with this email already exists' };
    }

    console.log('Hashing password...');
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Creating user...');
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    console.log('User created successfully:', user);
    return { success: true, user };
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof Error) {
      return { error: `Failed to create user: ${error.message}` };
    }
    return { error: 'Failed to create user' };
  }
} 