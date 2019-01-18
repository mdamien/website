const BLOCKS = ['\u00A0', '\u2591', '\u2592', '\u2593', '\u2588'].reverse();
const CARDINALITY = BLOCKS.length;
const NUM_RATIO = 756 / CARDINALITY;
const ASCII_WIDTH = 9;
const ASCII_HEIGHT = 16;

function readImageFileAsDataUrl(file, callback) {
  const reader = new FileReader();

  reader.onloadend = () => {
    callback(reader.result);
  };

  reader.readAsDataURL(file);
}

function dataUrlToScaledCanvas(url, rows, callback) {
  const image = new Image();

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  image.onload = () => {
    const ratio = image.width / image.height;

    canvas.width = rows;
    canvas.height = rows * ASCII_WIDTH / ratio / ASCII_HEIGHT;

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    callback(canvas);
  };

  image.src = url;
}

function canvasToPixels(canvas) {
  const context = canvas.getContext('2d');

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  return imageData.data;
}

function canvasToBlocks(canvas, options) {
  const {
    gamma,
  } = options;

  const pixels = canvasToPixels(canvas);

  const blocks = new Uint8Array(pixels.length / 4);

  for (let px = 0, b = 0; px < pixels.length; px += 4) {

    let block = Math.floor(
      (
        pixels[px] +
        pixels[px + 1] +
        pixels[px + 2] -
        gamma
      ) / NUM_RATIO
    ) - 1;

    if (block > CARDINALITY - 1)
      block = CARDINALITY - 1;
    else if (block < 0)
      block = 0;

    blocks[b] = block;

    b++;
  }

  return blocks;
}

function mapBlocksToCharacterMatrix(blocks, rows) {
  const matrix = new Array(blocks.length / rows);

  for (let c = 0, i = 0; c < blocks.length; c += rows) {
    matrix[i] = Array.from(blocks.slice(c, c + rows)).map(b => BLOCKS[b]);

    i++;
  }

  return matrix
}

// function compressBlocks(blocks) {
//   const compressed = new Uint8Array(blocks.length / 2);

//   for (let i = 0, j = 0; i < blocks.length; i += 2) {
//     compressed[j] = (blocks[i] << 3) | blocks[i + 1];

//     j++;
//   }

//   return compressed;
// }

function imageFileToBlocks(file, options, callback) {

  readImageFileAsDataUrl(file, url => {
    dataUrlToScaledCanvas(url, options.rows, canvas => {
      const blocks = canvasToBlocks(canvas, options);

      return callback(null, mapBlocksToCharacterMatrix(blocks, options.rows));
    });
  });
}

exports.imageFileToBlocks = imageFileToBlocks;
