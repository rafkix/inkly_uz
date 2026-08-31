"use client"

import { parseTeletypeToHtml } from "@/lib/utils/teletype-parser"

interface ArticlePreviewProps {
  title: string
  excerpt: string
  content: string
  cover: string
}

export function ArticlePreview({
  title,
  excerpt,
  content,
  cover,
}: ArticlePreviewProps) {
  const sanitizedContent = parseTeletypeToHtml(content)

  return (
    <>
      <article className="article-preview-root">

        {/* Cover */}
        {cover && (
          <div className="article-preview-cover-wrap">
            <img
              src={cover}
              alt=""
              className="article-preview-cover"
            />
          </div>
        )}

        {/* Title */}
        <h1 className="article-preview-title">
          {title || (
            <span className="article-preview-placeholder">
              Sarlavha yozing...
            </span>
          )}
        </h1>

        {/* Excerpt */}
        {excerpt && (
          <p className="article-preview-excerpt">{excerpt}</p>
        )}

        {/* Divider */}
        {(title || excerpt) && (
          <div className="article-preview-divider" />
        )}

        {/* Body */}
        <div
          className="article-preview-body"
          dangerouslySetInnerHTML={{
            __html:
              sanitizedContent ||
              '<p class="article-preview-empty">Maqola matni shu yerda ko\'rinadi...</p>',
          }}
        />
      </article>

      {/* ── Styles ── */}
      <style jsx global>{`

        /* ====================================================
           Root
        ==================================================== */

        .article-preview-root {
          max-width: 720px;
          margin: 0 auto;
          padding: 48px 0 80px;
        }

        /* ====================================================
           Cover
        ==================================================== */

        .article-preview-cover-wrap {
          margin-bottom: 40px;
          border-radius: 14px;
          overflow: hidden;
        }

        .article-preview-cover {
          display: block;
          width: 100%;
          aspect-ratio: 1.91 / 1;
          object-fit: cover;
        }

        /* ====================================================
           Title
        ==================================================== */

        .article-preview-title {
          font-family: Inter, "Helvetica Neue", Arial, sans-serif;
          font-size: clamp(28px, 5vw, 40px);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: var(--color-text-primary);
          margin: 0 0 14px;
        }

        .article-preview-placeholder {
          color: #C4C8CC;
        }

        /* ====================================================
           Excerpt
        ==================================================== */

        .article-preview-excerpt {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 17px;
          line-height: 1.65;
          color: var(--color-text-muted);
          margin: 0 0 28px;
        }

        /* ====================================================
           Divider
        ==================================================== */

        .article-preview-divider {
          height: 1px;
          background: var(--color-bg-muted);
          margin-bottom: 36px;
        }

        /* ====================================================
           Empty state
        ==================================================== */

        .article-preview-empty {
          color: #C4C8CC;
          font-style: italic;
        }

        /* ====================================================
           Body — mirrors inkly-editor-content exactly
        ==================================================== */

        .article-preview-body {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 18px;
          line-height: 1.85;
          color: var(--color-text-primary);
        }

        .article-preview-body p {
          margin-bottom: 1.2em;
          font-family: Georgia, "Times New Roman", serif;
        }

        .article-preview-body h1 {
          font-family: Inter, "Helvetica Neue", Arial, sans-serif;
          font-size: 2em;
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.025em;
          margin-top: 2.25em;
          margin-bottom: 0.65em;
          color: var(--color-text-primary);
        }

        .article-preview-body h2 {
          font-family: Inter, "Helvetica Neue", Arial, sans-serif;
          font-size: 1.55em;
          font-weight: 700;
          line-height: 1.25;
          letter-spacing: -0.02em;
          margin-top: 2em;
          margin-bottom: 0.6em;
          color: var(--color-text-primary);
        }

        .article-preview-body h3 {
          font-family: Inter, "Helvetica Neue", Arial, sans-serif;
          font-size: 1.2em;
          font-weight: 650;
          line-height: 1.35;
          letter-spacing: -0.01em;
          margin-top: 1.6em;
          margin-bottom: 0.5em;
          color: var(--color-text-primary);
        }

        /* Blockquote */

        .article-preview-body blockquote {
          margin: 2rem 0;
          padding: 1rem 1.5rem;
          border-left: 3px solid var(--color-inkly-orange);
          background: var(--color-inkly-orange-light);
          border-radius: 0 12px 12px 0;
          color: var(--color-text-secondary);
          font-style: italic;
          font-size: 1.05em;
          line-height: 1.75;
        }

        .article-preview-body blockquote p:last-child {
          margin-bottom: 0;
        }

        /* Lists */

        .article-preview-body ul,
        .article-preview-body ol {
          padding-left: 1.6rem;
          margin-bottom: 1.3em;
          font-family: Georgia, serif;
        }

        .article-preview-body li {
          margin-bottom: 0.4em;
          line-height: 1.7;
        }

        .article-preview-body ul {
          list-style-type: disc;
        }

        .article-preview-body ol {
          list-style-type: decimal;
        }

        /* Inline code */

        .article-preview-body code {
          background: var(--color-bg-muted);
          border-radius: 5px;
          padding: 0.15em 0.42em;
          font-size: 0.86em;
          font-family: "JetBrains Mono", "Fira Code", "Cascadia Code", monospace;
          color: #C0392B;
          letter-spacing: 0;
        }

        /* Code block */

        .article-preview-body pre {
          background: var(--color-text-primary);
          color: var(--color-bg-muted);
          border-radius: 12px;
          padding: 1.25rem 1.5rem;
          overflow-x: auto;
          margin: 2rem 0;
          font-size: 0.875em;
          line-height: 1.7;
          font-family: "JetBrains Mono", "Fira Code", monospace;
        }

        .article-preview-body pre code {
          background: transparent;
          color: inherit;
          padding: 0;
          border-radius: 0;
          font-size: inherit;
        }

        /* Images */

        .article-preview-body img {
          display: block;
          max-width: 100%;
          height: auto;
          margin: 2.25rem auto;
          border-radius: 12px;
        }

        /* Video embed */

        .article-preview-body [data-inkly-video],
        .article-preview-body .inkly-video-block {
          margin: 2.25rem 0;
          border-radius: 12px;
          overflow: hidden;
          background: #000;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
        }

        .article-preview-body .inkly-video-ratio {
          position: relative;
          width: 100%;
          padding-top: 56.25%;
        }

        .article-preview-body .inkly-video-ratio iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        /* Links */

        .article-preview-body a {
          color: var(--color-inkly-orange);
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-thickness: 1px;
        }

        /* Strong / em */

        .article-preview-body strong {
          color: var(--color-text-primary);
          font-weight: 700;
        }

        .article-preview-body em {
          font-style: italic;
          color: #2a2a2a;
        }

        /* Horizontal rule */

        .article-preview-body hr {
          border: 0;
          border-top: 1px solid var(--color-border-default);
          margin: 2.5rem 0;
        }

        /* ====================================================
           Mobile
        ==================================================== */

        @media (max-width: 640px) {
          .article-preview-root {
            padding: 32px 0 60px;
          }

          .article-preview-body {
            font-size: 17px;
          }

          .article-preview-body h1 {
            font-size: 1.75em;
          }

          .article-preview-body h2 {
            font-size: 1.4em;
          }

          .article-preview-body h3 {
            font-size: 1.15em;
          }
        }
      `}</style>
    </>
  )
}