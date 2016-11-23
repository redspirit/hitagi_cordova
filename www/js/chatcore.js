var states = [], statesT = [], privas = [], privasT = [], umItems = [];
var blockOverlay = true, clickOnProf = 0, currentType = 'room';
var soundEnable, notifEnable, playSound, imaga, blockHide = true;
var imageReader = new FileReader();
var user, rooms = {}, vkmid, curColor, isFocus = true, startRoomLoads = 0;
var isNotif, curState, reciveMessCount = 30, hisoryLimit = 50;
var mhist = {cur: '', old: ''}, correctLatMess = false;
var titleDefault = 'Аниме чат Hitagi';
var imagesUrl = 'http://chat.aniavatars.com';
var blurTimers = {};

/********** START APPLICATION ************/

function start() {
    VK.init({apiId: VKAPIID});
    createElements();
    bindings();
    initToolButtons();
};

function createElements() {
    // создаем меню со статусами
    for (var i = 0; i < statesT.length; ++i) {
        $('#tmenu').append(tpl('statusitem', {s1: states[i], s2: statesT[i], n: i}));
    }
}

// function initSounds() {
//     // инициализируем звуки
//
//     var sounds = {};
//
//     sounds.message = new Howl({
//         urls: ['sounds/in.mp3', 'sounds/in.ogg']
//     });
//     sounds.notif = new Howl({
//         urls: ['sounds/out.mp3', 'sounds/out.ogg']
//     });
//     sounds.foryou = new Howl({
//         urls: ['sounds/foryou.mp3', 'sounds/foryou.ogg']
//     });
//
//     playSound = function (s, p) {
//         if (isset(p)) {
//             if (p) sounds[s].play();
//         } else {
//             if (soundEnable)
//                 sounds[s].play();
//         }
//     }
// }

playSound = function () {};

function initToolButtons() {
    isNotif = "Notification" in window;
    if (cookie("sounds") == 'off') {
        soundEnable = false;
        $('#soundBtn').css('backgroundImage', 'url(img/soundoff.png)');
    } else {
        soundEnable = true;
        $('#soundBtn').css('backgroundImage', 'url(img/soundon.png)');
    }
    if (cookie("notifs") == 'on') {
        notifEnable = true;
        $('#notifBtn').css('backgroundImage', 'url(img/notifon.png)');
    } else {
        notifEnable = false;
        $('#notifBtn').css('backgroundImage', 'url(img/notifoff.png)');
    }
}

function bindings() {
    $('#logout_btn').click(clickLogout);
    $('#profile_btn').click(clickProfile);
    $('#setava').click(clickSetava);
    $('#statusBtn').click(clickStatusbtn);
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
    $('.smiletabs').click(function () {
        return false
    });
    $('.smiletabs div').click(clickSmiletab);
    $(window).focus(function () {
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
    }).blur(function () {
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

    });
    for (var i in smiles[1]) {
        $('#smWrap').append('<img num="' + smiles[1][i] + '" src="img/smiles/' + smiles[1][i] + '.gif" alt="" />');
    }

    $(window).bind("beforeunload", function () {
        saveTabs();
    })

}

setTimeout(start, 200);

/********** SERVER CALLBACKS ************/

ch.response.onConnect = function () {

    $('.reconnection-panel').hide();
    if (ch.autoLogin()) {
        //hideForm()
    } else {
        $('#cont').addClass('loaded');
        $('.is-loading').hide();
        showAuthWindow();
    }
};
ch.response.onDisconnect = function () {
    $('.reconnection-panel').show();
    $('#reconnecting-trying').text(0);
};
ch.response.onReconnecting = function (err, num) {
    $('#reconnecting-trying').text(num);
};
ch.response.onReconnect = function (err, num) {
    $('.reconnection-panel').hide();
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

    } else if (err == 'blocked') {
        curRoomSel('.rp').html('');
        curRoomSel('.mp').html(tpl('blockmes', {mess: u}));
    } else {
        if (u == 'alreadyauth') alert('Под этой учетной записью уже авторизованы');
        if (u == 'wrongauth') {
            alert('Неверный логин или пароль');
            showAuthWindow();
        }
        if (u == 'wronghash') {
            showAuthWindow();
        }
    }
};
ch.response.onLogout = function (err, data) {
    showAuthWindow();
    blockOverlay = true;
};
ch.response.onJoinRoom = function (err, d, d2) {
    if (!err) {

        $('#chat-tabs a.label').removeClass('active');
        $('#add-room-tab').before(tpl('roomtab', {name: d.name, capt: d.caption}))
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

    } else if (err == 'banned') {
        curRoomSel('.rp').html('');
        curRoomSel('mp').html(tpl('banmes', {time: Math.ceil(d / 60), reason: ''}));
    } else {
        if (d == 'alreadyinroom') {
            alert('Вы уже находитесь в этой комнате');
        } else {
            showNotificator('Ошибка захода в комнату: ' + d, 2000);
        }
    }
};
ch.response.onAfterRoomJoin = function (err, d) {
    addTopic(d.topic, d.room);
    if (d.newmes > 0) addNotif(d.room, 'C момента ухода в комнате появилось <b>' + d.newmes + '</b> новых сообщений', '#0F9B14', true);
    $('#cont').addClass('loaded');
    $('.is-loading').hide();
};
ch.response.onRegisterVK = function (err, data) {
    if (!err) {
        alert(tpl('vrnotif'));
        showAuthWindow();
    } else {
        if (vkmid) {
            showAuthWindow();
            if (data == 'wrongauth') $('#reglink').trigger('click');
        } else {
            alert(data);
        }
    }
};
ch.response.onChat = function (err, d) {
    if (!err) {
        if (d.room != currentRoom) {
            var span = $('#chat-tabs a[mid=' + d.room + '] span');
            var mcount = parseInt(span.html()) + 1;
            span.html(mcount).css('display', 'inline-block');
        }
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
    addUser(d.room, d.user, d.info);

    if (d.info.already)
        addNotif(d.room, '<b>' + d.info.nick + '</b> зашел в комнату с другого браузера или устройства', '#0F9B14');
    else
        addNotif(d.room, '<b>' + d.info.nick + '</b> зашел в комнату', '#0F9B14');

};
ch.response.onUserLeaved = function (err, d) {
    addNotif(d.room, '<b>' + d.nick + '</b> покинул комнату', '#E70343');
    delUser(d.room, d.user);
};
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
        $('#newavaimg').attr('src', d.url);

    roomSel('', '.rp table[user=' + d.user + '] .profava').attr('src', d.url);
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
        if (d.user == user.login)$('#stateBtn').css('backgroundImage', 'url(img/' + states[d.val] + ')');
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
        ;
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
                showDesktopNotif('Личное сообщение от ' + d.nick, d.text, 'img/notificon.png');
                ch.getMessages(d.room, 30);
            }

        }


    } else {
        showNotificator('onPM: ' + d, 2000);
    }
};

/********** LIVE CLICKS ************/

$('.send').live('click', clickSendmess);
$('.messageinput').live('keydown', keyInputmess);
$('.image-close').live('click', function () {
    $(this).parents('span').html('<span class="deletedmes">Картинка скрыта</span>');
});
$('#change_nick').live('click', function () {
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
$('dd span.label').live('click', function () {
    if (user.nick != $(this).text()) {
        var inp = curRoomSel('.messageinput');
        var text = inp.val() + $(this).text() + ': ';
        inp.focus().val('').val(text);
    }
});
$('#smWrap img').live('click', function () {
    curRoomSel('.messageinput').val(curRoomSel('.messageinput').val() + ' *smile' + $(this).attr('num') + '* ').focus();
});
$('.profava').live('click', function () {
    var nn = $(this).attr('nn');
    if (user.nick != nn) {
        curRoomSel('.messageinput').val(curRoomSel('.messageinput').val() + nn + ': ').focus();
    }
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
        ;
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
    var rid = $(this).parents('.room-pane').attr('id')
    var skip = curRoomSel('.mp dd span.label').length;
    ch.getHistory(rid.split('-')[1], skip, hisoryLimit);
});


/********** INTERFACE EVENTS ************/
function clickLogout() {
    ch.logOut();
    return false;
}
function clickProfile() {
    clickOnProf = 1;
    ch.getProfile(user.login);
    return false;
}
function clickSetava() {
    var form = tpl('setava', {src: user.avasrc});
    showForm(form, 'Установка аватарки');
    var ifile = document.getElementById('inputfile');
    ifile.onchange = function () {
        $('#avalabel').html('Загружается...');
        uplAvatar(this.files[0]);
    }
    return false;
}
function mouseSmile1() {
    $('#smileblock').show();
}
function mouseSmile2() {
    $('#smileblock').hide();
}
function clickSmiletab() {
    var tab = $(this).attr('tab') * 1;
    var sm = smiles[tab];
    $('#smWrap').html('');
    for (var i in sm) {
        $('#smWrap').append('<img num="' + sm[i] + '" src="img/smiles/' + sm[i] + '.gif" alt="" />');
    }
}
function clickStatusbtn() {
    showForm(tpl('status'), 'Мой статусный текст');
    $('#status_but').click(function () {
        ch.setStatus($('#newstatustext').val());
    });
}
function clickDesignItem() {
    var act = $(this).attr('act');
    if (act == 'theme-default') {
        designThemeUpdate('theme-default');
    }
    if (act == 'theme-dark') {
        designThemeUpdate('theme-dark');
    }

}

function clickModerBut() {
    var m = $('#modmenu');
    if (m.css('display') == 'none') {
        if (blockHide) m.show();
        blockHide = true;
    } else {
        m.hide();
    }
    if (m.html() == '') {
        m.append(tpl('modmenu'));
        m.show();
        $('.moditem').click(function () {
            var v = $(this).attr('val') * 1;
            m.hide();
            blockHide = false;
            showModerWindow(v);
        });
    }

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
    $('#tmenu').show();
}
function clickStatebtn2() {
    $('#tmenu').hide();
}
function clickStateitem() {
    var v = $(this).attr('val') * 1;
    if (curState != v) {
        curState = v;
        ch.setState(curState);
    }
}
function clickSendmess() {
    var t = curRoomSel('.messageinput').val();
    if ($.trim(t) == '') return false;
    mhist.old = t;

    if (currentType == 'room') {
        ch.chat(t, currentRoom, curColor, correctLatMess);
    } else {
        ch.sendMessage(t, currentRoom, curColor);
    }
    curRoomSel('.messageinput').val('').css('backgroundColor', 'white');
    correctLatMess = false;
}
function keyInputmess(event) {
    if (event.keyCode == 13) { // enter
        clickSendmess();
        return false;
    }
    if (event.keyCode == 38) { // up
        mhist.cur = $(this).val();
        $(this).val(mhist.old).css('backgroundColor', '#FCDEDC');
        //$('#miw').css('backgroundColor','#FCDEDC');
        correctLatMess = true;
        return false;
    }
    if (event.keyCode == 40) { // down
        $(this).val(mhist.cur).css('backgroundColor', 'white');
        //$('#miw').css('backgroundColor','white');
        correctLatMess = false;
        return false;
    }
}
function clickSoundbtn() {
    if (soundEnable) {
        soundEnable = false;
        $(this).css('backgroundImage', 'url(img/soundoff.png)');
        cookie("sounds", 'off', {expires: 99});
    } else {
        soundEnable = true;
        $(this).css('backgroundImage', 'url(img/soundon.png)');
        cookie("sounds", 'on', {expires: 99});
    }
}
function clickNotifbtn() {

    if (!isNotif)
        return showForm(tpl('nonotif'), 'Уведомления');

    if (Notification.permission === "granted") {

        if (notifEnable) {
            notifEnable = false;
            $('#notifBtn').css('backgroundImage', 'url(img/notifoff.png)');
            cookie("notifs", 'off', {expires: 99});
        } else {
            notifEnable = true;
            $('#notifBtn').css('backgroundImage', 'url(img/notifon.png)');
            cookie("notifs", 'on', {expires: 99});
        }

    } else {

        Notification.requestPermission(function (permission) {
            if (permission === "granted") {
                notifEnable = true;
                $('#notifBtn').css('backgroundImage', 'url(img/notifon.png)');
                cookie("notifs", 'on', {expires: 99});
            } else {
                alert('Вы заблокировали отображение уведомлений для чата в этом браузере');
            }
        });

    }

}
function nickClick() {
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
    template = templates[tname];
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
function showForm(s, capt, top) {
    if (!isset(top)) top = '100px';
    $('#alert').html('<div class="close-form"><img title="Закрыть" src="img/close-form.png" alt="" /></div><h1>' + capt + '</h1> ' + s).css('top', top).show();
    $('#overlay').show();
}
function hideForm() {
    if (blockOverlay) return false;
    $('#alert').hide();
    $('#overlay').hide();
    curRoomSel('.messageinput').focus();
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

    var cookr = cookie('rooms');
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
    var ssr = {}
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
function uplAvatar(file) {
    if (!file.type.match(/image.*/)) return true;
    imageReader.onload = (function (aFile) {
        return function (e) {
            imaga = document.createElement('img');
            imaga.src = e.target.result;
            imaga.onload = function () {
                ch.setAvatar(imaga.src, function (result) {
                    if (!result) {
                        $('#avalabel').html('Ошибка загрузки');
                        return showNotificator('Ошибка установки аватарки: ' + result.reason, 3000);
                    }

                });
            }
        }
    })(file);
    imageReader.readAsDataURL(file);
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
    showForm(tpl('myprof'), 'Мой профиль', '100px');
    for (var us in udat) {
        $('#pr_' + us).val(udat[us]);
    }
    if (isset(udat['birthday'])) {
        $('#pr_birthday').val(date('m/d/Y', udat['birthday']));
    }
    $('#pr_vis').val(vis);
    $('#pr_birthday').simpleDatepicker({chosendate: '01/01/1995', startdate: '01/01/1970', enddate: '01/01/2005'});
    $('#prof_save').click(function () {
        var dat = {};
        if ($('#pr_gender').val() != '') dat['gender'] = $('#pr_gender').val();
        if ($('#pr_birthday').val() != '') dat['birthday'] = parseDT($('#pr_birthday').val());
        if ($('#pr_realname').val() != '') dat['realname'] = $('#pr_realname').val();
        if ($('#pr_country').val() != '') dat['country'] = $('#pr_country').val();
        if ($('#pr_email').val() != '') dat['email'] = $('#pr_email').val();
        if ($('#pr_homepage').val() != '') dat['homepage'] = $('#pr_homepage').val();
        if ($('#pr_phone').val() != '') dat['phone'] = $('#pr_phone').val();
        if ($('#pr_icq').val() != '') dat['icq'] = $('#pr_icq').val();
        if ($('#pr_skype').val() != '') dat['skype'] = $('#pr_skype').val();
        if ($('#pr_twitter').val() != '') dat['twitter'] = $('#pr_twitter').val();
        if ($('#pr_facebook').val() != '') dat['facebook'] = $('#pr_facebook').val();
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
    mObj = $('<dd id="' + m.mid + '"><dt>' + date('H:i', m.date) + '</dt> <span class="label">' + m.nick + '</span>' + m.text + '</dd>');
    $('#' + typ + '-' + m.room).find('.mp .more-history').after(mObj);
    return true;
}
function addNotif(room, mes, color, silens) {
    roomSel(room, '.mp').append('<dt>' + date('H:i', time()) + '</dt><dd class="notif" style="color:' + color + '">' + mes + '</dd>');
    if (silens != true) playSound('notif');
    toBottom();
}
function addNotifInRooms(user, mes, color) {
    $('.rp table[user=' + user + ']').parents('.room-pane').find('.mp').append('<dt>' + date('H:i', time()) + '</dt><dd class="notif" style="color:' + color + '">' + mes + '</dd>');
    playSound('notif');
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
            awstatus: awayStatuses[awstatus],
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
function saveTabs() {
    var roomtabs = '';
    var pan = document.querySelectorAll('#chat-tabs a.label');
    for (var i = 0; i < pan.length; i++) {
        roomtabs += $(pan[i]).attr('mid') + '|';
    }
    cookie("rooms", roomtabs + currentRoom, {expires: 99});
}
function showDesktopNotif(capt, mes, userpic) {

    if (!(isNotif && notifEnable && mes) || isFocus)
        return;

    var nn = new Notification(capt, {
        body: strip_tags(stripBB(mes)).substring(0, 200),
        icon: userpic
    });

    nn.onclick = function () {
        this.close();
        curRoomSel('.messageinput').focus();
    }
    var notif_timer = setTimeout(function () {
        nn.close();
    }, 5000);

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
    showForm(tpl('auth'), 'Авторизация');
    $('#auth_but').click(function () {
        ch.login($('#auth_login').val(), $('#auth_pass').val());
    });

    setTimeout(function () {
        VK.Widgets.Auth("vk_auth", {width: "200px", onAuth: VKauthProc});
    }, 500);

}
function VKauthProc(data) {
    if (!data) {
        alert('Что-то не так, нет ответа от ВК');
        return false;
    }
    ch.login(data.uid, {
        hash: data.hash,
        name1: data.first_name,
        name2: data.last_name
    }, true);
}
function testStr(str, pat) {
    return new RegExp(pat, 'i').test(str);
}

/********** MESSAGE AFTER RECIVE ************/

function messageAfterProc(s) {

    if (!s.isBot) {
        var uplRegexp = /^uploadimage\|([a-z0-9_:.\/]+)\|([a-z0-9_:.\/]+)$/i;
        if (uplRegexp.test(s.text)) {
            s.text.replace(uplRegexp, function (a, b, c) {
                s.text = tpl('image', {url1: c, url2: b});
            });
        } else {
            s.text = s.text.replace(new RegExp('(https?://)([-a-zA-Zа-яА-Я0-9@:;%!_\+.,~#?&//=/(/)]+)', 'gi'), function (link) {

                if (/\.(jpg|jpeg|gif|png)\??.*$/i.test(link)) { // image
                    return tpl('image', {url1: link, url2: link});
                } else if (testStr(link, 'htt(p|ps)://(www.)?youtube.com/')) { 	// youtube
                    var yt = link.match(/v=([a-zA-Z0-9_-]+)/);
                    return '<iframe width="560" height="315" src="http://www.youtube.com/embed/' + yt[1] + '" frameborder="0" allowfullscreen></iframe><a class="close_video" href="#">[X]</a>';
                } else if (testStr(link, 'htt(p|ps)://coub.com/view/')) { 	// coub
                    var coubId = link.match(/view\/([a-zA-Z0-9_-]+)/)[1];
                    return '<iframe src="//coub.com/embed/' + coubId + '?muted=false&autostart=false&originalSize=false&startWithHD=false" allowfullscreen="true" frameborder="0" width="640" height="264"></iframe><a class="close_video" href="#">[X]</a>';
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
            playSound('foryou', true);
            showDesktopNotif('Обращение от ' + usernick, s.text, userpic);
        } else {
            if (s.user != user.login) {
                var place = s.pm ? 'ЛС' : rooms[s.room].caption;
                showDesktopNotif(usernick + ' в ' + place, s.text, userpic);
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
        return '<img src="img/smiles/' + b + '.gif" alt="" />';
    });


    s.text = BBproc(s.text);

    return s;
}

/********** TEMPLATES ************/

var smiles = {
    1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167],
    3: [501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 530, 531, 532, 534, 535, 536, 537, 538],
    2: [800, 801, 802, 803, 804, 805, 806, 807, 808, 809, 810, 811, 812, 813, 814, 815, 816, 817, 818, 819, 820, 821, 822, 823, 824, 825, 826, 827, 828, 829, 830, 831, 832, 833, 834, 836, 837, 838, 839, 840, 841, 843, 844, 845, 846, 847, 848, 849, 851, 852, 853, 854, 855, 856, 857, 858, 859, 860, 861, 862, 863, 864, 865, 866, 867, 868, 869, 870, 871, 872, 873, 874, 875, 876, 877, 878, 879, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898, 899, 900, 901, 902, 903, 904, 905, 906, 907, 908, 909, 910, 911, 912, 913, 914, 915, 916, 917, 918, 919, 920, 921, 922, 923, 924, 925, 926, 927, 928, 929, 930, 931, 932, 933, 934, 935, 936, 937, 938, 939, 940, 941, 943, 944, 945, 946, 947, 948, 949, 950, 951, 952, 953, 954, 955, 956, 957, 958, 959, 960, 961, 962, 963, 964, 965, 966, 967, 968, 969, 970, 971, 972, 973, 974, 975, 976, 977, 978, 979, 980, 981, 982, 983, 984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 996, 997, 998, 999],
}
states[0] = 'online.png';
statesT[0] = 'Онлайн';
states[1] = 'away.png';
statesT[1] = 'Отошел';
states[2] = 'busy.png';
statesT[2] = 'Занят';
states[3] = 'stop.png';
statesT[3] = 'Отсутствую';
states[4] = 'work.png';
statesT[4] = 'Работаю';
states[5] = 'rest.png';
statesT[5] = 'Отдыхаю';
states[6] = 'game.png';
statesT[6] = 'Играю';
states[7] = 'music.png';
statesT[7] = 'Слушаю музыку';
states[8] = 'films.png';
statesT[8] = 'Смотрю фильм';
states[9] = 'food.png';
statesT[9] = 'Кушаю';
states[10] = 'coffee.png';
statesT[10] = 'Чай / кофе';
states[11] = 'home.png';
statesT[11] = 'Дела по дому';
states[12] = 'read.png';
statesT[12] = 'Читаю';
states[13] = 'sleep.png';
statesT[13] = 'Сплю';
states[14] = 'pirat.png';
statesT[14] = 'Пират';

privas[0] = 'empty.png';
privasT[0] = '';
privas[1] = 'admin.png';
privasT[1] = 'Админ';
privas[2] = 'moder.png';
privasT[2] = 'Модератор';
privas[3] = 'owner.png';
privasT[3] = 'Хозяин комнаты';
privas[4] = 'user.png';
privasT[4] = 'Пользователь';
privas[5] = 'novoice.png';
privasT[5] = 'Без голоса';

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
