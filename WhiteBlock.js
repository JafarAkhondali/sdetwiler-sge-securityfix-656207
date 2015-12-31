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
	}
});
WhiteBlock.Type = "White";
Block.registerBlock(WhiteBlock);
module.exports = WhiteBlock;
