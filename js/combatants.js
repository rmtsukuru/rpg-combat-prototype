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
        conditions: [],
        skills: [
            { title: 'Trip', action: 'trip' },
            { title: 'Dodge', action: 'dodge' },
            { action: 'inspect' },
            { action: 'scalding_strike', spell: true },
            { action: 'spirit_binding', spell: true },
        ],
        items: [
            { item: 'straight_sword', durability: 50, equipped: true },
            { item: 'pistol', ammo: 1, equipped: true },
            { item: 'ointment', quantity: 1 },
            { item: 'bullets', quantity: 12 },
            { item: 'cutlass', durability: 20 },
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
        conditions: [],
        skills: [
            { action: 'inspect' },
            { action: 'smite', spell: true },
        ],
        items: [
            { item: 'warhammer', durability: 80, equipped: true },
            { item: 'ointment', quantity: 3 },
        ],
    },
};

var monsters = {
    skeleton: {
        name: 'SKELETON',
        title: 'Skeleton',
        health: 30,
        maxHealth: 30,
        accuracy: 0.8,
        defenses: { laceration: 6, penetration: 8, concussion: -1, incineration: 2, radiation: -8 },
        resistances: { physical: 0.4, mental: 0.05 },
        evasion: 0.1,
        agility: 5,
        time: 0,
        critChance: 0.01,
        conditions: [],
        inspectText: 'It is a skeleton, the clattering remains \nof a dead human. Susceptible to \nconcussive force.',
    },
};

var party = [heroes.slayer, heroes.knight];
var enemies = [monsters.skeleton, Object.assign({}, monsters.skeleton)];
