// src/app/api/register/route.ts

import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { username, password, email } = await request.json();

    // --- Basic Validation ---
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 },
      );
    }

    // --- Check for existing user by username ---
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUserByUsername) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }, // 409 Conflict
      );
    }

    // --- Check for existing user by email (if email is provided) ---
    if (email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUserByEmail) {
        return NextResponse.json(
          { error: 'Email is already in use' },
          { status: 409 },
        );
      }
    }

    // --- Create new user ---
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        username,
        email: email || null, // Handle optional email
        passwordHash,
      },
    });

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 },
    );
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 },
    );
  }
}