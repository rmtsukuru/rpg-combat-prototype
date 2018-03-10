var mainLoop;
var initialConfigFrames = 1;

window.onload = function() {
    configureGraphics();
    configureInput();
    configureAudio();
    configureScenario();

    mainLoop = function() {
        scene.update();
        scene.draw();
        if (initialConfigFrames) {
            initialConfigFrames--;
            configureGraphics();
        }
    };

    document.addEventListener('keydown', keyPressed);
    document.addEventListener('keyup', keyReleased);
    window.addEventListener('resize', configureGraphics);
    window.setInterval(mainLoop, 1000 / FPS);
};
