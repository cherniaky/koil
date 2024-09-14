"use strict";
const EPS = 1e-6;
class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(that) {
        return new Vector2(this.x + that.x, this.y + that.y);
    }
    sub(that) {
        return new Vector2(this.x - that.x, this.y - that.y);
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    norm() {
        const length = this.length();
        return new Vector2(this.x / length, this.y / length);
    }
    distanceTo(that) {
        return this.sub(that).length();
    }
    array() {
        return [this.x, this.y];
    }
}
function strokeLine(ctx, p1, p2) {
    ctx.beginPath();
    ctx.moveTo(...p1.array());
    ctx.lineTo(...p2.array());
    ctx.stroke();
}
function drawCircle(ctx, center, radius) {
    ctx.beginPath();
    ctx.arc(...center.array(), radius, 0, 2 * Math.PI);
    ctx.fill();
}
const GRID_ROWS = 10, GRID_COLS = 10;
let scene = new Array(GRID_ROWS).fill(0).map(() => new Array(GRID_COLS).fill(0));
function snap(value, d) {
    if (d > 0) {
        return Math.ceil(value + EPS);
    }
    if (d < 0) {
        return Math.floor(value - EPS);
    }
    return value;
}
function hittingCell(p1, p2) {
    const d = p2.sub(p1);
    return new Vector2(Math.floor(p2.x + Math.sign(d.x) * EPS), Math.floor(p2.y + Math.sign(d.y) * EPS));
}
function rayStep(p1, p2) {
    // y1 = k * x1 + c
    // y2 = k * x2 + c
    // c = y1 - k * x1
    // y2 = k * x2 + y1 - k * x1
    // y2 - y1 = k * (x2 - x1)
    // k = (y2 - y1) / (x2 - x1) 
    // c = y1 - k * x1
    const dy = (p2.y - p1.y);
    const dx = (p2.x - p1.x);
    let p3 = p2;
    if (dx !== 0) {
        const k = dy / dx;
        const c = p1.y - k * p1.x;
        const x3 = snap(p2.x, dx);
        const y3 = x3 * k + c;
        p3 = new Vector2(x3, y3);
        if (k !== 0) {
            const y3_candidate = snap(p2.y, dy);
            const x3_candidate = (y3_candidate - c) / k;
            const p3_candidate = new Vector2(x3_candidate, y3_candidate);
            if (p2.distanceTo(p3) > p2.distanceTo(p3_candidate)) {
                p3 = p3_candidate;
            }
        }
    }
    else {
        const x3 = p2.x;
        const y3 = snap(p2.y, dy);
        p3 = new Vector2(x3, y3);
    }
    return p3;
}
function drawGrid(ctx, p2) {
    ctx.reset();
    const col_width = ctx.canvas.width / GRID_COLS;
    const rows_height = ctx.canvas.height / GRID_ROWS;
    ctx.scale(col_width, rows_height);
    ctx.lineWidth = 0.02;
    ctx.strokeStyle = "#101010";
    ctx.fillRect(0, 0, GRID_COLS, GRID_ROWS);
    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
            if (scene[y][x] !== 0) {
                ctx.fillStyle = "#303030";
                ctx.fillRect(x, y, 1, 1);
                ctx.fill();
            }
        }
    }
    ctx.strokeStyle = "#444444";
    for (let x = 0; x <= GRID_COLS; x++) {
        strokeLine(ctx, new Vector2(x, 0), new Vector2(x, GRID_ROWS));
    }
    for (let y = 0; y <= GRID_ROWS; y++) {
        strokeLine(ctx, new Vector2(0, y), new Vector2(GRID_COLS, y));
    }
    ctx.fillStyle = "magenta";
    let p1 = new Vector2(GRID_COLS * 0.33, GRID_ROWS * 0.44);
    drawCircle(ctx, p1, 0.2);
    if (p2) {
        drawCircle(ctx, p2, 0.2);
        ctx.strokeStyle = "magenta";
        strokeLine(ctx, p1, p2);
        for (;;) {
            const c = hittingCell(p1, p2);
            if (c.x < 0 || c.y < 0 || c.x >= GRID_COLS || c.y >= GRID_ROWS ||
                scene[c.y][c.x] === 1) {
                break;
            }
            const p3 = rayStep(p1, p2);
            drawCircle(ctx, p3, 0.2);
            strokeLine(ctx, p3, p2);
            p1 = p2;
            p2 = p3;
        }
    }
}
(() => {
    const canvas = document.querySelector("#game");
    if (!canvas) {
        return;
    }
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return;
    }
    scene[1][1] = 1;
    const col_width = ctx.canvas.width / GRID_COLS;
    const rows_height = ctx.canvas.height / GRID_ROWS;
    let p2;
    canvas.addEventListener("mousemove", (event) => {
        p2 = new Vector2(event.offsetX / col_width, event.offsetY / rows_height);
        drawGrid(ctx, p2);
    });
    drawGrid(ctx, p2);
})();
