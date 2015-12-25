var GameObject = require('./GameObject');
var Log = require('./Log');


///////////////////////////////////////////////////////////////////////////////
// Menu
//
// A Menu
//
///////////////////////////////////////////////////////////////////////////////
var Menu = GameObject.extend({
	init: function(parent)
	{
		this._super(parent);
		this.logger.scope = "Menu";
		
		this.height = this.processing.height;
		this.width = 100;
		this.x = this.processing.width - this.width;
		this.y = 0;
		
		this.addMenuItem("One", this.processing.color(255, 0, 0), null);
		this.addMenuItem("Two", this.processing.color(0, 255, 0), null);
		this.addMenuItem("Three", this.processing.color(0, 0, 255), null);
	},

	addMenuItem: function(label, action)
	{
		var item = new MenuItem(this, label, action);
		item.y = 10 + this.children.length * (item.height + 10);
		item.x = (this.width - item.width) / 2;
		
		this.addChild(item);
	},
	
	drawObject: function()
	{
		this.processing.fill(100, 100, 100);
		this.processing.rect(0, 0, this.width, this.height);
	},

	mouseClicked: function(x, y)
	{
		this.logger.debug("called");
	}
});



///////////////////////////////////////////////////////////////////////////////
// MenuItem
//
// A MenuItem
//
///////////////////////////////////////////////////////////////////////////////
var MenuItem = GameObject.extend({
	init: function(parent, label, color, action)
	{
		this._super(parent);
		this.font = this.processing.loadFont("Arial.ttf"); 
		this.color = color;
		this.label = label;
		this.width = parent.width - 10;
		this.height = this.width;
	},

	drawObject: function()
	{
		this.processing.fill(this.color);
		this.processing.rect(0, 0, this.width, this.height);
		this.processing.textFont(this.font);
		this.processing.textAlign(this.processing.CENTER, this.processing.CENTER);
		this.processing.fill(255, 255, 255);
		this.processing.text(this.label, 0, 0, this.width, this.height);
	},

	mouseClicked: function()
	{
		this.logger.debug("MenuItem mouseClicked");
	}
});



module.exports = {};
module.exports.Menu = Menu;
module.exports.MenuItem = MenuItem;
