# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The marketing site + blog for Fundertech, a data-intelligence consultancy for African finance (banks, insurers, ZSE-listed companies, MFIs/agri-lenders), plus a growing "Insights" article series that has expanded beyond finance into general applied-analytics writing (telecom/banking product design, aluminum fabrication operations, etc.).

Live at **https://fundertech.work** (and `www.fundertech.work`).

## Stack and commands

This is a **static site with one serverless function** — no framework, no build step, no package manager, no test suite.

- **Local preview**: `python3 -m http.server 8000` from the repo root, then open `http://localhost:8000/index.html`. This serves the static pages correctly but **cannot run `api/contact.js`** (that only executes on Vercel). To test the contact form end-to-end, deploy and hit the live `/api/contact` endpoint directly with `curl`, or use `vercel dev`.
- **Deploy**: `git push origin main` — the repo is connected to Vercel's GitHub App, so every push to `main` auto-deploys to production. Manual deploy (bypassing git) is `npx vercel --prod --yes` from the repo root.
- **No lint/test/build commands exist.** Don't add tooling (a bundler, a linter config, a package.json) unless there's an actual reason — the zero-dependency setup is intentional and keeps deploys instant.

## Architecture

**Pages** are independent static HTML files, each with their own `<head>`/nav/footer, all linking the same `styles.css` (extracted once from what used to be a large inline `<style>` block — keep it that way; don't reintroduce per-page inline styles for anything that isn't page-specific).

- `index.html` — homepage (hero, pipeline diagram, results/proof-points, services, who-we-serve, approach, contact form)
- `insights.html` — the article index; a hand-maintained list of `<a class="insight-row">` cards, newest first
- `*-*.html` at the root — individual Insights articles (see naming/voice convention below)
- `styles.css` — the entire design system (CSS variables for the black/white/mint JetBrains-Mono aesthetic, all component classes). Article-specific classes (`.article-*`) live at the bottom of this file.
- `api/contact.js` — a single Vercel serverless function (CommonJS, no dependencies) that receives the contact form POST and sends mail via Resend's REST API directly (`fetch`, no SDK). Reads `RESEND_API_KEY` and `NOTIFY_EMAIL` from environment.

**No JS framework, no client-side routing, no build artifacts.** The homepage's inline `<script>` blocks (scroll-triggered reveals, animated counters/charts, contact form submit handler) are vanilla JS and intentionally stay that way.

### The contact form path

`index.html` form → `fetch('/api/contact')` → `api/contact.js` → Resend REST API → email lands in the owner's inbox with `reply_to` set to the enquirer's address. The destination email is **never** present in any HTML/JS — it's the `NOTIFY_EMAIL` env var, set only in the Vercel dashboard (Production environment), not in this repo. Same for `RESEND_API_KEY` (a domain-scoped, **sending-only** key — not a full-access key). Don't put either in a committed file.

### Adding a new Insights article

This is the most common ongoing task in this repo. Each article is a **standalone HTML file** at the repo root (not nested in a subfolder), following the exact nav/footer/head boilerplate of an existing article (copy `queueing-theory-aluminum-fabrication.html` as a template — it's the most recent). Then:

1. Add a `<a class="insight-row">` card to the **top** of the list in `insights.html`.
2. Add a `<url>` entry to `sitemap.xml`.
3. Nav links across every page point `Insights` at `insights.html`, not at any individual article — don't change that.

**Voice/format convention** (established across all existing articles — match it, don't reinvent it per piece):
- Title pattern: "Reverse Engineering [X]"
- Opens with a short, punchy analogy-driven hook paragraph (`class="article-hook"`), not a throat-clearing intro
- Structure: Business Challenge → mechanism/how-it-actually-works (with a concrete, everyday analogy translating the technical concept) → the data a company already has (usually a bronze/silver/gold medallion-pipeline callback, tying back to the pipeline diagram on the homepage) → a worked example → practical "how to start" advice → a closing one-liner in the "every X has a story..." family, varied per piece
- One `.article-callout` pull-quote per piece
- **Ground technical claims honestly**: reuse Fundertech's own real, already-stated capabilities/numbers (172M rows, 15% uplift, 115K RFM-segmented customers, the concentration-risk engine, the churn/hazard model) as the "worked example" rather than inventing a specific named client result. When a topic is off-vertical (e.g., aluminum fabrication, telecom-turned-banking), the worked example is framed as general methodology, not a fabricated Fundertech case study.
- Tag (`article-eyebrow`) so far has used: Predictive Analytics, Executive Intelligence, Operations Analytics — reuse one of these or add a new short category, don't invent a long one.

## Infrastructure (not discoverable by reading the code)

- **GitHub**: `bongz007/fundertech` (public). Auto-deploy to Vercel is via the Vercel GitHub App, not a webhook you'll find in this repo.
- **Vercel**: project `fundertech` under team `bongz007s-projects`. No `vercel.json` — everything is zero-config.
- **DNS**: `fundertech.work` is on Cloudflare (registrar + DNS). `A @ → 76.76.21.21` and `CNAME www → cname.vercel-dns.com` point it at Vercel. Resend's DKIM/SPF records are also on this same Cloudflare zone (required for the contact form's outbound mail to land in inboxes instead of spam).
- **Email**: Resend, domain `fundertech.work` verified for sending. Production API key is scoped (sending-only, restricted to this domain) — if you ever need to manage the domain itself via the Resend API (not just send mail), that requires a separate full-access key created temporarily and deleted after, not the production key.
- **Known accepted risk**: git push auth for this repo (and the unrelated `savannah-paths` repo) currently uses a GitHub PAT embedded directly in the local `.git/config` remote URL, rather than a credential manager. It's local-only (not committed, not in shell history) — the owner has explicitly deferred rotating this to `gh auth login`.
