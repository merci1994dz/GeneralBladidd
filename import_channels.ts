import { db } from "./db";
import { channels } from "@shared/schema";
import fs from 'fs';

async function importChannels() {
  try {
    const data = JSON.parse(fs.readFileSync('/home/ubuntu/channels.json', 'utf8'));
    console.log(`Loaded ${data.length} channels from JSON`);

    // Clear existing channels first
    await db.delete(channels);
    console.log('Cleared existing channels');

    // Split into chunks of 100 to avoid memory/database limits
    const chunkSize = 100;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await db.insert(channels).values(chunk);
      console.log(`Imported channels ${i + 1} to ${Math.min(i + chunkSize, data.length)}`);
    }

    console.log('✅ Successfully imported all channels');
  } catch (error) {
    console.error('❌ Error importing channels:', error);
  }
}

importChannels();
