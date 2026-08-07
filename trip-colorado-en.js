/* ==========================================================================
   КОЛОРАДО — ТЕКСТ МАРШРУТА ПО-АНГЛИЙСКИ

   ⚠️ НАПИСАНО ЗАНОВО, А НЕ ПЕРЕВЕДЕНО (правило 21), английский американский
   (21а). Проверка каждой строки: прочитал бы это американец как текст
   американского travel-сайта — или сразу видно, что переведено с русского?

   Метры и километры переведены в футы и мили: это маршрут по США, и «3 687
   метров» местному читателю не говорит ничего. Цены и коды парков оставлены как
   есть — они и так на английском.

   Ключ — ID места, а не русская фраза: у сгенерированной поездки русского
   оригинала не будет вовсе (её вопрос про ИИ-генерацию, 07.08.2026).
   Заготовку даёт  node i18n-extract.js trip-colorado.js
   ========================================================================== */
window.__tripText = {
  lang: 'en',

  hero: {
    sub: 'Across the Rockies: the steam train to Silverton, the cliff cities of Mesa Verde, the Million Dollar Highway with no guardrails, the Black Canyon, and Independence Pass at 12,095 feet.',
    alt: 'Maroon Bells, Colorado',
    capSub: 'day seven · the most photographed spot in Colorado',
    parksCap: 'national parks'
  },

  base: {
    dur: { name: 'Durango',
      desc: 'The lively town on the Animas River where you land: the narrow-gauge railroad, Mesa Verde, canyons, and the Pagosa hot springs.',
      alt: 'Alternative: the settlements north on US-550 (Hermosa, Haviland Lake) — quieter, 20 min into town. 25 min from DRO airport.' },
    our: { name: 'Ouray',
      desc: 'The “Switzerland of America”: a waterfall in a slot canyon, hot springs, jeep trails, and Telluride next door.',
      alt: 'Alternative: Ridgway, 15 min north — quieter and cheaper. Ouray is 1.5–2 hours from Durango.' },
    asp: { name: 'Aspen / Basalt',
      desc: 'The alpine high point: Maroon Bells, glacial lakes, Independence Pass, ghost towns.',
      alt: 'Aspen is expensive ($450+). Basalt (20 min) and Carbondale (40 min) put you in the same mountains for $110–160 a night.' },
    den: { name: 'Denver (by the airport)',
      desc: 'Just a place to sleep before your flight. Airport area or Aurora, so the morning drive is easy.',
      alt: 'Look for a hotel with a free DEN shuttle — then you can return the car on the evening of the 15th and skip a day of rental.' }
  },

  day: {
    1: { title: 'Landing in Durango', pill: 'arrival',
         leg: 'arrive at DRO · 25 min into town',
         note: '<b>Keep the first evening easy.</b> You land, pick up the car, check in, and walk around Durango.' },
    2: { title: 'The Durango &amp; Silverton train', pill: 'train',
         leg: 'departs 8:15–9:45 a.m. from the depot in downtown Durango',
         note: '<b>Why so early in the trip:</b> when fire danger is high the train sometimes stops running. Early in the block leaves you room to shuffle things.' },
    3: { title: 'Mesa Verde — the cliff cities', pill: 'there and back',
         leg: 'Durango → Mesa Verde, 1 hr each way, about 53 miles',
         note: '<b>Tickets for the interiors</b> are released 14 days ahead at 8:00 a.m. Colorado time (10:00 a.m. in Florida) and sell out in minutes. You can enter the park itself without one.<br><b>Two ranger tours in one day work,</b> but the park requires at least two hours between them: Cliff Palace at 11:00 → Balcony House no earlier than 1:00 p.m. Skip Long House and Mug House today — they’re on another mesa, and the gap there runs three to four hours.' },
    4: { title: 'Million Dollar Highway: Durango → Ouray', pill: 'transfer',
         leg: 'about 75 miles · 2 hr of driving; plan on 5–6 with stops' },
    5: { title: 'Ouray and Telluride', pill: 'there and back',
         leg: 'Ouray ↔ Telluride, about 1 hr 15 each way',
         note: '<b>If the day feels tight:</b> drop Yankee Boy — or drop Telluride instead and give the day to a jeep tour and the hot springs.' },
    6: { title: 'Ouray → Aspen (the Black Canyon)', pill: 'transfer',
         leg: 'about 205 miles · 5 hr of driving; a full day with stops' },
    7: { pill: 'there and back',
         leg: 'about 19 miles from Aspen, the whole day close to base',
         note: '<b>Tip:</b> drive your own car up for sunrise (leave around 6:15 a.m.) — private cars are allowed until 8:00, and the lake is glass.' },
    8: { title: 'The valleys around Aspen', pill: 'there and back',
         leg: 'two short valleys, 20–30 min from Aspen',
         note: '<b>About August:</b> thunderstorms roll in after 1–2 p.m. Do anything high early.' },
    9: { title: 'Aspen → Denver (Independence Pass)', pill: 'transfer',
         leg: 'about 160 miles · 4 hr of driving; realistically 6–7 with stops',
         note: '<b>Sleep near Denver airport.</b> Tomorrow’s flight is early, so the last night belongs close to DEN.' },
    10: { title: 'Denver → flight home', pill: 'last day',
          leg: 'return the car · fly out of DEN',
          note: '<b>Head to the airport early.</b> Leave time for the rental return and security.' }
  },

  place: {
    dro: { why: 'This is where you land. Grab the car and you’re in Durango in 25 minutes. Try to arrive in daylight so check-in is unhurried.',
      pin: 'the terminal, not the middle of the airfield', tag: ['arrival', 't-easy'] },
    lnh: { why: 'If you still have energy: sunset on a quiet lake 15 minutes from town. Paddleboards, swimming.',
      tag: ['if you’re up for it', 't-easy'] },
    art: { why: 'First evening: the riverfront path runs the length of town, straight into historic downtown Durango.' },
    trn: { why: 'An 1880s steam locomotive on narrow gauge, 45 miles along the Animas canyon on a ledge blasted 400 feet up the rock face. <b>Format:</b> train up, bus back frees half a day. <b>Class:</b> take the open-air Rio Grande car (about $144) for photos, and sit on the left going out.',
      pin: 'the Main Avenue depot the train leaves from, not the rail yard', tag: ['worth the trip on its own', 't-must'] },
    mvp: { why: '600 Ancestral Puebloan dwellings tucked into sheer cliff alcoves, 700–800 years old. $30 per car, cards only. It’s 40 minutes uphill from the entrance — give it a full day.',
      pin: 'the entrance and visitor center on US-160, not the middle of the park', tag: ['UNESCO', 't-must'] },
    clp: { why: 'The largest cliff dwelling in North America, 150 rooms. Inside only with a ranger: 45 minutes, four ladders, a 100-foot descent. $8 a person on recreation.gov, 50 spots.',
      tag: ['ticket needed', 't-must'] },
    bch: { why: 'The park’s most adventurous tour: an hour, a 32-foot ladder, an 18-inch crawl through the rock, and a climb back up the wall. Skip it if heights or tight spaces get to you. 35 spots, $8.',
      hop: '10 minutes along Cliff Palace Loop', tag: ['ticket needed', 't-must'] },
    mtl: { why: 'No tickets? The loop road has overlooks where you see the dwellings from across the canyon.',
      tag: ['no ticket needed', 't-easy'] },
    chr: { why: 'An Ancestral Puebloan temple on a high mesa, aligned to the moon — quieter and more atmospheric than Mesa Verde.',
      tag: ['alternative for the day', 't-easy'] },
    pag: { why: '40+ hot pools terraced down to the river, fed by the deepest geothermal spring in the world. An hour east.',
      tag: ['alternative for the day', 't-easy'] },
    vlc: { why: 'If the cliff cities don’t appeal: a big quiet mountain lake 40 minutes out. Paddleboards, picnic.',
      pin: 'the shoreline 40 min from Durango; the directory pin sits 20 miles upstream',
      tag: ['the easy option', 't-easy'] },
    hav: { why: 'First stop out of Durango: a quiet forest lake right off the highway. Coffee before the climb.' },
    cbp: { why: 'The first pass of the day, with the whole Twilight ridge laid out in front of you.' },
    mol: { why: 'The San Juan postcard: meadows, lakes, and the teeth of the Grenadier Range. Little Molas Lake is right there too — a mirror pond, five minutes down a dirt road.',
      tag: ['best panorama', 't-must'] },
    sil: { why: 'A town of 600 at 9,300 feet, main street still dirt, buildings straight out of a Western. This is where yesterday’s train pulled in.',
      tag: ['lunch', 't-easy'] },
    rmp: { why: 'Mountains rusted red by oxides, mine skeletons, colored tailings. The most Martian stretch of the drive.' },
    mdh: { why: '25 miles of switchbacks cut into a sheer wall above the gorge, with no guardrails. Driving north (Silverton → Ouray) puts you on the outside lane over the drop, where the views are best — worth knowing in advance if heights bother you. 25 mph, and not in a thunderstorm.',
      pin: 'the overlook above the switchbacks near Ouray, not the middle of the highway',
      tag: ['legendary road', 't-must'] },
    bcf: { why: 'The last pocket before Ouray: a waterfall dropping right under the bridge you’re driving across.' },
    ohs: { why: 'Roll into Ouray and straight into an open-air hot pool ringed by cliffs. Open until 10 p.m.',
      tag: ['evening', 't-easy'] },
    box: { why: 'Five minutes from downtown Ouray: an 85-foot waterfall in a narrow slot, with a catwalk bolted to the wall.',
      tag: ['$8 · 45 min', 't-easy'] },
    per: { why: 'A loop trail around town along the slopes, with bridges. Cascade Falls is 20 minutes up.',
      tag: ['optional', 't-hike'] },
    ykb: { why: 'An alpine basin at 11,500 feet, carpeted in columbine and waterfalls under Mt. Sneffels. Rental sedans aren’t allowed — take a jeep tour from Ouray, half a day, about $100–150 a person.',
      pin: 'only a jeep road reaches the basin — routing engines ignore it, so the time is an estimate',
      tag: ['jeep required', 't-4x4'] },
    tel: { why: 'A town at the dead end of a box canyon. The free gondola crosses the ridge to Mountain Village in 13 minutes, with the whole canyon under you. Runs until midnight.',
      tag: ['free', 't-must'] },
    bvf: { why: 'Colorado’s tallest free-falling waterfall, at the head of the canyon. Pavement runs to the end of the valley, where you look up at it. Getting above it takes 4×4 or a 2-mile walk.',
      tag: ['365 feet', 't-must'] },
    dld: { why: 'The Ouray–Telluride road crosses this pass: the classic view of the Sneffels range above the ranches. Best at sunset.' },
    rid: { why: 'First stop out of Ouray: a reservoir with a beach under the San Juans — a good place to stretch.',
      tag: ['on the way', 't-easy'] },
    bcg: { why: 'A gorge half a mile deep and in places a quarter mile wide — the floor sees under an hour of sun a day. South Rim: a road along the edge with 12 overlooks. Don’t miss Painted Wall. 2–3 hours, $30.',
      pin: 'the south rim: overlooks and the road from Montrose, not the middle of the canyon',
      tag: ['national park #1', 't-must'] },
    pnt: { why: 'Pink pegmatite veins streaking the black wall — the canyon’s signature, and at 2,250 feet the tallest cliff in Colorado.' },
    mcc: { why: 'A gentle pass over the Elk range with Mount Sopris ahead. Before it, the orchard valleys of Paonia.' },
    mar: { why: 'The marble for the Lincoln Memorial came from here. The old mill is a set of white ruins in the woods.',
      tag: ['20-min detour', 't-easy'] },
    red: { why: 'A village along the red Crystal River, with a coal baron’s 1902 castle. Coffee before the last push to Aspen.' },
    mrb: { why: 'Two maroon fourteeners doubled in the lake. From May 22 to Oct 18 private cars are barred 8 a.m.–5 p.m. — take the $16 shuttle, or drive up before 8 with a $10 reservation. At sunrise the lake is empty and mirror-flat.',
      pin: 'the Maroon Lake parking lot where the bus arrives, not the peaks themselves',
      tag: ['the state’s postcard', 't-must'] },
    mls: { why: 'A loop around the lake and through the aspens. Everyone can do it.',
      hop: 'on foot from Maroon Lake; the trail starts at the water', tag: ['2 miles · easy', 't-easy'] },
    crl: { why: 'The trail keeps climbing to a lake under the walls of the Bells. About 700 feet of gain.',
      hop: 'the same trail, further up — an hour each way', tag: ['4 miles · moderate', 't-hike'] },
    gon: { why: 'The gondola from downtown Aspen to 11,210 feet, running through Sept 7, from $40. A 360° panorama with no effort.',
      tag: ['afternoon', 't-easy'] },
    asp: { why: 'Evening: 1880s brick streets, galleries, and a quiet memorial park by the river.' },
    gro: { why: 'Nine miles east of Aspen the river has carved grottos and ice caves into granite — you walk it like a moonscape. Tiny parking lot, so come before 10.',
      pin: 'the pullout and trailhead on Highway 82, not the slope above it',
      tag: ['0.75 mile · easy', 't-easy'] },
    dpb: { why: 'An emerald pool set in rock above Grottos. The water is freezing.',
      pin: 'the pullout with parking, checked against OpenStreetMap' },
    ash: { why: 'Castle Creek valley, 11 miles up: an 1880s silver town — saloon, post office, cabins in a meadow under the peaks.' },
    cth: { why: '2,000 feet of climbing to a turquoise lake in a cirque at 11,865 feet. One of the best hikes in the state. Be on the trail by 8 a.m.',
      tag: ['5.5 miles · hard', 't-hike'] },
    rgt: { why: 'A paved river path, 8 miles out to Hunter S. Thompson’s legendary tavern (the tavern itself is under “Where to eat,” Aspen). Rent the bike in Aspen.',
      pin: 'Woody Creek Tavern — the end of the ride, not the middle of the trail',
      tag: ['the easy option', 't-easy'] },
    igh: { why: 'First stop on the climb out of Aspen: what’s left of an 1880s gold camp, right by the road. Free, 20 minutes.' },
    ind: { why: 'The fourth-highest paved pass in the state and one of the most spectacular in the country. Up top there’s a boardwalk overlook, tundra, and views down both sides of the divide. Go early.',
      tag: ['the day’s headline', 't-must'] },
    twn: { why: 'Two lakes under Colorado’s highest peak (Mount Elbert, 14,440 feet) once you’re down. The reflections are postcard material.' },
    dil: { why: 'A turquoise reservoir ringed by summits, with an overlook five minutes’ walk away. Better to eat in Frisco.' },
    lov: { why: 'Turn off I-70 onto US-6. The last alpine pass: a saddle above treeline with snowfields into August. A farewell view before Denver.',
      tag: ['25-min detour', 't-must'] },
    geo: { why: 'A Victorian mining town off I-70 where the whole downtown is a landmark. The last stop before Denver.',
      tag: ['30 min', 't-easy'] },
    den: { why: 'Return the car and fly home out of DEN. Head over early — leave time for the rental return and security.',
      tag: ['departure', 't-must'] }
  },

  meta: {
    dro: { dur: 'arrival' },
    den: { dur: 'departure' },
    cth: { dur: '4–5 hr (hike)' },
    art: { price: 'free', best: 'evening' },
    lnh: { price: 'free', best: 'sunset' },
    trn: { price: '$90–144/person', best: 'all day' },
    mvp: { price: '$30/car', best: 'before noon', route: '~1 hr from Durango' },
    clp: { price: '$8/person', best: 'first tour of the day', route: 'ticket 14 days ahead' },
    bch: { price: '$8/person', best: '2 hrs after Cliff Palace', route: '32-ft ladder and a crawl' },
    mtl: { price: 'included with the park', best: 'midday' },
    vlc: { price: 'free', route: '~40 min from Durango' },
    pag: { price: 'from $67/person', route: '~1 hr east' },
    chr: { price: '$12 +$20/car', best: 'midday', route: '~1 hr from Durango' },
    hav: { price: 'free', route: 'on the way' },
    cbp: { price: 'free', route: 'on the way' },
    mol: { price: 'free', best: 'midday', route: 'on the way' },
    sil: { price: 'lunch', best: 'lunch', route: 'on the way' },
    mdh: { price: 'free', best: 'midday, not in a storm', route: 'the road itself' },
    rmp: { price: 'free', route: 'on the way' },
    bcf: { price: 'free', route: 'on the way' },
    ohs: { price: '$26/person', best: 'evening', route: 'in Ouray' },
    box: { price: '$8/person', best: 'midday', route: 'in Ouray' },
    per: { price: 'free', best: 'midday', route: 'in Ouray' },
    ykb: { price: '~$125/person (jeep)', best: 'before noon', route: 'jeep tour from Ouray' },
    tel: { price: 'gondola free', best: 'midday / sunset', route: '~1 hr 15 from Ouray' },
    bvf: { price: 'free (from below)', best: 'midday', route: 'past Telluride' },
    dld: { price: 'free', best: 'sunset', route: 'on the road to Telluride' },
    rid: { price: '~$10/car', route: 'on the way' },
    bcg: { price: '$30/car', best: 'midday', route: '~30-min detour' },
    pnt: { price: 'included with the park', best: 'midday', route: 'in the park' },
    mcc: { price: 'free', route: 'on the way' },
    mar: { price: 'free', route: '~20-min detour' },
    red: { price: 'free', route: 'on the way' },
    mrb: { price: 'shuttle $16 / parking $10', best: 'at sunrise', route: '~30 min from Aspen' },
    mls: { price: 'free', best: 'morning', route: 'at the lake' },
    crl: { price: 'free', best: 'morning', route: 'from Maroon Lake' },
    gon: { price: 'from $40/person', best: 'afternoon', route: 'downtown Aspen' },
    asp: { price: 'free', best: 'evening', route: 'downtown Aspen' },
    gro: { price: 'free', best: 'before 10 a.m.', route: '~20 min from Aspen' },
    dpb: { price: 'free', best: 'midday', route: 'by Grottos' },
    ash: { price: '$5/person', best: 'midday', route: '~25 min from Aspen' },
    cth: { price: 'free', best: 'on the trail by 8 a.m.', route: 'past Ashcroft', dur: '4–5 hr (hike)' },
    rgt: { price: 'bike rental', best: 'midday', route: 'from Aspen' },
    igh: { price: 'free', route: 'on the way' },
    ind: { price: 'free', best: 'before noon', route: 'on the way (the pass)' },
    twn: { price: 'free', best: 'morning', route: 'on the way' },
    dil: { price: 'free', best: 'midday', route: 'on the way' },
    lov: { price: 'free', best: 'midday', route: '~25-min detour' },
    geo: { price: 'free (the town)', best: 'midday', route: 'on the way' }
  },

  airway: { DRO: 'the airport is right in town', DEN: 'the airport is right in town' },

  food: [
    { city: 'Durango', spots: [
      { meal: 'breakfast/brunch', veg: 'veg-friendly', why: '30+ years in, one of the oldest breweries in Colorado. Famous brunch, and beer they make themselves.' },
      { meal: 'lunch/bar', veg: 'a few things', why: 'An 1880s ragtime saloon inside the Strater Hotel, servers in period costume — come for the room and a cocktail.' },
      { meal: 'dinner/bar', veg: 'veg-friendly', why: 'Since 1996; GABF gold for the Steam Engine Lager, and a signature Cajun boil.' } ]},
    { city: 'Silverton', spots: [
      { meal: 'dinner', veg: 'a few things', why: 'Cornish pasties — what the miners ate — on Blair St. Roughly June through October.' },
      { meal: 'coffee', veg: 'veg-friendly', why: 'Local coffee and pastry before the train or the mountains.' } ]},
    { city: 'Ouray', spots: [
      { meal: 'lunch/bar', veg: 'veg-friendly', why: 'About 16 of their own beers and a rooftop with a 360° view. Get a flight and a burger.' },
      { meal: 'lunch', veg: 'a few things', why: 'The local burger favorite, walls covered in graffiti; elk and bison burgers. Closed Tuesdays.' } ]},
    { city: 'Telluride', spots: [
      { meal: 'lunch/dinner', veg: 'veg-friendly', why: 'The owner is a world pizza champion; get the Detroit-style “313” or the green chili “Telluride.”' },
      { meal: 'lunch/dinner', veg: 'vegan/GF', why: 'Organic Mexican since 1998, tortillas by hand, and the best margarita for the money.' },
      { meal: 'breakfast/coffee', veg: 'veg-friendly', why: 'A classic bakery-café: pastry, breakfast sandwiches, and the “chronut.”' } ]},
    { city: 'Aspen', spots: [
      { meal: 'lunch/dinner', veg: 'a few things', why: '“Aspen’s most famous sandwich” — crispy chicken, out of a tiny house.' },
      { meal: 'lunch/bar', veg: 'a few things', why: 'A cult dive 8 miles out, Hunter S. Thompson’s old haunt; margaritas, a burger, enchiladas.' },
      { meal: 'lunch', veg: 'a few things', why: 'The best sandwich counter in town (awards since 2010), subs made to order — cheap and good.' },
      { meal: 'breakfast/dessert', veg: 'veg-friendly', why: 'An Aspen classic since 1976: warm cookies and gelato.' } ]},
    { city: 'Basalt', spots: [
      { meal: 'dinner', veg: 'a few things', why: 'Spanish tapas and paella, 300+ Spanish wines — without Aspen prices. Get the arroz negro.' } ]},
    { city: 'Pagosa Springs', spots: [
      { meal: 'dinner', veg: 'veg-friendly', why: 'The gem here: farm-to-table, on the NYT list of the 50 best restaurants in America for 2024. Dinner only, reserve.' },
      { meal: 'lunch/dinner', veg: 'a few things', why: 'The region’s taco institution: Baja fish and shrimp tacos.' },
      { meal: 'breakfast/coffee', veg: 'veg-friendly', why: 'A local bakery-café with real character: cinnamon rolls and sticky buns.' },
      { meal: 'lunch/dinner', veg: 'veg-friendly', why: 'The locals’ favorite NY-style pizza, everything made from scratch.' } ]}
  ],

  budget: [
    { g: 'Flights', items: [
      { nm: 'Tickets', sub: 'round trip' },
      { nm: 'Baggage', sub: 'both ways' } ]},
    { g: 'Car', items: [
      { nm: 'Car rental', sub: 'SUV · per day' },
      { nm: 'One-way drop fee', sub: 'Durango → Denver · for everyone' },
      { nm: 'Gas', sub: '~715 miles · for everyone' } ]},
    { g: 'Tickets and activities', items: [
      { nm: 'Durango & Silverton train', sub: 'open-air car' },
      { sub: '$30 / car · for everyone' },
      { sub: '$30 / car · for everyone' },
      { sub: 'shuttle' },
      { sub: 'hot pools' },
      { sub: 'entry' },
      { nm: 'Aspen gondola', sub: 'the ride up' },
      { nm: 'Yankee Boy jeep tour', sub: 'optional' } ]},
    { g: 'Food', items: [
      { nm: 'Food and coffee', sub: 'per person per day' } ]}
  ],

  line: [
    { label: 'Day 4: Durango → Ouray' },
    { label: 'Day 6: Ouray → Aspen' },
    { label: 'Day 9: Aspen → Denver' },
    { label: 'Durango → Silverton train' },
    { label: 'Day 3: Mesa Verde' },
    { label: 'Day 5: Telluride' },
    { label: 'Day 7: Maroon Bells' },
    { label: 'Day 8: the valleys' }
  ],

  /* ——— таблица переездов ——— */
  drive: {
    rows: [
      { seg: 'Land at DRO → Durango', km: '15 mi', t: '25 min', stops: 'evening' },
      { seg: 'Train to Silverton (no car)', t: '—', stops: '6–9 hr' },
      { seg: 'Durango ↔ Mesa Verde', km: '106 mi', t: '2 hr', stops: 'all day' },
      { seg: 'Durango → Ouray (Million Dollar Hwy)', km: '75 mi', t: '2 hr', stops: '5–6 hr' },
      { seg: 'Ouray ↔ Telluride', km: '93 mi', t: '2.5 hr', stops: 'all day' },
      { seg: 'Ouray → Aspen (Black Canyon)', km: '205 mi', t: '5 hr', stops: 'all day' },
      { seg: 'Aspen ↔ Maroon Bells', km: '19 mi', t: '30 min', stops: 'all day' },
      { seg: 'Aspen ↔ the Castle Creek valleys', km: '37 mi', t: '1 hr', stops: 'all day' },
      { seg: 'Aspen → Denver (Independence Pass)', km: '160 mi', t: '4 hr', stops: '6–7 hr' },
      { seg: 'Denver → DEN airport, fly out', t: '30 min', stops: 'morning' }
    ],
    total: { seg: 'Durango → Denver', km: '~715 mi', t: '~18 hr', stops: '10 days' }
  },

  /* ——— что занять заранее и практика ——— */
  tips: [
    { t: 'What to book ahead (most urgent first)', li: [
      '<b>Mesa Verde (Cliff Palace) — critical.</b> Tickets open exactly 14 days out at 8:00 a.m. local time (MDT). A park day of August 9 means a release on <b>July 26</b>. They go in minutes, and only on <a href="https://www.recreation.gov/ticket/facility/233362" target="_blank" rel="noopener">recreation.gov</a>. You can enter the park itself without one.',
      '<b>Maroon Bells — critical.</b> August is peak. Parking is $10 (only before 8 a.m. or after 5 p.m.), otherwise the $16 shuttle. <a href="https://www.visitmaroonbells.com/" target="_blank" rel="noopener">visitmaroonbells.com</a>.',
      '<b>The Durango &amp; Silverton train.</b> Open-air cars in August sell out early. <a href="https://durangotrain.com/" target="_blank" rel="noopener">durangotrain.com</a>.',
      '<b>Car, Durango → Denver (one-way).</b> The drop fee runs about $100–150, and SUVs go first.',
      '<b>Yankee Boy Basin jeep tour</b> — optional, out of Ouray, half a day.'
    ]},
    { t: 'Weather and thunderstorms in August', li: [
      'Monsoon season: most days bring a short storm in the mountains after 1–2 p.m.',
      'The rule: anything high up before noon; towns, museums and hot springs after.',
      'Valleys run 75–85°F, the passes 50–60°F, and nights drop to 40°F. Bring layers and a windbreaker.',
      'Sun at 10,000 feet burns three times as fast — SPF 50+.'
    ]},
    { t: 'The car and the roads', li: [
      'A regular sedan covers 95% of this. You only need an SUV for Yankee Boy, Last Dollar Road, and upper Bridal Veil.',
      'Independence Pass: no vehicles over 35 feet.',
      'The Million Dollar Highway has no guardrails. Not at night, not in rain.',
      'There is no gas between Ouray and Silverton — fill up beforehand.',
      'Service drops on the passes — download Google Maps offline for southwest Colorado.',
      'Road status: <a href="https://www.cotrip.org/" target="_blank" rel="noopener">cotrip.org</a>.'
    ]},
    { t: 'Park entrance fees', li: [
      'Black Canyon $30/car, Mesa Verde $30/car — cards only, no cash.',
      'The annual <a href="https://www.nps.gov/planyourvisit/passes.htm" target="_blank" rel="noopener">America the Beautiful</a> pass at $80 pays off from three parks — there are two here.'
    ]},
    { t: 'If you end up with a spare day', li: [
      '<b>Great Sand Dunes</b> — since you fly out of Denver, you can take the southern US-160 route through the dunes from day 9 (+1 day).',
      '<b>Rocky Mountain NP</b> — 2 hours north of Denver; swap the airport night for Estes Park.',
      '<b>Crested Butte</b> — the “wildflower capital,” a detour off day 6.'
    ]}
  ],

  /* ——— варианты дня, профиль высоты, ссылки и переезды ——— */
  tripName: 'Colorado',

  opts: {
    east: { nm: 'Chimney Rock and Pagosa', sub: 'Ancestral Puebloan ruins and hot springs, a full day east' },
    lake: { nm: 'Vallecito Lake', sub: 'a quiet half day by the water, forty minutes from town' }
  },

  altnm: { 1: 'Durango', 2: 'Silverton', 3: 'Mesa Verde', 6: 'Black Canyon', 10: 'Denver' },

  precheck: [
    { label: 'CDOT road conditions' },
    { label: 'the train' }
  ],

  airnm: { DRO: 'Durango', DEN: 'Denver' },

  transfer: {
    our: { clean: '2 hr', stops: '5–6 hr' },
    asp: { clean: '5 hr', stops: 'all day' },
    den: { clean: '4 hr', stops: '6–7 hr' }
  }
};
