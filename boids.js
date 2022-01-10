const canvas = document.getElementById("boids");
const ctx = canvas.getContext("2d");

const BOID_COLOR = "#BDA3FF";
const NUM_BOIDS = 150;
const BOID_SIZE = 7;
const MAX_SPEED = 2;
const DETECT_RADIUS = 100;





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

const VectorOps = {
    add: function(vec1, vec2) {
        return new Vector(vec1.x + vec2.x, vec1.y + vec2.y);
    },
    sub: function(vec1, vec2) {
        return new Vector(vec1.x - vec2.x, vec1.y - vec2.y);
    },
};

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





let boids = [];


const drawAll = function() {
    for (const boid of boids) {
        boid.draw();
    };
};

const separation = function(boid) {
    let c = new Vector(0, 0);

    for (const other of boids) {
        if (boid !== other) {
            const diff = VectorOps.sub(other.position, boid.position);
            if (diff.norm() < DETECT_RADIUS) {
                c.sub(diff);
            };
        };
    };

    return c;
};

const alignment = function(boid) {
    let p = new Vector(0, 0);

    for (const other of boids) {
        if (boid !== other) {
            p.add(other.velocity);
        };
    };

    p.mult(1 / (boids.length - 1));
    p.sub(boid.velocity);
    return p;
};

const cohesion = function(boid) {
    let p = new Vector(0, 0);

    for (const other of boids) {
        if (boid !== other) {
            p.add(other.position);
        };
    };

    p.mult(1 / (boids.length - 1));
    p.sub(boid.position);
    return p;
};

const stepAll = function() {
    for (const boid of boids) {
        boid.velocity.add(separation(boid));
        boid.velocity.add(alignment(boid));
        boid.velocity.add(cohesion(boid));
        if (boid.velocity.norm() > MAX_SPEED) {
            boid.velocity.setMag(MAX_SPEED);
        };
        boid.position.add(boid.velocity);
    };
};



const init = function() {
    ctx.fillStyle = BOID_COLOR;

    for (let x = 0; x < NUM_BOIDS; x++) {
        boids.push(new Boid(Math.random() * canvas.width, Math.random() * canvas.height));
    };
    drawAll();

    window.requestAnimationFrame(animate);
};

const animate = function(e) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAll();
    stepAll();

    window.requestAnimationFrame(animate);
};


init();