function ExplorationScene() {
    FieldScene.call(this);
}

ExplorationScene.prototype = Object.create(FieldScene.prototype);

ExplorationScene.prototype.update = function() {
    FieldScene.prototype.update.call(this);

    // TODO use these
    var xVelocity, yVelocity = 0;

    if (keyState.up) {
        this.y -= FIELD_SPEED;
    }
    if (keyState.down) {
        this.y += FIELD_SPEED;
    }
    if (keyState.left) {
        this.x -= FIELD_SPEED;
    }
    if (keyState.right) {
        this.x += FIELD_SPEED;
    }
}

ExplorationScene.prototype.draw = function() {
    FieldScene.prototype.draw.call(this);
}
