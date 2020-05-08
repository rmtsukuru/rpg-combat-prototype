var scene;

function Scene() {
}

Scene.prototype.update = function() {
    if (DEBUG && triggerKeyState.y) {
        shakeScreen();
    }
    updateInput();
    updateGraphics();
};

Scene.prototype.draw = function() {
    drawRect(0, 0, canvasWidth, canvasHeight, '#000');
}

function CombatScene() {
    Scene.call(this);
}

CombatScene.prototype = Object.create(Scene.prototype);

CombatScene.prototype.update = function() {
    Scene.prototype.update.call(this);
};

CombatScene.prototype.drawPartyMemberStatus = (data, x, y) => {
    drawRect(x, y, 150, 135, 'white', true);
    drawText(data.name, x + 7, y + 25);
    drawText('HP: ' + data.health + '/' + data.maxHealth, x + 7, y + 50);
    if (data.resourceMax) {
        drawText(data.resourceName + ': ' + data.resource + '/' + data.resourceMax, x + 7, y + 75);
    }
    else {
        drawText(data.resourceName + ': ' + data.resource, x + 7, y + 75);
    }
    drawText('EVA: ' + formatPercent(data.evasion), x + 7, y + 100);
    if (SHOW_CONDITIONS && DEBUG) {
        drawText(data.conditions.map(x => x.name.charAt(0)).join('').toUpperCase(), x + 7, y + 125);
    }
};

CombatScene.prototype.draw = function() {
    Scene.prototype.draw.call(this);
    if (TRUE_HIT && DEBUG) {
        drawText('TRUE HIT', 545, 18, '#36f');
    }
    for (var i = 0; i < party.length; i++) {
        this.drawPartyMemberStatus(party[i], 8 * (i + 1) + 150 * i, 335);
    }
    if (enemies.length > 1) {
        enemies.forEach(function(enemy, i) {
            var text = enemy.name + ' HP: ' + Math.max(0, enemy.health) + '/' + enemy.maxHealth;
            drawText(text, 50 + 330 * (i % 2), 50 + 60 * Math.floor(i / 2));
            drawText('ACC: ' + formatPercent(enemy.accuracy), 65 + 330 * (i % 2), 70 + 60 * Math.floor(i / 2));
            if (SHOW_CONDITIONS && DEBUG) {
                drawText(enemy.conditions.map(x => x.name.charAt(0)).join('').toUpperCase(), 165 + 330 * (i % 2), 70 + 60 * Math.floor(i / 2));
            }
        });
    }
    else {
        drawText('Monster HP: ' + Math.max(0, enemies[0].health) + '/' + enemies[0].maxHealth, 240, 50);
    }
    drawRect(480, 145, 150, 180, 'white', true);
    for (var i = 0; i < queue.length; i++) {
        var data = queue[i];
        var color = queue[i].health > 0 ? 'white' : 'red';
        drawText(data.name, 485, 170 + 25 * i, color);
        drawText(data.time, 605, 170 + 25 * i, color);
    }
    drawFlash();
};

function configureScenario() {
    configureItems();
    scene = new QueueScene();
}
