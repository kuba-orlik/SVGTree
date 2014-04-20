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


	this.checkpos = function(){
		for(var j = 0; j<2; j++){
			for(var i in {"x":0, "y":0}){
				var value = parseFloat(arguments[j][i]);
				if(isNaN(value)){
					throw new LineException("pos" + j + "." + i + " must be a number");
				}
				arguments[j][i]=value;
			}			
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

	this.generate = function(){

	}
}

SVGTree.TreeBranch = function(){
	this.children = [];
	this.parent = null;
	
	if(arguments.length==1){
		this.parent = arguments[1];
	}


	this.line = new SVGTree.Line(pos0, pos1);

	this.newChild = function(){
		var length = 1;
		var angle = 360*Math.random();
		var vector = SVGTree.Math.getVectorCoordinates(length, angle);
		var child_branch = new SNGTree.TreeBranch();
	}
}	

SVGTree.Math = {
	degToRad: function(deg){
		console.log(360/deg);
		return (deg/360)* 2 *Math.PI;
	},
	getVectorCoordinates = function(length, angle){
		var angle = SVGTree.Math.degToRad(angle);
		return {
			x: length * Math.sin(angle),
			y: length * Math.cos(angle)
		}
	}
}