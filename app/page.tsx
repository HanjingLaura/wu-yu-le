"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
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
import { apiPath, withBasePath } from "@/lib/base-path";
import type { FriendRelation, PublicPerson } from "@/lib/people";

type Tab = "shelf" | "gallery" | "friends" | "me";
type SearchPerson = PublicPerson & { relation: FriendRelation };
type FriendRequest = { id: string; person: PublicPerson };

function Brand({ onBook }: { onBook: () => void }) {
  return <div className="brand-mark"><button className="book-launch" onClick={onBook} aria-label="打开年表"><BookOpen size={23} strokeWidth={1.8} aria-hidden="true" /></button></div>;
}

function NavItem({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick} aria-label={label}>{icon}</button>;
}

export default function Home() {
  const router = useRouter();
  const { status } = useSession();
  const [tab, setTab] = useState<Tab>("shelf");
  const [timeline, setTimeline] = useState(false);
  const [reader, setReader] = useState<{ story: Story; objectImage: string } | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [socialById, setSocialById] = useState<Record<number, EventSocial>>({});
  const [notice, setNotice] = useState("");
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [shelfObjects, setShelfObjects] = useState<ShelfObject[]>(sampleObjects);

  const openTab = (next: Tab) => {
    if ((next === "friends" || next === "me") && status === "unauthenticated") {
      router.push("/login");
      return;
    }
    setTab(next);
    setTimeline(false);
  };

  useEffect(() => {
    const view = new URLSearchParams(window.location.search).get("view");
    if (view === "timeline") setTimeline(true);
    if (view === "gallery") setTab("gallery");
    if (view === "add") setShowAdd(true);
    if (view === "friends" || view === "me") {
      if (status === "unauthenticated") {
        router.replace("/login");
        return;
      }
      if (status === "authenticated") setTab(view);
    }
  }, [status, router]);
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

  const addStory = (item: ShelfObject, story: Story) => {
    setShelfObjects((current) => [item, ...current]);
    setStories((current) => [story, ...current]);
  };
  const saveEvent = (item: ShelfObject, story: Story) => {
    setStories((current) => current.map((entry) => entry.id === story.id ? story : entry));
    setShelfObjects((current) => current.map((entry) => entry.storyId === story.id ? { ...entry, date: item.date, title: item.title, objectImage: item.objectImage, people: item.people, cutout: item.cutout } : entry));
    setReader({ story, objectImage: item.objectImage });
  };

  if (reader) {
    const { story, objectImage } = reader;
    return (
      <>
        <EventDetail
          story={story}
          objectImage={objectImage}
          social={socialFor(story.id)}
          onBack={() => { setShowEdit(false); setReader(null); }}
          onToggleLike={() => toggleLike(story.id)}
          onAddComment={(text) => addComment(story.id, text)}
          onEdit={() => setShowEdit(true)}
        />
        {showEdit && (
          <AddStory
            initial={{ story, objectImage, item: shelfObjects.find((entry) => entry.storyId === story.id) }}
            onClose={() => setShowEdit(false)}
            onSave={saveEvent}
            notify={notify}
          />
        )}
        {notice && <div className="toast"><Check size={16} /> {notice}</div>}
      </>
    );
  }
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
        <NavItem active={tab === "shelf" && !timeline} icon={<Layers size={20} />} label="打开首页" onClick={() => openTab("shelf")} />
        <NavItem active={tab === "gallery"} icon={<Images size={20} />} label="打开相册" onClick={() => openTab("gallery")} />
        <button className="add-button" onClick={() => setShowAdd(true)} aria-label="新增物品"><Plus size={24} /></button>
        <NavItem active={tab === "friends"} icon={<Users size={20} />} label="打开朋友" onClick={() => openTab("friends")} />
        <NavItem active={tab === "me"} icon={<CircleUserRound size={20} />} label="打开个人资料" onClick={() => openTab("me")} />
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
                      <button type="button" onClick={() => onOpen(story)} aria-label="打开评论">
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

function PersonRow({
  person,
  note,
  children,
}: {
  person: PublicPerson;
  note?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="friend-row">
      <span className="person-avatar">{person.initials}</span>
      <div>
        <strong>{person.name}</strong>
        <small>{note ? `${person.handle} · ${note}` : person.handle}</small>
      </div>
      {children}
    </div>
  );
}

function FriendsView({ notify }: { notify: (message: string) => void }) {
  const { status } = useSession();
  const [query, setQuery] = useState("");
  const [friends, setFriends] = useState<PublicPerson[]>([]);
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);
  const [results, setResults] = useState<SearchPerson[]>([]);
  const [busy, setBusy] = useState(false);

  const loadLists = async () => {
    const response = await fetch(apiPath("/api/friends"));
    if (response.status === 401) return;
    if (!response.ok) return;
    const data = await response.json();
    setFriends(Array.isArray(data.friends) ? data.friends : []);
    setIncoming(Array.isArray(data.incoming) ? data.incoming : []);
    setOutgoing(Array.isArray(data.outgoing) ? data.outgoing : []);
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    void loadLists();
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    const handle = window.setTimeout(async () => {
      const response = await fetch(apiPath(`/api/friends/search?q=${encodeURIComponent(q)}`));
      if (!response.ok) return;
      const data = await response.json();
      setResults(Array.isArray(data.results) ? data.results : []);
    }, 220);
    return () => window.clearTimeout(handle);
  }, [query, status]);

  const sendRequest = async (payload: { userId?: string; query?: string }) => {
    setBusy(true);
    const response = await fetch(apiPath("/api/friends"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      notify(data.error ?? "无法添加。");
      return;
    }
    setQuery("");
    setResults([]);
    await loadLists();
    notify(data.status === "ACCEPTED" ? "已接受" : "已发送");
  };

  const respond = async (id: string, action: "accept" | "decline") => {
    const response = await fetch(apiPath(`/api/friends/${id}`), {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      notify(data.error ?? "无法完成。");
      return;
    }
    await loadLists();
  };

  if (status === "unauthenticated") {
    return (
      <section className="view friends-view" aria-label="朋友">
        <div className="auth-needed"><Link href="/login">登录</Link></div>
      </section>
    );
  }

  return (
    <section className="view friends-view" aria-label="朋友">
      <div className="friends-toolbar">
        <button
          className="add-friend"
          onClick={() => void sendRequest({ query })}
          disabled={busy || !query.trim()}
          aria-label="添加好友"
        >
          <UserPlus size={18} />
        </button>
        <div className="search-field">
          <Search size={17} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索姓名" aria-label="搜索姓名" />
        </div>
      </div>
      <div className="friend-list">
        {query.trim()
          ? results.map((person) => (
              <PersonRow key={person.id} person={person} note={person.relation === "outgoing" ? "待接受" : person.relation === "incoming" ? "待处理" : undefined}>
                {person.relation === "none" && (
                  <button className="quiet-button" disabled={busy} onClick={() => void sendRequest({ userId: person.id })} aria-label={`添加 ${person.name}`}>
                    添加
                  </button>
                )}
                {person.relation === "incoming" && (
                  <div className="friend-row-actions">
                    {incoming.filter((row) => row.person.id === person.id).map((row) => (
                      <span key={row.id} className="friend-row-actions">
                        <button className="quiet-button" onClick={() => void respond(row.id, "accept")}>接受</button>
                        <button className="quiet-button" onClick={() => void respond(row.id, "decline")}>拒绝</button>
                      </span>
                    ))}
                  </div>
                )}
              </PersonRow>
            ))
          : (
            <>
              {incoming.map((row) => (
                <PersonRow key={row.id} person={row.person}>
                  <div className="friend-row-actions">
                    <button className="quiet-button" onClick={() => void respond(row.id, "accept")}>接受</button>
                    <button className="quiet-button" onClick={() => void respond(row.id, "decline")}>拒绝</button>
                  </div>
                </PersonRow>
              ))}
              {outgoing.map((row) => (
                <PersonRow key={row.id} person={row.person} note="待接受" />
              ))}
              {friends.map((person) => (
                <PersonRow key={person.id} person={person} />
              ))}
            </>
          )}
      </div>
    </section>
  );
}

function MeView({ notify }: { notify: (message: string) => void }) {
  const { data: session, status, update } = useSession();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    let live = true;
    fetch(apiPath("/api/me"))
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!live || !data) return;
        setName(typeof data.rawName === "string" ? data.rawName : data.name ?? "");
        setUsername(typeof data.username === "string" ? data.username : "");
        setEmail(typeof data.email === "string" ? data.email : session?.user?.email ?? "");
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [status, session?.user?.email]);

  if (status === "unauthenticated") {
    return (
      <section className="view me-view" aria-label="个人资料">
        <div className="auth-needed"><Link href="/login">登录</Link></div>
      </section>
    );
  }

  const displayName = name.trim() || username || email || session?.user?.name || session?.user?.email || "";
  const handleLine = [username ? `@${username}` : null, email].filter(Boolean).join(" · ");

  const saveSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const response = await fetch(apiPath("/api/me"), {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, username }),
    });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      notify(data.error ?? "无法保存。");
      return;
    }
    setName(typeof data.rawName === "string" ? data.rawName : data.name ?? name);
    setUsername(typeof data.username === "string" ? data.username : username);
    await update({ name: data.rawName ?? data.name ?? name, username: data.username ?? null });
    setSettingsOpen(false);
    notify("已保存");
  };

  return (
    <section className="view me-view" aria-label="个人资料">
      <div className="me-identity">
        <strong>{displayName}</strong>
        {handleLine ? <small>{handleLine}</small> : null}
      </div>
      {settingsOpen ? (
        <form className="settings-panel" onSubmit={saveSettings}>
          <label>
            姓名
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
          <label>
            用户名
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
          </label>
          <button className="primary-button" type="submit" disabled={busy}>保存</button>
          <button className="quiet-button" type="button" onClick={() => setSettingsOpen(false)}>返回</button>
        </form>
      ) : (
        <div className="settings-list">
          <button type="button" onClick={() => setSettingsOpen(true)}><Settings size={18} /><span>设置</span><ChevronRight size={17} /></button>
          <button type="button" onClick={() => signOut({ callbackUrl: withBasePath("/login") })}><LogOut size={18} /><span>退出登录</span><ChevronRight size={17} /></button>
        </div>
      )}
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

function parseInputDate(formatted: string) {
  const parts = formatted.split(" / ");
  if (parts.length === 3) return `${parts[0]}-${parts[1]}-${parts[2]}`;
  return formatted.includes("-") ? formatted : "2024-06-14";
}

function AddStory({
  onClose,
  onAdd,
  onSave,
  notify,
  initial,
}: {
  onClose: () => void;
  onAdd?: (item: ShelfObject, story: Story) => void;
  onSave?: (item: ShelfObject, story: Story) => void;
  notify: (message: string) => void;
  initial?: { story: Story; objectImage: string; item?: ShelfObject };
}) {
  const isEdit = Boolean(initial);
  const [visibility, setVisibility] = useState(initial?.story.public ? "PUBLIC" : "PRIVATE");
  const [date, setDate] = useState(initial ? parseInputDate(initial.story.date) : "2024-06-14");
  const [title, setTitle] = useState(initial?.story.title ?? "");
  const [content, setContent] = useState(initial?.story.content ?? "");
  const [people, setPeople] = useState<string[]>(initial?.story.people ?? []);
  const [pickingFriends, setPickingFriends] = useState(false);
  const [draftPeople, setDraftPeople] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState(initial?.objectImage || initial?.story.objectImage || "");
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [replacedObject, setReplacedObject] = useState(false);
  const [storyImages, setStoryImages] = useState<string[]>(initial?.story.storyImages ?? []);
  const [cutoutStatus, setCutoutStatus] = useState<"idle" | "processing" | "ready" | "fallback">(initial ? "ready" : "idle");
  const [error, setError] = useState("");
  const [pickerFriends, setPickerFriends] = useState<PublicPerson[]>([]);

  useEffect(() => {
    let live = true;
    fetch(apiPath("/api/friends"))
      .then((response) => (response.ok ? response.json() : { friends: [] }))
      .then((data) => {
        if (live) setPickerFriends(Array.isArray(data.friends) ? data.friends : []);
      })
      .catch(() => {
        if (live) setPickerFriends([]);
      });
    return () => {
      live = false;
    };
  }, []);

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
    setReplacedObject(true);
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
    if (cutoutStatus === "processing") {
      setError("正在扣图，请稍等。");
      return;
    }
    if (!imageUrl || (!isEdit && !imageBlob)) {
      setError("先添加一张照片。");
      return;
    }
    const id = initial?.story.id ?? Date.now();
    const normalizedTitle = title.trim();
    const normalizedContent = content.trim();
    const normalizedPeople = people;
    const formattedDate = formatShelfDate(date);
    const item: ShelfObject = {
      id: initial?.item?.id ?? `item-${id}`,
      storyId: id,
      date: formattedDate,
      title: normalizedTitle,
      objectImage: imageUrl,
      people: normalizedPeople,
      cutout: replacedObject ? cutoutStatus === "ready" : initial?.item?.cutout ?? cutoutStatus === "ready",
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
      tone: initial?.story.tone ?? "sand",
      people: normalizedPeople,
      public: visibility === "PUBLIC",
    };
    if (isEdit) {
      onSave?.(item, story);
      onClose();
      notify("已保存");
      return;
    }
    onAdd?.(item, story);
    onClose();
    notify(cutoutStatus === "ready" ? "透明物品已上架" : "已用居中裁切上架");
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className={`add-sheet${pickingFriends ? " is-picking" : ""}`} data-edit-sheet={isEdit ? "true" : undefined} onClick={(e) => e.stopPropagation()}>
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
            <input type="file" accept="image/*" capture="environment" onChange={(event) => { const file = event.target.files?.[0]; if (file) void processImage(file); }} required={!isEdit} aria-label="上传物品图片" />
          </span>
          {imageUrl && (
            <div className="cutout-preview">
              <img src={imageUrl} alt="" />
              {(replacedObject || cutoutStatus === "processing") && (
                <span className={`cutout-status ${cutoutStatus}`}>
                  {cutoutStatus === "processing" ? "正在扣图…" : cutoutStatus === "ready" ? "透明 PNG 已生成" : cutoutStatus === "fallback" ? "自动扣图未完成，已用居中裁切" : "等待处理"}
                </span>
              )}
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
          <button className="primary-button" type="submit" disabled={cutoutStatus === "processing"}>{isEdit ? "保存" : "上架"} <Check size={17} /></button>
        </form>
        {pickingFriends && (
          <div className="friend-picker" role="dialog" aria-modal="true" aria-label="加入好友">
            <div className="friend-picker-head">
              <button type="button" className="icon-button" onClick={() => setPickingFriends(false)} aria-label="返回"><ArrowLeft size={20} /></button>
              <button type="button" className="icon-button" onClick={confirmFriendPicker} aria-label="确认"><Check size={20} /></button>
            </div>
            <div className="picker-list">
              {pickerFriends.map((person) => {
                const selected = draftPeople.includes(person.name);
                return (
                  <button type="button" className={`picker-friend-row${selected ? " is-selected" : ""}`} key={person.id} onClick={() => toggleDraftFriend(person.name)} aria-pressed={selected}>
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
