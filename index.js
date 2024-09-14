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
    Vector2.prototype.add = function (that) {
        return new Vector2(this.x + that.x, this.y + that.y);
    };
    Vector2.prototype.sub = function (that) {
        return new Vector2(this.x - that.x, this.y - that.y);
    };
    Vector2.prototype.length = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    Vector2.prototype.norm = function () {
        var length = this.length();
        return new Vector2(this.x / length, this.y / length);
    };
    Vector2.prototype.distanceTo = function (that) {
        return this.sub(that).length();
    };
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
function snap(value, d) {
    var eps = 1e-6;
    if (d > 0) {
        return Math.ceil(value + eps);
    }
    if (d < 0) {
        return Math.floor(value - eps);
    }
    return value;
}
function rayStep(p1, p2) {
    // y1 = k * x1 + c
    // y2 = k * x2 + c
    // c = y1 - k * x1
    // y2 = k * x2 + y1 - k * x1
    // y2 - y1 = k * (x2 - x1)
    // k = (y2 - y1) / (x2 - x1) 
    // c = y1 - k * x1
    var dy = (p2.y - p1.y);
    var dx = (p2.x - p1.x);
    var p3 = p2;
    if (dx !== 0) {
        var k = dy / dx;
        var c = p1.y - k * p1.x;
        var x3 = snap(p2.x, dx);
        var y3 = x3 * k + c;
        p3 = new Vector2(x3, y3);
        if (k !== 0) {
            var y3_candidate = snap(p2.y, dy);
            var x3_candidate = (y3_candidate - c) / k;
            var p3_candidate = new Vector2(x3_candidate, y3_candidate);
            if (p2.distanceTo(p3) > p2.distanceTo(p3_candidate)) {
                p3 = p3_candidate;
            }
        }
    }
    else {
        var x3 = p2.x;
        var y3 = snap(p2.y, dy);
        p3 = new Vector2(x3, y3);
    }
    return p3;
}
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
        for (var i = 0; i < 5; i++) {
            var p3 = rayStep(p1, p2);
            drawCircle(ctx, p3, 0.2);
            strokeLine(ctx, p3, p2);
            p1 = p2;
            p2 = p3;
        }
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
