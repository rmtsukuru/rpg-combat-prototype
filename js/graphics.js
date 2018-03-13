var canvas, graphicsContext;
var canvasWidth, canvasHeight;
var baseWidth, baseHeight;
var scalingFactor;

function drawArrow(x, y, width, height, color) {
    graphicsContext.fillColor = color;
    graphicsContext.beginPath();
    graphicsContext.moveTo(x * scalingFactor, y * scalingFactor);
    graphicsContext.lineTo(x * scalingFactor, (y + height) * scalingFactor);
    graphicsContext.lineTo((x + width) * scalingFactor, (y + height / 2) * scalingFactor);
    graphicsContext.closePath();
    graphicsContext.fill();
}

function drawRect(x, y, width, height, color, outline) {
    outline = outline || false;
    if (outline) {
        graphicsContext.strokeStyle = color;
        graphicsContext.strokeRect(x * scalingFactor, y * scalingFactor, width * scalingFactor, height * scalingFactor);
    }
    else {
        graphicsContext.fillStyle = color;
        graphicsContext.fillRect(x * scalingFactor, y * scalingFactor, width * scalingFactor, height * scalingFactor);
    }
}

function drawText(text, x, y, color, fontSize, font) {
    font = font || 'Courier';
    fontSize = (fontSize || 18) * scalingFactor + 'px';
    graphicsContext.font = fontSize + ' ' + font;
    graphicsContext.fillStyle = color || 'white';
    graphicsContext.fillText(text, x * scalingFactor, y * scalingFactor);
}

function drawTextMultiline(text, x, y, color, fontSize, font) {
    var lines = text.split("\n");
    fontSize = (fontSize || 18);
    lines.forEach(function(line, i) {
        drawText(line, x, y + i * (fontSize + 7), color, fontSize, font);
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
}
