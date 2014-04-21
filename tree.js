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

SVGTree.Line = function(pos0, pos1, stroke_width){

	this.pos0 = pos0;
	this.pos1	 = pos1;
	this.stroke_width = stroke_width==undefined? 1 : stroke_width;

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
		if(this.pos0==undefined || this.pos1==undefined){
			throw new LineException("In order to be drawn, Line needs to have pos0 and pos1 specified");
		}
		this.checkpos();
		var node =  document.createElementNS('http://www.w3.org/2000/svg','line');
		this.DOM_element = node;
		node.setAttribute("x1", this.pos0.x);
		node.setAttribute("y1", this.pos0.y);
		node.setAttribute("x2", this.pos1.x);
		node.setAttribute("y2", this.pos1.y);
		node.setAttribute("stroke-width", this.stroke_width);
		node.setAttribute("stroke", "black");
		canvas_element.appendChild(node);
	}

}

SVGTreeException = ExceptionConstructor("SVGTreeException");

SVGTree.Canvas = function(canvas_element, width, height){
	var self = this;

	this.symmetrical = true;
	this.decreasing_width = true;
	this.decreasing_length = true;
	this.decreasing_length_ratio = 0.8;
	this.base_stroke_width = 1;
	
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
		objectNode.setAttribute("type", "image/svg+xml");
		objectNode.width = self.width;
		objectNode.height = self.height;
		var svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.svgNode = svgNode;
		svgNode.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		svgNode.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");	
		svgNode.setAttribute("width", this.width);
		svgNode.setAttribute("height", this.height);
		this.container.appendChild(svgNode);
		this.container.appendChild(objectNode);
	}

	init();

	//new SVGTree.Line({x:"1", y:1}, {x:1, y:2.3})

	this.generateTree = function(level){
		this.Tree = new SVGTree.Tree(this.width, this.height, level, this);
		this.Tree.generate();
	}

	this.draw = function(){
		this.Tree.draw(this.svgNode);
	}
}

SVGTree.Tree = function(width, height, level, canvas){
	this.width = parseFloat(width)
	//alert((level-1)/level * height);
	this.height = (level-1)/level * parseFloat(height);
	this.level = parseInt(level);

	this.canvas = canvas;

	this.symmetrical = this.canvas.symmetrical;
	this.decreasing_width = this.canvas.decreasing_width;
	this.decreasing_length = this.canvas.decreasing_length;
	this.decreasing_length_ratio = this.canvas.decreasing_length_ratio;
	this.base_stroke_width = this.canvas.base_stroke_width;

	this.max_children_per_branch = 3;
	this.min_children_per_branch =1;

	this.base_branch_length = this.height/level;

	//this.symmetrical = symmetrical==undefined? true : symmetrical;

	root = new SVGTree.TreeBranch(new SVGTree.Point(width/2,height), new SVGTree.Point(width/2, height-this.base_branch_length), this, true);

	this.generate = function(){
		var branch_to_extend = root;
		this.extendBranch(root, this.level-1);
	}

	this.extendBranch = function(branch, level){
		if(level!=0){
			var amount = this.min_children_per_branch+Math.floor(Math.random()*(this.max_children_per_branch-this.min_children_per_branch+1));
			var children = branch.generateChildren(amount);
			for(var i in children){
				this.extendBranch(children[i], level-1);
			}			
		}
	}

	this.draw = function(node){
		root.draw(node);
	}
}

SVGTree.TreeBranch = function(){
	this.children = [];
	this.parent = null;
	this.line = new SVGTree.Line();
	this.tree_origin = null;

	this.level;
	
	if(arguments.length==1){
		this.parent = arguments[0];
		this.tree_origin = arguments[0].tree_origin;
	}

	if(arguments.length==2){
		this.line.pos0 = arguments[0];
		this.line.pos1 = arguments[1];
	}

	if(arguments.length==4){
		this.line.pos0 = arguments[0];
		this.line.pos1 = arguments[1];
		this.parent = arguments[2];
		if(arguments[3]){
			this.tree_origin = arguments[2];
			this.level = 0;
		}
	}

	this.draw = function(node){
		var tree = this.tree_origin;
		if(tree.decreasing_width){
			this.line.stroke_width = (tree.base_stroke_width/tree.level)*(tree.level-this.level);
		}else{
			this.line.stroke_width = tree.base_stroke_width;
		}
		this.line.stroke_width = 
		this.line.draw(node);
		for(var i in this.children){
			this.children[i].draw(node);
		}
	}

	this.newChild = function(angle){
		var tree = this.tree_origin;
		var length;
		if(tree.decreasing_length){
			length =tree.base_branch_length * Math.pow(tree.decreasing_length_ratio, this.level);			
		}else{
			length = tree.base_branch_length
		}
		var vector = SVGTree.Math.getVectorCoordinates(length, angle);
		var child_branch = new SVGTree.TreeBranch(this);
		child_branch.line.pos0 = this.line.pos1;
		child_branch.line.pos1 = this.line.pos1.copy().extend(length, angle);
		child_branch.level = this.level+1;
		this.children.push(child_branch);
		//child_branch.line.
	}

	this.generateChildren = function(amount){
		var angle = 30+120*Math.random();
		for(var i=1; i<=amount; i++){
			if(this.tree_origin.symmetrical){
				if(amount>1){
					var temp_angle = (180-angle)/2 + angle*(i-1)/(amount-1)	;				
				}else{
					var temp_angle=90;
				}				
			}else{
				temp_angle = 30+120*Math.random();
			}

			this.newChild(temp_angle);
		}
		return this.children;
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

	this.copy = function(){
		return new SVGTree.Point(this.x, this.y);
	}

	this.extend = function(length, angle){
		var vector = SVGTree.Math.getVectorCoordinates(length, angle);
		this.translate(vector);
		return this;
	}
}

SVGTree.Math = {
	degToRad: function(deg){
		return (deg/360)* 2 *Math.PI;
	},
	getVectorCoordinates: function(length, angle){
		var angle = SVGTree.Math.degToRad(angle);
		return {
			x: length * Math.cos(angle),
			y: -length * Math.sin(angle)
		}
	}
}