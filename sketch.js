let run = false;
let width, height, depth;
let temp = 100;
let time = 0;

/*Class defining spheres in the system.*/
class Point{
    constructor(){
        this.pos = createVector(0,0,0);
        this.radius = 15;
    }

    show(){
        push();
        normalMaterial();
        translate(this.pos.x, this.pos.y, this.pos.z);
        sphere(this.radius);
        pop();
    }
}

function setRun(arg){
    run = arg;
}

function setComplexity(){
    if(!run){
        let complexity = document.getElementById("slider").value;
        current_system = createSystem(complexity);
        document.getElementById('complexityOutput').innerHTML = complexity;
    }
}

function reset(){
    run = false; 
    current_system = createSystem(60);
    temp = 100;
    document.getElementById("slider").value = 60;

}

/*Creates and returns an ordered array of Points, given complexity (number of Points).*/
function createSystem(complexity){
    let system = [];
    for(let i = 0; i < complexity; i++){
        let p = new Point();
        p.pos.x = random(-(width/2), width/2);
        p.pos.y = random(-(height/2), height/2);
        p.pos.z = random(-(depth/2), depth/2);
        system.push(p);
    } 
    document.getElementById('pathLength').innerHTML = Math.floor(cost(system));
    return(system);
}

/* Returns the "neighbor" of a system (a random swap of two Points), given a system. */
function getNeighbor(system){
    let neighbor = system.slice();
    let i1 = Math.floor(Math.random()*neighbor.length);
    let i2 = Math.floor(Math.random()*neighbor.length);
    [neighbor[i1], neighbor[i2]] = [neighbor[i2], neighbor[i1]];
    return(neighbor);
}

/*Draw the current system to the p5 canvas.*/
function showSystem(system){
    for(let p of system){
        p.show();
    }
    for(let i = 1; i < system.length; i++){
        let x1 = system[i].pos.x, y1 = system[i].pos.y, z1 = system[i].pos.z;
        let x2 = system[i-1].pos.x, y2 = system[i-1].pos.y, z2 = system[i-1].pos.z;
        stroke(255);
        strokeWeight(1);
        line(x1, y1, z1, x2, y2, z2);
    }
    document.getElementById('pathLength').innerHTML = Math.floor(cost(system));
    document.getElementById('totalCombos').innerHTML = temp;
    // document.getElementById('complexityOutput').innerHTML = complexity;
}

/*Calculates the cost (distance between points) of a system.*/
function cost(system){
    let totalDist = 0;
    for(let i = 1; i < system.length; i++){
        let x1 = system[i].pos.x, y1 = system[i].pos.y, z1 = system[i].pos.z;
        let x2 = system[i-1].pos.x, y2 = system[i-1].pos.y, z2 = system[i-1].pos.z;
        let dist = Math.sqrt((x1-x2)**2+(y1-y2)**2+(z1-z2)**2);
        totalDist = totalDist + dist;
    }
    return(totalDist);
}

/*Local Optimization. Given a system as input, returns one step of LO process.*/
function localOptimization(system){
    guess = getNeighbor(system);
    delta = cost(system) - cost(guess);
    if (delta > 0){
        system = guess;
    }
    return(system);
}

/*Simulated Annealing. Given a system as input, returns one step of the SA process.*/
function simulatedAnnealing(system){
    if(temp > 0.00005){
        for(let i = 0; i < 1; i++){
            let guess = getNeighbor(system);
            delta = cost(guess) - cost(system);
            if(delta < 0){
                system = guess;
            }else{
                if(Math.exp(-delta/temp) > random(0,1)){
                    system = guess;
                }
            }
        }
        temp = 0.95*temp;
    }
    return(system);
}

function setup(){
    let scale = 20;
    width = windowHeight-scale; 
    height = windowHeight-scale;
    depth = windowHeight-scale;

    canvas = createCanvas(windowWidth*0.65, windowHeight, WEBGL); 
    canvas.style('display', 'block');
    canvas.parent('canvas');
    background(0);

    setComplexity(60);
    current_system = createSystem(60);
    document.getElementById('totalCombos').innerHTML = temp;
}

function draw(){
    /*p5 camera orbit controls*/
    background(0);
    let cameraX = Math.cos(time*2*Math.PI)*width;
    let cameraY = Math.sin(time*2*Math.PI)*height;
    camera(cameraX, cameraY, 700);
    time += 0.001;

    /*show current system and update if running.*/
    showSystem(current_system);
    if(run){
        current_system = simulatedAnnealing(current_system);
    }
}