"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, Heart, MessageCircle, Pencil, Send } from "lucide-react";
import type { Story } from "@/lib/sample-shelf";

export type EventComment = {
  id: number;
  author: string;
  text: string;
};

export type EventSocial = {
  liked: boolean;
  likes: number;
  comments: EventComment[];
};

export const DEFAULT_EVENT_COMMENTS: EventComment[] = [
  { id: 1, author: "Mia", text: "我也记得。" },
  { id: 2, author: "Noah", text: "那晚很特别。" },
];

export function defaultEventSocial(): EventSocial {
  return { liked: false, likes: 12, comments: DEFAULT_EVENT_COMMENTS };
}

export default function EventDetail({
  story,
  objectImage,
  social,
  onBack,
  onToggleLike,
  onAddComment,
  onEdit,
}: {
  story: Story;
  objectImage?: string;
  social: EventSocial;
  onBack: () => void;
  onToggleLike: () => void;
  onAddComment: (text: string) => void;
  onEdit: () => void;
}) {
  const [draft, setDraft] = useState("");
  const cutout = objectImage || story.objectImage;

  const submitComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onAddComment(text);
    setDraft("");
  };

  return (
    <main className="reader-screen parchment-screen" data-event-detail="true" data-story-id={String(story.id)}>
      <header className="reader-header">
        <button className="icon-button" onClick={onBack} aria-label="返回"><ArrowLeft size={20} /></button>
        <button className="icon-button" onClick={onEdit} aria-label="编辑" data-event-edit="true"><Pencil size={18} /></button>
      </header>
      <article className="parchment-sheet" data-event-scroll="true">
        {cutout ? (
          <div className="object-display"><img src={cutout} alt="" /></div>
        ) : null}
        <div className="parchment-copy">
          <p className="eyebrow">{story.day} · {story.date} · {story.public ? "公开" : "私藏"}</p>
          <h1>{story.title}</h1>
          {story.people.length > 0 ? <p className="event-people">{story.people.join(" · ")}</p> : null}
          {story.excerpt && story.excerpt !== story.content.replace(/\s+/g, " ").slice(0, 96) ? (
            <p className="lead">{story.excerpt}</p>
          ) : null}
          <div className="reader-copy">
            {story.content.split("\n").map((line, index) => (line ? <p key={index}>{line}</p> : null))}
          </div>
          {story.storyImages.length > 0 && (
            <div className="story-photo-grid" aria-label="趣事配图">
              {story.storyImages.map((image, index) => (
                <img key={`${image}-${index}`} src={image} alt="" />
              ))}
            </div>
          )}
          <div className="event-social">
            <div className="comment-row">
              <button
                type="button"
                className={social.liked ? "is-liked" : ""}
                onClick={onToggleLike}
                aria-pressed={social.liked}
                aria-label={social.liked ? "取消喜欢" : "喜欢"}
              >
                <Heart size={18} fill={social.liked ? "currentColor" : "none"} aria-hidden="true" />
                {social.likes}
              </button>
              <span className="comment-count" aria-label={`评论 ${social.comments.length}`}>
                <MessageCircle size={17} aria-hidden="true" />
                {social.comments.length}
              </span>
              <form className="comment-input" onSubmit={submitComment}>
                <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="写评论" aria-label="写评论" />
                <button type="submit" aria-label="发送评论"><Send size={16} /></button>
              </form>
            </div>
            <div className="comments">
              {social.comments.map((comment) => (
                <p key={comment.id}><b>{comment.author}</b> {comment.text}</p>
              ))}
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
