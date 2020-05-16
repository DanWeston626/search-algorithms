// Pathing grid graph element
class GridElement {
    constructor (x, y, width, height, iX, iY) {
        
        this.ident = "Element {0},{1}".format(iX, iY);

        // x,y position in the world
        this.x = x;
        this.y = y; 
        
        // x,y position in the grid
        this.iX = iX;
        this.iY = iY;
        
        // this element width,height 
        this.width = width;
        this.height = height;

        // gets set after ctor (where these nodes are instantiated)
        // we use a flattened array, cache the index to stop calculating
        this.flatIndex = 0;

        // is this element walkable? 
        this.traversable = true;

        // edge weight (Dijkstra/A*)
        this.weight = 1;

        this.drawGraphic();
                
        this.onPlanPath = function (){};       
            
        // this.graphic.on('mouseup', function(event) {
        //     _this.drawGraphic(_this.fillColor, _this.lineColor);
        // });

        // this.graphic.on('mouseout', function(event) {
        //     _this.drawGraphic(_this.fillColor, _this.lineColor);
        // });

        // text representation of the weight
        //this.text = this.createText(this.weight, this.x, this.y);
    }

    setTraversable (traversable) {
        this.traversable = traversable;
        this.weight = 9999;
        if (!traversable) {
            this.drawGraphic(defaultBlockedColor);
        }
    }

    drawGraphic (fillColor = defaultCellColor, lineColor = defaultLineColor) {
        if (this.graphic == null) {
            this.graphic = new PIXI.Graphics();
            this.graphic.interactive = true;
            app.stage.addChild(this.graphic);     
        }

        this.graphic.clear();
        this.graphic.lineStyle(2, lineColor, 1);
        this.graphic.beginFill(fillColor, 1);
        this.graphic.drawRect(this.x, this.y, this.width, this.height);
        this.graphic.endFill();
    }

    // create and return a new pixi text element (this func will add it to the scene)
    createText (str, x, y) {
        const style = {
            font : 'bold 12px Arial',
            fill : '#000000',
            wordWrap : true,
            wordWrapWidth : 440
        };

        let text = new PIXI.Text(str, style);
        text.x = x;
        text.y = y;      
        app.stage.addChild(text);
        return text;
    }
}

// The Grid containing GridElements 
class Grid {

    // pixel width, pixel heigh, square size of GridElements
    constructor(width, height, size = 20) {
        this.grid = [];

        // the a/b for the path
        this.startEnd = []        

        // how many pixels wide and high we want this grid to be
        this.pixelWidth = width;
        this.pixelHeight = height;
        console.log("pixel width: %d, pixel height: %d", this.pixelWidth, this.pixelHeight);

        // how many GridElements wide and high the Grid is.
        this.width = Math.ceil(width / size);
        this.height = Math.ceil(height / size);
        console.log("width: %d, height: %d", this.width, this.height);

        this.createGrid(width, height, size);        
    }

    // create a new grid for pathing    
    createGrid (width, height, size) {
        var size = 20;
        var iX = 0, iY = 0;

        for(var y = 5, county = height; y < county; y += size) {
            for(var x = 5, countx = width; x < countx; x += size) {                
                let element = new GridElement(x,y,size,size, iX, iY);
                
                // cache the flattened array index
                element.flatIndex = iX * this.width + iY;

                let _this = this;
                // TODO: figure this out properly
                element.graphic.on('mousedown', function(event) {
                    //console.log("Button {0}".format(event.data.button))      
                    if (event.data.button == 0) { // left click
                        element.drawGraphic(defaultPathColour);         
                        _this.reportClick(element);
                    }
        
                    if (event.data.button == 1) { // Middle mouse click
                        //element.setTraversable(false);
                        _this.grid[element.flatIndex].weight = 1000;
                        // _this.grid[element.flatIndex].text.text = _this.grid[element.flatIndex].weight;
                        element.drawGraphic(defaultBlockedColor);         
                        console.log (_this.grid[element.flatIndex]);
                    }
                });

                // create a flattened 2D array ;) 
                this.grid[iX * this.width + iY] = element;
                iX++;
            }
            iY++;
            iX = 0;
        }       
    }
    
    // called when an GridElement is left clicked
    reportClick (element) {
        console.log("pushing element {0} and length is {1}".format(element.ident, this.startEnd.length));

        // clear the last two nodes
        if (this.startEnd.length >= 2) {
            for (let i = 0, counti = this.startEnd.length; i < counti; i++) {
                this.startEnd[i].drawGraphic();
            }
            this.startEnd = [];
        }

        this.startEnd.push(element);        
    }

    // shorthand for accessing our flattend array
    elementAt (x, y) {
        return this.grid[x * this.width + y]
    }

    // get all the neighbours of GridElement element
    neighbours (element) {
        var x = element.iX;
        var y = element.iY;

        var neighbours = [];       
        
         // left neighbour
        if (x-1 >= 0) {
            //this.elementAt (x-1, y).drawGraphic(element.lineColor, element.lineColor);      
            element = this.elementAt (x-1, y);
            //if (element != null && !element.visited) {         
                neighbours.push(element);
            //}
        }

        // top neighbour 
        if (y+1 < this.height) {
            //this.elementAt (x, y+1).drawGraphic(element.lineColor, element.lineColor);                  
            element = this.elementAt (x, y+1);
            //if (element != null && !element.visited) {         
                neighbours.push(element);
            //}
        }

        // right neighbour
        if (x+1 < this.width) {
            //this.elementAt (x+1, y).drawGraphic(element.lineColor, element.lineColor);            
            element = this.elementAt (x+1, y);
            //if (element != null && !element.visited) {         
                neighbours.push(element);
            //}
        }

        // bottom neighbour 
        if (y-1 >= 0) {
            //this.elementAt (x, y-1).drawGraphic(element.lineColor, element.lineColor);              
            element = this.elementAt (x, y-1);
            //if (element != null && !element.visited) {         
                neighbours.push(element);
            //}
        }

        return neighbours;
    }

    // default all the GridElements inside the grid, do you want to reset non-traversable elements? 
    clear (traversables = false) {        
        for (let i = 0, counti = this.grid.length; i < counti; i++) {
            if (traversables && !this.grid[i].traversable) {
                this.grid[i].drawGraphic();
                this.grid[i].traversable = true;
            } else {
                this.grid[i].drawGraphic();
            }
        }
    }
}