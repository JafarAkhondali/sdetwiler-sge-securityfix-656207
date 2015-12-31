var Block = require('./Block');

///////////////////////////////////////////////////////////////////////////////
// GreenBlock
//
//
///////////////////////////////////////////////////////////////////////////////
var GreenBlock = Block.extend({
	init: function(parent)
	{
		this._super(parent);
		this.fillColor = this.processing.color(0,255,0);
		this.type = GreenBlock.Type;
	}
});
GreenBlock.Type = "Green";
Block.registerBlock(GreenBlock);
module.exports = GreenBlock;
