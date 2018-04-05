const itemData = {
    straight_sword: { title: 'Straight Sword', action: 'sword', maxDurability: 50, equipment: 'weapon' },
    warhammer: { title: 'Warhammer', action: 'hammer', maxDurability: 80, equipment: 'weapon' },
    cutlass: { title: 'Cutlass', action: 'cutlass', maxDurability: 20, equipment: 'weapon' },
    pistol: { title: 'Pistol', action: 'pistol', maxAmmo: 1, equipment: 'secondary_weapon' },
    ointment: { title: 'Ointment', action: 'ointment' },
    bullets: { title: 'Bullets', action: 'bullet' },
};

function buildItem(menuItem) {
    var item = Object.assign({}, itemData[menuItem.item], menuItem);
    item.item = menuItem;
    if (item.equipment && !item.equipped) {
        item.action = 'equip';
    }
    return item;
}
