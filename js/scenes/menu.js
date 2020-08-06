const MENU_BLINK_TIMER_FRAMES = FPS * 3;

function MenuScene(combatant) {
    CombatScene.call(this);
    this.combatant = combatant;
    this.menuY = 0;
    this.menu = this.generateMenu();
    this.parents = [];
    this.target = false;
    this.calculateWidth();
    this.blinkTimer = MENU_BLINK_TIMER_FRAMES;
}

MenuScene.prototype = Object.create(CombatScene.prototype);

MenuScene.prototype.getTitle = function(menuItem) {
    var cost = 0;
    var title = menuItem.name || menuItem.title;
    var action = actionData[menuItem.action];
    if (action) {
        if (action.cost) {
            cost = action.cost;
        }
        if (action.title) {
            title = action.title;
        }
    }
    var timeDisplay = '';
    if (this.target) {
        hitText = '';
        if (actionData[this.action].target != 'ally') {
            hitChanceMod = actionData[this.action].hitChance || 0;
            hitText = '  HIT: ' + formatPercent(this.combatant.accuracy - menuItem.evasion + hitChanceMod);
        }
        return title + ' - ' + menuItem.health + '/' + menuItem.maxHealth + hitText;
    }
    else if (!menuItem.submenu) {
        var time = action && action.time;
        if (typeof time == 'function') {
            time = time(this.combatant);
        }
        timeDisplay = '   ' + (time || 5) + 's';
    }
    if (cost > 0) {
        return title + ' - ' + pluralize(cost, queue[0].resourceName) + timeDisplay;
    }
    else if (menuItem.quantity >= 0) {
        return title + ' (' + menuItem.quantity + ')' + timeDisplay;
    }
    else if (menuItem.durability >= 0 && menuItem.maxDurability) {
        return title + ' - ' + menuItem.durability + '/' + menuItem.maxDurability + ' DUR' + timeDisplay;
    }
    else if (menuItem.ammo >= 0 && menuItem.maxAmmo) {
        return title + ' - ' + menuItem.ammo + '/' + menuItem.maxAmmo + ' AMMO' + timeDisplay;
    }
    return title + timeDisplay;
};

MenuScene.prototype.generateMenu = function(combatant) {
    combatant = combatant || this.combatant;
    return [
        { title: 'Attack', submenu: 
            combatant.items.filter(function(item) {
                return item.equipped;
            }).map(function(item) {
                return buildItem(item);
            }).sort(function(a, b) {
                return a.equipment.length - b.equipment.length;
            })
        },
        { title: combatant.skillName || 'Skills', submenu:
            combatant.skills.filter(function(skill) {
                return !skill.spell;
            })
        },
        { title: combatant.magicName || 'Magic', submenu:
            combatant.skills.filter(function(skill) {
                return skill.spell;
            })
        },
        { title: 'Item', submenu:
            combatant.items.filter(function(item) {
                return !item.equipped;
            }).map(function(item) {
                return buildItem(item);
            })
        },
        { title: 'Move', tileSelect: true, action: 'move' },
    ];
};

MenuScene.prototype.calculateWidth = function() {
    var maxWidth = 0;
    var self = this;
    this.menu.forEach(function(item, i) {
        var title = self.getTitle(item);
        maxWidth = Math.max(maxWidth, title.length * 11 + 43);
    });
    this.menuWidth = maxWidth;
};

MenuScene.prototype.fetchTargets = function(actionData) {
    if (actionData.target == 'self' || actionData.selfCondition) {
        return [this.combatant];
    }
    let targets = [...enemies];
    if (actionData.target == 'ally') {
        targets = [...party];
    }
    const inRange = (target, action) =>
        getGridDistance(this.combatant, target) <= (action.range || 1);
    return targets.filter(x => inRange(x, actionData));
};

MenuScene.prototype.fetchTileTarget = function() {
    var combatants = party.concat(enemies);
    var possibleTargets = combatants.filter(c => c.x == this.tileX && c.y == this.tileY);
    if (possibleTargets.length > 0) {
        return possibleTargets[0];
    }
};

MenuScene.prototype.handleTileSelection = function() {
    if (triggerKeyState.enter || triggerKeyState.z) {
        if (this.action == 'move') {
            this.combatant.x = this.tileX;
            this.combatant.y = this.tileY;
            this.combatant.time += this.combatant.getMoveTime();
            scene = new QueueScene();
        }
    }
    else if (triggerKeyState.shift || triggerKeyState.x || triggerKeyState.esc) {
        this.menu = this.parents[this.parents.length - 1];
        this.parents.pop();
        this.menuY = 0;
        this.target = false;
        this.action = null;
        this.calculateWidth();
        this.selectingTile = false;
        playSound('beep1', 0.5);
    }
    else if (triggerKeyState.down && this.tileY < 17) {
        this.tileY++;
        this.target = this.fetchTileTarget();
        playSound('beep0', 0.3);
    }
    else if (triggerKeyState.up && this.tileY > 0) {
        this.tileY--;
        this.target = this.fetchTileTarget();
        playSound('beep0', 0.3);
    }
    else if (triggerKeyState.left && this.tileX > 0) {
        this.tileX--;
        this.target = this.fetchTileTarget();
        playSound('beep0', 0.3);
    }
    else if (triggerKeyState.right && this.tileX < 24) {
        this.tileX++;
        this.target = this.fetchTileTarget();
        playSound('beep0', 0.3);
    }
};

MenuScene.prototype.fetchMovableTiles = function() {
    const inRange = (x, y) =>
        getGridDistance(this.combatant, { x, y }) <= this.combatant.speed;
    const combatantPositions = party.concat(enemies).map(c => ({ x: c.x, y: c.y }));
    var validTiles = [];
    for (var i = 0; i < 25; i++) {
        for (var j = 0; j < 18; j++) {
            if (inRange(i, j)) {
                validTiles.push({ x: i, y: j });
            }
        }
    }
    return validTiles.filter(tile => !combatantPositions.some(({x, y}) => x == tile.x && y == tile.y));
};

MenuScene.prototype.update = function() {
    if (this.blinkTimer <= 0) {
        this.blinkTimer = MENU_BLINK_TIMER_FRAMES;
    }
    else {
        this.blinkTimer--;
    }
    if (this.selectingTile) {
        this.handleTileSelection();
    }
    else {
        if (triggerKeyState.enter || triggerKeyState.z) {
            var menuItem = this.menu[this.menuY];
            if (menuItem.tileSelect) {
                this.parents.push(this.menu);
                this.selectingTile = true;
                this.tileX = this.combatant.x;
                this.tileY = this.combatant.y;
                this.target = this.fetchTileTarget();
                this.action = menuItem.action;
                playSound('beep0', 0.5);
            }
            else if (menuItem.submenu) {
                this.parents.push(this.menu);
                if (typeof menuItem.submenu == 'function') {
                    this.menu = menuItem.submenu();
                }
                else {
                    this.menu = menuItem.submenu;
                }
                this.menuY = 0;
                this.calculateWidth();
                playSound('beep0', 0.5);
            }
            else if (menuItem.action) {
                var cost = actionData[menuItem.action].cost || 0;
                var potentialTargets = this.fetchTargets(actionData[menuItem.action]);
                if ((cost > 0 && this.combatant.resource <= 0) || menuItem.quantity <= 0 || menuItem.durability <= 0 || menuItem.ammo <= 0 || potentialTargets.length <= 0) {
                    playSound('beep1', 0.5);
                }
                else {
                    this.action = menuItem.action;
                    if (actionData[this.action].all) {
                        targets = [...(actionData[this.action].target == 'ally' ? party : enemies)];
                        var restriction = x => x.health > 0;
                        if (actionData[this.action].restriction) {
                            restriction = actionData[this.action].restriction;
                        }
                        else if (actionData[this.action].damage < 0) {
                            restriction = x => x.health > 0 && x.health < x.maxHealth;
                        }
                        targets = targets.filter(restriction);
                        firstTarget = targets.splice(0, 1)[0];
                        options = { remainingTargets: targets };
                        if (menuItem.item) {
                            options.item = menuItem.item;
                        }
                        scene = new ActionScene(this.combatant, firstTarget, menuItem.action, options);
                    }
                    else if (actionData[this.action].target == 'self' || actionData[this.action].selfCondition) {
                        options = {};
                        if (menuItem.item) {
                            options.item = menuItem.item;
                        }
                        scene = new ActionScene(this.combatant, this.combatant, menuItem.action, options);
                    }
                    else {
                        this.target = true;
                        if (menuItem.item) {
                            this.item = menuItem.item;
                        }
                        this.parents.push(this.menu);
                        this.menu = potentialTargets;
                        this.menuY = 0;
                        this.calculateWidth();
                    }
                    playSound('beep0', 0.5);
                }
            }
            else if (this.target) {
                var restriction = x => x.health > 0;
                if (actionData[this.action].restriction) {
                    restriction = actionData[this.action].restriction;
                }
                else if (actionData[this.action].damage < 0) {
                    restriction = x => x.health > 0 && x.health < x.maxHealth;
                }
                if (restriction(menuItem, this.combatant)) {
                    var options = {};
                    if (this.item) {
                        options.item = this.item;
                    }
                    scene = new ActionScene(this.combatant, menuItem, this.action, options);
                    playSound('beep0', 0.5);
                }
                else {
                    playSound('beep1', 0.5);
                }
            }
        }
        else if (triggerKeyState.shift || triggerKeyState.x || triggerKeyState.esc) {
            if (this.parents.length > 0) {
                this.menu = this.parents[this.parents.length - 1];
                this.parents.pop();
                this.menuY = 0;
                this.target = false;
                this.calculateWidth();
                playSound('beep1', 0.5);
            }
        }
        else if (triggerKeyState.down) {
            this.menuY++;
            this.menuY %= this.menu.length;
            playSound('select0', 0.3);
        }
        else if (triggerKeyState.up) {
            this.menuY--;
            this.menuY = this.menuY < 0 ? this.menu.length - 1 : this.menuY;
            playSound('select0', 0.3);
        }
    }
    CombatScene.prototype.update.call(this);
};

MenuScene.prototype.draw = function() {
    CombatScene.prototype.draw.call(this);
    if (party.includes(this.combatant)) {
        this.drawCombatantStatus(this.combatant, 8, 335);
        var alpha = 1 - Math.abs(2 * this.blinkTimer / MENU_BLINK_TIMER_FRAMES - 1);
        drawRect(8, 335, 150, 135, 'rgba(255, 0, 0, ' + 0.6 * alpha + ')');
    }
    if (this.selectingTile) {
        // Draw movable tiles
        this.fetchMovableTiles().forEach(({x, y}) => {
            drawRect(175 + x * 10, 37 + y * 15, 10, 15, '#ff00dd88');
        });
        drawRect(175 + this.tileX * 10, 37 + this.tileY * 15, 10, 15, 'white', true);
        if (this.target) {
            this.drawCombatantStatus(this.target, 480, 335);
        }
    }
    else {
        baseY = this.menu.length > 4 ? 195 : 230;
        drawRect(20, baseY, this.menuWidth, 10 + 20 * this.menu.length, 'black');
        drawRect(20, baseY, this.menuWidth, 10 + 20 * this.menu.length, 'white', true);
        var self = this;
        this.menu.forEach(function(item, i) {
            var title = self.getTitle(item);
            drawText(title, 50, baseY + 20 + 20 * i);
        });
        drawArrow(30, baseY + 8 + 20 * this.menuY, 10, 10, 'white');
    }
}
