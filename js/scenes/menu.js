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
        timeDisplay = '   ' + ((action && action.time) ? action.time : 5) + 's';
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

MenuScene.prototype.update = function() {
    if (this.blinkTimer <= 0) {
        this.blinkTimer = MENU_BLINK_TIMER_FRAMES;
    }
    else {
        this.blinkTimer--;
    }
    if (triggerKeyState.enter || triggerKeyState.z) {
        var menuItem = this.menu[this.menuY];
        if (menuItem.submenu) {
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
            if ((cost > 0 && this.combatant.resource <= 0) || menuItem.quantity <= 0 || menuItem.durability <= 0 || menuItem.ammo <= 0) {
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
                    if (actionData[this.action].target == 'ally') {
                        this.menu = party;
                    }
                    else {
                        this.menu = enemies;
                    }
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
    CombatScene.prototype.update.call(this);
};

MenuScene.prototype.draw = function() {
    CombatScene.prototype.draw.call(this);
    if (party.includes(this.combatant)) {
        var i = party.indexOf(this.combatant);
        var alpha = 1 - Math.abs(2 * this.blinkTimer / MENU_BLINK_TIMER_FRAMES - 1);
        drawRect(8 * (i + 1) + 150 * i, 335, 150, 135, 'rgba(255, 0, 0, ' + 0.6 * alpha + ')');
    }
    baseY = this.menu.length > 4 ? 195 : 230;
    drawRect(20, baseY, this.menuWidth, 10 + 20 * this.menu.length, 'white', true);
    var self = this;
    this.menu.forEach(function(item, i) {
        var title = self.getTitle(item);
        drawText(title, 50, baseY + 20 + 20 * i);
    });
    drawArrow(30, baseY + 8 + 20 * this.menuY, 10, 10, 'white');
}
