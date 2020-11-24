function Class(data) {
    this.data = data;
}

const classData = {
    slayer: {
        prestige: true,
        resourceName: 'SOULS',
        resource: 1,
        resourceMax: 3,
        skillName: 'Tactics',
        magicName: 'Shamanism',
        traits: [
            'soul_harvest',
        ],
        skills: [
            { action: 'inspect' },
            { action: 'vengeful_roast', spell: true },
            { action: 'spirit_binding', spell: true },
        ],
    },
    knight: {
        prestige: true,
        resourceName: 'FAVOR',
        resource: 12,
        skillName: 'Chivalry',
        magicName: 'Theurgy',
        skills: [
            { action: 'protect' },
            { action: 'blessed_restoration', spell: true },
            { action: 'renounce_evil', spell: true },
            { action: 'smite', spell: true },
        ],
    },
    charlatan: {
        prestige: true,
        resourceName: 'KARMA',
        resource: 8,
        skillName: 'Tricks',
        magicName: 'Fortune',
        skills: [
            { action: 'gambit' },
            { action: 'dodge' },
            { action: 'loaded_die', spell: true },
            { action: 'four_winds', spell: true },
            { action: 'red_dragon', spell: true },
        ],
    },
    mage: {
        prestige: true,
        resourceName: 'ÆTHER',
        resource: 64,
        resourceMax: 64,
        skillName: 'Gloss',
        magicName: 'Arcana',
        skills: [
            { action: 'fulmination' },
            { action: 'combustion', spell: true },
            { action: 'pestilence', spell: true },
            { action: 'abjuration', spell: true },
            { action: 'vim', spell: true },
            { action: 'vigor', spell: true },
            { action: 'psychic_abyss', spell: true },
        ],
    },
};

function buildClass(name) {
    const data = classData[name];
    return new Class(data);
}
