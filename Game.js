var Class = require('./Class');
var Log = require('./Log');

var Scene = require('./Scene');
var Menu = require('./Menu');
var Block = require('./Block');

///////////////////////////////////////////////////////////////////////////////
// GameController
///////////////////////////////////////////////////////////////////////////////
var GameController = Class.extend({
	init: function()
	{
		this._super();
		this.logger = new Log.Logger("GameController");
		this.logger.LogMask = Log.DEBUG | Log.WARN | Log.ERROR;

		this.processing = null;
		this.rootGameObject = null;
	},

	// This function binds the game to the Processing.js runtime.
	sketchProc: function(processing)
	{
		this.logger.debug("Binding Processing.js");
		this.processing = processing;
		this.processing.width = window.innerWidth;
		this.processing.height = window.innerHeight;

		processing.draw = this.draw.bind(this);
		processing.mouseClicked = this.mouseClicked.bind(this);
		processing.mouseDragged = this.mouseDragged.bind(this);
		processing.keyPressed = this.keyPressed.bind(this);
		this.menu = new Menu.Menu(this);
		
		this.scene = new Scene(this);
		// this.scene.width = Number.MAX_VALUE;
		// this.scene.height = Number.MAX_VALUE;
		this.scene.width = 1000 * Block.Width;
		this.scene.height = 1000 * Block.Height;
	},
	
	update: function()
	{
		this.menu.update();
		this.scene.update();
	},
	
	draw: function()
	{
		this.update();
		
		// Clear the canvas.
		this.processing.stroke(0, 0, 0);
		this.processing.fill(0, 0, 0);
		this.processing.rect(0, 0, this.processing.width, this.processing.height);
		
		this.scene.draw(0,0,this.processing.width, this.processing.height);
		this.menu.draw();
	},
	
	mouseClicked: function()
	{
		var x = this.processing.mouseX;
		var y = this.processing.mouseY;
		
		if(this.menu.mouseClicked(x, y))
		{
			return;
		}
		else if(this.scene.mouseClicked(x, y))
		{
			return;
		}
	},

	mouseDragged: function()
	{
		var x = this.processing.mouseX;
		var y = this.processing.mouseY;
		
		if(this.menu.mouseDragged(x, y))
		{
			return;
		}
		else if(this.scene.mouseDragged(x, y))
		{
			return;
		}
	},
	
	keyPressed: function()
	{
		this.scene.keyPressed();
	}
	
});

var Game = {};
Game.GameController = GameController;
module.exports = Game;
