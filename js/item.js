const itemData = {
    straight_sword: { title: 'Straight Sword', action: 'sword', maxDurability: 80, equipment: true },
    pistol: { title: 'Pistol', action: 'pistol', maxAmmo: 1, equipment: true },
    ointment: { title: 'Ointment', action: 'ointment' },
    bullets: { title: 'Bullets', action: 'bullet' },
    cutlass: { title: 'Cutlass' },
};

function buildItem(menuItem) {
    return Object.assign({}, itemData[menuItem.item], menuItem);
}
