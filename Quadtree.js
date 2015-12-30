var Class = require('./Class');
var Log = require('./Log');
var Block = require('./Block');

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
	
	audit: function(objects)
	{
		if(this.children != null)
		{
			for(var i=0; i<this.children.length; ++i)
			{
				objects = this.children[i].audit(objects);
			}
		}
		else if(this.objects != null)
		{
			for(var i=0; i<this.objects.length; ++i)
			{
				var o = this.objects[i];
				if(objects.indexOf(o) < 0)
				{
					objects.push(o);
				}
				else
				{
					this.logger.error("Duplicate for " + o.id.toString());
				}
			}
		}
		
		return objects;
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
		
		
		// Split on boundaries that are an exact multiple of Block.Width and Block.Height.
		// When rounding, always place extra block in upper left.
		var blocksWidth = this.width/Block.Width;
		var blocksHeight = this.width/Block.Height;
		var halfBlocksWidth = blocksWidth / 2;
		var halfBlocksHeight = blocksHeight / 2;

		var ulllWidth = Math.ceil(halfBlocksWidth) * Block.Width;
		var ulurHeight = Math.ceil(halfBlocksHeight) * Block.Height;

		var urlrWidth = this.width - ulllWidth;
		var lllrHeight = this.height - ulurHeight;
		
		console.log(ulllWidth, ulurHeight, urlrWidth, lllrHeight);
		
		if(!ulllWidth || !ulurHeight || !urlrWidth || !lllrHeight)
		{
			this.logger.error("Cannot create children with zero dimension.");
			return;
		}
		
		var ul = new Quadtree(this);
		ul.x = this.x;
		ul.y = this.y;
		ul.width = ulllWidth;
		ul.height = ulurHeight;
		ul.debug = this.debug;
		
		var ur = new Quadtree(this);
		ur.x = this.x+ulllWidth;
		ur.y = this.y;
		ur.width = urlrWidth;
		ur.height = ulurHeight;
		ur.debug = this.debug;

		var ll = new Quadtree(this);
		ll.x = this.x;
		ll.y = this.y+ulllWidth;
		ll.width = ulllWidth;
		ll.height = lllrHeight;
		ll.debug = this.debug;

		var lr = new Quadtree(this);
		lr.x = this.x+ulllWidth;
		lr.y = this.y+ulurHeight;
		lr.width = urlrWidth;
		lr.height = lllrHeight;
		lr.debug = this.debug;
		
		this.children = [ul, ur, ll, lr];
	},
	
	split: function()
	{
		this.logger.debug("called. Currently " + this.objects.length + " objects.");

		var objects = this.objects;
		this.objects = null;
		this.objectsToRemove = [];

		this.createChildren();
		for(var i=0; i<objects.length; ++i)
		{
			this.addObject(objects[i]);
		}
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
					return this.children[j].addObject(o);
				}
			}
		}
		else
		{
			this.objects.push(o);
			o.parent = this;
			if(this.objects.length > Quadtree.MaxObjectsPerNode)
			{
				this.split();
			}
		}
	},
	
	removeObject: function(go)
	{
		this.logger.debug("called");
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
				t2 <= b1);
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
				if(this.objects != null)
				{
					this.processing.textSize(8);
					this.processing.stroke(255,255,255);
					this.processing.fill(255,255,255);
					this.processing.textAlign(this.processing.LEFT, this.processing.TOP);
					var txt = this.x + "," + this.y + "(" + this.objects.length + ")";
					// for(var i=0; i<this.objects.length; ++i)
					// {
					// 	txt+= "\n" + this.objects[i].id.toString();
					// }
					this.processing.text(txt, this.x, this.y);
				}
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

			for(var i=0; i<this.objects.length; ++i)
			{
				var o = this.objects[i];
				if(o.update())
				{
					changed = true;
				}
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
	}
});

Quadtree.MaxObjectsPerNode = 10;

module.exports = Quadtree;
