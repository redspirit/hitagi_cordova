
var smiles = {
    1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167],
    3: [501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 530, 531, 532, 534, 535, 536, 537, 538],
    2: [800, 801, 802, 803, 804, 805, 806, 807, 808, 809, 810, 811, 812, 813, 814, 815, 816, 817, 818, 819, 820, 821, 822, 823, 824, 825, 826, 827, 828, 829, 830, 831, 832, 833, 834, 836, 837, 838, 839, 840, 841, 843, 844, 845, 846, 847, 848, 849, 851, 852, 853, 854, 855, 856, 857, 858, 859, 860, 861, 862, 863, 864, 865, 866, 867, 868, 869, 870, 871, 872, 873, 874, 875, 876, 877, 878, 879, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898, 899, 900, 901, 902, 903, 904, 905, 906, 907, 908, 909, 910, 911, 912, 913, 914, 915, 916, 917, 918, 919, 920, 921, 922, 923, 924, 925, 926, 927, 928, 929, 930, 931, 932, 933, 934, 935, 936, 937, 938, 939, 940, 941, 943, 944, 945, 946, 947, 948, 949, 950, 951, 952, 953, 954, 955, 956, 957, 958, 959, 960, 961, 962, 963, 964, 965, 966, 967, 968, 969, 970, 971, 972, 973, 974, 975, 976, 977, 978, 979, 980, 981, 982, 983, 984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 996, 997, 998, 999],
};
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

var gender = {0: 'Не указано', 1: 'Мальчик', 2: 'Девочка'};
var awayStatuses = {
    0: 'Бдит',
    1: 'Отвлекся',
    2: 'Отошел',
    3: 'Задремал',
    4: 'Ушел'
};


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
    roomtab: '<li class="litab">	<a href="#" mid="{name}" typ="room" class="label active">{capt} <span class="unread">0</span></a>	<img src="img/tab-close2.png" alt="" class="close" title="Закрыть" /></li>',
    rules: '<a href="https://github.com/redspirit/hitagi-client/wiki/%D0%9F%D1%80%D0%B0%D0%B2%D0%B8%D0%BB%D0%B0-%D1%87%D0%B0%D1%82%D0%B0" target="_blank">	<img src="img/rules.png" alt="" /></a>',
    setava: '<div><img id="newavaimg" src="{src}" alt="" /></div><div><input type="file" name="files" id="inputfile" /></div><div id="avalabel">Выберите файл с картинкой. GIF анимироваться не будет</div>',
    simpimage: '<a target="_blank" href="{url2}"><img class="inlinepic" src="{url1}" alt="" /></a>',
    status: '<div><input type="text" id="newstatustext" value="" fastaction="status_but" /></div><input type="button" id="status_but" class="btn" value="Изменить" />',
    statusitem: '<div class="titem stateitem" style="background-image:url(img/{s1})" val="{n}">{s2}</div>',
    topic: '<div>	<textarea id="topictext">{txt}</textarea></div><input type="button" id="topic_but" class="btn" value="Изменить" />',
    useritem: '<table user="{name}" class="user">	<tr>		<td rowspan="2" scope="col" class="cc1">			<img class="profava" src="{url}" alt="" nn={n} />		</td>		<td scope="col" style="padding-top:6px">			<img class="stateSign" src="img/{states}" alt="" />			<div class="statetxt">{statest}</div> <div class="awaystatus">{awstatus}</div> </td>	</tr>	<tr>		<td class="cc2">			<img class="upriv" title="{pt}" src="img/{p}" alt="" />			<div class="usmenu" priv="{priv}"></div>		</td>	</tr>	<tr>		<td colspan="2" class="cc3">			<div class="profnick" title="Юзер: {name}">{n}</div>			<div class="ustatus">{st}</div>		</td>	</tr></table>',
    useritempm: '<table user="{name}" class="user">	<tr>		<td class="cc1">			<img class="profava" src="{url}" alt="" nn={n} />		</td>		<td scope="col" style="padding-top:6px">			<img class="stateSign" src="img/{states}" alt="" />			<div class="statetxt">{statest}</div>		</td>	</tr>	<tr>		<td colspan="2" class="cc3">			<div class="profnick" title="Юзер: {name}">{n}</div>			<div class="ustatus">{st}</div>		</td>	</tr></table>',
    userprof: '<table id="proftabl"><tr><tr><td class="r">Реальное имя:</td><td id="vw_realname"></td></tr><tr><td class="r">Пол:</td><td id="vw_gender"></td></tr><tr><td class="r">День рождения:</td><td id="vw_birthday"></td></tr><tr><td class="r">Страна:</td><td id="vw_country"></td></tr><tr><td class="r">E-mail:</td><td id="vw_email"></td></tr><tr><td class="r">Блог / страничка:</td><td id="vw_homepage"></td></tr><tr><td class="r">Телефон:</td><td id="vw_phone"></td></tr><tr><td class="r">ICQ:</td><td id="vw_icq"></td></tr><tr><td class="r">Skype:</td><td id="vw_skype"></td></tr><tr><td class="r">Twitter:</td><td id="vw_twitter"></td></tr><tr><td class="r">Facebook:</td><td id="vw_facebook"></td></tr><tr><td class="r">ВКонтакте:</td><td id="vw_vk"></td></tr></table>',
    vrnotif: 'Регистрация прошла успешно, теперь просто залогинтесь через ВК',
    roompane: '<div class="room-pane" id="{type}-{name}" style="display: none;"> <div class="main-menu"><div class="menu-tools"><i class="fa fa-star-half-o" id="stateBtn" ></i> <i class="fa fa-commenting" id="statusBtn" ></i> <i class="fa fa-bell" id="soundBtn" ></i> <i class="fa fa-chevron-right to-back"></i> </div><div class="roster-pane rp"></div></div>	<div class="message-pane-wrapper mpw">		<dl class="message-pane mp">			<div class="more-history">Загрузить предыдущие сообщения</div>		</dl>	</div>	<div class="message-form-wrapper"></div>	<form method="post" class="message-form">		<input type="text" placeholder="Ваше сообщение..." name="message" class="field messageinput"/>  <input type="button" class="btn send" value="Отправить"/></form></div>',
};

// показать ростер - fa-users
// fa-bell / fa-bell-slash
// TODO - переделать cookie на локалсторадж
