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
		this.speed = 0.2;
		this.userInteractionEnabled = true;
		this.childrenMustBeInBounds = true;	// If true, click detection only applies to children that are within the bounds of the parent.
		
		this.commit();
		
		this.children = [];
		this.childrenToRemove = [];
	},

	commit: function()
	{
		this.targetX = this.x;
		this.targetY = this.y;
		this.targetWidth = this.width;
		this.targetHeight = this.height;
		this.targetSpeed = this.speed;
	},

	containsPoint: function(x, y)
	{
		// this.logger.debug(x + "," + y + " in " + this.x + "," + this.y + "," + this.width + "," + this.height );
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
	
	
	capLerp: function(start, end, speed)
	{
		var n = this.processing.lerp(start, end, speed);
		if(Math.abs(end-n) < 0.1)
		{
			n = end;
		}
		
		return n;
	},
	
	update: function()
	{
		var changed = false;
		if(this.speed != this.targetSpeed)
		{
			this.speed = this.capLerp(this.speed, this.targetSpeed, this.speed);
			console.log("speed changed");
			changed = true;
		}
		if(this.x != this.targetX)
		{
			console.log(this.x);
			this.x = this.capLerp(this.x, this.targetX, this.speed);

			console.log("x changed " +  this.x);
			changed = true;
		}
		if(this.y != this.targetY)
		{
			this.y = this.capLerp(this.y, this.targetY, this.speed);
			console.log("y changed");
			changed = true;
		}
		if(this.width != this.targetWidth)
		{
			this.width = this.capLerp(this.width, this.targetWidth, this.speed);
			changed = true;
		}
		if(this.height != this.targetHeight)
		{
			this.height = this.capLerp(this.height, this.targetHeight, this.speed);
			changed = true;
		}
		
		
		
		
		
		for(var i =0; i<this.children.length; ++i)
		{
			var go = this.children[i];
			if(go.update())
			{
				changed = true;
			}
		}

		var len = this.childrenToRemove.length;
		for(var i =0; i<this.childrenToRemove.length; ++i)
		{
			var go = this.childrenToRemove[i];
			var idx = this.children.indexOf(go);
			if(idx >= 0)
			{
				this.children.splice(idx, 1);
			}
		}
		this.childrenToRemove = [];
		if(len > 0)
		{
			this.logger.debug("Removed " + len + (len==1?" child." : " children."));
			changed = true;
		}
		
		return changed;
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
	
	// x,y are provided in the coordinate space of the parent GameObject.
	// Returns true if click was handled, false if not.
	mouseClicked: function(x, y)
	{
		this.logger.debug("called");
		if(this.userInteractionEnabled && ((this.childrenMustBeInBounds && this.containsPoint(x, y)) || !this.childrenMustBeInBounds))
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
	},

	// x,y are provided in the coordinate space of the parent GameObject.
	// Returns true if drag was handled, false if not.
	mouseDragged: function(x, y)
	{
		this.logger.debug("called");
		if(this.userInteractionEnabled && ((this.childrenMustBeInBounds && this.containsPoint(x, y)) || !this.childrenMustBeInBounds))
		{
			
			// console.log(this.x + "," + this.y + "    " + loc.x + "," + loc.y);
			
			for(var i=0; i<this.children.length; ++i)
			{
				var go = this.children[i];
				if(go.mouseDragged(x-this.x, y-this.y))
				{
					return true;
				}
			}
		}
		return false;
	}

});

module.exports = GameObject;
