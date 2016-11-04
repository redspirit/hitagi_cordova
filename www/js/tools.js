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

// color picker
(function(c){var v=65,F={eventName:"click",onShow:function(){},onBeforeShow:function(){},onHide:function(){},onChange:function(){},onSubmit:function(){},color:"ff0000",livePreview:!0,flat:!1},i=function(a,b){var d=h(a);c(b).data("colorpicker").fields.eq(1).val(d.r).end().eq(2).val(d.g).end().eq(3).val(d.b).end()},n=function(a,b){c(b).data("colorpicker").fields.eq(4).val(a.h).end().eq(5).val(a.s).end().eq(6).val(a.b).end()},k=function(a,b){c(b).data("colorpicker").fields.eq(0).val(j(h(a))).end()},
p=function(a,b){c(b).data("colorpicker").selector.css("backgroundColor","#"+j(h({h:a.h,s:100,b:100})));c(b).data("colorpicker").selectorIndic.css({left:parseInt(150*a.s/100,10),top:parseInt(150*(100-a.b)/100,10)})},q=function(a,b){c(b).data("colorpicker").hue.css("top",parseInt(150-150*a.h/360,10))},s=function(a,b){c(b).data("colorpicker").currentColor.css("backgroundColor","#"+j(h(a)))},r=function(a,b){c(b).data("colorpicker").newColor.css("backgroundColor","#"+j(h(a)))},G=function(a){a=a.charCode||
a.keyCode||-1;if(a>v&&90>=a||32==a)return!1;!0===c(this).parent().parent().data("colorpicker").livePreview&&l.apply(this)},l=function(a){var b=c(this).parent().parent(),d;if(0<this.parentNode.className.indexOf("_hex")){d=b.data("colorpicker");var f=this.value,e=6-f.length;if(0<e){for(var g=[],w=0;w<e;w++)g.push("0");g.push(f);f=g.join("")}f=m(t(f));d.color=d=f}else 0<this.parentNode.className.indexOf("_hsb")?b.data("colorpicker").color=d=u({h:parseInt(b.data("colorpicker").fields.eq(4).val(),10),
s:parseInt(b.data("colorpicker").fields.eq(5).val(),10),b:parseInt(b.data("colorpicker").fields.eq(6).val(),10)}):(d=b.data("colorpicker"),f=parseInt(b.data("colorpicker").fields.eq(1).val(),10),e=parseInt(b.data("colorpicker").fields.eq(2).val(),10),g=parseInt(b.data("colorpicker").fields.eq(3).val(),10),f={r:Math.min(255,Math.max(0,f)),g:Math.min(255,Math.max(0,e)),b:Math.min(255,Math.max(0,g))},d.color=d=m(f));a&&(i(d,b.get(0)),k(d,b.get(0)),n(d,b.get(0)));p(d,b.get(0));q(d,b.get(0));r(d,b.get(0));
b.data("colorpicker").onChange.apply(b,[d,j(h(d)),h(d)])},H=function(){c(this).parent().parent().data("colorpicker").fields.parent().removeClass("colorpicker_focus")},I=function(){v=0<this.parentNode.className.indexOf("_hex")?70:65;c(this).parent().parent().data("colorpicker").fields.parent().removeClass("colorpicker_focus");c(this).parent().addClass("colorpicker_focus")},J=function(a){var b=c(this).parent().find("input").focus(),a={el:c(this).parent().addClass("colorpicker_slider"),max:0<this.parentNode.className.indexOf("_hsb_h")?
360:0<this.parentNode.className.indexOf("_hsb")?100:255,y:a.pageY,field:b,val:parseInt(b.val(),10),preview:c(this).parent().parent().data("colorpicker").livePreview};c(document).bind("mouseup",a,x);c(document).bind("mousemove",a,y)},y=function(a){a.data.field.val(Math.max(0,Math.min(a.data.max,parseInt(a.data.val+a.pageY-a.data.y,10))));a.data.preview&&l.apply(a.data.field.get(0),[!0]);return!1},x=function(a){l.apply(a.data.field.get(0),[!0]);a.data.el.removeClass("colorpicker_slider").find("input").focus();
c(document).unbind("mouseup",x);c(document).unbind("mousemove",y);return!1},K=function(){var a={cal:c(this).parent(),y:c(this).offset().top};a.preview=a.cal.data("colorpicker").livePreview;c(document).bind("mouseup",a,z);c(document).bind("mousemove",a,A)},A=function(a){l.apply(a.data.cal.data("colorpicker").fields.eq(4).val(parseInt(360*(150-Math.max(0,Math.min(150,a.pageY-a.data.y)))/150,10)).get(0),[a.data.preview]);return!1},z=function(a){i(a.data.cal.data("colorpicker").color,a.data.cal.get(0));
k(a.data.cal.data("colorpicker").color,a.data.cal.get(0));c(document).unbind("mouseup",z);c(document).unbind("mousemove",A);return!1},L=function(){var a={cal:c(this).parent(),pos:c(this).offset()};a.preview=a.cal.data("colorpicker").livePreview;c(document).bind("mouseup",a,B);c(document).bind("mousemove",a,C)},C=function(a){l.apply(a.data.cal.data("colorpicker").fields.eq(6).val(parseInt(100*(150-Math.max(0,Math.min(150,a.pageY-a.data.pos.top)))/150,10)).end().eq(5).val(parseInt(100*Math.max(0,Math.min(150,
a.pageX-a.data.pos.left))/150,10)).get(0),[a.data.preview]);return!1},B=function(a){i(a.data.cal.data("colorpicker").color,a.data.cal.get(0));k(a.data.cal.data("colorpicker").color,a.data.cal.get(0));c(document).unbind("mouseup",B);c(document).unbind("mousemove",C);return!1},M=function(){c(this).addClass("colorpicker_focus")},N=function(){c(this).removeClass("colorpicker_focus")},O=function(){var a=c(this).parent(),b=a.data("colorpicker").color;a.data("colorpicker").origColor=b;s(b,a.get(0));a.data("colorpicker").onSubmit(b,
j(h(b)),h(b),a.data("colorpicker").el)},E=function(){var a,b,d,f=c("#"+c(this).data("colorpickerId"));f.data("colorpicker").onBeforeShow.apply(this,[f.get(0)]);var e=c(this).offset(),g="CSS1Compat"==document.compatMode;a=window.pageXOffset||(g?document.documentElement.scrollLeft:document.body.scrollLeft);b=window.pageYOffset||(g?document.documentElement.scrollTop:document.body.scrollTop);d=window.innerWidth||(g?document.documentElement.clientWidth:document.body.clientWidth);var h=e.top+this.offsetHeight,
e=e.left;h+176>b+(window.innerHeight||(g?document.documentElement.clientHeight:document.body.clientHeight))&&(h-=this.offsetHeight+176);e+356>a+d&&(e-=356);f.css({left:e+"px",top:h+"px"});!1!=f.data("colorpicker").onShow.apply(this,[f.get(0)])&&f.show();c(document).bind("mousedown",{cal:f},D);return!1},D=function(a){P(a.data.cal.get(0),a.target,a.data.cal.get(0))||(!1!=a.data.cal.data("colorpicker").onHide.apply(this,[a.data.cal.get(0)])&&a.data.cal.hide(),c(document).unbind("mousedown",D))},P=function(a,
b,d){if(a==b)return!0;if(a.contains)return a.contains(b);if(a.compareDocumentPosition)return!!(a.compareDocumentPosition(b)&16);for(b=b.parentNode;b&&b!=d;){if(b==a)return!0;b=b.parentNode}return!1},u=function(a){return{h:Math.min(360,Math.max(0,a.h)),s:Math.min(100,Math.max(0,a.s)),b:Math.min(100,Math.max(0,a.b))}},t=function(a){a=parseInt(-1<a.indexOf("#")?a.substring(1):a,16);return{r:a>>16,g:(a&65280)>>8,b:a&255}},m=function(a){var b={h:0,s:0,b:0},d=Math.min(a.r,a.g,a.b),c=Math.max(a.r,a.g,a.b),
d=c-d;b.b=c;b.s=0!=c?255*d/c:0;b.h=0!=b.s?a.r==c?(a.g-a.b)/d:a.g==c?2+(a.b-a.r)/d:4+(a.r-a.g)/d:-1;b.h*=60;0>b.h&&(b.h+=360);b.s*=100/255;b.b*=100/255;return b},h=function(a){var b,d,c;b=Math.round(a.h);var e=Math.round(255*a.s/100),a=Math.round(255*a.b/100);if(0==e)b=d=c=a;else{var e=(255-e)*a/255,g=(a-e)*(b%60)/60;360==b&&(b=0);60>b?(b=a,c=e,d=e+g):120>b?(d=a,c=e,b=a-g):180>b?(d=a,b=e,c=e+g):240>b?(c=a,b=e,d=a-g):300>b?(c=a,d=e,b=e+g):360>b?(b=a,d=e,c=a-g):c=d=b=0}return{r:Math.round(b),g:Math.round(d),
b:Math.round(c)}},j=function(a){var b=[a.r.toString(16),a.g.toString(16),a.b.toString(16)];c.each(b,function(a,c){1==c.length&&(b[a]="0"+c)});return b.join("")},Q=function(){var a=c(this).parent(),b=a.data("colorpicker").origColor;a.data("colorpicker").color=b;i(b,a.get(0));k(b,a.get(0));n(b,a.get(0));p(b,a.get(0));q(b,a.get(0));r(b,a.get(0))};c.fn.extend({ColorPicker:function(a){a=c.extend({},F,a||{});if("string"==typeof a.color)a.color=m(t(a.color));else if(void 0!=a.color.r&&void 0!=a.color.g&&
void 0!=a.color.b)a.color=m(a.color);else if(void 0!=a.color.h&&void 0!=a.color.s&&void 0!=a.color.b)a.color=u(a.color);else return this;return this.each(function(){if(!c(this).data("colorpickerId")){var b=c.extend({},a);b.origColor=a.color;var d="collorpicker_"+parseInt(1E3*Math.random());c(this).data("colorpickerId",d);d=c('<div class="colorpicker"><div class="colorpicker_color"><div><div></div></div></div><div class="colorpicker_hue"><div></div></div><div class="colorpicker_new_color"></div><div class="colorpicker_current_color"></div><div class="colorpicker_hex"><input type="text" maxlength="6" size="6" /></div><div class="colorpicker_rgb_r colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_rgb_g colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_rgb_b colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_h colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_s colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_b colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_submit"></div></div>').attr("id",
d);b.flat?d.appendTo(this).show():d.appendTo(document.body);b.fields=d.find("input").bind("keyup",G).bind("change",l).bind("blur",H).bind("focus",I);d.find("span").bind("mousedown",J).end().find(">div.colorpicker_current_color").bind("click",Q);b.selector=d.find("div.colorpicker_color").bind("mousedown",L);b.selectorIndic=b.selector.find("div div");b.el=this;b.hue=d.find("div.colorpicker_hue div");d.find("div.colorpicker_hue").bind("mousedown",K);b.newColor=d.find("div.colorpicker_new_color");b.currentColor=
d.find("div.colorpicker_current_color");d.data("colorpicker",b);d.find("div.colorpicker_submit").bind("mouseenter",M).bind("mouseleave",N).bind("click",O);i(b.color,d.get(0));n(b.color,d.get(0));k(b.color,d.get(0));q(b.color,d.get(0));p(b.color,d.get(0));s(b.color,d.get(0));r(b.color,d.get(0));b.flat?d.css({position:"relative",display:"block"}):c(this).bind(b.eventName,E)}})},ColorPickerHide:function(){return this.each(function(){c(this).data("colorpickerId")&&c("#"+c(this).data("colorpickerId")).hide()})},
ColorPickerShow:function(){return this.each(function(){c(this).data("colorpickerId")&&E.apply(this)})},ColorPickerSetColor:function(a){if("string"==typeof a)a=m(t(a));else if(void 0!=a.r&&void 0!=a.g&&void 0!=a.b)a=m(a);else if(void 0!=a.h&&void 0!=a.s&&void 0!=a.b)a=u(a);else return this;return this.each(function(){if(c(this).data("colorpickerId")){var b=c("#"+c(this).data("colorpickerId"));b.data("colorpicker").color=a;b.data("colorpicker").origColor=a;i(a,b.get(0));n(a,b.get(0));k(a,b.get(0));
q(a,b.get(0));p(a,b.get(0));s(a,b.get(0));r(a,b.get(0))}})}})})(jQuery);

