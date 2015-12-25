var Class = require('./Class');

///////////////////////////////////////////////////////////////////////////////
//
// Vector2d
//
///////////////////////////////////////////////////////////////////////////////
var Vector2d = Class.extend({
	init: function(x, y)
	{
		this._super();
		if(x === undefined)
		{
			x = 0;
		}
		if(y === undefined)
		{
			y = 0;
		}
		this.x = x;
		this.y = y;
	},
	
	rotate: function(theta)
	{
		var xTemp = this.x;
		this.x = this.x*Math.cos(theta) - this.y*Math.sin(theta);
		this.y = xTemp*Math.sin(theta) + this.y*Math.cos(theta);
		
		return this;
	},
	
	translate: function(x, y)
	{
		this.x+=x;
		this.y+=y;
		
		return this;
	},
	
	scale: function(s)
	{
		this.x*=s;
		this.y*=s;
		
		return this;
	},
	
	magnitude: function()
	{
		return Math.sqrt((this.x*this.x) + (this.y*this.y));
	},
	
	add: function(v)
	{
		this.x+=v.x;
		this.y+=v.y;
		return this;
	}
});

module.exports = Vector2d;
