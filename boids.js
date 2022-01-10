const canvas = document.getElementById("boids");
const ctx = canvas.getContext("2d");

const BOID_COLOR = "#BDA3FF";
const NUM_BOIDS = 150;
const BOID_SIZE = 7;
const MAX_SPEED = 2;





class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    copy() {
        return new Vector(this.x, this.y);
    }
    mult(scalar) {
        this.x *= scalar;
        this.y *= scalar;
    }
    norm() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
    normalize() {
        const n = this.norm();
        this.x /= n;
        this.y /= n;
    }
    setMag(magnitude) {
        this.normalize();
        this.mult(magnitude);
    }
    add(vec) {
        this.x += vec.x;
        this.y += vec.y;
    }
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
    }
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
    }
};





let boids = [];


const drawAll = function() {
    for (const boid of boids) {
        boid.draw();
    };
};

const separation = function() {};
const alignment = function() {};
const cohesion = function() {};

const stepAll = function() {
    for (const boid of boids) {
        
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