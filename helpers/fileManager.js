import { writeFile, readFile } from 'fs/promises';

const recordsPath = `./storage/records.json`;

async function readRecords() {
    try { 
        const data = await readFile(recordsPath, { encoding: 'utf8' });
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading records: ${error.message}`);

        const initialRecords = {
            day: { username: "", XP: 0 },
            week: { username: "", XP: 0 },
            month: { username: "", XP: 0 }
        };

        await writeRecords(initialRecords);
        return initialRecords;
    }
}

async function writeRecords(records) {
    try {
        await writeFile(recordsPath, JSON.stringify(records, null, 4), { encoding: 'utf8' });
    } catch (error) {
        console.error(`Error writing records: ${error.message}`);
    }
}

export { readRecords, writeRecords }
