var tiles = FIELD_TILES;

function isTilePassable(j, i) {
    if (i < 0 || j < 0 || i >= tiles.length || j >= tiles[i].length) {
        return false;
    }
    var value = tiles[i][j];
    return value == 0;
}

function tileIndex(x, vertical) {
    if (vertical) {
        return Math.floor(x / TILE_HEIGHT);
    }
    return Math.floor(x / TILE_WIDTH);
}

function getLeftCollisionVelocity(entity) {
    var minTileX = tileIndex(entity.x + entity.xVelocity);
    var maxTileX = tileIndex(entity.x + 1) - 1;
    var minTileY = tileIndex(entity.y, true);
    var maxTileY = tileIndex(entity.y + TILE_HEIGHT - 1, true);
    for (var i = maxTileX; i >= minTileX; i--) {
        for (var j = minTileY; j <= maxTileY; j++) {
            if (!isTilePassable(i, j)) {
                return Math.max(i * TILE_WIDTH + TILE_WIDTH - entity.x, entity.xVelocity);
            }
        }
    }
    return entity.xVelocity;
}

function getRightCollisionVelocity(entity) {
    var minTileX = tileIndex(entity.x + TILE_WIDTH - 1) + 1;
    var maxTileX = tileIndex(entity.x + TILE_WIDTH + entity.xVelocity);
    var minTileY = tileIndex(entity.y, true);
    var maxTileY = tileIndex(entity.y + TILE_HEIGHT - 1, true);
    for (var i = minTileX; i <= maxTileX; i++) {
        for (var j = minTileY; j <= maxTileY; j++) {
            if (!isTilePassable(i, j)) {
                return Math.min(i * TILE_WIDTH - (entity.x + TILE_WIDTH), entity.xVelocity);
            }
        }
    }
    return entity.xVelocity;
}

function getUpCollisionVelocity(entity, tempX) {
    var minTileY = tileIndex(entity.y + entity.yVelocity, true);
    var maxTileY = tileIndex(entity.y, true) - 1;
    var minTileX = tileIndex(tempX);
    var maxTileX = tileIndex(tempX + TILE_WIDTH - 1);
    for (var j = maxTileY; j >= minTileY; j--) {
        for (var i = minTileX; i <= maxTileX; i++) {
            if (!isTilePassable(i, j)) {
                return Math.max(j * TILE_HEIGHT + TILE_HEIGHT - entity.y, entity.yVelocity);
            }
        }
    }
    return entity.yVelocity;
}

function getDownCollisionVelocity(entity, tempX) {
    var minTileY = tileIndex(entity.y + TILE_HEIGHT - 1, true) + 1;
    var maxTileY = tileIndex(entity.y + TILE_HEIGHT + entity.yVelocity, true);
    var minTileX = tileIndex(tempX);
    var maxTileX = tileIndex(tempX + TILE_WIDTH - 1);
    for (var j = minTileY; j <= maxTileY; j++) {
        for (var i = minTileX; i <= maxTileX; i++) {
            if (!isTilePassable(i, j)) {
                return Math.min(j * TILE_HEIGHT - (entity.y + TILE_HEIGHT), entity.yVelocity);
            }
        }
    }
    return entity.yVelocity;
}

function getCollisionXVelocity(entity) {
    if (entity.xVelocity < 0) {
        return getLeftCollisionVelocity(entity);
    }
    else if (entity.xVelocity > 0) {
        return getRightCollisionVelocity(entity);
    }
    return 0;
}

function getCollisionYVelocity(entity) {
    if (entity.yVelocity < 0) {
        return getUpCollisionVelocity(entity, entity.x + entity.xVelocity);
    }
    else if (entity.yVelocity > 0) {
        return getDownCollisionVelocity(entity, entity.x + entity.xVelocity);
    }
    return 0;
}

function handleTileCollision(entity) {
    entity.xVelocity = getCollisionXVelocity(entity);
    entity.yVelocity = getCollisionYVelocity(entity);
}
