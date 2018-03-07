var scene;

function Scene() {
}

Scene.prototype.update = function() {
    // Do nothing, this is for inheritance.
};

Scene.prototype.draw = function() {
    drawRect(0, 0, canvasWidth, canvasHeight, '#9ca');
    drawText('DISPLAY DUMMY TEXT', BASE_HEIGHT * ASPECT_RATIO / 2 - 80, BASE_HEIGHT / 2 - 6);
};

function configureScenario() {
    scene = new Scene();
}
