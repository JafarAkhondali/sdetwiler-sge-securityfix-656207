var GameObject = require('./GameObject');
var Block = require('./Block');
var Key = require('./Key');

///////////////////////////////////////////////////////////////////////////////
// Item
//
// An item is a owned set of GameObjects that can be interacted with as a
// single Item. The GameObjects are not children of the item and instead exist
// directly in a region.
//
//
///////////////////////////////////////////////////////////////////////////////
var Item = Block.extend({
	init: function(parent, data)
	{
		this.pendingData = null;
		this.ownedObjects = [];
		this._super(parent);
		this.logger.scope = "Item";
		this.logger.debug("called");

		this.type = Item.Type;

		this.pendingData = data;
	},
	
	load: function(data)
	{
		var blocks = data["blocks"];
		for(var k in blocks)
		{
			var key = new Key();
			key.fromString(k);
			var blockData = blocks[k];
			var block = Block.createBlock(blockData.type, this.parent, blockData);
			if((key.x == 0) && (key.y == 0)) // TODO Adjustable anchor.
			{
				this.logger.debug("Patching Item Anchor");
				this.fillColor = block.fillColor;
				this.strokeColor = block.strokeColor;
				this.targetWidth = this.width = block.width;
				this.targetHeight = this.height = block.height;

			}
			else
			{
				block.x = key.x + this.x;
				block.y = key.y + this.y;
				block.itemOwner = this;
				this.ownedObjects.push(block);
				block.commit();
				this.parent.addObject(block);
			}
		}
	},
	
	getKey: function()
	{
		var key = new Key();
		key.x = Math.floor(this.x/Block.Width)*Block.Width;
		key.y = Math.floor(this.y/Block.Height)*Block.Height;
		return key;
	},
	
	commit: function()
	{
		var dx = this.x-this.targetX;
		var dy = this.y-this.targetY;
		var dw = this.width-this.targetWidth;
		var dh = this.height-this.targetHeight;
		var ds = this.speed-this.targetSpeed;
		
		this._super();
		
		for(var i=0; i<this.ownedObjects.length; ++i)
		{
			var o = this.ownedObjects[i];
			o.x+=dx;
			o.y+=dy;
			o.width+=dy;
			o.height+=dh;
			o.speed+=ds;
			o.commit();
		}
		
		if(this.pendingData != null)
		{
			this.load(this.pendingData);
		}
	},
	
	update: function()
	{
		var x = this.x;
		var y = this.y;
		// this.logger.debug("called");
		// console.log(this.x, this.targetX, this.speed);
		var changed = this._super();
		if(changed == true)
		{
			var dx = this.x - x;
			var dy = this.y - y;
			console.log(dx, dy);
			for(var i=0; i<this.ownedObjects.length; ++i)
			{
				var o = this.ownedObjects[i];
				o.x+= dx;
				o.y+= dy;
				var oldKey = o.getKey();
				o.commit();
				var newKey = o.getKey();
				if(oldKey.toString() != newKey.toString())
				{
					this.parent.parent.removeObject(oldKey);
					this.parent.parent.addObject(o);
				}
			}
		}
		if(changed == false && this.collisionDetectionEnabled == false)
		{
			this.collisionDetectionEnabled = true;
			for(var i=0; i<this.ownedObjects.length; ++i)
			{
				var o = this.ownedObjects[i];
				o.collisionDetectionEnabled = true;
			}
		}
		return changed;
	},
	
	collision: function(collisionAtKey, o)
	{
		this.targetX = this.x = collisionAtKey.x;
		// this.targetY = this.y = collisionAtKey.y;
	},
	
	drawObject: function()
	{
		this.processing.fill(this.fillColor);
		this.processing.stroke(this.strokeColor);
		this.processing.rect(0, 0, this.width, this.height);
		this._super();
	},
	
	mouseClicked: function(x, y)
	{
		if(this.userInteractionEnabled && this.containsPoint(x, y))
		{
			this.logger.debug("clicked");
			this.startAction();
			return true;
		}
		return false;
	},
	
	startAction: function()
	{
		this.logger.debug("called");
		this.collisionDetectionEnabled = false;
		
		this.targetX = this.x+40;
		console.log(this.x, this.targetX);
		for(var i=0; i<this.ownedObjects.length; ++i)
		{
			var o = this.ownedObjects[i];
			o.collisionDetectionEnabled = false;
		}
	}
	
	
});
Item.Type = "Item";
module.exports = Item;
