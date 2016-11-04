(function($){
	$.fn.widget = function(options){
	options = $.extend({
		content: '', 
		title: 'title',
		x: 100,
		y: 100,
		height:0,
		width:0,
		id:'',
		hideCloseBtn:false,
		savePosition:true,
		maxPosX: $(document).width(),
		maxPosY: $(document).height()		
	}, options);

	var make = function(){
		var sx=0,sy=0;
		var w = $(this);
		w.append('<div class="widget-capt"></div><div class="widget-close">X</div><div class="widget-cont"></div>');
		w.css({'position':'absolute'}).offset({left:options.x, top:options.y});
		$('.widget-cont', this).html(options.content).css({'padding':'5px'});
		$('.widget-close', this).css({'padding':'4px 5px', 'position': 'absolute', 'cursor':'pointer', 'color':'red', 'right':'0', 'top':'0'});		
		if(options.height!=0) $('.widget-cont', this).css('height', options.height+'px');
		if(options.width!=0) $('.widget-cont', this).css('width', options.width+'px');

		var maxX = options.maxPosX - $('.widget-cont', this).width()-10;
		var maxY = options.maxPosY - $('.widget-cont', this).height()-35;

		if(options.hideCloseBtn) $('.widget-close', this).hide();
		if(options.savePosition && options.id!=''){
			var co = cookie("widgets");
			var pos = JSON.parse((co ? co : '{}'));
			if(pos[options.id]) w.offset(pos[options.id]);
		}
		$('.widget-close', this).click(function(){
			w.hide();
			if(typeof(options.onClose)=='function') options.onClose();
		});
		$('.widget-capt', this).mousedown(function(e){
			sx = e.pageX; 
			sy = e.pageY;
			$('html').bind('mousemove', mm).bind('mouseup',mu);
			return false;
		}).html(options.title).css({'padding':'4px', 'cursor':'move', 'font-weight':'bold'});
		
		function mm(e){
			if(sx==0 && sy==0) return false;

			var dx = sx - e.pageX; 
			var dy = sy - e.pageY;
			var off = w.offset();
			
			off.left = off.left - dx;
			off.top = off.top - dy;

			sx = e.pageX; 
			sy = e.pageY;

			if(off.left < 0) off.left = 0;
			if(off.top < 0) off.top = 0;
			if(off.left > maxX) off.left = maxX;
			if(off.top > maxY) off.top = maxY;
			

			w.offset(off)
			
		}
		function mu(){
			sx = 0;
			sy = 0;
			if(options.savePosition && options.id!=''){
				var co = cookie("widgets");
				var pos = JSON.parse((co ? co : '{}'));
				pos[options.id] = w.offset();
				cookie("widgets", JSON.stringify(pos), {expires: 99});
			}
			$('html').unbind('mousemove', mm).unbind('mouseup',mu);
		}	
	};

	return this.each(make); 
  };
})(jQuery);


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

//calendar
(function(u){var g=new Date,n="\u042f\u043d\u0432\u0430\u0440\u044c \u0424\u0435\u0432\u0440\u0430\u043b\u044c \u041c\u0430\u0440\u0442 \u0410\u043f\u0440\u0435\u043b\u044c \u041c\u0430\u0439 \u0418\u044e\u043d\u044c \u0418\u044e\u043b\u044c \u0410\u0432\u0433\u0443\u0441\u0442 \u0421\u0435\u043d\u0442\u044f\u0431\u0440\u044c \u041e\u043a\u0442\u044f\u0431\u0440\u044c \u041d\u043e\u044f\u0431\u0440\u044c \u0414\u0435\u043a\u0430\u0431\u0440\u044c".split(" "),v="31 28 31 30 31 30 31 31 30 31 30 31".split(" "),
j=/^\d{1,2}\/\d{1,2}\/\d{2}|\d{4}$/,p=/^\d{4,4}$/;u.fn.simpleDatepicker=function(c){function k(e,w,d,c){var a=$("select[name=month]",d).get(0).selectedIndex,f=$("select[name=year]",d).get(0).selectedIndex,i=$("select[name=year] option",d).get().length;e&&$(e.target).hasClass("prevMonth")?0==a&&f?(f-=1,a=11,$("select[name=month]",d).get(0).selectedIndex=11,$("select[name=year]",d).get(0).selectedIndex=f):(a-=1,$("select[name=month]",d).get(0).selectedIndex=a):e&&
$(e.target).hasClass("nextMonth")&&(11==a&&f+1<i?(f+=1,a=0,$("select[name=month]",d).get(0).selectedIndex=0,$("select[name=year]",d).get(0).selectedIndex=f):(a+=1,$("select[name=month]",d).get(0).selectedIndex=a));0==a&&!f?$("span.prevMonth",d).hide():$("span.prevMonth",d).show();f+1==i&&11==a?$("span.nextMonth",d).hide():$("span.nextMonth",d).show();var e=$("tbody td",d).unbind().empty().removeClass("date"),h=$("select[name=month]",d).val(),q=$("select[name=year]",
d).val(),g=(new Date(q,h,1)).getDay(),k=v[h];if(1==h&&(0==q%4&&0!=q%100||0==q%400))k=29;if(b.startdate.constructor==Date)var j=b.startdate.getMonth(),n=b.startdate.getDate();if(b.enddate.constructor==Date)var r=b.enddate.getMonth(),p=b.enddate.getDate();for(var l=0;l<k;l++){var t=$(e.get(l+g)).removeClass("chosen");if((f||!n&&!j||l+1>=n&&a==j||a>j)&&(f+1<i||!p&&!r||l+1<=p&&a==r||a<r))t.text(l+1).addClass("date").hover(function(){$(this).addClass("over")},function(){$(this).removeClass("over")}).click(function(){var a=
new Date($("select[name=year]",d).val(),$("select[name=month]",d).val(),$(this).text());s(w,d,a)}),l+1==c.getDate()&&(h==c.getMonth()&&q==c.getFullYear())&&t.addClass("chosen")}}function s(b,c,d){d&&d.constructor==Date&&b.val($.fn.simpleDatepicker.formatOutput(d));c.remove();$.data(b.get(0),"simpleDatepicker",{hasDatepicker:!1})}var b=$.extend({},$.fn.simpleDatepicker.defaults,c);b.startdate.constructor==Date?c=b.startdate.getFullYear():b.startdate?p.test(b.startdate)?
c=b.startdate:j.test(b.startdate)?(b.startdate=new Date(b.startdate),c=b.startdate.getFullYear()):c=g.getFullYear():c=g.getFullYear();b.startyear=c;b.enddate.constructor==Date?c=b.enddate.getFullYear():b.enddate?p.test(b.enddate)?c=b.enddate:j.test(b.enddate)?(b.enddate=new Date(b.enddate),c=b.enddate.getFullYear()):c=g.getFullYear():c=g.getFullYear();b.endyear=c;return this.each(function(){if($(this).is("input")&&"text"==$(this).attr("type")){var e;$.data($(this).get(0),"simpleDatepicker",
{hasDatepicker:!1});$(this).click(function(c){var d=$(c.target);if(!1==$.data(d.get(0),"simpleDatepicker").hasDatepicker){$.data(d.get(0),"simpleDatepicker",{hasDatepicker:!0});for(var m=(c=d.val())&&j.test(c)?new Date(c):b.chosendate.constructor==Date?b.chosendate:b.chosendate?new Date(b.chosendate):g,c=[],a=0;a<=b.endyear-b.startyear;a++)c[a]=b.startyear+a;var f=$('<table class="datepicker" cellpadding="0" cellspacing="0"></table>');f.append("<thead></thead>");f.append("<tfoot></tfoot>");
f.append("<tbody></tbody>");var i='<select name="month">';for(a in n)i+='<option value="'+a+'">'+n[a]+"</option>";var i=i+"</select>",h='<select name="year">';for(a in c)h+="<option>"+c[a]+"</option>";h+="</select>";$("thead",f).append('<tr class="controls"><th colspan="7"><span class="prevMonth">&laquo;</span>&nbsp;'+i+h+'&nbsp;<span class="nextMonth">&raquo;</span></th></tr>');$("thead",f).append('<tr class="days"><th>S</th><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th></tr>');
$("tfoot",f).append('<tr><td colspan="2"></td><td colspan="3">&nbsp;</td><td colspan="2"><span class="close">\u0437\u0430\u043a\u0440\u044b\u0442\u044c</span></td></tr>');for(a=0;6>a;a++)$("tbody",f).append("<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>");e=f;$("body").prepend(e);c=d.get(0);a=curtop=0;if(c.offsetParent){do a+=c.offsetLeft,curtop+=c.offsetTop;while(c=c.offsetParent);a=[a,curtop]}else a=!1;c=(parseInt(b.x)?parseInt(b.x):0)+a[0];a=(parseInt(b.y)?
parseInt(b.y):0)+a[1];$(e).css({position:"absolute",left:c,top:a});$("span",e).css("cursor","pointer");$("select",e).bind("change",function(){k(null,d,e,m)});$("span.prevMonth",e).click(function(a){k(a,d,e,m)});$("span.nextMonth",e).click(function(a){k(a,d,e,m)});$("span.today",e).click(function(){s(d,e,new Date)});$("span.close",e).click(function(){s(d,e)});$("select[name=month]",e).get(0).selectedIndex=m.getMonth();$("select[name=year]",e).get(0).selectedIndex=
Math.max(0,m.getFullYear()-b.startyear);k(null,d,e,m)}})}})};$.fn.simpleDatepicker.formatOutput=function(c){return c.getMonth()+1+"/"+c.getDate()+"/"+c.getFullYear()};$.fn.simpleDatepicker.defaults={chosendate:g,startdate:g.getFullYear(),enddate:g.getFullYear()+1,x:18,y:18}})(jQuery);
