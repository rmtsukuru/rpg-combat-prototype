const combatantNames = {};

function Combatant(data) {
    Object.assign(this, data);
    if (data.class) {
        this.class = buildClass(data.class);
        Object.assign(this, this.class.data);
    }
    this.damageMod = this.damageMod || 0;
    this.traits = (this.traits || []).map(x => buildTrait(x));
    this.conditions = [];
    this.time = 0;
    this.speed = data.speed || 5;
    this.behavior = new Behavior(this, behaviorData[data.behavior] || behaviorData.dumb_brute);
    // TODO refactor this to work for all combatants at some point
    if (data.actions && this.isEnemy) {
        this.actions = data.actions.map(action => buildAction(action, this));
    }
    if (!this.isEnemy) {
        this.icon = this.name[0];
    }
}

Combatant.prototype.getMoveTime = function() {
    return Math.floor((30 - this.agility) / 3.5) + 1;
};

function buildCombatant(name, position, isEnemy) {
    var data = isEnemy ? monsters[name] : heroes[name];
    data.x = position.x;
    data.y = position.y;
    var combatant = new Combatant({ ...data, isEnemy: !!isEnemy });
    if (combatantNames[combatant.name]) {
        if (typeof combatantNames[combatant.name] == 'object') {
            combatantNames[combatant.name].name += ' A';
            combatantNames[combatant.name] = 1;
        }
        combatantNames[combatant.name]++;
        combatant.name += ' ' + numToAlpha(combatantNames[combatant.name] - 1);
    }
    else {
        combatantNames[combatant.name] = combatant;
    }
    return combatant;
}

var heroes = {
    slayer: {
        name: 'SLAYER',
        class: 'slayer',
        health: 50,
        maxHealth: 50,
        accuracy: 0.85,
        defenses: { laceration: 5 },
        evasion: 0.3,
        agility: 20,
        speed: 8,
        critChance: 0.05,
        items: [
            { item: 'straight_sword', durability: 50, equipped: true },
            { item: 'pistol', ammo: 1, equipped: true },
            { item: 'ointment', quantity: 5 },
            { item: 'bullets', quantity: 3 },
            { item: 'jaegerbrau', quantity: 1 },
        ]
    },
    knight: {
        name: 'KNIGHT',
        class: 'knight',
        health: 80,
        maxHealth: 80,
        accuracy: 0.65,
        defenses: { concussion: 5, laceration: 10, penetration: 2 },
        evasion: 0.1,
        agility: 10,
        speed: 6,
        critChance: 0.01,
        items: [
            { item: 'warhammer', durability: 80, equipped: true },
            { item: 'bandage', quantity: 5 },
        ],
    },
    charlatan: {
        name: 'CHARLATAN',
        class: 'charlatan',
        health: 30,
        maxHealth: 30,
        accuracy: 0.9,
        defenses: { laceration: 2 },
        evasion: 0.3,
        agility: 25,
        speed: 4,
        critChance: 0.08,
        items: [
            { item: 'knife', durability: 15, equipped: true },
            { item: 'venom_cask', quantity: 3 },
            { item: 'ointment', quantity: 1 },
        ]
    },
    mage: {
        name: 'MAGE',
        class: 'mage',
        health: 20,
        maxHealth: 20,
        accuracy: 0.6,
        defenses: { concussion: 2, laceration: 3 },
        evasion: 0.2,
        agility: 8,
        speed: 3,
        critChance: 0.06,
        items: [
            { item: 'staff', durability: 30, equipped: true },
            { item: 'healing_tincture', quantity: 3 },
            { item: 'disappearing_draught', quantity: 1 },
        ]
    },
};

var monsters = {
    skeleton: {
        name: 'SKELETON',
        icon: 'B',
        health: 30,
        maxHealth: 30,
        accuracy: 0.8,
        defenses: { laceration: 6, penetration: 8, concussion: -1, incineration: 2, radiation: -8 },
        resistances: { physical: 0.4, mental: 0.05, silver: 0 },
        evasion: 0.05,
        agility: 5,
        critChance: 0.01,
        actions: [
            'enemy_cutlass',
            'bone_claw',
        ],
        inspectText: 'It is a skeleton, the clattering remains \nof a dead human. Susceptible to \nconcussive force.',
    },
    bone_warden: {
        name: 'BONE WARDEN',
        icon: 'W',
        health: 50,
        maxHealth: 50,
        accuracy: 0.7,
        defenses: { laceration: 7, penetration: 8, incineration: 2, radiation: -8 },
        resistances: { physical: 0.6, mental: 0.05, silver: 0 },
        evasion: 0.1,
        agility: 4,
        critChance: 0.05,
        actions: [
            'bone_claw',
            'crushing_blow',
        ],
        inspectText: 'It is an armored skeleton. Durable and \nhard to hit.',
    },
};

var currentHeroes = [['slayer', {x: 15, y: 9}], ['knight', {x: 12, y: 6}], ['charlatan', {x: 18, y: 11}], ['mage', {x: 14, y: 14}]];
var currentEnemies = [['skeleton', {x: 12, y: 5}], ['skeleton', {x: 14, y: 5}], ['bone_warden', {x: 16, y: 7}]];

var party = currentHeroes.map(x => buildCombatant(x[0], x[1]));
var enemies = currentEnemies.map(x => buildCombatant(x[0], x[1], true));
