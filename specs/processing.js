const BLOCKS = ['\u00A0', '\u2591', '\u2592', '\u2593', '\u2588'].reverse();
const CARDINALITY = BLOCKS.length;
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
}

function canvasToPixels(canvas) {
  const context = canvas.getContext('2d');

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  return imageData.data;
}

function canvasToBlocks(canvas, options) {
  const {
    gamma,
    rows
  } = options;

  const ratio = 765 / CARDINALITY;

  const pixels = canvasToPixels(canvas);

  console.log(pixels);
};



// 	  pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
// 	  mono = [];
// 	  finalProduct.style.fontSize = factor + "vw";
// 	  pixelCount = 0;
// 	  for(var y = 0; y < ascii.height; y++) {
// 	    mono[y] = [];
// 	    for(var x = 0; x < ascii.width*4; x += 4) {
// 	      mono[y].push(convert2Blocks(pixels, pixelCount, gamma));
// 	      pixelCount += 4;
// 	    }
// 	    mono[y] = mono[y].join("");
// 	    newLine = document.createElement("pre");
// 	    newLine.innerHTML = mono[y];
// 	   finalProduct.appendChild(newLine);
// 	  }


// 	function convert2Blocks(pixels, px, gamma, dbmode) {
// 	  if(pixels[px+3] == 0) {
// 	    return blocks[blocks.length-1];
// 	  }
// 	  block = Math.floor((pixels[px] + pixels[px + 1] + pixels[px + 2] -gamma)/numRatio)-1;
// 	  if(block > numOBT-1) {block = numOBT-1}
// 	  if(block < 0) {block = 0}
// 	  return dbmode ? block : blocks[block];
// 	}
// 	function main(source) {
// 	  factor = document.getElementById("zoom").value;
// 	  ascii.width = document.getElementById("rows").value;
// 	  ascii.height = Math.round(ascii.width*ascii.charWidth/ratio/ascii.charHeight);

// 	  canvas.width = ascii.width;
// 	  canvas.height = ascii.height;
// 	  ctx.drawImage(source, 0, 0, ascii.width, ascii.height);
// 	  if(typeof finalProduct == "object") {
// 	    document.body.removeChild(finalProduct);
// 	  }
// 	  finalProduct = document.createElement("div");
// 	  finalProduct.id = "image";
// 	  document.body.appendChild(finalProduct);
// 	  gamma = document.getElementById("gamma").value;
// 	  pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
// 	  mono = [];
// 	  finalProduct.style.fontSize = factor + "vw";
// 	  pixelCount = 0;
// 	  for(var y = 0; y < ascii.height; y++) {
// 	    mono[y] = [];
// 	    for(var x = 0; x < ascii.width*4; x += 4) {
// 	      mono[y].push(convert2Blocks(pixels, pixelCount, gamma));
// 	      pixelCount += 4;
// 	    }
// 	    mono[y] = mono[y].join("");
// 	    newLine = document.createElement("pre");
// 	    newLine.innerHTML = mono[y];
// 	   finalProduct.appendChild(newLine);
// 	  }






// 	numOBT = blocks.length;
// 	numRatio = 765/numOBT;
// 	function convert2Blocks(pixels, px, gamma, dbmode) {
// 	  if(pixels[px+3] == 0) {
// 	    return blocks[blocks.length-1];
// 	  }
// 	  block = Math.floor((pixels[px] + pixels[px + 1] + pixels[px + 2] -gamma)/numRatio)-1;
// 	  if(block > numOBT-1) {block = numOBT-1}
// 	  if(block < 0) {block = 0}
// 	  return dbmode ? block : blocks[block];
// 	}

// <!DOCTYPE html>
// <html xmlns="http://www.w3.org/1999/xhtml" lang="fr">

// <head>
//     <meta http-equiv="content-type" content="text/html; charset=UTF-8">
// 	<meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">

//     <title>Medialab - Proto</title>
//     <!-- styles -->
//     <style type="text/css"></style>
//     <link rel="stylesheet" href="assets/fonts/stylesheet.css">
//     <link rel='stylesheet' type='text/css' href='assets/css-compiled/theme.css'>

//     <!-- scripts -->
//     <style type="text/css">
// 		body {
// 		  font-family: monospace;
// 		  font-weight: "bold";
// 		  background-color: white;
// 		  color: black;
// 		  margin: 0;
// 		  padding: 0;
// 		  text-align: center;
// 		  word-break: keep-all;
// 		}
// 		#controls {
// 		  text-align: left;
// 		  text-overflow: hidden;
// 		  overflow: hidden;
// 		  float: left;
// 		  width: 150px;
// 		  position: fixed;
// 		  display: block;
// 		  background-color: white;
// 		}
// 		#image {
// 		  margin-left: 155px;
// 		  word-break: keep-all;
// 		  white-space:nowrap;
// 		  font-size: 8px;
// 		}
// 		#imageUpload {
// 		  overflow: hidden;
// 		  text-overflow: hidden;
// 		}
// 		#url {
// 		  margin-left: 155px;
// 		  word-break: break-all;
// 		}
// 		pre {
// 		  margin: 0;
// 		  padding: 0;
// 		}
//     </style>

// </head>
// <body>
// 	<div id="controls">
// 		  <input type="file" id="imageUpload"></input></br>
// 		Blocks: <input id="blocks" type="checkbox" onclick="swapSets(this.checked)"></input></br>
// 		  IBM Mode:<input id="ibm" onclick="ibm(this.checked)" type="checkbox"></input></br>
// 		Gamma</br><input id="gamma" oninput="main(image)" type="range" min="-255" max="255" step="1" value="0"></br>
// 		  </input>
// 		Brightness</br><input id="bright" oninput="bright(this.value)" type="range" min="100" max="900" step="100"></input></br>
// 		Rows</br><input id="rows" oninput="main(image)" type="range" min="25" max="600" step="1" value="80"></input></br>
// 		Zoom</br><input id="zoom" oninput="main(image)" type="range" value="0.5" min="0.1" max="5" step="0.1"></input></br>
// 		<p>3D Controls:</p>
// 		Depth: <input id="focus" type="range" value="0" min="0" step="0.025" max="2.5" oninput="s=this.value;threeD()"></input>
// 		<button type="button" onclick="getImageUrl()">Export URL</button>
// 	</div>
// 	<div id="image">

// 	</div>
// 	<p id="url" onclick="getImageUrl">
// 	</p>



// </body>

// <script type="text/javascript">
// 	document.getElementById('imageUpload').addEventListener('change', readURL, true);
// 	var ibmMode = false;
// 	//var complexBlocks = ["$", "@", "B", "%", "8", "&amp;", "W", "M", "#", "*", "o", "a", "h", "k", "b", "d", "p", "q", "w", "m", "Z", "O", "0", "Q", "L", "C", "J", "U", "Y", "X", "z", "c", "v", "u", "n", "x", "r", "j", "f", "t", "/", "\\", "|", "(", ")", "1", "{", "}", "[", "]", "?", "&ndash;", "_", "+", "&tilde;", "&lt;", "&gt;", "i", "!", "l", "I", ";", ":", ",", "&quot;", "&circ;", "`", "&apos;", ".", "&nbsp;"];
// 	var complexBlocks = ["J", "O", "S", "I", "A", "N", "N", "E", ".", " "];
// 	var simpleBlocks = ["&nbsp;", "\u2591", "\u2592", "\u2593", "\u2588"].reverse()
// 	var blocks = complexBlocks;
// 	var ascii = new Object();
// 	ascii.charWidth = 9;   // Width/height of the blocks
// 	ascii.charHeight = 16;
// 	var canvas = document.createElement("canvas");
// 	var ctx = canvas.getContext('2d');
// 	var image = new Image();
// 	var mono;
// 	image.onload = function() {
// 	  ratio = image.width/image.height;
// 	  ascii.width = document.getElementById("rows").value;
// 	  ascii.height = ascii.width*ascii.charWidth/ratio/ascii.charHeight;

// 	  canvas.width = ascii.width;
// 	  canvas.height = ascii.height;

// 	  main(image);
// 	}
// 	var video = document.createElement("video");
// 	video.onloadstart = function() {
// 	  video.autoplay = true;
// 	  video.loop = true;
// 	}
// 	video.addEventListener( "loadedmetadata", function (e) {
// 	    this.width = document.getElementById("rows").value;
// 	    this.height = (this.videoHeight/this.videoWidth)*this.width;
// 	    playVideo();
// 	}, false );
// 	function readURL() {
// 	  var file = document.getElementById("imageUpload").files[0];
// 	  console.log(file.type);
// 	  var reader = new FileReader();
// 	  reader.onloadend = function() {
// 	    if(file.type.slice(0, 5) == "image") {
// 	      image.src = reader.result;
// 	    }
// 	    else if(file.type.slice(0, 5) == "video") {
// 	      video.src = reader.result;
// 	    }
// 	  }
// 	  if (file) {
// 	    reader.readAsDataURL(file);
// 	  }
// 	  else {}
// 	}
// 	numOBT = blocks.length;
// 	numRatio = 765/numOBT;
// 	function convert2Blocks(pixels, px, gamma, dbmode) {
// 	  if(pixels[px+3] == 0) {
// 	    return blocks[blocks.length-1];
// 	  }
// 	  block = Math.floor((pixels[px] + pixels[px + 1] + pixels[px + 2] -gamma)/numRatio)-1;
// 	  if(block > numOBT-1) {block = numOBT-1}
// 	  if(block < 0) {block = 0}
// 	  return dbmode ? block : blocks[block];
// 	}
// 	function main(source) {
// 	  factor = document.getElementById("zoom").value;
// 	  ascii.width = document.getElementById("rows").value;
// 	  ascii.height = Math.round(ascii.width*ascii.charWidth/ratio/ascii.charHeight);

// 	  canvas.width = ascii.width;
// 	  canvas.height = ascii.height;
// 	  ctx.drawImage(source, 0, 0, ascii.width, ascii.height);
// 	  if(typeof finalProduct == "object") {
// 	    document.body.removeChild(finalProduct);
// 	  }
// 	  finalProduct = document.createElement("div");
// 	  finalProduct.id = "image";
// 	  document.body.appendChild(finalProduct);
// 	  gamma = document.getElementById("gamma").value;
// 	  pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
// 	  mono = [];
// 	  finalProduct.style.fontSize = factor + "vw";
// 	  pixelCount = 0;
// 	  for(var y = 0; y < ascii.height; y++) {
// 	    mono[y] = [];
// 	    for(var x = 0; x < ascii.width*4; x += 4) {
// 	      mono[y].push(convert2Blocks(pixels, pixelCount, gamma));
// 	      pixelCount += 4;
// 	    }
// 	    mono[y] = mono[y].join("");
// 	    newLine = document.createElement("pre");
// 	    newLine.innerHTML = mono[y];
// 	   finalProduct.appendChild(newLine);
// 	  }

// 	}
// 	function ibm(toggle) {
// 	  blocks.reverse();
// 	  if(toggle) {
// 	    document.body.style.backgroundColor = "black";
// 	    document.body.style.color = "green";
// 	  }
// 	  else {
// 	    document.body.style.backgroundColor = "white";
// 	    document.body.style.color = "black";
// 	  }
// 	  main(image);
// 	}
// 	function playVideo() {
// 	  ratio = video.width/video.height;
// 	  ascii.width = document.getElementById("rows").value;
// 	  ascii.height = ascii.width*ascii.charWidth/ratio/ascii.charHeight;

// 	  canvas.width = ascii.width;
// 	  canvas.height = ascii.height;

// 	  ctx.drawImage(video, 0, 0, ascii.width, ascii.height);
// 	  main(video);
// 	  window.requestAnimationFrame(playVideo);
// 	}
// 	function bright(b) {
// 	  document.body.style.fontWeight = b;
// 	}
// 	function swapSets(s) {
// 	  if(s) {
// 	    blocks = simpleBlocks;
// 	  }
// 	  else {
// 	    blocks = complexBlocks;
// 	  }
// 	  numOBT = blocks.length;
// 	  numRatio = 765/numOBT;
// 	  main(image);
// 	}

// 	var s = 0;
// 	function threeD() {
// 	  if(s == 0) {
// 	    document.body.style.textShadow = "none";
// 	    return;
// 	  }
// 	  document.body.style.textShadow = `-${s}em -${s}em red, ${s}em ${s}em blue`;
// 	}
// </script>
// </html>
