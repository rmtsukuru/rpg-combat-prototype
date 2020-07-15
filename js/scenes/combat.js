var queue = party.concat(enemies);

function QueueScene() {
    CombatScene.call(this);
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

QueueScene.prototype = Object.create(CombatScene.prototype);

QueueScene.prototype.handleEnemy = function(enemy) {
    var action = enemy.actions[Math.floor(enemy.actions.length * Math.random())];
    var target = pickRandomTarget(party);
    var options = {};
    scene = new ActionScene(enemy, target, action, options);
};

QueueScene.prototype.update = function() {
    var next = queue[0];
    if (party.includes(next)) {
        scene = new MenuScene(queue[0]);
    }
    else if (enemies.includes(next)) {
        this.handleEnemy(next);
    }
    CombatScene.prototype.update.call(this);
};

function ActionScene(combatant, target, action, options) {
    CombatScene.call(this);
    this.combatant = combatant;
    if (options.item) {
        this.item = options.item;
    }
    this.remainingTargets = options.remainingTargets || [];
    this.action = buildAction(action, this.combatant, target);
    var results = this.action.execute();
    this.hit = results.hit;
    this.crit = results.crit;
    this.damage = this.action.calculateDamage(this.crit);
    if (action === 'pistol') {
        shakeScreen();
    }
    if (this.crit) {
        flashScreen('#fff');
    }

    // For handling multi-target actions; don't apply costs multiple times for the same action.
    if (!options.secondaryTarget) {
        this.combatant.time += this.action.time;
        this.combatant.resource -= this.action.cost;
        this.updateConditions(this.combatant);
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
    }
    this.messageTimer = FPS * 0.5;
}

ActionScene.prototype = Object.create(CombatScene.prototype);

ActionScene.prototype.updateConditions = function(target) {
    target.conditions.forEach(function(condition, i) {
        condition.time--;
        if (condition.time <= 0) {
            condition.end();
            target.conditions.splice(i, 1);
        } else {
            condition.turnTick();
        }
    });
};

ActionScene.prototype.update = function() {
    if (this.messageTimer > 0) {
        this.messageTimer--;
    }
    else if (triggerKeyState.enter || triggerKeyState.z) {
        if (this.remainingTargets.length > 0) {
            nextTarget = this.remainingTargets.splice(0, 1)[0];
            options = {
                secondaryTarget: true,
                remainingTargets: this.remainingTargets,
                item: this.item,
            };
            scene = new ActionScene(this.combatant, nextTarget, this.action.name, options);
        }
        else {
            var enemiesRemaining = enemies.filter(function(enemy) { return enemy.health > 0; });
            if (party[0].health <= 0) {
                scene = new DeathScene();
            }
            else if (enemiesRemaining.length <= 0) {
                scene = new VictoryScene();
            }
            else {
                scene = new QueueScene();
            }
        }
        playSound('beep0', 0.5);
    }
    CombatScene.prototype.update.call(this);
};

ActionScene.prototype.drawMessageWindow = function(x, y, width, height) {
    name = this.action.target.name;
    drawRect(x, y, width, height, 'white', true);
    drawTextMultiline(this.action.text, x + 15, y + 25);
    if (Math.abs(this.damage) > 0 || this.action.isAttack) {
        if (this.hit) {
            var conditionHeight = y + 50;
            if (Math.abs(this.action.baseDamage) > 0) {
                if (this.damage >= 0) {
                    var critText = this.crit ? ' Critical hit!!' : '';
                    drawTextMultiline(name + ' takes ' + this.damage + ' damage!' + critText, x + 15, y + 50);
                }
                else {
                    drawTextMultiline(name + ' is healed for ' + Math.abs(this.damage) + ' damage!', x + 15, y + 50);
                }
                conditionHeight += 25;
            }
            if (this.action.inflictedCondition) {
                var condition = conditionData[this.action.targetCondition];
                var conditionText = condition.text ? conditionData[this.action.targetCondition].text : ' is inflicted with ' + this.action.targetCondition + '.';
                drawTextMultiline(name + conditionText, x + 15, conditionHeight);
            } else if (this.action.stunned) {
                drawTextMultiline(name + ' is stunned.', x + 15, conditionHeight);
            }
        }
        else {
            drawTextMultiline('The attack missed ' + name + '!', x + 15, y + 50);
        }
    }
    else if (this.action.inspect) {
        drawTextMultiline(this.action.target.inspectText, x + 15, y + 50);
    }
};

ActionScene.prototype.draw = function() {
    CombatScene.prototype.draw.call(this);
    this.drawCombatantStatus(this.combatant, 10, 215);
    if (this.action.target) {
        this.drawCombatantStatus(this.action.target, 480, 215);
    }
    this.drawMessageWindow(10, 360, 620, 110);
};

function VictoryScene() {
    CombatScene.call(this);
};

VictoryScene.prototype = Object.create(CombatScene.prototype);

VictoryScene.prototype.update = function() {
    if (triggerKeyState.enter || triggerKeyState.z) {
        scene = new ExplorationScene();
    }
    CombatScene.prototype.update.call(this);
};

VictoryScene.prototype.draw = function() {
    CombatScene.prototype.draw.call(this);
    drawText('You are victorious!', 240, 380);
};

function DeathScene() {
    CombatScene.call(this);
};

DeathScene.prototype = Object.create(CombatScene.prototype);

DeathScene.prototype.draw = function() {
    CombatScene.prototype.draw.call(this);
    drawText('You have been defeated!', 200, 150);
};
