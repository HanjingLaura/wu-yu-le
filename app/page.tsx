"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import {
  ArrowLeft,
  BookOpen,
  Camera,
  Check,
  ChevronRight,
  CircleUserRound,
  Images,
  Layers,
  LogOut,
  Heart,
  MessageCircle,
  Plus,
  Search,
  Settings,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  initialStories,
  makePlaceholderBatch,
  sampleObjects,
  type ShelfObject,
  type Story,
} from "@/lib/sample-shelf";
import EventDetail, { defaultEventSocial, type EventSocial } from "@/components/EventDetail";

type Tab = "shelf" | "gallery" | "friends" | "me";

const SAMPLE_FRIENDS = [
  { name: "Mia Chen", handle: "@mia", status: "3 条共享记录", initials: "MC" },
  { name: "Noah Lin", handle: "@noah", status: "今天在线", initials: "NL" },
  { name: "June Wang", handle: "@june", status: "1 条共享记录", initials: "JW" },
  { name: "Kai Zhou", handle: "@kai", status: "2 条共享记录", initials: "KZ" },
];

function Brand({ onBook }: { onBook: () => void }) {
  return <div className="brand-mark"><button className="book-launch" onClick={onBook} aria-label="打开年表"><BookOpen size={23} strokeWidth={1.8} aria-hidden="true" /></button></div>;
}

function NavItem({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick} aria-label={label}>{icon}</button>;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("shelf");
  const [timeline, setTimeline] = useState(false);
  const [reader, setReader] = useState<{ story: Story; objectImage: string } | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [socialById, setSocialById] = useState<Record<number, EventSocial>>({});
  const [notice, setNotice] = useState("");
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [shelfObjects, setShelfObjects] = useState<ShelfObject[]>(sampleObjects);
  useEffect(() => {
    const view = new URLSearchParams(window.location.search).get("view");
    if (view === "timeline") setTimeline(true);
    if (view === "gallery") setTab("gallery");
    if (view === "friends") setTab("friends");
    if (view === "me") setTab("me");
    if (view === "add") setShowAdd(true);
  }, []);
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2600); };
  const openEvent = (story: Story, objectImage = story.objectImage) => { setReader({ story, objectImage }); };
  const socialFor = (id: number) => socialById[id] ?? defaultEventSocial();
  const toggleLike = (id: number) => {
    setSocialById((current) => {
      const now = current[id] ?? defaultEventSocial();
      const liked = !now.liked;
      return { ...current, [id]: { ...now, liked, likes: Math.max(0, now.likes + (liked ? 1 : -1)) } };
    });
  };
  const addComment = (id: number, text: string) => {
    setSocialById((current) => {
      const now = current[id] ?? defaultEventSocial();
      return { ...current, [id]: { ...now, comments: [...now.comments, { id: Date.now(), author: "Laura", text }] } };
    });
  };

  if (reader) {
    const { story, objectImage } = reader;
    return (
      <EventDetail
        story={story}
        objectImage={objectImage}
        social={socialFor(story.id)}
        onBack={() => setReader(null)}
        onToggleLike={() => toggleLike(story.id)}
        onAddComment={(text) => addComment(story.id, text)}
      />
    );
  }

  const addStory = (item: ShelfObject, story: Story) => {
    setShelfObjects((current) => [item, ...current]);
    setStories((current) => [story, ...current]);
  };
  const showShelfHeader = tab === "shelf" && !timeline && !showAdd;
  return (
    <main className={`app-shell${showShelfHeader ? "" : " app-shell-plain"}`}>
      {showShelfHeader && (
        <header className="topbar">
          <Brand onBook={() => { setTimeline(true); setTab("shelf"); }} />
          <div className="top-actions">
            <button className="round-action" aria-label="搜索" onClick={() => notify("搜索功能即将开放")}><Search size={18} /></button>
          </div>
        </header>
      )}
      <div className="content-area">
        {timeline ? <TimelineView stories={stories} onOpen={openEvent} onBack={() => setTimeline(false)} /> : tab === "shelf" ? <ShelfView items={shelfObjects} stories={stories} onOpen={openEvent} onAdd={() => setShowAdd(true)} /> : tab === "gallery" ? <GalleryView stories={stories} onOpen={openEvent} socialById={socialById} onToggleLike={toggleLike} /> : tab === "friends" ? <FriendsView notify={notify} /> : <MeView notify={notify} />}
      </div>
      <nav className="bottom-nav" aria-label="主导航">
        <NavItem active={tab === "shelf" && !timeline} icon={<Layers size={20} />} label="打开首页" onClick={() => { setTab("shelf"); setTimeline(false); }} />
        <NavItem active={tab === "gallery"} icon={<Images size={20} />} label="打开相册" onClick={() => { setTab("gallery"); setTimeline(false); }} />
        <button className="add-button" onClick={() => setShowAdd(true)} aria-label="新增物品"><Plus size={24} /></button>
        <NavItem active={tab === "friends"} icon={<Users size={20} />} label="打开朋友" onClick={() => { setTab("friends"); setTimeline(false); }} />
        <NavItem active={tab === "me"} icon={<CircleUserRound size={20} />} label="打开个人资料" onClick={() => { setTab("me"); setTimeline(false); }} />
      </nav>
      {showAdd && <AddStory onClose={() => setShowAdd(false)} onAdd={addStory} notify={notify} />}
      {notice && <div className="toast"><Check size={16} /> {notice}</div>}
    </main>
  );
}

function chunkRows(items: ShelfObject[]) {
  const rows: ShelfObject[][] = [];
  for (let index = 0; index < items.length; index += 4) rows.push(items.slice(index, index + 4));
  return rows;
}

function ShelfView({ items, stories, onOpen, onAdd }: { items: ShelfObject[]; stories: Story[]; onOpen: (story: Story, objectImage?: string) => void; onAdd: () => void }) {
  const [extras, setExtras] = useState<{ items: ShelfObject[]; stories: Story[] }>({ items: [], stories: [] });
  const sentinelRef = useRef<HTMLDivElement>(null);
  const displayedItems = [...items, ...extras.items];
  const displayedStories = [...stories, ...extras.stories];
  const rows = chunkRows(displayedItems);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    let locked = false;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting || locked) return;
      locked = true;
      setExtras((current) => {
        if (current.items.length >= 160) return current;
        const next = makePlaceholderBatch(items.length + current.items.length);
        return { items: [...current.items, ...next.items], stories: [...current.stories, ...next.stories] };
      });
      window.setTimeout(() => { locked = false; }, 480);
    }, { root: null, rootMargin: "360px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [items.length]);

  return (
    <section className="view shelf-view" aria-label="物品架">
      <div className="shelf-rack">
        {rows.map((row, index) => (
          <div className={`shelf-row ${index === 0 ? "shelf-row-top" : "shelf-row-bottom"}`} key={row.map((item) => item.id).join("-")}>
            {row.map((item) => <ShelfItem key={item.id} item={item} stories={displayedStories} onOpen={onOpen} />)}
            {row.length < 4 && Array.from({ length: 4 - row.length }, (_, empty) => (
              <button className="shelf-empty" key={`empty-${index}-${empty}`} onClick={onAdd} aria-label="添加物品"><Plus size={19} /></button>
            ))}
          </div>
        ))}
        {displayedItems.length === 0 && (
          <div className="shelf-row shelf-row-bottom">
            {Array.from({ length: 4 }, (_, index) => <button className="shelf-empty" key={index} onClick={onAdd} aria-label="添加物品"><Plus size={19} /></button>)}
          </div>
        )}
      </div>
      <div ref={sentinelRef} className="shelf-sentinel" aria-hidden="true" />
    </section>
  );
}

function ShelfItem({ item, stories, onOpen }: { item: ShelfObject; stories: Story[]; onOpen: (story: Story, objectImage?: string) => void }) { const story = item.storyId ? stories.find((entry) => entry.id === item.storyId) : { id: 0, date: item.date, day: "", title: item.title, excerpt: "", content: "", objectImage: item.objectImage, storyImages: [], tone: "", people: item.people, public: false }; return <button className="shelf-item" onClick={() => story && onOpen(story, item.objectImage)} aria-label="打开物品"><span className={`shelf-item-image ${item.cutout ? "is-cutout" : ""}`}><img src={item.objectImage} alt=""/></span></button>; }

function TimelineView({ stories, onOpen, onBack }: { stories: Story[]; onOpen: (story: Story) => void; onBack: () => void }) {
  const orderedStories = [...stories].sort((a, b) => b.date.localeCompare(a.date));
  return <section className="view timeline-view"><div className="view-heading"><div><p className="eyebrow">2024</p></div><button className="icon-button" onClick={onBack} aria-label="返回"><ArrowLeft size={18}/></button></div><div className="timeline">{orderedStories.map((story, index) => <div className="timeline-row" key={story.id}><div className="date-rail"><strong>{story.date.split(" / ").slice(1).join("/")}</strong><span>{story.day}</span>{index !== orderedStories.length - 1 && <i/>}</div><button className={`story-card ${story.tone}`} onClick={() => onOpen(story)}><div className="card-copy"><span className="card-kicker">{story.public ? "公开" : "私藏"}</span><h2>{story.title}</h2><p>{story.excerpt}</p></div>{story.storyImages[0] ? <img src={story.storyImages[0]} alt=""/> : <span aria-hidden="true"/>}</button></div>)}</div></section>;
}

function GalleryView({ stories, onOpen, socialById, onToggleLike }: { stories: Story[]; onOpen: (story: Story, objectImage?: string) => void; socialById: Record<number, EventSocial>; onToggleLike: (id: number) => void }) {
  const gallery = stories.filter((story) => story.public && story.storyImages.length > 0);
  const columns = [gallery.filter((_, index) => index % 2 === 0), gallery.filter((_, index) => index % 2 === 1)];
  return (
    <section className="view gallery-view" aria-label="相册">
      <div className="masonry">
        {columns.map((items, columnIndex) => (
          <div className="masonry-column" key={columnIndex}>
            {items.map((story) => {
              const index = gallery.indexOf(story);
              const image = story.storyImages[0];
              const social = socialById[story.id] ?? defaultEventSocial();
              return (
                <article className={`gallery-card ${index % 2 ? "offset" : ""}`} key={story.id}>
                  <button className="image-button" onClick={() => onOpen(story)}><img src={image} alt={story.title} style={{ aspectRatio: index % 2 ? "3 / 4" : "4 / 5", objectFit: "cover" }}/></button>
                  <div className="gallery-meta">
                    <p className="card-kicker">{story.date} · {story.people.join(" + ")}</p>
                    <h2>{story.title}</h2>
                    <p>{story.excerpt}</p>
                    <div className="comment-row">
                      <button type="button" className={social.liked ? "is-liked" : ""} onClick={() => onToggleLike(story.id)} aria-pressed={social.liked} aria-label={social.liked ? "取消喜欢" : "喜欢"}>
                        <Heart size={15} fill={social.liked ? "currentColor" : "none"} aria-hidden="true" /> {social.likes}
                      </button>
                      <button type="button" onClick={() => onOpen(story)} aria-label="打开回应">
                        <MessageCircle size={15} aria-hidden="true" /> {social.comments.length}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

function FriendsView({ notify }: { notify: (message: string) => void }) {
  const [query, setQuery] = useState("");
  return (
    <section className="view friends-view" aria-label="朋友">
      <div className="friends-toolbar">
        <button className="add-friend" onClick={() => notify("邀请链接已复制")} aria-label="邀请"><UserPlus size={18} /></button>
        <div className="search-field"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索姓名" aria-label="搜索姓名" /></div>
      </div>
      <div className="friend-list">
        {SAMPLE_FRIENDS.filter((p) => `${p.name} ${p.handle}`.toLowerCase().includes(query.toLowerCase())).map((person) => (
          <div className="friend-row" key={person.handle}>
            <span className="person-avatar">{person.initials}</span>
            <div><strong>{person.name}</strong><small>{person.handle} · {person.status}</small></div>
            <button className="quiet-button" onClick={() => notify(`已打开 ${person.name} 的记录`)}>查看</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function MeView({ notify }: { notify: (message: string) => void }) {
  return (
    <section className="view me-view" aria-label="个人资料">
      <div className="profile-card">
        <div><h2>Laura Hanjing</h2><p>@laura · 2024</p></div>
        <button className="quiet-button" onClick={() => notify("资料编辑功能即将开放")}>编辑</button>
      </div>
      <div className="stats">
        <div><strong>03</strong><span>记录</span></div>
        <div><strong>02</strong><span>公开</span></div>
        <div><strong>04</strong><span>朋友</span></div>
      </div>
      <div className="settings-list">
        <button onClick={() => notify("设置功能即将开放")}><Settings size={18} /><span>设置</span><ChevronRight size={17} /></button>
        <button onClick={() => signOut({ callbackUrl: "/login" })}><LogOut size={18} /><span>退出</span><ChevronRight size={17} /></button>
      </div>
    </section>
  );
}

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

function formatStoryDay(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
  return weekday.toUpperCase();
}

function AddStory({ onClose, onAdd, notify }: { onClose: () => void; onAdd: (item: ShelfObject, story: Story) => void; notify: (message: string) => void }) {
  const [visibility, setVisibility] = useState("PRIVATE");
  const [date, setDate] = useState("2024-06-14");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [people, setPeople] = useState<string[]>([]);
  const [pickingFriends, setPickingFriends] = useState(false);
  const [draftPeople, setDraftPeople] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [storyImages, setStoryImages] = useState<string[]>([]);
  const [cutoutStatus, setCutoutStatus] = useState<"idle" | "processing" | "ready" | "fallback">("idle");
  const [error, setError] = useState("");

  const openFriendPicker = () => {
    setDraftPeople(people);
    setPickingFriends(true);
  };
  const confirmFriendPicker = () => {
    setPeople(draftPeople);
    setPickingFriends(false);
  };
  const toggleDraftFriend = (name: string) => {
    setDraftPeople((current) => current.includes(name) ? current.filter((entry) => entry !== name) : [...current, name]);
  };

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

  const chooseStoryImages = (files: FileList | null) => {
    if (!files) return;
    setStoryImages(Array.from(files).map((file) => URL.createObjectURL(file)));
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!imageBlob || cutoutStatus === "processing") {
      setError(cutoutStatus === "processing" ? "正在扣图，请稍等。" : "先添加一张照片。");
      return;
    }
    const id = Date.now();
    const normalizedTitle = title.trim();
    const normalizedContent = content.trim();
    const normalizedPeople = people;
    const formattedDate = formatShelfDate(date);
    const item: ShelfObject = {
      id: `item-${id}`,
      storyId: id,
      date: formattedDate,
      title: normalizedTitle,
      objectImage: imageUrl,
      people: normalizedPeople,
      cutout: cutoutStatus === "ready",
    };
    const story: Story = {
      id,
      date: formattedDate,
      day: formatStoryDay(date),
      title: normalizedTitle,
      excerpt: normalizedContent.replace(/\s+/g, " ").slice(0, 96),
      content: normalizedContent,
      objectImage: imageUrl,
      storyImages,
      tone: "sand",
      people: normalizedPeople,
      public: visibility === "PUBLIC",
    };
    onAdd(item, story);
    onClose();
    notify(cutoutStatus === "ready" ? "透明物品已上架" : "已用居中裁切上架");
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className={`add-sheet${pickingFriends ? " is-picking" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <button className="icon-button" onClick={onClose} aria-label="关闭"><X size={20} /></button>
        </div>
        <form onSubmit={submit}>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required aria-label="日期" />
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="给它一个名字" required aria-label="短标题" />
          <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="写下当时发生了什么…" rows={4} required aria-label="趣事正文" />
          <div className="friend-pick-field">
            <button type="button" className="picker-row" onClick={openFriendPicker} aria-label={people.length ? `加入好友，已选 ${people.join("、")}` : "加入好友"}>
              <span>加入好友</span>
              <ChevronRight size={18} aria-hidden="true" />
            </button>
            {people.length > 0 && (
              <div className="friend-chips" aria-label="已选好友">
                {people.map((name) => <span className="friend-chip" key={name}>{name}</span>)}
              </div>
            )}
          </div>
          <span className="upload-box">
            <Camera size={19} aria-hidden="true" />
            <span className="upload-label">上传物品图片</span>
            <input type="file" accept="image/*" capture="environment" onChange={(event) => { const file = event.target.files?.[0]; if (file) void processImage(file); }} required aria-label="上传物品图片" />
          </span>
          {imageUrl && (
            <div className="cutout-preview">
              <img src={imageUrl} alt="" />
              <span className={`cutout-status ${cutoutStatus}`}>
                {cutoutStatus === "processing" ? "正在扣图…" : cutoutStatus === "ready" ? "透明 PNG 已生成" : cutoutStatus === "fallback" ? "自动扣图未完成，已用居中裁切" : "等待处理"}
              </span>
            </div>
          )}
          <span className="upload-box">
            <Images size={19} aria-hidden="true" />
            <span className="upload-label">上传图片</span>
            <input type="file" accept="image/*" capture="environment" multiple onChange={(event) => chooseStoryImages(event.target.files)} aria-label="上传图片" />
          </span>
          {storyImages.length > 0 && (
            <div className="story-image-preview" aria-label={`已选 ${storyImages.length} 张现场照片`}>
              {storyImages.map((image, index) => <img key={`${image}-${index}`} src={image} alt="" />)}
            </div>
          )}
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="visibility">
            <button type="button" className={visibility === "PRIVATE" ? "selected" : ""} onClick={() => setVisibility("PRIVATE")}>私藏</button>
            <button type="button" className={visibility === "PUBLIC" ? "selected" : ""} onClick={() => setVisibility("PUBLIC")}>公开</button>
          </div>
          <button className="primary-button" type="submit" disabled={cutoutStatus === "processing"}>上架 <Check size={17} /></button>
        </form>
        {pickingFriends && (
          <div className="friend-picker" role="dialog" aria-modal="true" aria-label="加入好友">
            <div className="friend-picker-head">
              <button type="button" className="icon-button" onClick={() => setPickingFriends(false)} aria-label="返回"><ArrowLeft size={20} /></button>
              <button type="button" className="icon-button" onClick={confirmFriendPicker} aria-label="确认"><Check size={20} /></button>
            </div>
            <div className="picker-list">
              {SAMPLE_FRIENDS.map((person) => {
                const selected = draftPeople.includes(person.name);
                return (
                  <button type="button" className={`picker-friend-row${selected ? " is-selected" : ""}`} key={person.handle} onClick={() => toggleDraftFriend(person.name)} aria-pressed={selected}>
                    <span className="person-avatar">{person.initials}</span>
                    <div><strong>{person.name}</strong><small>{person.handle}</small></div>
                    <span className={`picker-check${selected ? " is-selected" : ""}`} aria-hidden="true">{selected ? <Check size={13} /> : null}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
