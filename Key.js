var Class = require('./Class');

///////////////////////////////////////////////////////////////////////////////
// Key
//
///////////////////////////////////////////////////////////////////////////////
var Key = Class.extend({
	init: function()
	{
		this._super();
		this.x = null;
		this.y = null;
	},
	
	toString: function()
	{
		return this.x + "," + this.y;
	},
	
	fromString:function(s)
	{
		var xy = s.split(",");
		this.x = parseInt(xy[0]);
		this.y = parseInt(xy[1]);
	}
});

module.exports = Key;
