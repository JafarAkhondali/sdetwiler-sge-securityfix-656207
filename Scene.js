var GameObject = require('./GameObject');
var Quadtree = require('./Quadtree');
var Block = require('./Block');
var RedBlock = require('./RedBlock');
var GreenBlock = require('./GreenBlock');
var BlueBlock = require('./BlueBlock');
var BrownBlock = require('./BrownBlock');
var WhiteBlock = require('./WhiteBlock');
var YellowBlock = require('./YellowBlock');
var OrangeBlock = require('./OrangeBlock');

///////////////////////////////////////////////////////////////////////////////
// Scene
//
// A Scene contains GameObjects.
//
///////////////////////////////////////////////////////////////////////////////
var Scene = Quadtree.extend({
	init: function(parent)
	{
		this._super(parent);
		this.logger.scope = "Scene";

		this.fillColor = this.processing.color(255,255,255);
		this.strokeColor = this.processing.color(0,0,0);
		
		this.cameraX = 0;
		this.cameraY = 0;
		this.cameraSpeed = 0.2;
		
		this.commit();
	},
	
	commit: function()
	{
		this.targetCameraX = this.cameraX;
		this.targetCameraY = this.cameraY;
		this.targetCameraSpeed = this.cameraSpeed;
	},
	
	
	placeBlock: function(x, y)
	{
		x = Math.floor(x/Block.Width)*Block.Width;
		y = Math.floor(y/Block.Height)*Block.Height;
		
		if(this.getObjectAt(x, y) != null)
		{
			// this.logger.debug("Already a block at " + x + "," + y);
			return null;
		}
		
		var go = null;
		
		// HACK
		// console.log(this.parent.menu.selectedMenuItem.label);
		switch(this.parent.menu.selectedMenuItem.label)
		{
		case "Red":
			go = new RedBlock(this);
			break;
		case "Green":
			go = new GreenBlock(this);
			break;
		case "Blue":
			go = new BlueBlock(this);
			break;
		case "Brown":
			go = new BrownBlock(this);
			break;
		case "White":
			go = new WhiteBlock(this);
			break;
		case "Yellow":
			go = new YellowBlock(this);
			break;
		case "Orange":
			go = new OrangeBlock(this);
			break;
		default:
			go = new Block(this);
		}

		go.x = x;
		go.y = y;
		go.commit();
		this.addObject(go);
		return go;
	},
	
	capLerp: function(start, end, speed)
	{
		var n = this.processing.lerp(start, end, speed);
		if(Math.abs(end-n) < 0.1)
		{
			n = end;
		}
		
		return n;
	},

	update: function()
	{
		// this.logger.debug("called");
		var changed = this._super();
		
		if(this.cameraSpeed != this.targetCameraSpeed)
		{
			this.cameraSpeed = this.capLerp(this.cameraSpeed, this.targetCameraSpeed, this.cameraSpeed);
			changed = true;
		}
		if(this.cameraX != this.targetCameraX)
		{
			this.cameraX = this.capLerp(this.cameraX, this.targetCameraX, this.cameraSpeed);
			changed = true;
		}
		if(this.cameraY != this.targetCameraY)
		{
			this.cameraY = this.capLerp(this.cameraY, this.targetCameraY, this.cameraSpeed);
			changed = true;
		}
		
		return changed;
	},
	
	mouseDragged: function(x, y)
	{
		var o = this.placeBlock(x-this.cameraX, y-this.cameraY);
		// if(o != null)
		// {
		// 	this.logger.debug("(" + o.x + "," + o.y + "): " + o.id.toString());
		// }
		return true;
	},
	
	draw: function(x, y, width, height)
	{
		this.processing.pushMatrix();
		this.processing.translate(this.cameraX, this.cameraY);
		var drawCount = this._super(x-this.cameraX, y-this.cameraY, width, height);
		this.processing.popMatrix();

		if(this.debug == true)
		{
			
			var txt ="";
			txt+= "camera:        " + Math.round(this.cameraX) + "," + Math.round(this.cameraY) + "\n";
			txt+= "nodes:         " + this.nodeCount() + "\n";
			txt+= "nodes drawn:   " + drawCount[0] + "\n";
			txt+= "objects:       " + this.objectCount() + "\n";
			txt+= "objects drawn: " + drawCount[1] + "\n";

			this.processing.fill(255,255,255);
			this.processing.textSize(12);
			this.processing.textAlign(this.processing.LEFT, this.processing.TOP);			
			this.processing.text(txt, this.processing.width-250, 0);
		}
		
	},
	
	mouseClicked: function(x, y)
	{
		// Use default implementation to check if any children will handle the mouseClick.
		if(this._super(x-this.cameraX, y-this.cameraY) == true)
		{
			return true;
		}

		this.logger.debug("no Scene children handled click (" + x +"," + y + ") Placing block.")
		// No children handled the mouseClick, handle here.
		var o = this.placeBlock(x-this.cameraX, y-this.cameraY);
		// if(o != null)
		// {
		// 	this.logger.debug("(" + o.x + "," + o.y + "): " + o.id.toString());
		// }
		return true;
	},
	
	keyPressed: function()
	{
		this.logger.debug(this.processing.keyCode);
		if(this.processing.keyCode == 39)
		{
			this.targetCameraX-=15;
		}
		else if(this.processing.keyCode == 38)
		{
			this.targetCameraY+=15;
		}
		else if(this.processing.keyCode == 37)
		{
			this.targetCameraX+=15;
		}
		else if(this.processing.keyCode == 40)
		{
			this.targetCameraY-=15;
		}
		
		
		else if(this.processing.keyCode == 68)
		{
			this.setDebug(!this.debug);
		}
		else if(this.processing.keyCode == 65)
		{
			this.logger.debug("audit beginning");
			this.audit([]);
			this.logger.debug("audit complete");
		}
	}
	
});

module.exports = Scene;
