var Class = require('./Class');


var A = Class.extend({
	init: function()
	{
		this._super();
		console.log("A.init");
		this.a = "A";
	},
	
	funcA: function()
	{
		console.log("A.funcA");
	},
	
	foo: function()
	{
		console.log("A.foo");
	}
});

var B = A.extend({
	init: function()
	{
		this._super();
		console.log("B.init");
		this.b = "B";
	},
	
	funcB: function()
	{
		console.log("B.funcB");
	},
	
	foo: function()
	{
		this._super();
		console.log("B.foo");
	}
});

var C = B.extend({
	init: function()
	{
		this._super();
		console.log("C.init");
		this.c = "C";
	},
	
	funcC: function()
	{
		console.log("C.funcC");
	},
	
	foo: function()
	{
		this._super();
		console.log("C.foo");
	}
});



module.exports = {};
module.exports.A = A;
module.exports.B = B;
module.exports.C = C;
