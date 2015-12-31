var Class = require('./Class');
var Log = require('./Log');
var Block = require('./Block');

///////////////////////////////////////////////////////////////////////////////
// Region
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
		this.objectKeysToRemove = [];
		
		this.debug = false;
	},
	
	save: function()
	{
		var objects = {};
		for(var key in this.objects)
		{
			objects[key] = this.objects[key].save();
		}
		
		return objects;
	},
	
	load: function(data)
	{
		this.logger.debug("called");
		console.log(data);	
		for(var k in data)
		{
			var xy = k.split(",");
			var blockData = data[k];
			var block = Block.createBlock(blockData.type, this, blockData);
			block.x = parseInt(xy[0]);
			block.y = parseInt(xy[1]);
			block.commit();
			console.log(block);
			this.addObject(block);
		}
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
		var key = o.getKey();
		// this.logger.debug("called key:" + key);
		if(key in this.objects)
		{
			this.logger.warn("Replacing object at " + key);
		}
		this.objects[key] = o;
		o.parent = this;
	},
	
	removeObject: function(key)
	{
		// this.logger.debug("called key:" + o.x + "," + o.y);
		this.objectKeysToRemove.push(key);
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
		var len = this.objectKeysToRemove.length;
		for(var i =0; i<this.objectKeysToRemove.length; ++i)
		{
			var key = this.objectKeysToRemove[i];
			if(key in this.objects)
			{
				delete this.objects[key];
				// this.logger.debug("deleted object key:" + key);
			}
			else
			{
				this.logger.warn("key in objectKeysToRemove but not in objects key:" + key);
			}
		}
		this.objectKeysToRemove = [];

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

Region.Width = Block.Width * 20;
Region.Height = Block.Height * 20;



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
	
	save: function()
	{
		this.logger.debug("called");
		var regions = {};
		for(var key in this.regions)
		{
			regions[key] = this.regions[key].save();
		}
		var data = JSON.stringify({regions:regions});
		console.log(data);
		localStorage.setItem("sge_save", data)
	},
	
	clear: function()
	{
		this.logger.debug("called");
		this.regions = {};
	},
	
	load: function()
	{
		this.logger.debug("called");
		var data = localStorage.getItem("sge_save");
		data = JSON.parse(data);
		console.log(data);
		for(var k in data.regions)
		{
			var regionData = data.regions[k];
			var xy = k.split(",");
			var region = this.getRegion(parseInt(xy[0]), parseInt(xy[1]));
			region.load(regionData);
		}
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
		var region = new Region(this);
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
	
	getOccupiedKeys: function(x, y, width, height)
	{
		// this.logger.debug("called");
		x = parseInt(x);
		y = parseInt(y);
		width = parseInt(width);
		height = parseInt(height);
		var keys = [];
		var sx = Math.floor(x/Block.Width)*Block.Width;
		var sy = Math.floor(y/Block.Height)*Block.Height;

		var ex = Math.floor(((x+width)/Block.Width)*Block.Width);
		var ey = Math.floor(((y+height)/Block.Height)*Block.Height);
		
		// console.log(sx,sy,ex,ey);

		for(var cy=sy; cy<ey; cy+=Block.Height)
		{
			for(var cx=sx; cx<ex; cx+=Block.Width)
			{
				var key = cx + "," + cy;
				if(keys.indexOf(key) < 0)
				{
					keys.push(key);
				}
			}
		}
		
		return keys;
	},
	
	// Returns the items that are in b but not in a.
	arrayDifference: function(a, b)
	{
		// this.logger.debug("called");
		// console.log(a,b);
		var diff = [];
		for(var i=0; i<b.length; ++i)
		{
			if(a.indexOf(b[i]) < 0)
			{
				diff.push(b[i]);
			}
		}
		// console.log(diff);
		return diff;
	},
	
	// Returns the axis aligned bounding box that contains both objects a and b.
	getBoundingBox: function(ax, ay, aw, ah, bx, by, bw, bh)
	{
		// this.logger.debug("called");
		// console.log(ax, ay, aw, ah, bx, by, bw, bh);
		
		ax = parseInt(ax);
		ay = parseInt(ay);
		aw = parseInt(aw);
		ah = parseInt(ah);

		bx = parseInt(bx);
		by = parseInt(by);
		bw = parseInt(bw);
		bh = parseInt(bh);

		
		var aex = ax + aw;
		var aey = ay + ah;
		
		var bex = bx + bw;
		var bey = by + bh;
		
		var x = ax<bx?ax:bx;
		var y = ay<by?ay:by;
		
		var ex = aex>bex?aex:bex;
		var ey = aey>bey?aey:bey;
		
		var width = ex - x;
		var height = ey - y;
		
		var bb = [parseInt(x), parseInt(y), parseInt(width), parseInt(height)];
		// console.log(bb);
		return bb;
	},
	
	
	moveObject: function(currKey, newKey)
	{
		// this.logger.debug("called");
		// console.log(currKey, newKey);
		var currxy = currKey.split(",");
		var newxy = newKey.split(",");
		
		var currRegion = this.getRegion(currxy[0], currxy[1]);
		var newRegion = this.getRegion(newxy[0], newxy[1]);
		
		var o = currRegion.getObjectAt(currxy[0], currxy[1]);
		if(o == null)
		{
			this.logger.error("can't move object. None exists at currKey: " + currKey + " dest was " + newKey);
		}
		
		// Get all keys occupied by the object to be moved.
		// Using key's xy value because the objet itself has likely already moved. (???)
		var startOccupiedKeys = this.getOccupiedKeys(currxy[0], currxy[1], o.width, o.height);
		// Find the bounding box that occupies the entire movement.
		var totalBounds = this.getBoundingBox(currxy[0], currxy[1], o.width, o.height, o.x, o.y, o.width, o.height);
		// Find all keys inside the total bounds.
		var totalOccupiedKeys = this.getOccupiedKeys(totalBounds[0], totalBounds[1], totalBounds[2], totalBounds[3]);
		// Find the keys that are newly occupied during the move. Don't need to check keys that were already occupied.
		var keys = this.arrayDifference(startOccupiedKeys, totalOccupiedKeys);

		for(var i=0; i<keys.length; ++i)
		{
			var xy = keys[i].split(",");
			
			var blockingObject = this.getObjectAt(parseInt(xy[0]), parseInt(xy[1]));
			if(blockingObject != null)
			{
				o.collision(blockingObject);
				return false;
			}
		}
		
		if(o.getKey() != currKey)
		{
			newRegion.addObject(o);
			currRegion.removeObject(currKey);
		}
		// this.logger.debug("moved from " + currKey + " to " + newKey);
		// this.logger.error("done");
		return true;
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

	removeObject: function(key)
	{
		var xy = key.split(",")
		var region = this.getRegion(xy[0], xy[1]);
		region.removeObject(key);
	}
	
});


R = {};
R.Region = Region;
R.RegionIndex = RegionIndex;
R.Key = Key;
module.exports = R;
