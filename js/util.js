function pluralize(number, word) {
    var nonPlurals = ['KARMA'];
    var displayWord = word;
    if (number == 1 || nonPlurals.includes(word)) {
        displayWord = displayWord.replace(/S$/, '');
    }
    return number + ' ' + displayWord;
}

function formatPercent(number, digits) {
    digits = digits || 0;
    return (number * 100).toFixed(digits) + '%';
}

function hasCondition(target, condition) {
    if (!target.conditions) {
        return false;
    }
    return target.conditions.filter(x => x.name == condition).length > 0;
}

function pickRandomTarget(targets) {
    var validTargets = targets.filter(member => !hasCondition(member, 'protected'));
    return validTargets[Math.round(Math.random() * (validTargets.length - 1))];
}

function trueHit(hitChance) {
    return (Math.random() + Math.random()) / 2 < hitChance;
}

function numToAlpha(x) {
    return String.fromCharCode('A'.charCodeAt(0) + x);
}

function percentToHex(x, digits) {
    digits = digits || 2;
    const hexValue = 16 ** digits - 1;
    return Math.round(x * hexValue).toString(16);
}

// Diagonals are counted for double, and impassable terrain is ignored.
// Additional helper functions can be added to expand this later.
function getGridDistance(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
