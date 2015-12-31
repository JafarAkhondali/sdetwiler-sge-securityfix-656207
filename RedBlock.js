var Block = require('./Block');

///////////////////////////////////////////////////////////////////////////////
// RedBlock
//
//
///////////////////////////////////////////////////////////////////////////////
var RedBlock = Block.extend({
	init: function(parent)
	{
		this._super(parent);
		this.fillColor = this.processing.color(255,0,0);
		this.type = RedBlock.Type;
	}
});
RedBlock.Type = "Red";
Block.registerBlock(RedBlock);
module.exports = RedBlock;
