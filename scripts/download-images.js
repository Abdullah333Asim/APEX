import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const carsJsonPath = path.join(projectRoot, 'src', 'data', 'cars.json');
const publicCarsDir = path.join(projectRoot, 'public', 'cars');

// Ensure public/cars directory exists
if (!fs.existsSync(publicCarsDir)) {
  fs.mkdirSync(publicCarsDir, { recursive: true });
}

// Read cars.json
const rawData = fs.readFileSync(carsJsonPath, 'utf8');
const cars = JSON.parse(rawData);

console.log(`Starting image downloads for ${cars.length} cars...\n`);

const downloadImage = (url, filepath, maxRedirects = 5) => {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) {
      return reject(new Error('Too many redirects'));
    }

    const client = url.startsWith('https') ? https : http;

    const request = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        let redirectUrl = response.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const parsedUrl = new URL(url);
          redirectUrl = `${parsedUrl.protocol}//${parsedUrl.host}${redirectUrl}`;
        }
        return downloadImage(redirectUrl, filepath, maxRedirects - 1).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        return reject(new Error(`HTTP Status Code ${response.statusCode}`));
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close(() => resolve(true));
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    });

    request.on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });

    // 12 second timeout
    request.setTimeout(12000, () => {
      request.destroy();
      fs.unlink(filepath, () => {});
      reject(new Error('Request Timeout'));
    });
  });
};

async function processDownloads() {
  const failedList = [];
  let successCount = 0;

  for (let i = 0; i < cars.length; i++) {
    const car = cars[i];
    const imageFilename = `${car.id}.jpg`;
    const localFilePath = path.join(publicCarsDir, imageFilename);
    const relativeWebPath = `/cars/${imageFilename}`;

    // Skip if already local path or already exists
    if (car.image === relativeWebPath && fs.existsSync(localFilePath) && fs.statSync(localFilePath).size > 1000) {
      console.log(`[${i + 1}/${cars.length}] Already downloaded: ${car.brand} ${car.model}`);
      successCount++;
      continue;
    }

    try {
      console.log(`[${i + 1}/${cars.length}] Downloading: ${car.brand} ${car.model} (${car.id})...`);
      await downloadImage(car.image, localFilePath);

      // Verify non-empty file
      const stats = fs.statSync(localFilePath);
      if (stats.size < 500) {
        throw new Error('Downloaded file too small');
      }

      // Update image property in car object
      car.image = relativeWebPath;
      successCount++;
      console.log(` -> SUCCESS: ${car.brand} ${car.model}`);
    } catch (err) {
      console.error(` -> FAILED [${car.id}]: ${car.brand} ${car.model} - Error: ${err.message}`);
      failedList.push({
        id: car.id,
        brand: car.brand,
        model: car.model,
        url: car.image,
        error: err.message,
      });
    }

    // Small delay to be polite to servers
    await new Promise((res) => setTimeout(res, 150));
  }

  // Save updated cars.json
  fs.writeFileSync(carsJsonPath, JSON.stringify(cars, null, 2), 'utf8');

  console.log('\n========================================');
  console.log(`Download Process Finished!`);
  console.log(`Successfully processed: ${successCount} / ${cars.length}`);
  console.log(`Failed downloads: ${failedList.length}`);
  console.log('========================================\n');

  if (failedList.length > 0) {
    console.log('LIST OF FAILED CAR DOWNLOADS:');
    failedList.forEach((f, idx) => {
      console.log(`${idx + 1}. [${f.id}] ${f.brand} ${f.model} - ${f.error}`);
    });
  }
}

processDownloads();
