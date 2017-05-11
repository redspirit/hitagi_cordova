var states = [], statesT = [], privas = [], privasT = [], umItems = [];
var blockOverlay = true, clickOnProf = 0, currentType = 'room';
var soundEnable, playSound, blockHide = true;
var user, rooms = {}, curColor, isFocus = true, startRoomLoads = 0;
var curState, reciveMessCount = 50, hisoryLimit = 50;
var mhist = {cur: '', old: ''}, correctLatMess = false;
var blurTimers = {};
var titleDefault = 'Аниме чат Hitagi';
var imagesUrl = 'http://chat.aniavatars.com';
//var ch = hitagiCreate('ws://chat.aniavatars.com', true);
var ch = hitagiCreate('ws://localhost:8091', true);
var isDevice = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
var debouncer = new JoinDebouncer(5);
var authLock = new Auth0Lock(
    'oHTGcfXKEWjBACwwgAm5bga9Qe92XJLA',
    'redspirit.eu.auth0.com',
    {
        allowedConnections: ['vkontakte', 'google-oauth2'],
        languageDictionary: languageDictionary,
        theme: {
            primaryColor: '#0081cc',
            logo: 'img/appicon.png'
        },
        auth: {
            popup: true,
            redirect: false
        },
        autoclose: true,
        initialScreen: 'login'
    }
);


authLock.on("authenticated", function(authResult) {

    ch.loginSocial(authResult.idToken);

});

/********** START APPLICATION ************/

(function(){

    if(!isDevice)
        window.AppVersion = {
            version: 'web'
        };
})();


function start() {
    createElements();
    bindings();
    initToolButtons();
    initSounds();
}

function createElements() {
    // создаем меню со статусами
    for (var i = 0; i < statesT.length; ++i) {
        $('#tmenu').append(tpl('statusitem', {s1: states[i], s2: statesT[i], n: i}));
    }
    designThemeUpdate(null);
}

document.addEventListener("deviceready", function(){

    cordova.plugins.backgroundMode.setDefaults({
        title:  "Hitagi chat",
        ticker: "Hitagi работает в фоне",
        text:   "Нажмите, чтобы открыть окно чата",
        icon: 'icon',
        color: "#ff00ff"
    });
    cordova.plugins.backgroundMode.enable();
    cordova.plugins.backgroundMode.onactivate = function () {

        isFocus = false;

        blurTimers.level1 = setTimeout(function () {
            ch.awayStatus(1);
        }, 60 * 1000); //1 min
        blurTimers.level2 = setTimeout(function () {
            ch.awayStatus(2)
        }, 5 * 60 * 1000); //10 min
        blurTimers.level3 = setTimeout(function () {
            ch.awayStatus(3)
        }, 30 * 60 * 1000); //30 min
        blurTimers.level4 = setTimeout(function () {
            ch.awayStatus(4)
        }, 60 * 60 * 1000); //60 min

    };
    cordova.plugins.backgroundMode.ondeactivate = function () {

        isFocus = true;
        curRoomSel('.messageinput').focus();
        setTitle(0);
        if (rooms[currentRoom])
            rooms[currentRoom]._newMessages = 0;
        clearTimeout(blurTimers.level1);
        clearTimeout(blurTimers.level2);
        clearTimeout(blurTimers.level3);
        clearTimeout(blurTimers.level4);
        ch.awayStatus(0)

    };
    
    $('.version-number').text(AppVersion.version);

}, false);

function initSounds() {
    // инициализируем звуки

    if(typeof Media == "undefined") {
        playSound = function(){};
        return false;
    }

    var sounds = {};
    sounds.personal = new Media('/android_asset/www/sounds/personal.mp3');
    sounds.message = new Media('/android_asset/www/sounds/message.mp3');

    playSound = function (name) {
        sounds[name].play();
    }
}

function initToolButtons() {

    setTimeout(function () {

        if (storage("sounds") == 'off') {
            soundEnable = false;
            $('#soundBtn').removeClass('fa-bell').addClass('fa-bell-slash');
        } else {
            soundEnable = true;
            $('#soundBtn').removeClass('fa-bell-slash').addClass('fa-bell');
        }

    }, 1000);

}

function bindings() {
    $('#tmenu').click(clickStatebtn2).mouseleave(clickStatebtn2);
    $('#notifBtn').click(clickNotifbtn);
    $('#smileBtn').click(mouseSmile1);
    $('#add-room-tab img').click(clickRoomsbtn);
    $('#smileblock').mouseleave(mouseSmile2);
    $('#overlay').click(hideForm);
    $('#privatemes').click(clickPrivatemes);
    $('.stateitem').click(clickStateitem);
    $('.smiletabs').click(function () {
        return false
    });
    $('.menu-button').click(function(){
        $('.main-menu').show();
        $('#chat-toolbar').show();
        $('#overlay').show();
    });
    $('.smiletabs div').click(clickSmiletab);

    for (var i in smiles[1]) {
        $('#smWrap').append('<img num="' + smiles[1][i] + '" src="' + imagesUrl + '/img/smiles/' + smiles[1][i] + '.gif" alt="" />');
    }

}

/********** SERVER CALLBACKS ************/

ch.response.onConnect = function () {

    $('.send').removeClass('disconnected');

    loadTemplates(function(){

        start();

        $('.reconnection-panel').hide();
        if (ch.autoLogin()) {
            //hideForm()
        } else {
            $('#cont').addClass('loaded');
            $('.is-loading').hide();
            showAuthWindow();
        }

    });

};
ch.response.onDisconnect = function () {
    $('.send').addClass('disconnected');
};
ch.response.onReconnecting = function (err, num) {
    // показывает попытки реконнекта
};
ch.response.onReconnect = function (err, num) {
    $('.send').removeClass('disconnected');
};
ch.response.onLogin = function (err, u) {
    if (!err) {
        user = u;
        curColor = u.textcolor;

        $('#chat-tabs li.litab').remove();
        $('#chat-rooms').html('');
        
        helloStr(u.nick);
        blockOverlay = false;
        hideForm();

        ch.joinRoom(currentRoom, reciveMessCount);

    } else if(err == 'another') {
        $('.replace-connect-panel').show();
        curRoomSel('.rp').html('');
        curRoomSel('.mp').html('');
    } else if(err == 'blocked'){
        curRoomSel('.rp').html('');
        curRoomSel('.mp').html(tpl('blockmes', {mess:u}));
    } else {
        if(u == 'alreadyauth')
            return alert('Под этой учетной записью уже авторизованы');

        if(u == 'wrongauth'){
            return alert('Неверный логин или пароль');
        }

        showAuthWindow();
        $('.is-loading').hide();
        //alert('Ошибка авторизации: ' + u);

    }
};
ch.response.onLogout = function (err, data) {
    showAuthWindow();
    blockOverlay = true;
};
ch.response.onJoinRoom = function (err, d, d2) {

    if (err == 'banned') {
        curRoomSel('.rp').html('');
        curRoomSel('mp').html(tpl('banmes', {time: Math.ceil(d / 60), reason: ''}));
        return false;
    }

    if(err)
        return false;

    $('#chat-tabs a.label').removeClass('active');
    $('#add-room-tab').before(tpl('roomtab', {name: d.name, capt: d.caption}));
    $('#chat-rooms').append(tpl('roompane', {name: d.name, type: 'room'}));
    $('.room-pane').hide();
    $('#room-' + d.name).show().find('.mpw').scroll(scrollPane);

    currentRoom = d.name;
    currentType = 'room';

    hideForm();
    clearUsers();
    fillUsers(d.users);

    startRoomLoads--;
    if (startRoomLoads == 0) {
        allRoomsLoaded();
    }

    rooms[currentRoom].autoScroll = true;
    rooms[currentRoom].tp = 'room';

};
ch.response.onAfterRoomJoin = function (err, d) {
    addTopic(d.topic, d.room);
    if (d.newmes > 0)
        addNotif(d.room, 'C момента ухода в комнате появилось <b>' + d.newmes + '</b> новых сообщений', '#0F9B14', true);
    $('#cont').addClass('loaded');
    $('.is-loading').hide();
};
ch.response.onChat = function (err, d) {
    if (!err) {
        if (d.room != currentRoom) {
            var span = $('#chat-tabs a[mid=' + d.room + '] span');
            var mcount = parseInt(span.html()) + 1;
            span.html(mcount).css('display', 'inline-block');
        }

        if(storage("bottle-hide") && d.text.indexOf('class="bottle-line"') > 0)
            return false;

        addMessage(d);
    } else {
        showNotificator('Ошибка отправки сообщения: ' + d, 2000);
    }
};
ch.response.onChatCorrect = function (err, d) {
    if (!err) {
        $('#' + d.mid + ' span:eq(1)').html(stripBB(d.newtext));
    } else {
        showNotificator('Ошибка исправления сообщения: ' + d, 2000);
    }
};
ch.response.onSetTopic = function (err, d) {
    if (!err) {
        addTopic(d.topic, d.room);
        hideForm();
    } else {
        showNotificator('Ошибка установки топика: ' + d, 2000);
    }
};
ch.response.onSetNick = function (err, d) {
    if (!err) {
        var oldnick = rooms[currentRoom]['users'][d.user].nick;
        roomSel('', '.rp table[user=' + d.user + '] .profnick').text(d.nick);
        addNotifInRooms(d.user, '<b>' + oldnick + '</b> изменил свой ник на: <b>' + d.nick + '</b>', '#0F419B');
        rooms[currentRoom]['users'][d.user].nick = d.nick;
        hideForm();
    } else {
        if (d == 'timeout') showNotificator('Нельзя менять ник чаще одного раза в неделю', 2000);
        if (d == 'wrongnick') showNotificator('Некорректный формат ника', 2000);
        if (d == 'busynick') showNotificator('Этот ник занят', 2000);
    }
};
ch.response.onUserJoined = function (err, d) {

    var isStopped = debouncer.stop(d.user);
    if(isStopped)
        return false;

    addUser(d.room, d.user, d.info);

    if (d.info.already)
        addNotif(d.room, '<b>' + d.info.nick + '</b> зашел в комнату с другого браузера или устройства', '#0F9B14');
    else
        addNotif(d.room, '<b>' + d.info.nick + '</b> зашел в комнату', '#0F9B14');

};
ch.response.onUserLeaved = function (err, d) {
    debouncer.start(d.user, d);
};
debouncer.onFinish(function(userLogin, d){
    addNotif(d.room, '<b>' + d.nick + '</b> покинул комнату', '#E70343');
    delUser(d.room, d.user);
});
ch.response.onGetProfile = function (err, d) {
    if (!err) {
        if (clickOnProf == 1)
            showMyProfileWindow(d.userdata, d.visible);
        else
            showUserProfileWindow(d.userdata);
    } else {
        if (d == 'notallowed') {
            showNotificator('Этот пользователь скрыл свой профиль', 2000)
        } else showNotificator('Ошибка получения профиля: ' + d, 2000);
    }
};
ch.response.onSetProfile = function (err, d) {
    if (!err) {
        hideForm();
    } else {
        showNotificator('Ошибка установки профиля: ' + d, 2000);
    }
};
ch.response.onSetAvatar = function (err, d) {

    if (d.user == user.login)
        $('#newavaimg').attr('src', imagesUrl + d.url);

    roomSel('', '.rp table[user=' + d.user + '] .profava').attr('src', imagesUrl + d.url);
    hideForm();
    addNotifInRooms(d.user, '<b>' + d.nick + '</b> обновил аватарку', '#0F419B');

};
ch.response.onEraseMessage = function (err, d) {
    $('#' + d.mid).html('<span class="deletedmes">[ Сообщение удалено ]</span>');
};
ch.response.onSetStatus = function (err, d) {
    if (!err) {
        roomSel('', '.rp table[user=' + d.user + '] .ustatus').text(d.text);
        addNotifInRooms(d.user, '<b>' + d.nick + '</b> изменил статусный текст на: <b>' + d.text + '</b>', '#0F419B');
        hideForm();
    } else {
        showNotificator('Ошибка установки статуса: ' + d, 2000);
    }
};
ch.response.onSetState = function (err, d) {
    if (!err) {
        roomSel('', '.rp table[user=' + d.user + '] .stateSign').attr('src', 'img/' + states[d.val]);
        roomSel('', '.rp table[user=' + d.user + '] .statetxt').html(statesT[d.val]);
        addNotifInRooms(d.user, '<b>' + d.nick + '</b> изменил статус на: <b>' + statesT[d.val] + '</b>', '#0F419B');
    } else {
        showNotificator('Ошибка установки состояния: ' + d, 2000);
    }
};
ch.response.onAwayStatus = function (err, data) {
    roomSel('', '.rp table[user=' + data.user + '] .awaystatus').html(awayStatuses[data.val]);
};
ch.response.onSaveRating = function (err, d) {
    if (!err) {
        showNotificator('Ваш голос учтен!', 3000);
    } else {
        if (d == 'alreadyvoted') {
            showNotificator('Вы уже проголосовали за эту картинку', 3000);
        } else if (d == 'isowner') {
            showNotificator('Нельзя голосовать за свою картинку', 3000);
        } else {
            alert(d);
        }
    }
};
ch.response.onKick = function (err, d) {
    if (!err) {
        if (d.isMe) {
            roomSel(d.room, '.rp').html('');
            roomSel(d.room, '.mp').html(tpl('kickmes'));
        } else {
            addNotif(d.room, '<b>' + d.nick + '</b> был выпнут из комнаты', '#0F419B');
            delUser(d.room, d.user);
        }
    } else {
        showNotificator('Ошибка при попытке кикнуть: ' + d, 2000);
    }
};
ch.response.onSetBan = function (err, d) {
    if (!err) {
        if (d.isMe) {
            curRoomSel('.rp').html('');
            curRoomSel('.mp').html(tpl('banmes', {time: d.time, reason: d.reason}));
        } else {
            addNotif(d.room, '<b>' + d.nick + '</b> забанен на <b>' + d.time + ' минут</b> по причине: ' + d.reason, 'red');
            delUser(d.room, d.user);
        }
    } else {
        showNotificator('Ошибка при попытке кикнуть: ' + d, 2000);
    }
};
ch.response.onRoomlist = function (err, d) {
    if (!err) {
        var htmllist = '';
        for (var i in d.rooms) {
            htmllist += '<p><a href="' + i + '" class="room-link">' + d.rooms[i].caption + '</a> (Участников: ' + d.rooms[i].userscount + ')<br><span>' + d.rooms[i].topic + '</span></p>';
        }
        var form = tpl('roomlist', {list: htmllist});
        showForm(form, 'Список комнат');
    } else {
        showNotificator('Ошибка получения списка комнат: ' + d, 2000);
    }
};
ch.response.onCreateroom = function (err, d) {
    if (!err) {
        ch.joinRoom(d.name, reciveMessCount);
        hideForm();
    } else {
        showNotificator('Ошибка получения списка комнат: ' + d, 2000);
    }
};
ch.response.onLeaveroom = function (err, d) {
    if (!err) {
        $('#room-' + d.room).remove();
        $('#chat-tabs a[mid=' + d.room + ']').parent().remove();
        var ss = $('.room-pane').last().attr('id');
        if (!ss)
            return false;
        var roomName = ss.split('-')[1];
        $('#chat-tabs a[mid=' + roomName + ']').trigger('click')
    } else {
        showNotificator('Ошибка выхода из комнаты: ' + d, 2000);
    }
};
ch.response.onChatHist = function (err, d) {
    if (!err) {
        addMessageHist(d);
    } else {
        showNotificator('Ошибка получения истории: ' + d, 2000);
    }
};
ch.response.onGetMessages = function (err, d) {
    if (!err) {
        addPmTab(d.friend);
    } else {
        showNotificator('onGetMessages: ' + d, 2000);
    }
};
ch.response.onPM = function (err, d) {
    if (!err) {

        if (d.fromHistory) {
            addMessage(d);
        } else {

            if ($('#pm-' + d.room).length > 0) {

                if (d.room != currentRoom) {
                    var span = $('#chat-tabs a[mid=' + d.room + '] span');
                    var mcount = parseInt(span.html()) + 1;
                    span.html(mcount).css('display', 'inline-block');
                }

                addMessage(d);
            } else {
                showNotifMessage('Личное сообщение от ' + d.nick, d.text, 'img/notificon.png');
                ch.getMessages(d.room, 30);
            }

        }


    } else {
        showNotificator('onPM: ' + d, 2000);
    }
};


/********** LIVE CLICKS ************/

$('.send-text').live('click', clickSendmess);
$('.send-file').live('click', clickSendImage);
$('.messageinput').live('keydown', keyInputmessDown).live('keyup', keyInputmessUp);
$('.image-close').live('click', function () {
    $(this).parents('span').html('<span class="deletedmes">Картинка скрыта</span>');
});
$('.change-nick').live('click', function () {
    var form = tpl('newnick', {txt: user.nick});
    showForm(form, 'Изменить ник');
    $('#newnick_but').click(function () {
        ch.setNick($('#newnicktext').val());
    });
    return false;
});

$('.pic-block').live('mouseenter', function () {
    $(this).find('.image-close').fadeIn(200);
}).live('mouseleave', function () {
    $(this).find('.image-close').fadeOut(200);
});


$('.usmenu').live('click', function () {
    var pr = $(this).attr('priv');
    var targUser = $(this).parents('.user').attr('user');
    $('.umenucont').remove();
    var grid = privGrid(pr, rooms[currentRoom].users[user.login].commonPriv); //1
    var form = $('<div class="umenucont"></div>');
    form.hide();
    for (var i = 0; i < grid.length; i++) {
        form.append('<div act="' + grid[i] + '">' + umItems[grid[i]] + '</div>');
    }
    form.append('<div act="0">Личное сообщение</div>');

    form.children().click(function () {
        $(this).parent().hide();
        uMenuAction($(this).attr('act') * 1, $(this).parents('.user').attr('user'));
    });

    $(this).parent().parent().after(form);
    form.fadeIn(200);
});
$('.umenucont').live('mouseleave', function () {
    $(this).hide();
});

$('.profava').live('click', function(){

    var to = $(this).attr('nn');
    var toSrc = $(this).attr('src');

    //if(user.nick == to)
    //    return false;

    var inp = curRoomSel('.messageinput');
    var labels = curRoomSel('.message-form li.label-item');
    var container = curRoomSel('.message-form');

    inp.focus();

    var arr = [];
    labels.each(function(){
        arr.push($(this).find('img').attr('data-nick'));
    });

    if(arr.indexOf(to) > -1 || arr.length == 3) {
        $('.main-menu').hide();
        hideForm();
        return false;
    }

    var elem = $('<li class="label-item"><img class="nick-icon" src="" alt=""></li>');
    elem
        .find('img')
        .attr('src', toSrc)
        .attr('data-nick', to);
    container.prepend(elem);
    elem.click(function(){
        $(this).remove();
        inp.focus();
    });

    $('.main-menu').hide();
    hideForm();

});

$('#smWrap img').live('click', function () {
    curRoomSel('.messageinput').val(curRoomSel('.messageinput').val() + ' *smile' + $(this).attr('num') + '* ');
    hideForm();
});
$('.close-form img').live('click', function () {
    hideForm();
});
$('div.profnick').live('click', nickClick);
$('input[fastaction]').live('keydown', function (e) {
    if (e.keyCode == 13) {
        var elemId = $(this).attr('fastaction');
        $('#' + elemId).trigger('click');
    }
});
$('#create-room').live('click', function () {
    hideForm();
    showForm(tpl('roomcreate', {}), 'Создание новой комнаты');
    return false;
});
$('#cr-create').live('click', function () {
    var capt = $('#cr-caption').val();
    if (capt == '') {
        alert('Введите название комнаты!');
        return false;
    }
    var name = translite(capt);
    var topic = $('#cr-topic').val();
    var hidden = $('#cr-hidden').prop("checked");
    ch.createRoom(name, capt, topic, hidden);
});
$('a.room-link').live('click', function () {
    var roomName = $(this).attr('href');
    ch.joinRoom(roomName, reciveMessCount);
    return false;
});
$('#chat-tabs a.label').live('click', function () {
    // кликаем по вкладке комнаты
    var roomName = $(this).attr('mid');
    setCurrentTab(roomName);
    return false;
}).live('mousedown', function (e) {
    // правая кнопка по вкладке
    if (e.button == 2) {
        var roomName = $(this).attr('mid');
        var capt = rooms[roomName].caption;
        var link = prompt('Ссылка на эту комнату', '[room=' + roomName + ']' + capt + '[/room]');
        if (link == null) link = '';
        var rsl = curRoomSel('.messageinput');
        rsl.val(rsl.val() + link);
        return false;
    }
});
$('#chat-tabs .litab img.close').live('click', function () {
    // Закрываем вкладку комнаты
    var roomName = $(this).parent().find('a').attr('mid');
    if ($('.room-pane').length == 1) {
        showNotificator('Нельзя закрыть последнюю комнату', 2000);
    } else {
        ch.leaveRoom(roomName);
    }
    return false;
});
$('#chat-tabs .pmtab img.close').live('click', function () {
    // Закрываем вкладку личных сообщений
    var roomName = $(this).parent().find('a').attr('mid');
    $('#pm-' + roomName).remove();
    $('#chat-tabs a[mid=' + roomName + ']').parent().remove();
    var ss = $('.room-pane').last().attr('id');
    roomName = ss.split('-')[1];
    $('#chat-tabs a[mid=' + roomName + ']').trigger('click')
    return false;
});
$('.more-history').live('click', function () {
    // получаем историю
    var rid = $(this).parents('.room-pane').attr('id');
    var skip = curRoomSel('.msg dda span.label').length;
    ch.getHistory(rid.split('-')[1], skip, hisoryLimit);
});

var oldHeight = $(window).height();
$(window).resize(function() {
    if($(window).height() < oldHeight)
        toBottom();
});

$(document).on('click', '.to-back', function () {
    $('.main-menu').hide();
    $('#chat-toolbar').hide();
    hideForm();
});
$(document).on('click', '#stateBtn', clickStatebtn);
$(document).on('click', '#statusBtn', clickStatusbtn);
$(document).on('click', '#soundBtn', clickSoundbtn);
$(document).on('click', '#selectTheme', clickSelectTheme);
$(document).on('click', '.to-logout', clickLogout);
$(document).on('click', '.to-profile', clickProfile);
$(document).on('click', '.change-avatar', clickSetava);
$(document).on('click', '.theme-link-item', clickThemeItem);

$(document).on('click', '#auth-social', function(e) {
    authLock.show();
    return false;
});

/********** INTERFACE EVENTS ************/
function clickLogout() {
    hideForm();
    ch.logOut();
    return false;
}
function clickProfile() {
    hideForm();
    clickOnProf = 1;
    ch.getProfile(user.login);
    return false;
}
function clickSetava() {
    var form = tpl('setava', {src: imagesUrl + user.avasrc});
    showForm(form, 'Установка аватарки');
    var ifile = document.getElementById('ava-select');
    ifile.onclick = function () {

        navigator.camera.getPicture(function(imageURI) {
            var uri = "data:image/jpeg;base64," + imageURI;
            uplAvatar(uri);
            $('#avalabel').html('Загружается...');
        }, function(message) {
            console.log('CAMERA Failed because: ' + message);
        }, {
            quality: 60,
            destinationType: 0, // DATA_URL
            sourceType: 0       // Library
        });

    };

    return false;
}
function mouseSmile1() {
    $('#smileblock').show();
    $('#overlay').show();
}
function mouseSmile2() {
    hideForm();
}
function clickSmiletab() {
    var tab = $(this).attr('tab') * 1;
    var sm = smiles[tab];
    $('#smWrap').html('');
    for (var i in sm) {
        $('#smWrap').append('<img num="' + sm[i] + '" src="' + imagesUrl + '/img/smiles/' + sm[i] + '.gif" alt="" />');
    }
}
function clickStatusbtn() {
    $('.main-menu').hide();
    showForm(tpl('status'), 'Мой статусный текст');
    $('#status_but').click(function () {
        ch.setStatus($('#newstatustext').val());
    });
}

function designThemeUpdate(name) {
    if(name) {
        localStorage.setItem('designTheme', name);
    } else {
        name = localStorage.getItem('designTheme') || 'default';
    }
    $('.my-styles').attr('href', 'theme/theme-' + name + '.css');
}

function clickRoomsbtn() {
    ch.getRoomslist();
}
function topicChange() {
    var form = tpl('topic', {txt: rooms[currentRoom].topic});
    showForm(form, 'Изменить топик');
    $('#topic_but').click(function () {
        ch.setTopic($('#topictext').val(), currentRoom);
    });
}
function clickStatebtn() {
    $('.main-menu').hide();
    $('#tmenu').show();
    $('#overlay').show();
}
function clickStatebtn2() {
    hideForm();
}
function clickStateitem() {
    var v = $(this).attr('val') * 1;
    if (curState != v) {
        curState = v;
        ch.setState(curState);
    }
}
function clickSendmess(){
    var t = curRoomSel('.messageinput').val();

    if($.trim(t) == '')
        return false;

    mhist.old = t;

    var labels = curRoomSel('.message-form li.label-item');
    labels.each(function(){
        var label = $(this).find('img').attr('data-nick');
        t = label + ': ' + t;
    });

    if(currentType == 'room'){

        if(t == '!бутылка игнор') {
            storage("bottle-hide", true);
            curRoomSel('.messageinput').val('');
            return showNotificator('Теперь вы не будете получать уведомления от бутылки', 3000);
        } else if (t == '!бутылка вернись') {
            storage("bottle-hide", false);
            curRoomSel('.messageinput').val('');
            return showNotificator('Бутылка вернулась!', 3000);
        }

        ch.chat(t, currentRoom, curColor, correctLatMess);
    } else {
        ch.sendMessage(t, currentRoom, curColor);
    }
    curRoomSel('.messageinput').val('').css('backgroundColor','transparent');
    correctLatMess = false;
}
function clickSendImage() {

    navigator.camera.getPicture(function(imageURI) {
        var uri = "data:image/jpeg;base64," + imageURI;
        uploadImage(uri);
    }, function(message) {
        console.log('CAMERA Failed because: ' + message);
    }, {
        quality: 60,
        destinationType: 0, // DATA_URL
        sourceType: 0       // Library
    });

}
function keyInputmessDown(event) {
    if (event.keyCode == 13) { // enter
        clickSendmess();
        return false;
    }
}
function keyInputmessUp(event) {
    if($(this).val()) {
        $('.send-text').show();
        $('.send-file').hide();
    } else {
        $('.send-text').hide();
        $('.send-file').show();
    }
}

function clickSoundbtn() {
    if (soundEnable) {
        soundEnable = false;
        $(this).removeClass('fa-bell').addClass('fa-bell-slash');
        storage("sounds", 'off');
    } else {
        soundEnable = true;
        $(this).removeClass('fa-bell-slash').addClass('fa-bell');
        storage("sounds", 'on');
    }
}
function clickNotifbtn() {


}
function clickSelectTheme() {
    $('.main-menu').hide();
    showForm(tpl('changetheme'), 'Выбор темы оформления');
}
function clickThemeItem() {
    var theme = $(this).attr('data-theme');
    hideForm();
    designThemeUpdate(theme);
    return false;
}

function nickClick() {
    $('.main-menu').hide();
    var cluser = $(this).parents('.user').attr('user');
    clickOnProf = 2;
    ch.getProfile(cluser);
}
function clickPrivatemes() {
    alert('Личные сообщения пока не работают');
    return false;
}


/********** MENU ACTIONS ************/
function showModerWindow(v) {
    var form;
    if (v == 1) {
        form = '/* функционал не реализован */';
        showForm(form, 'Список забаненых');
    }
    if (v == 2) {
        form = '/* функционал не реализован */';
        showForm(form, 'Зарегистрировать юзера');
    }
    if (v == 3) {
        // сменить топик комнаты
        topicChange();
    }
}

var openPM = function (user) {
    if (!user)
        return console.log('Укажите login пользователя');
    ch.getMessages(user, 30);
};

function uMenuAction(val, user) {
    if (val == 0) { // Личное сообщение
        ch.getMessages(user, 30);
    }
    if (val == 1) { //сделать админом сервера
        alert('Функционал не реализован');
        //socket.json.send({'type':'globprivilege', 'priv':1, 'user':user});
    }
    if (val == 2) { //сделать обычным юзером сервера
        alert('Функционал не реализован');
        //socket.json.send({'type':'globprivilege', 'priv':2, 'user':user});
    }
    if (val == 3) { // сделать модером комнаты
        alert('Функционал не реализован');
    }
    if (val == 4) { // расжаловать модера
        alert('Функционал не реализован');
    }
    if (val == 5) { // Забанить
        showForm(tpl('ban'), 'Забанить ' + user);
        $('#banBtn').click(function () {
            ch.setBan($('#bantime').val(), $('#banreason').val(), user, currentRoom);
            hideForm();
        });
    }
    if (val == 6) { // Кикнуть
        ch.kick(user, currentRoom);
    }
    if (val == 7) { // Лишить голоса
        alert('Функционал не реализован');
        return false;
        showForm(tpl('novoice'), 'Лишить голоса ' + user);
        $('#voicereason').focus();
        $('#voiBtn').click(function () {
            hideForm();
            //socket.json.send({'type':'voiceoff', 'time':$('#voicetime').val(), 'reason':$('#voicereason').val(), 'user':user});
        });
    }
    if (val == 8) { // Вернуть голос
        alert('Функционал не реализован');
        //socket.json.send({'type':'voiceon', 'user':user});
    }
}

/********** ADDITION FUNCTIONS ************/

function setTitle(count) {
    if (count) {
        $('title').text('[' + count + '] ' + titleDefault);
    } else {
        $('title').text(titleDefault);
    }
}

function tpl(tname, variables) {
    var template = templates[tname];
    console.log('>>', tname);
    return template.replace(new RegExp('\{(.*?)\}', 'g'), function (a, b) {
        return isset(variables[b]) ? variables[b] : '';
    });
}
function scrollPane() {
    // block auto scrolling
    var rid = $(this).parents('.room-pane').attr('id');
    var roomName = rid.split('-')[1];
    rooms[roomName].autoScroll = (this.offsetHeight + this.scrollTop >= this.scrollHeight);
};
function showForm(s, capt, addClass) {
    var elem = $('#alert');
    elem.html('<div class="close-form"><img title="Закрыть" src="img/close-form.png" alt="" /></div><h1>' + capt + '</h1> ' + s);
    if(addClass)
        elem.addClass(addClass);
    else
        elem.removeAttr('class');
    elem.show();
    $('#overlay').show();
}
function hideForm() {
    if (blockOverlay) return false;
    $('#alert').hide();
    $('#overlay').hide();
    $('#tmenu').hide();
    $('.main-menu').hide();
    $('#smileblock').hide();
    //curRoomSel('.messageinput').focus();
}
function curRoomSel(sel) {
    return $('#' + currentType + '-' + currentRoom).find(sel);
}
function roomSel(room, sel) {
    if (room == '') {
        return $('.room-pane').find(sel);
    } else {
        return $('#' + currentType + '-' + room).find(sel);
    }
}
function moveTab(name) {
    var elem = $('#chat-tabs a[mid=' + name + ']').parent().detach();
    $('#chat-tabs').prepend(elem);
}
function allRoomsLoaded() {

    // когда все комнаты загрузились

    var cookr = storage('rooms');
    if (cookr != null) {
        var rms = cookr.split('|');
        delete rms[rms.length];
        for (var i = 0; i < rms.length - 1; i++) {
            //ch.joinRoom(rms[i], reciveMessCount);
            //startRoomLoads++;
        }

        //setCurrentTab(rms[rms.length-1]);
    }


}
function addPmTab(friend) {

    var usr = friend.login;
    var ssr = {};
    ssr[user.login] = user;
    ssr[usr] = friend;

    if ($('#pm-' + usr).length > 0) {
        setCurrentTab(usr);
        return false;
    }

    $('#chat-tabs a.label').removeClass('active');
    $('#add-room-tab').before(tpl('pmtab', {name: usr, capt: '@' + ch.getNick(usr)}))
    $('#chat-rooms').append(tpl('roompane', {name: usr, type: 'pm'}));
    $('.room-pane').hide();
    $('#pm-' + usr).show().find('.mpw').scroll(scrollPane);
    currentRoom = usr;
    currentType = 'pm';
    rooms[usr] = {
        'tp': 'pm',
        'users': ssr,
        'autoScroll': true
    };

    roomSel(usr, '.rp').append(getUserItemHTML(usr, friend['nick'], friend['avaurl'], friend['statustext'], 0, friend['state'], '', true));
    roomSel(usr, '.rp').append(getUserItemHTML(usr, user['nick'], user['avasrc'], user['statustext'], 0, user['state'], '', true));

}
function setCurrentTab(name) {

    var tab = $('#chat-tabs a[mid=' + name + ']');
    currentType = tab.attr('typ');

    $('.room-pane').hide();
    $('#' + currentType + '-' + name).show();
    $('#chat-tabs a.label').removeClass('active');

    tab.addClass('active').find('span').html('0').hide();
    currentRoom = name;
    $('.pic-block').css('height', 'auto');
    toBottom();
}
function uplAvatar(data) {

    ch.setAvatar(data, function (result) {
        if (!result) {
            $('#avalabel').html('Ошибка загрузки');
            return showNotificator('Ошибка установки аватарки: ' + result.reason, 3000);
        }
    });

}
function uploadImage(data) {

    blockInputWhenLoading(true);

    ch.uploadImage(data, function (result) {
        blockInputWhenLoading(false);
        if (!result)
            return showNotificator('Ошибка загрузки: ' + result.reason, 3000);
        ch.chat('uploadimage|'+result.urlImage+'|'+result.urlThumb, currentRoom, curColor);
    });

}
function blockInputWhenLoading(state){
    if(state) {
        $('.messageinput').prop("disabled", true).attr('placeholder', 'Загрузка картинки...');
        $('.send-file').removeClass('fa-paperclip').addClass('fa-spinner fa-spin');
    } else {
        $('.messageinput').prop("disabled", false).attr('placeholder', 'Сообщение...');
        $('.send-file').removeClass('fa-spinner fa-spin').addClass('fa-paperclip');
    }
}

function helloStr(nick) {
    $('#hello').html(tpl('hello', {n: nick}));
}
function showUserProfileWindow(udat) {
    showForm(tpl('userprof'), 'Профиль ' + udat['nickname']);
    var selector;
    for (var us in udat) {
        selector = '#vw_' + us;
        if (selector == '#vw_gender') udat[us] = gender[udat[us]];
        $(selector).html(urlReplace(udat[us]));
    }
}

function showMyProfileWindow(udat, vis) {
    showForm(tpl('myprof'), 'Мой профиль');
    for (var us in udat) {
        $('#pr_' + us).val(udat[us]);
    }
    if (isset(udat['birthday'])) {
        $('#pr_birthday').val(date('m/d/Y', udat['birthday']));
    }
    $('#pr_vis').val(vis);
    //$('#pr_birthday').simpleDatepicker({chosendate: '01/01/1995', startdate: '01/01/1970', enddate: '01/01/2005'});
    $('#prof_save').click(function () {
        var dat = {};
        if ($('#pr_gender').val() != '') dat['gender'] = $('#pr_gender').val();
        // if ($('#pr_birthday').val() != '') dat['birthday'] = parseDT($('#pr_birthday').val());
        if ($('#pr_realname').val() != '') dat['realname'] = $('#pr_realname').val();
        if ($('#pr_country').val() != '') dat['country'] = $('#pr_country').val();
        if ($('#pr_email').val() != '') dat['email'] = $('#pr_email').val();
        if ($('#pr_homepage').val() != '') dat['homepage'] = $('#pr_homepage').val();
        if ($('#pr_phone').val() != '') dat['phone'] = $('#pr_phone').val();
        if ($('#pr_vk').val() != '') dat['vk'] = $('#pr_vk').val();
        ch.setProfile(user.login, dat, $('#pr_vis').val());
    });
}
function addMessage(m) {
    var mObj;
    var typ = m.pm ? 'pm' : 'room';

    if (!isset(m.mid)) m.mid = '';
    if (m.text == '' || !isset(m.text)) return false;
    if (!isset(m.date)) m.date = time();
    m = messageAfterProc(m);
    if (m.isBot) {
        mObj = $('<dd class="bot">' + m.text + '</dd>');
    } else {
        m.text = '<span style="color:#' + m.color + '">' + m.text + '</span>';
        var _dt = date('H:i', m.date);
        var _dd = '<span class="label">' + m.nick + ':</span> ' + m.text;
        mObj = $('<div class="msg" id="' + m.mid + '"><dt>' + _dt + '</dt><dda>' + _dd + '</dda></div>');
    }
    $('#' + typ + '-' + m.room).find('.mp').append(mObj);
    toBottom();

    $("img.inlinepic", mObj).bindImageLoad(function () {
        $(this).parent().parent().height($(this).height());
        toBottom();
    });
    return true;
}
function addMessageHist(m) {
    var mObj;
    var typ = m.pm ? 'pm' : 'room';
    if (!isset(m.mid)) m.mid = '';
    if (m.text == '' || !isset(m.text)) return false;
    if (!isset(m.date)) m.date = time();
    m = messageAfterProc(m);

    m.text = '<span style="color:#' + m.color + '">' + m.text + '</span>';
    var _dt = date('H:i', m.date);
    var _dd = '<span class="label">' + m.nick + ':</span> ' + m.text;
    mObj = $('<div class="msg" id="' + m.mid + '"><dt>' + _dt + '</dt><dda>' + _dd + '</dda></div>');

    $('#' + typ + '-' + m.room).find('.mp .more-history').after(mObj);
    return true;
}
function addNotif(room, mes, color, silens) {
    roomSel(room, '.mp').append('<dt>' + date('H:i', time()) + '</dt><dd class="notif" style="color:' + color + '">' + mes + '</dd>');
    toBottom();
}
function addNotifInRooms(user, mes, color) {
    $('.rp table[user=' + user + ']').parents('.room-pane').find('.mp').append('<dt>' + date('H:i', time()) + '</dt><dd class="notif" style="color:' + color + '">' + mes + '</dd>');
    toBottom();
}
function addTopic(mes, room) {
    roomSel(room, '.mp').append('<dd class="topic">*** ' + mes + ' ***</dd>');
    $('#topicplace').find('span').html(mes);
    toBottom();
}
function showNotificator(mes, time) {
    $('#notificat').html(mes).fadeIn();
    setTimeout(function () {
        $('#notificat').fadeOut();
    }, time);
}
function toBottom() {
    var pan = document.querySelector('#room-' + currentRoom + ' .mpw') || document.querySelector('#pm-' + currentRoom + ' .mpw');
    if (!pan)
        return false;
    if (rooms[currentRoom].autoScroll) pan.scrollTop = pan.scrollHeight;

}
function getUserItemHTML(name, nick, avaurl, status, priv, state, awstatus, pm) {

    if (pm) {
        return tpl('useritempm', {
            name: name,
            url: imagesUrl + avaurl,
            n: nick,
            st: status,
            states: states[state],
            statest: statesT[state]
        });
    } else {
        return tpl('useritem', {
            name: name,
            url: imagesUrl + avaurl,
            pt: privasT[priv],
            p: privas[priv],
            priv: priv,
            n: nick,
            st: status,
            states: states[state],
            statest: statesT[state],
            awstatus: awayStatuses[awstatus]
        });
    }
}
function addUser(room, name, uobj) {
    var utable = roomSel(room, '.rp table[user=' + name + ']');
    if (utable.length > 0) {
        utable.remove();
    }
    roomSel(room, '.rp').append(getUserItemHTML(name, uobj['nick'], uobj['avaurl'], uobj['statustext'], uobj['commonPriv'], uobj['state'], uobj['awayStatus']));
    roomSel(room, '.rp table[user=' + name + ']').slideDown();
}
function delUser(room, name) {
    //delete rooms[currentRoom]['users'][name];
    roomSel(room, '.rp table[user=' + name + ']').slideUp(function () {
        $(this).remove()
    });
}
function clearUsers() {
    curRoomSel('.rp').html('');
    curRoomSel('.mp dd').html('');
}
function fillUsers(usr) {
    for (var key in usr) {
        curRoomSel('.rp').append(getUserItemHTML(key, usr[key]['nick'], usr[key]['avaurl'], usr[key]['statustext'], usr[key]['commonPriv'], usr[key]['state'], usr[key]['awayStatus']));
    }
    $('div.profnick').click(nickClick);
    $('.user[user=' + user.login + '] .usmenu').hide();
}
function showNotifMessage(capt, mes, userpic) {

    if(typeof cordova == 'undefined')
        return false;

    if(!cordova.plugins.backgroundMode.isActive())
        return false;

    cordova.plugins.notification.local.schedule({
        id: 10,
        title: capt,
        text: strip_tags(stripBB(mes)),
        icon: imagesUrl + userpic
    });

}
function privGrid(a, b) {
    if (a == 2 && b == 1) return [1, 4, 5, 6, 7];
    if (a == 3 && b == 1) return [1, 5, 6, 7];
    if (a == 4 && b == 1) return [1, 3, 5, 6, 7];
    if (a == 5 && b == 1) return [5, 6, 8];
    if (a == 2 && b == 2) return [4, 5, 6, 7];
    if (a == 4 && b == 2) return [5, 6, 7];
    if (a == 5 && b == 2) return [5, 6, 8];
    if (a == 2 && b == 3) return [4, 5, 6, 7];
    if (a == 4 && b == 3) return [3, 5, 6, 7];
    if (a == 5 && b == 3) return [5, 6, 8];
    return [];
}

/********** AUTHENTICATION AND REGISTRATION ************/

function showAuthWindow() {
    showForm(tpl('auth', {version: AppVersion.version}), 'Авторизация', 'reg-alert');
    $('#auth_but').click(function () {
        var login = $('#auth_login').val();
        var pass = $('#auth_pass').val();
        ch.login(login, pass);
    });
}

/********** MESSAGE AFTER RECIVE ************/

function messageAfterProc(s) {

    if (!s.isBot) {
        var uplRegexp = /^uploadimage\|([a-z0-9_:.\/]+)\|([a-z0-9_:.\/]+)$/i;
        if (uplRegexp.test(s.text)) {
            s.text.replace(uplRegexp, function (a, b, c) {
                s.text = tpl('image', {url1: imagesUrl + c, url2: imagesUrl + b});
            });
        } else {
            s.text = s.text.replace(new RegExp('(https?://)([-a-zA-Zа-яА-Я0-9@:;%!_\+.,~#?&//=/(/)]+)', 'gi'), function (link) {

                if (/\.(jpg|jpeg|gif|png)\??.*$/i.test(link)) { // image
                    return tpl('image', {url1: link, url2: link});
                } else {	// simple link
                    return '<a href="' + link + '" target="_blank">' + link + '</a>';
                }

            });
        }
    }

    /* nl2br */
    s.text = s.text.replace(/([^>])\n/g, '$1<br />');

    // обращение по нику
    if (!s.fromHistory) {

        var userpic = '';
        var usernick = '';
        var rusr = rooms[s.room].users[s.user];
        if (isset(rusr)) {
            userpic = rusr.avaurl;
            usernick = rusr.nick;
        }

        if (s.text.match(user.nick + ':')) {
            s.text = '<span class="for-you">' + s.text + '</span>';
            //playSound('personal', true);
            showNotifMessage('Вам написал ' + usernick, s.text, userpic);
        } else {
            if (s.user != user.login) {
                var place = s.pm ? 'ЛС' : rooms[s.room].caption;
                if(soundEnable)
                    playSound('message');
            }
        }

        if (!isFocus) {
            rooms[s.room]._newMessages = isset(rooms[s.room]._newMessages) ? rooms[s.room]._newMessages + 1 : 1;
            setTitle(rooms[s.room]._newMessages);
        }

    }

    // смайлы
    s.text = s.text.replace(/\*smile(\d+)\*/gm, function (a, b) {
        return '<img src="' + imagesUrl + '/img/smiles/' + b + '.gif" alt="" />';
    });

    s.text = BBproc(s.text);

    return s;
}
