function ExplorationScene() {
    FieldScene.call(this);
}

ExplorationScene.prototype = Object.create(FieldScene.prototype);

ExplorationScene.prototype.update = function() {
    FieldScene.prototype.update.call(this);

    this.xVelocity = this.yVelocity = 0;

    if (keyState.up) {
        this.yVelocity -= FIELD_SPEED;
    }
    if (keyState.down) {
        this.yVelocity += FIELD_SPEED;
    }
    if (keyState.left) {
        this.xVelocity -= FIELD_SPEED;
    }
    if (keyState.right) {
        this.xVelocity += FIELD_SPEED;
    }

    handleTileCollision(this);

    this.x += this.xVelocity;
    this.y += this.yVelocity;
}

ExplorationScene.prototype.draw = function() {
    FieldScene.prototype.draw.call(this);
}
