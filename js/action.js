const CRIT_MULTIPLIER = 2;

function Action(actor, target, stats) {
    stats = stats || {};
    this.actor = actor;
    this.target = target;
    this.time = stats.time || 5;
    this.damage = stats.damage || 0;
    hitChanceMod = stats.hitChance || 0;
    this.hitChance = this.actor.accuracy - this.target.evasion + hitChanceMod;
    critChanceMod = stats.critChance || 0;
    this.critChance = this.actor.critChance + critChanceMod;
    this.text = stats.text;
    this.selfCondition = stats.selfCondition;
}

Action.prototype.hit = function() {
    return Math.random() < this.hitChance;
};

Action.prototype.crit = function() {
    return Math.random() < this.critChance;
};

Action.prototype.calculateDamage = function(crit) {
    return crit ? this.damage * CRIT_MULTIPLIER : this.damage;
};

Action.prototype.execute = function() {
    var hit = this.hit();
    var crit = this.crit();
    if (hit) {
        var newHealth = this.target.health - this.calculateDamage(crit);
        this.target.health = Math.max(0, Math.min(this.target.maxHealth, newHealth));
    }
    if (this.selfCondition) {
        var condition = buildCondition(this.selfCondition, this.actor);
        this.actor.conditions.push(condition);
        condition.start();
    }
    return { hit: hit, crit: crit };
};

const actionData = {
    sword: { text: 'You swing the sword.', damage: 12, time: 3 },
    pistol: { text: 'You fire a shot.', damage: 10, critChance: 0.2, time: 2 },
    bone_claw: { text: 'The fiend rakes you with its claw!', damage: 18, time: 8 },
    cutlass: { text: 'The fiend swings its cutlass at you!', damage: 10, critChance: 0.1, time: 5 },
    dodge: { text: 'You attempt to dodge incoming attacks.', selfCondition: 'dodge', time: 5 },
};

function buildAction(actionName, actor, target) {
    return new Action(actor, target, actionData[actionName]);
}
