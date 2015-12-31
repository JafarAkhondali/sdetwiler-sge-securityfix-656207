var Block = require('./Block');

///////////////////////////////////////////////////////////////////////////////
// YellowBlock
//
//
///////////////////////////////////////////////////////////////////////////////
var YellowBlock = Block.extend({
	init: function(parent)
	{
		this._super(parent);
		this.fillColor = this.processing.color(255, 255, 0);
		this.type = YellowBlock.Type;
	}
});
YellowBlock.Type = "Yellow";
Block.registerBlock(YellowBlock);
module.exports = YellowBlock;
