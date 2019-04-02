function buildCombatant(data) {
    var combatant = Object.assign({}, data);
    combatant.damageMod = combatant.damageMod || 0;
    combatant.conditions = [];
    return combatant;
}

var heroes = {
    slayer: {
        name: 'SLAYER',
        health: 50,
        maxHealth: 50,
        resourceName: 'SOULS',
        resource: 1,
        resourceMax: 3,
        accuracy: 0.8,
        defenses: { laceration: 5 },
        evasion: 0.3,
        agility: 20,
        time: 0,
        critChance: 0.05,
        skillName: 'Tactics',
        magicName: 'Shamanism',
        skills: [
            { action: 'inspect' },
            { action: 'vengeful_roast', spell: true },
            { action: 'spirit_binding', spell: true },
        ],
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
        health: 80,
        maxHealth: 80,
        resourceName: 'FAVOR',
        resource: 12,
        accuracy: 0.6,
        defenses: { concussion: 5, laceration: 10, penetration: 2 },
        evasion: 0.1,
        agility: 10,
        time: 0,
        critChance: 0.01,
        skillName: 'Chivalry',
        magicName: 'Theurgy',
        skills: [
            { action: 'protect' },
            { action: 'blessed_restoration', spell: true },
            { action: 'renounce_evil', spell: true },
            { action: 'smite', spell: true },
        ],
        items: [
            { item: 'warhammer', durability: 80, equipped: true },
            { item: 'bandage', quantity: 5 },
        ],
    },
    charlatan: {
        name: 'CHARLATAN',
        health: 30,
        maxHealth: 30,
        resourceName: 'KARMA',
        resource: 8,
        accuracy: 0.85,
        defenses: { laceration: 2 },
        evasion: 0.3,
        agility: 25,
        time: 0,
        critChance: 0.08,
        skillName: 'Tricks',
        magicName: 'Fortune',
        skills: [
            { action: 'gambit' },
            { action: 'dodge' },
            { action: 'loaded_die', spell: true },
            { action: 'four_winds', spell: true },
            { action: 'red_dragon', spell: true },
        ],
        items: [
            { item: 'knife', durability: 15, equipped: true },
            { item: 'venom_cask', quantity: 3 },
            { item: 'ointment', quantity: 1 },
        ]
    },
    mage: {
        name: 'MAGE',
        health: 20,
        maxHealth: 20,
        resourceName: 'ÆTHER',
        resource: 64,
        resourceMax: 64,
        accuracy: 0.6,
        defenses: { concussion: 2, laceration: 3 },
        evasion: 0.2,
        agility: 8,
        time: 0,
        critChance: 0.06,
        skillName: 'Gloss',
        magicName: 'Arcana',
        skills: [
            { action: 'fulmination' },
            { action: 'pestilence', spell: true },
            { action: 'abjuration', spell: true },
            { action: 'vim', spell: true },
            { action: 'vigor', spell: true },
        ],
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
        health: 30,
        maxHealth: 30,
        accuracy: 0.8,
        defenses: { laceration: 6, penetration: 8, concussion: -1, incineration: 2, radiation: -8 },
        resistances: { physical: 0.4, mental: 0.05, silver: 0 },
        evasion: 0.1,
        agility: 5,
        time: 0,
        critChance: 0.01,
        inspectText: 'It is a skeleton, the clattering remains \nof a dead human. Susceptible to \nconcussive force.',
    },
};

var currentHeroes = [heroes.slayer, heroes.knight, heroes.charlatan, heroes.mage];
var currentEnemies = [monsters.skeleton, monsters.skeleton];

var party = currentHeroes.map(x => buildCombatant(x));
var enemies = currentEnemies.map(x => buildCombatant(x));
