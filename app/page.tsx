"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import {
  ArrowLeft,
  BookOpen,
  Camera,
  Check,
  ChevronRight,
  CircleUserRound,
  Feather,
  Grid2X2,
  Image as ImageIcon,
  LogOut,
  Mail,
  MessageCircle,
  Plus,
  Search,
  Send,
  Settings,
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

type ShelfObject = {
  id: string;
  storyId?: number;
  date: string;
  title: string;
  image: string;
  people: string[];
  cutout: boolean;
};

const stories: Story[] = [
  { id: 1, date: "2024 / 06 / 14", day: "FRI", title: "便利店门口", excerpt: "买水时遇到一只猫。", content: "雨停在便利店门口。\n\n橘猫从纸箱里探出头，我们在门边站了十分钟。后来把伞借给了没有伞的人。", image: "https://images.unsplash.com/photo-1514897575457-c4db467cf78e?auto=format&fit=crop&w=900&q=80", tone: "ochre", people: ["你", "Mia"], public: true },
  { id: 2, date: "2024 / 05 / 28", day: "TUE", title: "末班车", excerpt: "车没来，我们走回家。", content: "末班车开走之后，站台安静下来。\n\n我们交换了耳机里的歌，沿着熟悉的路走到天亮前。", image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80", tone: "clay", people: ["你", "Noah", "June"], public: true },
  { id: 3, date: "2024 / 05 / 03", day: "FRI", title: "面包店", excerpt: "周五，买到热面包。", content: "我们在周五下午排队买面包。\n\n老板多送了一块曲奇，烤箱响了一声，下午就有了形状。", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80", tone: "sand", people: ["你", "Kai"], public: false },
  { id: 4, date: "2024 / 04 / 19", day: "FRI", title: "窗台的风", excerpt: "下午的风吹动了窗帘。", content: "窗台上的影子慢慢移到墙角。\n\n我们把一小盆薄荷放到光里，屋里多了一点清新的气味。", image: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=900&q=80", tone: "sand", people: ["你"], public: false },
];
const gallery = stories.filter((story) => story.public);
const sampleObjects: ShelfObject[] = stories.map((story) => ({
  id: `story-${story.id}`,
  storyId: story.id,
  date: story.date,
  title: story.title,
  image: story.image,
  people: story.people,
  cutout: false,
}));

function Brand({ onBook }: { onBook: () => void }) {
  return <div className="brand-mark"><button className="book-launch" onClick={onBook} aria-label="打开年表"><BookOpen size={23} strokeWidth={1.8} aria-hidden="true" /></button></div>;
}

function NavItem({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick} aria-label={label}>{icon}</button>;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("shelf");
  const [timeline, setTimeline] = useState(false);
  const [reader, setReader] = useState<Story | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [commentStory, setCommentStory] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [shelfObjects, setShelfObjects] = useState<ShelfObject[]>(sampleObjects);
  useEffect(() => { if (new URLSearchParams(window.location.search).get("view") === "timeline") setTimeline(true); }, []);
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2600); };
  const openReader = (story: Story) => { setReader(story); };

  if (reader) return <main className="reader-screen parchment-screen"><header className="reader-header"><button className="icon-button" onClick={() => setReader(null)} aria-label="返回"><ArrowLeft size={20}/></button><span>{reader.date}</span><span aria-hidden="true" /></header><article className="page-sheet parchment-sheet"><img src={reader.image} alt="" className="reader-image parchment-image"/><div className="parchment-copy"><p className="eyebrow">{reader.day} · {reader.date}</p><h1>{reader.title}</h1><p className="lead">{reader.excerpt}</p><div className="reader-copy">{reader.content.split("\n").map((line, index) => line ? <p key={index}>{line}</p> : null)}</div></div></article></main>;

  return <main className="app-shell"><header className="topbar"><Brand onBook={() => { setTimeline(true); setTab("shelf"); }}/><div className="top-actions"><button className="round-action" aria-label="搜索" onClick={() => notify("搜索功能即将开放")}><Search size={18}/></button><button className="avatar" onClick={() => setTab("me")} aria-label="打开个人资料">L</button></div></header><div className="content-area">{timeline ? <TimelineView onOpen={openReader} onBack={() => setTimeline(false)} /> : tab === "shelf" ? <ShelfView items={shelfObjects} onOpen={openReader} onAdd={() => setShowAdd(true)} /> : tab === "gallery" ? <GalleryView onOpen={openReader} commentStory={commentStory} setCommentStory={setCommentStory} notify={notify}/> : tab === "friends" ? <FriendsView notify={notify}/> : <MeView notify={notify}/>}</div><nav className="bottom-nav" aria-label="主导航"><NavItem active={tab === "shelf" && !timeline} icon={<Grid2X2 size={20}/>} label="打开首页" onClick={() => { setTab("shelf"); setTimeline(false); }}/><NavItem active={tab === "gallery"} icon={<ImageIcon size={20}/>} label="打开相册" onClick={() => { setTab("gallery"); setTimeline(false); }}/><button className="add-button" onClick={() => setShowAdd(true)} aria-label="新增物品"><Plus size={26}/></button><NavItem active={tab === "friends"} icon={<Users size={20}/>} label="打开朋友" onClick={() => { setTab("friends"); setTimeline(false); }}/><NavItem active={tab === "me"} icon={<CircleUserRound size={20}/>} label="打开个人资料" onClick={() => { setTab("me"); setTimeline(false); }}/></nav>{showAdd && <AddStory onClose={() => setShowAdd(false)} onAdd={(item) => setShelfObjects((current) => [item, ...current])} notify={notify}/>} {notice && <div className="toast"><Check size={16}/> {notice}</div>}</main>;
}

function ShelfView({ items, onOpen, onAdd }: { items: ShelfObject[]; onOpen: (story: Story) => void; onAdd: () => void }) {
  const rows: ShelfObject[][] = [];
  for (let index = 0; index < items.length; index += 4) rows.push(items.slice(index, index + 4));
  return <section className="view shelf-view" aria-label="物品架"><div className="shelf-rack">{rows.map((row, index) => <div className={`shelf-row ${index === 0 ? "shelf-row-top" : "shelf-row-bottom"}`} key={row.map((item) => item.id).join("-")}>{row.map((item) => <ShelfItem key={item.id} item={item} onOpen={onOpen}/>)}{row.length < 4 && <button className="shelf-empty" onClick={onAdd} aria-label="添加物品"><Plus size={19}/></button>}{row.length < 3 && <button className="shelf-empty" onClick={onAdd} aria-label="添加物品"><Plus size={19}/></button>}{row.length < 2 && <button className="shelf-empty" onClick={onAdd} aria-label="添加物品"><Plus size={19}/></button>}</div>)}{items.length === 0 && <div className="shelf-row shelf-row-bottom">{Array.from({ length: 4 }, (_, index) => <button className="shelf-empty" key={index} onClick={onAdd} aria-label="添加物品"><Plus size={19}/></button>)}</div>}</div></section>;
}

function ShelfItem({ item, onOpen }: { item: ShelfObject; onOpen: (story: Story) => void }) { const story = item.storyId ? stories.find((entry) => entry.id === item.storyId) : { id: 0, date: item.date, day: "", title: item.title, excerpt: "", content: "", image: item.image, tone: "", people: item.people, public: false }; return <button className="shelf-item" onClick={() => story && onOpen(story)} aria-label="打开物品"><span className={`shelf-item-image ${item.cutout ? "is-cutout" : ""}`}><img src={item.image} alt=""/></span></button>; }

function TimelineView({ onOpen, onBack }: { onOpen: (story: Story) => void; onBack: () => void }) { return <section className="view timeline-view"><div className="view-heading"><div><p className="eyebrow">2024</p></div><button className="icon-button" onClick={onBack} aria-label="返回"><ArrowLeft size={18}/></button></div><div className="timeline">{stories.map((story, index) => <div className="timeline-row" key={story.id}><div className="date-rail"><strong>{story.date.split(" / ").slice(1).join("/")}</strong><span>{story.day}</span>{index !== stories.length - 1 && <i/>}</div><button className={`story-card ${story.tone}`} onClick={() => onOpen(story)}><div className="card-copy"><span className="card-kicker">{story.public ? "公开" : "私藏"}</span><h2>{story.title}</h2><p>{story.excerpt}</p><span className="read-link">打开 <ChevronRight size={15}/></span></div><img src={story.image} alt=""/></button></div>)}</div></section>; }

function GalleryView({ onOpen, commentStory, setCommentStory, notify }: { onOpen: (story: Story) => void; commentStory: number | null; setCommentStory: (id: number | null) => void; notify: (message: string) => void }) {
  const columns = [gallery.filter((_, index) => index % 2 === 0), gallery.filter((_, index) => index % 2 === 1)];
  return <section className="view gallery-view" aria-label="相册"><div className="masonry">{columns.map((items, columnIndex) => <div className="masonry-column" key={columnIndex}>{items.map((story) => { const index = gallery.indexOf(story); return <article className={`gallery-card ${index % 2 ? "offset" : ""}`} key={story.id}><button className="image-button" onClick={() => onOpen(story)}><img src={story.image} alt={story.title} style={{ aspectRatio: index % 2 ? "3 / 4" : "4 / 5", objectFit: "cover" }}/></button><div className="gallery-meta"><p className="card-kicker">{story.date} · {story.people.join(" + ")}</p><h2>{story.title}</h2><p>{story.excerpt}</p><div className="comment-row"><button onClick={() => notify("已标记")} aria-label="标记"><span aria-hidden="true">♡</span> 12</button><button onClick={() => setCommentStory(commentStory === story.id ? null : story.id)}><MessageCircle size={15}/> {commentStory === story.id ? "收起" : "3"}</button></div>{commentStory === story.id && <div className="comments"><p><b>Mia</b> 我也记得。</p><p><b>Noah</b> 那晚很特别。</p><div className="comment-input"><input placeholder="写回应"/><button aria-label="发送" onClick={() => notify("已发送")}><Send size={14}/></button></div></div>}</div></article>; })}</div>)}</div></section>;
}

function FriendsView({ notify }: { notify: (message: string) => void }) { const [query, setQuery] = useState(""); const people = [{ name: "Mia Chen", handle: "@mia", status: "3 条共享记录", initials: "MC" }, { name: "Noah Lin", handle: "@noah", status: "今天在线", initials: "NL" }, { name: "June Wang", handle: "@june", status: "1 条共享记录", initials: "JW" }]; return <section className="view"><div className="view-heading"><div><p className="eyebrow">朋友</p><h1>朋友</h1></div><button className="add-friend" onClick={() => notify("邀请链接已复制")}><UserPlus size={17}/> 邀请</button></div><div className="search-field"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索姓名"/></div><div className="friend-list">{people.filter(p => `${p.name} ${p.handle}`.toLowerCase().includes(query.toLowerCase())).map(person => <div className="friend-row" key={person.handle}><span className="person-avatar">{person.initials}</span><div><strong>{person.name}</strong><small>{person.handle} · {person.status}</small></div><button className="quiet-button" onClick={() => notify(`已打开 ${person.name} 的记录`)}>查看</button></div>)}</div><div className="invite-card"><Feather size={19}/><div><b>邀请朋友</b><p>一起写一条记录。</p></div><button onClick={() => notify("邀请链接已复制")}>邀请 <ChevronRight size={15}/></button></div></section>; }

function MeView({ notify }: { notify: (message: string) => void }) { return <section className="view me-view"><div className="view-heading"><div><p className="eyebrow">我的</p><h1>我的</h1></div><button className="icon-button" onClick={() => notify("设置功能即将开放")} aria-label="设置"><Settings size={19}/></button></div><div className="profile-card"><span className="profile-avatar">L</span><div><h2>Laura Hanjing</h2><p>@laura · 2024</p></div><button className="quiet-button" onClick={() => notify("资料编辑功能即将开放")}>编辑</button></div><div className="stats"><div><strong>03</strong><span>记录</span></div><div><strong>02</strong><span>公开</span></div><div><strong>04</strong><span>朋友</span></div></div><div className="settings-list"><button onClick={() => notify("邮箱已验证")}><Mail size={18}/><span>邮箱<small>laura@example.com · 已验证</small></span><Check size={17}/></button><button onClick={() => signOut({ callbackUrl: "/login" })}><LogOut size={18}/><span>退出<small>退出账号</small></span><ChevronRight size={17}/></button></div></section>; }

async function cropToPng(file: File): Promise<Blob> {
  const image = await createImageBitmap(file);
  const inset = Math.round(Math.min(image.width, image.height) * 0.04);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, image.width - inset * 2);
  canvas.height = Math.max(1, image.height - inset * 2);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas unavailable");
  context.drawImage(image, inset, inset, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
  image.close();
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("png unavailable")), "image/png"));
}

function formatShelfDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${year} / ${month} / ${day}`;
}

function AddStory({ onClose, onAdd, notify }: { onClose: () => void; onAdd: (item: ShelfObject) => void; notify: (message: string) => void }) {
  const [visibility, setVisibility] = useState("PRIVATE");
  const [date, setDate] = useState("2024-06-14");
  const [title, setTitle] = useState("");
  const [people, setPeople] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [cutoutStatus, setCutoutStatus] = useState<"idle" | "processing" | "ready" | "fallback">("idle");
  const [error, setError] = useState("");

  const processImage = async (file: File) => {
    setError("");
    setCutoutStatus("processing");
    const sourceUrl = URL.createObjectURL(file);
    setImageUrl(sourceUrl);
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const png = await removeBackground(file, {
        model: "isnet_quint8",
        output: { format: "image/png" },
      });
      setImageBlob(png);
      setImageUrl(URL.createObjectURL(png));
      setCutoutStatus("ready");
    } catch {
      try {
        const cropped = await cropToPng(file);
        setImageBlob(cropped);
        setImageUrl(URL.createObjectURL(cropped));
        setCutoutStatus("fallback");
      } catch {
        setImageBlob(null);
        setCutoutStatus("idle");
        setError("图片无法处理，请换一张照片。");
      }
    }
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!imageBlob || cutoutStatus === "processing") {
      setError(cutoutStatus === "processing" ? "正在扣图，请稍等。" : "先添加一张照片。");
      return;
    }
    const item: ShelfObject = {
      id: `item-${Date.now()}`,
      date: formatShelfDate(date),
      title: title.trim(),
      image: imageUrl,
      people: people.split(/[、,，]/).map((name) => name.trim()).filter(Boolean),
      cutout: cutoutStatus === "ready",
    };
    onAdd(item);
    onClose();
    notify(cutoutStatus === "ready" ? "透明物品已上架" : "已用居中裁切上架");
  };

  return <div className="modal-backdrop" onClick={onClose}><section className="add-sheet" onClick={e => e.stopPropagation()}><div className="sheet-head"><div><p className="eyebrow">新增物品</p><h2>放上一件</h2></div><button className="icon-button" onClick={onClose} aria-label="关闭"><X size={20}/></button></div><form onSubmit={submit}><label>发现 / 发明日期<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required/></label><label>短标题<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="给它一个名字" required/></label><label>参与好友<input value={people} onChange={(event) => setPeople(event.target.value)} placeholder="用逗号分开，可不填"/></label><label>照片<span className="upload-box"><Camera size={19}/> 拍照或从相册选图 <small>自动扣图</small><input type="file" accept="image/*" capture="environment" onChange={(event) => { const file = event.target.files?.[0]; if (file) void processImage(file); }} required/></span></label>{imageUrl && <div className="cutout-preview"><img src={imageUrl} alt="待上架物品预览"/><span className={`cutout-status ${cutoutStatus}`}>{cutoutStatus === "processing" ? "正在扣图…" : cutoutStatus === "ready" ? "透明 PNG 已生成" : cutoutStatus === "fallback" ? "自动扣图未完成，已用居中裁切" : "等待处理"}</span></div>}{error && <p className="form-error" role="alert">{error}</p>}<div className="visibility"><span>可见范围</span><div><button type="button" className={visibility === "PRIVATE" ? "selected" : ""} onClick={() => setVisibility("PRIVATE")}>私藏<small>仅自己和参与者</small></button><button type="button" className={visibility === "PUBLIC" ? "selected" : ""} onClick={() => setVisibility("PUBLIC")}>公开<small>显示在相册</small></button></div></div><button className="primary-button" type="submit" disabled={cutoutStatus === "processing"}>上架 <Check size={17}/></button></form></section></div>;
}
