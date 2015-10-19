//console.log(project.view.viewSize);
var nodeDistance = Math.min(project.view.viewSize.height / 4, project.view.viewSize.width / 4);
var nodePercentageZone = 0.15;
var nodePercentageText = 0.05;
var root = new Node("Project test", new Point(0, 0), nodeDistance * 2);


var mousePos = new Point(0,0);
var lastPClicked;
var myCanvas = document.getElementById("canvas");
        
populateTree(root, 5);

onResize();

if (myCanvas.addEventListener) {
	myCanvas.addEventListener("wheel", mouseWheelHandler, false);
}else{ // IE 6/7/8

}

function populateTree(node, levels) {
    var children = randomInt(1, 5);
    for (var i = 0; i < children; i++) {
        var child = new Node("Node " + levels, new Point(0, 0), nodeDistance * nodePercentageZone);
        node.addChild(child);
        if (levels > 0) {
            populateTree(child, levels - 1);
        }
    }
}

function randomInt(initial, final) {
    return initial - 1 + Math.floor((Math.random() * (final - initial)) + 1);
}

function onResize() {
    nodeDistance = Math.min(project.view.viewSize.height / 4, project.view.viewSize.width / 4);

    calculateDiagram(root);
}

function onMouseDown(event) {
    if(event.event.button === 1){
        lastPClicked = event.point;
    }
}

function onMouseDrag(event){
    if(event.event.button === 1){
        pan(event);
    }
}

function onMouseMove(event){
    mousePos = event.point;
}

function mouseWheelHandler(event){
    event.preventDefault();
    if(event.deltaY < 0){
        project._scope.view.center = new Point(mousePos.x, mousePos.y);
        project._scope.view.zoom = project._scope.view.zoom + 0.5;
    }else if(event.deltaY > 0 && project._scope.view.zoom > 0.5){
        project._scope.view.zoom = project._scope.view.zoom - 0.5;
    }
    console.log(project._scope.view.zoom.toString());
}

function Node(name, position, size) {
    this.name = name;
    this.children = [];
    this.paths = [];
    this.GetSize = function () {
        return name.length * 4;
    };
    this.shape = new Shape.Circle(position, size);
    this.shape.strokeColor = 'white';
    this.content = new PointText({
        point: position,
        content: this.name,
        fillColor: 'white',
        justification: 'center'
    });
    this.body = new Group([this.shape, this.content]);
    this.resize = function (zoneRadius) {
        this.shape.radius = zoneRadius * nodePercentageZone;
        this.content.fontSize = zoneRadius * nodePercentageText;
    };
    this.addChild = function(child){
        this.children.push(child);
        var line = Path.Line(this.shape.position,child.shape.position);
        line.strokeColor = 'white';
        this.paths.push(line);
    };
    this.updateConections = function(){
        for (var i in this.children){
            var child = this.children[i];
//            console.log(this.paths);
            this.paths[i].segments[0].point = child.shape.position;
            this.paths[i].segments[1].point = this.shape.position;
        }
    };
}

function calculateDiagram(root) {
    root.body.position = project.view.center;
    root.resize(nodeDistance * 2);
    var childCount = root.children.length;
    var angle = 360 / childCount;

    var p = new Point(0, nodeDistance);
    var zoneRadius = (p.rotate(angle, new Point(0, 0)) - p).length;
    if (root.children.length <= 2) {
        zoneRadius = nodeDistance;
    }
    for (var i in root.children) {
        var child = root.children[i];
        child.body.position = root.body.position + p;
        child.resize(zoneRadius);
        p = p.rotate(angle, new Point(0, 0));
        calculateDiagramRecursive(child, root, nodeDistance / 2);
        
    }
    root.updateConections();
}

function calculateDiagramRecursive(node, parent, nodeDistance) {
    var childCount = node.children.length + 1;
    var angle = 360 / childCount;

    var p = (parent.shape.position - node.shape.position).normalize(nodeDistance);
    p = p.rotate(angle, new Point(0, 0));
    var zoneRadius = (p.rotate(angle, new Point(0, 0)) - p).length;
    if (node.children.length <= 2) {
        zoneRadius = nodeDistance;
    }
    for (var i in node.children) {
        var child = node.children[i];
        child.body.position = node.body.position + p;
        child.resize(zoneRadius);
        p = p.rotate(angle, new Point(0, 0));
        calculateDiagramRecursive(child, node, nodeDistance / 2);
    }
    node.updateConections();
}

function pan(event){
    var delta = event.point - lastPClicked;
    view.center = view.center - delta;
}