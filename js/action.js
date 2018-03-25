const CRIT_MULTIPLIER = 2;

function Action(actor, target, stats) {
    stats = stats || {};
    this.actor = actor;
    this.target = target;
    this.time = stats.time || 5;
    this.cost = stats.cost || 0;
    this.damage = stats.damage || 0;
    hitChanceMod = stats.hitChance || 0;
    this.hitChance = this.actor.accuracy - this.target.evasion + hitChanceMod;
    critChanceMod = stats.critChance || 0;
    this.critChance = this.actor.critChance + critChanceMod;
    this.text = stats.text;
    this.selfCondition = stats.selfCondition;
    this.targetCondition = stats.targetCondition;
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
    if (this.targetCondition && hit) {
        var condition = buildCondition(this.targetCondition, this.target);
        this.target.conditions.push(condition);
        condition.start();
    }
    return { hit: hit, crit: crit };
};

const actionData = {
    sword: { title: 'Straight Sword', text: 'You swing the sword.', damage: 12, time: 3 },
    pistol: { title: 'Pistol', text: 'You fire a shot.', damage: 10, critChance: 0.2, time: 2 },
    bone_claw: { text: 'The fiend rakes you with its claw!', damage: 18, time: 8 },
    cutlass: { text: 'The fiend swings its cutlass at you!', damage: 10, critChance: 0.1, time: 5 },
    dodge: { text: 'You attempt to dodge incoming attacks.', selfCondition: 'dodge', time: 5 },
    trip: { text: 'You knock the enemy down, exposing it to\nattack.', targetCondition: 'prone', hitChance: 0.4, time: 3 },
    scalding_strike: { title: 'Scalding Strike', text: 'You slash with a blade wreathed in flames.', cost: 1, damage: 20, hitChance: 0.2, critChance: 0.3, time: 10 },
    spirit_binding: { title: 'Spirit Binding', text: 'You utter words of binding.', cost: 1, damage: 5, hitChance: 0.2, targetCondition: 'binding', time: 7 },
};

function buildAction(actionName, actor, target) {
    return new Action(actor, target, actionData[actionName]);
}
