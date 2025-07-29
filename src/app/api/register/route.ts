import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const { username, password, email } = await request.json();

  if (!username || !password)
    return NextResponse.json(
      { error: 'Username and password required' },
      { status: 400 }
    );

  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists)
    return NextResponse.json(
      { error: 'Username already exists' },
      { status: 409 }
    );

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { username, email, passwordHash },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
