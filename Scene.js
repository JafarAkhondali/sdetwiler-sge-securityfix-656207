var Region = require('./Region');
var GameObject = require('./GameObject');
var Creature = require('./Creature');
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
var Scene = Region.RegionIndex.extend({
	init: function(parent)
	{
		this._super(parent);
		this.logger.scope = "Scene";

		this.fillColor = this.processing.color(255,255,255);
		this.strokeColor = this.processing.color(0,0,0);
		
		this.cameraX = 0;
		this.cameraY = 0;
		this.cameraSpeed = 0.2;
		
		this.paused = false;
		
		this.commit();
	},
	
	commit: function()
	{
		this.targetCameraX = this.cameraX;
		this.targetCameraY = this.cameraY;
		this.targetCameraSpeed = this.cameraSpeed;
	},
	
	togglePause: function()
	{
		this.logger.debug("called");
		this.paused = !this.paused;
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
		
		if(this.parent.menu.selectedMenuItem.label == "Villageacon")
		{
			var villageacon = '{"blocks":{"40,0":{"type":"Red"},"40,20":{"type":"White"},"40,40":{"type":"White"},"40,60":{"type":"White"},"20,60":{"type":"White"},"0,60":{"type":"White"},"0,80":{"type":"White"},"40,80":{"type":"White"},"60,60":{"type":"White"},"80,60":{"type":"White"},"80,80":{"type":"White"},"20,20":{"type":"White"},"60,20":{"type":"White"},"80,20":{"type":"Orange"},"0,20":{"type":"Orange"}},"speed":0.05,"v":1}';
			var data = JSON.parse(villageacon);
			go = new Creature(this, data);
		}
		else if(this.parent.menu.selectedMenuItem.label == "Baby")
		{
			var data = JSON.parse('{"blocks":{"20,0":{"type":"Red"},"20,20":{"type":"Brown"},"20,40":{"type":"Brown"},"0,20":{"type":"Brown"},"40,20":{"type":"Brown"},"20,60":{"type":"Brown"}},"speed":0.1,"v":1}');
			go = new Creature(this, data);
		}
		else if(this.parent.menu.selectedMenuItem.label == "Chicken")
		{
			var data = JSON.parse('{"blocks":{"20,0":{"type":"Red"},"20,20":{"type":"White"},"0,20":{"type":"White"},"40,20":{"type":"White"},"20,40":{"type":"Yellow"}},"speed":0.12,"v":1}');
			go = new Creature(this, data);
		}
		else if(this.parent.menu.selectedMenuItem.label == "Diggeracon")
		{
			var data = JSON.parse('{"blocks":{"0,40":{"type":"Blue"},"40,40":{"type":"Blue"},"0,20":{"type":"Blue"},"20,20":{"type":"Blue"},"40,20":{"type":"Blue"},"60,0":{"type":"Blue"}},"speed":0.5,"v":1}');
			go = new Creature(this, data);
		}
		else
		{
			go = Block.createBlock(this.parent.menu.selectedMenuItem.label, this, null);
		}
		
		if(go != null)
		{
			go.x = x;
			go.y = y;
			go.commit();
			this.addObject(go);
		}
		else
		{
			this.logger.error("No block registered for type " + this.parent.menu.selectedMenuItem.label);
		}
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
		if(this.paused)
		{
			return false;
		}

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
		if(this.paused)
		{
			this.processing.fill(255,255,255);
			this.processing.textSize(16);
			this.processing.textAlign(this.processing.LEFT, this.processing.TOP);
			this.processing.text("[p]aused", 10, 10);
			return;
		}
		
		// Clear the canvas.
		this.processing.stroke(0, 0, 0);
		this.processing.fill(0, 0, 0);
		this.processing.rect(0, 0, this.processing.width, this.processing.height);
		
		this.processing.pushMatrix();
		this.processing.translate(this.cameraX, this.cameraY);
		var drawCount = this._super(x-this.cameraX, y-this.cameraY, width, height);
		this.processing.popMatrix();

		if(this.debug == true)
		{
			
			var txt ="";
			txt+= "camera:        " + Math.round(this.cameraX) + "," + Math.round(this.cameraY) + "\n";
			txt+= "objects:       " + this.objectCount() + "\n";
			txt+= "objects drawn: " + drawCount[1] + "\n";

			this.processing.fill(255,255,255);
			this.processing.textSize(12);
			this.processing.textAlign(this.processing.LEFT, this.processing.TOP);
			this.processing.text(txt, 10, 10);
		}
		
	},
	
	mouseClicked: function(x, y)
	{
		// Use default implementation to check if any children will handle the mouseClick.
		if(this._super(x-this.cameraX, y-this.cameraY) == true)
		{
			return true;
		}

		// this.logger.debug("no Scene children handled click (" + x +"," + y + ") Placing block.")
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
		
		// d
		else if(this.processing.keyCode == 68)
		{
			this.setDebug(!this.debug);
		}
		
		// s
		else if(this.processing.keyCode == 83)
		{
			this.save();
		}

		// t
		else if(this.processing.keyCode == 84)
		{
			this.saveAsTemplate();
		}

		// l
		else if(this.processing.keyCode == 76)
		{
			this.load();
		}

		// c
		else if(this.processing.keyCode == 67)
		{
			this.clear();
		}
		
		
		// p
		else if(this.processing.keyCode == 80)
		{
			this.togglePause();
		}

		// k
		else if(this.processing.keyCode == 75)
		{
			this.kill = true;
		}
		
	}
	
});

module.exports = Scene;
