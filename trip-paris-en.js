/* ==========================================================================
   ПАРИЖ — ТЕКСТ МАРШРУТА ПО-АНГЛИЙСКИ

   ⚠️ ЭТО НЕ ПЕРЕВОД, А ОТДЕЛЬНЫЙ СЛОЙ ДАННЫХ — И ИМЕННО ПОЭТОМУ ТАК.
   Её вопрос 07.08.2026: «клиенты будут генерировать поездки с помощью ИИ на
   своём языке — как это будет работать?». Со словарём «русская фраза →
   перевод» — никак: у сгенерированной поездки нет русского оригинала, и ключа
   попросту не существует. Поэтому ключ здесь — ID МЕСТА, а не фраза.

   Что где лежит:
     · trip-paris.js      — ДАННЫЕ без языка: координаты, цены, минуты, часы
                            работы, коды аэропортов, названия мест (правило 10);
     · trip-paris-en.js   — ТЕКСТ на одном языке: зачем сюда идти, заголовок
                            дня, описание города.
   Генератору достаточно написать второй файл — и поездка есть на новом языке.

   ⚠️ ТЕКСТ НАПИСАН ЗАНОВО, А НЕ ПЕРЕВЕДЁН (правило 21), английский
   американский (21а). Проверка каждой строки: прочитал бы это американец как
   текст американского travel-сайта?

   ⚠️ Грузится только на неродном языке (loadTripT). Русский посетитель этот
   файл не качает вовсе.
   ========================================================================== */
window.__tripText = {
  lang: 'en',

  hero: {
    h1: 'Paris',
    em: 'four days on foot',
    sub: 'One city, no car: the islands in the Seine, the Louvre and Sainte-Chapelle, a day out at Versailles, and Montmartre to finish.',
    alt: 'the Eiffel Tower',
    capSub: 'third evening · sunset, and it sparkles on the hour',
    parksCap: 'cars on this trip'
  },

  base: {
    par: {
      name: 'Paris',
      desc: 'Four days in one city: the islands in the Seine, the museums, Montmartre, and one day out of town at Versailles.',
      alt: 'Stay in the 4th through 6th arrondissements or near the Luxembourg Gardens — everything is walkable and the Métro is right there.'
    }
  },

  day: {
    1: { title: 'Arrival, and a first evening on the Seine', pill: 'arrival',
         leg: 'CDG to the center: RER B, 35–50 min',
         note: '<b>Keep the first evening open.</b> The RER B train runs from the airport into the city — faster and cheaper than a cab. After that, just walk the riverbank.' },
    2: { title: 'The Louvre, the islands and Le Marais', pill: 'on foot',
         leg: 'on foot all day, Métro between neighborhoods',
         note: '<b>Book the Louvre ahead</b> — entry is by timed slot, and the museum is closed on Tuesdays.' },
    3: { title: 'A day at Versailles', pill: 'day trip',
         leg: 'RER C to Versailles Château Rive Gauche, about 45 min each way',
         note: '<b>Go early.</b> By noon the line for the château is over an hour. The gardens are free; the château needs a ticket.' },
    4: { title: 'Montmartre, then the flight home', pill: 'last day',
         leg: 'to CDG: RER B, 50 min · leave 3 hours before your flight',
         note: '<b>Drop your bags at the station luggage storage</b> — that way the last morning isn’t wasted.' }
  },

  place: {
    cdg: { tag: ['arrival', 't-easy'],
      why: 'This is where you land. The RER B leaves right from the terminal: 35–50 minutes into the center, running from 5 a.m. to midnight.' },
    sei: { tag: ['first evening', 't-easy'],
      why: 'The island the city grew out of. The cathedral has reopened since the fire, and the quay is at its quietest in the evening.' },
    lat: { tag: ['evening', 't-easy'],
      why: 'Narrow streets across from the island: student cafés, bookshops, cheap food. A good place for your first dinner.' },
    mar: { tag: ['neighborhood', 't-easy'],
      why: 'The oldest square in the city, and the quarter around it: galleries, workshops, and the best street food in Paris.' },
    pai: { tag: ['breakfast', 't-easy'],
      why: 'An 1889 bakery on the way down from Montmartre: chocolate escargots, and bread locals line up for.' },
    sai: { tag: ['stained glass', 't-must'],
      why: 'Fifty feet of 13th-century stained glass in one small chapel. Come when the sun is out — the walls light up from the inside.' },
    ors: { tag: ['if you still have it in you', 't-easy'],
      why: 'The Impressionists, in a converted train station. Smaller than the Louvre and doable in two hours — a good call for the evening.' },
    lou: { tag: ['ticket needed', 't-must'],
      why: 'The largest museum in the world. You will not see it in one visit — pick two wings and let the rest go. Timed ticket; closed Tuesdays.' },
    ver: { tag: ['all day', 't-must'],
      why: 'The palace and grounds are worth a whole day. Book ahead, entry is by timed slot, and the château is closed Mondays.' },
    tri: { tag: ['on the grounds', 't-easy'],
      why: 'The far end of the grounds: the queen’s hamlet and the smaller palaces. A shuttle train runs out there, or you can rent a bike.' },
    eif: { tag: ['evening', 't-must'],
      why: 'Back from Versailles, head to the tower for sunset. After dark it sparkles for five minutes on the hour.' },
    mon: { tag: ['morning', 't-must'],
      why: 'Your last morning: a hill over the whole city, painters’ streets, staircases. Come at opening — by midday it’s packed.' }
  },

  meta: {
    lou: { price: '€22 online', best: 'quieter after 3 p.m.', route: 'Métro Palais Royal' },
    sai: { price: '€13', best: 'a sunny hour', route: 'next to Notre-Dame' },
    ver: { price: '€21 for the château, grounds free', best: 'right at opening', route: 'RER C, 45 min' },
    eif: { price: '€14–29 to go up', best: 'sunset', route: 'Métro Bir-Hakeim' },
    mon: { price: 'free', best: 'before 10 a.m.', route: 'Métro Anvers, then the funicular' },
    ors: { price: '€16', best: 'Thursday evening until 9:45 p.m.', route: 'Métro Solférino' }
  },

  airway: { CDG: '≈30 km · RER B, 35–50 min to the center' },

  food: [
    { city: 'Paris', spots: [
      { meal: 'lunch', veg: 'a few things', why: 'a canteen from 1896 — the line moves fast' },
      { meal: 'dinner', veg: 'a few things', why: 'classic bistro dinner; reserve a table' },
      { meal: 'lunch',     veg: 'veg-friendly', why: 'falafel in Le Marais — yes there’s a line, and it’s worth it' },
      { meal: 'lunch',     veg: 'veg-friendly', why: 'Breton crêpes and cider' },
      { meal: 'breakfast', veg: 'veg-friendly', why: 'pricey and touristy, but coffee on the terrace earns it' }
    ]}
  ],

  line: [
    { label: 'CDG → Paris' },
    { label: 'Versailles and back' },
    { label: 'Paris → CDG' }
  ],

  budget: [
    { g: 'Flights', items: [
      { nm: 'Tickets', sub: 'round trip' },
      { nm: 'Baggage', sub: 'both ways' } ]},
    { g: 'Transportation', items: [
      { nm: 'Navigo Easy pass', sub: 'Métro for the whole trip' },
      { nm: 'RER B to and from the airport', sub: 'both ways' },
      { nm: 'RER C to Versailles', sub: 'round trip' } ]},
    { g: 'Tickets and activities', items: [
      { nm: 'Louvre', sub: 'timed entry' },
      { nm: 'Sainte-Chapelle', sub: 'the stained glass' },
      { nm: 'Château de Versailles', sub: 'château + gardens' },
      { nm: 'Tour Eiffel', sub: 'up to the second level' },
      { nm: "Musée d'Orsay", sub: 'optional' } ]},
    { g: 'Food', items: [
      { nm: 'Food and coffee', sub: 'per person per day' } ]}
  ],

  tripName: 'Paris',
  airnm: { CDG: 'Paris' }
};
