/* ==========================================================================
   ЮТА, КАНЬОНЫ — ТЕКСТ МАРШРУТА ПО-АНГЛИЙСКИ

   ⚠️ НАПИСАНО ЗАНОВО, А НЕ ПЕРЕВЕДЕНО (правило 21), английский американский
   (21а). Метры и километры — в футы и мили: маршрут по США.
   Названия парков и троп не трогаем вовсе (правило 10).

   Заготовку даёт  node i18n-extract.js trip-utah.js
   Проверка полноты: node i18n-check-trip.js trip-utah.js
   ========================================================================== */
window.__tripText = {
  lang: 'en',
  tripName: 'Utah, canyon country',

  hero: {
    h1: 'Zion → Bryce',
    em: 'Moab → Arches',
    sub: 'Through the canyons of Utah: the narrows of Zion, the hoodoos of Bryce at sunrise, the arches of Moab, and the plateau above a bend in the Colorado.',
    alt: 'Mesa Arch, Canyonlands',
    capTitle: 'Mesa Arch',
    capSub: 'day six · sunrise in Canyonlands',
    parksCap: 'national parks'
  },

  base: {
    zio: { name: 'Springdale (Zion)',
      desc: 'A town at the very gates of Zion: red walls right over the street, and the park entrance is a walk away.',
      alt: 'Alternative: Hurricane or La Verkin, 25–30 min out — half the price, but you catch the morning shuttle earlier.' },
    bry: { name: 'Bryce Canyon City',
      desc: 'One street by the park entrance. People sleep here for one reason: sunrise over the hoodoos.',
      alt: 'Alternative: Tropic, 20 min down the canyon — warmer at night and cheaper, but Sunrise Point is a drive.' },
    moa: { name: 'Moab',
      desc: 'A base for two parks at once: Arches to the north, Canyonlands to the west, the Colorado River in between.',
      alt: 'Alternative: the campgrounds along Highway 128 by the river — beautiful and cheap, but 20–30 min from town.' }
  },

  day: {
    1: { title: 'Land in Las Vegas, drive to Zion', pill: 'arrival',
         leg: 'LAS → Springdale, about 170 miles · 2 hr 40 min',
         note: '<b>Day one is the drive.</b> Pick the car up at the airport and go: the last hour runs through red rock, and it’s worth catching in daylight.' },
    2: { title: 'All of Zion', pill: 'there and back',
         leg: 'a free shuttle runs the canyon; private cars aren’t allowed in',
         note: '<b>Start before eight.</b> By midday the canyon is 100°F and the shuttle line is half an hour.' },
    3: { title: 'Zion → Bryce via Red Canyon', pill: 'transfer',
         leg: 'about 80 miles · 1 hr 50 min, half a day with stops',
         note: '<b>The Zion tunnel.</b> Tall vehicles go through one at a time, with a fee and a wait. In a regular car you just drive.' },
    4: { title: 'Bryce at sunrise → Moab', pill: 'transfer',
         leg: 'about 267 miles · 4 hr 30 min, a full day with stops',
         note: '<b>Get up before dawn.</b> Half an hour at Sunrise Point is worth the lost sleep: the sun comes into the amphitheater from below and the hoodoos light up.' },
    5: { title: 'Arches', pill: 'there and back',
         leg: 'the entrance is 5 miles from Moab, with 19 miles of road inside',
         note: '<b>Summer needs a timed entry ticket</b> — book it ahead on the park’s site. Early morning and evening go without one.' },
    6: { title: 'Canyonlands and Dead Horse', pill: 'there and back',
         leg: 'about 34 miles to Island in the Sky · 45 min',
         note: '<b>Bring water.</b> There is nowhere to buy it on the whole plateau, and no shade at all.' },
    7: { title: 'Moab → Grand Junction, fly out', pill: 'last day',
         leg: 'about 112 miles · 2 hr to GJT airport',
         note: '<b>Leave a margin.</b> The river road is beautiful but narrow, with nowhere to pass.' }
  },

  place: {
    las: { why: 'This is where you land and pick up the car. Three hours northeast and the desert turns into red walls.',
      tag: ['arrival', 't-easy'] },
    vir: { why: 'Twenty minutes of road through a gorge along the canyon floor — a free preview of what’s coming. Nowhere to stop, just look.',
      tag: ['on the way', 't-easy'] },
    spr: { why: 'One street along the river, with canyon walls hanging over the cafés. Walk to the bridge and look at the Watchman in evening light.',
      tag: ['evening', 't-easy'] },
    zvc: { why: 'The shuttles into the canyon leave from here. Check the schedule, get water, and decide how far you’re going today.',
      tag: ['start of the day', 't-easy'] },
    nar: { why: 'The canyon narrows to a few yards and the trail goes straight up the river. Even the first half mile in the water is worth it — beyond that is up to you.',
      tag: ['the big one', 't-must'] },
    ang: { why: 'The famous chain-lined ridge. The last section needs a lottery permit — but the climb to Scout Lookout gives you the whole view without one.',
      tag: ['if you’re up for it', 't-hard'] },
    cov: { why: 'A short trail right past the tunnel, an hour round trip. In the evening you see the whole main canyon from above.',
      tag: ['sunset', 't-easy'] },
    red: { why: 'The road dives through two arched tunnels cut in red rock. Free, no lines — and almost nobody slows down, which is a shame.',
      tag: ['on the way', 't-easy'] },
    brp: { why: 'The best overlook onto the whole amphitheater. Come toward evening: the sun is low and the hoodoos throw long shadows.',
      tag: ['the big one', 't-must'] },
    nav: { why: 'The only way to grasp the scale is to go down into it. The Wall Street switchbacks drop between the walls, with a strip of sky left overhead.',
      tag: ['2 hours', 't-med'] },
    sun: { why: 'This is why people sleep here. The first light enters the amphitheater from below and the hoodoos catch fire one by one.',
      tag: ['sunrise', 't-must'] },
    cap: { why: 'The road runs right through the park, and that part is free. Stop at the orchard in Fruita — those apple trees were planted by Mormon settlers in the 1800s.',
      tag: ['on the way', 't-easy'] },
    arv: { why: 'The park road starts with switchbacks up the canyon wall. At the top everything changes: red fins standing in rows to the horizon.',
      tag: ['start of the day', 't-easy'] },
    win: { why: 'Three huge arches, ten minutes’ walk from the parking lot. The best call when you’re out of energy for long trails.',
      tag: ['1 hour', 't-easy'] },
    del: { why: 'The arch off the license plates. The climb is 45 minutes over bare rock with no shade — go at sunset or early, but go.',
      tag: ['the big one', 't-must'] },
    mes: { why: 'A small arch on the edge of a cliff. At sunrise its underside glows from reflected light — the most photographed spot in Utah.',
      tag: ['sunrise', 't-must'] },
    gvp: { why: 'The rim of the plateau, where you see two rivers that sawed the desert into three levels. The trail along the edge is half a mile each way.',
      tag: ['1 hour', 't-easy'] },
    dhp: { why: 'A bend in the Colorado 2,000 feet below. In the evening everyone who missed sunrise at Mesa Arch comes here — and they’re right to.',
      tag: ['sunset', 't-easy'] },
    fis: { why: 'Stone spires off to the side of the parks, along the river on Highway 128. Almost nobody here, and the views are no worse than in the parks.',
      tag: ['if there’s time', 't-med'] },
    gjt: { why: 'Two hours along the Colorado River and you’re at the airport. Drop the car and fly home.',
      tag: ['departure', 't-easy'] }
  },

  meta: {
    las: { dur: 'arrival' },
    vir: { price: 'free', best: 'midday', route: 'on the way' },
    spr: { price: 'free', best: 'evening' },
    zvc: { price: '$35/car', best: 'morning' },
    nar: { price: 'park entry', best: 'morning' },
    ang: { price: 'lottery permit', best: 'morning' },
    cov: { price: 'park entry', best: 'sunset' },
    red: { price: 'free', best: 'midday', route: 'on the way' },
    brp: { price: '$35/car', best: 'evening' },
    nav: { price: 'park entry', best: 'midday' },
    sun: { price: 'park entry', best: 'sunrise' },
    cap: { price: 'free', best: 'midday', route: 'on the way' },
    arv: { price: '$30/car', best: 'morning' },
    del: { price: 'park entry', best: 'sunset' },
    win: { price: 'park entry', best: 'midday' },
    mes: { price: '$30/car', best: 'sunrise' },
    gvp: { price: 'park entry', best: 'midday' },
    dhp: { price: '$20/car', best: 'sunset' },
    fis: { price: 'free', best: 'midday' },
    gjt: { dur: 'departure' }
  },

  airway: {
    LAS: '≈170 mi · 2 hr 40 min to Springdale',
    GJT: '≈112 mi · 2 hr from Moab'
  },

  airnm: { LAS: 'Las Vegas', GJT: 'Grand Junction' },

  transfer: {
    bry: { clean: '2 hr', stops: 'half a day' },
    moa: { clean: '4.5 hr', stops: 'all day' }
  },

  precheck: [
    { label: 'timed entry for Arches' },
    { label: 'Angels Landing lottery' },
    { label: 'Utah road conditions' }
  ],

  food: [
    { city: 'Springdale', spots: [
      { meal: 'breakfast', veg: 'veg-friendly', why: 'Opens at six — the only way to eat before the first shuttle into the canyon.' },
      { meal: 'lunch/dinner', veg: 'a few things', why: 'Mexican portions the size of a day in the mountains, on a patio right under the red wall.' },
      { meal: 'bar', veg: 'a few things', why: 'Right by the park entrance, tables on a deck over the river — where people land after a trail.' } ]},
    { city: 'Bryce Canyon City', spots: [] },
    { city: 'Moab', spots: [
      { meal: 'breakfast', veg: 'a few things', why: 'A classic diner serving from seven — handy before your timed entry at Arches.' },
      { meal: 'lunch', veg: 'a few things', why: 'Running since 1954: burgers and milkshakes, and the line moves fast.' },
      { meal: 'dinner/bar', veg: 'veg-friendly', why: 'Their own beer and big plates. Loud and touristy, but always open.' } ]}
  ],

  budget: [
    { g: 'Flights', items: [
      { nm: 'Tickets', sub: 'Miami → Las Vegas, back from Grand Junction' },
      { nm: 'Baggage', sub: 'both ways' } ]},
    { g: 'Car', items: [
      { nm: 'Car rental', sub: 'sedan · per day' },
      { nm: 'One-way drop fee', sub: 'Las Vegas → Grand Junction · for everyone' },
      { nm: 'Gas', sub: '~870 miles · for everyone' } ]},
    { g: 'Tickets and activities', items: [
      { nm: 'Annual parks pass', sub: 'America the Beautiful · pays off from three parks' },
      { nm: 'Timed entry for Arches', sub: 'slot reservation' },
      { nm: 'Dead Horse Point', sub: 'state park, separate fee' },
      { nm: 'Zion shuttle', sub: 'free' } ]},
    { g: 'Food', items: [
      { nm: 'Food and coffee', sub: 'per person per day' } ]}
  ],

  line: [
    { label: 'Day 1: Las Vegas → Springdale' },
    { label: 'Day 3: Zion → Bryce' },
    { label: 'Day 4: Bryce → Moab' },
    { label: 'Day 2: Zion canyon' },
    { label: 'Day 5: Arches' },
    { label: 'Day 6: Canyonlands' },
    { label: 'Day 7: Moab → Grand Junction' }
  ]
};
