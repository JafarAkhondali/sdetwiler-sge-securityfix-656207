var GameObject = require('./GameObject');
var UUID = require('./uuid-js');

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
		this.id = UUID.create();

		this.width = Block.Width;
		this.height = Block.Height;
		this.commit();
		
		this.fillColor = this.processing.color(255,255,255);
		this.strokeColor = this.processing.color(0,0,0);
		this.isDestroying = false;
		
		this.targetFillColor = this.fillColor;
		
		// this.logger.debug(this.id.toString());
	},
	
	drawObject: function()
	{
		this.processing.fill(this.fillColor);
		this.processing.stroke(this.strokeColor);
		this.processing.rect(0, 0, this.width, this.height);
		
		if(true)
		{
			this.processing.stroke(255,255,255);
			this.processing.fill(255,255,255);
			this.processing.textSize(8);
			this.processing.textAlign(this.processing.LEFT, this.processing.TOP);
			// this.processing.text(this.x + "," + this.y, 0,0);
		}
		
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
			this.logger.debug("isDestroying");
			if(!changed)
			{
				this.logger.debug("!changed");
				this.parent.removeObject(this);
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
		var n = Block.Width;
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

Block.Width = 20;
Block.Height = 20;

module.exports = Block;
