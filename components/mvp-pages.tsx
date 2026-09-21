'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, CircleUserRound, Images, Layers, Plus, Users } from 'lucide-react';

/**
 * Compatibility shell for callers that still import the original routed MVP
 * components. The canonical state and views now live in app/page.tsx; these
 * aliases only send old entry points back to that single model.
 */
export type ActiveTab = 'book' | 'gallery' | 'add' | 'friends' | 'me';

export function BottomNav({ active }: { active: ActiveTab }) {
  const items: { key: ActiveTab; ariaLabel: string; href: string; icon: typeof BookOpen }[] = [
    { key: 'book', ariaLabel: '打开首页', href: '/', icon: Layers },
    { key: 'gallery', ariaLabel: '打开相册', href: '/gallery', icon: Images },
    { key: 'add', ariaLabel: '新增记录', href: '/add', icon: Plus },
    { key: 'friends', ariaLabel: '打开朋友', href: '/friends', icon: Users },
    { key: 'me', ariaLabel: '打开个人资料', href: '/me', icon: CircleUserRound },
  ];
  return <nav className="bottom-nav" aria-label="主导航"><div className="bottom-nav-inner">{items.map(({ key, ariaLabel, href, icon: Icon }) => <Link key={key} className={`nav-item ${active === key ? 'active' : ''} ${key === 'add' ? 'nav-plus' : ''}`} href={href} aria-label={ariaLabel}><Icon aria-hidden="true" /></Link>)}</div></nav>;
}

export function PageFrame({ active, children }: { active: ActiveTab; children: React.ReactNode }) {
  return <div className="shell"><header className="topbar"><Link href="/book" className="brand-mark" aria-label="打开年表"><BookOpen className="brand-book-icon" size={23} strokeWidth={1.8} aria-hidden="true" /></Link></header><main className="shell-main">{children}</main><BottomNav active={active} /></div>;
}

function RouteAlias({ view }: { view: 'timeline' | 'gallery' | 'add' | 'friends' | 'me' }) {
  const router = useRouter();
  useEffect(() => { router.replace(view === 'timeline' ? '/?view=timeline' : `/?view=${view}`); }, [router, view]);
  return null;
}

export function BookView() { return <RouteAlias view="timeline" />; }
export function GalleryView() { return <RouteAlias view="gallery" />; }
export function AddStoryView() { return <RouteAlias view="add" />; }
export function FriendsView() { return <RouteAlias view="friends" />; }
export function MeView() { return <RouteAlias view="me" />; }
