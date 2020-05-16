// base strategy class for search algorithms
class Search {
    constructor (grid) {
        // a Grid instance
        this.grid = grid;
        this.pathElements = [];
        this.visitedElements = [];

        // array to track "breadcrumbs" of each vistied nodes. 
        // Neigbour node index will be set to the node  
        // traveled from to get there
        this.cameFrom = [];

        // The final cost of the path        
        this.cost = 0;
    }

    // path from GraphElement a to b 
    path () {
        throw new Error('You have to implement the method path!');
    }

    // private func called from path. Using the constructed pathElements build path from a to b
    buildPath (a, b) {        
        let node = b;
        this.cost = 0;        
        while (node != a){
            if (node == null) break;
            this.pathElements.push(node);
            let index = node.flatIndex; 
            this.cost += node.weight;
            node = this.grid.grid[this.cameFrom[index]];
        }

        console.log("Path cost {0}".format(this.cost));
        this.pathElements.push(a);
    }
}

// breadth first search implementation
class BreadthFirst extends Search { 
    constructor (grid) {        
        super (grid);
        // stop searching once we find the target node when pathing? (b)
        this.earlyExit = true;
        this.costSoFar = []
    }

    path (a, b) {    
        this.cameFrom = []; 
        this.pathElements = [];
        this.visitedElements = []; 
        a.drawGraphic(defaultPathColour);
        b.drawGraphic(defaultPathColour);

        let queue = new Queue()
        queue.enqueue (a);
        
        // BitSet used to track what nodes in the grid have been visited
        let visited = new BitSet(this.grid.width * this.grid.height);

        while (!queue.isEmpty()) {

            let current = queue.dequeue();                        
            // get all the neighbours of the current node
            let neighbours = this.grid.neighbours(current);
            // check each neighbour
            for (let i = 0, counti = neighbours.length; i < counti; i++) {

                let neighbour = neighbours[i];                
                //if (neighbour.traversable) {
                    // has it been visited? 
                    if (!visited.isSet(neighbour.flatIndex)) {
                        // mark node as visited
                        visited.setAt(neighbour.flatIndex);
                        //neighbour.drawGraphic(defaultVisitedColor)
                        this.visitedElements.push (neighbour);
                        // tell this node where we came from
                        this.cameFrom[neighbour.flatIndex] = current.flatIndex;

                        if (neighbours[i] == b) {                         
                            this.buildPath(a, b);
                            return
                        } else {
                            // queue for the next iteration
                            queue.enqueue(neighbours[i]);
                        }
                    }
                //}
            }
        }
        this.buildPath(a, b);        
    }
}

// Dijstras algorithm implementation
class Dijkstra extends Search {
    constructor (grid) {        
        super (grid);

        // stop searching once we find the target node when pathing? (b)
        this.earlyExit = true;
    }

    path (a, b) {     
        this.cameFrom = []; 
        this.pathElements = [];
        this.visitedElements = []; 

        a.drawGraphic(defaultPathColour);
        b.drawGraphic(defaultPathColour);  
        
        // enqueue the starting node and give it the lowest weight 
        // (Dijkstra can't deal with negative weights)
        let queue = new PriorityQueue()
        queue.enqueue (a, 0);
        
        // for each node, track how much it cost to previously get here
        this.costSoFar = [];
        this.costSoFar[a.iX * this.grid.width + a.iY] = 0;
        
        while (!queue.isEmpty()) {

            let current = queue.dequeue(); 
            let node = current.element;            

            if (this.earlyExit && node == b) {
                this.buildPath(a, b);
                return;
            }

            // get all the neighbours of the current node
            let neighbours = this.grid.neighbours(node);          

            // check each neighbour
            for (let i = 0, counti = neighbours.length; i < counti; i++) {
                let neighbour = neighbours[i];
                let newCost = this.costSoFar[node.flatIndex] + neighbour.weight;

                // we've never been here OR we found a cheaper path
                if (this.costSoFar[neighbour.flatIndex] == null || newCost < this.costSoFar[neighbour.flatIndex]) {
                    // visualisation stuff...
                    this.visitedElements.push (neighbour);

                    // update the cost to this node and add to the queue
                    this.costSoFar[neighbour.flatIndex] = newCost;
                    queue.enqueue(neighbour, newCost);
                    // inform where we came from
                    this.cameFrom[neighbour.flatIndex] = node.flatIndex;
                }
            }
        }

        // !earlyExit
        this.buildPath(a, b);        
    }
}

// A* algorithm implementation
class AStar extends Search {
    constructor (grid) {        
        super (grid);

        // stop searching once we find the target node when pathing? (b)
        this.earlyExit = true;

        // Standard Heuristic function - default to Manhattan distance on a square grid
        this.heuristic = function (a, b) {
            return Math.abs(a.iX - b.iX) + Math.abs(a.iY - b.iY);
        }
    }

    path (a, b) {     
        this.cameFrom = []; 
        this.pathElements = [];
        this.visitedElements = [];

        a.drawGraphic(defaultPathColour);
        b.drawGraphic(defaultPathColour); 

        let queue = new PriorityQueue()
        queue.enqueue (a, 0);
        
        // for each node, track how much it cost to previously get here
        this.costSoFar = [];
        this.costSoFar[a.iX * this.grid.width + a.iY] = 0;
        
        while (!queue.isEmpty()) {

            let current = queue.dequeue(); 
            let node = current.element;            

            if (this.earlyExit && node == b) {
                this.buildPath(a, b);
                return;
            }

            // get all the neighbours of the current node
            let neighbours = this.grid.neighbours(node);          

            // check each neighbour
            for (let i = 0, counti = neighbours.length; i < counti; i++) {
                let neighbour = neighbours[i];
                let newCost = this.costSoFar[node.flatIndex] + neighbour.weight;

                // we've never been here OR we found a cheaper path
                if (this.costSoFar[neighbour.flatIndex] == null || newCost < this.costSoFar[neighbour.flatIndex]) {
                    // visualisation stuff...
                    this.visitedElements.push (neighbour);
                    // update the cost to this node and add to the queue - add the distance from this node to the goal                    
                    this.costSoFar[neighbour.flatIndex] = newCost;
                    queue.enqueue(neighbour, newCost +  this.heuristic(b, neighbour));
                    // inform where we came from
                    this.cameFrom[neighbour.flatIndex] = node.flatIndex;
                }
            }
        }
        // !earlyExit
        this.buildPath(a, b);        
    }
}