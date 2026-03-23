import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

export default function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const { pathname } = req.nextUrl;
  
  // Detect subdomains
  const isAgent = host.startsWith('agent.');
  const isApp = host.startsWith('app.');
  
  if (isAgent || isApp) {
    const site = isAgent ? 'agent' : 'app';
    
    // Skip if it's already a re-written request or an internal request
    if (!pathname.includes(`/${site}`) && !pathname.includes('/api') && !pathname.includes('/_next')) {
      // Find locale in pathname
      const locale = locales.find(l => pathname.startsWith(`/${l}/`) || pathname === `/${l}`) || defaultLocale;
      const remains = pathname.replace(`/${locale}`, '') || '/';
      
      const newUrl = req.nextUrl.clone();
      newUrl.pathname = `/${locale}/${site}${remains}`;
      return NextResponse.rewrite(newUrl);
    }
  }
  
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
