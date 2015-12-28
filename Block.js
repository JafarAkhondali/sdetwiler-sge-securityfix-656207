var GameObject = require('./GameObject');

///////////////////////////////////////////////////////////////////////////////
// Block
//
//
///////////////////////////////////////////////////////////////////////////////
var Block = GameObject.extend({
	init: function(parent)
	{
		this._super(parent);
		this.logger.scope = "Block";
		this.width = Block.width;
		this.height = Block.height;
		this.commit();
		
		this.fillColor = this.processing.color(255,255,255);
		this.strokeColor = this.processing.color(0,0,0);
		this.isDestroying = false;
		
		this.targetFillColor = this.fillColor;
	},
	
	drawObject: function()
	{
		this.processing.fill(this.fillColor);
		this.processing.stroke(this.strokeColor);
		this.processing.rect(0, 0, this.width, this.height);
	},
	
	mouseClicked: function(x, y)
	{
		if(this.userInteractionEnabled && this.containsPoint(x, y))
		{
			this.logger.debug("clicked");
			this.destroy();
			return true;
		}
		return false;
	},
	
	update: function()
	{
		var changed = this._super();
		if(this.isDestroying)
		{
			if(!changed)
			{
				this.parent.removeChild(this);
			}
			else
			{
				this.fillColor = this.processing.lerpColor(this.fillColor, this.targetFillColor, this.speed);
			}
		}
		
		return changed;
	},
	
	destroy: function()
	{
		this.userInteractionEnabled = false;
		this.isDestroying = true;
		this.speed = this.targetSpeed = .4;
		var n = Block.width;
		this.targetX = this.x-n;
		this.targetY = this.y-n;
		this.targetWidth = this.width+(2*n);
		this.targetHeight = this.height+(2*n);
		
		this.targetFillColor = this.processing.color(
			this.processing.red(this.fillColor),
			this.processing.green(this.fillColor),
			this.processing.blue(this.fillColor),
			0
		);
	}
});

Block.width = 20;
Block.height = 20;

module.exports = Block;
