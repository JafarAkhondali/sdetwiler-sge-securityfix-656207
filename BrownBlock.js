var Block = require('./Block');

///////////////////////////////////////////////////////////////////////////////
// BrownBlock
//
//
///////////////////////////////////////////////////////////////////////////////
var BrownBlock = Block.extend({
	init: function(parent)
	{
		this._super(parent);
		this.fillColor = this.processing.color(139, 69, 19);
		this.type = BrownBlock.Type;
	}
});
BrownBlock.Type = "Brown";
Block.registerBlock(BrownBlock);
module.exports = BrownBlock;
