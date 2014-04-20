var getElem = function(selector){
	return document.querySelectorAll(selector);
}

var SVGTree = new function(){

};

function ExceptionConstructor(type){
	return function(message){
		this.name=type;
		this.message = message;
		this.toString = function(){
			return this.name + ": " + this.message;
		}
	}
}

LineException = ExceptionConstructor("LineException");

SVGTree.Line = function(pos0, pos1){

	this.pos0 = pos0;
	this.pos1	 = pos1;

	this.checkpos = function(){
		if(!(this.pos0 instanceof SVGTree.Point)){
			throw new LineException("pos0 must be an instance of SVGTree.Point");
		}	
		if(!(this.pos1 instanceof SVGTree.Point)){
			throw new LineException("pos1 must be an instance of SVGTree.Point");
		}	
	}

	this.DOM_element = null;

	this.draw = function(canvas_element){
		if(pos0==undefined || pos1==undefined){
			throw new LineException("In order to be drawn, Line needs to have pos0 and pos1 specified");
		}
		this.checkpos();
		var node = document.createElement("line");
		this.DOM_element = node;
		node.x1 = pos0.x;
		node.y1 = pos0.y;
		node.x2 = pos1.x;
		node.y2 = pos1.y;
		canvas_element.appendChild(node);
	}

}

SVGTreeException = ExceptionConstructor("SVGTreeException");

SVGTree.Canvas = function(canvas_element, width, height){
	var self = this;
	
	function init(){
		//check type of the first constructor argument 
		var type=typeof canvas_element;
		var actions = {
			//if it's a string, treat it as css selector
			"string": function(){
				var result = document.querySelectorAll(canvas_element);
				if(result.length==0){
					throw new SVGTreeException("selector \"" +canvas_element + "\" does not match any node in document");
				}
				self.container=result[0]
			},
			//if it's an object, assume it's a DOM node object
			"object": function(){
				self.container = canvas_element;
			}
		}
		//perform one of the actions described above
		actions[type]();
		if(width!=undefined){
			self.width = width;
		}else{
			self.width = "200"
		}
		if(height!=undefined){
			self.height = height;			
		}else{
			self.height = "200";
		}
		self.createCanvas();
	}	

	this.createCanvas = function(){
		var objectNode = document.createElement("object");
		objectNode.type="image/svg+xml";
		objectNode.width = self.width;
		objectNode.height = self.height;
		var svgNode = document.createElement("svg");
		objectNode.appendChild(svgNode);
		this.container.appendChild(objectNode);
	}

	init();

	new SVGTree.Line({x:"1", y:1}, {x:1, y:2.3})
}

SVGTree.Tree = function(width, height, level){
	this.width = parseFloat(width)
	this.height = parseFloat(height);
	this.level = parseInt(level);
	this.max_children_per_branch = 2;
	this.min_children_per_branch =1;

	this.root = new SVGTree.TreeBranch(new SVGTree.Point(0,0), nev SVGTree.Point(0, 1));

	this.generate = function(){
		var branch_to_extend = this.root;
		var children_to_add = this.min_children_per_branch+Math.ceil(Math.random()*(this.max_children_per_branch-this.min_children_per_branch));
		for(var i=1; i<=children_to_add; i++){
			branch_to_extend.newChild();
		}
	}

	this.draw = function(){
		this.root.draw();
	}
}

SVGTree.TreeBranch = function(){
	this.children = [];
	this.parent = null;
	this.line = new SVGTree.Line();
	
	if(arguments.length==1){
		this.parent = arguments[1];
	}

	if(arguments.length==2){
		this.line.pos0 = arguments[0];
		this.line.pos1 = arguments[1];
	}


	this.newChild = function(){
		var length = 1;
		var angle = 360*Math.random();
		var vector = SVGTree.Math.getVectorCoordinates(length, angle);
		var child_branch = new SNGTree.TreeBranch(this);
		child_branch.line.pos0 = this.pos1;
		child_branch.line.pos1 = this.pos1.extend(length, angle);
		this.children.push(child_branch);
		//child_branch.line.
	}
}	

SVGTree.Point = function(x, y){
	this.x = x;
	this.y = y;

	this.translate = function(){
		if(arguments.length==1){
			this.x+=arguments[0].x;
			this.y+=arguments[0].y;
		}else{
			this.x+=arguments[0];
			this.y+=arguments[1];
		}
	}

	this.extend = function(length, angle){
		var vector = SVGTree.Math.getVectorCoordinates(length, angle);
		this.translate(vector);
	}
}

SVGTree.Math = {
	degToRad: function(deg){
		console.log(360/deg);
		return (deg/360)* 2 *Math.PI;
	},
	getVectorCoordinates: function(length, angle){
		var angle = SVGTree.Math.degToRad(angle);
		return {
			x: length * Math.sin(angle),
			y: length * Math.cos(angle)
		}
	}
}