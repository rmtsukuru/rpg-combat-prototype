const itemData = {
    straight_sword: { title: 'Straightsword', action: 'sword', maxDurability: 50, equipment: 'weapon' },
    knife: { title: 'Knife', action: 'knife', maxDurability: 15, equipment: 'weapon' },
    warhammer: { title: 'Warhammer', action: 'hammer', maxDurability: 80, equipment: 'weapon' },
    cutlass: { title: 'Cutlass', action: 'cutlass', maxDurability: 20, equipment: 'weapon' },
    staff: { title: 'Quarterstaff', action: 'staff', maxDurability: 30, equipment: 'weapon' },
    pistol: { title: 'Pistol', action: 'pistol', maxAmmo: 1, equipment: 'secondary_weapon' },
    bullets: { title: 'Silver Bullets', action: 'bullet' },
    ointment: { title: 'Ointment', action: 'ointment' },
    jaegerbrau: { title: 'Jägerbrau', action: 'jaegerbrau' },
};

function buildItem(menuItem) {
    var item = Object.assign({}, itemData[menuItem.item], menuItem);
    item.item = menuItem;
    if (item.equipment && !item.equipped) {
        item.action = 'equip';
    }
    return item;
}

function configureItems() {
}
