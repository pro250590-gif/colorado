/* ==========================================================================
   АНГЛИЙСКИЙ ЯЗЫК: СЛОВАРЬ, ФОРМЫ СЛОВ И КАЛЕНДАРЬ

   ⚠️ ЭТОТ ФАЙЛ ГРУЗИТСЯ ТОЛЬКО НА АНГЛИЙСКОЙ СТРАНИЦЕ (шаг 2 плана, 08.08.2026).
   Раньше все словари лежали в i18n.js — 100 КБ, и их качал КАЖДЫЙ посетитель,
   включая русского, которому английские фразы не нужны вовсе. На трёх языках
   это втрое, и платят все. Приём тот же, что уже принят для текста маршрутов
   (trip-<маршрут>-en.js, правило 22г): язык платит за себя сам.

   ⚠️ КАК ДОБАВИТЬ ЯЗЫК: скопировать этот файл под именем lang-<код>.js,
   перевести значения и поменять код языка в самом низу. Ни index.html, ни
   i18n.js при этом не трогаются (правило 22б). Файл не подключается тегом —
   его подставляет загрузчик страницы, когда язык не русский.

   ⚠️ НОВЫЙ ФАЙЛ НАДО git add — выкладка берёт файлы через git ls-files, и
   забытый add даёт 404 на живом сайте. Уже обжигались на текстах маршрутов.

   Что внутри:
     DICT   — целые фразы, их заменяет applyDomT на готовой странице;
     CODE   — куски, склеенные с числом или именем, их зовёт cx();
     PLURAL — формы слова и ПРАВИЛО выбора формы (в английском их две);
     LOCALE — календарь: месяцы, дни недели, первый день недели, образцы дат.
   ========================================================================== */
(function (root, factory) {
  var pack = factory();
  if (typeof module === 'object' && module.exports) { module.exports = pack; return; }
  /* ⚠️ ПОРЯДОК ЗАГРУЗКИ НЕ ГАРАНТИРОВАН. Словарь подставляется загрузчиком
     страницы и может приехать РАНЬШЕ самого i18n.js — тогда класть некуда.
     В этом случае оставляем себя на окне, а i18n.js подберёт при запуске. */
  if (root.I18N && root.I18N.add) root.I18N.add('en', pack);
  else (root.__i18nPacks = root.__i18nPacks || {})['en'] = pack;
}(typeof self !== 'undefined' ? self : this, function () {

  var DICT = {
      /* ——— шапка и общее ——— */
      'Войти': 'Sign in',
      'Поделиться': 'Share',
      'Отмена': 'Cancel',
      'Закрыть': 'Close',
      'Понятно': 'Got it',
      'Хорошо': 'OK',
      'Отменить': 'Undo',
      'Дни': 'Days',
      'Бюджет': 'Budget',
      'Еда': 'Food',
      'Карта': 'Map',
      'Маршрут': 'Route',

      /* ——— начало поездки ——— */
      'Старт поездки': 'Trip starts',
      'Город вылета': 'Flying from',
      'Сколько людей': 'Travelers',
      'Темп поездки': 'Pace',
      'Как добираешься': 'Getting around',
      'спокойный': 'easy',
      'обычный': 'standard',
      'плотный': 'packed',
      '8 часов на ногах, без спешки': '8 hours out and about, no rush',

      /* ——— перелёт ——— */
      'Прибытие': 'Arrival',
      'Вылет домой': 'Flying home',
      'Ваш рейс: ': 'Your flight: ',
      'Обратный рейс: ': 'Return flight: ',
      'Изменить рейс': 'Edit flight',
      'Подобрать рейс': 'Find flights',
      'Мой билет': 'My ticket',
      'Уже есть рейс': 'I have a flight',
      'В одну сторону': 'One way',
      'Туда-обратно': 'Round trip',
      'Откуда вы летите?': 'Where are you flying from?',
      'Город или код аэропорта': 'City or airport code',
      'город не выбран': 'no city chosen',
      'Вернуть город маршрута': 'Use the route’s city',

      /* ——— жильё ——— */
      'Проживание': 'Where you sleep',
      'Где остановиться': 'Where to stay',
      'Подобрать жильё': 'Find a place',
      'Забронировать жильё': 'Book a place',
      'Уже есть жильё': 'I have a place',
      'Добавить ещё жильё': 'Add another place',
      'Посмотреть другие варианты жилья': 'See other places',
      'Искать в другом сервисе': 'Try another site',
      'Где ищем жильё': 'Where should we look?',
      'Запомнить выбор и больше не спрашивать': 'Remember this and stop asking',
      'самый большой выбор отелей': 'the widest choice of hotels',
      'квартиры и дома у хозяев': 'rooms and homes from hosts',
      'часто дешевле вместе с перелётом': 'often cheaper bundled with a flight',
      'каждая 10-я ночь в подарок': 'every 10th night free',
      'сильна по Азии': 'strongest across Asia',
      'дома и квартиры целиком': 'entire homes and apartments',
      'цены рядом с отзывами': 'prices next to the reviews',
      'Ночей в городе': 'Nights here',
      'Без ночёвки': 'No overnight stay',
      'Проездом · жильё не ищем': 'Passing through — no place needed',

      /* ——— машина ——— */
      'Аренда машины': 'Car rental',
      'Забронировать машину': 'Book a car',
      'на всю поездку': 'for the whole trip',
      'забрать': 'pick up',
      'сдать': 'drop off',

      /* ——— день ——— */
      'Свободный день': 'Free day',
      'Убрать этот день': 'Remove this day',
      'Добавить место в этот день': 'Add a place to this day',
      'Показать на карте': 'Show on the map',
      'Открыть в Google Maps': 'Open in Google Maps',
      'если время': 'if there’s time',
      'по расписанию': 'fixed time',
      'ради этого едут': 'worth the trip on its own',
      'Куда перенести?': 'Move to which day?',
      'сейчас здесь': 'currently here',
      'Показать дальние дни': 'Show days further away',
      'Скрыть дальние дни': 'Hide days further away',

      /* ——— поделиться ——— */
      'Поделиться поездкой': 'Share this trip',
      'Создать ссылку': 'Create a link',
      'Скопировать ссылку': 'Copy link',
      'Ссылка скопирована': 'Link copied',
      'Перестать делиться': 'Stop sharing',
      'Показывать гостю бюджет и цены': 'Let them see the budget and prices',
      'Вы смотрите готовый план. Изменить его нельзя':
        'You’re viewing a finished plan. It can’t be edited',
      'Вы смотрите готовый план': 'You’re viewing a finished plan',
      'Изменить его может только тот, кто его создал':
        'Only the person who built it can make changes',

      /* ——— кабинет ——— */
      'ЛИЧНЫЙ КАБИНЕТ': 'YOUR ACCOUNT',
      'Мои поездки': 'My trips',
      'Новая поездка': 'New trip',
      'Сохранённые': 'Saved',
      'Недавно смотрели': 'Recently viewed',
      'Войти или зарегистрироваться': 'Sign in or create an account',
      'Посмотреть готовые маршруты': 'Browse ready-made routes',
      'Выйти из аккаунта': 'Sign out',
      'скоро': 'soon',


      /* ——— метки времени и режима дня ———
         Это самые частые подписи на странице: они стоят у каждой точки. */
      'утро': 'morning', 'утром': 'in the morning',
      'днём': 'midday', 'день': 'day', 'весь день': 'all day',
      'вечер': 'evening', 'вечером': 'in the evening',
      'закат': 'sunset', 'рассвет': 'sunrise',
      'завтрак': 'breakfast', 'обед': 'lunch', 'ужин': 'dinner',
      'обед/ужин': 'lunch or dinner',
      'по пути': 'on the way',
      'радиально': 'there and back', 'пешком': 'on foot',
      'на машине': 'by car', 'переезд': 'transfer',
      'прилёт': 'arrival', 'приезд': 'arrival', 'вылет': 'departure',
      'финал': 'last day', 'туда-обратно': 'round trip',
      'выезд': 'day trip', 'выезд на день': 'a day trip',

      /* ——— деньги и билеты ——— */
      'бесплатно': 'free', 'нужен билет': 'ticket needed',
      'вход в парк': 'park entry', 'на человека в день': 'per person per day',
      'Входы и активности': 'Tickets and activities',
      'Перелёт': 'Flights', 'Машина': 'Car', 'Жильё': 'Stays',
      'Транспорт': 'Transportation', 'Бензин': 'Gas', 'Багаж': 'Baggage',
      'Билеты': 'Tickets', 'за день': 'per day', 'на всех': 'for everyone',
      'на человека': 'per person', 'за ночь': 'per night', 'всего': 'total',
      'Итого': 'Total', 'в среднем': 'on average',

      /* ——— мелочи, которых много ——— */
      'кое-что': 'a few things', 'рядом': 'nearby', 'мин': 'min',
      'вег ok': 'veg-friendly',
      'если успеете': 'if you have time', 'если есть силы': 'if you’re up for it',
      'дата': 'date', 'место': 'place', 'места': 'places', 'мест': 'places',

      /* ——— разделы страницы ——— */
      'Где поесть': 'Where to eat', 'Готовые маршруты': 'Ready-made routes',
      'Ещё в городе': 'More in this city', 'Показать': 'Show',
      'Свернуть список': 'Collapse', 'Добавить строку': 'Add a line',


      /* ——— фильтры карты и списки выбора ——— */
      'Все базы': 'All cities', 'Все дни': 'All days', 'Все типы': 'All kinds',
      'Все рестораны': 'All restaurants', 'Главное': 'Highlights',
      'Выбери базу': 'Pick a city', 'Выбери день': 'Pick a day', 'Выбери тип': 'Pick a kind',
      'Базы': 'Cities', 'Города': 'Cities', 'Город': 'City', 'Дни': 'Days',
      'Природа': 'Nature', 'Источники': 'Hot springs', 'Бары': 'Bars',
      'Активность': 'Activity', 'Заправка': 'Gas station', 'Продукты': 'Groceries',
      'Другое': 'Other', 'Ресторан': 'Restaurant', 'Десерт': 'Dessert',
      'Аэропорт': 'Airport', 'Вариант': 'Option',

      /* ——— перелёт, подробности ——— */
      'Город прилёта': 'Arriving in', 'Дорога домой:': 'Getting home:',
      'В вашем билете обратный рейс': 'Your ticket has a return flight',
      'Вылет в': 'Departure at',

      /* ——— мелкие приписки к дню ——— */
      'в дороге': 'on the road', 'в этом городе не ночуем': 'no overnight here',
      'ночь в дороге': 'night on the move', 'последняя ночь в пути': 'last night on the move',
      'переезды по расписанию': 'scheduled transfers', 'обратно': 'back',
      'даты примерные, пока не вписан рейс': 'dates are approximate until you add your flight',

      /* ——— времена года (в подписях к местам) ——— */
      'Зима': 'Winter', 'Весна': 'Spring', 'Лето': 'Summer', 'Осень': 'Fall',

      /* ——— месяцы и дни недели ———
         ⚠️ Порядок в дате другой: по-русски «7 августа», по-английски
         «August 7». Одним словарём это не решается — правит fmtDate(). */
      'января': 'January', 'февраля': 'February', 'марта': 'March',
      'апреля': 'April', 'мая': 'May', 'июня': 'June',
      'июля': 'July', 'августа': 'August', 'сентября': 'September',
      'октября': 'October', 'ноября': 'November', 'декабря': 'December',

      'Здесь будут ваши поездки — все, что вы собрали и сохранили. Они хранятся в вашем аккаунте, поэтому нужен вход.':
        'Your trips will live here — everything you have built and saved. They are stored in your account, so you will need to sign in.',
      'Ссылка живая: поправите план — гость увидит новое. «Перестать делиться» закрывает её навсегда.':
        'The link stays live: fix the plan and they see the update. Stop sharing closes it for good.',
      'Тот, кому отправите ссылку, увидит план целиком: дни, места, карту. Менять он ничего не сможет, и регистрироваться ему не нужно.':
        'Whoever you send the link to sees the whole plan: days, places, map. They cannot change anything, and they do not need an account.',
      'км':
        'km',
      'ми':
        'mi',
      'Ваш рейс':
        'Your flight',
      'подобрать билеты':
        'find flights',
      'подобрать жильё на эти даты':
        'find a place for these dates',
      'Профиль высоты маршрута по дням':
        'Elevation along the route, day by day',
      'что сделать с жильём':
        'what to do with this stay',
      'что сделать со строкой':
        'what to do with this line',
      'изменить или удалить':
        'edit or delete',
      'показывать на карте':
        'show on the map',
      'показать на карте':
        'show on the map',
      'перенести или убрать':
        'move or remove',
      'меньше ночей':
        'fewer nights',
      'больше ночей':
        'more nights',
      'нажмите, чтобы скопировать':
        'tap to copy',
      'показать все точки':
        'show every place',
      'еда на карте':
        'food on the map',
      'цена берётся из карточек жилья':
        'the price comes from your lodging cards',
      'закрыть':
        'close',
      'закрыть меню':
        'close the menu',
      'валюта':
        'currency',
      'язык':
        'language',
      'градусы':
        'degrees',
      'расстояние':
        'distance',
      'аккаунт':
        'account',
      'Убрать из дня':
        'Remove from this day',
      'Убрать в «Ещё в городе»':
        'Move to “More in this city”',
      'Удалить место совсем':
        'Delete this place for good',
      'Убрать это жильё':
        'Remove this stay',
      'Поставить сюда':
        'Drop it here',
      'Сменить только символ':
        'Change the symbol only',
      'Сделать копию':
        'Make a copy',
      'Удалить поездку':
        'Delete this trip',
      'Создать':
        'Create',
      'убрать':
        'remove',
      'даты примерные — вы называли только месяц':
        'dates are approximate — you only gave us a month',
      'даты и месяц выбрали мы — поменяйте, когда решите':
        'we picked the dates and the month — change them once you decide',
      'отель не нужен':
        'no hotel needed',
      'ночь в пути':
        'night on the move',
      'Валюта поездки —':
        'Trip currency —',
      'Продолжить:':
        'Continue:',
      'Колорадо с 10 по 20 сентября, вдвоём. Билеты уже купили. Любим горы и поесть, города — по минимуму…':
        'Colorado, September 10–20, two of us. Flights are booked. We love mountains and good food, and want as little city as possible…',
      'а маршрут кончается':
        'and the route ends',
      'на границу и багаж':
        'for security and bags',
      'в аэропорту быть за':
        'be at the airport',
      'с этого дня и бронируем жильё.':
        'your stay is booked from this day on.',
      'км. По самому':
        'km. Around',
      'за городом (до':
        'out of town (up to',
      'копия':
        'copy',
      'Колорадо, США': 'Colorado, USA',
      'Юта, каньоны': 'Utah, canyon country',
      'Париж, Франция': 'Paris, France',
      'Милан и озеро Комо': 'Milan and Lake Como',
      'Нью-Йорк и Лос-Анджелес': 'New York and Los Angeles',
      'Исландия, юг острова': 'Iceland, the south coast',
      'Токио и Киото': 'Tokyo and Kyoto',
      'Водите ли вы': 'Do you drive',
      'Что уже забронировано': 'What is already booked',
      'Что в приоритете': 'What matters most',
      'Ванкувер': 'Vancouver',
      'Банф': 'Banff',
      'Денали': 'Denali',
      'Гавайи': 'Hawaii',
      'Квебек': 'Quebec',
      'Гавана': 'Havana',
      'Марракеш': 'Marrakesh',
      'Нуук': 'Nuuk',
      'Гиза': 'Giza',
      'Стамбул': 'Istanbul',
      'Петра': 'Petra',
      'Санторини': 'Santorini',
      'Москва': 'Moscow',
      'Эльбрус': 'Elbrus',
      'Пекин': 'Beijing',
      'Бангкок': 'Bangkok',
      'Катманду': 'Kathmandu',
      'Халонг': 'Ha Long',
      'Байкал': 'Baikal',
      'Камчатка': 'Kamchatka',
      'Остров Пасхи': 'Easter Island',
      'Таити': 'Tahiti',
      'Галапагосы': 'Galapagos',
      'Мачу-Пикчу': 'Machu Picchu',
      'Рио-де-Жанейро': 'Rio de Janeiro',
      'Патагония': 'Patagonia',
      'Буэнос-Айрес': 'Buenos Aires',
      'Ла-Пас': 'La Paz',
      'Кейптаун': 'Cape Town',
      'Килиманджаро': 'Kilimanjaro',
      'Мадагаскар': 'Madagascar',
      'Маврикий': 'Mauritius',
      'Сидней': 'Sydney',
      'Улуру': 'Uluru',
      'Квинстаун': 'Queenstown',
      'Бали': 'Bali',
      'куда едете?': 'where are you going?',
      'когда едете?': 'when are you going?',
      'с кем едете?': 'who is going?',
      'есть места на примете?': 'any places in mind?',
      'водите ли вы?': 'do you drive?',
      'что уже забронировано?': 'what is already booked?',
      'что в приоритете?': 'what matters most?',
      'План поездки по дням: карта, жильё, где поесть, бюджет.': 'Your trip planned day by day: map, places to stay, where to eat, budget.',
      'Разделы сайта': 'Site sections',
      'меньше человек': 'fewer travelers',
      'больше человек': 'more travelers',
      'Закрыть карту': 'Close the map',
      /* буква на кружке аккаунта до входа: по-русски «Я», по-английски «Me» */
      'Я': 'M',
      /* ═══ ВЕСЬ ОСТАВШИЙСЯ ТЕКСТ ИНТЕРФЕЙСА ═══
         Собран прогоном по всему index.html, а не по одному экрану.
         Её замечание 07.08: «ты должен был вытащить весь текст с сайта,
         разделить на категории и делать переводы» — до этого я мерила
         только ленту маршрута, и меню, кабинет, окна и анкета остались
         русскими при отчёте «интерфейс переведён целиком». */
      '(часть времени прикинута)': '(some of this is estimated)',
      '+ добавить': '+ add',
      '10 часов — как ходит большинство': '10 hours — what most people manage',
      '11-й': '11th',
      '12 часов, успеть максимум': '12 hours, fit in everything you can',
      '12-й': '12th',
      '13-й': '13th',
      '14-й': '14th',
      '2 ч': '2 hr',
      '3 ч': '3 hr',
      'constructor.js не загружен': 'constructor.js didn’t load',
      'KOLIBRI Pro · маршрут': 'KOLIBRI Pro · route',
      '~1,5 ч': '~1.5 hr',
      '~45 мин': '~45 min',
      '«Перестать делиться» закрывает её навсегда.': '“Stop sharing” closes it for good.',
      '» в': '” in',
      '» взят в этот день — идёт продолжением маршрута':
        '” is added to this day and continues the route',
      '» влезает в этот день вдобавок к выбранному: выйдет':
        '” also fits into this day alongside what you picked: that makes',
      '» теперь на карте': '” is on the map now',
      '» убрали в «Ещё в городе»': '” moved to “More in this city”',
      '» — маршрут тот же, даты и дни поменяете':
        '” — same route; you can change the dates and days',
      '» → День': '” → Day',
      '». Подвинь карту так, чтобы крестик встал на дом, и нажми «Поставить сюда».':
        '”. Drag the map so the crosshair sits on the building, then tap “Drop it here.”',
      '». Уберите их из дней, если не поедете':
        '”. Drop them from your days if you’re not going',
      'август': 'August',
      'август: дороги открыты, светло почти круглые сутки':
        'August: the roads are open and it barely gets dark',
      'автобус': 'bus',
      'адрес или ссылка на Google Maps': 'address or Google Maps link',
      'Адрес не нашёлся. Подвинь карту так, чтобы крестик встал на нужное место, и нажми «Поставить сюда».':
        'Address not found. Drag the map so the crosshair is on the right spot, then tap “Drop it here.”',
      'Аккаунт создан! Теперь войди.': 'Account created — now sign in.',
      'Аккаунт создан. Подтверди почту и войди.':
        'Account created. Confirm your email, then sign in.',
      'активностей': 'activities',
      'активности': 'activities',
      'активность': 'activity',
      'анкета:': 'answers:',
      'апрель': 'April',
      'Аспен': 'Aspen',
      'баз': 'cities',
      'база': 'city',
      'базы': 'cities',
      'бар': 'bar',
      'Бат': 'Bath',
      'без машины туда только с экскурсией или на такси — например «':
        'without a car you’ll need a tour or a cab — for example, “',
      'Без машины: метро и синкансэн': 'No car: Métro and the shinkansen',
      'без ночёвки ·': 'no overnight ·',
      'беру в': 'picking it up in',
      'билеты': 'tickets',
      'блоков данных:': 'data blocks:',
      'Брайс': 'Bryce',
      'быстро перекусить': 'a quick bite',
      'в аэропорт вылета': 'to the departure airport',
      'в городе': 'in the city',
      'в день': 'per day',
      'в дороге —': 'on the move —',
      'В какой валюте считать': 'Which currency to use',
      'в маршруте задумано': 'the route was designed for',
      'в маршруте столько дней не задумано. Дни поставили, но наполнять их вам — или уберите их кнопкой «−»':
        'the route wasn’t designed to run this long. We added the days, but filling them is on you — or drop them with the “−” button',
      'в нём не было обязательных мест': 'it had no must-see places',
      'в пути': 'on the way',
      'В файле поездок:': 'Trips in the file:',
      'В чём показывать расстояния': 'Units for distance',
      'В чём показывать температуру': 'Units for temperature',
      'в эти дни без машины не обойтись': 'you can’t manage these days without a car',
      'в этот день': 'that day',
      'в этот день закрыт': 'closed that day:',
      'в этот день закрыто': 'closed that day',
      'в этот день закрыты': 'closed that day:',
      'Валюта поездки': 'Trip currency',
      'вариант': 'option',
      'ваш выбор': 'your call',
      'ваши ответы совпали с тем, как он задуман': 'your answers matched how it was designed',
      'Введи email и пароль': 'Enter your email and password',
      'Вечером уезжаем:': 'We leave in the evening:',
      'взрослые': 'adults',
      'взрослый': 'adult',
      'взрослых': 'adults',
      'Взяли маршрут как есть': 'We took the route as it is',
      'Взять в этот день': 'Add to this day',
      'Вик': 'Vík',
      'вместо ночи ·': 'instead of a night ·',
      'Водопады, чёрные пляжи, ледниковая лагуна':
        'Waterfalls, black beaches, a glacier lagoon',
      'вожу, но недолго': 'I drive, but not for long',
      'вожу, поеду сколько нужно': 'I drive, as far as it takes',
      'войдите, чтобы поездки открывались с любого устройства':
        'sign in so your trips open on any device',
      'вопрос': 'question',
      'вопроса': 'questions',
      'вопросов': 'questions',
      'восемь': 'eight',
      'Восстановить': 'Restore',
      'Восстановить из файла': 'Restore from a file',
      'Восстановить из файла?': 'Restore from a file?',
      'восьмой': 'eighth',
      'Впишите то, что стоит в билете — и все даты перестанут быть примерными':
        'Enter what’s on your ticket and the dates stop being guesses',
      'время': 'time',
      'все аэропорты ·': 'all airports ·',
      'Все рестораны из нашей подборки — ещё': 'All the restaurants we picked — plus',
      'Все рестораны —': 'All restaurants —',
      'Все суммы пересчитаны по курсу.': 'All amounts converted at the current rate.',
      'Все цены в бюджете и в жилье покажем в ней. Уже введённые суммы пересчитаем по курсу.':
        'We’ll show every budget and lodging price in it, and convert what you’ve already entered.',
      'Всего за': 'Total for',
      'всё не влезает: до него': 'it doesn’t all fit — getting there takes',
      'Всё равно собрать — машина будет': 'Build it anyway — with a car',
      'Всё, что нужно, у нас есть — можно собирать':
        'We have everything we need — let’s build it',
      'Всё, что сейчас в этом браузере, будет заменено.':
        'Everything currently in this browser will be replaced.',
      'второй': 'second',
      'входит в него.': 'is part of it.',
      'вы водите, а': 'you drive, and',
      'Вы не вошли': 'You’re not signed in',
      'вы ответили, что не водите. По': 'you told us you don’t drive. Around',
      'вы просили недолго за рулём, но другой дороги тут нет. Разбить переезд ночёвкой негде — в этом маршруте такой точки нет':
        'you asked for short drives, but there’s no other road here — and nowhere to break the drive with an overnight stop',
      'Вы сказали': 'You said',
      'Выбрано:': 'Selected:',
      'Главная страница': 'Home',
      'город': 'city',
      'город без машины': 'one city, no car',
      'город вылета': 'departure city',
      'город и выезд на день': 'one city plus a day trip',
      'город прилёта': 'arrival city',
      'города': 'cities',
      'городов': 'cities',
      'гостей': 'guests',
      'гость': 'guest',
      'гостя': 'guests',
      'Готово': 'Done',
      'Готового маршрута по': 'We don’t have a ready-made route for',
      'градусы по Фаренгейту': 'degrees Fahrenheit',
      'градусы по Цельсию': 'degrees Celsius',
      'Далеко от этого места': 'Far from this stop',
      'Данные: Open-Meteo, архив наблюдений. В конкретный год может быть заметно теплее или холоднее.':
        'Source: Open-Meteo observation archive. Any given year can run noticeably warmer or colder.',
      'Даты поставим примерные и так и подпишем — вы поменяете их в маршруте.':
        'We’ll put in approximate dates and label them as such — you can change them in the plan.',
      'два': 'two',
      'две': 'two',
      'две недели': 'two weeks',
      'двенадцать': 'twelve',
      'девятый': 'ninth',
      'девять': 'nine',
      'декабрь': 'December',
      'Денвер': 'Denver',
      'десятый': 'tenth',
      'десять': 'ten',
      'детей': 'children',
      'дети': 'children',
      'дней': 'days',
      'дней нет — в городе не ночуем': 'no days — we don’t sleep in this city',
      'дни города ждут в «Ещё в городе», жильё и брони убрали':
        'that city’s days are waiting under “More in this city”; we removed the stay and the bookings',
      'дня': 'days',
      'Добавили «': 'Added “',
      'Добавить': 'Add',
      'Добавить место': 'Add a place',
      'Доллар': 'Dollar',
      'дорога': 'the drive',
      'дорога в аэропорт вылета': 'getting to the departure airport',
      'дорога из дома в начало маршрута': 'getting from home to the start of the route',
      'дороги, а обязательных мест меньше, чем у соседей':
        'of driving, and it has fewer must-sees than its neighbors',
      'другое': 'other',
      'Дуранго': 'Durango',
      'Евро': 'Euro',
      'еда': 'food',
      'если есть на примете — можно списком': 'if you have places in mind, list them',
      'Есть готовый маршрут «': 'There is a ready-made route, “',
      'Есть несохранённые правки': 'You have unsaved edits',
      'ещё': 'more',
      'ещё билеты': 'more tickets',
      'ещё бронь': 'another booking',
      'ещё жильё': 'another place',
      'ещё машину': 'another car',
      'ещё паром': 'another ferry',
      'ещё поезд': 'another train',
      'ещё событие': 'another event',
      'жилья': 'places to stay',
      'жильё': 'a place to stay',
      'Жильё ·': 'Stay ·',
      'за ночь — цена ушла в бюджет': 'per night — the price went into the budget',
      'за рулём': 'behind the wheel',
      'за человека': 'per person',
      'забрать ·': 'pick up ·',
      'Загружаю список аэропортов…': 'Loading the airport list…',
      'Заезд, выезд и число гостей уже известны — их не спрашиваем. Заполни любое из двух полей, второе посчитается. Цена уйдёт в бюджет, в строку жилья этого города.':
        'We already know your check-in, check-out and party size, so we won’t ask. Fill in either field and we’ll work out the other. The price goes into the budget, on this city’s lodging line.',
      'Зайон': 'Zion',
      'Зайон, Брайс и Арки за неделю': 'Zion, Bryce and Arches in a week',
      'закладка:': 'bookmark:',
      'закрыто': 'closed',
      'Записали жильё': 'Stay saved',
      'Зарегистрироваться': 'Create account',
      'Здесь будут ваши поездки — все, что вы собрали и сохранили.':
        'Your trips will live here — everything you’ve built and saved.',
      'знаю только месяц': 'I only know the month',
      'знаю только сколько дней': 'I only know how many days',
      'и усреднили.': 'averaged out.',
      'Из «Ещё в городе» ·': 'From “More in this city” ·',
      'из аэропорта в город': 'airport to city',
      'из них': 'of them',
      'Изменили «': 'Changed “',
      'Изменили жильё': 'Stay updated',
      'Изменить': 'Edit',
      'изменить': 'edit',
      'Изменить жильё': 'Edit your stay',
      'Изменить место': 'Edit this place',
      'Изменить название и подпись': 'Edit the name and caption',
      'Изменить название и цену': 'Edit the name and price',
      'Изменить строку': 'Edit this line',
      'или': 'or',
      'Или попробовать по адресу': 'Or try it by address',
      'июль': 'July',
      'июнь': 'June',
      'Как назовём': 'What should we call it',
      'Какие места хотите посетить': 'What do you want to see',
      'Какой день убрать?': 'Which day should go?',
      'Канадский': 'Canadian',
      'Карта не отрисовалась': 'The map didn’t draw',
      'кафе': 'café',
      'километры': 'kilometers',
      'Киото': 'Kyoto',
      'Когда': 'When',
      'Когда стартуете': 'When do you start',
      'Конец считать не нужно: длина маршрута уже посчитана, от даты старта пересчитаются все дни, брони и цены.':
        'No need to work out the end date: we know how long the route is, and everything recalculates from your start date.',
      'концерт, свадьба, фестиваль': 'a concert, a wedding, a festival',
      'копия «': 'copy of “',
      'Копия готова': 'Copy is ready',
      'копия от': 'copy from',
      'который': 'which',
      'круглосуточно': 'open 24 hours',
      'крюк': 'a detour',
      'Кто едет': 'Who’s going',
      'Кто получил её раньше, больше поездку не увидит':
        'Anyone who already has it will lose access',
      'Куда едете': 'Where are you going',
      'Курс не загрузился': 'Couldn’t load the exchange rate',
      'лежат за городом — до': 'are out of town — up to',
      'Летим из': 'Flying from',
      'Лира': 'Lira',
      'Лос-Анджелес': 'Los Angeles',
      'май': 'May',
      'март': 'March',
      'маршрут не посчитать': 'we can’t work out the route',
      'маршрут пока пустой': 'the route is still empty',
      'Маршрут,': 'A route',
      'машина': 'car',
      'Машина будет': 'We’ll take a car',
      'машина не нужна, её можно взять не на все дни':
        'you don’t need a car here; you can rent it for part of the trip',
      'Машина нужна — берём её здесь же.': 'You need a car — pick it up here.',
      'Машину не берём': 'No car',
      'между городами нет ни поездов, ни автобусов — мы собрали с машиной. Иначе поездка не существует':
        'there are no trains or buses between these cities — we built it around a car. Otherwise the trip doesn’t exist',
      'Менять он ничего не сможет, и регистрироваться ему не нужно.':
        'They can’t change anything, and they don’t need an account.',
      'Место с карты рядом с этой точкой маршрута.':
        'A place from the map near this stop on your route.',
      'месяц подскажем сами': 'we’ll suggest the month',
      'метка на карте есть': 'it has a pin',
      'Метро и пешком, Версаль поездом': 'Métro and on foot; Versailles by train',
      'Метро на востоке, машина на западе': 'Métro out east, a car out west',
      'Милан': 'Milan',
      'мили': 'miles',
      'миль': 'miles',
      'миля': 'mile',
      'минут': 'minutes',
      'минута': 'minute',
      'минуты': 'minutes',
      'Моаб': 'Moab',
      'Можно взять машину с водителем, но подобрать её мы пока не умеем':
        'You could hire a car with a driver, though we can’t book that for you yet',
      'Можно открыть его целиком и убрать лишние дни внутри':
        'You can open the full route and drop days inside it',
      'мороженое': 'ice cream',
      'Мы показываем, сколько тут обычно бывает в эти же числа: взяли настоящие замеры за':
        'We show what it’s usually like on these dates: real observations from',
      'на Google Maps': 'on Google Maps',
      'на всю поездку ·': 'for the whole trip ·',
      'на выезде —': 'away —',
      'на выезде:': 'away:',
      'на маршрут времени в этот день нет': 'there’s no route time left in this day',
      'на маршрут остаётся': 'leaves you',
      'на машине — её и сдаём в аэропорту': 'by car — you drop it at the airport',
      'на машине, сдаём её там': 'by car, dropped off there',
      'на местах': 'at the stops',
      'на метро или поезде': 'by metro or train',
      'Нажмите день приезда, потом день отъезда':
        'Tap your arrival day, then your departure day',
      'нажмите, чтобы сменить город вылета': 'tap to change your departure city',
      'Найти и добавить': 'Find and add',
      'Найти точку': 'Find the spot',
      'Настройки': 'Settings',
      'Насыщенно': 'Packed',
      'начало': 'start',
      'Не больше трёх — иначе это не приоритет.':
        'Pick up to three — more than that isn’t a priority.',
      'не водим ночью': 'no driving at night',
      'не вожу и не хочу': 'I don’t drive and don’t want to',
      'Не заполнено:': 'Still missing:',
      'Не получилось': 'That didn’t work',
      'Не получилось развернуть короткую ссылку.\\n\\nВставь вместо неё название места, например «Durango Wildlife Museum», — найду его на карте.':
        'Couldn’t expand that short link.\\n\\nPaste the place name instead — “Durango Wildlife Museum,” say — and I’ll find it on the map.',
      'Не получилось разобрать ссылку. Вставь название места — найду по нему.':
        'Couldn’t read that link. Paste the place name and I’ll find it.',
      'не поместились в дни': 'didn’t fit into the days',
      'не тут:': 'not here:',
      'Не удалось открыть поездку': 'Couldn’t open the trip',
      'Не удалось открыть поездку:': 'Couldn’t open the trip:',
      'Не удалось открыть: нет связи с облаком':
        'Couldn’t open it — no connection to the cloud',
      'не читается': 'can’t be read',
      'неделю': 'a week',
      'неделя': 'week',
      'неизвестная причина': 'reason unknown',
      'нет': 'no',
      'Нет связи': 'No connection',
      'Нет связи со справочником курсов. Можно сменить символ на':
        'No connection to the rates service. You can still switch the symbol to',
      'ничего': 'nothing',
      'ничего не забронировано': 'nothing booked yet',
      'Ничего не нашли. Попробуйте иначе или введите код аэропорта — например MIA.':
        'Nothing found. Try another spelling, or enter the airport code — MIA, for example.',
      'Ничего не убирать': 'Don’t drop anything',
      'но суммы останутся прежними числами — их придётся поправить руками.':
        'but the amounts stay the same numbers — you’ll have to fix them by hand.',
      'Новое место': 'New place',
      'ночей': 'nights',
      'Ночей поставлено 0, поэтому жильё тут не ищем и в бюджет ничего не считаем. Вернёшь ночь — вернётся и блок.':
        'Nights are set to 0, so we don’t look for a place here and add nothing to the budget. Put a night back and the block returns.',
      'ночи': 'nights',
      'ночуем на выезде:': 'sleeping away:',
      'ночь': 'night',
      'Ночь в этом городе не нужна: вечером садимся на':
        'No room needed here: in the evening you board the',
      'ночь на выезде ·': 'night away ·',
      'Ночь проводим в дороге:': 'You spend this night on the move:',
      'ноябрь': 'November',
      'ноябрь: клёны краснеют, дожди кончились':
        'November: the maples turn red and the rains are done',
      'Нужен .json, который сделала кнопка «Сохранить всё в файл»':
        'We need the .json that “Save everything to a file” produced',
      'Нью-Йорк': 'New York',
      'О чём надо знать': 'What you should know',
      'Облако не приняло ссылку': 'The cloud wouldn’t take that link',
      'Облако сейчас недоступно, ссылку не создать':
        'The cloud is down right now, so we can’t make a link',
      'Обновите страницу, чтобы увидеть новую версию. Пока страница только для просмотра — правки на ней сохранить нельзя':
        'Refresh to see the new version. Until then the page is read-only and edits won’t save',
      'Обновить': 'Refresh',
      'Обновить страницу': 'Refresh the page',
      'Обратно': 'Back',
      'обратно: город вылета': 'back: departure city',
      'обратно: город прилёта': 'back: arrival city',
      'Ограничения': 'Anything to work around',
      'один': 'one',
      'одиннадцать': 'eleven',
      'одну': 'one',
      'Озеро Комо — поездом и катером, без ночёвки':
        'Lake Como by train and boat, no overnight',
      'октябрь': 'October',
      'октябрь: в каньонах уже не +40, а вода в Narrows ещё тёплая':
        'October: the canyons aren’t 105°F anymore, and the water in the Narrows is still warm',
      'октябрь: в Нью-Йорке уже не жарко, в Калифорнии ещё тепло':
        'October: no longer hot in New York, still warm in California',
      'он был последним в городе': 'it was the last day in that city',
      'он был свободным': 'it was a free day',
      'Она лежит в разделе «Мои поездки»': 'It’s under “My trips”',
      'Они хранятся в вашем аккаунте, поэтому нужен вход.':
        'They’re stored in your account, so you’ll need to sign in.',
      'основной план': 'the main plan',
      'особый повод': 'a special occasion',
      'остались в «Ещё в городе»': 'are waiting under “More in this city”',
      'Осталось': 'Left',
      'Остался один вопрос — без него': 'One question left — without it',
      'Остаться': 'Stay',
      'от аэропорта до первого города': 'from the airport to the first city',
      'Открой страницу по обычной ссылке (Netlify/GitHub) в браузере при интернете. Список и ссылки на Google Maps работают всегда.':
        'Open the page from its normal link in a browser while you’re online. The list and the Google Maps links always work.',
      'откройте, чтобы посчитать дни': 'open it to count the days',
      'Открываем поездку…': 'Opening your trip…',
      'Открывайте и меняйте под себя: дни, людей, даты. Всё пересчитается.':
        'Open it and make it yours: days, travelers, dates. Everything recalculates.',
      'Открытые карты знают не каждый дом: если адреса нет в базе, точка садится в центр города. Тогда ставь её крестиком — так надёжнее.':
        'Open maps don’t know every building: if an address isn’t in the database, the pin lands in the city center. Place it with the crosshair instead — that’s more reliable.',
      'Открыть «': 'Open “',
      'Открыть в Google Maps →': 'Open in Google Maps →',
      'Открыть маршрут': 'Open the route',
      'Откуда летите': 'Where are you flying from',
      'откуда эти градусы': 'where these numbers come from',
      'Отправить…': 'Sending…',
      'отъезд': 'departure',
      'Ошибка': 'Something went wrong',
      'Ошибка сети:': 'Network error:',
      'паб': 'pub',
      'Париж': 'Paris',
      'Паровоз, скальные города и перевалы': 'A steam train, cliff cities and mountain passes',
      'Пароль минимум 6 символов': 'Password must be at least 6 characters',
      'пекарня': 'bakery',
      'первый': 'first',
      'Первым делом — заселение:': 'Check in first —',
      'переезд в следующий город': 'transfer to the next city',
      'переезды и «до места»': 'drives and “distance to”',
      'Переименовать': 'Rename',
      'перелёт домой': 'flight home',
      'перелёт из дома в начало маршрута': 'flight from home to the start of the route',
      'перелёт между городами поездки': 'flight between cities on the trip',
      'перелёт посреди поездки': 'a flight mid-trip',
      'Перерыв ·': 'Break ·',
      'Песо': 'Peso',
      'пивной сад': 'beer garden',
      'пик': 'peak',
      'Пишите по-русски или латиницей — найдётся и так, и так. Выберите строку из списка: рядом видно регион и страну, чтобы не перепутать одноимённые города.':
        'Type it in any spelling — we’ll find it. Pick a line from the list: the region and country are shown so you don’t end up in the wrong namesake city.',
      'погода в городах': 'weather in each city',
      'Погода примерная': 'Weather is approximate',
      'Подвинь карту так, чтобы крестик встал на нужное место.':
        'Drag the map so the crosshair sits on the right spot.',
      'Подобрать рейсы': 'Find flights',
      'подогнали под ваши': 'trimmed to your',
      'подписи:': 'labels:',
      'Подписка': 'Subscription',
      'Подробности': 'Details',
      'поездка': 'trip',
      'Поездка': 'Trip',
      'Поездка короче, чем маршрут': 'Your trip is shorter than the route',
      'Поездка на': 'A trip of',
      'Поездка сохранена': 'Trip saved',
      'поездка станет короче на день. Пока ничего не убрано':
        'the trip gets a day shorter. Nothing has been dropped yet',
      'Поездку изменили на другом устройстве': 'This trip was changed on another device',
      'Поездку изменили на другом устройстве — страница пока только для просмотра':
        'This trip was changed on another device — for now this page is read-only',
      'Поездок:': 'Trips:',
      'Позже': 'Later',
      'Пока не сохранилось': 'Not saved yet',
      'Показать все города (': 'Show all cities (',
      'Показать дальние дни ·': 'Show days further away ·',
      'Показать на нашей карте': 'Show on our map',
      'Помощь и контакты': 'Help and contacts',
      'Поправить точку': 'Fix the pin',
      'Поправить точку на карте': 'Fix the pin on the map',
      'Попробовать сейчас': 'Try it now',
      'последняя ночь в пути ·': 'last night on the move ·',
      'посчитаем вместе с остальными': 'we’ll count it with the rest',
      'Правильно поняли?': 'Did we get that right?',
      'Правки на месте, ничего не пропало': 'Your edits are safe — nothing was lost',
      'предлагаем': 'we suggest',
      'Прилетаем в': 'Landing in',
      'Проверка не прошла': 'That didn’t check out',
      'пройдите анкету': 'answer a few questions',
      'Профиль': 'Profile',
      'профиль высоты маршрута': 'elevation along the route',
      'прошлого года': 'last year',
      'пусто': 'empty',
      'пятый': 'fifth',
      'пять': 'five',
      'Расскажите про поездку': 'Tell us about your trip',
      'Расскажите про поездку своими словами — вернём готовый план по дням, с картой, жильём и бюджетом.':
        'Describe your trip in your own words and we’ll hand back a day-by-day plan, with a map, places to stay and a budget.',
      'ребёнок': 'child',
      'Рейкьявик': 'Reykjavík',
      'ресторан': 'restaurant',
      'решаем мы': 'we decide',
      'решите за меня': 'decide for me',
      'Рубль': 'Ruble',
      'Русский': 'Russian',
      'сюда попадают только полностью переведённые языки':
        'only fully translated languages show up here',
      'Рядом подходящих дней нет.': 'There’s no suitable day nearby.',
      'Рядом с этой точкой мы ничего не нашли — время на еду заложено, место выбери на месте.':
        'We found nothing near this stop — the time for a meal is set aside, so pick a spot when you’re there.',
      'с остановками': 'with stops',
      'свободный день': 'free day',
      'Свободный день ·': 'Free day ·',
      'Свободный день — планы пока не заданы.': 'A free day — nothing planned yet.',
      'свободных дней': 'free days',
      'свободных дня': 'free days',
      'Своя строка в бюджете': 'Your own budget line',
      'своё — напишите словами': 'something else — just write it',
      'сдать ·': 'drop off ·',
      'сдаю в': 'dropping it off in',
      'сегодня умеем собрать Колорадо и Юту. Впишите одно из них — или подождите, мы открываем новые направления':
        'today we can build Colorado and Utah. Enter one of those — or hold tight, we’re adding destinations',
      'седьмой': 'seventh',
      'сейчас': 'now',
      'семь': 'seven',
      'сентябрь': 'September',
      'сентябрь: жара спала, а террасы ещё открыты':
        'September: the heat has passed and the terraces are still open',
      'сентябрь: на озере ещё тепло, а в городе уже не душно':
        'September: still warm on the lake, no longer stifling in the city',
      'сентябрь: осины золотые, жара спала, толпы разъехались':
        'September: golden aspens, the heat has broken, the crowds are gone',
      'Символ сменили на': 'Symbol changed to',
      'Скажем сами, в каком месяце туда лучше всего, и объясним почему.':
        'We’ll tell you the best month to go, and why.',
      'Скопировано': 'Copied',
      'скоростной поезд': 'high-speed train',
      'смотри в дне': 'see it in the day',
      'смотрим': 'we look at',
      'соберём маршрут по твоим ответам': 'we’ll build the route from your answers',
      'собран под вас': 'built around you',
      'Сохранено': 'Saved',
      'Сохраним их в аккаунт и перейдём дальше': 'We’ll save them to your account and move on',
      'Сохранить всё в файл': 'Save everything to a file',
      'сохранить поездку': 'save this trip',
      'Список не загрузился. Обновите страницу и попробуйте снова.':
        'The list didn’t load. Refresh the page and try again.',
      'Спокойно': 'Easy',
      'Спросим только то, без чего маршрут не собрать': 'We’ll only ask what we actually need',
      'Средне': 'Steady',
      'Ссылка живая: поправите план — гость увидит новое.':
        'The link stays live: fix the plan and they see the update.',
      'Ссылка закрыта': 'This link is closed',
      'старт': 'start',
      'страница от': 'page from',
      'Суммы не пересчитаны — проверь их.': 'The amounts weren’t converted — check them.',
      'Такого направления у нас пока нет': 'We don’t cover that destination yet',
      'Такой ссылки нет — возможно, её закрыли': 'No such link — it may have been closed',
      'Тап «в день» — место встанет в выбранный день. Вернёшь ночь — вернётся и убранный день.':
        'Tap “to day” and the place moves into that day. Put a night back and the dropped day returns.',
      'твоё жильё': 'your own place',
      'Темп': 'Pace',
      'Тенге': 'Tenge',
      'Теперь нажмите день отъезда': 'Now tap your departure day',
      'Токио': 'Tokyo',
      'Тот, кому отправите ссылку, увидит план целиком: дни, места, карту.':
        'Whoever you send the link to sees the whole plan: days, places, map.',
      'точек': 'places',
      'точка': 'place',
      'точка на карте есть — видно при выборе города или дня':
        'it has a pin — visible when you pick a city or a day',
      'Точка примерная — центр города, поправь её': 'Rough pin — city center; move it',
      'точки': 'places',
      'Точки на карте нет — не нашли адрес': 'No pin — we couldn’t find the address',
      'точку на карте не нашли: открой «⋯» у места и нажми «Поставить точку на карте»':
        'we couldn’t place this one: open “⋯” on the place and tap “Drop a pin on the map”',
      'Точку найти не удалось. Попробуй вставить ссылку на место из Google Maps — в ней есть адрес.':
        'We couldn’t find it. Try pasting a Google Maps link instead — it carries the address.',
      'Точку поставили примерно': 'We placed the pin roughly',
      'точку поставили примерно — в центре города, поправь её через «⋯»':
        'we placed the pin roughly, in the city center — fix it under “⋯”',
      'Точный адрес в открытых картах не нашёлся — точка стоит в центре города «':
        'Open maps didn’t have the exact address, so the pin sits in the center of “',
      'трансфер': 'transfer',
      'третий': 'third',
      'три': 'three',
      'Туда': 'Out',
      'У меня уже есть жильё': 'I already have a place',
      'у нас нет': 'yet',
      'Убрали День': 'Dropped day',
      'убрать из сохранённых': 'remove from saved',
      'Убрать рейс': 'Remove this flight',
      'Удалили «': 'Deleted “',
      'уезжаем вечером': 'leaving in the evening',
      'уже введённые суммы пересчитаем по курсу':
        'we’ll convert the amounts you’ve already entered',
      'Уже есть аккаунт? Нажми «Вход».': 'Already have an account? Tap “Sign in.”',
      'Урей': 'Ouray',
      'Условия': 'Terms',
      'Услышали ещё — учтём при сборке': 'We also heard this, and we’ll use it',
      'Файл сохранился в загрузки. На новом адресе открой меню → «Восстановить из файла».':
        'The file went to your downloads. At the new address, open the menu → “Restore from a file.”',
      'февраль': 'February',
      'Фунт': 'Pound',
      'Хорошо, позже': 'OK, later',
      'Хёбн': 'Höfn',
      'Цена за ночь': 'Price per night',
      'ч чистого хода': 'hr of driving',
      'Часы работы:': 'Hours:',
      'через': 'via',
      'четвёртый': 'fourth',
      'четыре': 'four',
      'чистого хода': 'of driving',
      'что забронировано': 'what’s booked',
      'Что поняли — отмечено галочкой. Меняйте что угодно':
        'What we understood is checked. Change anything you like',
      'Что сделали': 'What we did',
      'что сделать с поездкой': 'what to do with this trip',
      'что это': 'what’s this',
      'чтобы отличать поездки в списке': 'so you can tell your trips apart',
      'шар:': 'globe:',
      'шестой': 'sixth',
      'шесть': 'six',
      'экскурсия, ресторан, спа, билет в музей': 'a tour, a restaurant, a spa, a museum ticket',
      'эта ночь не тут:': 'this night is not here:',
      'это было твоё место, в маршруте его больше нет':
        'this was your own place, and it’s no longer in the route',
      'это весь день в дороге. Выезжайте рано и не ставьте на этот день ничего сверху':
        'this is a full day on the road. Leave early and don’t stack anything else onto it',
      'это наша ошибка сборки — напишите нам': 'that’s a mistake on our side — write to us',
      'Это не наш файл': 'That’s not one of our files',
      'Этого раздела ещё нет — сделаем следующим': 'This section doesn’t exist yet — it’s next',
      'этот маршрут не раскладывается: даже по одной ночи на город нужно больше. Оставили начало и конец':
        'this route doesn’t fit: even one night per city needs more. We kept the start and the end',
      'Юта · Париж · Норвегия · Япония · Патагония':
        'Utah · Paris · Norway · Japan · Patagonia',
      'Язык сайта': 'Site language',
      'январь': 'January',
      '— без них': '— without them',
      '— без ночёвки': '— no overnight',
      '— выбери город или день, чтобы увидеть точки':
        '— pick a city or a day to see the places',
      '— дорога между городами. Поездов и автобусов там нет: это не наша лень, их правда нет.':
        '— that’s the drive between cities. There are no trains or buses out there — not laziness on our part, they genuinely don’t exist.',
      '— пешком, на местном транспорте и такси': '— on foot, local transit and cabs',
      '— проездом, без ночёвки': '— passing through, no overnight',
      '— спросим только нужное': '— we’ll only ask what matters',
      '— среднее дневное,': '— average daytime,',
      '— среднее ночное.': '— average nighttime.',
      '— уточните': '— tell us more',
      '← назад': '← back',
      '→ вылет домой': '→ flight home',

      'вс': 'Sun', 'пн': 'Mon', 'вт': 'Tue', 'ср': 'Wed',
      'чт': 'Thu', 'пт': 'Fri', 'сб': 'Sat',

      /* ═══ ДОБАВЛЕНО 06.08 ВЕЧЕРОМ ═══
         Список собран не из кода, а с ОТРИСОВАННОЙ страницы: прогон открывает
         её по-английски и выписывает всё, что осталось русским. Так видно
         ровно то, что видит человек, и ключ совпадает с текстом на экране. */

      /* ——— разделы и навигация ——— */
      'Маршрут по дням': 'Day by day',
      'День за днём': 'Itinerary',
      'Гид по городам': 'Where to eat, city by city',
      'Еда и кафе': 'Food & coffee',
      'Бюджет и жильё': 'What it costs',
      'Деньги': 'Money',
      'Моя поездка': 'My trip',
      'Показать всё': 'Show all',
      'Свернуть ▴': 'Show less ▴',
      'Только главное': 'Highlights only',
      'На карте:': 'On the map:',

      /* ——— день и точки ——— */
      'Отметить день': 'Select every place',
      'Снять день': 'Clear them all',
      'Снять всё': 'Clear all',
      'Маршрут в Google Maps →': 'Directions in Google Maps →',
      'обязательно': 'a must',
      'нет точки на карте': 'not on the map yet',
      'точка примерная': 'rough location',
      'точка примерная — ищи по названию': 'rough location — search by name',
      'Выбери свой вариант активности': 'Pick what you’d rather do',
      'Как мы собрали': 'How we planned this',
      'Вернуться и поменять ответ': 'Go back and change it',
      'Собрать маршрут': 'Build my trip',

      /* ——— еда в цепочке дня ——— */
      'Завтрак': 'Breakfast', 'Обед': 'Lunch', 'Ужин': 'Dinner',
      'Перекус': 'Snack', 'Вечер': 'Evening', 'После обеда': 'Afternoon',

      /* ——— переезды между городами ——— */
      'Переезд': 'Transfer', 'День': 'Day', 'Отрезок': 'Leg',
      'Переезды и время за рулём': 'Drives and time behind the wheel',
      'Расстояние': 'Distance', 'Путь': 'Driving', 'Время': 'Time',
      'С остановками': 'With stops', 'С ост.': 'With stops',

      /* ——— найдено таблицей perevod.html ——— */
      'Карта загружается…': 'Loading the map…',
      'из центра города': 'from the city center',
      'из города в аэропорт:': 'city to airport:',
      'от жилья': 'from your place',
      'рядом, в двух шагах': 'right next door',
      'или вместо этого': 'or instead of this',
      'Все права защищены.': 'All rights reserved.',

      /* ——— найдено таблицей perevod.html, второй заход ——— */
      'Сводка': 'At a glance',
      'Пока просто иметь в виду': 'Just so you know',
      'Что занять заранее и практика': 'What to book ahead, and the practical bits',
      'Расписание и билеты на Google Maps': 'Times and tickets on Google Maps',
      'Ещё цены на Economybookings': 'More prices on Economybookings',
      'город и даты вводятся там': 'you enter the city and dates there',
      'Ночь в пути': 'A night on the move',
      'Бранч': 'Brunch', 'Бар': 'Bar', 'Кофе': 'Coffee', 'Пекарня': 'Bakery',
      'Быстро': 'Quick bite',
      'в этом городе не ночуем': 'no overnight in this city',

      /* ——— карта: слои и фильтры ——— */
      'Вся карта': 'Whole map', 'Улицы': 'Streets', 'Спутник': 'Satellite',
      'Ландшафт': 'Terrain', 'Топо': 'Topo', 'Океан': 'Ocean',
      'Типы': 'Kinds',
      'Карта не загрузилась': 'The map didn’t load',
      'Ищем на карте…': 'Searching the map…',
      'Ищем точку…': 'Finding the spot…',
      'Разворачиваю ссылку…': 'Opening the link…',
      'Сохраняю…': 'Saving…',
      'Место из Google Maps': 'Paste a Google Maps place',
      'Поставить точку на карте': 'Drop a pin on the map',

      /* ——— кабинет и вход ——— */
      'Аккаунт': 'Account', 'Вход': 'Sign in', 'Регистрация': 'Create account',
      'Пароль': 'Password',
      'минимум 6 символов': 'at least 6 characters',
      'Нет аккаунта? Нажми «Регистрация».': 'No account yet? Tap “Create account”.',
      'Сохранить': 'Save', 'Сохранить в мои': 'Save to my trips',
      'Убрать из сохранённых': 'Remove from saved',
      'Удалить строку': 'Delete this line',

      /* ——— бюджет ——— */
      'В день': 'Per day', 'На человека': 'Per person',
      'Забронировать активности': 'Book things to do',
      'Подобрать билеты (туда-обратно)': 'Find return flights',

      /* ——— формы поездки (анкета) ——— */
      'Города и архитектура': 'Cities and their architecture',
      'Еда и напитки': 'Food and drink',
      'Музеи, искусство, история': 'Museums, art, history',
      'Природа и виды': 'Nature and views',
      'Тишина и отдых': 'Slow days, nothing rushed',
      'Активный отдых': 'Something active',
      'Местная жизнь и люди': 'Local life, real neighborhoods',
      'Шопинг': 'Shopping',
      'круг на машине': 'a loop by car',
      'на транспорте': 'by public transport',
      'на метро': 'by metro',
      'поезд': 'train', 'паром': 'ferry', 'аэропорт': 'airport',
      'меньше городов': 'fewer cities, more time in each',
      'едем с собакой': 'traveling with a dog',
      'коляска': 'stroller', 'боязнь высоты': 'fear of heights',
      'еда: ограничения': 'dietary restrictions',
      'событие с датой': 'an event on a set date',
      'знаю точные даты — открыть календарь': 'I know my dates — open the calendar',
      'Без машины этот маршрут не проехать': 'You can’t do this trip without a car',

      /* ——— подсказки в пустых полях ———
         («Город или код аэропорта» с большой буквы уже стоит выше, в перелёте) */
      'город или код аэропорта': 'city or airport code',
      'город или аэропорт': 'city or airport',
      'город или вокзал': 'city or station',
      'город или порт': 'city or port',
      'откуда': 'from', 'куда': 'to',
      'отправление': 'departure',
      'прибытие, если на другой день': 'arrival, if it’s the next day',
      'конец, если не один день': 'end date, if it’s more than a day',
      'адрес': 'address',
      'адрес или ссылка на Google Maps — необязательно':
        'address or Google Maps link — optional',
      'комментарий': 'notes',
      'если есть что добавить — необязательно': 'anything to add — optional',
      'Название места': 'Place name',
      'Зачем сюда (по желанию)': 'Why go (optional)',
      'Ссылка из Google Maps или адрес': 'Google Maps link or address',
      'Ссылка из Google Maps или название': 'Google Maps link or name',
      'Название или ссылка на жильё': 'Name or link to the place',
      'Что это — например, прокат велосипедов': 'What is it — bike rental, for example',
      'своё': 'other',

      /* ——— тексты-объяснения под разделами ——— */
      'Нажми на день, чтобы раскрыть. Название места — ссылка на Google Maps. Ссылка «Маршрут в Google Maps» у каждого дня строится из отмеченных галочками точек.':
        'Tap a day to open it. Every place name links to Google Maps, and each day’s “Directions in Google Maps” link is built from the places you’ve ticked.',
      'Кнопками − / + меняй число ночей на каждой базе. Заезды-выезды и даты в маршруте по дням пересчитаются сами.':
        'Use − / + to change how many nights you spend in each city. Check-in and check-out dates, and the day-by-day plan, update themselves.',
      'Всё в одном месте: ночи и стоимость жилья, билеты, машина, входы и еда. Меняешь ночи или цены — итог считается сам.':
        'Everything in one place: nights and what they cost, flights, the car, tickets and food. Change a night or a price and the total follows.',
      'Мы изучили отзывы на Google и TripAdvisor, убрали закрытые и туристические ловушки — и собрали места, которые любят':
        'We read the Google and TripAdvisor reviews, dropped the places that have closed and the tourist traps, and kept the ones loved by',
      'местные и путешественники': 'locals and travelers alike',
      'мест отобрано': 'places picked',
      'города в поездке': 'cities on this trip',

      /* ——— низ страницы ——— */
      'Нашли ошибку или есть вопрос —': 'Found a mistake, or have a question —',
      'напишите нам': 'write to us',
      'Цены, время и наличие мест — ориентировочные. Проверяйте актуальность перед бронированием. Маршрут — рекомендация, а не публичная оферта.':
        'Prices, times and availability are indicative — check them before you book. This route is a recommendation, not a binding offer.',
      'Часть ссылок на бронирование — партнёрские: по ним сервис может получать комиссию. Для вас цена при этом не меняется.':
        'Some booking links are affiliate links: we may earn a commission from them. The price you pay stays the same.'
  };

  var CODE = {
      '. Карта, карточка перелёта и подбор рейсов пересчитаны': '. Map, flight card and flight search all updated',
      '. Город, даты и гостей подставим сами.': '. We will fill in the city, the dates and the party size.',
      '. Суммы не пересчитаны — проверь их.': '. The amounts were not converted — check them.',
      '. Всё, что решили за вас, — здесь. Любое можно поменять руками, всё пересчитается': '. Everything we decided for you is here. Change any of it by hand and the rest follows.',
      '. Файл сохранился в загрузки. На новом адресе открой меню → «Восстановить из файла».': '. The file went to your downloads. At the new address, open the menu and pick Restore from a file.',
      '. Всё, что сейчас в этом браузере, будет заменено.': '. Everything currently in this browser will be replaced.',
      'сейчас ': 'now ',
      ' В вашем билете обратный рейс ': ' Your ticket has a return flight on ',
      'через ': 'via ',
      'Показать ': 'Show ',
      'база ': 'city ',
      'на маршрут остаётся ': 'leaves you ',
      ' Прилетаем в ': ' Landing at ',
      ' Вылет в ': ' Departure at ',
      'крюк ': 'detour ',
      'на местах ': 'at the stops ',
      ' · в дороге ': ' · on the road ',
      ' · переезды по расписанию ': ' · scheduled transfers ',
      ' · еда ': ' · food ',
      ' · обратно ': ' · back ',
      '» → День ': '” → Day ',
      'Всего за ': 'Total for ',
      'Убрали День ': 'Dropped day ',
      'смотри в дне ': 'see it in day ',
      'за ночь': 'per night',
      'Символ сменили на ': 'Symbol changed to ',
      'Мы показываем, сколько тут обычно бывает в эти же числа: взяли настоящие замеры за ': 'Here is what it is usually like on these dates: real observations from ',
      '  ·  обратно ': '  ·  back ',
      '+ добавить ': '+ add ',
      'Осталось ': 'Left ',
      ' в городе ': ' in ',
      'в маршруте задумано ': 'the route was designed for ',
      'вы водите, а ': 'you drive, and ',
      ' лежат за городом — до ': ' are out of town — up to ',
      ' км. По самому ': ' km. Around ',
      'вы ответили, что не водите. По ': 'you told us you do not drive. Around ',
      'Поездка на ': 'A trip of ',
      'Готового маршрута по ': 'We have no ready-made route for ',
      ' · день ': ' · day ',
      ' · копия от ': ' · copy from ',
      ', но суммы останутся прежними числами — их придётся поправить руками.': ', but the amounts stay the same numbers and you will have to fix them by hand.',
      'Нет связи со справочником курсов. Можно сменить символ на ': 'No connection to the rates service. You can still switch the symbol to ',
      ' на ': ' on ',
      ', а маршрут кончается ': ', and the route ends ',
      '. Добавьте или снимите ночь, чтобы сошлось.': '. Add or drop a night to make them match.',
      ' · на ': ' · for ',
      ', на границу и багаж ': ', for security and bags ',
      ', в аэропорту быть за ': ', be at the airport ',
      '~1,5 ч': '~1.5 hr',
      '~45 мин': '~45 min',
      '3 ч': '3 hr',
      '2 ч': '2 hr',
      'Из «Ещё в городе» · ': 'From “More in this city” · ',
      'ночь на выезде · ': 'night away · ',
      ' · вместо ночи · ': ' · instead of a night in · ',
      'Валюта поездки — ': 'Trip currency — ',
      '). Все суммы пересчитаны по курсу.': '). All amounts converted at the current rate.',
      'на ': 'for ',
      ' всё не влезает: до него ': ' it does not all fit: getting there takes ',
      ' этот маршрут не раскладывается: даже по одной ночи на город нужно больше. Оставили начало и конец': ' this route does not fit: even one night per city needs more. We kept the start and the end',
      ', подогнали под ваши ': ', trimmed to your ',
      ' за городом (до ': ' out of town (up to ',
      ' км)': ' km)',
      'Ваш рейс: ': 'Your flight: ',
      'Обратный рейс: ': 'Return flight: ',
      'ми': 'mi',
      'выбрать': 'choose',
      ' дн.': ' days',
      ' чел.': ' people',
      '/дн': '/day',
      '/чел': '/person',
      'Летим из ': 'Flying from ',
      'на метро': 'by metro',
      'на метро или поезде': 'by metro or train',
      ' · вечером': ' · evening',
      ' · утром': ' · morning',
      ' в пути': ' on the way',
      ' в этот день только дорога': ' all travel that day',
      ' вечером': ' evening',
      ' гост.': ' guests',
      ' из ': ' of ',
      ' м': ' m',
      ' Машина нужна — берём её здесь же.': ' You need a car — pick it up here.',
      ' мин': ' min',
      ' на выезде: ': ' away: ',
      ' ночуем на выезде: ': ' sleeping away: ',
      ' с остановками</span>': ' with stops</span>',
      ' утром': ' morning',
      ' ч': ' hr',
      ' ч чистого хода': ' hr of driving',
      ' чистого хода</span><span>': ' driving</span><span>',
      ', и приезжаем туда утром. Отель здесь не бронируем и в бюджет не считаем — спим в дороге.': ', arriving in the morning. No hotel here and nothing in the budget — you sleep on the way.',
      ', следующий город — ': ', next city — ',
      'Аэропорт ': 'Airport ',
      'в дороге — ': 'on the move — ',
      'Вариант ': 'Option ',
      'Все права защищены.': 'All rights reserved.',
      'День ': 'Day ',
      'Дни ': 'Days ',
      'из города ': 'from ',
      'из города в аэропорт: ': 'city to airport: ',
      'км': 'km',
      'на выезде — ': 'away — ',
      'на машине': 'by car',
      'на машине — её и сдаём в аэропорту': 'by car — dropped off at the airport',
      'на машине, сдаём её там': 'by car, dropped off there',
      'на транспорте': 'by public transport',
      'Ночей поставлено 0, поэтому жильё тут не ищем и в бюджет ничего не считаем. Вернёшь ночь — вернётся и блок.': 'Nights set to 0, so we look for no place here and add nothing to the budget. Put a night back and the block returns.',
      'пик ': 'peak ',
      'профиль высоты маршрута': 'elevation along the route',
      'рядом, в двух шагах': 'right next door',
      'старт ': 'start ',
      'страница от ': 'updated ',
      'уезжаем вечером ': 'leaving in the evening ',
      'эта ночь не тут: ': 'this night is not here: ',

      /* ── КОНСТРУКТОР МАРШРУТА (constructor.js) — шаг 1 плана, 07.08.2026 ──
         Сообщения проверки собранной поездки. Их читает не путешественник, а
         тот, кто собирает маршрут: мы, генератор и — когда дойдут руки —
         клиент в кабинете.
         ⚠️ КЛЮЧ — ЦЕЛОЕ СООБЩЕНИЕ С МЕТКАМИ {…}, А НЕ ОБРЫВОК. Раньше эти
         фразы были склеены плюсом («'разрыв: день ' + a + ' привёз в «' + x»),
         и словарь до них не достал бы никогда. Метки можно ставить в любом
         порядке — по-английски место и число идут не так, как по-русски. */

      /* как называется способ передвижения (E8: где можно спать в пути) */
      'на своей (прокатной) машине': 'in your own (rental) car',
      'перелёт': 'a flight',
      'поезд': 'a train',
      'паром': 'a ferry',
      'автобус': 'a bus',
      'заказной трансфер': 'a private transfer',
      'машина с водителем': 'a car with a driver',

      /* E1 — цепочка не рвётся */
      'переезд дня {d}: нет такой точки «{id}»': 'day {d} leg: there is no point called “{id}”',
      'разрыв: день {a} привёз в «{x}», а день {b} стартует из «{y}»':
        'broken chain: day {a} ends in “{x}”, but day {b} starts from “{y}”',
      /* E2 — повисшие точки */
      'точка «{nm}» не связана ни с чем — в неё нельзя попасть':
        '“{nm}” connects to nothing — there is no way to get there',
      'в «{nm}» не на чем приехать': 'nothing gets you into “{nm}”',
      'из «{nm}» не на чем уехать': 'nothing gets you out of “{nm}”',
      /* E3 — день кончается там, где ночь */
      'переезд назначен на день {d}, а в поездке {n}': 'a leg is set for day {d}, but the trip is only {n} days',
      'день {d}: два несвязанных переезда — «{a}→{b}» и «{c}→{e}». За один день человек не может оказаться в двух местах':
        'day {d}: two legs that do not connect — “{a}→{b}” and “{c}→{e}”. Nobody can be in two places in one day',
      'день {d} стартует из «{x}», а ночь {n} была в «{y}»':
        'day {d} starts from “{x}”, but night {n} was spent in “{y}”',
      'день {d} приводит в «{x}», а ночь {n} записана в «{y}»':
        'day {d} ends in “{x}”, but night {n} is booked in “{y}”',
      'ночь {a} в «{x}», ночь {b} в «{y}», а переезда в этот день нет':
        'night {a} is in “{x}” and night {b} in “{y}”, with no leg in between',
      /* E4, W1, W2 — машина */
      'машину берут в несуществующей точке «{id}»': 'the car is picked up at “{id}”, which is not on the route',
      'машину сдают в несуществующей точке «{id}»': 'the car is dropped off at “{id}”, which is not on the route',
      'машину сдают раньше, чем берут': 'the car is dropped off before it is picked up',
      'вторую машину берут, не сдав первую': 'a second car is picked up before the first one is returned',
      'берут в «{a}», сдают в «{b}» — будет доплата за возврат в другом месте':
        'picked up in “{a}”, dropped off in “{b}” — expect a one-way drop fee',
      'разные регионы ({a} → {b}) — доплата выше и нужна страховка на выезд':
        'different regions ({a} → {b}) — the drop fee is higher and you need out-of-state coverage',
      /* E5, E6, E10 — чем едем */
      'день {d}: переезд на машине, а машины в этот день нет': 'day {d}: the leg is by car, but there is no car that day',
      'вылет из «{x}», а аэропорта там нет': 'a flight leaves “{x}”, which has no airport',
      'прилёт в «{x}», а аэропорта там нет': 'a flight lands in “{x}”, which has no airport',
      'день {d}: переезд назначен на день недели, когда он не ходит':
        'day {d}: the leg is set for a weekday it does not run',
      /* E7, E8, W6 — ночи */
      'ночей {a}, а должно быть {b} при {c} днях': '{a} nights, but a {c}-day trip needs {b}',
      'ночь {n} в пути, но не сказано, в каком переезде': 'night {n} is spent on the move, but no leg is named',
      'ночь {n}: в «{how}» спать нельзя': 'night {n}: you cannot sleep in {how}',
      'ночь {n} в несуществующей точке «{id}»': 'night {n} is in “{id}”, which is not on the route',
      'ночь {n}: жильё не выбрано — нельзя показывать ночь там, где ничего не проверено':
        'night {n}: no place to stay picked — we do not show a night we have not checked',
      /* E11, E9 — город без машины и выезды на день */
      'в «{nm}» без машины нельзя, а машины в эти дни нет':
        '“{nm}” does not work without a car, and there is no car on those days',
      'выезд «{nm}» из несуществующей точки': 'day trip “{nm}” starts from a point that is not on the route',
      'выезд «{nm}» из точки, где человек не ночует': 'day trip “{nm}” starts where nobody is staying the night',
      'выезд «{nm}» на своей машине, а машины нет': 'day trip “{nm}” is by your own car, and there is no car',
      /* W3, W4, W5 — деньги и время */
      'от аэропорта до «{nm}» ≈{km} км по прямой — спросить, ночевать ли в городе прилёта':
        'it is about {km} km from the airport to “{nm}” as the crow flies — ask whether to stay the first night near the airport',
      'до аэропорта в день вылета {h} ч — рейс не должен быть утренним':
        'the run to the airport on departure day takes {h} hrs — do not book a morning flight',
      'день {d}: машина не нужна ни в городе, ни на выезде — можно взять позже или сдать раньше':
        'day {d}: the car is needed neither in town nor for a day trip — pick it up later or drop it off sooner',
      /* W6 — «почему» */
      'нет строки «почему»: {list}': 'no “why” line: {list}',
      'переезд дня {d}': 'the day {d} leg',
      'выезд «{nm}»': 'the “{nm}” day trip',

      /* ── ШАГ 2 ПЛАНА, 08.08.2026: БЫВШИЕ РАЗВИЛКИ ─────────────────────────
         Здесь лежат фразы, которые раньше были написаны в index.html дважды —
         по-русски и по-английски — а язык выбирала строчка LANG!=='ru'.
         Третий язык получал английский просто потому, что он «не русский».
         Теперь это шаблоны: один ключ на всю фразу, метки {…} внутри
         переставляются так, как надо языку. */
      ' Ночь проводим в дороге: {way}. Отель ни здесь, ни там за эту ночь не нужен.':
        ' You spend this night on the move: {way}. No hotel needed, here or there.',
      'Ночь в этом городе не нужна: вечером садимся на {way}':
        'No room needed here: we board the {way} in the evening',
      'из них {n} не тут: ': 'of them {n} not here: ',
      '{n} минут пешком': '{n} min walk',
      'в этот день закрыто': 'closed that day',
      'в этот день круглосуточно': 'open 24 hours',
      'в этот день {h}': 'that day {h}',
      'выходной {list}': 'closed {list}',
      'в этот день закрыт {nm}': 'closed that day: {nm}',
      'в этот день закрыты {n} {places}': 'closed that day: {n} {places}',
      'Первым делом — заселение: {nm}, с этого дня и бронируем жильё.':
        'Check in first — {nm}. Your stay is booked from this day on.',
      /* по-английски слово airport стоит ПОСЛЕ имени аэропорта, по-русски перед */
      'Дорога домой: {from}аэропорт {air}{how} → {home}. В аэропорту быть заранее — этот кусок дня тоже занят.':
        'Getting home: {from}{air} airport{how} → {home}. Leave time to get to the airport — that part of the day is taken too.',
      'Все рестораны из нашей подборки — ещё {n}': 'All the restaurants we picked — {n} more',
      'Все рестораны — {city} на Google Maps': 'All restaurants in {city} on Google Maps',
      'Добавили «{nm}» в {day}': 'Added “{nm}” to {day}',
      'База {i} из {n}': 'City {i} of {n}',
      /* мили: по-русски три формы, по-английски короткое «mi» */
      'мили': 'mi'
  };

  var PLURAL = {
      /* в английском форм две: одна штука и всё остальное (ноль тоже «nights») */
      pick: function (n) { return n === 1 ? 0 : 1; },
      w: {
        'ночь|ночи|ночей': ['night', 'nights'],
        'день|дня|дней': ['day', 'days'],
        'место|места|мест': ['place', 'places'],
        'город|города|городов': ['city', 'cities'],
        'гость|гостя|гостей': ['guest', 'guests'],
        'гостя|гостей|гостей': ['guest', 'guests'],
        'час|часа|часов': ['hour', 'hours'],
        /* добавлено 06.08 вечером: без этих форм на экране оставались
           «4 точки», «3 базы», «10 активностей», «2 взрослых» */
        'точка|точки|точек': ['place', 'places'],
        'база|базы|баз': ['city', 'cities'],
        'активность|активности|активностей': ['activity', 'activities'],
        'минута|минуты|минут': ['minute', 'minutes'],
        'взрослый|взрослых|взрослых': ['adult', 'adults'],
        'ребёнок|детей|детей': ['child', 'children'],
        'вопрос|вопроса|вопросов': ['question', 'questions'],
        'свободный день|свободных дня|свободных дней': ['free day', 'free days']
      }
  };

  var LOCALE = {
      nm: 'English',                 /* как язык называется на самом себе */
      mon: ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'],
      monNm: ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'],
      monS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      monNmS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      wd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      /* ⚠️ в Америке неделя начинается с воскресенья — календарь в анкете
         должен выглядеть так, как человек привык, а не так, как привыкли мы */
      w1: 0,
      dec: '.',                      /* «10.8 km» */
      numTag: 'en-US',               /* 10,800 */
      date: {
        full: '{wd}, {mon} {d}',     /* Sun, September 20 */
        long: '{mon} {d}',           /* September 20 */
        short: '{monS} {d}',         /* Sep 20 */
        span: '{mon} {d1}–{d2}, {y}',/* September 18–23, 2026 */
        spanS: '{monS} {d1}–{d2}'    /* Aug 7–10 */
      }
  };

  return { DICT: DICT, CODE: CODE, PLURAL: PLURAL, LOCALE: LOCALE };
}));
