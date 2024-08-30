// Define a global object if it doesn't exist
window.config = window.config || {};

function livelyPropertyListener(name, val) {
    if (name === "color1") {
        window.config.inputColor1 = val;
    } else if (name === "color2") {
        window.config.inputColor2 = val;
    } else if (name === "glow") {
        window.config.glow = val;
    } else if (name === "glowStrength") {
        window.config.glowStrength = val;
    } else if (name === "opacity") {
        window.config.opacity = val / 100;
    } else if (name === "imgPath") {
        window.config.imgName = val;
        document.getElementById("backgroundImg").src = "/" + val;
    } else if (name === "imgOverlay") {
        window.config.imageOverlayDarkness = val / 100;
        document.getElementById('backgroundOverlay').style.backgroundColor = `rgba(0, 0, 0, ${val / 100})`;
    } else if (name === "albumSize") {
        window.config.albumSize = val;
        document.querySelector('.song-icon').style.width = `${val}px`;
    } else if (name === "city") {
        window.config.city = val;
        fetchCurrentWeather();
    } else if (name === "use24HTime") {
        window.config.use24HTime = val;
    } else if (name === "animatedWeatherIcons") {
        window.config.animatedWeatherIcons = val;
        fetchCurrentWeather();
    } else if (name === "visauliserHeight") {
        window.config.visauliserHeight = val;
    }
}

function hexToRGB(hex) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    return r + "," + g + "," + b;
}