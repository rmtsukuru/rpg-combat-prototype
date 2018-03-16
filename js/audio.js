var audioFormat;

function setFormat() {
    var audio = new Audio();
    if (audio.canPlayType('audio/mp3')) {
        audioFormat = '.mp3';
    }
    else {
        audioFormat = '.ogg';
    }
}

function configureAudio() {
    setFormat();
}

function playSound(filename, volume, loop) {
    var sound = new Audio('audio/' + filename + audioFormat);
    sound.volume = volume || 1;
    sound.volume *= MASTER_VOLUME || 1;
    if (loop) {
        sound.loop = true;
    }
    if (!loop || !MUTE_BGM) {
        sound.play();
    }
}
