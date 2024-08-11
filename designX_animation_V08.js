let headers = [
  "ARCH",
  "CVEN",
  "COMP",
  "ABPL",
  "CVENGEOM",
  "GDES",
  "FINA",
  "LARC",
  "MCEN",
  "PROP",
  "GEOM",
  "PLAN",
  "INFO",
  ""
];

let displayHeaders = [
  "ARCHITECTURE",
  "CIVIL ENGINEERING SYSTEMS",
  "COMPUTING AND SOFTWARE SYSTEMS",
  "CONSTRUCTION",
  "DIGITAL INFRASTRUCTURE ENGINEERING SYSTEMS",
  "GRAPHIC DESIGN",
  "PERFORMANCE DESIGN",
  "LANDSCAPE ARCHITECTURE",
  "MECHANICAL ENGINEERING SYSTEMS",
  "PROPERTY",
  "SPATIAL SYSTEMS",
  "URBAN PLANNING",
  "USER EXPERIENCE DESIGN",
  "—"
];

let x = 0;
let y = 0;
const fontSize = 14;
const gridSpacing = 14; // Adjust value to make the grid tighter or looser
const noiseScale = 0.001;
// noiseScale affects the granularity of the noise pattern.
// Lower value (e.g., 0.0001): Very smooth transitions.
// Higher value (e.g., 0.001): More dynamic, less smooth transitions.
const timeSpeed = 0.005;
// timeSpeed affects the speed of the animation.
// Lower value (e.g., 0.01): Slow animation progression.
// Higher value (e.g., 0.1): Fast animation progression.
let lockedIndices = [];
let hoverIndex = -1;
const margin = 3;
const paddingVertical = 10;

let capturing = false;
let capturer;
let showHeaders = true;

let customFont;

function preload() {
  customFont = loadFont('TwoBar_Mono_064_Light.otf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  textFont(customFont);
  textSize(fontSize);
  colorMode(RGB, 255);

  if (typeof CCapture !== 'undefined') {
    capturer = new CCapture({
      format: 'png', 
      framerate: 30 
    });
  } else {
    console.error("CCapture is not defined. Please check if the library is correctly included.");
  }
}

function draw() {
  background(35, 31, 69); // background colour
  textAlign(CENTER, CENTER);
  textSize(fontSize);
  let t = frameCount * timeSpeed;

  for (let i = margin; i < width - margin; i += gridSpacing) {
    for (let j = margin; j < height - margin; j += gridSpacing) {
      const n = noise((i + x) * noiseScale, (j + y) * noiseScale, t);
      const idx = int(map(n, 0, 1, 0, headers.length * 5)) % headers.length;
      const chr = headers[idx].charAt(
        (i / fontSize + ((j / fontSize) % headers[idx].length)) %
          headers[idx].length
      );

      if (chr) {
        if (lockedIndices.length === 0) {
          fill(220, 74, 51); // text colour
        } else if (lockedIndices.includes(idx)) {
          if (lockedIndices[0] === idx) {
            fill(220, 74, 51); // text colour for first clicked header
          } else if (lockedIndices[1] === idx) {
            fill(64,  154, 214); // text colour for second clicked header
          }
        } else {
          fill(35, 31, 69); // same as background color to hide remaining characters
        }
        text(chr, i + fontSize / 2, j + fontSize / 2);
      }
    }
  }

  if (showHeaders) {
    let maxWidth = (width - 2 * margin) / headers.length;
    let dynamicFontSize = (maxWidth / 10) * 0.9;
    textSize(dynamicFontSize);

    let totalWidth = maxWidth * headers.length;
    let padding = (width - 2 * margin - totalWidth) / (headers.length - 1);

    for (let i = 0; i < headers.length; i++) {
      let xPos = margin + i * (maxWidth + padding);
      let words = displayHeaders[i].split(" ");
      let headerHeight = words.length * (dynamicFontSize + paddingVertical);

      // Check if mouse is over the entire header area
      let isHover =
        mouseX > xPos &&
        mouseX < xPos + maxWidth &&
        mouseY > margin &&
        mouseY < margin + headerHeight;

      if (isHover) {
        hoverIndex = i;
      }

      for (let j = 0; j < words.length; j++) {
        fill(233, 236, 239, 210); // light gray background with 90% opacity
        rect(
          xPos,
          margin + j * (dynamicFontSize + paddingVertical),
          maxWidth,
          dynamicFontSize + paddingVertical
        );

        if (isHover || lockedIndices.includes(i)) {
          fill(255, 0, 0); // red for hover or locked
        } else {
          fill(0);
        }
        textAlign(LEFT, CENTER);
        text(
          words[j],
          xPos + 5,
          margin +
            j * (dynamicFontSize + paddingVertical) +
            (dynamicFontSize + paddingVertical) / 2
        );
      }
    }

    if (mouseY > margin + paddingVertical) {
      hoverIndex = -1;
    }
  }

  if (capturing && typeof capturer !== 'undefined') {
    capturer.capture(document.getElementById('defaultCanvas0'));
  }
}

function mouseClicked() {
  let maxWidth = (width - 2 * margin) / headers.length;
  let dynamicFontSize = (maxWidth / 10) * 0.9;
  textSize(dynamicFontSize);

  let totalWidth = maxWidth * headers.length;
  let padding = (width - 2 * margin - totalWidth) / (headers.length - 1);

  for (let i = 0; i < headers.length; i++) {
    let xPos = margin + i * (maxWidth + padding);
    let words = displayHeaders[i].split(" ");
    let headerHeight = words.length * (dynamicFontSize + paddingVertical);

    if (
      mouseX > xPos + 5 &&
      mouseX < xPos + maxWidth &&
      mouseY > margin &&
      mouseY < margin + headerHeight
    ) {
      const index = lockedIndices.indexOf(i);
      if (index === -1) {
        if (lockedIndices.length < 2) {
          lockedIndices.push(i);
        }
      } else {
        lockedIndices.splice(index, 1);
      }
      return;
    }
  }
}

function mouseDragged() {
  x += pmouseX - mouseX;
  y += pmouseY - mouseY;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  if (key === 'i' || key === 'I') {
    saveCanvas('myCanvas', 'png');
  } else if (key === 'r' || key === 'R') {
    toggleRecording();
  } else if (key === '-') {
    showHeaders = !showHeaders; // toggle header visibility
  }
}

function toggleRecording() {
  capturing = !capturing;
  if (capturing && typeof capturer !== 'undefined') {
    capturer.start();
    console.log("Recording started");
  } else if (typeof capturer !== 'undefined') {
    capturer.stop();
    capturer.save();
    console.log("Recording stopped and saved");
  } else {
    console.error("Capturer is not defined. Recording could not be started or stopped.");
  }
}
