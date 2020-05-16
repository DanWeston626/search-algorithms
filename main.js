

const app = new PIXI.Application(410, 410);

const defaultCellColor = 0xFFFFFF;
const defaultLineColor = 0x29666C;
const defaultVisitedColor = 0xF283A0;
const defaultBlockedColor = 0x990000;
const defaultPathColour = 0xff9933;

// Small class to easily visulase the output of the Search algorithms
class Visualisation {
    constructor (alpha, color) {
        // list of drawn nodes
        this.drawn = [];

        // action to perform after draw has completed
        this.onComplete = ()=>{};

        // the alpha of the visualisation
        this.alpha = alpha;

        // color to draw the visualisation
        this.color = color;
    }

    // draw all past nodes, note this func will use recursion
    draw (nodes) {
        
        let index = 0;              
        var d = () => {
            let e = nodes[index];
            
            this.drawGraphic(e.x, e.y, e.width, e.height);
            
            index++;
            if (index < nodes.length) {
                setTimeout(()=>{d(index)}, 0.025);
            } else {
                // chain actions
                this.onComplete();
                return;
            }
        };
        d();
    }

    // draw a rect at the given loc with passed colors
    drawGraphic (x, y, width, height) {
        let graphic = new PIXI.Graphics();        
        app.stage.addChild(graphic); 

        graphic.clear();
        graphic.lineStyle(2, this.color, 1);
        graphic.beginFill(this.color, 1);
        graphic.drawRect(x, y, width, height);
        graphic.endFill();    
        graphic.alpha = this.alpha;
        this.drawn.push(graphic);
    }

    clear () {
        for (let i = 0, counti = this.drawn.length; i < counti; i++ ){
            app.stage.removeChild(this.drawn[i]);             
        }
        this.drawn = [];
    }
}

class Scene {
    constructor () {
        // pixi stage init
        this.stage = app.stage;            
        var div = document.getElementById('stage-search');
        div.insertBefore(app.view, div.firstChild);
        
        var resize = ()=> {                                            
            const parent = app.view.parentElement;
            let ratioX = parent.clientWidth / 400;                
            app.renderer.resize(400*ratioX, 400*ratioX);
        };            
        window.addEventListener('resize', resize);

        // create a new grid of GridElements
        this.grid = new Grid(400, 400);

        // create new search algorithm
        this.search = new BreadthFirst(this.grid);

        // collection of visulation classes - use this for drawing the search and path
        this.visualisations = [];
        this.walls = [];

        let that = this; 
        // clean up method
        let clear  = (walls)=> {
            that.grid.clear();            
            for(let i = 0, counti = that.visualisations.length; i < counti; ++i) {
                that.visualisations[i].clear();
            }
            that.visualisations = [];

            if (walls) {
                for(let i = 0, counti = that.walls.length; i < counti; ++i) {
                    that.walls[i].clear();
                }
                that.walls = [];
            }
        };

        // set up path html button
        this.pathButton = document.getElementById("path");
        if (this.pathButton != null) {
            let callback = ()=> {clear(false); that.path();}
            this.pathButton.addEventListener("click", ()=>{callback()}, false);
        }           

        // set up clear html button
        this.clearButton = document.getElementById("clear");
        if (this.clearButton != null) {            
            this.clearButton.addEventListener("click", ()=>{clear(true); that.grid.startEnd = [];}, false);
        }   
                
        // set up clear html button
        this.algorithmSelect = document.getElementById("algorithm");
        this.algorithmSelect.value = "BreadthFirst"
        if (this.algorithmSelect != null) {    
            let callback = ()=> {               
                if (that.algorithmSelect.value == "BreadthFirst") {
                    that.search = new BreadthFirst(that.grid)
                }

                if (that.algorithmSelect.value == "Dijkstra") {
                    that.search = new Dijkstra(that.grid)
                }

                if (that.algorithmSelect.value == "AStar") {
                    that.search = new AStar(that.grid)
                }
            }        
            that.algorithmSelect.addEventListener("click", ()=>{callback()}, false);
        }  

        this.costText = document.getElementById("cost");
        if (this.costText  == null) {
            console.log("Unable to find h \"cost\"");
        }
        resize();
    }

    // callback for path button
    path () {       
        if (this.grid.startEnd.length < 2) {
            console.log("Path was called but grid has not configured a start and end");
            return;
        }

        this.algorithmSelect.disabled = true;
        this.pathButton.disabled = true;
        this.clearButton.disabled = true;
        
        // this.timer.begin();
        this.search.path(this.grid.startEnd[0], this.grid.startEnd[1]);
        // this.timer.end();
        // console.log("Search took {0}ms".format(this.timer.time()));

        let that = this;
        // configure visualisations
        let search = new Visualisation(0.45, defaultVisitedColor);
        let path = new Visualisation(0.65, defaultPathColour);  
        // set up chain of draws 
        search.onComplete = ()=> {
            path.draw(that.search.pathElements);    
            this.algorithmSelect.disabled = false;
            this.pathButton.disabled = false;
            this.clearButton.disabled = false;
            this.costText.innerHTML = "Cost: {0}".format(this.search.cost);
        };

        // add to list of things which have been drawn
        this.visualisations.push(search);
        this.visualisations.push(path);

        // draw our current visualisation 
        search.draw(this.search.visitedElements);
    }    
}

var scene = new Scene();
