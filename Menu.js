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
		
		this.height = 10;
		this.width = 120;
		this.x = this.processing.width - this.width;
		this.y = 0;
		this.isOpen = true;
		this.commit();
		
		this.selectedMenuItem = null;
		var item = this.addMenuItem("Red", this.processing.color(255, 0, 0), null);

		this.addMenuItem("Villageacon", this.processing.color(255, 140, 0), null);
		this.addMenuItem("Baby", this.processing.color(255, 140, 0), null);
		this.addMenuItem("Chickenacon", this.processing.color(255, 140, 0), null);
		this.addMenuItem("Mineracon", this.processing.color(255, 140, 0), null);
		this.addMenuItem("Blobacon", this.processing.color(255, 140, 0), null);

		this.addMenuItem("Bridge", this.processing.color(255, 140, 0), null);

		this.addMenuItem("Green", this.processing.color(0, 255, 0), null);
		this.addMenuItem("Blue", this.processing.color(0, 0, 255), null);
		this.addMenuItem("Brown", this.processing.color(139, 69, 19), null);
		this.addMenuItem("White", this.processing.color(255, 255, 255), null);
		this.addMenuItem("Yellow", this.processing.color(255, 255, 0), null);
		this.addMenuItem("Orange", this.processing.color(255, 140, 0), null);
		
		this.selectMenuItem(item);

		this.handle = new MenuHandle(this);
		this.handle.x = 0;
		this.handle.y = 0;
		this.commit();
		this.addChild(this.handle);
	},

	addMenuItem: function(label, action)
	{
		var item = new MenuItem(this, label, action);
		item.y = 10 + this.children.length * (item.height + 10);
		item.x = (this.width - item.width)-8;
		item.commit();
		this.addChild(item);
		this.height+=(item.height + 10);
		return item;
	},
	
	drawObject: function()
	{
		this.processing.stroke(0, 0, 0);
		this.processing.fill(100, 100, 100);
		this.processing.rect(0, 0, this.width, this.height);
	},
	
	update: function()
	{
		return this._super();
	},

	mouseDragged: function(x, y)
	{
		if(this.userInteractionEnabled && this.containsPoint(x, y))
		{
			this.targetY+= this.processing.mouseY - this.processing.pmouseY;
			if(this.targetY > 0)
			{
				this.targetY = 0;
			}
			else if(this.targetY < (this.processing.height-this.height))
			{
				this.targetY = this.processing.height-this.height;
			}
			return true;
		}
		return false;
	},

	mouseClicked: function(x, y)
	{
		if(this._super(x,y))
		{
			return true;
		}
		if(this.userInteractionEnabled && this.containsPoint(x, y))
		{
			return true;
		}
		return false;
	},
	
	selectMenuItem: function(menuItem)
	{
		if(this.selectedMenuItem != null)
		{
			this.selectedMenuItem.isSelected = false;
		}

		this.selectedMenuItem = menuItem;
		this.selectedMenuItem.isSelected = true;
	},
	
	toggleMenu: function()
	{
		if(this.isOpen)
		{
			this.isOpen = false;
			this.targetX = this.processing.width - this.handle.width;
		}
		else
		{
			this.isOpen = true;
			this.targetX = this.processing.width - this.width;
		}
		
		this.logger.debug("called");
	}
	
});



///////////////////////////////////////////////////////////////////////////////
// MenuHandle
//
//
///////////////////////////////////////////////////////////////////////////////
var MenuHandle = GameObject.extend({
	init: function(parent)
	{
		this._super(parent);
		this.font = this.processing.loadFont("Arial.ttf"); 
		this.label = "Blocks";
		this.width = 25;
		this.height = parent.height;
	},

	update: function()
	{
		this.height = parent.height;
		this.targetHeight = this.height;
		
	},
	drawObject: function()
	{
		this.processing.stroke(0, 0, 0);
		this.processing.fill(200, 200, 200);
		this.processing.rect(0, 0, this.width, this.height);

		this.processing.pushMatrix();
		this.processing.translate(0, 40);
		this.processing.rotate(this.processing.radians(-90));
		this.processing.textFont(this.font);
		this.processing.textAlign(this.processing.CENTER, this.processing.CENTER);
		this.processing.fill(0, 0, 0);
		this.processing.text(this.label, 0, 0, this.width, 20);
		this.processing.popMatrix();
	},

	mouseClicked: function(x, y)
	{
		this.logger.debug("MenuHandle mouseClicked " + x + "," + y);
		if(this.userInteractionEnabled)
		{
			this.logger.debug(this.label + " clicked");
			this.parent.toggleMenu();
			return true;
		}
		
		return false;
	}
});


///////////////////////////////////////////////////////////////////////////////
// MenuItem
//
//
///////////////////////////////////////////////////////////////////////////////
var MenuItem = GameObject.extend({
	init: function(parent, label, color, action)
	{
		this._super(parent);
		this.font = this.processing.loadFont("Arial.ttf"); 
		this.color = color;
		this.label = label;
		this.width = 80;
		this.height = this.width;
		this.isSelected = false;
	},


	drawObject: function()
	{
		this.processing.fill(this.color);
		if(this.isSelected == true)
		{
			this.processing.stroke(255, 255, 255);
		}
		else
		{
			this.processing.stroke(0, 0, 0);
		}
		
		this.processing.rect(0, 0, this.width, this.height);
		this.processing.textFont(this.font);
		this.processing.textAlign(this.processing.CENTER, this.processing.CENTER);
		this.processing.fill(255, 255, 255);
		this.processing.text(this.label, 0, 0, this.width, this.height);
	},

	mouseClicked: function(x, y)
	{
		this.logger.debug("MenuItem mouseClicked");
		if(this.userInteractionEnabled && this.containsPoint(x,y))
		{
			this.logger.debug(this.label + " clicked");
			this.parent.selectMenuItem(this);
			return true;
		}
		
		return false;
	}
});



module.exports = {};
module.exports.Menu = Menu;
module.exports.MenuItem = MenuItem;
