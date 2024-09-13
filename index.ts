class Vector2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
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
    const p1 = new Vector2(TOTAL_COLS * 0.33, TOTAL_ROWS * 0.44)
    drawCircle(ctx, p1, 0.2)

    if (p2) {
        drawCircle(ctx, p2, 0.2)

        ctx.strokeStyle = "magenta"
        strokeLine(ctx, p1, p2)
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
