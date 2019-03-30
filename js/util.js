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
