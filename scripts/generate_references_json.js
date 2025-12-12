import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = 'D:/delfin referencias';
const OUTPUT_FILE = path.join(process.cwd(), 'reference_library_dump.json');

console.log(`Scanning directory: ${SOURCE_DIR}`);

if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Directory not found: ${SOURCE_DIR}`);
    process.exit(1);
}

const getAllFiles = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFiles(filePath));
        } else {
            if (/\.(jpg|jpeg)$/i.test(file)) {
                results.push(filePath);
            }
        }
    });
    return results;
};

const jpgFiles = getAllFiles(SOURCE_DIR);

console.log(`Found ${jpgFiles.length} JPG files.`);

const references = [];

for (const filePath of jpgFiles) {
    try {
        const buffer = fs.readFileSync(filePath);
        const base64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;

        const fileName = path.basename(filePath);
        const reference = fileName.replace(/\.(jpg|jpeg)$/i, '');

        references.push({
            id: uuidv4(),
            reference,
            imageData: base64,
            fileName: fileName,
            uploadedAt: Date.now()
        });

        if (references.length % 50 === 0) {
            console.log(`Processed ${references.length} images...`);
        }
    } catch (err) {
        console.error(`Error processing file ${filePath}:`, err.message);
    }
}

console.log(`Writing ${references.length} references to ${OUTPUT_FILE}...`);
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(references, null, 2));
console.log('Done.');
