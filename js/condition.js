function Condition(target, stats, options) {
    this.target = target;
    this.resistance = options.resistance ? target.resistances[options.resistance] : null;
    this.duration = stats.duration || 1;
    this.time = this.duration;
    this.onStart = stats.onStart || function() {};
    this.onEnd = stats.onEnd || function() {};
    this.onTimeTick = stats.onTimeTick || function() {};
    this.onTurnTick = stats.onTurnTick || function() {};
}

Condition.prototype.resist = function() {
    if (this.resistance) {
        return Math.random() < this.resistance;
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
    dodge: { duration: 1, onStart: function(x) { x.evasion += 0.3; }, onEnd: function(x) { x.evasion -= 0.3; } },
    aim: { duration: 3, onStart: function(x) { x.critChance += 0.3; }, onEnd: function(x) { x.critChance -= 0.3; } },
    prone: { duration: 3, onStart: function(x) { x.evasion -= 0.3; }, onEnd: function(x) { x.evasion += 0.3; } },
    binding: { duration: 2, onStart: function(x) { x.hitChance -= 0.5; }, onEnd: function(x) { x.hitChance += 0.5; } },
    bleed: { text: 'The target is bleeding.', duration: 5, onTurnTick: function(x) { x.health -= 5; } },
    poison: { text: 'The target was poisoned.', duration: 2, onTimeTick: function(x) { x.health -= 1; } },
};

function buildCondition(conditionName, target, options) {
    options = options || {};
    return new Condition(target, conditionData[conditionName], options);
}
