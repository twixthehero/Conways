(function()
{
    "use strict";

    var UPDATES_PER_SECOND = 5;
    var UPDATE_PERIOD = 1000 / UPDATES_PER_SECOND;
    var updateTimer = 0;

    var canvas;
    var ctx;
    var actx;
    var updateTimeout;

    var NUMROWS = 80;
    var NUMCOLS = 100;
    var TOTALCELLS = NUMROWS * NUMCOLS;
    var CELLSIZE = 10;
    var cells = [];
    var cellstemp = [];
    var numAlive = 3;

    var note;
    var octave;

    var paused = true;
    var dt;
    var lastTime;

    window.onload = init;
    window.onmouseup = mouseup;

    function init()
    {
        canvas = document.querySelector("canvas");
        ctx = canvas.getContext("2d");
        actx = new AudioContext();
        lastTime = Date.now();

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
        speed.oninput = function()
        {
            UPDATES_PER_SECOND = 10 * parseInt(speed.value) / 100 + 2.5;
            UPDATE_PERIOD = 1000 / UPDATES_PER_SECOND;
        };

        var randomize = document.querySelector("#random");
        randomize.onclick = function()
        {
            for (var r = 0; r < NUMROWS; r++)
                for (var c = 0; c < NUMCOLS; c++)
                {
                    if (Math.random() < 0.35)
                        cells[r][c] = 1;
                    else
                        cells[r][c] = 0;
                }
        };

        var clear = document.querySelector("#clear");
        clear.onclick = function()
        {
            for (var r = 0; r < NUMROWS; r++)
            {
                for (var c = 0; c < NUMCOLS; c++)
                {
                    cells[r][c] = 0;
                }
            }
        };
    }

    function playNote(freq, dur)
    {
        var osc = actx.createOscillator();
        osc.type = "square";
        osc.frequency.value = freq;
        osc.connect(actx.destination);
        osc.start();
        osc.stop(actx.currentTime + dur);
    }

    function update()
    {
        numAlive = 0;

        for (var r = 0; r < NUMROWS; r++)
        {
            for (var c = 0; c < NUMCOLS; c++)
            {
                var neighbors = getNumNeighbors(r, c);
                var alive = cells[r][c] == 1;

                if (!alive && neighbors == 3)
                {
                    cellstemp[r][c] = 1;
                    numAlive++;
                }
                else if (alive && neighbors > 3)
                    cellstemp[r][c] = 0;
                else if (alive && neighbors < 2)
                    cellstemp[r][c] = 0;
                else if (alive)
                {
                    cellstemp[r][c] = 1;
                    numAlive++;
                }
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

        return neighbors;
    }

    function render()
    {
        dt = Date.now() - lastTime;
        lastTime = Date.now();
        updateTimer += dt;

        if (!paused)
        {
            if (updateTimer >= UPDATE_PERIOD)
            {
                updateTimeout = setTimeout(update, 0);
                updateTimer = 0;
            }

            switch (numAlive % 7)
            {
                case 0: note = "a";
                    break;
                case 1: note = "b";
                    break;
                case 2: note = "c";
                    break;
                case 3: note = "d";
                    break;
                case 4: note = "e";
                    break;
                case 5: note = "f";
                    break;
                case 6: note = "g";
                    break;
            }

            octave = Math.round((TOTALCELLS - numAlive) / TOTALCELLS * 8);

            playNote(teoria.note(note + octave).fq(), 0.05);
        }

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
