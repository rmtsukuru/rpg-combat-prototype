const traitData = {
    soul_harvest: { title: 'Soul Harvest', onKill: (x, target) => { x.resource = Math.min(x.resource + 1, x.resourceMax); } },
};

function buildTrait(name) {
    trait = { 
        onKill: () => {},
        ...traitData[name],
        name,
    };
    return trait;
}
