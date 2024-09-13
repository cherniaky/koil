var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var Vector2 = /** @class */ (function () {
    function Vector2(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector2.prototype.array = function () {
        return [this.x, this.y];
    };
    return Vector2;
}());
function strokeLine(ctx, p1, p2) {
    ctx.beginPath();
    ctx.moveTo.apply(ctx, p1.array());
    ctx.lineTo.apply(ctx, p2.array());
    ctx.stroke();
}
function drawCircle(ctx, center, radius) {
    ctx.beginPath();
    ctx.arc.apply(ctx, __spreadArray(__spreadArray([], center.array(), false), [radius, 0, 2 * Math.PI], false));
    ctx.fill();
}
var TOTAL_ROWS = 10, TOTAL_COLS = 10;
function drawGrid(ctx, p2) {
    ctx.reset();
    var col_width = ctx.canvas.width / TOTAL_COLS;
    var rows_height = ctx.canvas.height / TOTAL_ROWS;
    ctx.scale(col_width, rows_height);
    ctx.lineWidth = 0.02;
    ctx.strokeStyle = "#101010";
    ctx.fillRect(0, 0, TOTAL_COLS, TOTAL_ROWS);
    ctx.strokeStyle = "#444444";
    for (var x = 0; x <= TOTAL_COLS; x++) {
        strokeLine(ctx, new Vector2(x, 0), new Vector2(x, TOTAL_ROWS));
    }
    for (var y = 0; y <= TOTAL_ROWS; y++) {
        strokeLine(ctx, new Vector2(0, y), new Vector2(TOTAL_COLS, y));
    }
    ctx.fillStyle = "magenta";
    var p1 = new Vector2(TOTAL_COLS * 0.33, TOTAL_ROWS * 0.44);
    drawCircle(ctx, p1, 0.2);
    if (p2) {
        drawCircle(ctx, p2, 0.2);
        ctx.strokeStyle = "magenta";
        strokeLine(ctx, p1, p2);
    }
}
(function () {
    var canvas = document.querySelector("#game");
    if (!canvas) {
        return;
    }
    canvas.width = 800;
    canvas.height = 800;
    var ctx = canvas.getContext("2d");
    if (!ctx) {
        return;
    }
    var col_width = ctx.canvas.width / TOTAL_COLS;
    var rows_height = ctx.canvas.height / TOTAL_ROWS;
    var p2;
    canvas.addEventListener("mousemove", function (event) {
        p2 = new Vector2(event.offsetX / col_width, event.offsetY / rows_height);
        drawGrid(ctx, p2);
    });
    drawGrid(ctx, p2);
})();
