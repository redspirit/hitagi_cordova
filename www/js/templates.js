var templates = {
    auth: '<div>Логин: <input type="text" id="auth_login" /></div><div>Пароль: <input type="password" id="auth_pass" /></div><div><input type="button" id="auth_but" class="btn" value="Войти" /></div><div align="center">	<div id="vk_auth"></div></div><a id="reglink" href="http://aniavatars.com/register">Регистрация</a>',
    ban: '<p>Причина бана: <select id="banreason"><option value="Мат или ругательство в сообщении">Мат или ругательство в сообщении</option><option value="Мат в картинке или видео">Мат в картинке или видео</option><option value="Ссылка на ресурс с нецензурным содержанием">Ссылка на ресурс с нецензурным содержанием</option><option value="Порно или хентай">Порно или хентай</option><option value="Контент с насилием, расчлененкой или гуро">Контент с насилием, расчлененкой или гуро</option>	<option value="Оскорбление пользователя">Оскорбление пользователя</option><option value="Некорректное поведение">Некорректное поведение</option></select></p><p>Время бана: <select id="bantime"><option value="15">15 минут</option><option value="30">30 минут</option><option value="60">1 час</option><option value="180">3 часа</option><option value="360">6 часов</option><option value="720">12 часов</option><option value="1440">1 день</option><option value="4320">3 дня</option><option value="10080">1 неделя</option><option value="40320">1 месяц</option><option value="0">Навсегда</option></select></p><div><input type="button" class="btn" id="banBtn" value="Забанить!" /></div>',
    banmes: '<div style="text-align:center;margin:20px 100px"><img src="img/banned.jpg" alt="" /> <p><b>Вы забанены в этой комнате на {time} мин. {reason}</b></p><p>Вы себя вели настолько неуважительно к чату и его пользователям, что теперь читаете эти строки без права зайти в комнату еще {time} мин. Какого хрена? Будет время - <a target="_blank" href="https://github.com/redspirit/hitagi-client/wiki/%D0%9F%D1%80%D0%B0%D0%B2%D0%B8%D0%BB%D0%B0-%D1%87%D0%B0%D1%82%D0%B0">почитайте правила</a>, они очень простые и основаны на самом обычном взаимном уважении между людьми. Если вы принципиально считаете себя выше всех, то лучше сюда не возвращаться.</p></div>',
    blockmes: '<div style="text-align:center;margin:20px 100px"><img src="img/blocked.jpg" alt="" /> <p><b>Вы заблокированы, причина блокировки: "{mess}"</b></p></div>',
    conerror: 'Невозможно подключиться к серверу. Что-то где-то не работает',
    hello: 'Привет, <b>{n}</b>',
    image: '<div class="pic-block">	<a target="_blank" href="{url2}" style="text-decoration: none;">		<img class="inlinepic" src="{url1}" alt="" />	</a>	<img src="img/closeimg.png" class="image-close" alt=""></div>',
    kickmes: '<div style="text-align:center;margin:20px 100px"><img src="img/kick.jpg" alt="" /><p>Уважаемый пользователь, Вас выпнули (кикнули) из этой комнаты. Это сделал модератор у которого, скорее всего, были для этого веские причины.</p><p><b>НАПОМИНАЕМ ВАМ о <a target="_blank" href="https://github.com/redspirit/hitagi-client/wiki/%D0%9F%D1%80%D0%B0%D0%B2%D0%B8%D0%BB%D0%B0-%D1%87%D0%B0%D1%82%D0%B0">ПРАВИЛАХ</a> чата!</b></p><p>Если Ваше отношение к чату и его пользователям не изменится в лучшую сторону, то дело может дойти акта банного изгнания.</p></div>',
    modmenu: '<div class="moditem" val="1">Список забаненых</div><div class="moditem" val="2">Зарегать юзера</div><div class="moditem" val="3">Топик комнаты</div>',
    myprof: '<table id="proftabl">	<tr>	<tr>		<td>Реальное имя:</td>		<td><input type="text" id="pr_realname" /></td>	</tr>	<td>Пол:</td>	<td><select id="pr_gender">		<option value="0">Не указан</option>		<option value="1">Мальчик</option>		<option value="2">Девочка</option>	</select></td>	</tr><tr>	<td>День рождения:</td>	<td><input type="text" id="pr_birthday" /></td></tr>	<tr>		<td>Страна:</td>		<td><input type="text" id="pr_country" /></td>	</tr>	<tr>		<td>E-mail:</td>		<td><input type="text" id="pr_email" /></td>	</tr>	<tr>		<td>Блог / страничка:</td>		<td><input type="text" id="pr_homepage" /></td>	</tr>	<tr>		<td>Телефон:</td>		<td><input type="text" id="pr_phone" /></td>	</tr>	<tr>		<td>ICQ:</td>		<td><input type="text" id="pr_icq" /></td>	</tr>	<tr>		<td>Skype:</td>		<td><input type="text" id="pr_skype" /></td>	</tr>	<tr>		<td>Twitter:</td>		<td><input type="text" id="pr_twitter" /></td>	</tr>	<tr>		<td>Facebook:</td>		<td><input type="text" id="pr_facebook" /></td>	</tr>	<tr>		<td>ВКонтакте:</td>		<td><input type="text" id="pr_vk" /></td>	</tr>	<tr>		<td>Видимость профиля:</td>		<td><select id="pr_vis">			<option value="0">Видно всем</option>			<option value="1">Только зарегистрированным</option>			<option value="2">Скрыто</option>		</select></td>	</tr></table><div style="margin-top: 10px">	<a href="#" id="change_nick">Изменить ник</a></div><div align="center">	<input type="button" class="btn" id="prof_save" value="Сохранить" /></div>',
    newnick: '<div>	<input style="width:200px;" type="text" id="newnicktext" value="{txt}"></div><p>	Менять ник можно не чаще одного раза в неделю</p><input type="button" id="newnick_but" class="btn" value="Изменить ник" />',
    nonotif: 'Ваш браузер не поддерживает всплывающие уведомления! Используйте <a target="_blank" href="http://www.google.com/intl/ru/chrome/browser/">Google Chrome</a> или <a target="_blank" href="http://browser.yandex.ru/">Яндекс браузер</a> ',
    novoice: '<p>Причина: <input type="text" id="voicereason" style="width:300px" /></p><p>Время без голоса: <select id="voicetime"><option value="15">15 минут</option><option value="30">30 минут</option><option value="60">1 час</option><option value="180">3 часа</option><option value="360">6 часов</option><option value="720">12 часов</option><option value="1440">1 день</option><option value="4320">3 дня</option><option value="10080">1 неделя</option><option value="40320">1 месяц</option><option value="0">Навсегда</option></select></p><div><input type="button" class="btn" id="voiBtn" value="Перекрыть кислород!" /></div>',
    pmtab: '<li class="pmtab">	<a href="#" mid="{name}" typ="pm" class="label active">{capt} <span class="unread">0</span></a>	<img src="img/tab-close2.png" alt="" class="close" title="Закрыть" /></li>',
    radiocode: '<object width="100" height="70" id="raa"><param name="allowScriptAccess" value="sameDomain" /><param name="movie" value="/lib/radio/raa.swf" /><param name="flashvars" value="playlist=/lib/radio/playlist.mpl&auto_run=false&anti_cache=false" /><param name="loop" value="false" /><param name="menu" value="false" /><param name="quality" value="high" /><embed src="/lib/radio/raa.swf" flashvars="playlist=/lib/radio/playlist.mpl&auto_run=false&anti_cache=false" loop="false" menu="false" quality="high" bgcolor="#ffffff" width="100" height="70" name="raa" allowScriptAccess="sameDomain" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" /></object>',
    roomcreate: '<div class="createroomdiv"><table>	<tr>		<td class="right">Название:</td>		<td><input type="text" id="cr-caption"></td>	</tr>	<tr>		<td class="right">Тема комнаты:</td>		<td><input type="text" id="cr-topic"></td>	</tr>	<tr>		<td class="right">Скрытая:</td>		<td><input type="checkbox" id="cr-hidden" /></td>	</tr></table><div>	Скрытая комната не появляется в списке комнат, другие пользователи могут зайти в нее только по приглашению.	Вы становетесь владельцем комнаты и получаете права администратора в ней. Вы можете удалить комнату в любой момент</div><input type="button" class="btn" id="cr-create" value="Создать"></div>',
    roomlist: '<div id="roomlist">	{list}</div><hr><a href="#" style="display:none;" id="create-room_">Создать новую комнату</a>',
    roompane: '<div class="room-pane" id="{type}-{name}" style="display: none;">	<div class="roster-pane rp"></div>	<div class="message-pane-wrapper mpw">		<dl class="message-pane mp">			<div class="more-history">Загрузить предыдущие сообщения</div>		</dl>	</div>	<div class="message-form-wrapper"></div>	<form method="post" class="message-form">		<textarea name="message" class="field messageinput"></textarea>		<input type="button" class="btn send" value="Отправить"/>		<div class="uploadImage" title="Загрузить картинку"></div>	</form></div>',
    roomtab: '<li class="litab">	<a href="#" mid="{name}" typ="room" class="label active">{capt} <span class="unread">0</span></a>	<img src="img/tab-close2.png" alt="" class="close" title="Закрыть" /></li>',
    rules: '<a href="https://github.com/redspirit/hitagi-client/wiki/%D0%9F%D1%80%D0%B0%D0%B2%D0%B8%D0%BB%D0%B0-%D1%87%D0%B0%D1%82%D0%B0" target="_blank">	<img src="img/rules.png" alt="" /></a>',
    setava: '<div><img id="newavaimg" src="{src}" alt="" /></div><div><input type="file" name="files" id="inputfile" /></div><div id="avalabel">Выберите файл с картинкой. GIF анимироваться не будет</div>',
    simpimage: '<a target="_blank" href="{url2}"><img class="inlinepic" src="{url1}" alt="" /></a>',
    status: '<div><input type="text" id="newstatustext" style="width:400px;" value="" fastaction="status_but" /></div><input type="button" id="status_but" class="btn" value="Изменить" />',
    statusitem: '<div class="titem stateitem" style="background-image:url(img/{s1})" val="{n}">{s2}</div>',
    topic: '<div>	<textarea style="width:300px; height:80px;" id="topictext">{txt}</textarea></div><input type="button" id="topic_but" class="btn" value="Изменить" />',
    useritem: '<table user="{name}" class="user">	<tr>		<td rowspan="2" scope="col" class="cc1">			<img class="profava" src="{url}" alt="" nn={n} />		</td>		<td scope="col" style="padding-top:6px">			<img class="stateSign" src="img/{states}" alt="" />			<div class="statetxt">{statest}</div> <div class="awaystatus">{awstatus}</div> </td>	</tr>	<tr>		<td class="cc2">			<img class="upriv" title="{pt}" src="img/{p}" alt="" />			<div class="usmenu" priv="{priv}"></div>		</td>	</tr>	<tr>		<td colspan="2" class="cc3">			<div class="profnick" title="Юзер: {name}">{n}</div>			<div class="ustatus">{st}</div>		</td>	</tr></table>',
    useritempm: '<table user="{name}" class="user">	<tr>		<td class="cc1">			<img class="profava" src="{url}" alt="" nn={n} />		</td>		<td scope="col" style="padding-top:6px">			<img class="stateSign" src="img/{states}" alt="" />			<div class="statetxt">{statest}</div>		</td>	</tr>	<tr>		<td colspan="2" class="cc3">			<div class="profnick" title="Юзер: {name}">{n}</div>			<div class="ustatus">{st}</div>		</td>	</tr></table>',
    userprof: '<table id="proftabl"><tr><tr><td class="r">Реальное имя:</td><td id="vw_realname"></td></tr><tr><td class="r">Пол:</td><td id="vw_gender"></td></tr><tr><td class="r">День рождения:</td><td id="vw_birthday"></td></tr><tr><td class="r">Страна:</td><td id="vw_country"></td></tr><tr><td class="r">E-mail:</td><td id="vw_email"></td></tr><tr><td class="r">Блог / страничка:</td><td id="vw_homepage"></td></tr><tr><td class="r">Телефон:</td><td id="vw_phone"></td></tr><tr><td class="r">ICQ:</td><td id="vw_icq"></td></tr><tr><td class="r">Skype:</td><td id="vw_skype"></td></tr><tr><td class="r">Twitter:</td><td id="vw_twitter"></td></tr><tr><td class="r">Facebook:</td><td id="vw_facebook"></td></tr><tr><td class="r">ВКонтакте:</td><td id="vw_vk"></td></tr></table>',
    vrnotif: 'Регистрация прошла успешно, теперь просто залогинтесь через ВК'
};
