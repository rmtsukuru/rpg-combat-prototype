var scene;

const game = {
    field: {},
};

function Scene() {
    document.getElementsByTagName('html')[0].setAttribute('class', 'pulse');
    if (this.backgroundClass()) {
        document.getElementsByTagName('html')[0].setAttribute('class', 'pulse ' + this.backgroundClass());
    }
}

Scene.prototype.backgroundClass = function() {
    return undefined;
}

Scene.prototype.update = function() {
    if (DEBUG && triggerKeyState.y) {
        shakeScreen();
    }
    updateInput();
    updateGraphics();
};

Scene.prototype.draw = function() {
    graphicsContext.imageSmoothingEnabled = false;
    drawRect(0, 0, canvasWidth, canvasHeight, '#000');
}

function CombatScene() {
    Scene.call(this);
}

CombatScene.prototype = Object.create(Scene.prototype);

CombatScene.prototype.backgroundClass = function() {
    return 'combat';
}

CombatScene.prototype.update = function() {
    Scene.prototype.update.call(this);
};

CombatScene.prototype.drawCombatantStatus = function(data, x, y) {
    drawRect(x, y, 150, 135, 'white', true);
    drawText(data.name, x + 7, y + 25);
    drawText('HP: ' + data.health + '/' + data.maxHealth, x + 7, y + 50);
    if (data.isEnemy) {
        drawText('ACC: ' + formatPercent(data.accuracy), x + 7, y + 75);
        drawText('EVA: ' + formatPercent(data.evasion), x + 7, y + 100);
    }
    else {
        if (data.resourceMax) {
            drawText(data.resourceName + ': ' + data.resource + '/' + data.resourceMax, x + 7, y + 75);
        }
        else {
            drawText(data.resourceName + ': ' + data.resource, x + 7, y + 75);
        }
        drawText('EVA: ' + formatPercent(data.evasion), x + 7, y + 100);
    }
    if (SHOW_CONDITIONS && DEBUG) {
        drawText(data.conditions.map(x => x.name.charAt(0)).join('').toUpperCase(), x + 7, y + 125);
    }
};

CombatScene.prototype.drawQueueWindow = function(x, y, width, height) {
    drawRect(x, y, width, height, 'white', true);
    for (var i = 0; i < queue.length; i++) {
        var data = queue[i];
        var color = queue[i].health > 0 ? 'white' : 'red';
        drawText(data.name, x + 5, y - 5 + 25 * (i + 1), color);
        drawText(data.time, x + 145, y - 5 + 25 * (i + 1), color);
    }
};

CombatScene.prototype.drawCombatGrid = function(x, y) {
    for (var i = 0; i < 25; i++) {
        for (var j = 0; j < 18; j++) {
            var tileEmpty = !party.concat(enemies).some(combatant => {
                if (combatant.x == i && combatant.y == j) {
                    if (combatant == this.combatant) {
                        drawText(combatant.icon, x + i * 10, y + j * 15, 'red');
                    }
                    else {
                        drawText(combatant.icon, x + i * 10, y + j * 15);
                    }
                    return true;
                }
            });
            if (tileEmpty) {
                drawText('.', x + i * 10, y + j * 15);
            }
        }
    }
};

CombatScene.prototype.draw = function() {
    Scene.prototype.draw.call(this);
    if (TRUE_HIT && DEBUG) {
        drawText('TRUE HIT', 545, 18, '#36f');
    }
    this.drawQueueWindow(460, 25, 170, 180);
    this.drawCombatGrid(175, 50);
    drawFlash();
};

function FieldScene() {
    Scene.call(this);
}

FieldScene.prototype = Object.create(Scene.prototype);

FieldScene.prototype.drawFieldGrid = function(x, y) {
    for (var i = 0; i < tiles.length; i++) {
        for (var j = 0; j < tiles[i].length; j++) {
            const tileIndex = tiles[i][j];
            const tileSourceX = tileIndex * 16;
            drawTiledImage('main-sprites.png', x + j * 16, y + i * 16, tileSourceX, 0, 16, 16, 16, 16);
        }
    }
}

FieldScene.prototype.draw = function() {
    Scene.prototype.draw.call(this);
    this.drawFieldGrid(0, 0);
    // drawText('S', 150 + game.field.position.x, 100 + game.field.position.y, 'red');
    drawTiledImage('main-sprites.png', game.field.position.x, game.field.position.y, 0, 0, 16, 16, 16, 16);
}

function configureScenario() {
    configureItems();
    scene = COMBAT_TEST ? new QueueScene() : new ExplorationScene();
    game.field.mapId = STARTING_MAP_ID;
    fetchCurrentMapTiles();
    game.field.position = {
        x: 150,
        y: 150,
    };
}
