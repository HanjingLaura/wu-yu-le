'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Camera, Check, ChevronLeft, CircleUserRound, GalleryHorizontal, Grid2X2, Heart, ImagePlus, LockKeyhole, MessageCircle, Plus, Search, Send, Users, X } from 'lucide-react';

export type ActiveTab = 'book' | 'gallery' | 'add' | 'friends' | 'me';

const events = [
  { id: 'first-snow', date: '2025 / 01 / 18', title: '第一场雪，和一杯热可可', excerpt: '下楼时雪已经积在伞沿。我们决定绕远路去找那家新开的咖啡店。', people: ['L', 'M'], time: '19:20' },
  { id: 'late-train', date: '2024 / 12 / 03', title: '末班车没有来', excerpt: '站台广播说还要等二十分钟，于是我们讲完了今年最好笑的三个故事。', people: ['L', 'M', 'Y'], time: '23:47' },
  { id: 'small-garden', date: '2024 / 10 / 22', title: '阳台上的小花园', excerpt: '薄荷终于长出了新叶。给它拍了照，也把今天的风记下来。', people: ['L'], time: '16:06' }
];

const gallery = [
  { title: '风从窗台来', copy: '在阳光里晒了半小时。', image: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=760&q=80', ratio: '4 / 5', comments: 3 },
  { title: '月台等车', copy: '迟到的列车和没讲完的话。', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=760&q=80', ratio: '4 / 5', comments: 8 },
  { title: '晚餐后', copy: '把最后一盏灯留给回家的人。', image: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=760&q=80', ratio: '1 / 1', comments: 1 },
  { title: '今天也很普通', copy: '普通的一天也值得保存。', image: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=760&q=80', ratio: '4 / 5', comments: 5 },
  { title: '给朋友的花', copy: '路边看到，顺手带回家。', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=760&q=80', ratio: '1 / 1', comments: 2 }
];

export function BottomNav({ active }: { active: ActiveTab }) {
  const items: { key: ActiveTab; label: string; href: string; icon: typeof BookOpen }[] = [
    { key: 'book', label: '展架', href: '/', icon: Grid2X2 },
    { key: 'gallery', label: '相册', href: '/gallery', icon: GalleryHorizontal },
    { key: 'add', label: '', href: '/add', icon: Plus },
    { key: 'friends', label: '朋友', href: '/friends', icon: Users },
    { key: 'me', label: '我的', href: '/me', icon: CircleUserRound }
  ];
  return <nav className="bottom-nav"><div className="bottom-nav-inner">{items.map(({ key, label, href, icon: Icon }) => <Link key={key} className={`nav-item ${active === key ? 'active' : ''} ${key === 'add' ? 'nav-plus' : ''}`} href={href}><Icon />{label && <span>{label}</span>}</Link>)}</div></nav>;
}

export function PageFrame({ active, children, note }: { active: ActiveTab; children: React.ReactNode; note?: string }) {
  return <div className="shell"><header className="topbar"><Link href="/book" className="brand-mark" aria-label="打开史书" title="史书"><BookOpen className="brand-book-icon" size={23} strokeWidth={1.8} aria-hidden="true" /></Link><span className="topbar-note">{note ?? '展架'}</span></header><main className="shell-main">{children}</main><BottomNav active={active} /></div>;
}

export function BookView() {
  const [reading, setReading] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const event = events.find((item) => item.id === reading);
  if (event) return <PageFrame active="book" note="史书"><section className="reader"><div className="reader-head"><button className="reader-back" onClick={() => { setReading(null); setPage(0); }}><ChevronLeft size={16} /> 返回史书</button><span className="section-label">{event.date}</span></div><article className="reader-page"><div className="reader-kicker">第 {page + 1} 页 · {event.time}</div><h1 className="reader-title">{event.title}</h1>{page === 0 ? <><img className="reader-photo" src="https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=1200&q=80" alt="" /><p className="reader-copy">{event.excerpt}</p></> : <p className="reader-copy">这一页留给下一次见面。{ '\n\n' }— {event.people.join(' · ')}</p>}<footer className="reader-foot"><span>{event.people.length} 人</span><span>公开</span></footer></article><div className="reader-controls"><button aria-label="上一页" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}><ArrowLeft size={18} /></button><span className="reader-progress">{page + 1} / 2</span><button aria-label="下一页" disabled={page === 1} onClick={() => setPage((current) => Math.min(1, current + 1))}><ArrowRight size={18} /></button></div></section></PageFrame>;
  return <PageFrame active="book" note="史书"><div className="section-head"><div><p className="section-label">史书</p><h1 className="section-title">时间线</h1></div><span className="subtle">{events.length} 条</span></div><div className="timeline">{events.map((item) => <div className="timeline-group" key={item.id}><p className="timeline-date">{item.date}</p><button className="event-card card" onClick={() => setReading(item.id)}><div className="event-meta"><span>{item.time}</span><span>公开</span></div><h2 className="event-title">{item.title}</h2><p className="event-excerpt">{item.excerpt}</p><div className="event-foot"><div className="avatar-stack">{item.people.map((person) => <span className="avatar" key={person}>{person}</span>)}</div><span>打开 <ArrowRight size={14} style={{ verticalAlign: 'middle' }} /></span></div></button></div>)}</div></PageFrame>;
}

export function GalleryView() {
  const [liked, setLiked] = useState<number[]>([]);
  return <PageFrame active="gallery" note="相册"><div className="section-head"><div><p className="section-label">公开</p><h1 className="section-title">相册</h1></div><Camera size={20} color="var(--gold-dark)" /></div><div className="gallery-grid">{gallery.map((item, index) => <article className="gallery-card card" key={item.title}><img className="gallery-image" src={item.image} alt={item.title} style={{ aspectRatio: item.ratio }} /><div className="gallery-body"><h2 className="gallery-title">{item.title}</h2><p className="gallery-copy">{item.copy}</p><div className="gallery-comment"><button aria-label="like" onClick={() => setLiked((list) => list.includes(index) ? list.filter((id) => id !== index) : [...list, index])} style={{ border: 0, background: 'transparent', color: liked.includes(index) ? '#b05646' : 'inherit', padding: 0 }}><Heart size={14} fill={liked.includes(index) ? 'currentColor' : 'none'} /></button><MessageCircle size={14} /> {item.comments} 条</div></div></article>)}</div></PageFrame>;
}

export function AddStoryView() {
  const [submitted, setSubmitted] = useState(false);
  if (submitted) return <PageFrame active="add" note="已保存"><div className="section-head"><div><p className="section-label">完成</p><h1 className="section-title">已保存</h1></div><Check color="var(--gold-dark)" /></div><div className="card" style={{ padding: 20 }}><p className="subtle">这条记录已保存。</p><div style={{ display: 'flex', gap: 9, marginTop: 18 }}><Link href="/book" className="btn btn-primary">打开史书</Link><Link href="/add" className="btn btn-ghost" onClick={() => setSubmitted(false)}>再写一条</Link></div></div></PageFrame>;
  return <PageFrame active="add" note="新增"><div className="section-head"><div><p className="section-label">新增</p><h1 className="section-title">写一条</h1></div><ImagePlus size={21} color="var(--gold-dark)" /></div><form className="card" style={{ padding: 17 }} onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}><div className="form-grid"><div className="field"><label htmlFor="story-time">Time</label><input id="story-time" type="datetime-local" required /></div><div className="field"><label htmlFor="story-title">Event</label><input id="story-title" placeholder="给这件事一个名字" required /></div><div className="field"><label htmlFor="story-content">Content</label><textarea id="story-content" placeholder="写下当时发生了什么…" required /></div><div className="field"><label htmlFor="story-photos">Photos <span style={{ textTransform: 'none' }}>(optional)</span></label><input id="story-photos" type="file" accept="image/*" multiple /></div><div className="field"><label>Visibility</label><div className="visibility"><label><input type="radio" name="visibility" value="private" defaultChecked /><LockKeyhole size={15} /> Private</label><label><input type="radio" name="visibility" value="public" /><GalleryHorizontal size={15} /> Public</label></div></div><button className="btn btn-primary" type="submit">保存 <Send size={16} /></button></div></form></PageFrame>;
}

const friendList = [{ name: 'Mia Chen', handle: '@mia', initial: 'M' }, { name: 'Yuki Lin', handle: '@yuki', initial: 'Y' }, { name: 'Leo Zhang', handle: '@leo', initial: 'L' }];
export function FriendsView() {
  const [query, setQuery] = useState('');
  const filtered = friendList.filter((friend) => `${friend.name}${friend.handle}`.toLowerCase().includes(query.toLowerCase()));
  return <PageFrame active="friends" note="朋友"><div className="section-head"><div><p className="section-label">朋友</p><h1 className="section-title">朋友</h1></div><Link className="btn btn-ghost" href="#invite"><Plus size={16} />邀请</Link></div><div className="card" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 11px', marginBottom: 14 }}><Search size={17} color="var(--muted)" /><input aria-label="Search friends" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索姓名" style={{ flex: 1, border: 0, outline: 0, background: 'transparent', color: 'var(--ink)' }} /></div><div className="friend-list">{filtered.map((friend) => <div className="friend-row card" key={friend.handle}><span className="friend-avatar">{friend.initial}</span><div className="friend-info"><p className="friend-name">{friend.name}</p><span className="friend-handle">{friend.handle}</span></div><button className="friend-action" onClick={() => undefined}>邀请</button></div>)}</div><div id="invite" className="card" style={{ marginTop: 18, padding: 16 }}><p className="section-label">邀请朋友</p><p className="subtle">一起写一条记录。</p><div style={{ display: 'flex', gap: 8 }}><input placeholder="friend@email.com" style={{ flex: 1, minWidth: 0, border: '1px solid var(--line)', borderRadius: 8, padding: '9px 10px', background: 'rgba(255,255,255,.5)' }} /><button className="btn btn-primary" style={{ minHeight: 40, padding: '7px 12px' }}><Send size={15} />发送</button></div></div></PageFrame>;
}

export function MeView() {
  return <PageFrame active="me" note="我的"><div className="section-head"><div><p className="section-label">我的</p><h1 className="section-title">我的</h1></div></div><section className="profile-card card"><div className="profile-avatar">L</div><h2 className="profile-name">Laura Hanjing</h2><p className="profile-handle">@hanjing · laura@example.com</p><div className="profile-stats"><div><strong>12</strong><span>记录</span></div><div><strong>8</strong><span>朋友</span></div><div><strong>4</strong><span>共享</span></div></div></section><div style={{ display: 'grid', gap: 9, marginTop: 14 }}><Link href="/settings" className="card" style={{ padding: 15, display: 'flex', justifyContent: 'space-between' }}>设置 <ArrowRight size={17} /></Link><button className="btn btn-ghost" onClick={() => undefined}>退出</button></div></PageFrame>;
}
