
var JoinDebouncer = function (timeout) {

	var self = this;
	var _onFinish = function(){};
	var timers = {};

	self.start = function (name, data) {
		self.stop(name);
		timers[name] = setTimeout(function () {
			_onFinish(name, data);
			timers[name] = null;
		}, timeout * 1000);
	};
	self.stop = function (name) {
		if(timers[name]) {
			clearTimeout(timers[name]);
			return true;
		} else {
			return false;
		}
	};
	self.onFinish = function (cb) {
		_onFinish = cb;
	}

};


function translite(str){
	str = str.toLowerCase();
	var arr={'а':'a', 'б':'b', 'в':'v', 'г':'g', 'д':'d', 'е':'e', 'ж':'g', 'з':'z', 'и':'i', 'й':'y', 'к':'k', 'л':'l', 'м':'m', 'н':'n', 'о':'o', 'п':'p', 'р':'r', 'с':'s', 'т':'t', 'у':'u', 'ф':'f', 'ы':'i', 'э':'e', 'ё':'yo', 'х':'h', 'ц':'ts', 'ч':'ch', 'ш':'sh', 'щ':'sch', 'ъ':'', 'ь':'', 'ю':'yu', 'я':'ya', ' ':'_'};
	var replacer=function(a){return arr[a]||a};
	str = str.replace(/[а-яёь ]/g,replacer);
	return str.replace(/[\W]/g, '')
}

// strip tags
function strip_tags(str){ return str.replace(/<\/?[^>]+>/gi, '')}
function stripBB(str){ return str.replace(/\[[^\]]+\]/g, '')}

//image load
(function(a){a.fn.bindImageLoad=function(c){return this.each(function(){var b=a(this);if(b.is("img")&&a.isFunction(c)){b.one("load",c);var d;d=this.complete?"undefined"!==typeof this.naturalWidth&&0===this.naturalWidth?!1:!0:!1;d&&b.trigger("load")}})}})(jQuery);

// timestamp
var time = function(){return parseInt(new Date().getTime()/1000)};

// url replace
function urlReplace(a){return"string"==typeof a?a.replace(new RegExp("(((f|ht){1}tp://)[-a-zA-Z0-9@:%_+.~#?&//=]+)","gi"),'<a target="_blank" href="$1">$1</a>'):""};

function parseDT(a){a=a.split("/");return 0.001*(new Date(a[2],a[0],a[1])).valueOf()};

// bbcode
function BBproc(a){
	a=a.replace(/\[b\](.*?)\[\/b\]/gi,function(a,b){return"<b>"+b+"</b>"});a=a.replace(/\[i\](.*?)\[\/i\]/gi,function(a,b){return"<i>"+b+"</i>"});
	a=a.replace(/\[u\](.*?)\[\/u\]/gi,function(a,b){return'<span style="text-decoration: underline;">'+b+"</span>"});a=a.replace(/\[s\](.*?)\[\/s\]/gi,function(a,b){return"<del>"+b+"</del>"});
	a=a.replace(/\[size=([^\]]+)\](.+?)\[\/size\]/ig,function(a,b,c){40<1*b&&(b=40);5>1*b&&(b=5);return'<span style="font-size:'+b+'px">'+c+"</span>"});
	a=a.replace(/\[cc=([^\]]+)\](.+?)\[\/cc\]/ig,function(a,b,c){ return'<span style="color:'+b+'">'+c+"</span>"});
	a=a.replace(/\[bcolor=([^\]]+)\](.+?)\[\/bcolor\]/ig,function(a,b,c){ return'<span style="background-color:'+b+'">'+c+"</span>"});
	a=a.replace(/\[room=([^\]]+)\](.+?)\[\/room\]/ig,function(a,b,c){ return'<img src="img/rooms.png" alt="" /> <a href="'+b+'" class="room-link">'+c+'</a>'});
	return a.replace(/\[color=([^\]]+)\](.+?)\[\/color\]/ig,function(a,b,c){return'<span style="color:'+b+'">'+c+"</span>"})
};

// date
function date(i,j){var d,a,g=/\\?([a-z])/gi,f,e=function(a,b){return(a+="").length<b?Array(++b-a.length).join("0")+a:a},h="Sun Mon Tues Wednes Thurs Fri Satur January February March April May June July August September October November December".split(" ");f=function(c,b){return a[c]?a[c]():b};a={d:function(){return e(a.j(),2)},D:function(){return a.l().slice(0,3)},j:function(){return d.getDate()},l:function(){return h[a.w()]+"day"},N:function(){return a.w()||7},S:function(){var c=a.j();return 4<
c&&21>c?"th":{1:"st",2:"nd",3:"rd"}[c%10]||"th"},w:function(){return d.getDay()},z:function(){var c=new Date(a.Y(),a.n()-1,a.j()),b=new Date(a.Y(),0,1);return Math.round((c-b)/864E5)+1},W:function(){var c=new Date(a.Y(),a.n()-1,a.j()-a.N()+3),b=new Date(c.getFullYear(),0,4);return e(1+Math.round((c-b)/864E5/7),2)},F:function(){return h[6+a.n()]},m:function(){return e(a.n(),2)},M:function(){return a.F().slice(0,3)},n:function(){return d.getMonth()+1},t:function(){return(new Date(a.Y(),a.n(),0)).getDate()},
L:function(){return 1===(new Date(a.Y(),1,29)).getMonth()|0},o:function(){var c=a.n(),b=a.W();return a.Y()+(12===c&&9>b?-1:1===c&&9<b)},Y:function(){return d.getFullYear()},y:function(){return(a.Y()+"").slice(-2)},a:function(){return 11<d.getHours()?"pm":"am"},A:function(){return a.a().toUpperCase()},B:function(){var a=3600*d.getUTCHours(),b=60*d.getUTCMinutes(),f=d.getUTCSeconds();return e(Math.floor((a+b+f+3600)/86.4)%1E3,3)},g:function(){return a.G()%12||12},G:function(){return d.getHours()},h:function(){return e(a.g(),
2)},H:function(){return e(a.G(),2)},i:function(){return e(d.getMinutes(),2)},s:function(){return e(d.getSeconds(),2)},u:function(){return e(1E3*d.getMilliseconds(),6)},e:function(){throw"Not supported (see source code of date() for timezone on how to add support)";},I:function(){var c=new Date(a.Y(),0),b=Date.UTC(a.Y(),0),d=new Date(a.Y(),6),e=Date.UTC(a.Y(),6);return 0+(c-b!==d-e)},O:function(){var a=d.getTimezoneOffset(),b=Math.abs(a);return(0<a?"-":"+")+e(100*Math.floor(b/60)+b%60,4)},P:function(){var c=
a.O();return c.substr(0,3)+":"+c.substr(3,2)},T:function(){return"UTC"},Z:function(){return 60*-d.getTimezoneOffset()},c:function(){return"Y-m-d\\Th:i:sP".replace(g,f)},r:function(){return"D, d M Y H:i:s O".replace(g,f)},U:function(){return d.getTime()/1E3|0}};this.date=function(a,b){d="undefined"===typeof b?new Date:b instanceof Date?new Date(b):new Date(1E3*b);return a.replace(g,f)};return this.date(i,j)};
