# learning-notes
My personal repository consisting of weekly updated notes of my self-development in Cloud and Cybersecurity

## 🇵🇱 Polski przewodnik konfiguracji
**[KONFIGURACJA.md](KONFIGURACJA.md)** - Kompletny przewodnik konfiguracji w języku polskim

## 🇬🇧 English Configuration Guide
Continue reading below for English setup instructions

## Features

- **Automated Sync**: Daily synchronization from Notion database at 8:00 UTC
- **Webhook Support**: Real-time sync when Notion content changes (see [WEBHOOK_SETUP.md](WEBHOOK_SETUP.md))
- **Manual Trigger**: Can be triggered manually via GitHub Actions

## How it works

1. Notes are maintained in a Notion database
2. GitHub Actions workflow runs daily or when triggered
3. Notion pages are converted to Markdown files and stored in the `notes/` directory
4. Optional webhook endpoint allows real-time syncing

## Setup

### Environment Variables
Set these in GitHub Secrets:
- `NOTION_TOKEN`: Your Notion integration token
- `NOTION_DATABASE_ID`: The ID of your Notion database

### Webhook (Optional)
For real-time syncing, see [WEBHOOK_SETUP.md](WEBHOOK_SETUP.md) for detailed setup instructions.
