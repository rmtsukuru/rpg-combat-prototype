var queue = party.concat(enemies);

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

QueueScene.prototype.handleEnemy = function(enemy) {
    var action = Math.random() < 0.6 ? 'enemy_cutlass' : 'bone_claw';
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
    Scene.prototype.update.call(this);
};

function ActionScene(combatant, target, action, options) {
    Scene.call(this);
    this.combatant = combatant;
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
        if (party[0].health <= 0) {
            scene = new DeathScene();
        }
        else if (enemiesRemaining.length <= 0) {
            scene = new VictoryScene();
        }
        else {
            scene = new QueueScene();
        }
        playSound('beep0', 0.5);
    }
    Scene.prototype.update.call(this);
};

ActionScene.prototype.draw = function() {
    Scene.prototype.draw.call(this);
    drawRect(10, 195, 475, 130, 'white', true);
    drawTextMultiline(this.action.text, 25, 220);
    if (Math.abs(this.damage) > 0 || this.action.isAttack) {
        if (this.hit) {
            var conditionHeight = 245;
            if (Math.abs(this.action.baseDamage) > 0) {
                if (this.damage >= 0) {
                    var critText = this.crit ? ' A critical hit!!' : '';
                    drawTextMultiline('It dealt ' + this.damage + ' damage!' + critText, 25, 245);
                }
                else {
                    drawTextMultiline('It healed ' + Math.abs(this.damage) + ' damage!', 25, 245);
                }
                conditionHeight += 25;
            }
            if (this.action.inflictedCondition) {
                var condition = conditionData[this.action.targetCondition];
                var conditionText = condition.text ? conditionData[this.action.targetCondition].text : 'The target is inflicted with ' + this.action.targetCondition + '.';
                drawTextMultiline(conditionText, 25, conditionHeight);
            } else if (this.action.stunned) {
                drawTextMultiline('The target is stunned.', 25, conditionHeight);
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
