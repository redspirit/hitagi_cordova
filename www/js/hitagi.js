
function hitagiCreate(socketUrl, log_enable){
	var socket = io.connect(socketUrl);
    var isHardClode = false;
	var storageName = 'chatauth';
	var chat = {};
	var user = {'online':false};
	var usersNick = {};
    var platform = 'android-cordova';
	
	chat.response = {};

    socket.on('connect', function (pr) {
        chat.response.onConnect();
        console.log("Connected");
    });

	chat.getUserInfo = function(){
		return user;
	};

	chat.getNick = gnick;

	function gnick(name){
		return usersNick[name];
	}
	function sendResponse(event, err, data){
		if(typeof(chat.response[event])=='function') chat.response[event](err,data);
	}
	function getCommonPriv(rp, gp){
		var p = 4;
		if(rp==2) p = 2;
		if(rp==1) p = 3;
		if(rp==3) p = 5;
		if(gp<=1) p = 1;
		return p;
	}
	
	
	/********     RESPONSE     ********/

    socket.on('disconnect', function(){
        console.log("DISCONNECT");
        if(isHardClode)
            return;
        sendResponse('onDisconnect', false);
    });
    socket.on('reconnect', function(){
        console.log("reconnect");
        sendResponse('onReconnect', false);
    });
    socket.on('reconnecting', function(num){
        console.log("reconnecting", num);
        sendResponse('onReconnecting', false, num);
    });
    socket.on('getserverinfo', function(data){
        console.log("Информация о сервере:", data);
    });
	socket.on('auth', function (pr) {
		if(pr.status == 'ok'){
			user.online = true;
			user.privilege = pr.privilege;
			user.nick = pr.nickname;
			user.login = pr.login;
			user.avasrc = pr.url;
			user.state = pr.state;
			user.textcolor = pr.textcolor;
			user.statustext = pr.statustext;
			user.type = 'normal';
			sendResponse('onLogin', false, user);
			storage(storageName, "passwd;;" + user.login + ";;" + user.pass);
		} else {
			user.online = false;
			if(pr.reason == 'userblocked'){
				sendResponse('onLogin', 'blocked', pr.message);
			} else {
				sendResponse('onLogin', true, pr.reason);
			}
		}
	});
    socket.on('authsocial', function (pr) {
        if(pr.status == 'ok'){
            user.online = true;
            user.privilege = pr.privilege;
            user.nick = pr.nickname;
            user.login = pr.login;
            user.state = pr.state;
            user.avasrc = pr.url;
            user.textcolor = pr.textcolor;
            user.statustext = pr.statustext;
            user.linked = pr.linked;
            user.socialType = pr.socialType;
            sendResponse('onLogin', false, user);
            storage(storageName, "social;;"+user.socialToken);
        } else {
            user.online = false;
            if(pr.reason == 'userblocked'){
                sendResponse('onLogin', 'blocked', pr.message);
            } else {
                sendResponse('onLogin', true, pr.reason);
            }
        }
	});
    socket.on('joinroom', function (pr) {
        if (pr.status != 'ok') {
            if (pr.status == 'banned') {
                sendResponse('onJoinRoom', 'banned', pr.expires);
            } else {
                sendResponse('onJoinRoom', true, pr.reason);
            }
        } else {

            for (var us in pr.users) {
                pr.users[us].commonPriv = getCommonPriv(pr.users[us].roomPriv, pr.users[us].globPriv);
                usersNick[pr.users[us].login] = pr.users[us].nick;
            }

            var roomInfo = {
                name:pr.name,
                users:pr.users,
                newmes:pr.newmes,
                caption:pr.caption,
                topic:pr.topic,
                commonPriv:pr.users[user.login].commonPriv,
                roomPriv:pr.users[user.login].roomPriv,
                globPriv:pr.users[user.login].globPriv
            };
            rooms[pr.name] = {
                caption:pr.caption,
                topic:pr.topic,
                users:pr.users
            };

            sendResponse('onJoinRoom', false, roomInfo);
            for (var i = 0; i < pr.messages.length; i++) {
                sendResponse('onChat', false, {
                    mid:pr.messages[i]['id'],
                    nick:pr.messages[i]['n'],
                    text:pr.messages[i]['t'],
                    user:pr.messages[i]['u'],
                    room:pr.messages[i]['r'],
                    date:pr.messages[i]['d'],
                    color:pr.messages[i]['c'],
                    isBot:pr.messages[i]['bot'],
                    fromHistory:true,
                    pm:false
                });
                if(i==pr.messages.length-1) sendResponse('onAfterRoomJoin', false, {room:pr.name, topic:pr.topic, newmes:pr.newmes});
            }
        }
	});
    socket.on('userjoined', function (pr) {
        pr.data.commonPriv = getCommonPriv(pr.data.roomPriv, pr.data.globPriv);
        rooms[pr.room]['users'][pr.name] = pr.data;
        usersNick[pr.name] = pr.data.nick;
        sendResponse('onUserJoined', false, {room:pr.room, user:pr.name, info:pr.data});
    });
    socket.on('userleaved', function (pr) {
        sendResponse('onUserLeaved', false, {room:pr.room, user:pr.name, nick:gnick(pr.name)});
        delete rooms[pr.room]['users'][pr.name];
	});
    socket.on('chat', function (pr) {
        if(!isset(pr.status)){
            var isbot = isset(pr.isbot) ? true : false;

            if(!isbot) if(!isset(pr.n)) pr.n = gnick(pr.u); else pr.n = '';
            var message = {
                mid: pr.id,
                nick: pr.n,
                text: pr.t,
                user: pr.u,
                room: pr.r,
                color: pr.c,
                isBot: isbot,
                fromHistory: false,
                pm:false
            };
            sendResponse('onChat', false, message);
        } else {
            sendResponse('onChat', true, pr.reason);
        }
	});
    socket.on('chatcorrect', function (pr) {
        if(pr.status=='ok'){
            var nm = {
                'newtext':pr.newtext,
                'mid':pr.mid
            };
            sendResponse('onChatCorrect', false, nm);
        } else {
            sendResponse('onChatCorrect', true, pr.reason);
        }
	});
    socket.on('logout', function (pr) {
        if(pr.status == 'ok') {
            user = {
                online: false
            };
            storage(storageName, '');
            sendResponse('onLogout', false);
        } else {
            sendResponse('onLogout', true, pr.reason);
        }
	});
    socket.on('register', function (pr) {
        if(pr.status=='ok'){
            sendResponse('onRegister', false);
        } else {
            sendResponse('onRegister', true, pr.reason);
        }
	});
    socket.on('setstatus', function (pr) {
        if(pr.status=='ok'){
            sendResponse('onSetStatus', false, {user: pr.user, text: pr.text, nick:gnick(pr.user)});
        } else {
            sendResponse('onSetStatus', true, pr.reason);
        }
	});
    socket.on('setstate', function (pr) {
        if(pr.status=='ok'){
            sendResponse('onSetState', false, {user: pr.user, val: pr.val, nick:gnick(pr.user)});
        } else {
            sendResponse('onSetState', true, pr.reason);
        }
	});
    socket.on('settopic', function (pr) {
        if(pr.status=='ok'){
            sendResponse('onSetTopic', false, {topic: pr.topic, room: pr.room});
        } else {
            sendResponse('onSetTopic', true, pr.reason);
        }
	});
    socket.on('setnick', function (pr) {
        if(pr.status=='ok'){
            usersNick[pr.user] = pr.newnick;
            sendResponse('onSetNick', false, {user: pr.user, nick: pr.newnick});
        } else {
            sendResponse('onSetNick', true, pr.reason);
        }
	});
    socket.on('setprofile', function (pr) {
        if(pr.status=='ok'){
            sendResponse('onSetProfile', false);
        } else {
            sendResponse('onSetProfile', true, pr.reason);
        }
	});
    socket.on('getprofile', function (pr) {
        if(pr.status=='ok'){
            sendResponse('onGetProfile', false, {user:pr.user, priv:pr.privilege, visible: pr.visible, userdata: pr.userdata});
        } else {
            sendResponse('onGetProfile', true, pr.reason);
        }
	});
    socket.on('banon', function (pr) {
        if(pr.status=='ok'){
            var isMe = (pr.user == user.login);
            sendResponse('onSetBan', false, {user: pr.user, isMe:isMe, nick:gnick(pr.user), reason:pr.reason, time:pr.time, room:pr.room});
            delete rooms[pr.room]['users'][pr.user];
        } else {
            sendResponse('onSetBan', true, pr.reason);
        }
	});
    socket.on('kick', function (pr) {
        if(pr.status=='ok'){
            var isMe = (pr.user == user.login);
            sendResponse('onKick', false, {user: pr.user, isMe:isMe, nick:gnick(pr.user), room:pr.room});
            delete rooms[pr.room]['users'][pr.user];
        } else {
            sendResponse('onKick', true, pr.reason);
        }
	});
    socket.on('voiceoff', function (pr) {
        if(pr.status=='ok'){
            sendResponse('onVoiceOff', false);
        } else {
            sendResponse('onVoiceOff', true, pr.reason);
        }
	});
    socket.on('voiceon', function (pr) {
        if(pr.status=='ok'){
            sendResponse('onVoiceOn', false);
        } else {
            sendResponse('onVoiceOn', true, pr.reason);
        }
	});
    socket.on('saverating', function (pr) {
        if(pr.status=='ok'){
            sendResponse('onSaveRating', false);
        } else {
            sendResponse('onSaveRating', true, pr.reason);
        }
	});
    socket.on('erasemessage', function (pr) {
        if(pr.status=='ok'){
            sendResponse('onEraseMessage', false, {mid: pr.mid});
        } else {
            sendResponse('onEraseMessage', true, pr.reason);
        }
	});
    socket.on('setavatar', function (pr) {
        sendResponse('onSetAvatar', false, {user: pr.user, url: pr.url, nick:gnick(pr.user)});
	});
    socket.on('leaveroom', function (pr) {
        if(pr.status=='ok'){
            sendResponse('onLeaveroom', false, {room: pr.room});
        } else {
            sendResponse('onLeaveroom', true, pr.reason);
        }
	});
    socket.on('getroomslist', function (pr) {
        if(pr.status=='ok'){
            sendResponse('onRoomlist', false, {rooms: pr.list});
        } else {
            sendResponse('onRoomlist', true, pr.reason);
        }
	});
    socket.on('createroom', function (pr) {
        if(pr.status=='ok'){
            sendResponse('onCreateroom', false, {name:pr.name});
        } else {
            sendResponse('onCreateroom', true, pr.reason);
        }
	});
    socket.on('gethistory', function (pr) {
        if(pr.status=='ok'){
            for (var i = 0; i < pr.messages.length; i++) {
                sendResponse('onChatHist', false, {
                    mid:pr.messages[i]['id'],
                    nick:pr.messages[i]['n'],
                    text:pr.messages[i]['t'],
                    user:pr.messages[i]['u'],
                    room:pr.messages[i]['r'],
                    date:pr.messages[i]['d'],
                    color:pr.messages[i]['c'],
                    fromHistory:true,
                    pm:false
                });
            }
        } else {
            sendResponse('onCreateroom', true, pr.reason);
        }
	});
    socket.on('recmes', function (pr) {
        if(pr.status=='ok'){

            var m = {
                nick: pr.message.n,
                text: pr.message.t,
                color: pr.message.cl,
                room: user.login == pr.message.u ? pr.message.r : pr.message.u,
                user: pr.message.u,
                date: pr.message.d,
                mid: pr.message.id,
                fromHistory:false,
                pm:true
            };
            sendResponse('onPM', false, m);
        } else {
            sendResponse('onPM', true, pr.reason);
        }
	});
    socket.on('getmessages', function (pr) {
        if(pr.status=='ok'){
            usersNick[pr.user.login] = pr.user.nick;

            sendResponse('onGetMessages', false, {friend:pr.user});

            for (var i = 0; i < pr.messages.length; i++) {
                sendResponse('onPM', false, {
                    mid:pr.messages[i]['id'],
                    nick:pr.messages[i]['n'],
                    text:pr.messages[i]['t'],
                    user:pr.messages[i]['u'],
                    room:pr.user.login,
                    date:pr.messages[i]['d'],
                    color:'000',
                    fromHistory:true,
                    pm:true
                });
            }

        } else {
            sendResponse('onGetMessages', true, pr.reason);
        }
	});
    socket.on('awaystatus', function (pr) {
        sendResponse('onAwayStatus', true, pr);
	});

	/********     COMANDS     ********/
	
	chat.login = function(name, pass, noHash){
        user.pass = noHash ? pass : md5(pass);
        socket.emit('auth', {
            login: name,
            pass: user.pass,
            platform: platform,
            client: navigator.userAgent
        });
		return true;
	};
	chat.loginSocial = function(token){
        socket.emit('authsocial', {
            token: token,
            platform: platform,
            client: navigator.userAgent
        });
        user.socialToken = token;
		return true;
	};
	chat.autoLogin = function(){
		var authData = storage(storageName);
		if(!authData)
		    return false;
		var cha = authData.split(';;');
		if(cha[0] == 'passwd'){
            chat.login(cha[1], cha[2], true);
			return true;
		} else if(cha[0]=='social') {
            chat.loginSocial(cha[1]);
			return true;
		} else {
			return false;
		}
	};
	chat.logOut = function(){
        socket.emit('logout', {});
		return true;
	};
	chat.register = function(name, nick, pass){
        socket.emit('register', {'login':name,'nickname':nick,'pass':md5(pass)});
		return true;
	};
	chat.joinRoom = function(roomName, count){
		//rooms.current = roomName;
        socket.emit('joinroom', {'room':roomName, 'count':count});
		return true;
	};
	chat.chat = function(message, room, color, correctLatMess){
		if(!isset(correctLatMess)) correctLatMess = false;
		//rooms.current = room;
		if(correctLatMess){
            socket.emit('chatcorrect', {'text':message});
		} else {
            socket.emit('chat', {'room':room, 'text':message, 'cl':color});
		}
		return true;
	};
	chat.setStatus = function(text){
        socket.emit('setstatus', {'text':text});
		return true;
	};
	chat.setState = function(v){
        socket.emit('setstate', {'val':v});
		return true;
	};
	chat.setTopic = function(topic, room){
		//rooms.current = room;
        socket.emit('settopic', {'room':room, 'topic':topic});
		return true;
	};
	chat.setNick = function(newnick){
        socket.emit('setnick', {'nick':newnick});
		return true;
	};
	chat.setProfile = function(user, data, vis){
        socket.emit('setprofile', {'user':user, 'userdata':data, 'visible':vis});
		return true;
	};
	chat.getProfile = function(user){
        socket.emit('getprofile', {'user':user});
		return true;
	};
	chat.setBan = function(time, reason, user, room){
		// time in minutes
        socket.emit('banon', {'time':time, 'reason':reason, 'user':user, 'room':room});
		return true;
	};
	chat.kick = function(user, room){
        socket.emit('kick', {'user':user, 'room':room});
		return true;
	};
	chat.voiceOff = function(time, reason, user, room){
		// time in minutes
        socket.emit('voiceoff', {'time':time, 'reason':reason, 'user':user, 'room':room});
		return true;
	};
	chat.voiceOn = function(user, room){
        socket.emit('voiceon', {'user':user, 'room':room});
		return true;
	};
	chat.saveRating = function(m,v){
        socket.emit('saverating', {'mid':m, 'val':v});
		return true;
	};
	chat.eraseMessage = function(m){
        socket.emit('erasemessage', {'mid':m});
		return true;
	};
	chat.setAvatar = function(file, cb){
		// file is src data of image element;
        $.post(imagesUrl + '/upload/avatar/' + socket.id, file).then(function(data){
            if(data.status == 'ok')
                cb(data);
            else
                cb(false);
        }, function(){
            cb(false);
        });
	};
	chat.uploadImage = function(file, cb){
		// file is src data of image element
        $.post(imagesUrl + '/upload/image', file).then(function(data){
            if(data.status == 'ok')
                cb(data);
            else
                cb(false);
        }, function(){
            cb(false);
        });
	};
	chat.getRoomslist = function(){
        socket.emit('getroomslist', {});
		return true;
	};
	chat.createRoom = function(name, capt, topic, hidden){
        socket.emit('createroom', {name:name, caption:capt, topic:topic, hidden:hidden});
		return true;
	};
	chat.leaveRoom = function(room){
        socket.emit('leaveroom', {room:room});
		return true;
	};
	chat.getHistory = function(room, skip, count){
        socket.emit('gethistory', {room:room, skip:skip, count:count});
		return true;
	};
	chat.sendMessage = function(text, user, color){
        socket.emit('sendmess', {text:text, to:user, cl:color});
		return true;
	};
	chat.getMessages = function(user, count){
        socket.emit('getmessages', {from:user, count:count});
		return true;
	};
	chat.awayStatus = function(status){
        // 0 - бдит
        // 1 - отвлекся
        // 2 - отошел
        // 3 - задремал
        // 4 - ушел
        socket.emit('awaystatus', {status:status});
		return true;
	};


	// return object
	return chat;
}

// Any Functions
function md5(f){x=str2blks_MD5(f);a=1732584193;b=-271733879;c=-1732584194;d=271733878;for(i=0;i<x.length;i+=16)olda=a,oldb=b,oldc=c,oldd=d,a=ff(a,b,c,d,x[i+0],7,-680876936),d=ff(d,a,b,c,x[i+1],12,-389564586),c=ff(c,d,a,b,x[i+2],17,606105819),b=ff(b,c,d,a,x[i+3],22,-1044525330),a=ff(a,b,c,d,x[i+4],7,-176418897),d=ff(d,a,b,c,x[i+5],12,1200080426),c=ff(c,d,a,b,x[i+6],17,-1473231341),b=ff(b,c,d,a,x[i+7],22,-45705983),a=ff(a,b,c,d,x[i+8],7,1770035416),d=ff(d,a,b,c,x[i+9],12,-1958414417),c=ff(c,d,a,
b,x[i+10],17,-42063),b=ff(b,c,d,a,x[i+11],22,-1990404162),a=ff(a,b,c,d,x[i+12],7,1804603682),d=ff(d,a,b,c,x[i+13],12,-40341101),c=ff(c,d,a,b,x[i+14],17,-1502002290),b=ff(b,c,d,a,x[i+15],22,1236535329),a=gg(a,b,c,d,x[i+1],5,-165796510),d=gg(d,a,b,c,x[i+6],9,-1069501632),c=gg(c,d,a,b,x[i+11],14,643717713),b=gg(b,c,d,a,x[i+0],20,-373897302),a=gg(a,b,c,d,x[i+5],5,-701558691),d=gg(d,a,b,c,x[i+10],9,38016083),c=gg(c,d,a,b,x[i+15],14,-660478335),b=gg(b,c,d,a,x[i+4],20,-405537848),a=gg(a,b,c,d,x[i+9],5,568446438),
d=gg(d,a,b,c,x[i+14],9,-1019803690),c=gg(c,d,a,b,x[i+3],14,-187363961),b=gg(b,c,d,a,x[i+8],20,1163531501),a=gg(a,b,c,d,x[i+13],5,-1444681467),d=gg(d,a,b,c,x[i+2],9,-51403784),c=gg(c,d,a,b,x[i+7],14,1735328473),b=gg(b,c,d,a,x[i+12],20,-1926607734),a=hh(a,b,c,d,x[i+5],4,-378558),d=hh(d,a,b,c,x[i+8],11,-2022574463),c=hh(c,d,a,b,x[i+11],16,1839030562),b=hh(b,c,d,a,x[i+14],23,-35309556),a=hh(a,b,c,d,x[i+1],4,-1530992060),d=hh(d,a,b,c,x[i+4],11,1272893353),c=hh(c,d,a,b,x[i+7],16,-155497632),b=hh(b,c,d,
a,x[i+10],23,-1094730640),a=hh(a,b,c,d,x[i+13],4,681279174),d=hh(d,a,b,c,x[i+0],11,-358537222),c=hh(c,d,a,b,x[i+3],16,-722521979),b=hh(b,c,d,a,x[i+6],23,76029189),a=hh(a,b,c,d,x[i+9],4,-640364487),d=hh(d,a,b,c,x[i+12],11,-421815835),c=hh(c,d,a,b,x[i+15],16,530742520),b=hh(b,c,d,a,x[i+2],23,-995338651),a=ii(a,b,c,d,x[i+0],6,-198630844),d=ii(d,a,b,c,x[i+7],10,1126891415),c=ii(c,d,a,b,x[i+14],15,-1416354905),b=ii(b,c,d,a,x[i+5],21,-57434055),a=ii(a,b,c,d,x[i+12],6,1700485571),d=ii(d,a,b,c,x[i+3],10,
-1894986606),c=ii(c,d,a,b,x[i+10],15,-1051523),b=ii(b,c,d,a,x[i+1],21,-2054922799),a=ii(a,b,c,d,x[i+8],6,1873313359),d=ii(d,a,b,c,x[i+15],10,-30611744),c=ii(c,d,a,b,x[i+6],15,-1560198380),b=ii(b,c,d,a,x[i+13],21,1309151649),a=ii(a,b,c,d,x[i+4],6,-145523070),d=ii(d,a,b,c,x[i+11],10,-1120210379),c=ii(c,d,a,b,x[i+2],15,718787259),b=ii(b,c,d,a,x[i+9],21,-343485551),a=add(a,olda),b=add(b,oldb),c=add(c,oldc),d=add(d,oldd);return rhex(a)+rhex(b)+rhex(c)+rhex(d)};
function str2blks_MD5(f){nblk=(f.length+8>>6)+1;blks=Array(16*nblk);for(i=0;i<16*nblk;i++)blks[i]=0;for(i=0;i<f.length;i++)blks[i>>2]|=f.charCodeAt(i)<<8*(i%4);blks[i>>2]|=128<<8*(i%4);blks[16*nblk-2]=8*f.length;return blks}function add(f,k){var h=(f&65535)+(k&65535);return(f>>16)+(k>>16)+(h>>16)<<16|h&65535}function rol(f,k){return f<<k|f>>>32-k}function cmn(f,k,h,e,g,l){return add(rol(add(add(k,f),add(e,l)),g),h)}function ff(f,k,h,e,g,l,m){return cmn(k&h|~k&e,f,k,g,l,m)}
function gg(f,k,h,e,g,l,m){return cmn(k&e|h&~e,f,k,g,l,m)}function hh(f,k,h,e,g,l,m){return cmn(k^h^e,f,k,g,l,m)}function ii(f,k,h,e,g,l,m){return cmn(h^(k|~e),f,k,g,l,m)}var hex_chr="0123456789abcdef";function rhex(f){str="";for(j=0;3>=j;j++)str+=hex_chr.charAt(f>>8*j+4&15)+hex_chr.charAt(f>>8*j&15);return str}
var isset = function(vr){return typeof(vr)!=='undefined'};
function trim(b,a){return ltrim(rtrim(b,a),a)}function ltrim(b,a){return b.replace(new RegExp("^["+(a||"\\s")+"]+","g"),"")}function rtrim(b,a){return b.replace(new RegExp("["+(a||"\\s")+"]+$","g"),"")};
var storage = function(name, val){
    if(typeof val == 'undefined') {
        return localStorage.getItem(name);
    } else {
        localStorage.setItem(name, val);
    }
};