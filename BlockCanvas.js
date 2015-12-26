var GameObject = require('./GameObject');
var Block = require('./Block');

///////////////////////////////////////////////////////////////////////////////
// Block
//
// A GameObject is an item that can be placed in the game. Extend this class
// to make specific types of objects.
//
///////////////////////////////////////////////////////////////////////////////
var BlockCanvas = GameObject.extend({
	init: function(parent)
	{
		this._super(parent);
		this.logger.scope = "BlockCanvas";

		this.fillColor = this.processing.color(255,255,255);
		this.strokeColor = this.processing.color(0,0,0);
	},
		
	drawObject: function()
	{
	},
	
	placeBlock: function(x, y)
	{
		var go = new Block(this);
		
		x = Math.round(x/go.width)*go.width;
		y = Math.round(y/go.height)*go.width;
	
		go.x = x-(go.width/2);
		go.y = y-(go.height/2);
		
		this.addChild(go);
	},
	
	mouseClicked: function(x, y)
	{
		this.logger.debug(x + "," + y);
		// Use default implementation to check if any children will handle the mouseClick.
		if(this._super(x, y) == true)
		{
			return true;
		}

		this.logger.debug("no BlockCanvas children handled click. Placing block.")
		// No children handled the mouseClick, handle here.
		this.placeBlock(x-this.x, y-this.y);
		return true;
	}
});

module.exports = BlockCanvas;
