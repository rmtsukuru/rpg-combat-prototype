const itemData = {
    straight_sword: { title: 'Straightsword', action: 'sword', maxDurability: 50, equipment: 'weapon' },
    knife: { title: 'Knife', action: 'knife', maxDurability: 15, equipment: 'weapon' },
    warhammer: { title: 'Warhammer', action: 'hammer', maxDurability: 80, equipment: 'weapon' },
    cutlass: { title: 'Cutlass', action: 'cutlass', maxDurability: 20, equipment: 'weapon' },
    staff: { title: 'Quarterstaff', action: 'staff', maxDurability: 30, equipment: 'weapon' },
    pistol: { title: 'Pistol', action: 'pistol', maxAmmo: 1, equipment: 'secondary_weapon' },
    bullets: { title: 'Silver Bullets', action: 'bullet' },
    ointment: { title: 'Ointment', action: 'ointment' },
    bandage: { title: 'Bandage', action: 'bandage' },
    jaegerbrau: { title: 'Jägerbrau', action: 'jaegerbrau' },
    venom_cask: { title: 'Venom Cask', action: 'venom_cask' },
    healing_tincture: { title: 'Healing Tincture', action: 'healing_tincture' },
    disappearing_draught: { title: 'Disappearing Draught', action: 'disappearing_draught' },
};

function buildItem(menuItem) {
    var item = Object.assign({}, itemData[menuItem.item], menuItem);
    item.item = menuItem;
    if (item.equipment && !item.equipped) {
        item.action = 'equip';
    }
    else if (!item.action) {
        item.action = item.item;
    }
    return item;
}

function configureItems() {
}
