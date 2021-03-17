function ExplorationScene() {
    FieldScene.call(this);
}

ExplorationScene.prototype = Object.create(FieldScene.prototype);

ExplorationScene.prototype.warp = function() {
    const nextMap = game.field.mapId == 0 ? 1 : 0;
    warpTo(nextMap, 5, 7);
}

ExplorationScene.prototype.update = function() {
    var position = game.field.position;
    position.xVelocity = position.yVelocity = 0;
    const speed = keyState.w ? FIELD_SPEED / 2 : FIELD_SPEED;

    if (keyState.up) {
        position.yVelocity -= speed;
    }
    if (keyState.down) {
        position.yVelocity += speed;
    }
    if (keyState.left) {
        position.xVelocity -= speed;
    }
    if (keyState.right) {
        position.xVelocity += speed;
    }

    if (triggerKeyState.m) {
        scene = new MessageScene('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus auctor ut turpis ac dictum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aliquam mattis vulputate mauris a pharetra.');
    }
    else if (triggerKeyState.f) {
        scene = new QueueScene();
    }

    handleTileCollision(position);

    position.x += position.xVelocity;
    position.y += position.yVelocity;
    const tileX = tileIndex(position.x);
    const tileY = tileIndex(position.y);
    if (tiles[tileY][tileX] == 5) {
        this.warp();
    }
    FieldScene.prototype.update.call(this);
}

ExplorationScene.prototype.draw = function() {
    FieldScene.prototype.draw.call(this);
}

function MessageScene(message) {
    FieldScene.call(this);
    this.message = message.match(new RegExp('.{1,' + MESSAGE_LINE_LENGTH + '}', 'g'))
        .join('\n').replace(/\n\s+/g, '\n');
    this.messageIndex = 0;
    this.messageTimer = 60 - DEFAULT_MESSAGE_SPEED;
}

MessageScene.prototype = Object.create(FieldScene.prototype);

MessageScene.prototype.update = function() {
    if (this.messageIndex < this.message.length) {
        if (this.messageTimer > 0) {
            this.messageTimer--;
        }
        else {
            do {
                this.messageIndex++;
            } while(this.message[this.messageIndex] && this.message[this.messageIndex].match(/\s/));
            const speed = (keyState.enter || keyState.z) ?
                ACTIVE_MESSAGE_SPEED : DEFAULT_MESSAGE_SPEED;
            this.messageTimer = 60 - speed;
            // Play sound here if desired.
            playSound('beep0', 0.5);
        }
    }
    else {
        if (triggerKeyState.enter || triggerKeyState.z) {
            scene = new ExplorationScene();
        }
    }
    FieldScene.prototype.update.call(this);
}

MessageScene.prototype.draw = function() {
    FieldScene.prototype.draw.call(this);
    var x = 2;
    var y = 320;
    drawRect(x, y, 635, 158, '#000');
    drawRect(x, y, 635, 158, 'white', true);
    drawTextMultiline(this.message.substring(0, this.messageIndex), x + 5, y + 20);
}
