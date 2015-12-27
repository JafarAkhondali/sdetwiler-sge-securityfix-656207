var GameObject = require('./GameObject');
var Block = require('./Block');
var RedBlock = require('./RedBlock');
var GreenBlock = require('./GreenBlock');
var BlueBlock = require('./BlueBlock');

///////////////////////////////////////////////////////////////////////////////
// Scene
//
// A Scene contains GameObjects.
//
///////////////////////////////////////////////////////////////////////////////
var Scene = GameObject.extend({
	init: function(parent)
	{
		this._super(parent);
		this.logger.scope = "Scene";

		this.fillColor = this.processing.color(255,255,255);
		this.strokeColor = this.processing.color(0,0,0);
	},
		
	drawObject: function()
	{
	},
	
	placeBlock: function(x, y)
	{
		var go = null;
		
		// HACK
		console.log(this.parent.menu.selectedMenuItem.label);
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
		default:
			go = new Block(this);
		}

		console.log(go);
		x = Math.round(x/go.width)*go.width;
		y = Math.round(y/go.height)*go.width;
		go.x = x-(go.width/2);
		go.y = y-(go.height/2);
		
		this.addChild(go);
	},
	
	mouseClicked: function(x, y)
	{
		// Use default implementation to check if any children will handle the mouseClick.
		if(this._super(x, y) == true)
		{
			return true;
		}

		this.logger.debug("no Scene children handled click. Placing block.")
		// No children handled the mouseClick, handle here.
		this.placeBlock(x-this.x, y-this.y);
		return true;
	}
});

module.exports = Scene;
