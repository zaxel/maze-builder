
let restartMaze;
let nightMode = false;
let speed = 5; // 1 to 10;
let cellsDense = 5; // 1 to 10;

let cellBorderColor;
let visitedCellColor;
let highlightedCellColor;
let cellBackgroundColor;

const drawMaze = () => {
    const burger = document.getElementById('burger');
    const canvas = document.getElementById("maze__canvas");
    const ctx = canvas.getContext("2d");
    let cellsWithChanges = {};
    let grid = [];
    let stack = [];
    let w; //width === height
    
    const cellBorderColor_night = '#DBBEA1FF';
    const visitedCellColor_night = '#A37B73FF';
    const highlightedCellColor_night = '#D34F73FF';
    const cellBackgroundColor_night = '#3E282BFF';

    const cellBorderColor_day = '#3A6B34';
    const visitedCellColor_day = '#E3B448';
    const highlightedCellColor_day = '#FE2020';
    const cellBackgroundColor_day = '#CBD28F';

    let cols;
    let rows;
    let current;
    let drawInterval;

    const getAvailableScreenSize = () => {
        const height = document.body.firstElementChild.clientHeight;
        const width = document.body.firstElementChild.clientWidth;
        return [height, width];
    }
    const setDayColors = () => {
        cellBorderColor = cellBorderColor_day;
        visitedCellColor = visitedCellColor_day;
        highlightedCellColor = highlightedCellColor_day;
        cellBackgroundColor = cellBackgroundColor_day;
        burger.classList.remove('dark-bg-burger');
        document.body.classList.remove('dark-bg-body');
    }
    const setNightColors = () => {
        cellBorderColor = cellBorderColor_night;
        visitedCellColor = visitedCellColor_night;
        highlightedCellColor = highlightedCellColor_night;
        cellBackgroundColor = cellBackgroundColor_night;
        burger.classList.add('dark-bg-burger');
        document.body.classList.add('dark-bg-body');
    }
    const handleNightMode = () => {
        nightMode ? setNightColors() : setDayColors();
    }
    const getRoundedScreenSize = (d, cellWidth) => {
        return Math.floor(d / cellWidth) * cellWidth;
    }
    const printLine = (ctx, x, y, walls) => {
        ctx.strokeStyle = cellBorderColor;

        //top line
        if (walls[0]) {
            ctx.beginPath();
            ctx.setLineDash([]);
            ctx.moveTo(x, y);
            ctx.lineTo(x + w, y);
            ctx.stroke();
        }
        //right line
        if (walls[1]) {
            ctx.beginPath();
            ctx.setLineDash([]);
            ctx.moveTo(x + w, y);
            ctx.lineTo(x + w, y + w);
            ctx.stroke();
        }
        //bottom line
        if (walls[2]) {
            ctx.beginPath();
            ctx.setLineDash([]);
            ctx.moveTo(x, y + w);
            ctx.lineTo(x + w, y + w);
            ctx.stroke();
        }
        //left line
        if (walls[3]) {
            ctx.beginPath();
            ctx.setLineDash([]);
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + w);
            ctx.stroke();
        }

    }
    const printRect = (ctx, x, y, highlighted) => {
        ctx.fillStyle = highlighted ? highlightedCellColor : visitedCellColor;
        ctx.beginPath();
        ctx.rect(x, y, w, w);
        ctx.fill();
    }
    const removeWalls = (curr, next) => {
        if(curr.r>next.r){
            curr.walls[0] = false;
            next.walls[2] = false;
        }
        if(curr.c>next.c){
            curr.walls[3] = false;
            next.walls[1] = false;
        }
        if(curr.r<next.r){
            next.walls[0] = false;
            curr.walls[2] = false;
        }
        if(curr.c<next.c){
            curr.walls[1] = false;
            next.walls[3] = false;
        }
    }
    const getCellWidth = dense => {
        (dense < 1) && (dense = 1); 
        (dense > 10) && (dense = 10);
        return Math.floor(100/dense);
    }
    const setInitPopupDatas = formData => {
        if(formData.has('speed')){
            speed = formData.get('speed') ? formData.get('speed')/10 : 1; 
        }
        if(formData.has('dense')){
            cellsDense = formData.get('dense') ? formData.get('dense')/10 : 1; 
        }
        nightMode = formData.has('mode'); 
    }
    const clearMaze = () => {
        clearInterval(drawInterval);
        cellsWithChanges = {};
        grid = [];
        stack = [];
    }
    restartMaze = (formData) => {
        setInitPopupDatas(formData);
        clearMaze();
        handleNightMode();
        drawMaze();
    }
    const setCellsToBeChanged = (i, isAvailable) => {
        if(i!==undefined){
            cellsWithChanges[i] = isAvailable;
        }
    }
    class Cell {
        constructor(r, c) {
            this.r = r;
            this.c = c;
            this.visited = false;
            this.highlighted = false;
            this.walls = [true, true, true, true]; //top, right, bottom, left
        }
        show() {
            const y = this.r * w;
            const x = this.c * w;
            if (this.visited) {
                printRect(ctx, x, y, this.highlighted);
            }
            printLine(ctx, x, y, this.walls);
        }
        getIndex(r, c){
            if(r<0 || c<0 || r>rows-1 || c>cols-1){
                return -1;
            }
            return c + r*cols;
        }
        checkNeighbors() {
            const neighbors = [];
            const isVisited = (cell) => {
                return cell.visited;
            }
            const addUnvisitedNeighbors = (list=[]) => {
                list.forEach(cell=>{
                    if(cell && !isVisited(cell)){
                        neighbors.push(cell);
                    }
                })
            }
            const randomNeighbor = () => {
                if(neighbors.length){
                    const random = Math.floor(Math.random()*neighbors.length);
                    return neighbors[random];
                }
            }
            const getNeighborsIndexes = () => {
                // const index = r + c *cols;  //two dimensional array indexes convert to one dimension
                const top = grid[this.getIndex(this.r-1, this.c)];      
                const right = grid[this.getIndex(this.r, this.c+1)];    
                const bottom = grid[this.getIndex(this.r+1, this.c)];   
                const left = grid[this.getIndex(this.r, this.c-1)];     
                
                addUnvisitedNeighbors([top,right,bottom,left]);
                return randomNeighbor();
            }
            return getNeighborsIndexes();
        }
    }
    const mazeSpeed = () => {
        (speed < 1) && (speed = 1); 
        (speed > 10) && (speed = 10); 
        return Math.floor(5000/10/speed);
    }
    const setUp = () => {
        const [availableHeight, availableWidth] = getAvailableScreenSize();
        w = getCellWidth(cellsDense);
        canvas.width = getRoundedScreenSize(availableWidth, w);
        canvas.height = getRoundedScreenSize(availableHeight, w);
        handleNightMode();
        canvas.style.backgroundColor = cellBackgroundColor;
        cols = canvas.width / w;
        rows = canvas.height / w;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let cell = new Cell(r, c);
                grid.push(cell);
                setCellsToBeChanged(cell.getIndex(r,c), true);
            }
        }
        current = grid[0];
    }
    const draw = () => {
        for (let i = 0; i < grid.length; i++) {
            if(cellsWithChanges[i]){
            grid[i].show();
            setCellsToBeChanged(i, false);
        }
        }
        const currentIndex = current.getIndex(current.r, current.c);
        setCellsToBeChanged(currentIndex, true);
        current.visited = true;
        const next  = current.checkNeighbors();
        const nextIndex = next?.getIndex(next.r, next.c);
        setCellsToBeChanged(nextIndex, true);
        if(next){
            next.visited = true;
            current.highlighted = false;
            next.highlighted = true;
            stack.push(current);
            removeWalls(current, next);
            current = next;
        }
        else if(stack.length){
            current.highlighted = false;
            setCellsToBeChanged(nextIndex, false);
            current = stack.pop();
            const currentIndex = current.getIndex(current.r, current.c);
            setCellsToBeChanged(currentIndex, true);
            current.highlighted = true;
        }
    }

    setUp();
    drawInterval = setInterval(()=>{
        window.requestAnimationFrame(draw)
    }, mazeSpeed())

}
export {restartMaze};

drawMaze();

