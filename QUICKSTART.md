# ⚡ QUICKSTART — 15 Minutes to a Live Cloud Run URL

Follow this exactly. Tested path — should work every time.

---

## Step 1 — Get a Gemini API key (free, 2 minutes)

1. Go to **https://aistudio.google.com/apikey**
2. Sign in with Google
3. Click **"Create API key"** → pick or create a project → **Copy the key**

---

## Step 2 — Install gcloud CLI (if not already)

**macOS:**
```bash
brew install --cask google-cloud-sdk
```

**Windows:** https://cloud.google.com/sdk/docs/install

**Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

Then authenticate:
```bash
gcloud auth login
gcloud init         # pick your project
```

Create a project if you don't have one (replace with your own id):
```bash
gcloud projects create shopai-hack2skill-2026 --name "ShopAI"
gcloud config set project shopai-hack2skill-2026
gcloud billing projects link shopai-hack2skill-2026 --billing-account $(gcloud billing accounts list --format='value(name)' | head -1)
```

Enable the APIs we need:
```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

---

## Step 3 — Push this code to GitHub (3 minutes)

```bash
cd ~/Desktop/HACK2SKILL/shopai
git init
git add .
git commit -m "feat: ShopAI — agentic retail & e-commerce on Google Cloud"

# install gh CLI if missing: `brew install gh`  (or https://cli.github.com)
gh auth login
gh repo create shopai --public --source . --remote origin --push
```

Copy the GitHub URL it prints — that's the **"GitHub URL"** field in the submission form.

---

## Step 4 — Deploy to Cloud Run (5 minutes)

```bash
export GEMINI_KEY=PASTE_YOUR_KEY_HERE
export PROJECT_ID=$(gcloud config get-value project)
export REGION=asia-south1            # Mumbai — change if you prefer

gcloud run deploy shopai \
  --source . \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --port 8080 \
  --set-env-vars "GEMINI_API_KEY=$GEMINI_KEY,GEMINI_MODEL=gemini-2.5-flash,NODE_ENV=production"
```

Wait 2–3 minutes. At the end it will print:

```
Service URL: https://shopai-xxxxx-uc.a.run.app
```

Copy that URL — that's the **"Deployed Link"** field in the submission form.

---

## Step 5 — Fill the submission form

Paste:

| Field | Value |
|---|---|
| **Challenges** | Retail & E-commerce App |
| **GitHub URL** | `https://github.com/<you>/shopai` |
| **Deployed Link** | `https://shopai-xxxxx-uc.a.run.app` |
| **Describe the updates…** | Paste the block from `SUBMISSION.md` |

Click **Submit**. 🎉

---

## If something goes wrong

**"Gemini returns 401/403":** Your key is wrong — re-copy from https://aistudio.google.com/apikey and run `gcloud run services update shopai --region $REGION --update-env-vars GEMINI_API_KEY=NEW_KEY`.

**"Cloud Run build fails":** Check you enabled the APIs in Step 2 and that billing is linked to your project. Re-run the `gcloud run deploy` command.

**"gh repo create fails":** Ensure `gh auth login` finished. Alternatively create a repo in the GitHub web UI and run:
```bash
git remote add origin https://github.com/<you>/shopai.git
git push -u origin main
```

**"Cold start is slow":** Normal for free tier — the first request after idle takes ~3s. Demo by clicking "AI Concierge" first to warm it up.
