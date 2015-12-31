var Block = require('./Block');

///////////////////////////////////////////////////////////////////////////////
// OrangeBlock
//
//
///////////////////////////////////////////////////////////////////////////////
var OrangeBlock = Block.extend({
	init: function(parent)
	{
		this._super(parent);
		this.fillColor = this.processing.color(255, 140, 0);
		this.type = OrangeBlock.Type;
	}
});
OrangeBlock.Type = "Orange";
Block.registerBlock(OrangeBlock);
module.exports = OrangeBlock;
