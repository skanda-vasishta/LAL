'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import bcryptjs from 'bcryptjs';
import postgres from 'postgres';
import { z } from 'zod';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

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

export async function register(
  name: string,
  email: string,
  password: string,
) {
  try {
    // Validate input
    const validatedFields = z
      .object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
      })
      .safeParse({ name, email, password });

    if (!validatedFields.success) {
      return { error: 'Invalid input data' };
    }

    // Check if user already exists
    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existingUser.length > 0) {
      return { error: 'User with this email already exists' };
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
    `;

    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Failed to create user' };
  }
} 