var GameObject = require('./GameObject');
var Block = require('./Block');
var Key = require('./Key');

///////////////////////////////////////////////////////////////////////////////
// Creature
//
//
///////////////////////////////////////////////////////////////////////////////
var Creature = GameObject.extend({
	init: function(parent, data)
	{
		this._super(parent);
		this.fillColor = this.processing.color(255, 255, 255);
		this.type = Creature.Type;
		this.speed = 0.05;
		this.commit();
		this.direction = 1;
		this.climbing = false;

		if(data != null)
		{
			this.load(data);
		}
	},
	
	getKey: function()
	{
		var key = new Key();
		key.x = Math.floor(this.x/Block.Width)*Block.Width;
		key.y = Math.floor(this.y/Block.Height)*Block.Height;
		return key;
	},
	
	load: function(data)
	{
		var blocks = data["blocks"];
		for(var k in blocks)
		{
			var key = new Key();
			key.fromString(k);
			var blockData = blocks[k];
			var block = Block.createBlock(blockData.type, this, blockData);
			block.x = key.x;
			block.y = key.y;
			block.commit();
			this.addChild(block);
			
			if((block.x + block.width) > this.width)
			{
				this.width = block.x + block.width;
			}
			if((block.y + block.height) > this.height)
			{
				this.height = block.y + block.height;
			}
		}
		
		this.movingSpeed = this.speed = this.targetSpeed = data["speed"];
	},
	
	update: function()
	{
		var currKey = this.getKey();
		// this.logger.debug("called");
		var changed = this._super();
		
		// Gravity check...
		var blocksBelow = this.parent.parent.getOccupiedKeys(this.x, this.y+(this.height), this.width, Block.Height);
		if(blocksBelow.length==0 && !this.climbing)
		{
			this.logger.debug("applying gravity");
			this.targetSpeed = 1.0;
			
			this.targetY = currKey.y + (Block.Height);
			changed = true;
		}
		// else
		// {
		// 	console.log(blocksBelow);
		// 	for(var i=0; i<blocksBelow.length; ++i)
		// 	{
		// 		var xy = blocksBelow[i].split(",");
		// 		var x = parseInt(xy[0]);
		// 		var y = parseInt(xy[1]);
		// 		var b = this.parent.parent.getObjectAt(x,y);
		// 		console.log(b);
		// 	}
		// }
		else
		{
			this.targetSpeed = this.movingSpeed;
			this.targetX = currKey.x+(Block.Width * this.direction);
			if(this.direction==1)
			{
				this.targetX+=Block.Width;
			}
			changed = true;
		}

		this.climbing = false;
		return changed;
	},
	
	collision: function(collisionAtKey, o)
	{
		// this.logger.debug("called");
		var thisKey = this.getKey();
		var stepKeys = null;
		if(collisionAtKey.x > o.x)
		{
			this.logger.debug("left collide key:" + collisionAtKey.toString());
			stepKeys = this.parent.parent.getOccupiedKeys(collisionAtKey.x-Block.Width, collisionAtKey.y, Block.Width, this.height-Block.Height);
			this.direction = 1;
		}
		else if(collisionAtKey.x < o.x)
		{
			this.logger.debug("right collide key:" + collisionAtKey.toString());
			
			// HACK: Can't track down some sort of rounding error that occasionally places the collisionAtKey on the wrong side of the object itself
			// when collisions occur right on a floating point rounding boundary. -SCD
			if(collisionAtKey.x < thisKey.x)
			{
				this.logger.debug("collision hack applied");
				collisionAtKey = thisKey;
			}
			
			stepKeys = this.parent.parent.getOccupiedKeys(collisionAtKey.x+this.width, collisionAtKey.y, Block.Width, this.height-Block.Height);
			this.direction = -1;
		}

		// console.log(stepKeys);
		
		
		if(this.parent.parent.kill == true)
		{
			this.logger.error("Killing");
		}
		
		if((stepKeys!=null) && (stepKeys.length == 0))
		{
			this.direction = -this.direction;
			this.targetX = collisionAtKey.x+(Block.Width * this.direction);
			this.targetY = collisionAtKey.y-(Block.Height);
			this.climbing = true;
		}
		this.targetX = this.x = collisionAtKey.x;
		// this.y = collisionAtKey.y;
		// console.log(this.direction);
	},
	
});
Creature.Type = "Creature";
module.exports = Creature;
