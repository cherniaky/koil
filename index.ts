class Vector2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(that: Vector2) {
        return new Vector2(this.x + that.x, this.y + that.y)
    }

    sub(that: Vector2) {
        return new Vector2(this.x - that.x, this.y - that.y)
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    norm() {
        const length = this.length()
        return new Vector2(this.x / length, this.y / length)
    }

    distanceTo(that: Vector2) {
        return this.sub(that).length()
    }

    array(): [number, number] {
        return [this.x, this.y]
    }
}

function strokeLine(ctx: CanvasRenderingContext2D, p1: Vector2, p2: Vector2) {
    ctx.beginPath()
    ctx.moveTo(...p1.array())
    ctx.lineTo(...p2.array())
    ctx.stroke()
}

function drawCircle(ctx: CanvasRenderingContext2D, center: Vector2, radius: number) {
    ctx.beginPath()
    ctx.arc(...center.array(), radius, 0, 2 * Math.PI)
    ctx.fill()
}

const TOTAL_ROWS = 10, TOTAL_COLS = 10;


function snap(value: number, d: number): number {
    const eps = 1e-6;
    if (d > 0) {
        return Math.ceil(value + eps);
    }
    if (d < 0) {
        return Math.floor(value - eps)
    }

    return value
}

function rayStep(p1: Vector2, p2: Vector2) {
    // y1 = k * x1 + c
    // y2 = k * x2 + c
    // c = y1 - k * x1
    // y2 = k * x2 + y1 - k * x1
    // y2 - y1 = k * (x2 - x1)
    // k = (y2 - y1) / (x2 - x1) 
    // c = y1 - k * x1

    const dy = (p2.y - p1.y)
    const dx = (p2.x - p1.x)

    let p3 = p2;
    if (dx !== 0) {
        const k = dy / dx
        const c = p1.y - k * p1.x

        const x3 = snap(p2.x, dx)
        const y3 = x3 * k + c;

        p3 = new Vector2(x3, y3)

        if (k !== 0) {
            const y3_candidate = snap(p2.y, dy)
            const x3_candidate = (y3_candidate - c) / k;

            const p3_candidate = new Vector2(x3_candidate, y3_candidate);

            if (p2.distanceTo(p3) > p2.distanceTo(p3_candidate)) {
                p3 = p3_candidate;
            }
        }
    }
    else {
        const x3 = p2.x
        const y3 = snap(p2.y, dy)

        p3 = new Vector2(x3, y3)
    }

    return p3
}

function drawGrid(ctx: CanvasRenderingContext2D, p2: Vector2 | undefined) {
    ctx.reset()

    const col_width = ctx.canvas.width / TOTAL_COLS;
    const rows_height = ctx.canvas.height / TOTAL_ROWS;

    ctx.scale(col_width, rows_height)
    ctx.lineWidth = 0.02

    ctx.strokeStyle = "#101010";
    ctx.fillRect(0, 0, TOTAL_COLS, TOTAL_ROWS);

    ctx.strokeStyle = "#444444"
    for (let x = 0; x <= TOTAL_COLS; x++) {
        strokeLine(ctx, new Vector2(x, 0), new Vector2(x, TOTAL_ROWS))
    }

    for (let y = 0; y <= TOTAL_ROWS; y++) {
        strokeLine(ctx, new Vector2(0, y), new Vector2(TOTAL_COLS, y))
    }

    ctx.fillStyle = "magenta"
    let p1 = new Vector2(TOTAL_COLS * 0.33, TOTAL_ROWS * 0.44)
    drawCircle(ctx, p1, 0.2)

    if (p2) {
        drawCircle(ctx, p2, 0.2)

        ctx.strokeStyle = "magenta"
        strokeLine(ctx, p1, p2)

        for (let i = 0; i < 5; i++) {
            const p3 = rayStep(p1, p2)

            drawCircle(ctx, p3, 0.2)

            strokeLine(ctx, p3, p2)

            p1 = p2
            p2 = p3
        }
    }
}

(() => {
    const canvas = document.querySelector("#game") as (HTMLCanvasElement | null);

    if (!canvas) {
        return
    }

    canvas.width = 800;
    canvas.height = 800;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
        return
    }

    const col_width = ctx.canvas.width / TOTAL_COLS;
    const rows_height = ctx.canvas.height / TOTAL_ROWS;

    let p2: undefined | Vector2;
    canvas.addEventListener("mousemove", (event) => {
        p2 = new Vector2(event.offsetX / col_width, event.offsetY / rows_height);

        drawGrid(ctx, p2)
    })

    drawGrid(ctx, p2)

})()
