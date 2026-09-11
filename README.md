# Polished Nail Bar DTLA — the editable website

Twelve pages, an admin panel you log into from your phone, and an AI chat
assistant that reads the same information you edit. No monthly fee.

---

## Part 1 — Put the site online (about 20 minutes, once)

### 1. Put the folder on GitHub

1. Go to **github.com** and sign in (the `polishedmanager25@gmail.com` account).
2. Click **+** at the top right → **New repository**.
3. Name it `polished-nail-bar`. Leave it **Private**. Click **Create**.
4. On the next screen click **uploading an existing file**.
5. Drag *everything in this folder* into the browser. Not the folder itself —
   open it and drag what's inside.
6. Scroll down, click **Commit changes**.

### 2. Connect Netlify

1. Go to **netlify.com**, sign in, choose **Add new site → Import an existing project**.
2. Choose **GitHub**, authorize it, pick `polished-nail-bar`.
3. Netlify reads the settings from `netlify.toml`. Leave everything as it is.
4. Click **Deploy**.

Two minutes later the site is live on a temporary address like
`quiet-fox-12345.netlify.app`. Open it and check it looks right.

### 3. Point your domain at it

1. Buy **polishednailbardtla.com** (Namecheap, Porkbun, Cloudflare — around $12/year).
2. In Netlify: **Domain management → Add a domain** → type `polishednailbardtla.com`.
3. Netlify shows you what to change at your registrar. Follow it exactly.
4. Wait — anywhere from ten minutes to a few hours. HTTPS turns itself on.

> **If you use Cloudflare for DNS:** set the record to **DNS only** (grey cloud,
> not orange). Cloudflare's proxy blocks the admin login. This is the single
> most common thing that breaks this setup.

### 4. Switch on the admin panel

1. Open `src/admin/config.yml` in GitHub and click the pencil to edit.
2. On line 8, change `YOUR-GITHUB-USERNAME` to your actual GitHub username.
3. Commit.
4. Go to **polishednailbardtla.com/admin**, click **Sign in with GitHub**, approve.

You're in. Bookmark that page. **Add it to your phone's home screen** and it
behaves like an app.

---

## Part 2 — The chat assistant (about 15 minutes, once)

Skip this if you want. The site works without it. Come back when ready.

### 1. Get an API key

1. Go to **console.anthropic.com**, sign up.
2. **API Keys → Create key**. Copy it. You only see it once.
3. Add about $10 of credit. That lasts a long time at salon volume.

### 2. Deploy the Worker

1. Go to **dash.cloudflare.com** → **Workers & Pages** → **Create → Worker**.
2. Name it `polished-chat`. Click **Deploy** (the placeholder code is fine).
3. Click **Edit code**. Delete what's there. Paste everything from
   `worker/worker.js`. Click **Deploy**.
4. Go to **Settings → Variables** and add two:

   | Name | Value | Type |
   |---|---|---|
   | `ANTHROPIC_API_KEY` | your key from step 1 | **Encrypt** |
   | `ALLOWED_ORIGIN` | `https://polishednailbardtla.com` | Text |

5. Copy the Worker's address at the top — it looks like
   `https://polished-chat.something.workers.dev`.

### 3. Tell the website where the Worker is

1. In GitHub, open `src/assets/chat.js`.
2. Line 8: replace the placeholder address with your Worker's address.
3. Commit. The site rebuilds itself. The chat bubble goes live.

**The key never touches the website.** It lives in Cloudflare. Nobody visiting
your site can see it or use it.

---

## Part 3 — Living with it

### Changing anything

Go to **polishednailbardtla.com/admin**, edit, hit **Save**. About a minute later it's
live. That's the whole process. It works from your phone.

What you can change:

| Section | What's in it |
|---|---|
| **Promotions** | The Latest cards. Untick "Show on site" to hide one without deleting it. |
| **Services & Pricing** | Every price on the site |
| **Journal** | Blog posts. Click **New** to write one. |
| **Salon details** | Phone, hours, ratings, the gold scrolling bar |
| **Homepage text** | Headline, service tiles, the four perks |
| **FAQ / Policies / Reviews** | Questions, clauses, quotes |
| **Chat assistant** | Technicians, tone, house rules, extra knowledge |

### Photos and video

Two ways:

- **In the admin panel** — any photo field lets you upload from your phone.
- **On GitHub** — open the `src/images` folder, drag files in with the
  filenames from `src/images/README.txt`.

The hero video goes in `src/video` as `hero.mp4`.

### Why the assistant is never "retrained"

Every time someone asks it a question, it is handed your salon information
fresh and answers from what it just read. Nothing is stored inside it.

So when you change a price in the admin panel:

1. You save.
2. The site rebuilds — about a minute.
3. That same rebuild rewrites `knowledge.txt`, which is what the assistant reads.
4. The next question gets the new price.

There is no second step and no separate portal. **The admin panel is the
training portal.**

The one thing to watch: it only knows what's in there. Launch a promo without
adding it and the assistant won't know — it's built to say so and hand off to
your text line rather than guess. A bot that invents a price is worse than none.

### If something breaks

Netlify keeps every version. **Deploys → find a working one → Publish deploy.**
Back to normal in seconds. You cannot permanently break this by editing.

---

## Running costs

| | |
|---|---|
| Domain | ~$12/year |
| Netlify | Free |
| GitHub | Free |
| Admin panel | Free |
| Cloudflare Worker | Free |
| Chat assistant | A few dollars a month |

---

## Still outstanding

- **Photos.** 21 files fill all 81 slots. See `src/images/README.txt` and the
  shot list PDF.
- **Storefront shot** for `visit.jpg` — Contact and About point there too.
- **Pedicure photos.** None yet, so the fourth homepage tile is Acrylic rather
  than Luxury Pedicure.
- **Technicians.** I seeded four names from your reviews. Correct them in
  **Chat assistant → Technicians** before switching the bot on.
- **Review counts.** Ratings are Google 4.8 and Yelp 4.5. The counts still say
  560+ and 900+.
