// Reference canvas element and context
const canvas = document.getElementById("boids");
const ctx = canvas.getContext("2d");

// Store animation id (for stopping/pausing)
let animationId;

// Define constants
const BOID_COLOR = "#BDA3FF";
const NUM_BOIDS = 250;
const BOID_SIZE = 5;
const MAX_SPEED = 3;
const MAX_ACCEL = 0.07;
const DETECT_RADIUS = 70;
const SEPARATION = 30;



// Vector class to handle vector calculations
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    };
    copy() {
        return new Vector(this.x, this.y);
    };
    mult(scalar) {
        this.x *= scalar;
        this.y *= scalar;
    };
    norm() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    };
    normalize() {
        const n = this.norm();
        if (n) {
            this.x /= n;
            this.y /= n;
        };
    };
    setMag(magnitude) {
        this.normalize();
        this.mult(magnitude);
    };
    add(vec) {
        this.x += vec.x;
        this.y += vec.y;
    };
    sub(vec) {
        this.x -= vec.x;
        this.y -= vec.y;
    };
};

// Define other vector operations (without side effects)
const VectorOps = {
    add: function(vec1, vec2) {
        return new Vector(vec1.x + vec2.x, vec1.y + vec2.y);
    },
    sub: function(vec1, vec2) {
        return new Vector(vec1.x - vec2.x, vec1.y - vec2.y);
    },
};

// Boid class to define information needed to display and move a boid
class Boid {
    constructor(x, y) {
        this.position = new Vector(x, y);
        const ang = Math.random() * 2 * Math.PI;
        this.velocity = new Vector(Math.cos(ang), Math.sin(ang));
    };
    draw() {
        ctx.beginPath();
        let dir = this.velocity.copy();
        dir.setMag(BOID_SIZE);
        ctx.moveTo(this.position.x + dir.x, this.position.y + dir.y);
        let width = new Vector(dir.y, -1 * dir.x);
        width.setMag(BOID_SIZE / 2);
        ctx.lineTo(this.position.x - dir.x + width.x, this.position.y - dir.y + width.y);
        ctx.lineTo(this.position.x - dir.x - width.x, this.position.y - dir.y - width.y);
        ctx.fill();
    };
};



// Array of all boids
let boids = [];

// Draw all boids on the canvas
const drawAll = function() {
    for (const boid of boids) {
        boid.draw();
    };
};

// Boid algorithm separation rule calculation
const separation = function(boid) {
    let c = new Vector(0, 0);
    let num = 0;

    for (const other of boids) {
        if (boid !== other) {
            const diff = VectorOps.sub(boid.position, other.position);
            const dist = diff.norm();
            if (dist < SEPARATION) {
                diff.normalize();
                diff.mult(1 / dist);
                c.add(diff);
                num++;
            };
        };
    };

    if (num) c.mult(1 / num);
    c.setMag(MAX_SPEED);
    c.sub(boid.velocity);
    if (c.norm() > MAX_SPEED) c.setMag(MAX_SPEED);
    return c;
};

// Boid algorithm alignment rule calculation
const alignment = function(boid) {
    let p = new Vector(0, 0);

    for (const other of boids) {
        if (boid !== other) {
            const diff = VectorOps.sub(other.position, boid.position);
            if (diff.norm() < DETECT_RADIUS) {
                p.add(other.velocity);
            };
        };
    };

    p.setMag(MAX_SPEED);
    p.sub(boid.velocity);
    if (p.norm() > MAX_SPEED) p.setMag(MAX_SPEED);
    return p;
};

// Boid algorithm cohesion rule calculation
const cohesion = function(boid) {
    let p = new Vector(0, 0);
    let num = 0;

    for (const other of boids) {
        if (boid !== other) {
            const diff = VectorOps.sub(other.position, boid.position);
            if (diff.norm() < DETECT_RADIUS) {
                p.add(other.position);
                num++;
            };
        };
    };

    if (num) p.mult(1 / num);
    p.sub(boid.position);
    p.setMag(MAX_SPEED);
    p.sub(boid.velocity);
    if (p.norm() > MAX_SPEED) p.setMag(MAX_SPEED);
    // if (p.norm() > MAX_ACCEL) p.setMag(MAX_ACCEL);
    return p;
};

// Move all boids one step according to boid algorithm rules
const stepAll = function() {
    for (const boid of boids) {
        // Wraparound borders
        if (boid.position.x <= 0) boid.position.x += canvas.width;
        if (boid.position.y <= 0) boid.position.y += canvas.height;
        if (boid.position.x > canvas.width) boid.position.x = 0;
        if (boid.position.y > canvas.height) boid.position.y = 0;

        const sep = separation(boid);
        const ali = alignment(boid);
        const coh = cohesion(boid);
        sep.mult(4);
        ali.mult(5);
        coh.mult(2);

        const steer = new Vector(0, 0);
        steer.add(sep);
        steer.add(ali);
        steer.add(coh);
        if (steer.norm() > MAX_ACCEL) steer.setMag(MAX_ACCEL);

        boid.velocity.add(steer);
        if (boid.velocity.norm() > MAX_SPEED) boid.velocity.setMag(MAX_SPEED);
        boid.position.add(boid.velocity);
    };
};



// Resize canvas to full window size
const resize = function(e) {
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    ctx.fillStyle = BOID_COLOR;
};

// Add a new boid
const addBoid = function() {
    boids.push(new Boid(Math.random() * canvas.width, Math.random() * canvas.height));
};

// Change boid amount based on canvas/window size
const population = function() {
    const area = ctx.canvas.width * ctx.canvas.height;
    const boid_amount = Math.floor(area * (2 / 17725) + (25250 / 709));

    if (boid_amount > boids.length) {
        for (let i = 0; i < boid_amount - boids.length; i++) {
            addBoid();
        }
    }
    if (boid_amount < boids.length) {
        for (let i = 0; i < boids.length - boid_amount; i++) {
            boids.pop();
        }
    }
};

// Initialize all boids and start animation
const init = function() {
    resize();
    ctx.fillStyle = BOID_COLOR;

    for (let x = 0; x < NUM_BOIDS; x++) {
        addBoid();
    };
    drawAll();

    window.requestAnimationFrame(animate);
};

// Animate boids and handle responsiveness
const animate = function(e) {
    resize();
    population();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAll();
    stepAll();

    animationId = window.requestAnimationFrame(animate);
};

// Start animation on load
init();


// Temporary animation pause for debugging
// const stop = function(e) {
//     window.cancelAnimationFrame(animationId);
// };

// canvas.addEventListener("click", stop);