var Class = require('./Class');
var Log = require('./Log');
var Block = require('./Block');

///////////////////////////////////////////////////////////////////////////////
// Region
//
///////////////////////////////////////////////////////////////////////////////
var Region = Class.extend({
	init: function(parent)
	{
		this._super();
		this.parent = parent;
		this.processing = this.parent.processing;
		this.logger = new Log.Logger("Region");
		this.logger.LogMask = Log.DEBUG | Log.WARN | Log.ERROR;
		this.x = 0;
		this.y = 0;
		this.width = Region.Width;
		this.height = Region.Height;

		this.objects = {};
		this.objectsToRemove = [];
		
		this.debug = false;
	},
	
	setDebug: function(enabled)
	{
		this.debug = enabled;
	},
	
	objectCount: function()
	{
		return Object.keys(this.objects).length;
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
		x = Math.floor(x/Block.Width)*Block.Width;
		y = Math.floor(y/Block.Height)*Block.Height;
		var key = x + "," + y;
		if(key in this.objects)
		{
			return this.objects[key];
		}
		return null;
	},

	addObject: function(o)
	{
		var key = o.x + "," + o.y;
		// this.logger.debug("called key:" + key);
		if(key in this.objects)
		{
			this.logger.warning("Replacing object at " + key);
		}
		this.objects[key] = o;
		o.parent = this;
	},
	
	removeObject: function(o)
	{
		// this.logger.debug("called key:" + o.x + "," + o.y);
		this.objectsToRemove.push(o);
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
		var nodesDrawn = 1;
		var objectsDrawn = 0;
		for(var k in this.objects)
		{
			var o = this.objects[k];
			o.draw();
			++objectsDrawn;
		}
		if(this.debug == true)
		{
			if(this.objects != null)
			{
				this.processing.textSize(8);
				this.processing.stroke(255,255,255);
				this.processing.fill(255,255,255);
				this.processing.textAlign(this.processing.LEFT, this.processing.TOP);
				var txt = this.x + "," + this.y + "(" + Object.keys(this.objects).length + ")";
				// for(var i=0; i<this.objects.length; ++i)
				// {
				// 	txt+= "\n" + this.objects[i].id.toString();
				// }
				this.processing.text(txt, this.x, this.y);
			}
			this.processing.noFill();
			this.processing.rect(this.x, this.y, this.width, this.height);
		}
		
		return [nodesDrawn, objectsDrawn];
	},
	
	update: function()
	{
		var changed = false;
		var len = this.objectsToRemove.length;
		for(var i =0; i<this.objectsToRemove.length; ++i)
		{
			var o = this.objectsToRemove[i];
			var key = o.x + "," + o.y;
			if(key in this.objects)
			{
				this.objects[key] = null;
				delete this.objects[key];
				// this.logger.debug("deleted object key:" + key);
			}
			else
			{
				console.log(this.objects);
				this.logger.error("object in objectsToRemove but not in objects key:" + key);
			}
		}
		this.objectsToRemove = [];

		if(len > 0)
		{
			this.logger.debug("Removed " + len + (len==1?" object." : " objects."));
			changed = true;
		}

		for(var k in this.objects)
		{
			var o = this.objects[k];
			if(o.update() == true)
			{
				changed = true;
			}
		}

		return changed;
	},

	mouseClicked: function(x, y)
	{
		x = Math.floor(x/Block.Width)*Block.Width;
		y = Math.floor(y/Block.Height)*Block.Height;
		var key = x + "," + y;
		this.logger.debug("key:" + key);
		if(key in this.objects)
		{
			var o = this.objects[key];
			return o.mouseClicked(x, y);
		}
		this.logger.debug("No object at key");
		return false;
	}
});

Region.Width = Block.Width * 100;
Region.Height = Block.Height * 100;



///////////////////////////////////////////////////////////////////////////////
// RegionIndex
//
///////////////////////////////////////////////////////////////////////////////
var RegionIndex = Class.extend({
	init: function(parent)
	{
		this._super();
		this.parent = parent;
		this.processing = this.parent.processing;
		this.logger = new Log.Logger("RegionIndex");
		this.logger.LogMask = Log.DEBUG | Log.WARN | Log.ERROR;

		this.regions = {};
		
		this.debug = false;
	},
	
	getRegion: function(x, y)
	{
		x = Math.floor(x/Region.Width)*Region.Width;
		y = Math.floor(y/Region.Height)*Region.Height;
		
		var key = x + "," + y;
		if(key in this.regions)
		{
			return this.regions[key];
		}
		else
		{
			var region = this.createRegion(x,y);
			this.regions[key] = region;
			return region;
		}
	},
	
	createRegion: function(x, y)
	{
		this.logger.debug("called");
		var region = new Region(this.parent);
		region.x = x;
		region.y = y;
		region.debug = this.debug;
		return region;
	},
	
	setDebug: function(enabled)
	{
		this.debug = enabled;
		
		for(var k in this.regions)
		{
			this.regions[k].setDebug(enabled);
		}
	},
	
	update: function()
	{
		for(var k in this.regions)
		{
			this.regions[k].update();
		}
	},
	
	draw: function(x, y, width, height)
	{
		var objectCount = 0;
		var regionCount = 0;
		for(var cy = Math.floor(y/Region.Height)*Region.Height; cy<height; cy+=Region.Height)
		{
			for(var cx = Math.floor(x/Region.Width)*Region.Width; cx<width; cx+=Region.Width)
			{
				var region = this.getRegion(cx, cy);
				var counts = region.draw();
				regionCount+=counts[0];
				objectCount+=counts[1];
			}
		}
		
		return [regionCount, objectCount];
	},
	
	mouseClicked: function(x, y)
	{
		var region = this.getRegion(x, y);
		return region.mouseClicked(x, y);
	},
	
	getObjectAt: function(x, y)
	{
		var region = this.getRegion(x, y);
		return region.getObjectAt(x, y);
	},
	
	addObject: function(o)
	{
		var region = this.getRegion(o.x, o.y);
		return region.addObject(o);
	},
	
	objectCount: function()
	{
		var c = 0;
		for(var k in this.regions)
		{
			c+= this.regions[k].objectCount();
		}

		return c;
	},

	removeObject: function(o)
	{
		var region = this.getRegion(o.x, o.y);
		region.removeObject(o);
	}
	
});


R = {};
R.Region = Region;
R.RegionIndex = RegionIndex;
module.exports = R;
