"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, Share2, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { BLOG_POSTS } from "@/data/blogsData";

export default function BlogsPage() {
  const [selectedSlug, setSelectedSlug] = useState<string>(BLOG_POSTS[0].slug);
  const [activeTag, setActiveTag] = useState<string>("All");
  const [copied, setCopied] = useState(false);

  // Read URL hash on mount if present (e.g. /blogs#cooperating-with-sned-students)
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.replace("#", "");
      const found = BLOG_POSTS.find((p) => p.slug === hash);
      if (found) setSelectedSlug(found.slug);
    }
  }, []);

  const tags = ["All", ...Array.from(new Set(BLOG_POSTS.map((b) => b.tag)))];

  const filteredPosts =
    activeTag === "All" ? BLOG_POSTS : BLOG_POSTS.filter((p) => p.tag === activeTag);

  const activePost = BLOG_POSTS.find((p) => p.slug === selectedSlug) ?? filteredPosts[0];

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-800 selection:bg-pink-100 selection:text-pink-900 pb-24">
      {/* Subtle Dot Grid Paper Canvas */}
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Top macOS-style Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 h-14">
          <div className="flex items-center gap-3">
            {/* Traffic Lights */}
            <div className="hidden sm:flex items-center gap-1.5" aria-hidden>
              <span className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-black/10" />
              <span className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-black/10" />
            </div>
            <span className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <BookOpen className="h-4 w-4 text-pink-500" />
              <span>Danah OS · Field Notes &amp; Stories</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-950"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Portfolio</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Editorial Container */}
      <main className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-8 sm:pt-12">
        {/* Editorial Heading */}
        <div className="pb-8 border-b border-slate-200/80">
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700 mb-3">
            <Sparkles className="h-3 w-3" />
            <span>Field Notes &amp; Experiences</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-mono font-bold tracking-tight text-slate-900">
            Stories from the field.
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed">
            Straightforward notes from building accessibility tools, testing with SNED learners, and our journey creating an assistive learning platform from scratch.
          </p>

          {/* Tag Filter Pills */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTag(t)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  activeTag === t
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Editorial Layout (Articles Index on Left, Active Story Reader on Right) */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: List of Blog Articles (Google News Style Cards) */}
          <section className="space-y-4 lg:col-span-5">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
              Articles ({filteredPosts.length})
            </div>

            <div className="space-y-3">
              {filteredPosts.map((post) => {
                const isSelected = post.slug === activePost?.slug;
                return (
                  <article
                    key={post.id}
                    onClick={() => {
                      setSelectedSlug(post.slug);
                      if (typeof window !== "undefined") {
                        window.history.replaceState(null, "", `#${post.slug}`);
                      }
                    }}
                    className={`cursor-pointer rounded-2xl border p-4 sm:p-5 transition-all text-left ${
                      isSelected
                        ? "border-pink-300 bg-white shadow-md ring-2 ring-pink-400/20"
                        : "border-slate-200 bg-white/70 hover:bg-white hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 mb-1.5">
                          <span className="font-semibold text-pink-600">{post.tag}</span>
                          <span>·</span>
                          <span>{post.date}</span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {post.summary}
                        </p>
                      </div>

                      {/* Google News Style Thumbnail */}
                      <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 shadow-2xs">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </span>
                      <span className="text-pink-600 font-semibold inline-flex items-center gap-0.5">
                        Read Story <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Right Column: Full Story Reading View */}
          <section className="lg:col-span-7">
            {activePost ? (
              <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
                {/* Featured Hero Banner Image */}
                <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] rounded-2xl overflow-hidden mb-6 border border-slate-200/80 shadow-2xs bg-slate-100">
                  <Image
                    src={activePost.image}
                    alt={activePost.title}
                    fill
                    priority
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="object-cover"
                  />
                </div>

                {/* Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-5 border-b border-slate-100 text-xs font-mono text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-pink-50 px-2 py-0.5 text-pink-700 font-semibold border border-pink-100">
                      {activePost.tag}
                    </span>
                    <span>{activePost.date}</span>
                    <span>·</span>
                    <span>{activePost.readTime}</span>
                  </div>

                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-800 transition"
                    title="Copy link"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>{copied ? "Link Copied!" : "Share"}</span>
                  </button>
                </div>

                {/* Article Header */}
                <div className="py-5 border-b border-slate-100">
                  <h2 className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-slate-900 leading-snug">
                    {activePost.title}
                  </h2>
                  <p className="mt-2 text-sm sm:text-base font-medium text-slate-500 leading-relaxed">
                    {activePost.subtitle}
                  </p>
                </div>

                {/* Article Body */}
                <div className="pt-6 space-y-4 text-[14.5px] sm:text-[15.5px] leading-relaxed text-slate-700">
                  {activePost.content.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                {/* Takeaways Card */}
                {activePost.takeaways && activePost.takeaways.length > 0 && (
                  <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 sm:p-6 space-y-3">
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-pink-500" />
                      <span>Key Takeaways &amp; Reflections</span>
                    </div>
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                      {activePost.takeaways.map((takeaway, tidx) => (
                        <li key={tidx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Author Footer */}
                <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400">
                  <div>Written by Mica Danah Paris</div>
                  <Link href="/" className="text-pink-600 hover:underline font-semibold">
                    Return to Danah OS →
                  </Link>
                </div>
              </article>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
}
