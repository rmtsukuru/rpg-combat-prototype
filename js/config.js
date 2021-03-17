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
const FIELD_SPEED = 5;
const TILE_WIDTH = 32;
const TILE_HEIGHT = 32;
const FIELD_TILEMAP_WIDTH = 20;
const FIELD_TILEMAP_HEIGHT = 15;
const STARTING_MAP_ID = 0;
const DEFAULT_MESSAGE_SPEED = 45;
const ACTIVE_MESSAGE_SPEED = 60;
const MESSAGE_LINE_LENGTH = 57;

var mapData = {
    0: {
        template: 'room',
        tiles: [
            [7, 8, 3],
            [8, 8, 3],
            [8, 9, 3],
            [13, 9, 4],
            [13, 10, 4],
            [14, 9, 4],
            [14, 10, 4],
        ],
    },
    1: {
        template: 'room',
        tiles: [],
    },
};

