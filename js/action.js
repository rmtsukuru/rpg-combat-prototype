const CRIT_MULTIPLIER = 2;

function Action(actor, target, stats) {
    stats = stats || {};
    this.actor = actor;
    this.target = target;
    this.damage = stats.damage;
    hitChanceMod = stats.hitChance || 0;
    this.hitChance = this.actor.accuracy - this.target.evasion + hitChanceMod;
    critChanceMod = stats.critChance || 0;
    this.critChance = this.actor.critChance + critChanceMod;
    this.text = stats.text;
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
    return { hit: hit, crit: crit };
};

const actionData = {
    sword: { text: 'You swing the sword.', damage: 12 },
    pistol: { text: 'You fire a shot.', damage: 10, critChance: 0.2 },
    bone_claw: { text: 'The fiend rakes you with its claw!', damage: 18 },
};

function buildAction(actionName, actor, target) {
    return new Action(actor, target, actionData[actionName]);
}
