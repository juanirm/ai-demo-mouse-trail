class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = particleSize;
        this.baseX = x;
        this.baseY = y;
        this.density = Math.random() * 30 + 1;
        this.color = color;
        this.lifespan = 1.0; // Full opacity
        this.decay = 0.02; // Rate at which particle fades
    }

    update() {
        this.lifespan -= this.decay;
        return this.lifespan > 0;
    }

    draw() {
        const [r, g, b] = this.getRGBFromColor(this.color);
        
        if (neonSwitch.checked) {
            // Neon glow effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.lifespan})`;
            
            // Draw multiple layers for stronger glow
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size + i * 0.5, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
            
            // Reset shadow for next particle
            ctx.shadowBlur = 0;
        } else {
            // Normal rendering
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.lifespan})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
    }

    getRGBFromColor(color) {
        // Handle both hex and HSL colors
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return [r, g, b];
        } else {
            // For HSL colors, create a temporary div to get RGB values
            const temp = document.createElement('div');
            temp.style.color = color;
            document.body.appendChild(temp);
            const rgb = window.getComputedStyle(temp).color;
            document.body.removeChild(temp);
            return rgb.match(/\d+/g).map(Number);
        }
    }
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const particles = [];
let particleCount = 50;
let particleSize = 2;
let mouse = { x: null, y: null };
let hue = 0;

// Menu toggle functionality
const menuToggle = document.getElementById('menuToggle');
const controls = document.querySelector('.controls');

menuToggle.addEventListener('click', () => {
    controls.classList.toggle('collapsed');
});

// Get background color components
let bgColor = getComputedStyle(canvas).backgroundColor;
let [bgR, bgG, bgB] = bgColor.match(/\d+/g).map(Number);

// Controls
const trailLength = document.getElementById('trailLength');
// Set rainbow as default
const trailType = document.getElementById('trailType');
trailType.value = 'rainbow';
const trailLengthValue = document.getElementById('trailLengthValue');
const trailWidth = document.getElementById('trailWidth');
const trailWidthValue = document.getElementById('trailWidthValue');
const bgColorPicker = document.getElementById('bgColorPicker');
const trailColorPicker = document.getElementById('trailColorPicker');
const trailType = document.getElementById('trailType');
const neonSwitch = document.getElementById('neonSwitch');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function generateColor() {
    switch(trailType.value) {
        case 'solid':
            return trailColorPicker.value;
        case 'rainbow':
            hue = (hue + 1) % 360;
            return `hsl(${hue}, 100%, 50%)`;
        case 'random':
            return `hsl(${Math.random() * 360}, 100%, 50%)`;
        default:
            return trailColorPicker.value;
    }
}

function createParticles(e) {
    mouse.x = e.x;
    mouse.y = e.y;
    
    for(let i = 0; i < 3; i++) {
        particles.unshift(new Particle(mouse.x, mouse.y, generateColor()));
        if(particles.length > particleCount) {
            particles.pop();
        }
    }
}

function animate() {
    // Use the current background color for fade effect
    ctx.fillStyle = `rgba(${bgR}, ${bgG}, ${bgB}, 0.1)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles, remove dead ones
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        if (particle.update()) {
            particle.draw();
        } else {
            particles.splice(i, 1);
        }
    }
    
    requestAnimationFrame(animate);
}

// Update color value displays
const bgColorValue = document.getElementById('bgColorValue');
const trailColorValue = document.getElementById('trailColorValue');

function updateColorValue(input, display) {
    display.textContent = input.value.toUpperCase();
}

function updateBgColor(color) {
    document.body.style.backgroundColor = color;
    // Update the background color components for the fade effect
    bgColor = getComputedStyle(document.body).backgroundColor;
    [bgR, bgG, bgB] = bgColor.match(/\d+/g).map(Number);
}

// Event Listeners
window.addEventListener('resize', resizeCanvas);
canvas.addEventListener('mousemove', createParticles);

bgColorPicker.addEventListener('input', (e) => {
    updateBgColor(e.target.value);
    updateColorValue(bgColorPicker, bgColorValue);
});

trailColorPicker.addEventListener('input', () => {
    updateColorValue(trailColorPicker, trailColorValue);
});

// Trail controls
trailLength.addEventListener('input', (e) => {
    particleCount = parseInt(e.target.value);
    trailLengthValue.textContent = particleCount;
});

trailWidth.addEventListener('input', (e) => {
    particleSize = parseInt(e.target.value);
    trailWidthValue.textContent = particleSize;
});

// Initialize
resizeCanvas();
animate();

// Set initial values
updateColorValue(bgColorPicker, bgColorValue);
updateColorValue(trailColorPicker, trailColorValue);
updateBgColor(bgColorPicker.value);
