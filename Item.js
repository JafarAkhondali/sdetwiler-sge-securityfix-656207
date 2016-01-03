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
		this._super(parent);
		this.logger.scope = "Item";
		this.type = Item.Type;
		this.ownedObjects = [];
		this.pendingData = data;
		this.actionActive = false;
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
				block.commit();
				this.ownedObjects.push(block);
				this.parent.parent.addObject(block);
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
		this._super();
	},
	
	update: function()
	{
		// this.logger.debug("---");
		if(this.pendingData)
		{
			this.load(this.pendingData);
			this.pendingData = null;
		}
		
		// Remove all owned objects from the RegionIndex.
		for(var i=0; i<this.ownedObjects.length; ++i)
		{
			var o = this.ownedObjects[i];
			if(o.parent != null)
			{
				var key = o.getKey();
				var existingObject = this.parent.parent.getObjectAt(key.x, key.y);
				if(existingObject != this)
				{
					this.parent.parent.removeObject(key);
				}
				
			}
		}


		var changed = this._super();

			
		// Put the owned objects back in their new locations.
		for(var i=0; i<this.ownedObjects.length; ++i)
		{
			var o = this.ownedObjects[i];
			var dx = this.x - o.x;
			var dy = this.y - o.y;
			var r = Math.sqrt((dx*dx) + (dy*dy));
			
			var ox = r * Math.cos(this.processing.radians(this.rotation));
			var oy = r * Math.sin(this.processing.radians(this.rotation));
			ox = Math.round10(ox, -4);
			oy = Math.round10(oy, -4);
			
			o.x = o.targetX = this.x + ox;
			o.y = o.targetY = this.y + oy;
			var newKey = o.getKey();

			var existingObject = this.parent.parent.getObjectAt(newKey.x, newKey.y);
			if(existingObject == null)
			{
				this.parent.parent.addObject(o);
			}
			else
			{
				// TODO
			//	this.logger.debug("Item collision or overlapping Item ownedObjet at " + newKey.toString());
			}
		}

		if(changed == false)
		{
			if(this.actionActive == true)
			{
				this.actionActive = false;
				this.logger.debug("inactive");
				
				// Force all owned objects to their key locations.
				for(var i=0; i<this.ownedObjects.length; ++i)
				{
					var o = this.ownedObjects[i];
					var key = o.getKey();
					o.targetX = o.x = key.x;
					o.targetY = o.y = key.y;
					this.parent.parent.removeObject(key);
					this.parent.parent.addObject(o);
				}
				
				
				
				console.log(this.ownedObjects);
			}
		}
		
		
		return changed;
	},
	
	collision: function(collisionAtKey, o)
	{
		this.targetX = this.x = collisionAtKey.x;
		// this.targetY = this.y = collisionAtKey.y;
	},
	
	preDraw: function()
	{
		this._super();
		this.processing.translate(Block.Width/2, Block.Height/2);
		this.processing.rotate(this.processing.radians(this.rotation));
		this.processing.translate(-Block.Width/2, -Block.Height/2);
	},
	
	drawObject: function()
	{
		this._super();
	},
	
	postDraw: function()
	{
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
		this.actionActive = true;
		if(this.targetRotation == 0)
		{
			this.targetRotation = 90;
		}
		else
		{
			this.targetRotation = 0;
		}
	}
	
	
});
Item.Type = "Item";
module.exports = Item;
