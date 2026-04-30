import { cookies } from 'next/headers';

export async function generateCSRFToken() {
  const token = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set('csrf_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour
  });
  return token;
}

export async function validateCSRFToken(token: string) {
  const cookieStore = await cookies();
  const storedToken = cookieStore.get('csrf_token')?.value;
  if (!storedToken || storedToken !== token) {
    throw new Error('Invalid CSRF token');
  }
  return true;
}
