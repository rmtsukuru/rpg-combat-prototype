const CRIT_MULTIPLIER = 2;

function Action(actor, target, stats) {
    stats = stats || {};
    this.actor = actor;
    this.target = stats.target == 'self' ? this.actor : target;
    this.time = stats.time || 5;
    this.cost = stats.cost || 0;
    this.damage = stats.damage || 0;
    this.isAttack = stats.damage > 0;
    if (this.damage > 0) {
        var damageType = stats.damageType || 'pure';
        var defense = this.target.defenses[damageType] || 0;
        this.damage = Math.max(0, this.damage - defense);
    }
    hitChanceMod = stats.hitChance || 0;
    this.hitChance = this.actor.accuracy - this.target.evasion + hitChanceMod;
    critChanceMod = stats.critChance || 0;
    this.critChance = this.actor.critChance + critChanceMod;
    this.text = stats.text;
    this.selfCondition = stats.selfCondition;
    this.targetCondition = stats.targetCondition;
    this.conditionResistance = stats.conditionResistance || null;
    this.inspect = stats.inspect;
    this.reload = stats.reload;
    this.equip = stats.equip;
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
        if (this.target.health <= 0) {
            this.target.time = 0;
        }
    }
    if (this.selfCondition) {
        var condition = buildCondition(this.selfCondition, this.actor);
        this.actor.conditions.push(condition);
        condition.start();
    }
    if (this.targetCondition && hit) {
        var options = {};
        if (this.conditionResistance) {
            options.resistance = this.conditionResistance;
        }
        var condition = buildCondition(this.targetCondition, this.target, options);
        condition.execute();
        if (!condition.resisted) {
            var count = this.target.conditions.filter(function(x) { return x.name == condition.name; }).length;
            if (count < condition.stackMax) {
                this.target.conditions.push(condition);
                condition.start();
                this.inflictedCondition = true;
            }
        }
    }
    return { hit: hit, crit: crit };
};

const actionData = {
    sword: { title: 'Straight Sword', text: 'You swing the sword.', damage: 12, damageType: 'laceration', time: 3 },
    knife: { title: 'Knife', text: 'You cut with the knife.', damage: 8, damageType: 'laceration', critChance: 0.1, targetCondition: 'bleed', conditionResistance: 'physical', time: 2 },
    hammer: { title: 'Warhammer', text: 'You pound with the hammer.', damage: 15, damageType: 'concussion', hitChance: -0.1, time: 6 },
    cutlass: { title: 'Cutlass', text: 'You slice with the cutlass.', damage: 10, damageType: 'laceration', critChance: 0.1, targetCondition: 'bleed', conditionResistance: 'physical', time: 4 },
    pistol: { title: 'Pistol', text: 'You fire a shot.', damage: 10, damageType: 'penetration', critChance: 0.2, time: 2 },
    bone_claw: { text: 'The fiend rakes you with its claw!', damage: 18, damageType: 'laceration', time: 8 },
    enemy_cutlass: { text: 'The fiend swings its cutlass at you!', damage: 10, damageType: 'laceration', critChance: 0.1, time: 5 },
    dodge: { title: 'Dodge', text: 'You attempt to dodge incoming attacks.', selfCondition: 'dodge', time: 5 },
    trip: { text: 'You knock the enemy down, exposing it to\nattack.', targetCondition: 'prone', hitChance: 0.4, time: 3 },
    inspect: { title: 'Inspect', text: 'You inspect the enemy.', inspect: true, time: 3 },
    scalding_strike: { title: 'Scalding Strike', text: 'You slash with a blade wreathed in flames.', cost: 1, damage: 20, damageType: 'incineration', hitChance: 0.2, critChance: 0.3, time: 10 },
    smite: { title: 'Smite Evil', text: 'You unleash purifying light.', damage: 15, damageType: 'radiation', hitChance: 0.4, critChance: 0.1, time: 8 },
    spirit_binding: { title: 'Spirit Binding', text: 'You utter words of binding.', cost: 1, damage: 5, hitChance: 0.2, targetCondition: 'binding', conditionResistance: 'mental', time: 7 },
    loaded_die: {title: 'Loaded Die', text: 'You improve your accuracy.', cost: 1, selfCondition: 'aim', time: 2 },
    ointment: { title: 'Ointment', text: 'You apply the ointment to your wounds.', damage: -10, hitChance: 2, critChance: -2, target: 'self' },
    bullet: { text: 'You reload the pistol.', time: 10, reload: true, target: 'self' },
    equip: { text: 'You change gear.', time: 6, target: 'self', equip: true },
};

function buildAction(actionName, actor, target) {
    return new Action(actor, target, actionData[actionName]);
}
