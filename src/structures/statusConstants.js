const side = 128;
const center = side / 2 - 1;
const circlex = 110.5;
const circley = 110.5;
const circler = 11.5;
const circleo = 15.5;
const radius = center;
const statusTypes = {
    streaming: [89, 54, 149],
    dnd: [240, 71, 71],
    online: [67, 181, 129],
    offline: [116, 127, 141],
    idle: [250, 166, 26]
};
module.exports = {side, center, circlex, circley, circler, circleo, radius, statusTypes};
