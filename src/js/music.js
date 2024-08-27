const musicPlaying = document.querySelector('.music-player');
const songIcon = document.querySelector('.song-icon');
const headerArtist = document.getElementById('song-artist');
const headerTitle = document.getElementById('song-name');

var numberOfFrequencies = 1;
var inputColor1 = "#5603fc";
var inputColor2 = "#fc0303";
var glow = true;
var glowStrength = 10;
var amplitude = 300;
var spectrumScale = 1;
var spectrumX = 0.5;
var sprcctrumY = 0.5;
var opacity = 1;
var imgName = "";
var imageOverlayDarkness = 0.3;
var albumSize = 200;

async function livelyCurrentTrack(data) {
    let obj = JSON.parse(data);
    // when no track is playing its null
    if (obj != null) {
        headerTitle.innerText = obj.Title;
        headerArtist.innerText = obj.Artist;

        songIcon.src = "data:image/png;base64, " + obj.Thumbnail;

        musicPlaying.classList.remove('hide');
    } else {
        musicPlaying.classList.add('hide');
    }
}

function livelyPropertyListener(name, val) {
    // or switch-case...
    if (name == "color1") {
        inputColor1 = hexToRGB(val);
    }
    else if (name == "color2") {
        inputColor2 = hexToRGB(val);
    }
    else if (name == "glow") {
        glow = val;
    }
    else if (name == "glowStrength") {
        glowStrength = val;
    }
    else if (name == "opacity") {
        opacity = val / 100;
    }
    else if (name == "imgPath") {
        imgName = val;
        document.getElementById("backgroundImg").src = "/" + imgName;
    }
    else if (name == "imgOverlay") {
        imageOverlayDarkness = val / 100;
        document.getElementById('backgroundOverlay').style.backgroundColor = `rgba(0, 0, 0, ${imageOverlayDarkness})`;
    }
    else if (name == "albumSize") {
        albumSize = val;
        document.querySelector('.song-icon').style.width = `${albumSize}px`;
    }
}

function livelyAudioListener(audioArray) {
    drawSpectrum(audioArray);
}

function drawSpectrum(audioArray) {
    let c = document.getElementById("canvas");
    let ctx = c.getContext("2d");
    let Wwidth = Math.round(window.innerWidth * spectrumScale);
    let Wheight = Math.round((window.innerHeight / 2 + amplitude) * spectrumScale);
    c.setAttribute('width', Wwidth);
    c.setAttribute('height', Wheight);

    //c.style.left = Math.round(window.innerWidth * spectrumX - c.width / 2) + "px";
    //c.style.top = Math.round(window.innerHeight * spectrumY - c.height) + "px";

    ctx.clearRect(0, 0, c.width, c.height);
    if (glow) {
        ctx.shadowBlur = glowStrength;
    }
    else {
        ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = opacity;

    let width = c.width;
    let height = c.height;
    let offset = Math.round(0 * width);
    let numberOfSamples = 128;
    let spacing = Math.round(3 * spectrumScale);
    let barwidth = Math.floor((width - 2 * offset - (numberOfFrequencies - 1) * spacing) / numberOfFrequencies);

    let a = 0;

    for (let i = 0; i < numberOfSamples; i++) {
        if (i == 0) {
            ctx.fillStyle = interpolateColor(inputColor1, inputColor2, a / numberOfFrequencies);
            ctx.shadowColor = interpolateColor(inputColor1, inputColor2, a / numberOfFrequencies);
            ctx.fillRect(offset + a * (barwidth + spacing), height - 50 - Math.round((amplitude * spectrumScale) * Math.min(1, audioArray[i])), barwidth, Math.round((amplitude * spectrumScale) * Math.min(1, audioArray[i])));
            a++
        }
        else {
            if (audioArray[i] != audioArray[i - 1]) {
                ctx.fillStyle = interpolateColor(inputColor1, inputColor2, a / numberOfFrequencies);
                ctx.shadowColor = interpolateColor(inputColor1, inputColor2, a / numberOfFrequencies);
                ctx.fillRect(offset + a * (barwidth + spacing), height - 50 - Math.round((amplitude * spectrumScale) * Math.min(1, audioArray[i])), barwidth, Math.round((amplitude * spectrumScale) * Math.min(1, audioArray[i])));
                a++
            }
        }
    }

    numberOfFrequencies = a;
}

function interpolateColor(c0, c1, f) {
    let color1 = c0.split(",");
    let color2 = c1.split(",");

    let r = Math.round(Number(color1[0]) + (Number(color2[0]) - Number(color1[0])) * f);
    let g = Math.round(Number(color1[1]) + (Number(color2[1]) - Number(color1[1])) * f);
    let b = Math.round(Number(color1[2]) + (Number(color2[2]) - Number(color1[2])) * f);

    let rHex = Number(r).toString(16);
    if (rHex.length < 2) {
        rHex = "0" + rHex;
    }

    let gHex = Number(g).toString(16);
    if (gHex.length < 2) {
        gHex = "0" + gHex;
    }

    let bHex = Number(b).toString(16);
    if (bHex.length < 2) {
        bHex = "0" + bHex;
    }

    let out = "#" + rHex + gHex + bHex;

    return out;
}

function hexToRGB(hex) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    return r + "," + g + "," + b;
}