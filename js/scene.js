var scene;

function Scene() {
}

Scene.prototype.update = function() {
    updateInput();
};

Scene.prototype.draw = function() {
    drawRect(0, 0, canvasWidth, canvasHeight, '#000');
    for (var i = 0; i < party.length; i++) {
        drawRect(8 * (i + 1) + 150 * i, 335, 150, 135, 'white', true);
        var data = party[i];
        var x = 15 + 158 * i;
        drawText(data.name, x, 360);
        drawText('HP: ' + data.health + '/' + data.maxHealth, x, 385);
        if (data.resourceMax) {
            drawText(data.resourceName + ': ' + data.resource + '/' + data.resourceMax, x, 410);
        }
        else {
            drawText(data.resourceName + ': ' + data.resource, x, 410);
        }
    }
    if (enemies.length > 1) {
        enemies.forEach(function(enemy, i) {
            var text = 'Monster ' + (i + 1) + ' HP: ' + Math.max(0, enemies[i].health) + '/' + enemies[i].maxHealth;
            drawText(text, 50 + 330 * (i % 2), 50 + 40 * Math.floor(i / 2));
        });
    }
    else {
        drawText('Monster HP: ' + Math.max(0, enemies[0].health) + '/' + enemies[0].maxHealth, 240, 50);
    }
    drawRect(495, 145, 135, 180, 'white', true);
    for (var i = 0; i < queue.length; i++) {
        var data = queue[i];
        var color = queue[i].health > 0 ? 'white' : 'red';
        drawText(data.name, 500, 170 + 25 * i, color);
        drawText(data.time, 605, 170 + 25 * i, color);
    }
};
