const CRIT_MULTIPLIER = 2;

function Action(actor, target, stats) {
    stats = stats || {};
    this.actor = actor;
    this.target = stats.target == 'self' ? this.actor : target;
    this.time = stats.time || 5;
    this.cost = stats.cost || 0;
    this.baseDamage = stats.damage || 0;
    this.isAttack = stats.damage > 0 || (stats.targetCondition && stats.target != 'ally' && this.target != this.actor) || stats.stun;
    if (this.baseDamage < 0) {
        this.damage = this.baseDamage;
        this.hitChance = 1;
        this.critChance = 0;
    }
    else {
        if (this.baseDamage > 0) {
            var damageType = stats.damageType || 'pure';
            var defense = this.target.defenses[damageType] || 0;
            this.damage = Math.max(0, this.baseDamage - defense);
        }
        else {
            this.damage = 0;
        }
        hitChanceMod = stats.hitChance || 0;
        this.hitChance = this.actor.accuracy - this.target.evasion + hitChanceMod;
        critChanceMod = stats.critChance || 0;
        this.critChance = this.actor.critChance + critChanceMod;
    }
    this.text = stats.text;
    this.selfCondition = stats.selfCondition;
    this.stun = stats.stun;
    this.stunResistance = stats.stunResistance || null;
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
    if (this.targetCondition && (hit || !this.isAttack)) {
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
    if (this.stun && hit) {
        var resistance = 0;
        if (this.stunResistance) {
            resistance = this.target.resistances[this.stunResistance];
        }
        if (Math.random() > resistance) {
            this.stunned = true;
            this.target.time += this.stun;
        }
    }
    return { hit: hit, crit: crit };
};

const actionData = {
    sword: { title: 'Straightsword', text: 'You swing the sword.', damage: 12, damageType: 'laceration', time: 3 },
    knife: { title: 'Knife', text: 'You cut with the knife.', damage: 8, damageType: 'laceration', critChance: 0.1, targetCondition: 'bleed', conditionResistance: 'physical', time: 2 },
    hammer: { title: 'Warhammer', text: 'You pound with the hammer.', damage: 15, damageType: 'concussion', hitChance: -0.1, time: 12 },
    cutlass: { title: 'Cutlass', text: 'You slice with the cutlass.', damage: 10, damageType: 'laceration', critChance: 0.1, targetCondition: 'bleed', conditionResistance: 'physical', time: 4 },
    staff: { title: 'Quarterstaff', text: 'You swing the staff.', damage: 8, damageType: 'concussion', hitChance: -0.1, time: 8 },
    pistol: { title: 'Pistol', text: 'You fire a shot.', damage: 10, damageType: 'penetration', critChance: 0.2, targetCondition: 'silver', conditionResistance: 'silver', time: 2 },
    bone_claw: { text: 'The fiend rakes you with its claw!', damage: 18, damageType: 'laceration', time: 8 },
    enemy_cutlass: { text: 'The fiend swings its cutlass at you!', damage: 10, damageType: 'laceration', critChance: 0.1, time: 5 },
    trip: { text: 'You knock the enemy down, exposing it to\nattack.', targetCondition: 'prone', hitChance: 0.4, time: 3 },
    inspect: { title: 'Inspect', text: 'You inspect the enemy.', inspect: true, time: 3 },
    vengeful_roast: { title: 'Vengeful Roast', text: 'You stab with a blade wreathed in flames.', cost: 1, damage: 20, damageType: 'incineration', hitChance: 0.2, critChance: 0.3, time: 4 },
    spirit_binding: { title: 'Spirit Binding', text: 'You utter words of binding.', cost: 1, hitChance: 2, stun: 8, stunResistance: 'mental', time: 4 },
    protect: { title: 'Protect', text: 'You defend an ally with your shield.', target: 'ally', targetCondition: 'protected', time: 4 },
    blessed_restoration: { title: 'Blessed Restoration', text: 'You restore an ally\'s wounds.', damage: -30, target: 'ally', restriction: x => x.health / x.maxHealth <= 0.25, time: 14 },
    renounce_evil: { title: 'Renounce Evil', text: 'You utter a solumn oath.', hitChance: 2, stun: 5, stunResistance: 'mental', time: 2 },
    smite: { title: 'Smite', text: 'You unleash purifying light.', damage: 15, damageType: 'radiation', hitChance: 0.4, critChance: 0.1, time: 8 },
    dodge: { title: 'Dodge', text: 'You attempt to dodge incoming attacks.', selfCondition: 'dodge', time: 5 },
    loaded_die: {title: 'Loaded Die', text: 'You improve an ally\'s accuracy.', cost: 1, target: 'ally', targetCondition: 'aim', time: 3 },
    four_winds: {title: 'Four Winds', text: 'You slightly improve an ally\'s evasion.', cost: 5, target: 'ally', targetCondition: 'four_winds', time: 2 },
    fulmination: { title: 'Fulmination', text: 'You zap the enemy.', damage: 6, damageType: 'electrocution', hitChance: 0.3, critChance: 0.2, time: 3 },
    pestilence: { title: 'Pestilence', text: 'You summon noxious vapors.', cost: 7, damage: 0, hitChance: 0.4, targetCondition: 'pestilence', conditionResistance: 'physical', time: 8 },
    ointment: { title: 'Ointment', text: 'You apply ointment to the wound.', damage: -10, target: 'ally', time: 5 },
    bandage: { title: 'Bandage', text: 'You apply a bandage to the wound.', damage: -50, target: 'ally', time: 10 },
    bullet: { text: 'You reload the pistol.', time: 10, reload: true, target: 'self' },
    equip: { text: 'You change gear.', time: 6, target: 'self', equip: true },
    jaegerbrau: { text: 'You drink the hunter\'s brew.', target: 'self', damage: 3, hitChance: 2, selfCondition: 'jaegerbrau', time: 5 },
};

function buildAction(actionName, actor, target) {
    return new Action(actor, target, actionData[actionName]);
}
