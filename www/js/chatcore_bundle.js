var states = [], statesT = [], privas = [], privasT = [], umItems = [];
var blockOverlay = true, clickOnProf = 0, currentType = 'room';
var soundEnable, notifEnable, playSound, imaga, blockHide = true;
var imageReader = new FileReader();
var user, rooms = {}, vkmid, curColor, isFocus=true, startRoomLoads = 0;
var isNotif, curState, reciveMessCount = 30, hisoryLimit = 50;
var mhist = {cur:'', old:''}, correctLatMess = false;
var titleDefault = 'Аниме чат Hitagi';
var blurTimers = {};

/********** START APPLICATION ************/

function start(){
	VK.init({apiId: VKAPIID});
    initSounds();
	createElements();
	bindings();
	initToolButtons();
};

function createElements(){
	// создаем меню со статусами
	for (var i = 0; i < statesT.length; ++i){
		$('#tmenu').append(tpl('statusitem', {s1:states[i], s2:statesT[i], n:i}));
	}
	
	$('#widget-help').widget({
		hideCloseBtn:true,
		title:'Правила чата',
		x:$('#cont').width()-370,
		y:119,
		id:'help',
		content:tpl('rules')
	});
	$('#widget-radio').widget({
		hideCloseBtn:false,
		title:'Аниме радио',
		x:$('#cont').width()-570,
		y:119,
		id:'radio',
		content:tpl('radiocode')
	});
	
}

function initSounds(){
	// инициализируем звуки

    var sounds = {};

	sounds.message = new Howl({
		urls: ['sounds/in.mp3', 'sounds/in.ogg']
	});
    sounds.notif = new Howl({
		urls: ['sounds/out.mp3', 'sounds/out.ogg']
	});
    sounds.foryou = new Howl({
		urls: ['sounds/foryou.mp3', 'sounds/foryou.ogg']
	});

	playSound = function(s, p){
		if(isset(p)){
			if(p) sounds[s].play();
		} else {
			if(soundEnable)
                sounds[s].play();
		}
	}
}

function initToolButtons(){
	isNotif = "Notification" in window;
	if(cookie("sounds")=='off'){
		soundEnable = false;
		$('#soundBtn').css('backgroundImage','url(img/soundoff.png)');
	} else {
		soundEnable = true;
		$('#soundBtn').css('backgroundImage','url(img/soundon.png)');
	}
	if(cookie("notifs")=='on'){
		notifEnable = true;
		$('#notifBtn').css('backgroundImage','url(img/notifon.png)');
	} else {
		notifEnable = false;
		$('#notifBtn').css('backgroundImage','url(img/notifoff.png)');
	}	
}

function bindings(){
	$('#logout_btn').click(clickLogout);
	$('#profile_btn').click(clickProfile);
	$('#setava').click(clickSetava);
	$('#statusBtn').click(clickStatusbtn);
	$('#designBtn').click(clickDesignbtn);
	$('#designblock').click(function(){$(this).hide()});
	$('#designblock .db-item').click(clickDesignItem);
	$('#moderBtn').click(clickModerBut);
	$('#stateBtn').click(clickStatebtn);
	$('#tmenu').click(clickStatebtn2).mouseleave(clickStatebtn2);
	$('#soundBtn').click(clickSoundbtn);
	$('#notifBtn').click(clickNotifbtn);
	$('#smileBtn').click(mouseSmile1);
	$('#add-room-tab img').click(clickRoomsbtn);
	$('#smileblock').mouseleave(mouseSmile2);
	$('#overlay').click(hideForm);
	$('#privatemes').click(clickPrivatemes);
	$('.stateitem').click(clickStateitem);
	$('.smiletabs').click(function(){return false});
	$('.smiletabs div').click(clickSmiletab);
	$(window).focus(function(){
		isFocus = true;
		curRoomSel('.messageinput').focus();
		setTitle(0);
		if(rooms[currentRoom])
			rooms[currentRoom]._newMessages = 0;
		clearTimeout(blurTimers.level1);
		clearTimeout(blurTimers.level2);
		clearTimeout(blurTimers.level3);
		clearTimeout(blurTimers.level4);
		ch.awayStatus(0)
	}).blur(function(){
		isFocus = false;

		blurTimers.level1 = setTimeout(function(){
			ch.awayStatus(1);
		}, 60 * 1000); //1 min
		blurTimers.level2 = setTimeout(function(){
			ch.awayStatus(2)
		}, 5 * 60 * 1000); //10 min
		blurTimers.level3 = setTimeout(function(){
			ch.awayStatus(3)
		}, 30 * 60 * 1000); //30 min
		blurTimers.level4 = setTimeout(function(){
			ch.awayStatus(4)
		}, 60 * 60 * 1000); //60 min

	});	
	for(var i in smiles[1]){
		$('#smWrap').append('<img num="'+smiles[1][i]+'" src="img/smiles/'+smiles[1][i]+'.gif" alt="" />');
	}

	$(window).bind("beforeunload", function() {
		saveTabs();
	})
	
}

function setUsersIcons(){
	$('table[user=77499126] .upriv').attr('src', 'img/usericons/hvostik2.png').attr('title','Воин Хвостяра');
	$('table[user=ShizuoSan] .upriv').attr('src', 'img/usericons/shiz.png').attr('title','Кардинал');
	$('table[user=painter] .upriv').attr('src', 'img/usericons/di.png').attr('title','Каратель');
	$('table[user=166353395] .upriv').attr('src', 'img/usericons/sef.png').attr('title','Ордо Еретикус');
	$('table[user=admin] .upriv').attr('src', 'img/usericons/star.png').attr('title','Командующий');
}

setTimeout(start, 200);

/********** SERVER CALLBACKS ************/

ch.response.onConnect = function(){

	$('.reconnection-panel').hide();
	if(ch.autoLogin()){
		//hideForm()
	} else {
        $('#cont').addClass('loaded');
        $('.is-loading').hide();
		showAuthWindow();
	}
};
ch.response.onDisconnect = function(){
	$('.reconnection-panel').show();
	$('#reconnecting-trying').text(0);
};
ch.response.onReconnecting = function(err, num){
	$('#reconnecting-trying').text(num);
};
ch.response.onReconnect = function(err, num){
	$('.reconnection-panel').hide();
};
ch.response.onLogin = function(err,u){
	if(!err){
		user = u;
		curColor = u.textcolor;

		$('#chat-tabs li.litab').remove();
		$('#chat-rooms').html('');

		$('#colorsBtn').ColorPicker({
			color: '#'+curColor,
			onChange: function (hsb, hex, rgb) {
				curColor = hex;
			}
		});

		helloStr(u.nick);
		blockOverlay = false;
		hideForm();

/*
		var cookr = cookie('rooms');
		if(cookr==null){
			ch.joinRoom(currentRoom, reciveMessCount);
		} else {
			var rms = cookr.split('|');
			if(rms.length>1){
				for(var i=0; i<rms.length-1; i++){
					console.log('----', rms[i]);
					ch.joinRoom(rms[i], reciveMessCount);
					startRoomLoads++;
				}
			} else {
				ch.joinRoom(currentRoom, reciveMessCount);
			}
		}
*/

		ch.joinRoom(currentRoom, reciveMessCount);

	} else if(err=='blocked'){
		curRoomSel('.rp').html('');
		curRoomSel('.mp').html(tpl('blockmes', {mess:u}));
	} else {
		if(u=='alreadyauth') alert('Под этой учетной записью уже авторизованы');
		if(u=='wrongauth'){
			alert('Неверный логин или пароль');
			showAuthWindow();
		}
		if(u=='wronghash'){
			showAuthWindow();
		}
	}
};
ch.response.onLogout = function(err, data){
	showAuthWindow();
	blockOverlay = true;
};
ch.response.onJoinRoom = function(err, d, d2){
	if(!err){

		$('#chat-tabs a.label').removeClass('active');
		$('#add-room-tab').before(tpl('roomtab', {name:d.name, capt:d.caption}))
		$('#chat-rooms').append(tpl('roompane', {name:d.name, type:'room'}));
		$('.room-pane').hide();
		$('#room-'+d.name).show().find('.mpw').scroll(scrollPane);

		currentRoom = d.name;
		currentType = 'room';

		hideForm();
		clearUsers();
		fillUsers(d.users);
		showToolsButtons(d.commonPriv);

		startRoomLoads--;
		if(startRoomLoads==0){
			allRoomsLoaded();
		}

		rooms[currentRoom].autoScroll = true;
		rooms[currentRoom].tp = 'room';
		
		ch.chat('!дворецкий_привет', currentRoom, curColor);
		
		designImagesUpdate(localStorage.designImages);
		setUsersIcons();

	} else if(err=='banned'){
		curRoomSel('.rp').html('');
		curRoomSel('mp').html(tpl('banmes', {time:Math.ceil(d/60), reason:''}));
	} else {
		if(d=='alreadyinroom'){
			alert('Вы уже находитесь в этой комнате');
		} else {
			showNotificator('Ошибка захода в комнату: '+d, 2000);
		}
	}
};
ch.response.onAfterRoomJoin = function(err, d){
	addTopic(d.topic, d.room);
	if(d.newmes > 0) addNotif(d.room, 'C момента ухода в комнате появилось <b>'+d.newmes+'</b> новых сообщений', '#0F9B14', true);
    $('#cont').addClass('loaded');
    $('.is-loading').hide();
};
ch.response.onRegisterVK = function(err, data){
	if(!err){
		alert(tpl('vrnotif'));
		showAuthWindow();
	} else {
		if(vkmid){
			showAuthWindow();
			if(data=='wrongauth') $('#reglink').trigger('click');
		} else {
			alert(data);
		}
	}
};
ch.response.onChat = function(err, d){
	if(!err){
		if(d.room != currentRoom){
			var span = $('#chat-tabs a[mid='+d.room+'] span');
			var mcount = parseInt(span.html()) + 1;
			span.html(mcount).css('display', 'inline-block');
		}
		addMessage(d);
	} else {
		showNotificator('Ошибка отправки сообщения: '+d, 2000);
	}
};
ch.response.onChatCorrect = function(err, d){
	if(!err){
		$('#'+d.mid+' span:eq(1)').html(stripBB(d.newtext));
	} else {
		showNotificator('Ошибка исправления сообщения: '+d, 2000);
	}
};
ch.response.onSetTopic = function(err, d){
	if(!err){
		addTopic(d.topic, d.room);
		hideForm();
	} else {
		showNotificator('Ошибка установки топика: '+d, 2000);
	}
};
ch.response.onSetNick = function(err, d){
	if(!err){
		var oldnick = rooms[currentRoom]['users'][d.user].nick;
		roomSel('', '.rp table[user='+d.user+'] .profnick').text(d.nick);
		addNotifInRooms(d.user, '<b>'+oldnick+'</b> изменил свой ник на: <b>' + d.nick + '</b>', '#0F419B');
		rooms[currentRoom]['users'][d.user].nick = d.nick;
		hideForm();
	} else {
		if(d=='timeout') showNotificator('Нельзя менять ник чаще одного раза в неделю', 2000);
		if(d=='wrongnick') showNotificator('Некорректный формат ника', 2000);
		if(d=='busynick') showNotificator('Этот ник занят', 2000);
	}
};
ch.response.onUserJoined = function(err, d){
	addUser(d.room, d.user, d.info);

	if(d.info.already)
		addNotif(d.room, '<b>'+d.info.nick+'</b> зашел в комнату с другого браузера или устройства', '#0F9B14');
	else
		addNotif(d.room, '<b>'+d.info.nick+'</b> зашел в комнату', '#0F9B14');

	setUsersIcons();
};
ch.response.onUserLeaved = function(err, d){
	addNotif(d.room, '<b>'+d.nick+'</b> покинул комнату', '#E70343');
	delUser(d.room, d.user);
};
ch.response.onGetProfile = function(err, d){
	if(!err){
		if(clickOnProf==1)
			showMyProfileWindow(d.userdata, d.visible);
		else
			showUserProfileWindow(d.userdata);
	} else {
		if(d=='notallowed'){
			showNotificator('Этот пользователь скрыл свой профиль', 2000)
		} else showNotificator('Ошибка получения профиля: '+d, 2000);
	}
};
ch.response.onSetProfile = function(err, d){
	if(!err){
		hideForm();
	} else {
		showNotificator('Ошибка установки профиля: '+d, 2000);
	}
};
ch.response.onSetAvatar = function(err, d){

	if(d.user == user.login)
		$('#newavaimg').attr('src', d.url);

	roomSel('', '.rp table[user='+d.user+'] .profava').attr('src', d.url);
	hideForm();
	addNotifInRooms(d.user, '<b>'+d.nick+'</b> обновил аватарку', '#0F419B');

};
ch.response.onEraseMessage = function(err, d){
	$('#'+d.mid).html('<span class="deletedmes">[ Сообщение удалено ]</span>');
};
ch.response.onSetStatus = function(err, d){
	if(!err){
		roomSel('', '.rp table[user='+d.user+'] .ustatus').text(d.text);
		addNotifInRooms(d.user, '<b>'+d.nick+'</b> изменил статусный текст на: <b>' + d.text + '</b>', '#0F419B');
		hideForm();
	} else {
		showNotificator('Ошибка установки статуса: '+d, 2000);
	}
};
ch.response.onSetState = function(err, d){
	if(!err){
		roomSel('', '.rp table[user='+d.user+'] .stateSign').attr('src', 'img/'+states[d.val]);
		roomSel('', '.rp table[user='+d.user+'] .statetxt').html(statesT[d.val]);
		if(d.user == user.login)$('#stateBtn').css('backgroundImage', 'url(img/'+states[d.val]+')');
		addNotifInRooms(d.user, '<b>'+d.nick+'</b> изменил статус на: <b>' + statesT[d.val] + '</b>', '#0F419B');
	} else {
		showNotificator('Ошибка установки состояния: '+d, 2000);
	}
};
ch.response.onAwayStatus = function(err, data){
	roomSel('', '.rp table[user='+data.user+'] .awaystatus').html(awayStatuses[data.val]);
};
ch.response.onSaveRating = function(err, d){
	if(!err){
		showNotificator('Ваш голос учтен!', 3000);
	} else {
		if(d == 'alreadyvoted'){
			showNotificator('Вы уже проголосовали за эту картинку', 3000);
		} else if(d == 'isowner'){
			showNotificator('Нельзя голосовать за свою картинку', 3000);
		} else {
			alert(d);
		}
	}
};
ch.response.onKick = function(err, d){
	if(!err){
		if(d.isMe){
			roomSel(d.room, '.rp').html('');
			roomSel(d.room, '.mp').html(tpl('kickmes'));
		} else {
			addNotif(d.room, '<b>'+d.nick+'</b> был выпнут из комнаты', '#0F419B');
			delUser(d.room, d.user);
		}
	} else {
		showNotificator('Ошибка при попытке кикнуть: '+d, 2000);;
	}
};
ch.response.onSetBan = function(err, d){
	if(!err){
		if(d.isMe){
			curRoomSel('.rp').html('');
			curRoomSel('.mp').html(tpl('banmes', {time:d.time, reason:d.reason}));
		} else {
			addNotif(d.room, '<b>'+d.nick+'</b> забанен на <b>'+d.time+' минут</b> по причине: '+d.reason, 'red');
			delUser(d.room, d.user);
		}
	} else {
		showNotificator('Ошибка при попытке кикнуть: '+d, 2000);;
	}
};
ch.response.onRoomlist = function(err, d){
	if(!err){
		var htmllist = '';
		for (var i in d.rooms){
			htmllist += '<p><a href="'+i+'" class="room-link">'+d.rooms[i].caption+'</a> (Участников: '+d.rooms[i].userscount+')<br><span>'+d.rooms[i].topic+'</span></p>';
		}
		var form = tpl('roomlist', {list:htmllist});
		showForm(form, 'Список комнат');
	} else {
		showNotificator('Ошибка получения списка комнат: '+d, 2000);
	}
};
ch.response.onCreateroom = function(err, d){
	if(!err){
		ch.joinRoom(d.name, reciveMessCount);
		hideForm();
	} else {
		showNotificator('Ошибка получения списка комнат: '+d, 2000);
	}
};
ch.response.onLeaveroom = function(err, d){
	if(!err){
		$('#room-'+d.room).remove();
		$('#chat-tabs a[mid='+d.room+']').parent().remove();
		var ss = $('.room-pane').last().attr('id');
		if(!ss)
			return false;
		var roomName = ss.split('-')[1];
		$('#chat-tabs a[mid='+roomName+']').trigger('click')
	} else {
		showNotificator('Ошибка выхода из комнаты: '+d, 2000);
	}
};
ch.response.onChatHist = function(err, d){
	if(!err){
		addMessageHist(d);
	} else {
		showNotificator('Ошибка получения истории: '+d, 2000);
	}
};
ch.response.onGetMessages = function(err, d){
	if(!err){
		addPmTab(d.friend);
	} else {
		showNotificator('onGetMessages: '+d, 2000);
	}
};
ch.response.onPM = function(err, d){
	if(!err){

		if(d.fromHistory){
			addMessage(d);
		} else {

			if($('#pm-'+ d.room).length > 0){

				if(d.room != currentRoom){
					var span = $('#chat-tabs a[mid='+d.room+'] span');
					var mcount = parseInt(span.html()) + 1;
					span.html(mcount).css('display', 'inline-block');
				}

				addMessage(d);
			} else {
				showDesktopNotif('Личное сообщение от '+d.nick, d.text, 'img/notificon.png');
				ch.getMessages(d.room, 30);
			}

		}


	} else {
		showNotificator('onPM: '+d, 2000);
	}
};

/********** LIVE CLICKS ************/

$('.send').live('click',clickSendmess);
$('.messageinput').live('keydown', keyInputmess);
$('.uploadImage').live('click', clickUploadimage);
$('.image-close').live('click', function(){
	$(this).parents('span').html('<span class="deletedmes">Картинка скрыта</span>');
});
$('#change_nick').live('click', function(){
	var form = tpl('newnick', {txt:user.nick});
	showForm(form, 'Изменить ник');
	$('#newnick_but').click(function(){
		ch.setNick($('#newnicktext').val());
	});
	return false;
});
$('dd').live('mouseover', function(){
	$(this).children().children('.eras').show();
}).live('mouseout', function(){
	$(this).children().children('.eras').hide();	
});
$('span.eras').live('click', function(){
	var mid = $(this).parents('dd').attr('id');
	ch.eraseMessage(mid);
});


$('.pic-block').live('mouseenter', function(){
	$(this).find('.image-close').fadeIn(200);
}).live('mouseleave', function(){
	$(this).find('.image-close').fadeOut(200);
});


$('.usmenu').live('click', function(){
	var pr = $(this).attr('priv');
	var targUser = $(this).parents('.user').attr('user');
	$('.umenucont').remove();
	var grid = privGrid(pr, rooms[currentRoom].users[user.login].commonPriv); //1
	var form = $('<div class="umenucont"></div>');
	form.hide();
	for(var i=0; i<grid.length; i++){
		form.append('<div act="'+grid[i]+'">'+umItems[grid[i]]+'</div>');
	}
    form.append('<div act="0">Личное сообщение</div>');
	
	form.children().click(function(){
		$(this).parent().hide();
		uMenuAction($(this).attr('act')*1, $(this).parents('.user').attr('user'));
	});
	
	$(this).parent().parent().after(form);
	form.fadeIn(200);
});
$('.umenucont').live('mouseleave', function(){
	$(this).hide();
});
$('dd span.label').live('click', function(){
	if(user.nick!=$(this).text()){
		var inp = curRoomSel('.messageinput');
		var text = inp.val() + $(this).text() + ': ';
		inp.focus().val('').val(text);
	}
});
$('#smWrap img').live('click', function(){
	curRoomSel('.messageinput').val(curRoomSel('.messageinput').val()+' *smile'+$(this).attr('num')+'* ').focus();
});
$('.profava').live('click', function(){
	var nn = $(this).attr('nn');
	if(user.nick != nn){
		curRoomSel('.messageinput').val(curRoomSel('.messageinput').val()+nn+': ').focus();
	}
});
$('.close-form img').live('click', function(){
	hideForm();
});
$('div.profnick').live('click',nickClick);
$('input[fastaction]').live('keydown', function(e){
	if(e.keyCode==13){
		var elemId = $(this).attr('fastaction');
		$('#'+elemId).trigger('click');
	}
});
$('#create-room').live('click', function(){
	hideForm();
	showForm(tpl('roomcreate', {}), 'Создание новой комнаты');
	return false;
});
$('#cr-create').live('click', function(){
	var capt = $('#cr-caption').val();
	if(capt==''){
		alert('Введите название комнаты!');
		return false;
	}
	var name = translite(capt);
	var topic = $('#cr-topic').val();
	var hidden = $('#cr-hidden').prop("checked");
	ch.createRoom(name, capt, topic, hidden);
});
$('a.room-link').live('click', function(){
	var roomName = $(this).attr('href');
	ch.joinRoom(roomName, reciveMessCount);
	return false;
});
$('#chat-tabs a.label').live('click', function(){
	// кликаем по вкладке комнаты
	var roomName = $(this).attr('mid');
	setCurrentTab(roomName);
	return false;
}).live('mousedown', function(e){
	// правая кнопка по вкладке
	if(e.button == 2){
		var roomName = $(this).attr('mid');
		var capt = rooms[roomName].caption;;
		var link = prompt('Ссылка на эту комнату', '[room='+roomName+']'+capt+'[/room]');
		if(link==null) link='';
		var rsl = curRoomSel('.messageinput');
		rsl.val(rsl.val()+link);
		return false;
	}
});
$('#chat-tabs .litab img.close').live('click', function(){
	// Закрываем вкладку комнаты
	var roomName = $(this).parent().find('a').attr('mid');
	if($('.room-pane').length == 1){
		showNotificator('Нельзя закрыть последнюю комнату', 2000);
	} else {
		ch.leaveRoom(roomName);
	}
	return false;
});
$('#chat-tabs .pmtab img.close').live('click', function(){
	// Закрываем вкладку личных сообщений
	var roomName = $(this).parent().find('a').attr('mid');
	$('#pm-'+roomName).remove();
	$('#chat-tabs a[mid='+roomName+']').parent().remove();
	var ss = $('.room-pane').last().attr('id');
	roomName = ss.split('-')[1];
	$('#chat-tabs a[mid='+roomName+']').trigger('click')
	return false;
});
$('.more-history').live('click', function(){
	// получаем историю
	var rid = $(this).parents('.room-pane').attr('id')
	var skip = curRoomSel('.mp dd span.label').length;
	ch.getHistory(rid.split('-')[1], skip, hisoryLimit);
});


/********** INTERFACE EVENTS ************/
function clickLogout(){
	ch.logOut();
	return false;
}
function clickProfile(){
	clickOnProf = 1;
	ch.getProfile(user.login);
	return false;	
}
function clickSetava(){
	var form = tpl('setava', {src:user.avasrc});
	showForm(form, 'Установка аватарки');
	var ifile = document.getElementById('inputfile');
	ifile.onchange = function(){
		$('#avalabel').html('Загружается...');
		uplAvatar(this.files[0]);
	}
	return false;
}
function clickUploadimage(){
	var ifile = document.getElementById('uplFile');
	$(ifile).trigger('click');
	ifile.onchange = function(){
		showNotificator('Загрузка картинки начата', 2000);
		uplImage(this.files[0]);
	}
}
function mouseSmile1(){
	$('#smileblock').show();
}
function mouseSmile2(){
	$('#smileblock').hide();
}
function clickSmiletab(){
	var tab = $(this).attr('tab')*1;
	var sm = smiles[tab];
	$('#smWrap').html('');
	for(var i in sm){
		$('#smWrap').append('<img num="'+sm[i]+'" src="img/smiles/'+sm[i]+'.gif" alt="" />');
	}
}
function clickStatusbtn(){
	showForm(tpl('status'), 'Мой статусный текст');
	$('#status_but').click(function(){
		ch.setStatus($('#newstatustext').val());
	});	
}
function clickDesignbtn(){
	$('#designblock').show();
}
function clickDesignItem(){
	var act = $(this).attr('act');
	if(act == 'theme-default'){
		designThemeUpdate('theme-default');
	}
	if(act == 'theme-dark'){
		designThemeUpdate('theme-dark');
	}	
	if(act == 'normal'){
		designImagesUpdate('normal');
	}	
	if(act == 'small'){
		designImagesUpdate('small');
	}	
	if(act == 'hide'){
		designImagesUpdate('hide');
	}
	
}

function clickModerBut(){
	var m = $('#modmenu');
	if(m.css('display')=='none'){
		if(blockHide) m.show();
		blockHide = true;
	} else {	
		m.hide();
	}
	if(m.html()==''){
		m.append(tpl('modmenu'));
		m.show();
		$('.moditem').click(function(){
			var v = $(this).attr('val') * 1;
			m.hide();
			blockHide = false;
			showModerWindow(v);
		});
	}

}
function clickRoomsbtn(){
	ch.getRoomslist();
}
function topicChange(){
	var form = tpl('topic', {txt:rooms[currentRoom].topic});
	showForm(form, 'Изменить топик');
	$('#topic_but').click(function(){
		ch.setTopic($('#topictext').val(), currentRoom);
	});
}
function clickStatebtn(){
	$('#tmenu').show();
}
function clickStatebtn2(){
	$('#tmenu').hide();
}
function clickStateitem(){
	var v = $(this).attr('val') * 1;
	if(curState!=v){
		curState = v;
		ch.setState(curState);
	}
}
function clickSendmess(){
	var t = curRoomSel('.messageinput').val();
	if($.trim(t) == '') return false;
	mhist.old = t;

	if(currentType=='room'){
		ch.chat(t, currentRoom, curColor, correctLatMess);
	} else {
		ch.sendMessage(t, currentRoom, curColor);
	}
	curRoomSel('.messageinput').val('').css('backgroundColor','white');
	correctLatMess = false;
}
function keyInputmess(event){
	if(event.keyCode==13){ // enter
		clickSendmess();
		return false;
	}
	if(event.keyCode==38){ // up
		mhist.cur = $(this).val();
		$(this).val(mhist.old).css('backgroundColor','#FCDEDC');
		//$('#miw').css('backgroundColor','#FCDEDC');
		correctLatMess = true;
		return false;
	}
	if(event.keyCode==40){ // down
		$(this).val(mhist.cur).css('backgroundColor','white');
		//$('#miw').css('backgroundColor','white');
		correctLatMess = false;
		return false;
	}	
}
function clickSoundbtn(){
	if(soundEnable){
		soundEnable = false;
		$(this).css('backgroundImage','url(img/soundoff.png)');
		cookie("sounds", 'off',{ expires: 99});
	} else {
		soundEnable = true;
		$(this).css('backgroundImage','url(img/soundon.png)');
		cookie("sounds", 'on', { expires: 99});
	}
}
function clickNotifbtn(){

	if(!isNotif)
		return showForm(tpl('nonotif'), 'Уведомления');

	if (Notification.permission === "granted") {

		if(notifEnable){
			notifEnable = false;
			$('#notifBtn').css('backgroundImage','url(img/notifoff.png)');
			cookie("notifs", 'off',{ expires: 99});
		} else {
			notifEnable = true;
			$('#notifBtn').css('backgroundImage','url(img/notifon.png)');
			cookie("notifs", 'on', { expires: 99});
		}

	} else {

		Notification.requestPermission(function (permission) {
			if (permission === "granted") {
				notifEnable = true;
				$('#notifBtn').css('backgroundImage','url(img/notifon.png)');
				cookie("notifs", 'on', { expires: 99});
			} else {
				alert('Вы заблокировали отображение уведомлений для чата в этом браузере');
			}
		});

	}

}
function nickClick(){
	var cluser = $(this).parents('.user').attr('user');
	clickOnProf = 2;
	ch.getProfile(cluser);
}
function clickPrivatemes(){
	alert('Личные сообщения пока не работают');
	return false;
}


/********** MENU ACTIONS ************/
function showModerWindow(v){
	if(v==1){
		var form = '/* функционал не реализован */';
		showForm(form, 'Список забаненых');
	}
	if(v==2){
		var form = '/* функционал не реализован */';
		showForm(form, 'Зарегистрировать юзера');	
	}
	if(v==3){
		// сменить топик комнаты
		topicChange();
	}	
}

var openPM = function(user){
	if(!user)
		return console.log('Укажите login пользователя');
	ch.getMessages(user, 30);
};

function uMenuAction(val, user){
	if(val==0){ // Личное сообщение
		ch.getMessages(user, 30);
	}
	if(val==1){ //сделать админом сервера
		alert('Функционал не реализован');
		//socket.json.send({'type':'globprivilege', 'priv':1, 'user':user});
	}
	if(val==2){ //сделать обычным юзером сервера
		alert('Функционал не реализован');
		//socket.json.send({'type':'globprivilege', 'priv':2, 'user':user});
	}
	if(val==3){ // сделать модером комнаты
		alert('Функционал не реализован');
	}
	if(val==4){ // расжаловать модера
		alert('Функционал не реализован');
	}
	if(val==5){ // Забанить
		showForm(tpl('ban'), 'Забанить ' + user);
		$('#banBtn').click(function(){
			ch.setBan($('#bantime').val(), $('#banreason').val(), user, currentRoom);
			hideForm();
		});
	}
	if(val==6){ // Кикнуть
		ch.kick(user, currentRoom);
	}
	if(val==7){ // Лишить голоса
		alert('Функционал не реализован'); return false;
		showForm(tpl('novoice'), 'Лишить голоса ' + user);
		$('#voicereason').focus();
		$('#voiBtn').click(function(){
			hideForm();
			//socket.json.send({'type':'voiceoff', 'time':$('#voicetime').val(), 'reason':$('#voicereason').val(), 'user':user});
		});	
	}
	if(val==8){ // Вернуть голос
		alert('Функционал не реализован');
		//socket.json.send({'type':'voiceon', 'user':user});
	}	
}

/********** ADDITION FUNCTIONS ************/

function setTitle(count){
	if(count) {
		$('title').text('[' + count +  '] ' + titleDefault);
	} else {
		$('title').text(titleDefault);
	}
}

function tpl(tname, variables){
	template = templates[tname];
	return template.replace(new RegExp('\{(.*?)\}','g'),function(a,b){
		return isset(variables[b]) ? variables[b] : '';
	});
}
function scrollPane(){
	// block auto scrolling
	var rid = $(this).parents('.room-pane').attr('id');
	var roomName = rid.split('-')[1];
	rooms[roomName].autoScroll = (this.offsetHeight+this.scrollTop >= this.scrollHeight);
};
function showForm(s,capt, top){
	if(!isset(top)) top='100px';
	$('#alert').html('<div class="close-form"><img title="Закрыть" src="img/close-form.png" alt="" /></div><h1>'+capt+'</h1> '+s).css('top', top).show();
	$('#overlay').show();
}
function hideForm(){
	if(blockOverlay) return false;
	$('#alert').hide();
	$('#overlay').hide();
	curRoomSel('.messageinput').focus();
}
function curRoomSel(sel){
	return $('#'+currentType+'-'+currentRoom).find(sel);
}
function roomSel(room, sel){
	if(room==''){
		return $('.room-pane').find(sel);
	} else {
		return $('#'+currentType+'-'+room).find(sel);
	}
}
function moveTab(name){
	var elem = $('#chat-tabs a[mid='+name+']').parent().detach();
	$('#chat-tabs').prepend(elem);
}
function allRoomsLoaded(){

	// когда все комнаты загрузились

	var cookr = cookie('rooms');
	if(cookr!=null){
		var rms = cookr.split('|');
		delete rms[rms.length];
		for(var i=0; i<rms.length-1; i++){
			//ch.joinRoom(rms[i], reciveMessCount);
			//startRoomLoads++;
		}

		//setCurrentTab(rms[rms.length-1]);
	}


}
function addPmTab(friend){

	var usr = friend.login;
	var ssr = {}
	ssr[user.login] = user;
	ssr[usr] = friend;

	if($('#pm-'+usr).length > 0){
		setCurrentTab(usr);
		return false;
	}

	$('#chat-tabs a.label').removeClass('active');
	$('#add-room-tab').before(tpl('pmtab', {name:usr, capt:'@'+ch.getNick(usr)}))
	$('#chat-rooms').append(tpl('roompane', {name:usr, type:'pm'}));
	$('.room-pane').hide();
	$('#pm-'+usr).show().find('.mpw').scroll(scrollPane);
	currentRoom = usr;
	currentType = 'pm';
	rooms[usr] = {
		'tp':'pm',
		'users':ssr,
		'autoScroll':true
	};

	roomSel(usr, '.rp').append(getUserItemHTML(usr, friend['nick'], friend['avaurl'], friend['statustext'], 0, friend['state'], '', true));
	roomSel(usr, '.rp').append(getUserItemHTML(usr, user['nick'], user['avasrc'], user['statustext'], 0, user['state'], '', true));

}
function setCurrentTab(name){

	var tab = $('#chat-tabs a[mid='+name+']');
	currentType = tab.attr('typ');

	$('.room-pane').hide();
	$('#'+currentType+'-'+name).show();
	$('#chat-tabs a.label').removeClass('active');

	tab.addClass('active').find('span').html('0').hide();
	currentRoom = name;
	$('.pic-block').css('height', 'auto');
	toBottom();
}
function uplAvatar(file){
	if (!file.type.match(/image.*/)) return true;
	imageReader.onload = (function(aFile){
		return function(e){
			imaga = document.createElement('img');
			imaga.src = e.target.result;
			imaga.onload = function(){
				ch.setAvatar(imaga.src, function(result){
					if(!result) {
						$('#avalabel').html('Ошибка загрузки');
						return showNotificator('Ошибка установки аватарки: ' + result.reason, 3000);
					}

				});
			}
		}
	})(file);
	imageReader.readAsDataURL(file);
}
function uplImage(file){
	if (!file.type.match(/image.*/)) { return true };
	imageReader.onload = (function(aFile){
		return function(e){
			imaga = document.createElement('img');
			imaga.src = e.target.result;
			imaga.onload = function(){
				ch.uploadImage(imaga.src, function(result){

					if(!result)
						return showNotificator('Произошла ошибка при загрузке картинки', 3000);

					ch.chat('uploadimage|'+result.urlImage+'|'+result.urlThumb, currentRoom, curColor);

				});
			}
		}
	})(file);
	imageReader.readAsDataURL(file);
}
function helloStr(nick){
	$('#hello').html(tpl('hello', {n:nick}));
}
function showUserProfileWindow(udat){
	showForm(tpl('userprof'), 'Профиль '+udat['nickname']);
	var selector;
	for(var us in udat){
		selector = '#vw_'+us;
		if(selector == '#vw_gender') udat[us] = gender[udat[us]];
		$(selector).html(urlReplace(udat[us]));
	}
}

function showMyProfileWindow(udat, vis){
	showForm(tpl('myprof'), 'Мой профиль', '100px');
	for(var us in udat){
		$('#pr_'+us).val(udat[us]);
	}
	if(isset(udat['birthday'])){
		$('#pr_birthday').val(date('m/d/Y', udat['birthday']));
	}
	$('#pr_vis').val(vis);
	$('#pr_birthday').simpleDatepicker({chosendate:'01/01/1995', startdate:'01/01/1970', enddate:'01/01/2005'});
	$('#prof_save').click(function(){
		var dat = {};
		if($('#pr_gender').val()!='') dat['gender'] = $('#pr_gender').val();
		if($('#pr_birthday').val()!='') dat['birthday'] = parseDT($('#pr_birthday').val());
		if($('#pr_realname').val()!='') dat['realname'] = $('#pr_realname').val();
		if($('#pr_country').val()!='') dat['country'] = $('#pr_country').val();
		if($('#pr_email').val()!='') dat['email'] = $('#pr_email').val();
		if($('#pr_homepage').val()!='') dat['homepage'] = $('#pr_homepage').val();
		if($('#pr_phone').val()!='') dat['phone'] = $('#pr_phone').val();
		if($('#pr_icq').val()!='') dat['icq'] = $('#pr_icq').val();
		if($('#pr_skype').val()!='') dat['skype'] = $('#pr_skype').val();
		if($('#pr_twitter').val()!='') dat['twitter'] = $('#pr_twitter').val();
		if($('#pr_facebook').val()!='') dat['facebook'] = $('#pr_facebook').val();
		if($('#pr_vk').val()!='') dat['vk'] = $('#pr_vk').val();
		ch.setProfile(user.login, dat, $('#pr_vis').val());
	});
}
function addMessage(m){
	var mObj;
	var typ = m.pm ? 'pm' : 'room';
	if(!isset(m.mid)) m.mid = '';
	if(m.text=='' || !isset(m.text)) return false;
	if(!isset(m.date)) m.date = time();
	m = messageAfterProc(m);
	if(m.isBot){
		mObj = $('<dt></dt><dd class="bot">'+m.text+'</dd>');
	} else {
		m.text = '<span style="color:#'+m.color+'">'+m.text+'</span>'
		mObj = $('<dt>'+date('H:i',m.date)+'</dt><dd id="'+m.mid+'"><span class="label">'+m.nick+'</span>'+m.text+'</dd>');
	}
	$('#'+typ+'-'+m.room).find('.mp').append(mObj);
	toBottom();
	designImagesUpdate(localStorage.designImages);

	$("img.inlinepic", mObj).bindImageLoad(function () {
		$(this).parent().parent().height( $(this).height() );
		toBottom();
	});
	return true;
}
function addMessageHist(m){
	var mObj;
	var typ = m.pm ? 'pm' : 'room';
	if(!isset(m.mid)) m.mid = '';
	if(m.text=='' || !isset(m.text)) return false;
	if(!isset(m.date)) m.date = time();
	m = messageAfterProc(m);
	m.text = '<span style="color:#'+m.color+'">'+m.text+'</span>'
	mObj = $('<dt>'+date('H:i',m.date)+'</dt><dd id="'+m.mid+'"><span class="label">'+m.nick+'</span>'+m.text+'</dd>');
	$('#'+typ+'-'+m.room).find('.mp .more-history').after(mObj);
	return true;
}
function addNotif(room, mes, color, silens){
	roomSel(room, '.mp').append('<dt>'+date('H:i',time())+'</dt><dd class="notif" style="color:'+color+'">'+mes+'</dd>');
	if(silens!=true) playSound('notif');
	toBottom();
}
function addNotifInRooms(user, mes, color){
	$('.rp table[user='+user+']').parents('.room-pane').find('.mp').append('<dt>'+date('H:i',time())+'</dt><dd class="notif" style="color:'+color+'">'+mes+'</dd>');
	playSound('notif');
	toBottom();
}
function addTopic(mes, room){
	roomSel(room, '.mp').append('<dt></dt><dd class="topic">*** '+mes+' ***</dd>');
	$('#topicplace').find('span').html(mes);
	toBottom();
}
function showNotificator(mes, time){
	$('#notificat').html(mes).fadeIn();
	setTimeout(function(){
		$('#notificat').fadeOut();
	}, time);
}
function toBottom(){
	var pan = document.querySelector('#room-'+currentRoom+' .mpw') || document.querySelector('#pm-'+currentRoom+' .mpw');
	if(!pan)
		return false;
	if(rooms[currentRoom].autoScroll) pan.scrollTop = pan.scrollHeight;

}
function getUserItemHTML(name, nick, avaurl, status, priv, state, awstatus, pm){

	if(pm){
		return tpl('useritempm', {name:name, url:avaurl, n:nick, st:status, states:states[state], statest:statesT[state]});
	} else {
		return tpl('useritem', {
			name:name,
			url:avaurl,
			pt:privasT[priv],
			p:privas[priv],
			priv:priv,
			n:nick,
			st:status,
			states:states[state],
			statest:statesT[state],
			awstatus:awayStatuses[awstatus],
		});
	}
}
function addUser(room, name, uobj){
	var utable = roomSel(room, '.rp table[user='+name+']');
	if(utable.length > 0){
		utable.remove();
	}
	roomSel(room, '.rp').append(getUserItemHTML(name, uobj['nick'], uobj['avaurl'], uobj['statustext'], uobj['commonPriv'], uobj['state'], uobj['awayStatus']));
	roomSel(room, '.rp table[user='+name+']').slideDown();
}
function delUser(room, name){
	//delete rooms[currentRoom]['users'][name];
	roomSel(room, '.rp table[user='+name+']').slideUp(function(){$(this).remove()});
}
function clearUsers(){
	curRoomSel('.rp').html('');
	curRoomSel('.mp dd').html('');
}
function fillUsers(usr){
	for(var key in usr){
		curRoomSel('.rp').append(getUserItemHTML(key, usr[key]['nick'], usr[key]['avaurl'], usr[key]['statustext'], usr[key]['commonPriv'], usr[key]['state'], usr[key]['awayStatus']));
	}
	$('div.profnick').click(nickClick);
	$('.user[user='+user.login+'] .usmenu').hide();
}
function showToolsButtons(priv){
	if(priv==1 || priv==2 || priv==3){
		$('#moderBtn').show();
	} else {
		$('#moderBtn').hide();	
	}
}
function saveTabs(){
	var roomtabs = '';
	var pan = document.querySelectorAll('#chat-tabs a.label');
	for (var i=0; i<pan.length; i++) {
		roomtabs += $(pan[i]).attr('mid') + '|';
	}
	cookie("rooms", roomtabs + currentRoom, {expires: 99});
}
function showDesktopNotif(capt, mes, userpic){

	if(!(isNotif && notifEnable && mes) || isFocus)
		return;

	var nn = new Notification(capt, {
		body: strip_tags(stripBB(mes)).substring(0,200),
		icon: userpic
	});

	nn.onclick = function(){
		this.close();
		curRoomSel('.messageinput').focus();
	}
	var notif_timer = setTimeout(function(){
		nn.close();
	}, 5000);

}
function privGrid(a,b){
	if(a==2 && b==1) return [1,4,5,6,7];
	if(a==3 && b==1) return [1,5,6,7];
	if(a==4 && b==1) return [1,3,5,6,7];
	if(a==5 && b==1) return [5,6,8];
	if(a==2 && b==2) return [4,5,6,7];
	if(a==4 && b==2) return [5,6,7];
	if(a==5 && b==2) return [5,6,8];
	if(a==2 && b==3) return [4,5,6,7];
	if(a==4 && b==3) return [3,5,6,7];
	if(a==5 && b==3) return [5,6,8];
	return [];
}

/********** AUTHENTICATION AND REGISTRATION ************/

function showAuthWindow(){
	showForm(tpl('auth'), 'Авторизация');
	$('#auth_but').click(function(){
		ch.login($('#auth_login').val(), $('#auth_pass').val());
	});

	setTimeout(function(){
		VK.Widgets.Auth("vk_auth", {width: "200px", onAuth: VKauthProc});
	}, 500);

}
function VKauthProc(data){
	if(!data) {
		alert('Что-то не так, нет ответа от ВК');
		return false;
	}
	ch.login(data.uid, {
		hash: data.hash,
		name1: data.first_name,
		name2: data.last_name
	}, true);
}
function testStr(str, pat){
	return new RegExp(pat, 'i').test(str);
}

/********** MESSAGE AFTER RECIVE ************/

function messageAfterProc(s){

	if(!s.isBot){
		var uplRegexp = /^uploadimage\|([a-z0-9_:.\/]+)\|([a-z0-9_:.\/]+)$/i;
		if(uplRegexp.test(s.text)){
			s.text.replace(uplRegexp, function(a,b,c){
				s.text = tpl('image', {url1:c, url2:b});
			});
		} else {
			s.text = s.text.replace(new RegExp('(https?://)([-a-zA-Zа-яА-Я0-9@:;%!_\+.,~#?&//=/(/)]+)', 'gi'),function(link){
				
				if(/\.(jpg|jpeg|gif|png)\??.*$/i.test(link)){ // image
					return tpl('image', {url1:link, url2:link});     
				} else if(testStr(link, 'htt(p|ps)://(www.)?youtube.com/')){ 	// youtube
					var yt = link.match(/v=([a-zA-Z0-9_-]+)/);
					return '<iframe width="560" height="315" src="http://www.youtube.com/embed/'+yt[1]+'" frameborder="0" allowfullscreen></iframe><a class="close_video" href="#">[X]</a>';
				} else if(testStr(link, 'htt(p|ps)://coub.com/view/')){ 	// coub
					var coubId = link.match(/view\/([a-zA-Z0-9_-]+)/)[1];
					return '<iframe src="//coub.com/embed/'+coubId+'?muted=false&autostart=false&originalSize=false&startWithHD=false" allowfullscreen="true" frameborder="0" width="640" height="264"></iframe><a class="close_video" href="#">[X]</a>';
				} else {	// simple link
					return '<a href="'+link+'" target="_blank">'+link+'</a>';
				}

			});
		}
	}
	
	/* nl2br */
	s.text = s.text.replace(/([^>])\n/g, '$1<br />');
	
	// обращение по нику
	if(!s.fromHistory){

		var userpic = '';
		var usernick = '';
		var rusr = rooms[s.room].users[s.user];
		if(isset(rusr)) {
			userpic = rusr.avaurl;
			usernick = rusr.nick;
		}

		if(s.text.match(user.nick+':')){
			s.text = '<span class="for-you">' + s.text + '</span>';
			playSound('foryou', true);
			showDesktopNotif('Обращение от '+usernick, s.text, userpic);
		} else {
			if(s.user!=user.login){
				var place = s.pm ? 'ЛС' : rooms[s.room].caption;
				showDesktopNotif(usernick + ' в ' + place, s.text, userpic);
				playSound('message');
			}	
		}

		if(!isFocus) {
			rooms[s.room]._newMessages = isset(rooms[s.room]._newMessages) ? rooms[s.room]._newMessages + 1 : 1;
			setTitle(rooms[s.room]._newMessages);
		}

	}
	
	// удалялка сообщений для админа
	if(user.privilege == 0 || user.privilege == 1){
		s.text += ' <span class="eras">x</span>';
	}	
	
	// смайлы
	s.text = s.text.replace(/\*smile(\d+)\*/gm, function(a,b){
		return '<img src="img/smiles/'+b+'.gif" alt="" />';
	})
	
	
	s.text = BBproc(s.text);
	
	return s;
}

/********** TEMPLATES ************/

var smiles = {
	1:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167],
	5:[501,502,503,504,505,506,507,508,509,510,511,512,513,514,515,516,517,518,519,520,521,522,523,524,525,526,527,528,529,530,531,532,534,535,536,537,538],
	3:[601,602,603,604,605,606,607,608,609,610,611,612,613,614,615,616,617,618,619,620,621,622,623,624,625,626,627,628,629,630,631,632,633,634],
	4:[700,701,702,703,704,705,706,707,708,709,710,711,712,713,714,715,716,717,718,719,720,721,722,723,724,725,726,727,728,729,730,731,732,733,734,735,736,737,738,739,740,741,742,743,744,745,746,747,748,749,750,751,752,753,754,755,756,757,758,759,760,761,762,763,764,765,766,767,768,769,780,781,782,783,784,785,786,787,788,789,790,791,792,793],
	2:[800,801,802,803,804,805,806,807,808,809,810,811,812,813,814,815,816,817,818,819,820,821,822,823,824,825,826,827,828,829,830,831,832,833,834,836,837,838,839,840,841,843,844,845,846,847,848,849,851,852,853,854,855,856,857,858,859,860,861,862,863,864,865,866,867,868,869,870,871,872,873,874,875,876,877,878,879,880,881,882,883,884,885,886,887,888,889,890,891,892,893,894,895,896,897,898,899,900,901,902,903,904,905,906,907,908,909,910,911,912,913,914,915,916,917,918,919,920,921,922,923,924,925,926,927,928,929,930,931,932,933,934,935,936,937,938,939,940,941,943,944,945,946,947,948,949,950,951,952,953,954,955,956,957,958,959,960,961,962,963,964,965,966,967,968,969,970,971,972,973,974,975,976,977,978,979,980,981,982,983,984,985,986,987,988,989,990,991,992,993,994,995,996,997,998,999],
	6:[201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,259,260,261,262,263,264,265,266,267,268,269,273],
	7:[300,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323],
	8:[324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,359,360,361,362,363,364,365,366,367,368,369,370,371,372,373,374,375,376,377,378,379,380,382,383,384,385,386,387,388,389,390,391,392,393,394,395,396,397,398,399,400,401,402,403,404,405,406,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499],
	9:[550, 551, 552, 553, 554,555,556,557,558,559,560,561,562,563,564,565,566,567,568,569,570,571,572,573,574,575,576,577,578,578,580,581,582,583,584,585,586,587,588,589]
}
states[0] = 'online.png'; 		statesT[0] = 'Онлайн';
states[1] = 'away.png'; 		statesT[1] = 'Отошел';
states[2] = 'busy.png'; 		statesT[2] = 'Занят'; 
states[3] = 'stop.png'; 		statesT[3] = 'Отсутствую'; 
states[4] = 'work.png'; 		statesT[4] = 'Работаю'; 
states[5] = 'rest.png'; 		statesT[5] = 'Отдыхаю'; 
states[6] = 'game.png'; 		statesT[6] = 'Играю'; 
states[7] = 'music.png';		statesT[7] = 'Слушаю музыку';
states[8] = 'films.png';		statesT[8] = 'Смотрю фильм';
states[9] = 'food.png'; 		statesT[9] = 'Кушаю'; 
states[10] = 'coffee.png';		statesT[10] = 'Чай / кофе';
states[11] = 'home.png';		statesT[11] = 'Дела по дому';
states[12] = 'read.png';		statesT[12] = 'Читаю';
states[13] = 'sleep.png';		statesT[13] = 'Сплю';
states[14] = 'pirat.png';		statesT[14] = 'Пират';

privas[0] = 'empty.png'; 		privasT[0] = '';
privas[1] = 'admin.png'; 		privasT[1] = 'Админ';
privas[2] = 'moder.png'; 		privasT[2] = 'Модератор';
privas[3] = 'owner.png'; 		privasT[3] = 'Хозяин комнаты'; 
privas[4] = 'user.png'; 		privasT[4] = 'Пользователь'; 
privas[5] = 'novoice.png';		privasT[5] = 'Без голоса';

umItems[1] = 'Сделать админом';
umItems[2] = 'Разжаловать админа';
umItems[3] = 'Сделать модератором';
umItems[4] = 'Разжаловать модера';
umItems[5] = 'Забанить';
umItems[6] = 'Кикнуть';
umItems[7] = 'Лишить голоса';
umItems[8] = 'Вернуть голос';

var gender = {0: 'Не указано', 1: 'Мальчик', 2: 'Девочка'}
var awayStatuses = {
	0: 'Бдит',
	1: 'Отвлекся',
	2: 'Отошел',
	3: 'Задремал',
	4: 'Ушел'
};
var templates = {auth: '<div>Логин: <input type="text" id="auth_login" /></div><div>Пароль: <input type="password" id="auth_pass" /></div><div><input type="button" id="auth_but" class="btn" value="Войти" /></div><div align="center">	<div id="vk_auth"></div></div><a id="reglink" href="http://aniavatars.com/register">Регистрация</a>', ban: '<p>Причина бана: <select id="banreason"><option value="Мат или ругательство в сообщении">Мат или ругательство в сообщении</option><option value="Мат в картинке или видео">Мат в картинке или видео</option><option value="Ссылка на ресурс с нецензурным содержанием">Ссылка на ресурс с нецензурным содержанием</option><option value="Порно или хентай">Порно или хентай</option><option value="Контент с насилием, расчлененкой или гуро">Контент с насилием, расчлененкой или гуро</option>	<option value="Оскорбление пользователя">Оскорбление пользователя</option><option value="Некорректное поведение">Некорректное поведение</option></select></p><p>Время бана: <select id="bantime"><option value="15">15 минут</option><option value="30">30 минут</option><option value="60">1 час</option><option value="180">3 часа</option><option value="360">6 часов</option><option value="720">12 часов</option><option value="1440">1 день</option><option value="4320">3 дня</option><option value="10080">1 неделя</option><option value="40320">1 месяц</option><option value="0">Навсегда</option></select></p><div><input type="button" class="btn" id="banBtn" value="Забанить!" /></div>', banmes: '<div style="text-align:center;margin:20px 100px"><img src="img/banned.jpg" alt="" /> <p><b>Вы забанены в этой комнате на {time} мин. {reason}</b></p><p>Вы себя вели настолько неуважительно к чату и его пользователям, что теперь читаете эти строки без права зайти в комнату еще {time} мин. Какого хрена? Будет время - <a target="_blank" href="https://github.com/redspirit/hitagi-client/wiki/%D0%9F%D1%80%D0%B0%D0%B2%D0%B8%D0%BB%D0%B0-%D1%87%D0%B0%D1%82%D0%B0">почитайте правила</a>, они очень простые и основаны на самом обычном взаимном уважении между людьми. Если вы принципиально считаете себя выше всех, то лучше сюда не возвращаться.</p></div>', blockmes: '<div style="text-align:center;margin:20px 100px"><img src="img/blocked.jpg" alt="" /> <p><b>Вы заблокированы, причина блокировки: "{mess}"</b></p></div>', conerror: 'Невозможно подключиться к серверу. Что-то где-то не работает', hello: 'Привет, <b>{n}</b>', image: '<div class="pic-block">	<a target="_blank" href="{url2}" style="text-decoration: none;">		<img class="inlinepic" src="{url1}" alt="" />	</a>	<img src="img/closeimg.png" class="image-close" alt=""></div>', kickmes: '<div style="text-align:center;margin:20px 100px"><img src="img/kick.jpg" alt="" /><p>Уважаемый пользователь, Вас выпнули (кикнули) из этой комнаты. Это сделал модератор у которого, скорее всего, были для этого веские причины.</p><p><b>НАПОМИНАЕМ ВАМ о <a target="_blank" href="https://github.com/redspirit/hitagi-client/wiki/%D0%9F%D1%80%D0%B0%D0%B2%D0%B8%D0%BB%D0%B0-%D1%87%D0%B0%D1%82%D0%B0">ПРАВИЛАХ</a> чата!</b></p><p>Если Ваше отношение к чату и его пользователям не изменится в лучшую сторону, то дело может дойти акта банного изгнания.</p></div>', modmenu: '<div class="moditem" val="1">Список забаненых</div><div class="moditem" val="2">Зарегать юзера</div><div class="moditem" val="3">Топик комнаты</div>', myprof: '<table id="proftabl">	<tr>	<tr>		<td>Реальное имя:</td>		<td><input type="text" id="pr_realname" /></td>	</tr>	<td>Пол:</td>	<td><select id="pr_gender">		<option value="0">Не указан</option>		<option value="1">Мальчик</option>		<option value="2">Девочка</option>	</select></td>	</tr><tr>	<td>День рождения:</td>	<td><input type="text" id="pr_birthday" /></td></tr>	<tr>		<td>Страна:</td>		<td><input type="text" id="pr_country" /></td>	</tr>	<tr>		<td>E-mail:</td>		<td><input type="text" id="pr_email" /></td>	</tr>	<tr>		<td>Блог / страничка:</td>		<td><input type="text" id="pr_homepage" /></td>	</tr>	<tr>		<td>Телефон:</td>		<td><input type="text" id="pr_phone" /></td>	</tr>	<tr>		<td>ICQ:</td>		<td><input type="text" id="pr_icq" /></td>	</tr>	<tr>		<td>Skype:</td>		<td><input type="text" id="pr_skype" /></td>	</tr>	<tr>		<td>Twitter:</td>		<td><input type="text" id="pr_twitter" /></td>	</tr>	<tr>		<td>Facebook:</td>		<td><input type="text" id="pr_facebook" /></td>	</tr>	<tr>		<td>ВКонтакте:</td>		<td><input type="text" id="pr_vk" /></td>	</tr>	<tr>		<td>Видимость профиля:</td>		<td><select id="pr_vis">			<option value="0">Видно всем</option>			<option value="1">Только зарегистрированным</option>			<option value="2">Скрыто</option>		</select></td>	</tr></table><div style="margin-top: 10px">	<a href="#" id="change_nick">Изменить ник</a></div><div align="center">	<input type="button" class="btn" id="prof_save" value="Сохранить" /></div>', newnick: '<div>	<input style="width:200px;" type="text" id="newnicktext" value="{txt}"></div><p>	Менять ник можно не чаще одного раза в неделю</p><input type="button" id="newnick_but" class="btn" value="Изменить ник" />', nonotif: 'Ваш браузер не поддерживает всплывающие уведомления! Используйте <a target="_blank" href="http://www.google.com/intl/ru/chrome/browser/">Google Chrome</a> или <a target="_blank" href="http://browser.yandex.ru/">Яндекс браузер</a> ', novoice: '<p>Причина: <input type="text" id="voicereason" style="width:300px" /></p><p>Время без голоса: <select id="voicetime"><option value="15">15 минут</option><option value="30">30 минут</option><option value="60">1 час</option><option value="180">3 часа</option><option value="360">6 часов</option><option value="720">12 часов</option><option value="1440">1 день</option><option value="4320">3 дня</option><option value="10080">1 неделя</option><option value="40320">1 месяц</option><option value="0">Навсегда</option></select></p><div><input type="button" class="btn" id="voiBtn" value="Перекрыть кислород!" /></div>', pmtab: '<li class="pmtab">	<a href="#" mid="{name}" typ="pm" class="label active">{capt} <span class="unread">0</span></a>	<img src="img/tab-close2.png" alt="" class="close" title="Закрыть" /></li>', radiocode: '<object width="100" height="70" id="raa"><param name="allowScriptAccess" value="sameDomain" /><param name="movie" value="/lib/radio/raa.swf" /><param name="flashvars" value="playlist=/lib/radio/playlist.mpl&auto_run=false&anti_cache=false" /><param name="loop" value="false" /><param name="menu" value="false" /><param name="quality" value="high" /><embed src="/lib/radio/raa.swf" flashvars="playlist=/lib/radio/playlist.mpl&auto_run=false&anti_cache=false" loop="false" menu="false" quality="high" bgcolor="#ffffff" width="100" height="70" name="raa" allowScriptAccess="sameDomain" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" /></object>', roomcreate: '<div class="createroomdiv"><table>	<tr>		<td class="right">Название:</td>		<td><input type="text" id="cr-caption"></td>	</tr>	<tr>		<td class="right">Тема комнаты:</td>		<td><input type="text" id="cr-topic"></td>	</tr>	<tr>		<td class="right">Скрытая:</td>		<td><input type="checkbox" id="cr-hidden" /></td>	</tr></table><div>	Скрытая комната не появляется в списке комнат, другие пользователи могут зайти в нее только по приглашению.	Вы становетесь владельцем комнаты и получаете права администратора в ней. Вы можете удалить комнату в любой момент</div><input type="button" class="btn" id="cr-create" value="Создать"></div>', roomlist: '<div id="roomlist">	{list}</div><hr><a href="#" style="display:none;" id="create-room_">Создать новую комнату</a>', roompane: '<div class="room-pane" id="{type}-{name}" style="display: none;">	<div class="roster-pane rp"></div>	<div class="message-pane-wrapper mpw">		<dl class="message-pane mp">			<div class="more-history">Загрузить предыдущие сообщения</div>		</dl>	</div>	<div class="message-form-wrapper"></div>	<form method="post" class="message-form">		<textarea name="message" class="field messageinput"></textarea>		<input type="button" class="btn send" value="Отправить"/>		<div class="uploadImage" title="Загрузить картинку"></div>	</form></div>', roomtab: '<li class="litab">	<a href="#" mid="{name}" typ="room" class="label active">{capt} <span class="unread">0</span></a>	<img src="img/tab-close2.png" alt="" class="close" title="Закрыть" /></li>', rules: '<a href="https://github.com/redspirit/hitagi-client/wiki/%D0%9F%D1%80%D0%B0%D0%B2%D0%B8%D0%BB%D0%B0-%D1%87%D0%B0%D1%82%D0%B0" target="_blank">	<img src="img/rules.png" alt="" /></a>', setava: '<div><img id="newavaimg" src="{src}" alt="" /></div><div><input type="file" name="files" id="inputfile" /></div><div id="avalabel">Выберите файл с картинкой. GIF анимироваться не будет</div>', simpimage: '<a target="_blank" href="{url2}"><img class="inlinepic" src="{url1}" alt="" /></a>', status: '<div><input type="text" id="newstatustext" style="width:400px;" value="" fastaction="status_but" /></div><input type="button" id="status_but" class="btn" value="Изменить" />', statusitem: '<div class="titem stateitem" style="background-image:url(img/{s1})" val="{n}">{s2}</div>', topic: '<div>	<textarea style="width:300px; height:80px;" id="topictext">{txt}</textarea></div><input type="button" id="topic_but" class="btn" value="Изменить" />', useritem: '<table user="{name}" class="user">	<tr>		<td rowspan="2" scope="col" class="cc1">			<img class="profava" src="{url}" alt="" nn={n} />		</td>		<td scope="col" style="padding-top:6px">			<img class="stateSign" src="img/{states}" alt="" />			<div class="statetxt">{statest}</div> <div class="awaystatus">{awstatus}</div> </td>	</tr>	<tr>		<td class="cc2">			<img class="upriv" title="{pt}" src="img/{p}" alt="" />			<div class="usmenu" priv="{priv}"></div>		</td>	</tr>	<tr>		<td colspan="2" class="cc3">			<div class="profnick" title="Юзер: {name}">{n}</div>			<div class="ustatus">{st}</div>		</td>	</tr></table>', useritempm: '<table user="{name}" class="user">	<tr>		<td class="cc1">			<img class="profava" src="{url}" alt="" nn={n} />		</td>		<td scope="col" style="padding-top:6px">			<img class="stateSign" src="img/{states}" alt="" />			<div class="statetxt">{statest}</div>		</td>	</tr>	<tr>		<td colspan="2" class="cc3">			<div class="profnick" title="Юзер: {name}">{n}</div>			<div class="ustatus">{st}</div>		</td>	</tr></table>', userprof: '<table id="proftabl"><tr><tr><td class="r">Реальное имя:</td><td id="vw_realname"></td></tr><tr><td class="r">Пол:</td><td id="vw_gender"></td></tr><tr><td class="r">День рождения:</td><td id="vw_birthday"></td></tr><tr><td class="r">Страна:</td><td id="vw_country"></td></tr><tr><td class="r">E-mail:</td><td id="vw_email"></td></tr><tr><td class="r">Блог / страничка:</td><td id="vw_homepage"></td></tr><tr><td class="r">Телефон:</td><td id="vw_phone"></td></tr><tr><td class="r">ICQ:</td><td id="vw_icq"></td></tr><tr><td class="r">Skype:</td><td id="vw_skype"></td></tr><tr><td class="r">Twitter:</td><td id="vw_twitter"></td></tr><tr><td class="r">Facebook:</td><td id="vw_facebook"></td></tr><tr><td class="r">ВКонтакте:</td><td id="vw_vk"></td></tr></table>', vrnotif: 'Регистрация прошла успешно, теперь просто залогинтесь через ВК'}
