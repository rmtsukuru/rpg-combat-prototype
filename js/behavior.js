function Behavior(combatant, data) {
    this.combatant = combatant;
    this.key = data.key;
}

Behavior.prototype.fetchNextAction = function() {
    let action, target;
    if (this.key == 'dumb_brute') {
        target = getClosestTarget(this.combatant, party);
        const inRange = (target, action) =>
            getGridDistance(this.combatant, target) <= (action.range || 1);
        const attacks = this.combatant.actions.filter(x => x.isAttack && inRange(target, x));
        if (attacks.length >= 1) {
            // pick an attack at random for action
            action = attacks[Math.round(Math.random() * attacks.length)].name;
        }
        else {
            // move as close as possible to target
            action = 'move';
            const tiles = fetchMovableTiles(this.combatant).sort((a, b) => {
                const targetDistance = getGridDistance(target, a) - getGridDistance(target, b);
                if (targetDistance == 0) {
                    return getGridDistance(this.combatant, a) - getGridDistance(this.combatant, b);
                }
                return targetDistance;
            });
            target = tiles[0];
        }
    }
    return { action, target };
}

const behaviorData = {
    dumb_brute: {},
};

Object.entries(behaviorData).forEach(([key, value]) => behaviorData[key].key = key);
