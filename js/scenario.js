const MENU_BLINK_TIMER_FRAMES = FPS * 3;

var scene;

var playerCharacters = {
    slayer: {
        name: 'SLAYER',
        health: 50,
        maxHealth: 50,
        resourceName: 'SOULS',
        resource: 1,
        resourceMax: 3,
        accuracy: 0.8,
        defenses: { laceration: 5 },
        evasion: 0.3,
        agility: 20,
        time: 0,
        critChance: 0.05,
        conditions: [],
        skills: [
            { title: 'Trip', action: 'trip' },
            { title: 'Dodge', action: 'dodge' },
            { action: 'inspect' },
            { action: 'scalding_strike', spell: true },
            { action: 'spirit_binding', spell: true },
        ],
        items: [
            { item: 'straight_sword', durability: 50, equipped: true },
            { item: 'pistol', ammo: 1, equipped: true },
            { item: 'ointment', quantity: 1 },
            { item: 'bullets', quantity: 12 },
            { item: 'cutlass', durability: 20 },
        ]
    },
    knight: {
        name: 'KNIGHT',
        health: 80,
        maxHealth: 80,
        resourceName: 'FAVOR',
        resource: 12,
        accuracy: 0.6,
        defenses: { concussion: 5, laceration: 10, penetration: 2 },
        evasion: 0.1,
        agility: 10,
        time: 0,
        critChance: 0.01,
        conditions: [],
        skills: [
            { action: 'inspect' },
            { action: 'smite', spell: true },
        ],
        items: [
            { item: 'warhammer', durability: 80, equipped: true },
            { item: 'ointment', quantity: 3 },
        ],
    },
};

var monsters = {
    skeleton: {
        name: 'SKELETON',
        title: 'Skeleton',
        health: 30,
        maxHealth: 30,
        accuracy: 0.8,
        defenses: { laceration: 6, penetration: 8, concussion: -1, incineration: 2, radiation: -8 },
        resistances: { physical: 0.4, mental: 0.05 },
        evasion: 0.1,
        agility: 5,
        time: 0,
        critChance: 0.01,
        conditions: [],
        inspectText: 'It is a skeleton, the clattering remains \nof a dead human. Susceptible to \nconcussive force.',
    },
};

var menu = [
    { title: 'Attack', submenu: function() {
        return party[0].items.filter(function(item) {
            return item.equipped;
        }).map(function(item) {
            return buildItem(item);
        }).sort(function(a, b) {
            return a.equipment.length - b.equipment.length;
        });
    } },
    { title: 'Tactics', submenu: function() {
        return party[0].skills.filter(function(skill) {
            return !skill.spell;
        });
    } },
    { title: 'Magic', submenu: function() {
        return party[0].skills.filter(function(skill) {
            return skill.spell;
        });
    } },
    { title: 'Item', submenu: function() {
        return party[0].items.filter(function(item) {
            return !item.equipped;
        }).map(function(item) {
            return buildItem(item);
        });
    } },
];

var party = [playerCharacters.knight];
var enemies = [monsters.skeleton, Object.assign({}, monsters.skeleton)];
var queue = party.concat(enemies);

function configureItems() {
}

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
        drawText(data.name, 20, 360);
        drawText('HP: ' + data.health + '/' + data.maxHealth, 20, 385);
        if (data.resourceMax) {
            drawText(data.resourceName + ': ' + data.resource + '/' + data.resourceMax, 20, 410);
        }
        else {
            drawText(data.resourceName + ': ' + data.resource, 20, 410);
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
    drawRect(495, 195, 135, 130, 'white', true);
    for (var i = 0; i < queue.length; i++) {
        var data = queue[i];
        var color = queue[i].health > 0 ? 'white' : 'red';
        drawText(data.name, 500, 220 + 25 * i, color);
        drawText(data.time, 610, 220 + 25 * i, color);
    }
};

function QueueScene() {
    Scene.call(this);
    queue.sort(function(a, b) {
        if (a.health <= 0) {
            return 1;
        }
        if (b.health <= 0) {
            return -1;
        }
        return (a.time == b.time) ? b.agility - a.agility : a.time - b.time;
    });
    if (queue[0].time > 0) {
        var time = queue[0].time;
        queue.forEach(function(x) {
            if (x.health > 0) {
                x.time -= time;
                x.conditions.forEach(function(condition) {
                    for (var i = 0; i < time; i++) {
                        condition.timeTick();
                    }
                });
            }
        });
    }
}

QueueScene.prototype = Object.create(Scene.prototype);

QueueScene.prototype.update = function() {
    var next = queue[0];
    if (party.includes(next)) {
        scene = new MenuScene(queue[0]);
    }
    else if (enemies.includes(next)) {
        scene = new EnemyScene(queue[0]);
    }
    Scene.prototype.update.call(this);
};

function MenuScene(combatant) {
    Scene.call(this);
    this.combatant = combatant;
    this.menuY = 0;
    this.menu = menu;
    this.parents = [];
    this.target = false;
    this.calculateWidth();
    this.blinkTimer = MENU_BLINK_TIMER_FRAMES;
}

MenuScene.prototype = Object.create(Scene.prototype);

MenuScene.prototype.getTitle = function(menuItem) {
    var cost = 0;
    var title = menuItem.title;
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
        return title + ' - ' + menuItem.health + '/' + menuItem.maxHealth;
    }
    else if (!menuItem.submenu) {
        timeDisplay = '   ' + ((action && action.time) ? action.time : 5) + 's';
    }
    if (cost > 0) {
        return title + ' - ' + cost + ' SOUL' + (cost > 1 ? 'S' : '') + timeDisplay;
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
            if (cost > 0 && this.combatant.resource <= 0) {
                playSound('beep1', 0.5);
            }
            else if (menuItem.quantity <= 0) {
                playSound('beep1', 0.5);
            }
            else if (menuItem.durability <= 0) {
                playSound('beep1', 0.5);
            }
            else if (menuItem.ammo <= 0) {
                playSound('beep1', 0.5);
            }
            else {
                this.action = menuItem.action;
                if (actionData[this.action].target == 'self') {
                    var options = {};
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
                    this.menu = enemies;
                    this.menuY = 0;
                    this.calculateWidth();
                }
                playSound('beep0', 0.5);
            }
        }
        else if (this.target) {
            if (menuItem.health > 0) {
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
    Scene.prototype.update.call(this);
};

MenuScene.prototype.draw = function() {
    Scene.prototype.draw.call(this);
    if (party.includes(this.combatant)) {
        var i = party.indexOf(this.combatant);
        var alpha = 1 - Math.abs(2 * this.blinkTimer / MENU_BLINK_TIMER_FRAMES - 1);
        drawRect(8 * (i + 1) + 150 * i, 335, 150, 135, 'rgba(255, 0, 0, ' + 0.6 * alpha + ')');
    }
    drawRect(20, 230, this.menuWidth, 10 + 20 * this.menu.length, 'white', true);
    var self = this;
    this.menu.forEach(function(item, i) {
        var title = self.getTitle(item);
        drawText(title, 50, 250 + 20 * i);
    });
    drawArrow(30, 238 + 20 * this.menuY, 10, 10, 'white');
}

function ActionScene(combatant, target, action, options) {
    Scene.call(this);
    this.combatant = combatant;
    this.updateConditions(this.combatant);
    if (options.item) {
        this.item = options.item;
    }
    this.action = buildAction(action, this.combatant, target);
    var results = this.action.execute();
    this.hit = results.hit;
    this.crit = results.crit;
    this.damage = this.action.calculateDamage(this.crit);
    this.combatant.time += this.action.time;
    this.combatant.resource -= this.action.cost;
    if (this.item) {
        if (this.item.quantity >= 0) {
            this.item.quantity--;
            if (this.item.quantity == 0) {
                this.combatant.items.splice(this.combatant.items.indexOf(this.item), 1);
            }
        }
        if (action != 'equip') {
            if (this.item.durability) {
                this.item.durability--;
            }
            else if (this.item.ammo) {
                this.item.ammo--;
            }
        }
    }
    if (this.action.reload) {
        this.combatant.items.filter(function(item) { return item.equipped; }).forEach(function(item) {
            if (itemData[item.item].maxAmmo) {
                item.ammo = itemData[item.item].maxAmmo;
            }
        });
    }
    if (this.action.equip) {
        var slot = itemData[this.item.item].equipment;
        this.combatant.items.forEach(function(item) {
            if (itemData[item.item].equipment == slot) {
                item.equipped = false;
            }
        });
        this.item.equipped = true;
    }
    this.messageTimer = FPS * 0.5;
}

ActionScene.prototype = Object.create(Scene.prototype);

ActionScene.prototype.updateConditions = function(target) {
    target.conditions.forEach(function(condition, i) {
        condition.time--;
        if (condition.time <= 0) {
            condition.end();
            target.conditions.splice(i, 1);
        }
    });
};

ActionScene.prototype.update = function() {
    if (this.messageTimer > 0) {
        this.messageTimer--;
    }
    else if (triggerKeyState.enter || triggerKeyState.z) {
        var enemiesRemaining = enemies.filter(function(enemy) { return enemy.health > 0; });
        scene = enemiesRemaining.length <= 0 ? new VictoryScene() : new QueueScene();
        playSound('beep0', 0.5);
    }
    Scene.prototype.update.call(this);
};

ActionScene.prototype.draw = function() {
    Scene.prototype.draw.call(this);
    drawRect(10, 195, 475, 130, 'white', true);
    drawTextMultiline(this.action.text, 25, 220);
    if (Math.abs(this.damage) > 0) {
        if (this.hit) {
            if (this.damage > 0) {
                var critText = this.crit ? ' A critical hit!!' : '';
                drawTextMultiline('It dealt ' + this.damage + ' damage!' + critText, 25, 245);
            }
            else {
                drawTextMultiline('It healed ' + Math.abs(this.damage) + ' damage!', 25, 245);
            }
            if (this.action.inflictedCondition) {
                var condition = conditionData[this.action.targetCondition];
                var conditionText = condition.text ? conditionData[this.action.targetCondition].text : 'The target is inflicted with ' + this.action.targetCondition + '.';
                drawTextMultiline(conditionText, 25, 245);
            }
        }
        else {
            drawTextMultiline('The attack missed!', 25, 245);
        }
    }
    else if (this.action.inspect) {
        drawTextMultiline(enemies[0].inspectText, 25, 245);
    }
};

function EnemyScene(combatant) {
    Scene.call(this);
    this.combatant = combatant
    this.updateConditions(this.combatant);
    if (Math.random() < 0.6) {
        action = 'enemy_cutlass';
    }
    else {
        action = 'bone_claw';
    }
    this.action = buildAction(action, this.combatant, party[0]);
    var results = this.action.execute();
    this.hit = results.hit;
    this.crit = results.crit;
    this.damage = this.action.calculateDamage(this.crit);
    this.combatant.time += this.action.time;
    this.messageTimer = FPS * 0.5;
}

EnemyScene.prototype = Object.create(Scene.prototype);

EnemyScene.prototype.updateConditions = function(target) {
    target.conditions.forEach(function(condition, i) {
        condition.time--;
        if (condition.time <= 0) {
            condition.end();
            target.conditions.splice(i, 1);
        }
        else {
            condition.turnTick();
        }
    });
};

EnemyScene.prototype.update = function() {
    if (this.messageTimer > 0) {
        this.messageTimer--;
    }
    else if (triggerKeyState.enter || triggerKeyState.z) {
        scene = party[0].health <= 0 ? new DeathScene() : new QueueScene();
        playSound('beep0', 0.5);
    }
    Scene.prototype.update.call(this);
};

EnemyScene.prototype.draw = function() {
    Scene.prototype.draw.call(this);
    drawRect(10, 195, 475, 130, 'white', true);
    drawTextMultiline(this.action.text, 25, 220);
    if (Math.abs(this.damage) > 0) {
        if (this.hit) {
            var critText = this.crit ? ' A critical hit!!' : '';
            drawTextMultiline('It dealt ' + this.damage + ' damage!' + critText, 25, 245);
        }
        else {
            drawTextMultiline('The attack missed!', 25, 245);
        }
    }
};

function VictoryScene() {
    Scene.call(this);
};

VictoryScene.prototype = Object.create(Scene.prototype);

VictoryScene.prototype.draw = function() {
    Scene.prototype.draw.call(this);
    drawText('You are victorious!', 240, 150);
};

function DeathScene() {
    Scene.call(this);
};

DeathScene.prototype = Object.create(Scene.prototype);

DeathScene.prototype.draw = function() {
    Scene.prototype.draw.call(this);
    drawText('You have been defeated!', 200, 150);
};

function configureScenario() {
    configureItems();
    scene = new QueueScene();
}
