const musicPlaying = document.querySelector('.music-player');
const songIcon = document.querySelector('.song-icon');
const headerArtist = document.getElementById('song-artist');
const headerTitle = document.getElementById('song-name');

var numberOfFrequencies = 1;
var spectrumScale = 1;

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

async function livelyAudioListener(audioArray) {
    await drawSpectrum(audioArray);
}

async function drawSpectrum(audioArray) {
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    let Wwidth = Math.round(window.innerWidth * spectrumScale);
    let Wheight = Math.round((window.innerHeight / 2 + 300) * spectrumScale);
    canvas.setAttribute('width', Wwidth);
    canvas.setAttribute('height', Wheight);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (window.config.glow) {
        ctx.shadowBlur = window.config.glowStrength;
    }
    else {
        ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = window.config.opacity;

    let width = canvas.width;
    let height = canvas.height;
    let offset = Math.round(0 * width);
    let numberOfSamples = 128;
    let spacing = Math.round(3 * spectrumScale);
    let barwidth = Math.floor((width - 2 * offset - (numberOfFrequencies - 1) * spacing) / numberOfFrequencies);

    let a = 0;
    for (let i = 0; i < numberOfSamples; i++) {
        if (i == 0) {
            ctx.fillStyle = interpolateColor(hexToRGB(window.config.inputColor1), hexToRGB(window.config.inputColor2), a / numberOfFrequencies);
            ctx.shadowColor = interpolateColor(hexToRGB(window.config.inputColor1), hexToRGB(window.config.inputColor2), a / numberOfFrequencies);
            ctx.fillRect(offset + a * (barwidth + spacing), height - 50 - Math.round((window.config.visauliserHeight * spectrumScale) * Math.min(1, audioArray[i])), barwidth, Math.round((window.config.visauliserHeight * spectrumScale) * Math.min(1, audioArray[i])));
            a++
        }
        else {
            if (audioArray[i] != audioArray[i - 1]) {
                ctx.fillStyle = interpolateColor(hexToRGB(window.config.inputColor1), hexToRGB(window.config.inputColor2), a / numberOfFrequencies);
                ctx.shadowColor = interpolateColor(hexToRGB(window.config.inputColor1), hexToRGB(window.config.inputColor2), a / numberOfFrequencies);
                ctx.fillRect(offset + a * (barwidth + spacing), height - 50 - Math.round((window.config.visauliserHeight * spectrumScale) * Math.min(1, audioArray[i])), barwidth, Math.round((window.config.visauliserHeight * spectrumScale) * Math.min(1, audioArray[i])));
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