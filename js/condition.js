function Condition(target, stats) {
    this.target = target;
    this.duration = stats.duration || 1;
    this.time = this.duration;
    this.onStart = stats.onStart || function() {};
    this.onEnd = stats.onEnd || function() {};
}

Condition.prototype.start = function() {
    this.onStart(this.target);
};

Condition.prototype.end = function() {
    this.onEnd(this.target);
};

const conditionData = {
    dodge: { duration: 1, onStart: function(x) { x.evasion += 0.3; }, onEnd: function(x) { x.evasion -= 0.3; } },
    aim: { duration: 3, onStart: function(x) { x.critChance += 0.3; }, onEnd: function(x) { x.critChance -= 0.3; } },
    prone: { duration: 3, onStart: function(x) { x.evasion -= 0.3; }, onEnd: function(x) { x.evasion += 0.3; } },
    binding: { duration: 2, onStart: function(x) { x.hitChance -= 0.5; }, onEnd: function(x) { x.hitChance += 0.5; } },
};

function buildCondition(conditionName, target) {
    return new Condition(target, conditionData[conditionName]);
}
