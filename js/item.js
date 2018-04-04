const itemData = {
    straight_sword: { title: 'Straight Sword', action: 'sword', maxDurability: 80, equipment: 'weapon' },
    pistol: { title: 'Pistol', action: 'pistol', maxAmmo: 1, equipment: 'secondary_weapon' },
    ointment: { title: 'Ointment', action: 'ointment' },
    bullets: { title: 'Bullets', action: 'bullet' },
    cutlass: { title: 'Cutlass', action: 'cutlass', maxDurability: 20, equipment: 'weapon' },
};

function buildItem(menuItem) {
    var item = Object.assign({}, itemData[menuItem.item], menuItem);
    item.item = menuItem;
    if (item.equipment && !item.equipped) {
        item.action = 'equip';
    }
    return item;
}
