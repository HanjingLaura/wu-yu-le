"use client";

import { useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Feather,
  Grid2X2,
  Heart,
  Image as ImageIcon,
  LogOut,
  Mail,
  MessageCircle,
  Plus,
  Search,
  Send,
  Settings,
  Sparkles,
  UserPlus,
  Users,
  X,
} from "lucide-react";

type Tab = "shelf" | "gallery" | "friends" | "me";
type Story = {
  id: number;
  date: string;
  day: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  tone: string;
  people: string[];
  public: boolean;
};

const stories: Story[] = [
  { id: 1, date: "2024 / 06 / 14", day: "FRI", title: "便利店门口", excerpt: "买水时遇到一只猫。", content: "雨停在便利店门口。\n\n橘猫从纸箱里探出头，我们在门边站了十分钟。后来把伞借给了没有伞的人。", image: "https://images.unsplash.com/photo-1514897575457-c4db467cf78e?auto=format&fit=crop&w=900&q=80", tone: "ochre", people: ["你", "Mia"], public: true },
  { id: 2, date: "2024 / 05 / 28", day: "TUE", title: "末班车", excerpt: "车没来，我们走回家。", content: "末班车开走之后，站台安静下来。\n\n我们交换了耳机里的歌，沿着熟悉的路走到天亮前。", image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80", tone: "clay", people: ["你", "Noah", "June"], public: true },
  { id: 3, date: "2024 / 05 / 03", day: "FRI", title: "面包店", excerpt: "周五，买到热面包。", content: "我们在周五下午排队买面包。\n\n老板多送了一块曲奇，烤箱响了一声，下午就有了形状。", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80", tone: "sand", people: ["你", "Kai"], public: false },
];
const gallery = stories.filter((story) => story.public);

function Brand({ onBook }: { onBook: () => void }) {
  return <div className="brand-mark"><button className="book-launch" onClick={onBook} aria-label="打开史书" title="史书"><BookOpen size={23} strokeWidth={1.8} aria-hidden="true" /></button><span><b>物语了</b><small>展架</small></span></div>;
}

function NavItem({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>{icon}<span>{label}</span></button>;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("shelf");
  const [timeline, setTimeline] = useState(false);
  const [reader, setReader] = useState<Story | null>(null);
  const [page, setPage] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [commentStory, setCommentStory] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  useEffect(() => { if (new URLSearchParams(window.location.search).get("view") === "timeline") setTimeline(true); }, []);
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2600); };
  const openReader = (story: Story) => { setReader(story); setPage(0); };
  const contentPages = useMemo(() => reader ? [reader.content.split("\n\n")[0], reader.content.split("\n\n").slice(1).join("\n\n")] : [], [reader]);

  if (reader) return <main className="reader-screen"><header className="reader-header"><button className="icon-button" onClick={() => setReader(null)} aria-label="返回"><ArrowLeft size={20}/></button><span>阅读 · {reader.date}</span><button className="icon-button" onClick={() => notify("已收藏")} aria-label="收藏"><Heart size={19}/></button></header><div className="reader-progress"><span style={{ width: `${(page + 1) * 50}%` }}/></div><article className="page-sheet" key={`${reader.id}-${page}`}><p className="eyebrow">{reader.day} · {reader.date}</p>{page === 0 ? <><h1>{reader.title}</h1><p className="lead">{reader.excerpt}</p><img src={reader.image} alt="" className="reader-image"/></> : <div className="reader-copy">{contentPages[1].split("\n").map((line, index) => line ? <p key={index}>{line}</p> : null)}</div>}<div className="page-number">0{page + 1} / 02</div></article><div className="reader-controls"><button disabled={page === 0} onClick={() => setPage(0)}><ChevronLeft size={18}/> 上一页</button><span>翻页</span><button disabled={page === 1} onClick={() => setPage(1)}>下一页 <ChevronRight size={18}/></button></div></main>;

  return <main className="app-shell"><header className="topbar"><Brand onBook={() => { setTimeline(true); setTab("shelf"); }}/><div className="top-actions"><button className="round-action" aria-label="搜索" onClick={() => notify("搜索功能即将开放")}><Search size={18}/></button><button className="avatar" onClick={() => setTab("me")} aria-label="我的">L</button></div></header><div className="content-area">{timeline ? <TimelineView onOpen={openReader} onBack={() => setTimeline(false)} /> : tab === "shelf" ? <ShelfView onOpen={openReader} /> : tab === "gallery" ? <GalleryView onOpen={openReader} commentStory={commentStory} setCommentStory={setCommentStory} notify={notify}/> : tab === "friends" ? <FriendsView notify={notify}/> : <MeView notify={notify}/>}</div><nav className="bottom-nav"><NavItem active={tab === "shelf" && !timeline} icon={<Grid2X2 size={20}/>} label="展架" onClick={() => { setTab("shelf"); setTimeline(false); }}/><NavItem active={tab === "gallery"} icon={<ImageIcon size={20}/>} label="相册" onClick={() => { setTab("gallery"); setTimeline(false); }}/><button className="add-button" onClick={() => setShowAdd(true)} aria-label="新增"><Plus size={26}/></button><NavItem active={tab === "friends"} icon={<Users size={20}/>} label="朋友" onClick={() => { setTab("friends"); setTimeline(false); }}/><NavItem active={tab === "me"} icon={<CircleUserRound size={20}/>} label="我的" onClick={() => { setTab("me"); setTimeline(false); }}/></nav>{showAdd && <AddStory onClose={() => setShowAdd(false)} notify={notify}/>} {notice && <div className="toast"><Check size={16}/> {notice}</div>}</main>;
}

function ShelfView({ onOpen }: { onOpen: (story: Story) => void }) { return <section className="view shelf-view"><div className="shelf-heading"><div><p className="eyebrow">2024</p><h1>展架</h1></div></div><div className="shelf-note"><span>03</span><span>件记录</span></div><div className="shelf-rack"><div className="shelf-row shelf-row-top">{stories.slice(0, 2).map((story) => <ShelfItem key={story.id} story={story} onOpen={onOpen}/>)}</div><div className="shelf-row shelf-row-bottom"><ShelfItem story={stories[2]} onOpen={onOpen}/><button className="shelf-empty" onClick={() => undefined} aria-label="空位"><Plus size={19}/></button></div></div></section>; }

function ShelfItem({ story, onOpen }: { story: Story; onOpen: (story: Story) => void }) { return <button className={`shelf-item ${story.tone}`} onClick={() => onOpen(story)}><span className="shelf-item-image"><img src={story.image} alt=""/></span><span className="shelf-item-copy"><small>{story.date.split(" / ").slice(1).join(".")}</small><strong>{story.title}</strong><em>{story.public ? "公开" : "私藏"}</em></span></button>; }

function TimelineView({ onOpen, onBack }: { onOpen: (story: Story) => void; onBack: () => void }) { return <section className="view timeline-view"><div className="view-heading"><div><p className="eyebrow">2024</p><h1>史书</h1></div><button className="text-button" onClick={onBack}><ArrowLeft size={16}/> 展架</button></div><div className="timeline">{stories.map((story, index) => <div className="timeline-row" key={story.id}><div className="date-rail"><strong>{story.date.split(" / ").slice(1).join("/")}</strong><span>{story.day}</span>{index !== stories.length - 1 && <i/>}</div><button className={`story-card ${story.tone}`} onClick={() => onOpen(story)}><div className="card-copy"><span className="card-kicker">{story.public ? "公开" : "私藏"}</span><h2>{story.title}</h2><p>{story.excerpt}</p><span className="read-link">打开 <ChevronRight size={15}/></span></div><img src={story.image} alt=""/></button></div>)}</div></section>; }

function GalleryView({ onOpen, commentStory, setCommentStory, notify }: { onOpen: (story: Story) => void; commentStory: number | null; setCommentStory: (id: number | null) => void; notify: (message: string) => void }) { return <section className="view"><div className="view-heading"><div><p className="eyebrow">公开</p><h1>相册</h1></div><button className="text-button" onClick={() => notify("已显示全部公开记录")}><Sparkles size={15}/> 全部</button></div><div className="masonry">{gallery.map((story, index) => <article className={`gallery-card ${index % 2 ? "offset" : ""}`} key={story.id}><button className="image-button" onClick={() => onOpen(story)}><img src={story.image} alt={story.title}/></button><div className="gallery-meta"><p className="card-kicker">{story.date} · {story.people.join(" + ")}</p><h2>{story.title}</h2><p>{story.excerpt}</p><div className="comment-row"><button onClick={() => notify("已收藏")}><Heart size={15}/> 12</button><button onClick={() => setCommentStory(commentStory === story.id ? null : story.id)}><MessageCircle size={15}/> {commentStory === story.id ? "收起" : "3"}</button></div>{commentStory === story.id && <div className="comments"><p><b>Mia</b> 我也记得。</p><p><b>Noah</b> 那晚很特别。</p><div className="comment-input"><input placeholder="写回应"/><button aria-label="发送" onClick={() => notify("已发送")}><Send size={14}/></button></div></div>}</div></article>)}</div></section>; }

function FriendsView({ notify }: { notify: (message: string) => void }) { const [query, setQuery] = useState(""); const people = [{ name: "Mia Chen", handle: "@mia", status: "3 条共享记录", initials: "MC" }, { name: "Noah Lin", handle: "@noah", status: "今天在线", initials: "NL" }, { name: "June Wang", handle: "@june", status: "1 条共享记录", initials: "JW" }]; return <section className="view"><div className="view-heading"><div><p className="eyebrow">朋友</p><h1>朋友</h1></div><button className="add-friend" onClick={() => notify("邀请链接已复制")}><UserPlus size={17}/> 邀请</button></div><div className="search-field"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索姓名"/></div><div className="friend-list">{people.filter(p => `${p.name} ${p.handle}`.toLowerCase().includes(query.toLowerCase())).map(person => <div className="friend-row" key={person.handle}><span className="person-avatar">{person.initials}</span><div><strong>{person.name}</strong><small>{person.handle} · {person.status}</small></div><button className="quiet-button" onClick={() => notify(`已打开 ${person.name} 的记录`)}>查看</button></div>)}</div><div className="invite-card"><Feather size={19}/><div><b>邀请朋友</b><p>一起写一条记录。</p></div><button onClick={() => notify("邀请链接已复制")}>邀请 <ChevronRight size={15}/></button></div></section>; }

function MeView({ notify }: { notify: (message: string) => void }) { return <section className="view me-view"><div className="view-heading"><div><p className="eyebrow">我的</p><h1>我的</h1></div><button className="icon-button" onClick={() => notify("设置功能即将开放")} aria-label="设置"><Settings size={19}/></button></div><div className="profile-card"><span className="profile-avatar">L</span><div><h2>Laura Hanjing</h2><p>@laura · 2024</p></div><button className="quiet-button" onClick={() => notify("资料编辑功能即将开放")}>编辑</button></div><div className="stats"><div><strong>03</strong><span>记录</span></div><div><strong>02</strong><span>公开</span></div><div><strong>04</strong><span>朋友</span></div></div><div className="settings-list"><button onClick={() => notify("邮箱已验证")}><Mail size={18}/><span>邮箱<small>laura@example.com · 已验证</small></span><Check size={17}/></button><button onClick={() => signOut({ callbackUrl: "/login" })}><LogOut size={18}/><span>退出<small>退出账号</small></span><ChevronRight size={17}/></button></div></section>; }

function AddStory({ onClose, notify }: { onClose: () => void; notify: (message: string) => void }) { const [visibility, setVisibility] = useState("PRIVATE"); return <div className="modal-backdrop" onClick={onClose}><section className="add-sheet" onClick={e => e.stopPropagation()}><div className="sheet-head"><div><p className="eyebrow">新增</p><h2>写一条</h2></div><button className="icon-button" onClick={onClose} aria-label="关闭"><X size={20}/></button></div><form onSubmit={e => { e.preventDefault(); onClose(); notify("已保存"); }}><label>日期<input type="date" defaultValue="2024-06-14" required/></label><label>标题<input placeholder="给它一个名字" required/></label><label>内容<textarea rows={5} placeholder="写下发生的事" required/></label><label>图片<span className="upload-box"><ImageIcon size={19}/> 添加图片 <small>可选</small><input type="file" accept="image/*" multiple/></span></label><div className="visibility"><span>可见范围</span><div><button type="button" className={visibility === "PRIVATE" ? "selected" : ""} onClick={() => setVisibility("PRIVATE")}>私藏<small>仅自己和参与者</small></button><button type="button" className={visibility === "PUBLIC" ? "selected" : ""} onClick={() => setVisibility("PUBLIC")}>公开<small>显示在相册</small></button></div></div><button className="primary-button" type="submit">保存 <Check size={17}/></button></form></section></div>; }
