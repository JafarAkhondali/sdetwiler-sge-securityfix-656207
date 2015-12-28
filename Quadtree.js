var Class = require('./Class');
var Log = require('./Log');

///////////////////////////////////////////////////////////////////////////////
// Quadtree
//
///////////////////////////////////////////////////////////////////////////////
var Quadtree = Class.extend({
	init: function(parent)
	{
		this._super();
		this.parent = parent;
		this.processing = this.parent.processing;
		this.logger = new Log.Logger("Quadtree");
		this.logger.LogMask = Log.DEBUG | Log.WARN | Log.ERROR;
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		
		this.children = null;
		
		this.objects = [];
		this.objectsToRemove = [];
		
		this.debug = false;
	},

	setDebug: function(enabled)
	{
		this.debug = enabled;
		
		if(this.children != null)
		{
			for(var i=0; i<this.children.length; ++i)
			{
				this.children[i].setDebug(enabled);
			}
		}
	},

	nodeCount: function()
	{
		var c = 0;
		if(this.children != null)
		{
			c+=this.children.length;
			for(var i=0; i<this.children.length; ++i)
			{
				c+= this.children[i].nodeCount();
			}
		}
		
		return c;
	},

	objectCount: function()
	{
		var c = 0;
		if(this.children != null)
		{
			for(var i=0; i<this.children.length; ++i)
			{
				c+= this.children[i].objectCount();
			}
		}
		else if(this.objects != null)
		{
			c+= this.objects.length;
		}
		
		return c;
	},
	
	createChildren: function()
	{
		this.logger.debug("called");
		
		var halfWidth = this.width/2;
		var halfHeight = this.height/2;
		
		var ul = new Quadtree(this);
		ul.x = this.x;
		ul.y = this.y;
		ul.width = halfWidth;
		ul.height = halfHeight;
		ul.debug = this.debug;
		
		var ur = new Quadtree(this);
		ur.x = this.x+halfWidth;
		ur.y = this.y;
		ur.width = halfWidth;
		ur.height = halfHeight;
		ur.debug = this.debug;

		var ll = new Quadtree(this);
		ll.x = this.x;
		ll.y = this.y+halfHeight;
		ll.width = halfWidth;
		ll.height = halfHeight;
		ll.debug = this.debug;

		var lr = new Quadtree(this);
		lr.x = this.x+halfWidth;
		lr.y = this.y+halfHeight;
		lr.width = halfWidth;
		lr.height = halfHeight;
		lr.debug = this.debug;
		
		this.children = [ul,ur,ll,lr];
	},
	
	split: function()
	{
		this.createChildren();
		for(var i=0; i<this.objects.length; ++i)
		{
			this.addObject(this.objects[i]);
		}
		
		this.objects = null;
		this.objectsToRemove = [];
	},
	
	collapse: function()
	{
		this.objects = [];
		for(var i=0; i<this.children.length; ++i)
		{
			this.objects = this.objects.concat(this.children[i].objects);
		}
		
		this.children = null;
	},
	
	containsPoint: function(x, y)
	{
		if((this.x <= x) && ((this.x+this.width) > x) && (this.y <= y) && ((this.y+this.height) > y))
		{
			return true;
		}
		return false;
	},

	getObjectAt: function(x, y)
	{
		if(this.children != null)
		{
			for(var i=0; i<this.children.length; ++i)
			{
				var c = this.children[i];
				if(c.containsPoint(x,y) == true)
				{
					return c.getObjectAt(x, y);
				}
			}
		}
		else
		{
			for(var i=0; i<this.objects.length; ++i)
			{
				if(this.objects[i].containsPoint(x, y) == true)
				{
					return this.objects[i];
				}
			}
		
			return null;
		}
	},

	addObject: function(o)
	{
		if(this.children != null)
		{
			for(var j=0; j<this.children.length; ++j)
			{
				if(this.children[j].containsPoint(o.x, o.y))
				{
					this.children[j].addObject(o);
					break;
				}
			}
		}
		else
		{
			this.objects.push(o);
			if(this.objects.length > Quadtree.MaxObjectsPerNode)
			{
				this.split();
			}
		}
	},
	
	removeObject: function(go)
	{
		this.objectsToRemove.push(go);
	},
	
	doesIntersect: function(x1, y1, w1, h1)
	{
		var l1 = x1;
		var r1 = x1+w1;
		var t1 = y1;
		var b1 = y1+h1;

		var l2 = this.x;
		var r2 = this.x+this.width;
		var t2 = this.y;
		var b2 = this.y+this.height;
		
		
		return (l1 <= r2 &&
		l2 <= r1 &&
		t1 <= b2 &&
		t2 <= b1)
	},
	
	draw: function(x, y, width, height)
	{
		var nodesDrawn = 0;
		var objectsDrawn = 0;
		if(this.doesIntersect(x, y, width, height))
		{
			++nodesDrawn;
			if(this.debug == true)
			{
				// this.logger.debug("debugdraw");
				this.processing.stroke(255,255,255);
				this.processing.noFill();
				this.processing.rect(this.x, this.y, this.width, this.height);
			}

			if(this.children != null)
			{
				for(var i=0; i<this.children.length; ++i)
				{
					var c = this.children[i];
					var d = c.draw(x, y, width, height);
					nodesDrawn+=d[0];
					objectsDrawn+=d[1];
				}
			}
		
			else
			{
				for(var i=0; i<this.objects.length; ++i)
				{
					var o = this.objects[i];
					o.draw();
				}
				objectsDrawn+=this.objects.length;
			}
		}
		
		return [nodesDrawn, objectsDrawn];
	},
	
	update: function()
	{
		var changed = false;
		if(this.children != null)
		{
			for(var i=0; i<this.children.length; ++i)
			{
				if(this.children[i].update() == true)
				{
					changed = true;
				}
			}
		}
		else
		{
			for(var i=0; i<this.objects.length; ++i)
			{
				var o = this.objects[i];
				if(o.update())
				{
					changed = true;
				}
			}

			var len = this.objectsToRemove.length;
			for(var i =0; i<this.objectsToRemove.length; ++i)
			{
				var go = this.objectsToRemove[i];
				var idx = this.objects.indexOf(go);
				if(idx >= 0)
				{
					this.objects.splice(idx, 1);
				}
			}
			this.objectsToRemove = [];
			if(len > 0)
			{
				this.logger.debug("Removed " + len + (len==1?" object." : " objects."));
				changed = true;
			}
		
		}
		
		return changed;
	},

	mouseClicked: function(x, y)
	{
		if(this.containsPoint(x, y))
		{
			if(this.children != null)
			{
				for(var i=0; i<this.children.length; ++i)
				{
					if(this.children[i].mouseClicked(x, y) == true)
					{
						return true;
					}
				}
			}
			else if(this.objects != null)
			{
				for(var i=0; i<this.objects.length; ++i)
				{
					var o = this.objects[i];
					if(o.mouseClicked(x, y))
					{
						return true;
					}
				}
			}
		}
		return false;
	},

	mouseDragged: function(x, y)
	{
		this.logger.debug("called");
		if(this.userInteractionEnabled && this.containsPoint(x, y))
		{
			for(var i=0; i<this.objects.length; ++i)
			{
				var o = this.objects[i];
				if(o.mouseDragged(x, y))
				{
					return true;
				}
			}
		}
		return false;
	}

});

Quadtree.MaxObjectsPerNode = 10;

module.exports = Quadtree;
