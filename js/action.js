function Action(actor, target, stats) {
    stats = stats || {};
    this.actor = actor;
    this.target = target;
    this.damage = stats.damage;
    hitChanceMod = stats.hitChance || 0;
    this.hitChance = this.actor.accuracy - this.target.evasion + hitChanceMod;
    this.text = stats.text;
}

Action.prototype.hit = function() {
    return Math.random() < this.hitChance;
};

Action.prototype.execute = function() {
    var hit = this.hit();
    if (hit) {
        var newHealth = this.target.health - this.damage;
        this.target.health = Math.max(0, Math.min(this.target.maxHealth, newHealth));
    }
    return hit;
}

const actionData = {
    melee: { text: 'You swing the sword.', damage: 12 },
    ranged: { text: 'You fire a shot.', damage: 10 },
};

function buildAction(actionName, actor, target) {
    return new Action(actor, target, actionData[actionName]);
}
