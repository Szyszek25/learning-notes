const { Client } = require('@notionhq/client');
const { NotionToMarkdown } = require('notion-to-md');
const fs = require('fs');
const path = require('path');

// Inicjalizacja klientów
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

async function syncNotes() {
  try {
    console.log('Starting Notion sync...');
    
    // Pobierz strony z bazy danych Notion
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
    });

    console.log(`Found ${response.results.length} pages`);

    for (const page of response.results) {
      try {
        // Konwertuj stronę na Markdown
        const mdblocks = await n2m.pageToMarkdown(page.id);
        const mdString = n2m.toMarkdownString(mdblocks);
        
        // Utwórz nazwę pliku
        const title = page.properties.Name?.title[0]?.plain_text || 
                     page.properties.Title?.title[0]?.plain_text || 
                     'Untitled';
        const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
        
        // Utwórz folder notes jeśli nie istnieje
        const notesDir = 'notes';
        if (!fs.existsSync(notesDir)) {
          fs.mkdirSync(notesDir, { recursive: true });
        }
        
        // Zapisz plik
        const filePath = path.join(notesDir, fileName);
        fs.writeFileSync(filePath, mdString.parent);
        
        console.log(`Synchronized: ${fileName}`);
      } catch (pageError) {
        console.error(`Error processing page: ${pageError.message}`);
      }
    }
    
    console.log('Notion sync completed successfully!');
  } catch (error) {
    console.error('Error syncing notes:', error);
    process.exit(1);
  }
}

syncNotes();