var Class = require('./Class');
var Log = require('./Log');
var Block = require('./Block');
var Key = require('./Key');

///////////////////////////////////////////////////////////////////////////////
// Region
//
///////////////////////////////////////////////////////////////////////////////
var Region = Class.extend({
	
	
	// createThing: function(type, parent, data)
	// {
	// 	if(this.parent.menu.selectedMenuItem.label == "Villageacon")
	// 	{
	// 		var villageacon = '{"blocks":{"40,0":{"type":"Red"},"40,20":{"type":"White"},"40,40":{"type":"White"},"40,60":{"type":"White"},"20,60":{"type":"White"},"0,60":{"type":"White"},"0,80":{"type":"White"},"40,80":{"type":"White"},"60,60":{"type":"White"},"80,60":{"type":"White"},"80,80":{"type":"White"},"20,20":{"type":"White"},"60,20":{"type":"White"},"80,20":{"type":"Orange"},"0,20":{"type":"Orange"}},"speed":0.05,"v":1}';
	// 		var data = JSON.parse(villageacon);
	// 		go = new Creature(this, data);
	// 	}
	// 	else if(this.parent.menu.selectedMenuItem.label == "Baby")
	// 	{
	// 		var data = JSON.parse('{"blocks":{"20,0":{"type":"Red"},"20,20":{"type":"Brown"},"20,40":{"type":"Brown"},"0,20":{"type":"Brown"},"40,20":{"type":"Brown"},"20,60":{"type":"Brown"}},"speed":0.1,"v":1}');
	// 		go = new Creature(this, data);
	// 	}
	// 	else if(this.parent.menu.selectedMenuItem.label == "Chickenacon")
	// 	{
	// 		var data = JSON.parse('{"blocks":{"20,0":{"type":"Red"},"20,20":{"type":"White"},"0,20":{"type":"White"},"40,20":{"type":"White"},"20,40":{"type":"Yellow"}},"speed":0.12,"v":1}');
	// 		go = new Creature(this, data);
	// 	}
	// 	else if(this.parent.menu.selectedMenuItem.label == "Mineracon")
	// 	{
	// 		var data = JSON.parse('{"blocks":{"0,40":{"type":"Blue"},"40,40":{"type":"Blue"},"0,20":{"type":"Blue"},"20,20":{"type":"Blue"},"40,20":{"type":"Blue"},"60,0":{"type":"Blue"}},"speed":0.5,"v":1}');
	// 		go = new Creature(this, data);
	// 	}
	// 	else if(this.parent.menu.selectedMenuItem.label == "Blobacon")
	// 	{
	// 		var data = JSON.parse('{"blocks":{"0,0":{"type":"Green"},"20,0":{"type":"Green"},"40,0":{"type":"Green"},"40,20":{"type":"Green"},"40,40":{"type":"Green"},"20,40":{"type":"Green"},"0,40":{"type":"Green"},"0,20":{"type":"Green"},"20,20":{"type":"Blue"},"40,60":{"type":"Green"},"0,60":{"type":"Green"}},"speed":0.001,"v":1}');
	// 		go = new Creature(this, data);
	// 	}
	//
	// 	else if(this.parent.menu.selectedMenuItem.label == "Bridge")
	// 	{
	// 		var data = JSON.parse('{"blocks":{"100,0":{"type":"Yellow"},"80,0":{"type":"White"},"60,0":{"type":"White"},"40,0":{"type":"White"},"20,0":{"type":"White"},"0,0":{"type":"White"}},"speed":0.5,"v":1}');
	// 		go = new Item(this, data);
	// 	}
	// 	else
	// 	{
	// 		go = Block.createBlock(blockData.type, this, blockData);
	//
	// 	}
	//
	// 	return go;
	// },
	
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
			var key = new Key();
			key.fromString(k);
			var blockData = data[k];
			var block = Block.createBlock(blockData.type, this, blockData);
			if(block != null)
			{
				block.x = key.x;
				block.y = key.y;
				block.commit();
				console.log(block);
				this.addObject(block);
			}
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
		var key = o.getKey().toString();
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
		// this.logger.debug("called key:" + key.toString());
		this.objectKeysToRemove.push(key.toString());
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
			// this.logger.debug("Removed " + len + (len==1?" object." : " objects."));
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
		
		this.kill = false; // debugging kill switch.
	},
	
	translateToOrigin: function(data)
	{
		var x = Number.MAX_VALUE;
		var y = Number.MAX_VALUE;
		for(var k in data)
		{
			var xy = k.split(",");
			var cx = parseInt(xy[0]);
			var cy = parseInt(xy[1]);
			
			if(x > cx)
			{
				x = cx;
			}
			if(y > cy)
			{
				y = cy;
			}
		}
		
		var translated = {};
		for(var k in data)
		{
			var xy = k.split(",");
			var cx = parseInt(xy[0]) - x;
			var cy = parseInt(xy[1]) - y;
			
			var key = cx + "," + cy;
			translated[key] = data[k]
		}
		
		return translated;
	},
	
	
	saveAsTemplate: function()
	{
		this.logger.debug("called");
		var region = this.getRegion(0,0);
		var data = region.save();
		var template = {};
		template["blocks"] = this.translateToOrigin(data);
		template["speed"] = 0.5;
		template["v"] = 1;

		var js = JSON.stringify(template);
		console.log(js);
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
		if((x + Region.Width) > RegionIndex.MaxWidth)
		{
			return null;
		}
		else if((y + Region.Height) > RegionIndex.MaxHeight)
		{
			return null;
		}
		
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
			if(this.regions[k] != null)
			{
				this.regions[k].setDebug(enabled);
			}
		}
	},
	
	update: function()
	{
		for(var k in this.regions)
		{
			if(this.regions[k] != null)
			{
				this.regions[k].update();
			}
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
				if(region != null)
				{
					var counts = region.draw();
					regionCount+=counts[0];
					objectCount+=counts[1];
				}
			}
		}
		
		return [regionCount, objectCount];
	},
	
	mouseClicked: function(x, y)
	{
		var region = this.getRegion(x, y);
		if(region != null)
		{
			return region.mouseClicked(x, y);
		}
		return null;
	},
	
	getObjectAt: function(x, y)
	{
		var region = this.getRegion(x, y);
		if(region)
		{
			return region.getObjectAt(x, y);
		}
		return null;
	},
	
	addObject: function(o)
	{
		var region = this.getRegion(o.x, o.y);
		if(region != null)
		{
			return region.addObject(o);
		}
		return null;
	},
	
	getOccupiedKeys: function(x, y, width, height)
	{
		// this.logger.debug("called");
		//console.log("getOccupiedKeys", x,y,width,height);
		
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
				if(this.getObjectAt(cx, cy) != null)
				{
					var key = cx + "," + cy;
					keys.push(key);
				}
			}
		}
		// console.log(keys);
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
		
		var bb = [x, y, width, height];
		// console.log(bb);
		return bb;
	},
	
	
	moveObject: function(currKey, newKey)
	{
		// this.logger.debug("called");
		// console.log(currKey, newKey);
		
		var currRegion = this.getRegion(currKey.x, currKey.y);
		if(currRegion == null)
		{
			this.logger.warn("Can't get region containing key " + currKey.toString());
			return false;
		}
		var o = currRegion.getObjectAt(currKey.x, currKey.y);
		if(o == null)
		{
			this.logger.warn("can't move object. None exists at currKey: " + currKey.toString() + " dest was " + newKey.toString());
			return false;
		}

		var newRegion = this.getRegion(newKey.x, newKey.y);
		if(newRegion == null)
		{
			this.logger.warn("Cannot move to invalid key " + newKey.toString());
			this.removeObject(currKey);
			return true;
		}
		
		if(o.collisionDetectionEnabled == true)
		{
			// Get all keys occupied by the object to be moved.
			// Using key's xy value because the objet itself has likely already moved. (???)
			var startOccupiedKeys = this.getOccupiedKeys(currKey.x, currKey.y, o.width, o.height);
			// Find the bounding box that occupies the entire movement.
			var totalBounds = this.getBoundingBox(currKey.x, currKey.y, o.width, o.height, o.x, o.y, o.width, o.height);
			// Find all keys inside the total bounds.
			var totalOccupiedKeys = this.getOccupiedKeys(totalBounds[0], totalBounds[1], totalBounds[2], totalBounds[3]);
			// Find the keys that are newly occupied during the move. Don't need to check keys that were already occupied.
			var keys = this.arrayDifference(startOccupiedKeys, totalOccupiedKeys);

			for(var i=0; i<keys.length; ++i)
			{
				var xy = keys[i].split(",");
				var kx = parseInt(xy[0]);
				var ky = parseInt(xy[1]);
			
				var blockingObject = this.getObjectAt(kx, ky);
				if(blockingObject != null)
				{
					o.collision(currKey, blockingObject);
				}
			}
		}
		
		// TODO This is a problem if collision detection is disabled and the object is moving fast enough to traverse more than one block at a time.
		// SCD
		if(o.getKey() != currKey.toString())
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
		// console.log(key);
		var region = this.getRegion(key.x, key.y);
		if(region != null)
		{
			region.removeObject(key);
		}
	}
	
});

RegionIndex.MaxWidth = Region.Width * 10;
RegionIndex.MaxHeight = Region.Height * 10;

R = {};
R.Region = Region;
R.RegionIndex = RegionIndex;
module.exports = R;
