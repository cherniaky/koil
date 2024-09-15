"use strict";
const EPS = 1e-6;
const FOV = Math.PI / 2;
const NEAR_CLIPPING_PLANE_DISTANCE = 1;
class Vector2 {
    static fromAngle(angle) {
        return new Vector2(Math.cos(angle), Math.sin(angle));
    }
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
    div(that) {
        return new Vector2(this.x / that.x, this.y / that.y);
    }
    mul(that) {
        return new Vector2(this.x * that.x, this.y * that.y);
    }
    rot90() {
        return new Vector2(this.y * -1, this.x);
    }
    dot(that) {
        return this.x * that.x + this.y * that.y;
    }
    lerp(that, perc) {
        return that.sub(this).scale(perc).add(this);
    }
    scale(number) {
        return new Vector2(this.x * number, this.y * number);
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
class Player {
    constructor(position, direction) {
        this.position = position;
        this.direction = direction;
    }
    fovRange() {
        const halfClippingPlaneLength = Math.tan(FOV * 0.5) * NEAR_CLIPPING_PLANE_DISTANCE;
        const directionVector = this.position.add(Vector2.fromAngle(this.direction).scale(NEAR_CLIPPING_PLANE_DISTANCE));
        const secondHalfClipping = directionVector.add(Vector2.fromAngle(this.direction).rot90().scale(halfClippingPlaneLength));
        const firstHalfClipping = directionVector.sub(Vector2.fromAngle(this.direction).rot90().scale(halfClippingPlaneLength));
        return [firstHalfClipping, secondHalfClipping];
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
function getGridSize(grid) {
    const y = grid.length;
    const x = grid[0].length;
    return new Vector2(x, y);
}
function insideGrid(grid, p) {
    const gridSize = getGridSize(grid);
    if (p.x >= 0 && p.x < gridSize.x && p.y >= 0 && p.y < gridSize.y) {
        return true;
    }
    return false;
}
function castRay(grid, p1, p2) {
    for (;;) {
        const c = hittingCell(p1, p2);
        if (!insideGrid(grid, c) || grid[c.y][c.x] !== null) {
            break;
        }
        const p3 = rayStep(p1, p2);
        p1 = p2;
        p2 = p3;
    }
    return p2;
}
function render(ctx, grid, player) {
    ctx.save();
    const SCREEN_WIDTH = 400;
    const lineWidth = Math.ceil(ctx.canvas.width / SCREEN_WIDTH);
    const [firstHalfClipping, secondHalfClipping] = player.fovRange();
    for (let x = 0; x < SCREEN_WIDTH; x++) {
        const planePoint = firstHalfClipping.lerp(secondHalfClipping, x / SCREEN_WIDTH);
        const endPoint = castRay(grid, player.position, planePoint);
        const c = hittingCell(player.position, endPoint);
        if (insideGrid(grid, c)) {
            const color = grid[c.y][c.x];
            if (color !== null) {
                const dotProduct = Vector2.fromAngle(player.direction).dot(endPoint.sub(player.position));
                const lineHeight = ctx.canvas.height / dotProduct;
                ctx.fillStyle = color;
                ctx.fillRect(x * lineWidth, ctx.canvas.height / 2 - lineHeight / 2, lineWidth, lineHeight);
            }
        }
    }
    ctx.restore();
}
function drawMinimap(ctx, player, minimapOffset, minimapSize, grid) {
    ctx.save();
    const gridSize = getGridSize(grid);
    const col_width = minimapSize.x / gridSize.x;
    const rows_height = minimapSize.y / gridSize.y;
    ctx.translate(...minimapOffset.array());
    ctx.scale(col_width, rows_height);
    ctx.fillStyle = "#181818";
    ctx.fillRect(0, 0, ...gridSize.array());
    ctx.lineWidth = 0.08;
    for (let y = 0; y < gridSize.y; y++) {
        for (let x = 0; x < gridSize.x; x++) {
            const color = grid[y][x];
            if (color !== null) {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, 1, 1);
                ctx.fill();
            }
        }
    }
    ctx.strokeStyle = "#444444";
    for (let x = 0; x <= gridSize.x; x++) {
        strokeLine(ctx, new Vector2(x, 0), new Vector2(x, gridSize.y));
    }
    for (let y = 0; y <= gridSize.y; y++) {
        strokeLine(ctx, new Vector2(0, y), new Vector2(gridSize.x, y));
    }
    ctx.fillStyle = "magenta";
    drawCircle(ctx, player.position, 0.2);
    const [firstHalfClipping, secondHalfClipping] = player.fovRange();
    ctx.strokeStyle = "magenta";
    strokeLine(ctx, firstHalfClipping, secondHalfClipping);
    strokeLine(ctx, player.position, secondHalfClipping);
    strokeLine(ctx, player.position, firstHalfClipping);
    //if (p2) {
    //    drawCircle(ctx, p2, 0.2)
    //    ctx.strokeStyle = "magenta"
    //    strokeLine(ctx, p1, p2)
    //    for (; ;) {
    //        const c = hittingCell(p1, p2)
    //        if (c.x < 0 || c.y < 0 || c.x >= gridSize.x || c.y >= gridSize.y ||
    //            grid[c.y][c.x] === 1
    //        ) {
    //            break
    //        }
    //        const p3 = rayStep(p1, p2)
    //        drawCircle(ctx, p3, 0.2)
    //        strokeLine(ctx, p3, p2)
    //        p1 = p2
    //        p2 = p3
    //    }
    //}
    ctx.restore();
}
(() => {
    const canvas = document.querySelector("#game");
    if (!canvas) {
        return;
    }
    const factor = 80;
    canvas.width = 16 * factor;
    canvas.height = 9 * factor;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return;
    }
    let grid = [
        [null, null, null, null, null, null, null, null],
        [null, null, null, "blue", null, null, null, null],
        [null, null, "gray", "orange", null, null, null, null],
        [null, "red", null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
    ];
    const gridSize = getGridSize(grid);
    const cellSize = ctx.canvas.width * 0.03;
    const minimapSize = gridSize.scale(cellSize);
    const minimapOffset = new Vector2(ctx.canvas.width * 0.02, ctx.canvas.width * 0.02);
    const player = new Player(new Vector2(gridSize.x * 0.63, gridSize.y * 0.70), Math.PI * 1.25);
    window.addEventListener("keydown", (event) => {
        switch (event.key) {
            case "a":
                player.direction -= Math.PI / 10;
                ctx.strokeStyle = "#101010";
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                render(ctx, grid, player);
                drawMinimap(ctx, player, minimapOffset, minimapSize, grid);
                break;
            case "d":
                player.direction += Math.PI / 10;
                ctx.strokeStyle = "#101010";
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                render(ctx, grid, player);
                drawMinimap(ctx, player, minimapOffset, minimapSize, grid);
                break;
            case "w":
                player.position = player.position.add(Vector2.fromAngle(player.direction).scale(0.25));
                ctx.strokeStyle = "#101010";
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                render(ctx, grid, player);
                drawMinimap(ctx, player, minimapOffset, minimapSize, grid);
                break;
            case "s":
                player.position = player.position.sub(Vector2.fromAngle(player.direction).scale(0.25));
                ctx.strokeStyle = "#101010";
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                render(ctx, grid, player);
                drawMinimap(ctx, player, minimapOffset, minimapSize, grid);
                break;
            default:
                break;
        }
    });
    ctx.strokeStyle = "#101010";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    render(ctx, grid, player);
    drawMinimap(ctx, player, minimapOffset, minimapSize, grid);
})();
//# sourceMappingURL=index.js.map