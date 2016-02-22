(function()
{
    "use strict";

    var canvas;
    var ctx;
    var updateTimeout;

    var NUMROWS = 80;
    var NUMCOLS = 100;
    var CELLSIZE = 10;
    var cells = [];
    var cellstemp = [];

    var paused = true;

    window.onload = init;
    window.onmouseup = mouseup;

    function init()
    {
        canvas = document.querySelector("canvas");
        ctx = canvas.getContext("2d");

        createUI();

        for (var r = 0; r < NUMROWS; r++)
        {
            cells[r] = [];
            cellstemp[r] = [];

            for (var c = 0; c < NUMCOLS; c++)
            {
                cells[r][c] = 0;
                cellstemp[r][c] = 0;
            }
        }

        cells[10][10] = 1;
        cells[10][11] = 1;
        cells[10][12] = 1;

        window.requestAnimationFrame(render)
    }

    function createUI()
    {
        var play = document.querySelector("#play");
        play.onclick = function()
        {
            paused = !paused;

            if (paused)
            {
                play.innerHTML = "Play";
                clearTimeout(updateTimeout);
            }
            else
                play.innerHTML = "Pause";
        };

        var speed = document.querySelector("#speed");
        speed.onchange = function()
        {

        };
    }

    function update()
    {
        for (var r = 0; r < NUMROWS; r++)
        {
            for (var c = 0; c < NUMCOLS; c++)
            {
                var neighbors = getNumNeighbors(r, c);
                var alive = cells[r][c] == 1;

                if (!alive && neighbors == 3)
                    cellstemp[r][c] = 1;
                else if (alive && neighbors > 3)
                    cellstemp[r][c] = 0;
                else if (alive && neighbors < 2)
                    cellstemp[r][c] = 0;
                else if (alive)
                    cellstemp[r][c] = 1;
                else
                    cellstemp[r][c] = 0;
            }
        }

        for (var r = 0; r < NUMROWS; r++)
        {
            for (var c = 0; c < NUMCOLS; c++)
            {
                cells[r][c] = cellstemp[r][c];
            }
        }
    }

    function getNumNeighbors(r, c)
    {
        var neighbors = 0;

        for (var x = -1; x <= 1; x++)
        {
            for (var y = -1; y <= 1; y++)
            {
                if (x == 0 && y == 0) continue;

                if (cells[(r + y + NUMROWS) % NUMROWS][(c + x + NUMCOLS) % NUMCOLS] == 1)
                    neighbors++;
            }
        }

        if (r == 0 && c == 0)
            console.log(neighbors);

        return neighbors;
    }

    function render()
    {
        if (!paused)
            updateTimeout = setTimeout(update, 1000);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //draw cells
        for (var c = 0; c < NUMCOLS; c++)
        {
            for (var r = 0; r < NUMROWS; r++)
            {
                if (cells[r][c] == 0)
                    ctx.fillStyle = "white";
                else
                    ctx.fillStyle = "black";

                ctx.fillRect(c * CELLSIZE, r * CELLSIZE, CELLSIZE, CELLSIZE);
            }
        }

        //draw grid
        ctx.strokeStyle = "grey";
        for (var c = 0; c < NUMCOLS + 1; c++)
        {
            ctx.beginPath();
            ctx.moveTo(c * CELLSIZE, 0);
            ctx.lineTo(c * CELLSIZE, NUMROWS * CELLSIZE);
            ctx.closePath();
            ctx.stroke();
        }
        for (var r = 0; r < NUMROWS + 1; r++)
        {
            ctx.beginPath();
            ctx.moveTo(0, r * CELLSIZE);
            ctx.lineTo(NUMCOLS * CELLSIZE, r * CELLSIZE);
            ctx.closePath();
            ctx.stroke();
        }

        window.requestAnimationFrame(render);
    }

    function mouseup(e)
    {
        var r = Math.floor(e.y / CELLSIZE);
        var c = Math.floor(e.x / CELLSIZE);

        if (r >= NUMROWS || c >= NUMCOLS || r < 0 || c < 0) return;

        cells[r][c] = (cells[r][c] + 1) % 2;
    }
})();
