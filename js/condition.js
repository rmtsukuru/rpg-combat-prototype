function Condition(target, stats, options) {
    this.name = options.name;
    this.target = target;
    this.resistance = options.resistance ? target.resistances[options.resistance] : null;
    this.duration = stats.duration || 1;
    this.time = this.duration;
    this.onStart = stats.onStart || (() => {});
    this.onEnd = stats.onEnd || (() => {});
    this.onTimeTick = stats.onTimeTick || (() => {});
    this.onTurnTick = stats.onTurnTick || (() => {});
    this.stackMax = stats.stackMax || 1;
}

Condition.prototype.resist = function() {
    if (this.resistance) {
        return Math.random() > this.resistance;
    }
    return false;
};

Condition.prototype.execute = function() {
    this.resisted = this.resist();
};

Condition.prototype.start = function() {
    this.onStart(this.target);
};

Condition.prototype.end = function() {
    this.onEnd(this.target);
};

Condition.prototype.timeTick = function() {
    this.onTimeTick(this.target);
}

Condition.prototype.turnTick = function() {
    this.onTurnTick(this.target);
}

const conditionData = {
    dodge: { duration: 1, onStart: x => { x.evasion += 0.3; }, onEnd: x => { x.evasion -= 0.3; } },
    silver: { text: 'The target\'s defense was lowered.', duration: 2, onStart: x => { x.defenses.laceration -= 8; x.defenses.penetration -= 8; }, onEnd: x => { x.defenses.laceration += 8; x.defenses.penetration += 8; } },
    prone: { duration: 3, onStart: x => { x.evasion -= 0.3; }, onEnd: x => { x.evasion += 0.3; } },
    bleed: { text: 'The target is bleeding.', duration: 5, onTurnTick: x => { x.health -= 5; } },
    poison: { text: 'The target was poisoned.', duration: 2, onTimeTick: x => { x.health -= 2; } },
    jaegerbrau: { duration: 5, onStart: x => { x.evasion += 0.2; x.hitChance += 0.1; x.critChance += 0.2; }, onEnd: x => { x.evasion -= 0.2; x.hitChance -= 0.1; x.critChance -= 0.2; } },
    protected: { duration: 3 },
    aim: { duration: 3, onStart: x => { x.critChance += 0.3; }, onEnd: x => { x.critChance -= 0.3; } },
    four_winds: { duration: 2, onStart: x => { x.evasion += 0.1; }, onEnd: x => { x.evasion -= 0.1; }, stackMax: 4 },
    red_dragon: { duration: 1, onStart: x => { x.damageMod += 5; }, onEnd: x => { x.damageMod -= 5; }, stackMax: 4 },
    pestilence: { duration: 4, onStart: x => { x.hitChance -= 0.3; x.evasion -= 0.3 }, onEnd: x => { x.hitChance += 0.3; x.evasion += 0.3; } },
    vim: { duration: 5, onStart: x => { x.hitChance += 0.3; x.evasion += 0.2; }, onEnd: x => { x.hitChance -= 0.3; x.evasion -= 0.2; } },
    healing_tincture: { duration: 5, text: 'The target is being healed over time.', onTurnTick: x => { x.health += 3; } },
};

function buildCondition(conditionName, target, options) {
    options = options || {};
    options.name = conditionName;
    return new Condition(target, conditionData[conditionName], options);
}
