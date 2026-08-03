/* ==========================================================================
   ПРОБНЫЙ МАРШРУТ ДЛЯ ФОРМ ПОЕЗДКИ — не публикуется (в белый список не внесён).
   Один маленький маршрут, на котором видно сразу несколько форм:
     · прилёт в один город, вылет из другого (open-jaw);
     · переезд между городами ПОЕЗДОМ;
     · перелёт ВНУТРИ поездки;
     · город без машины (метро и пешком) и город с машиной;
     · выезд на день с возвратом.
   Меняя SEGMENT/CITYMOVE здесь, проверяем движок формой, а не содержимым.
   ========================================================================== */
const TRIP_NAME='Проба форм';
const START='2026-09-10';
const IMGPREF='';

const BCOL={a:'#12855e',b:'#d96a12',c:'#5a4bb5'};
const BCOL2={a:'#0a6047',b:'#b0530c',c:'#3b3080'};

const BASES=[
 {id:'a',name:'Париж',emoji:'city',nights:2,color:BCOL.a,lat:48.8566,lng:2.3522,q:'Paris, France',
  desc:'Город без машины: метро и пешком.',alt:'Жильё в центре.'},
 {id:'b',name:'Лион',emoji:'city',nights:1,color:BCOL.b,lat:45.7640,lng:4.8357,q:'Lyon, France',
  desc:'Сюда едем поездом — два часа по скоростной.',alt:'Жильё у вокзала.'},
 {id:'c',name:'Ницца',emoji:'city',nights:1,color:BCOL.c,lat:43.7102,lng:7.2620,q:'Nice, France',
  desc:'Сюда летим внутренним рейсом, дальше машина.',alt:'Жильё у моря.'}
];

const DAYS=[
 {n:1,title:'Прилёт в Париж',pill:'прилёт',leg:'CDG → центр: RER B, 45 мин',
  note:'<b>Первый день короткий.</b> Из аэропорта поездом.'},
 {n:2,title:'Фонтенбло с ночёвкой',pill:'выезд',leg:'поезд 40 мин от Gare de Lyon',note:'',sleep:{nm:'Фонтенбло',q:'Fontainebleau, France'}},
 {n:3,title:'Поезд в Лион',pill:'переезд',leg:'Париж → Лион: поезд 2 ч',note:''},
 {n:4,title:'Утро в Ницце после ночного поезда',pill:'ночной поезд',leg:'Лион → Ницца: ночной поезд',note:''},
 {n:5,title:'Ницца → вылет домой',pill:'вылет',leg:'аэропорт в черте города',note:''}
];
const DAY_BASE={1:'a',2:'a',3:'b',4:'c',5:'c'};

const ORIGIN={city:'Майами',code:'MIA',ll:[25.7959,-80.2870]};
const AIRPORT={a:'CDG',b:'LYS',c:'NCE'};
const AIRPORTNM={CDG:'Париж',LYS:'Лион',NCE:'Ницца'};
const AIRPORTWAY={CDG:'RER B, 45 мин',LYS:'Rhônexpress, 30 мин',NCE:'трамвай, 25 мин'};
/* ФОРМА: в Париж летим, в Лион поездом, в Ниццу внутренним перелётом */
const SEGMENT={a:'flight',b:'train',c:'train'};
const TRANSFER={b:{km:465,clean:'2 ч',stops:'поезда каждый час'},
                /* ФОРМА: ночной поезд — ночь в пути, отель в Лионе не нужен */
                c:{km:470,clean:'9 ч ночью',stops:'ночной поезд, отправление 22:40, прибытие 7:35',night:'ночной поезд'}};
/* ФОРМА: в Париже и Лионе машина не нужна, в Ницце — только на выезды */
const CITYMOVE={a:'metro_walk',b:'metro_walk',c:'car_trips'};

const P=[
 {id:'cdg',d:1,base:'a',cat:'transport',lat:49.0097,lng:2.5479,nm:'Aéroport Paris–Charles de Gaulle (CDG)',q:'Paris Charles de Gaulle Airport',tag:['прилёт','t-easy'],
  why:'Сюда прилетаешь. В город — RER B.'},
 {id:'sei',d:1,base:'a',cat:'town',lat:48.8530,lng:2.3499,nm:'Île de la Cité',q:'Ile de la Cite, Paris',tag:['первый вечер','t-easy'],star:1,
  why:'Остров, с которого начался город.'},
 {id:'fon',d:2,base:'a',cat:'town',lat:48.4021,lng:2.6999,nm:'Château de Fontainebleau',q:'Chateau de Fontainebleau',tag:['выезд','t-must'],star:1,hop:'поезд 40 мин от Gare de Lyon',
  why:'Дворец в шестидесяти километрах от Парижа — туда едут на день, а можно и остаться.'},
 {id:'for',d:2,base:'a',cat:'nature',lat:48.4100,lng:2.6500,nm:'Forêt de Fontainebleau',q:'Foret de Fontainebleau',tag:['лес','t-easy'],
  why:'Лес со скалами вокруг дворца.'},
 {id:'gar',d:3,base:'b',cat:'transport',lat:45.7602,lng:4.8595,nm:'Gare de Lyon Part-Dieu',q:'Gare de Lyon Part-Dieu',tag:['приезд','t-easy'],
  why:'Сюда приходит поезд из Парижа.'},
 {id:'vie',d:3,base:'b',cat:'town',lat:45.7621,lng:4.8276,nm:'Vieux Lyon',q:'Vieux Lyon',tag:['старый город','t-easy'],star:1,
  why:'Старый город под холмом.'},
 {id:'nce',d:4,base:'c',cat:'transport',lat:43.6653,lng:7.2150,nm:'Aéroport Nice Côte d’Azur (NCE)',q:'Nice Cote d Azur Airport',tag:['прилёт','t-easy'],
  why:'Внутренний рейс из Лиона.'},
 {id:'pro',d:4,base:'c',cat:'town',lat:43.6961,lng:7.2716,nm:'Promenade des Anglais',q:'Promenade des Anglais, Nice',tag:['набережная','t-easy'],star:1,
  why:'Набережная вдоль моря.'},
 {id:'eze',d:5,base:'c',cat:'town',lat:43.7278,lng:7.3620,nm:'Èze',q:'Eze, France',tag:['выезд на день','t-easy'],
  why:'Деревня на скале — выезд на полдня, машина берётся только на него.'}
];

const LINES=[
 {type:'leg',from:'a',to:'b',days:[3],pts:[[48.8566,2.3522],[47.3,3.9],[45.7640,4.8357]]},
 {type:'leg',from:'b',to:'c',days:[4],pts:[[45.7640,4.8357],[44.5,5.5],[43.7102,7.2620]]}
];
const FOODCITIES=[];
const BUDGET=[];
const META={
 cdg:{min:60},fon:{min:180,price:'€14'},for:{min:90,price:'бесплатно'},sei:{min:60,price:'бесплатно'},lou:{min:180,price:'€22'},mar:{min:60,price:'бесплатно'},
 gar:{min:15},vie:{min:120,price:'бесплатно'},nce:{min:60},pro:{min:60,price:'бесплатно'},
 eze:{min:120,price:'бесплатно'}
};
