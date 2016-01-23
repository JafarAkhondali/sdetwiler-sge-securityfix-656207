var Block = require('./Block');

///////////////////////////////////////////////////////////////////////////////
// BlackBlock
//
//
///////////////////////////////////////////////////////////////////////////////
var BlackBlock = Block.extend({
	init: function(parent)
	{
		this._super(parent);
		this.fillColor = this.processing.color(0,0,0);
		this.type = BlackBlock.Type;
	}
});
BlackBlock.Type = "Black";
Block.registerBlock(BlackBlock);
module.exports = BlackBlock;
