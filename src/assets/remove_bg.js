const Jimp = require('jimp');
const path = require('path');

async function removeWhiteBg(inputPath, outputPath, tolerance = 240) {
  try {
    const image = await Jimp.read(inputPath);
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // If the pixel is very close to white, make it transparent
      if (red >= tolerance && green >= tolerance && blue >= tolerance) {
        this.bitmap.data[idx + 3] = 0; // Alpha channel to 0
      }
    });
    
    await image.writeAsync(outputPath);
    console.log(`Successfully processed ${inputPath}`);
  } catch (err) {
    console.error(`Error processing ${inputPath}:`, err);
  }
}

async function run() {
  console.log("Starting background removal...");
  await removeWhiteBg(path.join(__dirname, 'delivery-van.jpg'), path.join(__dirname, 'delivery-van-transparent.png'));
  await removeWhiteBg(path.join(__dirname, 'logo.jpg'), path.join(__dirname, 'logo-transparent.png'));
  console.log("Finished background removal.");
}

run();
