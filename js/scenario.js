var scene;

var playerCharacters = {
    slayer: {
        class: 'SLAYER',
        health: 60,
        maxHealth: 60,
        resourceName: 'SOULS',
        resource: 1,
        resourceMax: 3,
        accuracy: 0.8,
        evasion: 0.3,
        critChance: 0.05,
    },
};

var monsters = {
    skeleton: {
        health: 50,
        maxHealth: 50,
        evasion: 0.1,
        accuracy: 0.8,
        critChance: 0.05,
    },
};

var party = [playerCharacters.slayer];
var enemies = [monsters.skeleton];

var CombatScene, AttackScene, SkillScene, SpellScene, ItemScene;

function Scene() {
}

Scene.prototype.update = function() {
    updateInput();
};

Scene.prototype.draw = function() {
    drawRect(0, 0, canvasWidth, canvasHeight, '#000');
    for (var i = 0; i < party.length; i++) {
        drawRect(8 * (i + 1) + 150 * i, 335, 150, 135, 'white', true);
        var data = party[i];
        drawText(data.class, 20, 360);
        drawText('HP: ' + data.health + '/' + data.maxHealth, 20, 385);
        if (data.resourceMax) {
            drawText(data.resourceName + ': ' + data.resource + '/' + data.resourceMax, 20, 410);
        }
        else {
            drawText(data.resourceName + ': ' + data.resource, 20, 410);
        }
    }
    drawText('Monster HP: ' + Math.max(0, enemies[0].health) + '/' + enemies[0].maxHealth, 240, 50);
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
            playSound('beep0', 0.5);
        }
    }
    else if (triggerKeyState.shift || triggerKeyState.x || triggerKeyState.esc) {
        if (this.previousScene) {
            scene = new this.previousScene();
            playSound('beep1', 0.5);
        }
    }
    else if (triggerKeyState.down) {
        this.menuY++;
        this.menuY %= this.menuOptions.length;
        playSound('select0', 0.3);
    }
    else if (triggerKeyState.up) {
        this.menuY--;
        this.menuY = this.menuY < 0 ? this.menuOptions.length - 1 : this.menuY;
        playSound('select0', 0.3);
    }
    Scene.prototype.update.call(this);
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
    this.action = buildAction(action, party[0], enemies[0]);
    var results = this.action.execute();
    this.hit = results.hit;
    this.crit = results.crit;
    this.damage = this.action.calculateDamage(this.crit);
    this.messageTimer = FPS * 0.5;
}

ActionScene.prototype = Object.create(Scene.prototype);

ActionScene.prototype.update = function() {
    if (this.messageTimer > 0) {
        this.messageTimer--;
    }
    else if (triggerKeyState.enter || triggerKeyState.z) {
        scene = enemies[0].health <= 0 ? new VictoryScene() : new EnemyScene();
        playSound('beep0', 0.5);
    }
    Scene.prototype.update.call(this);
};

ActionScene.prototype.draw = function() {
    Scene.prototype.draw.call(this);
    drawRect(80, 100, 500, 120, 'white', true);
    drawTextMultiline(this.action.text, 95, 125);
    if (this.hit) {
        var critText = this.crit ? ' A critical hit!!' : '';
        drawTextMultiline('It dealt ' + this.damage + ' damage!' + critText, 95, 150);
    }
    else {
        drawTextMultiline('The attack missed!', 95, 150);
    }
};

EnemyScene = function() {
    Scene.call(this);
    this.action = buildAction('bone_claw', enemies[0], party[0]);
    var results = this.action.execute();
    this.hit = results.hit;
    this.crit = results.crit;
    this.damage = this.action.calculateDamage(this.crit);
    this.messageTimer = FPS * 0.5;
}

EnemyScene.prototype = Object.create(Scene.prototype);

EnemyScene.prototype.update = function() {
    if (this.messageTimer > 0) {
        this.messageTimer--;
    }
    else if (triggerKeyState.enter || triggerKeyState.z) {
        scene = party[0].health <= 0 ? new DeathScene() : new CombatScene();
        playSound('beep0', 0.5);
    }
    Scene.prototype.update.call(this);
};

EnemyScene.prototype.draw = function() {
    Scene.prototype.draw.call(this);
    drawRect(80, 100, 500, 120, 'white', true);
    drawTextMultiline(this.action.text, 95, 125);
    if (this.hit) {
        var critText = this.crit ? ' A critical hit!!' : '';
        drawTextMultiline('It dealt ' + this.damage + ' damage!' + critText, 95, 150);
    }
    else {
        drawTextMultiline('The attack missed!', 95, 150);
    }
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
        { display: 'Straight Sword - 80/80 DUR', scene: ActionScene, action: 'sword' },
        { display: 'Pistol - 1/1 AMMO', scene: ActionScene, action: 'pistol' },
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

VictoryScene = function() {
    Scene.call(this);
};

VictoryScene.prototype = Object.create(Scene.prototype);

VictoryScene.prototype.draw = function() {
    Scene.prototype.draw.call(this);
    drawText('You are victorious!', 240, 75);
};

DeathScene = function() {
    Scene.call(this);
};

DeathScene.prototype = Object.create(Scene.prototype);

DeathScene.prototype.draw = function() {
    Scene.prototype.draw.call(this);
    drawText('You have been defeated!', 200, 75);
};

function configureScenario() {
    scene = new CombatScene();
}
