/* ==========================================================================
   ЯЗЫКИ: СЛОВАРЬ И ФУНКЦИЯ t()

   Её задача 06.08.2026 и её же требование к качеству: не «перевести с
   русского», а НАПИСАТЬ по-английски так, как пишут носители. Поэтому здесь не
   построчный перевод, а нормальные английские фразы — местами короче русских,
   местами построенные иначе.

   ⚠️ ПОЧЕМУ КЛЮЧ — САМА РУССКАЯ ФРАЗА, А НЕ ПРИДУМАННЫЙ КОД.
   В index.html текст вшит прямо в разметку (`'<b>Откуда вы летите?</b>'`).
   Придумывать каждому куску имя вроде `air.title` — это переписать тысячи
   склеек и на каждой рискнуть опечаткой. Ключом взята сама строка: тогда
   перенос — это обернуть её в t(), и всё.

   ⚠️ ГЛАВНОЕ СВОЙСТВО: НЕТ ПЕРЕВОДА — ОСТАЁТСЯ РУССКИЙ. Сайт не может сломаться
   от того, что фразу ещё не перевели: она просто покажется как была. Поэтому
   переносить можно кусками, а не всё разом.

   Как добавить язык: дописать сюда его раздел. Ничего в index.html при этом
   трогать не надо.

   Что НЕ переводим (правило 10 в ROUTE-RULES.md): названия мест, рестораны,
   экскурсии, поисковые строки. Они живут в оригинале на языке страны.

   Сколько осталось:  node i18n-scan.js
   ========================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.I18N = factory();
}(typeof self !== 'undefined' ? self : this, function () {

  var DICT = {

    en: {
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
      'Сколько людей': 'Travellers',
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
      'Туда-обратно': 'Return',
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
      'дома и квартиры целиком': 'whole homes and flats',
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
      'финал': 'last day', 'туда-обратно': 'return trip',

      /* ——— деньги и билеты ——— */
      'бесплатно': 'free', 'нужен билет': 'ticket needed',
      'вход в парк': 'park entry', 'на человека в день': 'per person per day',
      'Входы и активности': 'Tickets and activities',
      'Перелёт': 'Flights', 'Машина': 'Car', 'Жильё': 'Stays',
      'Транспорт': 'Transport', 'Бензин': 'Fuel', 'Багаж': 'Baggage',
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
      'Активность': 'Activity', 'Заправка': 'Fuel', 'Продукты': 'Groceries',
      'Другое': 'Other', 'Ресторан': 'Restaurant', 'Десерт': 'Dessert',
      'Аэропорт': 'Airport', 'Вариант': 'Option',

      /* ——— перелёт, подробности ——— */
      'Город прилёта': 'Arriving in', 'Дорога домой:': 'Getting home:',
      'В вашем билете обратный рейс': 'Your ticket has a return flight',
      'Вылет в': 'Departure at',

      /* ——— мелкие приписки к дню ——— */
      'в дороге': 'travelling', 'в этом городе не ночуем': 'no overnight here',
      'ночь в дороге': 'night on the move', 'последняя ночь в пути': 'last night on the move',
      'переезды по расписанию': 'scheduled transfers', 'обратно': 'back',
      'даты примерные, пока не вписан рейс': 'dates are approximate until you add your flight',

      /* ——— времена года (в подписях к местам) ——— */
      'Зима': 'Winter', 'Весна': 'Spring', 'Лето': 'Summer', 'Осень': 'Autumn',

      /* ——— месяцы и дни недели ———
         ⚠️ Порядок в дате другой: по-русски «7 августа», по-английски
         «August 7». Одним словарём это не решается — правит fmtDate(). */
      'января': 'January', 'февраля': 'February', 'марта': 'March',
      'апреля': 'April', 'мая': 'May', 'июня': 'June',
      'июля': 'July', 'августа': 'August', 'сентября': 'September',
      'октября': 'October', 'ноября': 'November', 'декабря': 'December',
      'вс': 'Sun', 'пн': 'Mon', 'вт': 'Tue', 'ср': 'Wed',
      'чт': 'Thu', 'пт': 'Fri', 'сб': 'Sat'
    }

  };

  /* Множественное число. В русском три формы, в английском две — поэтому
     функция принимает русские формы и сама решает, что делать. */
  var PLURAL_EN = {
    'ночь|ночи|ночей': ['night', 'nights'],
    'день|дня|дней': ['day', 'days'],
    'место|места|мест': ['place', 'places'],
    'город|города|городов': ['city', 'cities'],
    'гость|гостя|гостей': ['guest', 'guests'],
    'час|часа|часов': ['hour', 'hours']
  };

  function t(s, lang) {
    if (!s || lang === 'ru' || !lang) return s;
    var d = DICT[lang];
    if (!d) return s;
    return Object.prototype.hasOwnProperty.call(d, s) ? d[s] : s;
  }

  function plural(n, a, b, c, lang) {
    if (lang && lang !== 'ru') {
      var key = a + '|' + b + '|' + c, f = PLURAL_EN[key];
      if (f && lang === 'en') return n === 1 ? f[0] : f[1];
    }
    var x = n % 10, y = n % 100;
    if (x === 1 && y !== 11) return a;
    if (x >= 2 && x <= 4 && (y < 10 || y >= 20)) return b;
    return c;
  }

  /* сколько уже переведено — чтобы видеть движение, а не гадать */
  function stats(lang) {
    var d = DICT[lang] || {};
    return { lang: lang, done: Object.keys(d).length };
  }

  return { t: t, plural: plural, stats: stats, DICT: DICT };
}));
