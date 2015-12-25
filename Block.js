var GameObject = require('./GameObject');

///////////////////////////////////////////////////////////////////////////////
// Block
//
// A GameObject is an item that can be placed in the game. Extend this class
// to make specific types of objects.
//
///////////////////////////////////////////////////////////////////////////////
var Block = GameObject.extend({
	init: function(parent)
	{
		this._super(parent);
		this.logger.scope = "Block";
		this.width = 80;
		this.height = 80;
		
		this.fillColor = this.processing.color(255,255,255);
		this.strokeColor = this.processing.color(0,0,0);
	},
	
	update: function()
	{
		this._super();
	},
	
	drawObject: function()
	{
		this.processing.fill(this.fillColor);
		this.processing.stroke(this.strokeColor);
		this.processing.rect(0, 0, this.width, this.height);
	},
	
	mouseClicked: function(x, y)
	{
		x-=this.x;
		y-=this.y;
		
		this.logger.debug("Block " + x + "," + y);
		if(this.userInteractionEnabled && this.containsPoint(x, y))
		{
			console.log(this.parent);
			this.parent.removeChild(this);
			return true;
		}
		return false;
	}
});

module.exports = Block;
