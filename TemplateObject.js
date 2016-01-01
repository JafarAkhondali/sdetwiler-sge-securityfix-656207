var GameObject = require('./GameObject');
var Block = require('./Block');
var Key = require('./Key');

///////////////////////////////////////////////////////////////////////////////
// TemplateObject
//
//
///////////////////////////////////////////////////////////////////////////////
var TemplateObject = GameObject.extend({
	init: function(parent, data)
	{
		this._super(parent);
		this.fillColor = this.processing.color(255, 255, 255);
		this.type = TemplateObject.Type;
		this.speed = 0.05;
		this.commit();
		this.direction = 1;

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
		for(var k in data)
		{
			var key = new Key();
			key.fromString(k);
			var blockData = data[k];
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
	},
	
	update: function()
	{
		// Gravity check...
		var blocksBelow = this.parent.parent.getOccupiedKeys(this.x, this.y+(this.height), this.width, Block.Height);
		if(blocksBelow.length==0)
		{
			this.targetSpeed = 1.0;
			
			this.targetY = this.y + (Block.Height);
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
			this.targetSpeed = 0.05;
			this.targetX = this.x+(Block.Width * this.direction);
		}
		var changed = this._super();
		
		return changed;
	},
	
	collision: function(o)
	{
		// this.logger.debug("called");
		if(this.direction == 1)
		{
			this.direction = -1;
		}
		else
		{
			this.direction = 1;
		}
	},
	
});
TemplateObject.Type = "TemplateObject";
module.exports = TemplateObject;
