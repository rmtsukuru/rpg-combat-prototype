const FPS = 60;
const ASPECT_RATIO = 4 / 3;
const BASE_HEIGHT = 480;
const MASTER_VOLUME = 1;
const DEBUG = true;
const COMBAT_TEST = false;
const SHOW_CONDITIONS = true;
const TRUE_HIT = true;
const FLASH_TIMER_FRAMES = FPS / 10;
const SHAKE_TIMER_FRAMES = FPS / 3;
const SHAKE_WIDTH = 8;
const FIELD_SPEED = 3;
const TILE_WIDTH = 10;
const TILE_HEIGHT = 15;
const FIELD_TILEMAP_WIDTH = 31;
const FIELD_TILEMAP_HEIGHT = 18;
const STARTING_MAP_ID = 0;

var mapData = {
    0: {
        template: 'room',
        tiles: [
            [11, 8, 1],
            [12, 8, 1],
            [12, 9, 1],
        ],
    },
};

