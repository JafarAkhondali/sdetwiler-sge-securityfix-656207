var Block = require('./Block');

///////////////////////////////////////////////////////////////////////////////
// WhiteBlock
//
//
///////////////////////////////////////////////////////////////////////////////
var WhiteBlock = Block.extend({
	init: function(parent)
	{
		this._super(parent);
		this.fillColor = this.processing.color(255, 255, 255);
		this.type = WhiteBlock.Type;
		this.speed = 0.05;
		this.commit();
		this.direction = 1;
	},
	update: function()
	{
		//this.targetX = this.x+(Block.Width * this.direction);
		var changed = this._super();
		
		return changed;
	},
	
	collision: function(o)
	{
		// this.logger.debug("called");
		if(this.direction == 1)
		{
			this.direction = -1;
		}
		else
		{
			this.direction = 1;
		}
	},
	
});
WhiteBlock.Type = "White";
Block.registerBlock(WhiteBlock);
module.exports = WhiteBlock;
