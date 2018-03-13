var scene;

var characterData = {
    slayer: {
        class: 'SLAYER',
        health: 60,
        maxHealth: 60,
        resourceName: 'SOULS',
        resource: 1,
        resourceMax: 3,
    },
};

var party = ['slayer'];

var CombatScene, AttackScene, SkillScene, SpellScene, ItemScene;

function Scene() {
}

Scene.prototype.update = function() {
    // Do nothing, this is for inheritance.
};

Scene.prototype.draw = function() {
    drawRect(0, 0, canvasWidth, canvasHeight, '#000');
    for (var i = 0; i < party.length; i++) {
        drawRect(8 * (i + 1) + 150 * i, 335, 150, 135, 'white', true);
        var data = characterData[party[i]];
        drawText(data.class, 20, 360);
        drawText('HP: ' + data.health + '/' + data.maxHealth, 20, 385);
        if (data.resourceMax) {
            drawText(data.resourceName + ': ' + data.resource + '/' + data.resourceMax, 20, 410);
        }
        else {
            drawText(data.resourceName + ': ' + data.resource, 20, 410);
        }
    }
};

function MenuScene() {
    Scene.call(this);
    this.menuY = 0;
    this.menuWidth = 120;
    this.menuOptions = [];
}

MenuScene.prototype = Object.create(Scene.prototype);

MenuScene.prototype.update = function() {
    if (triggerKeyState.enter || triggerKeyState.z) {
        if (this.menuOptions[this.menuY].scene) {
            scene = new this.menuOptions[this.menuY].scene(this.menuOptions[this.menuY].action);
        }
    }
    else if (triggerKeyState.shift || triggerKeyState.x || triggerKeyState.esc) {
        if (this.previousScene) {
            scene = new this.previousScene();
        }
    }
    else if (triggerKeyState.down) {
        this.menuY++;
        this.menuY %= this.menuOptions.length;
        playSound('select0', 0.2);
    }
    else if (triggerKeyState.up) {
        this.menuY--;
        this.menuY = this.menuY < 0 ? this.menuOptions.length - 1 : this.menuY;
        playSound('select0', 0.2);
    }
    updateInput();
};

MenuScene.prototype.draw = function() {
    Scene.prototype.draw.call(this);
    drawRect(20, 230, this.menuWidth, 10 + 20 * this.menuOptions.length, 'white', true);
    for (var i = 0; i < this.menuOptions.length; i++) {
        drawText(this.menuOptions[i].display, 50, 250 + 20 * i);
    }
    drawArrow(30, 238 + 20 * this.menuY, 10, 10, 'white');
}

ActionScene = function(action) {
    Scene.call(this);
    this.action = action;
    this.actionTimer = FPS * 1.5;
    this.actionText = this.getActionText();
}

ActionScene.prototype = Object.create(Scene.prototype);

ActionScene.prototype.getActionText = function() {
    switch (this.action) {
        case 'melee':
            return 'You swing the sword, dealing 12 damage.';
        case 'ranged':
            return 'You fire a shot, dealing 10 damage and \nstunning the target.';
    }
    return '';
};

ActionScene.prototype.update = function() {
    Scene.prototype.update.call(this);
    if (this.actionTimer <= 0) {
        scene = new CombatScene();
    }
    else {
        this.actionTimer--;
    }
};

ActionScene.prototype.draw = function() {
    Scene.prototype.draw.call(this);
    drawRect(80, 100, 500, 120, 'white', true);
    drawTextMultiline(this.actionText, 95, 125);
};

CombatScene = function() {
    MenuScene.call(this);
    this.menuOptions = [
        { display: 'Attack', scene: AttackScene },
        { display: 'Tactics', scene: SkillScene },
        { display: 'Magic', scene: SpellScene },
        { display: 'Item', scene: ItemScene },
    ];
}

CombatScene.prototype = Object.create(MenuScene.prototype);

AttackScene = function() {
    MenuScene.call(this);
    this.menuOptions = [
        { display: 'Straight Sword - 80/80 DUR', scene: ActionScene, action: 'melee' },
        { display: 'Pistol - 1/1 AMMO', scene: ActionScene, action: 'ranged' },
    ];
    this.menuWidth = 325;
    this.previousScene = CombatScene;
}

AttackScene.prototype = Object.create(MenuScene.prototype);

SkillScene = function() {
    MenuScene.call(this);
    this.menuOptions = [
        { display: 'Trip' },
        { display: 'Dodge' },
        { display: 'Inspect' },
    ];
    this.previousScene = CombatScene;
}

SkillScene.prototype = Object.create(MenuScene.prototype);

SpellScene = function() {
    MenuScene.call(this);
    this.menuOptions = [
        { display: 'Flame Strike - 1 SOUL' },
        { display: 'Spirit Blast - 1 SOUL' },
    ];
    this.menuWidth = 270;
    this.previousScene = CombatScene;
}

SpellScene.prototype = Object.create(MenuScene.prototype);

ItemScene = function() {
    MenuScene.call(this);
    this.menuOptions = [
        { display: 'Ointment (1)' },
        { display: 'Bullets (12)' },
        { display: 'Cutlass' },
    ];
    this.menuWidth = 170;
    this.previousScene = CombatScene;
}

ItemScene.prototype = Object.create(MenuScene.prototype);

function configureScenario() {
    scene = new CombatScene();
}
