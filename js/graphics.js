var canvas, graphicsContext;
var canvasWidth, canvasHeight;
var baseWidth, baseHeight;
var scalingFactor;
var flashTimer, flashColor;
var shakeTimer, shakeXOffset;

var images = {};

function loadImage(filename) {
    var image = {loaded: false};
    image.data = document.createElement('img');
    image.data.onload = function() {
        image.loaded = true;
    };
    image.data.src = 'img/' + filename;
    images[filename] = image;
}

function imageLoaded(filename) {
    if (images[filename] && images[filename].loaded) {
        return true;
    }
    if (!images[filename]) {
        loadImage(filename);
    }
}

function fetchImage(filename) {
    if (imageLoaded(filename)) {
        return images[filename].data;
    }
}

function drawTiledImage(filename, x, y, sourceX, sourceY, sourceWidth, sourceHeight, width, height, filter) {
    if (imageLoaded(filename)) {
        var image = fetchImage(filename);
        sourceWidth = sourceWidth || image.width;
        sourceHeight = sourceHeight || image.height;
        width = width || image.width;
        height = height || image.height;
        graphicsContext.filter = filter || 'none';
        graphicsContext.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, Math.floor((x + shakeXOffset) * scalingFactor), Math.floor(y * scalingFactor), Math.ceil(width * scalingFactor), Math.ceil(height * scalingFactor));
    }
}

function drawImage(filename, x, y) {
    drawTiledImage(filename, x, y, 0, 0);
}

function drawArrow(x, y, width, height, color) {
    graphicsContext.fillColor = color;
    graphicsContext.beginPath();
    graphicsContext.moveTo((x + shakeXOffset) * scalingFactor, y * scalingFactor);
    graphicsContext.lineTo((x + shakeXOffset) * scalingFactor, (y + height) * scalingFactor);
    graphicsContext.lineTo((x + shakeXOffset + width) * scalingFactor, (y + height / 2) * scalingFactor);
    graphicsContext.closePath();
    graphicsContext.fill();
}

function drawRect(x, y, width, height, color, outline) {
    outline = outline || false;
    if (outline) {
        graphicsContext.strokeStyle = color;
        graphicsContext.strokeRect((x + shakeXOffset) * scalingFactor, y * scalingFactor, width * scalingFactor, height * scalingFactor);
    }
    else {
        graphicsContext.fillStyle = color;
        graphicsContext.fillRect(Math.floor((x + shakeXOffset) * scalingFactor), Math.floor(y * scalingFactor), Math.ceil(width * scalingFactor), Math.ceil(height * scalingFactor));
    }
}

function drawText(text, x, y, color, fontSize, font) {
    font = font || 'Courier';
    fontSize = (fontSize || 18) * scalingFactor + 'px';
    graphicsContext.font = fontSize + ' ' + font;
    graphicsContext.fillStyle = color || 'white';
    graphicsContext.fillText(text, (x + shakeXOffset) * scalingFactor, y * scalingFactor);
}

function drawTextMultiline(text, x, y, color, fontSize, font) {
    var lines = text.split("\n");
    fontSize = (fontSize || 18);
    lines.forEach(function(line, i) {
        drawText(line, (x + shakeXOffset), y + i * (fontSize + 7), color, fontSize, font);
    });
}

function configureGraphics() {
    canvas = document.getElementById('gameCanvas');
    graphicsContext = canvas.getContext('2d');
    canvas.height = document.body.clientHeight;
    scalingFactor = Math.round(canvas.height / BASE_HEIGHT * 1000) / 1000;
    if (Math.abs(Math.round(scalingFactor) - scalingFactor) < 0.01) {
        scalingFactor = Math.round(scalingFactor);
    }
    baseWidth = BASE_HEIGHT * ASPECT_RATIO;
    baseHeight = BASE_HEIGHT;
    canvas.width = baseWidth * scalingFactor;
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    flashTimer = 0;
    shakeTimer = 0;
    shakeXOffset = 0;
}

function updateGraphics() {
    if (flashTimer > 0) {
        flashTimer--;
    }
    if (shakeTimer > 0) {
        shakeTimer--;
        shakeXOffset = SHAKE_WIDTH * Math.sin(shakeTimer * SHAKE_TIMER_FRAMES / (2 * Math.PI) );
    }
}

function drawFlash() {
    if (flashTimer > 0) {
        const alpha = 1 - Math.abs(2 * flashTimer / FLASH_TIMER_FRAMES - 1)
        const alphaHex = percentToHex(alpha, 1);
        drawRect(0, 0, canvasWidth, canvasHeight, flashColor + alphaHex);
    }
}

function flashScreen(color) {
    flashTimer = FLASH_TIMER_FRAMES;
    flashColor = color;
}

function shakeScreen() {
    shakeTimer = SHAKE_TIMER_FRAMES;
}
