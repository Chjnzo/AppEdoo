import { createMiddleware } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const middleware = createMiddleware({
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  async middleware(req) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.next();
  },
});

export const config = {
  matcher: ['/', '/week/:path*'],
};