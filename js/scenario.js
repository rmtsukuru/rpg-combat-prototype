var scene;

function Scene() {
}

Scene.prototype.update = function() {
    // Do nothing, this is for inheritance.
};

Scene.prototype.draw = function() {
    drawRect(0, 0, canvasWidth, canvasHeight, '#000');
    drawText('DISPLAY DUMMY TEXT', BASE_HEIGHT * ASPECT_RATIO / 2 - 80, BASE_HEIGHT / 2 - 6);
};

function CombatScene() {
    Scene.call(this);
    this.menuY = 0;
    this.menuOptions = ['Attack', 'Tactics', 'Magic', 'Item'];
}

CombatScene.prototype = Object.create(Scene.prototype);

CombatScene.prototype.update = function() {
    if (triggerKeyState.down) {
        this.menuY++;
        this.menuY %= this.menuOptions.length;
    }
    else if (triggerKeyState.up) {
        this.menuY--;
        this.menuY = this.menuY < 0 ? this.menuOptions.length - 1 : this.menuY;
    }
    updateInput();
};

CombatScene.prototype.draw = function() {
    Scene.prototype.draw.call(this);
    for (var i = 0; i < this.menuOptions.length; i++) {
        drawText(this.menuOptions[i], 50, 100 + 20 * i);
    }
    drawRect(30, 88 + 20 * this.menuY, 10, 10, 'white');
}

function configureScenario() {
    scene = new CombatScene();
}
