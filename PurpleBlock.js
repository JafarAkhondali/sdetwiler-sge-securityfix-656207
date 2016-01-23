var Block = require('./Block');

///////////////////////////////////////////////////////////////////////////////
// PurpleBlock
//
//
///////////////////////////////////////////////////////////////////////////////
var PurpleBlock = Block.extend({
	init: function(parent)
	{
		this._super(parent);
		this.fillColor = this.processing.color(255,0,255);
		this.type = PurpleBlock.Type;
	}
});
PurpleBlock.Type = "Purple";
Block.registerBlock(PurpleBlock);
module.exports = PurpleBlock;
