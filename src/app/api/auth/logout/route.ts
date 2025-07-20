import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Sign out the user
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create response and clear all auth cookies
    const response = NextResponse.json({ success: true });
    
    // Clear all Supabase auth cookies
    const cookiesToClear = [
      'sb-access-token',
      'sb-refresh-token',
      'supabase-auth-token',
      'supabase.auth.token'
    ];
    
    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      });
    });

    // Also clear cookies with different patterns that Supabase might use
    const allCookies = request.cookies.getAll();
    allCookies.forEach(cookie => {
      if (cookie.name.startsWith('sb-') || cookie.name.includes('supabase')) {
        response.cookies.set(cookie.name, '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 0,
          path: '/'
        });
      }
    });

    return response;
  } catch (error) {
    console.error('Unexpected logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}