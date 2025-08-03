# Webhook Setup Guide

This guide explains how to set up webhook functionality to automatically sync your Notion notes when changes occur.

## Overview

The webhook implementation allows real-time syncing of your Notion database to GitHub whenever content changes, instead of waiting for the daily scheduled sync.

## Components

1. **webhook.js** - HTTP server that receives webhook notifications
2. **Updated GitHub Actions workflow** - Now supports `repository_dispatch` events
3. **Existing sync-script.js** - Reused for the actual syncing logic

## Setup Instructions

### 1. Deploy Webhook Server

You can deploy the webhook server on any platform that supports Node.js. Here are some options:

#### Option A: Railway
1. Fork this repository
2. Connect to [Railway](https://railway.app)
3. Deploy from GitHub
4. Set environment variables (see below)

#### Option B: Heroku
1. Create a new Heroku app
2. Connect to this GitHub repository
3. Set environment variables (see below)
4. Deploy

#### Option C: Self-hosted
1. Clone this repository to your server
2. Run `npm install`
3. Set environment variables
4. Run `npm start`

### 2. Environment Variables

Set these environment variables in your deployment platform:

```
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_REPO=Szyszek25/learning-notes
WEBHOOK_SECRET=your_optional_webhook_secret
PORT=3000
```

**GitHub Token Requirements:**
- Go to GitHub Settings > Developer settings > Personal access tokens
- Create a token with `repo` scope
- Add it as `GITHUB_TOKEN` environment variable

### 3. Configure Notion Webhook

1. Go to your Notion integration settings
2. Add a webhook URL pointing to your deployed server:
   ```
   https://your-app-domain.com/webhook
   ```
3. If you set a `WEBHOOK_SECRET`, configure it in Notion as well
4. Subscribe to database events for your learning notes database

### 4. Test the Setup

1. Check if your webhook server is running:
   ```
   curl https://your-app-domain.com/health
   ```

2. Test the webhook endpoint:
   ```bash
   curl -X POST https://your-app-domain.com/webhook \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

3. Check GitHub Actions to see if the workflow was triggered

## How It Works

1. When you make changes in Notion, Notion sends a webhook to your deployed server
2. The webhook server receives the notification and triggers a GitHub Action via `repository_dispatch`
3. GitHub Actions runs the existing sync script to fetch updated content from Notion
4. The updated markdown files are committed to the repository

## Fallback

The daily scheduled sync at 8:00 UTC remains active as a fallback, ensuring your notes stay synchronized even if webhooks fail.

## Troubleshooting

- **Webhook not triggering**: Check your webhook URL and ensure the server is accessible
- **GitHub Action not running**: Verify your GitHub token has the correct permissions
- **Sync failing**: Check the original environment variables (`NOTION_TOKEN`, `NOTION_DATABASE_ID`) are still set in GitHub Secrets

## Security

- Use the `WEBHOOK_SECRET` environment variable to verify webhook authenticity
- Ensure your GitHub token has minimal required permissions
- Consider adding rate limiting for production use