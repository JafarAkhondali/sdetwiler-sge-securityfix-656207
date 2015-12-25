var Class = require('./Class');
var Log = require('./Log');
var Vector2d = require('./Vector2d');

///////////////////////////////////////////////////////////////////////////////
// GameObject
//
// A GameObject is an item that can be placed in the game. Extend this class
// to make specific types of objects.
//
///////////////////////////////////////////////////////////////////////////////
var GameObject = Class.extend({
	init: function(parent)
	{
		this._super();
		this.logger = new Log.Logger("GameObject");
		this.logger.LogMask = Log.DEBUG | Log.WARN | Log.ERROR;
		this.parent = parent;
		this.processing = this.parent.processing;	// Note parent could be a GameObject or a GameController. Hrm... SCD.
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.userInteractionEnabled = true;
		
		this.children = [];
		this.childrenToRemove = [];
	},

	containsPoint: function(x, y)
	{
		this.logger.debug(x + "," + y + " in " + this.x + "," + this.y + "," + this.width + "," + this.height );
		if((this.x <= x) && ((this.x+this.width) >=x) && (this.y <= y) && ((this.y+this.height) >= y))
		{
			return true;
		}
		return false;
	},

	addChild: function(go)
	{
		this.children.push(go);
	},
	
	removeChild: function(go)
	{
		this.childrenToRemove.push(go);
	},
	
	update: function()
	{
		for(var i =0; i<this.children.length; ++i)
		{
			var go = this.children[i];
			go.update();
		}

		for(var i =0; i<this.childrenToRemove.length; ++i)
		{
			var go = this.childrenToRemove[i];
			var idx = this.children.indexOf(go);
			if(idx >= 0)
			{
				this.logger.debug("Removing " + go);
				this.children.splice(idx, 1);
			}
		}
		this.childrenToRemove = [];
	},

	preDraw: function()
	{
		this.processing.pushMatrix();
		this.processing.translate(this.x, this.y);
	},
	
	drawObject: function()
	{
		
	},
	
	draw: function()
	{
		this.preDraw();

		this.drawObject();

		for(var i=0; i<this.children.length; ++i)
		{
			var go = this.children[i];
			go.draw();
		}
		
		this.postDraw();
	},
	
	postDraw: function()
	{
		this.processing.popMatrix();
	},
	
	// x,y are provided in the coordinate space of the parent GameObject. If no parent, they are in screen space.
	// Returns true if click was handled, false if not.
	mouseClicked: function(x, y)
	{
		this.logger.debug("called");
		if(this.userInteractionEnabled && this.containsPoint(x, y))
		{
			
			// console.log(this.x + "," + this.y + "    " + loc.x + "," + loc.y);
			
			for(var i=0; i<this.children.length; ++i)
			{
				var go = this.children[i];
				if(go.mouseClicked(x-this.x, y-this.y))
				{
					return true;
				}
			}
		}
		return false;
	}
});

module.exports = GameObject;
