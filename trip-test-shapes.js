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
  desc:'Сюда приезжаем ночным поездом; машина берётся только на выезд в горы.',alt:'Жильё у моря.'}
];

const DAYS=[
 {n:1,title:'Прилёт в Париж',pill:'прилёт',leg:'CDG → центр: RER B, 45 мин',
  note:'<b>Первый день короткий.</b> Из аэропорта поездом.'},
 {n:2,title:'Фонтенбло с ночёвкой',pill:'выезд',leg:'поезд 40 мин от Gare de Lyon',note:'',sleep:{nm:'Фонтенбло',q:'Fontainebleau, France'}},
 {n:3,title:'Поезд в Лион',pill:'переезд',leg:'Париж → Лион: поезд 2 ч',note:''},
 {n:4,title:'Утро в Ницце после ночного поезда',pill:'ночной поезд',leg:'Лион → Ницца: ночной поезд, прибытие 7:35',note:'<b>Машину берём на этот день</b> — только ради Эза, вечером она уже не нужна.'},
 {n:5,title:'Ницца → вылет домой',pill:'вылет',leg:'до аэропорта 15 мин, машину сдаём там',note:''}
];
const DAY_BASE={1:'a',2:'a',3:'b',4:'c',5:'c'};

const ORIGIN={city:'Майами', en:'Miami',code:'MIA',ll:[25.7959,-80.2870]};
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
 /* дорогу из аэропорта пишем руками: по дорогам её не посчитать (28 км «пешком»
    OSRM пропускает), а прикидка по прямой давала 1 ч 25 мин — при том что
    строкой выше в этом же дне написано «RER B, 45 мин». Два разных числа на
    одном экране клиент и увидела. */
 {id:'sei',d:1,base:'a',cat:'town',lat:48.8530,lng:2.3499,nm:'Île de la Cité',q:'Ile de la Cite, Paris',tag:['первый вечер','t-easy'],star:1,hop:'RER B от аэропорта, 45 мин до Châtelet',
  why:'Остров, с которого начался город.'},
 {id:'fon',d:2,base:'a',cat:'town',lat:48.4021,lng:2.6999,nm:'Château de Fontainebleau',q:'Chateau de Fontainebleau',tag:['выезд','t-must'],star:1,hop:'поезд 40 мин от Gare de Lyon',
  why:'Дворец в шестидесяти километрах от Парижа — туда едут на день, а можно и остаться.'},
 {id:'for',d:2,base:'a',cat:'nature',lat:48.4100,lng:2.6500,nm:'Forêt de Fontainebleau',q:'Foret de Fontainebleau',tag:['лес','t-easy'],
  why:'Лес со скалами вокруг дворца.'},
 {id:'gar',d:3,base:'b',cat:'transport',lat:45.7602,lng:4.8595,nm:'Gare de Lyon Part-Dieu',q:'Gare de Lyon Part-Dieu',tag:['приезд','t-easy'],
  why:'Сюда приходит поезд из Парижа.'},
 {id:'vie',d:3,base:'b',cat:'town',lat:45.7621,lng:4.8276,nm:'Vieux Lyon',q:'Vieux Lyon',tag:['старый город','t-easy'],star:1,
  why:'Старый город под холмом.'},
 /* ⚠️ ПРИЕЗЖАЕМ НОЧНЫМ ПОЕЗДОМ — ЗНАЧИТ НА ВОКЗАЛ, А НЕ В АЭРОПОРТ.
    Здесь первой точкой дня стоял аэропорт с подписью «внутренний рейс из Лиона»,
    хотя в этот же день по данным идёт ночной поезд. Клиент прочитала это как
    «время в пути, логика неправильно» — и была права. */
 {id:'gnc',d:4,base:'c',cat:'transport',lat:43.7047,lng:7.2618,nm:'Gare de Nice-Ville',q:'Gare de Nice-Ville',tag:['приезд','t-easy'],
  why:'Сюда в 7:35 приходит ночной поезд из Лиона.'},
 {id:'pro',d:4,base:'c',cat:'town',lat:43.6961,lng:7.2716,nm:'Promenade des Anglais',q:'Promenade des Anglais, Nice',tag:['набережная','t-easy'],star:1,
  why:'Набережная вдоль моря — сразу с вокзала, пока не заселились.'},
 /* выезд в горы стоял в ДЕНЬ ВЫЛЕТА, в сторону от аэропорта. Перенесён на день
    приезда: машина берётся ровно под него и сдаётся назавтра в аэропорту. */
 {id:'eze',d:4,base:'c',cat:'town',lat:43.7278,lng:7.3620,nm:'Èze',q:'Eze, France',tag:['выезд на полдня','t-easy'],hop:'на машине 20 мин по нижней дороге',
  why:'Деревня на скале — выезд на полдня, машина берётся только на него.'},
 {id:'nce',d:5,base:'c',cat:'transport',lat:43.6653,lng:7.2150,nm:'Aéroport Nice Côte d’Azur (NCE)',q:'Nice Cote d Azur Airport',tag:['вылет','t-easy'],
  why:'Отсюда летим домой. Из центра — трамвай, 25 минут.'}
];

const LINES=[
 {type:'leg',from:'a',to:'b',days:[3],pts:[[48.8566,2.3522],[47.3,3.9],[45.7640,4.8357]]},
 {type:'leg',from:'b',to:'c',days:[4],pts:[[45.7640,4.8357],[44.5,5.5],[43.7102,7.2620]]}
];
const FOODCITIES=[];
const BUDGET=[];
const META={
 cdg:{min:60},fon:{min:180,price:'€14'},for:{min:90,price:'бесплатно'},sei:{min:60,price:'бесплатно'},lou:{min:180,price:'€22'},mar:{min:60,price:'бесплатно'},
 gar:{min:15},vie:{min:120,price:'бесплатно'},gnc:{min:15},nce:{min:60},pro:{min:60,price:'бесплатно'},
 eze:{min:120,price:'бесплатно'}
};

/* ── ДОРОГИ ПО-НАСТОЯЩЕМУ ── считано road-times.js, руками не править ── */
const ROADS={
 1:{ids:["@a","cdg","sei"],km:[[null,null,0.6],[null,null,null],[0.6,null,null]],min:[[null,null,9],[null,null,null],[9,null,null]]},
 2:{ids:["@a","fon","for"],km:[[null,null,null],[null,null,4.6],[null,4.6,null]],min:[[null,null,null],[null,null,63],[null,63,null]]},
 3:{ids:["@b","@a","gar","vie"],km:[[null,null,2.3,0.8],[null,null,null,null],[2.3,null,null,2.8],[0.8,null,2.8,null]],min:[[null,null,31,11],[null,null,null,null],[31,null,null,37],[11,null,37,null]]},
 4:{ids:["@c","@b","gnc","pro","eze"],km:[[null,471.2,1.2,2.4,12.3],[471.8,null,471.3,471.8,491.8],[1.9,470.6,null,2.2,12.2],[2.1,470.7,2.1,null,10.9],[11.6,491.1,11.7,11.2,null]],min:[[null,304,3,6,19],[304,null,303,306,318],[5,303,null,6,20],[6,306,5,null,17],[19,318,19,18,null]]},
 5:{ids:["@c","nce"],km:[[null,9],[7.7,null]],min:[[null,16],[12,null]]},
};
const ROADLINES={
 "leg|4|45.764,4.836":"_givG{mo\\D~GmM[KgVlXCrQ~B~KpDnp@vb@boBn}AnDnApIyCnv@kMra@aRjKiLfQ}_@ba@i`@bHsDbSwChHcEpXii@zGuGbk@kJvj@eEfLUnPrAvNxD|j@jU|a@dMzTjKj_@hYz{@h|@xW`T|a@rUv~@r^le@fW|UtSra@bi@pKnJjNbEpNOf]wDn]iIvg@wRn^wRzIeL~LmZxMyRlLmJpZeOp_@{Yhc@kb@hXk^bPi\\xJi]tAcNm@eWVuG`BeIjDsGbGoEjb@eOlZwS|F{AjKa@hJtAdYzJjSbBbHfDrIrL|Ppi@tXnZnJbUlDzEnKzEd]e@hGhApFbErSvXfIrErKDnSiJ|Ek@pn@rLpl@kCld@jA`ZfEzxC|n@nKdAxVuA~j@mTtJcA`M`@bJtBpMbHpkBreB|LjIhPlGjSpCv`@G~e@fF`LsCjQ{N|JaBfr@vL`Y|CxMXhNaAvrBs^n`@wEjo@mBdz@dB|N_BhLaEfMyIv]}e@pMiK`JwCxJg@vIv@da@fJxJAjI_BhMmHr`Aoy@pVaMvJwB~M_Aj}@~FpTeB`NcGhH_G`ImKdL{SrGeHzr@e]`HaGpSqVtLkK~P}Jdi@{PlIkFlGmHfF}JxJu^|EqKlHcJpKyG|HqBlHY~Gd@nXnGpQoAfKyEp[}Wb\\iIdb@qYnVcIhSmAxpBbEtNQzOcD|c@uSppA}XpVp@`KrCdJzExJrIn[d_@r_Als@dIlC~LfAld@yFfNh@bNfC|KpE|LvIzV~ZzG~F|JhEhIhAfHGnJmBhHoDfPyNnR{LvOcG~TwDfsAgGzT|Afl@bLv\\fChXBzx@wDjx@hAlQm@nQkCxOsE|j@uWzHwAh_@cAvNqBre@_QxMg@f^vGbOJx]wMjU}Eh\\mD|RiIjG}@`YrDt[bB`KxC`KjHxKlMbf@r_@jS~JjSfCvg@mA~S|@fc@`HbBnCWxBiAx@oA[k@eBaCuf@`@aEdGkR|@BfAlE`ANv@kMvAeD`NsGbY_I`N_N~EuC|_AeDnKVdNaBhYaLjl@sApOqH`JaBbAgCpIcG~Bf@|`@lc@zFnDxN`DhC}@vk@o@tCgArBkDdA_IvAuDnBeBvNqElK_UbU}XtAe@d@_B`jBetBno@un@|D}A~RTbl@hFpGwJlTyo@fF_HtGwBfW|@tPmCz}@{w@vGwB``@oFl^g[n^sg@zB}EzUwaAxDoVpKme@fDaJ@qChS_u@pLoWjAArOrKz]pYlNtFtKfArHUhJsCpIaF`EPVeAy@oB_BgZ_@iXgC{\\EuNhAyA`@MpLxNrP`LlKfKpOtGfOObNrDdHE~WmRfAhAdD|LtEbIbQrChLgBxL{HdLkB|E|@`C_@~Sq_@dMiFjG?tCpBvC@hGeK|CuAzE\\tJuFjHl@jJxHrHvJpJkCxHeMff@ib@~C^`BhBbBhQnBzExHV|Bu@lMsOt@kN|E{CtFkKI}HqCkE_CkJoEqG^aJhC_E|GeC|EmE~FiLxK}Hz@aBGaCaDsLtDg[~CqLbG_Gv@cCs@yQsEwTfM}E~FcRtDjCvCc@|MuVb\\{qAh@cUjCkNhFkc@dLqVxRaO|LkPjByF`MTfHiKbJqCpAyHzB}FvAoLzCkJjOsRhLcE~DeDvIqTfCwAhE[`JhBlBw@lZih@jIyC|NiMjJyCfAaDDaLp@sBvFqAtZyQJcCvEoJzQoL|TeWnW_r@lEqClLyR^yFu@wIr@wHjIsF`MtBzKiE`EvBrCrHxC\\pKgOtQ_KpMmMn@aJpEqVvKuSfDyJhEu[iBwHfByFfDyGnIcHfG@~EwEbGm@hF_IjKsHxCkIl@}EjDeFhDgMbRo\\z@mNxH{FbCuTaCyJ_FmJbDwHhMgI`YwK~ThC~EjCpD_@jXxKfDKdF_HnAsH|DgLlA}IfDkJr@aMxA{DGsB_CaHtFsHqEhC{FRrFoBFyG~@aFvA}C~BiBjA{D~NuJ~CwDzAo^g@NiBdOpAsb@g@kRlAqBhBcJlJ{N^uCa@sEaDaAgCqD{B}ULaEqCyFm@yKjBoJHgFcI{U@{QuCmH`CiFBcEwAqFg@eKqDaJz@uDpDgEj@wKtEt@`FsBzB{CLcBeAuF_DaIJ_DqAeGzBcGjGuBmA}OjEkO`CyBp@oHk@aMhQ}OvHDvJkFfAb@zArEzBiAzBXtGnN`GnCjDlHJrHn@{FmAgNjB{IqG{OAsGeEuHfD{XtDaKo@mMdEyCdEmKtC{Bl@aFlBeElUaWjAgEbDiEbAeH|B}AbBgDFaH~AqED{HpAgLQkJxCaGxEiBtBeFjE{BlDkFxGeEvKwN|CkH`HkDdE]jDiH`KgHTwB{DeP~@qBF_DbDuBCmCpABd@sApCb@~D{As@{AwEHaDaNmLwOuFkCmKkBaG_GqKeFaLWsQwIj@eEiGgEgGiAG}JyDuFyBsLpDmQs@oGn@mIvDeBnDcN|JyIpCcGp@uWbF_RpEyDjCqLbJqRdDuDb@qK`H}WpAiOlRuOlDo@rGaJlEqTjBm]i@sFsBcGtB_Kv@cQyFyUaFeJkEcBcB}BkAmHg@}LgEoRqEuEoDuAwC}EmEqBiA\\}EdJsDrCaFMwC~BkFt@yHjNoDTyDnBcHUiCrE_GnFyErJ{E|DuJJ{DgFgLwCeDlAgItIgKDcCtCgMbDoFlDeE}BsIgAiDiHwFyEqAuCs@uDI_LcAoFcBiAb@qGjAyB{AwEdAqEQwGxEqMnAcJInOo@|FtBmEzCqSFoHpBwBZ{FzGsb@H`Ui@lMbEm[vEuRl@yKkAkGKkFeEgFxEwD|CkIKcEr@qDmA}JQuOcBkCeFHeNdKwF~IqI~Hm`@}AhIaGzEuAdHqIdCs@tGeG~BwD`EeBxC{DjEsMtCyBgDwBaAsMLyYt@kCXqJwAgIZiCu@ed@eIyEnC_HrGwG?}U|BqHmA}HZoFeAqEZyH{AwR^uFu@cGr@wFk@eEZmDgA{DeBsBe@gDvAeGm@kIh@wFGoLhEyQdAoK?yKs@iGxEpK~BvAN`Gd@s@?yE}AuQwFwK{BkL]mH`ByTSqIyByLwBj@k@o@vCuGt@_b@u@oGyCgJnAsF}BmEvEwHxAm@jNoPj@uKkAeFzA{IIcFmEk\\eDiGsLyLqJsVaHk`@cBiV}Eo]kC_K}@eLmCqKFgRcAsCuBQeCuE{AVWy@z@wBrC|@pAcDp@sN~B{KGsQkFmLkB{Q`@uCt@}@fErAlD|LjBaDjCxBjGP{EwCaAaNtMsRfBiH|GmG{@`GbFgHNoF|CeE]wFiAaBgFRkCeCeCOfIyD^cC~BgBdLsAtDyDfJoCJgJbGeQrNeEUqGqBmFP_CjIoEnFzCtLMjD[vFoEdCQ?x@iJ`HwPbJ}AlCnK_DdMU|DuBdVXvBvA_LfC_EfDbAx@dFY~FbGdGaCbCrBpDd@vKeCnHUt@qH~@i@lBbFzCv@q@vBRzAlKpPxJkMnDkHvCiRU{@wCu@w@mFzFeJbH_E~DuLp@kJfOo_@JiK~B{J`@eIdB}CfCe_@jEyJ|EeEfEwLvCuCdBeEbJ`AxBaCbBrCbDlBrRDhT{PfFwQxKeIjAoIxBkC`JeCpAqCxD{BvByDfFeBnCcFxMuJfMqBzKeFfEkJ~BaAdHoVvCPlCiDlIc@`p@kKrv@ki@rmCqfBdCKzOxC~MfE|JeCrC}DfCuTtAuEtBsCziBskAzFaFjIoLbQuDhs@qd@pDaKxFgJtJkGjIaMnNsHp]gm@v@yCnFeChc@i[ti@ihBhE_RbDoD`AcHrL}`@`AaGuAaKzAeLde@wr@pw@s]hHqAr`@mStMzDbJaIjL_CvAsAvBkJnJKvMoGnTqUbGiDtDeFxRRjG{MhK}EtGgOlUiIbFk@rG}Fzd@w_AzKe]`Io^dAuInCgF~CeDlUgNxD_JjwBaeCnCiEKyCj@{A`ReSvRiNpHsMhZ}w@~E}H`Zu\\pYwh@hGoGdYwPnWoXpOkGxVmDhe@r@v\\lFrMb@fs@yOfTkKxSuWdIuFrJ_BhXfB~LmD~[u\\rb@mXd]kc@hJ{HzMwCn_@dChZgG`k@m^vi@oe@bGwClIwA|PJh`@fIxMbHzZ|Xvx@`a@`_@jOvGzF~DvGjMb`@~HdOrWhXxJvF~Lr@fJaCnFuDvV{WnGqEbHcC|Ny@bRdF|i@df@jRxLpH|GruCtiDd_@vd@dNzTtGzHd|@re@nh@dVrInB|Rv@nKjB|IrEnh@f_@jg@tL~^nNta@zI~OdHx\\~RrIzCfK~@dIm@`LyCtZaPpT{C~KT|KrDzYvUpT`Kpd@nJzc@bNha@jFbsAlYdb@xNpk@tYvLpHvUhSpg@~^hd@xPtG`En[hc@nRzPll@t[lf@bTxQfMfN~MlMzPfi@jdAfLdNdJpHxRvJhj@lPrt@tc@vyA~h@lTnNtLvMxJnPj]zaAzHpNpd@|^viB~oBlUpWn_A~mA|QjQtKvFnJfClu@|EzNpDfN~HzYlXb@jDyBzAwBiBDuEjYks@xBmC`Gp\\|[fc@lFxLrY~`@fI~^tFt]lD_CbD}KrCoFlJyKvCiIMeDrBoBvB}JzDwA~BcEgBiP|GuNB}AyAcFxAmFzMyE`BmBdBeDzBgKvGuHFeHh@eB~CkBxJ[bEgBfD_FhDaZbBqEtBgBtByJHmJgC_JbAoG~VsQvIq@hTbA`FuA|BqFhBfDzHRvG_LrCwB`GaAhEnEhCcAh@sCoAuH|@_BbCa@bJjEfGgHjD{A`CjBSnGl@zBdCrAr@aAh@eFlAwAjBm@`AhCpBRxOaUzDuBvUnA`GmAnKrDhFu@hLHn@k@~D~AdHgCbXrNxFHjMsB`IrCbJ`MM~ZjB~QdIdIpK|Cv@hAhBWx]fH~HoA|Tr@hKlCvIYrKfE|IgDzJgAzXiUn`@ww@tJsOhC}Kx@eVnDoKhkD{aEnV{e@lGyG|IaCb^`An[vP|HlJnEzCtMfAlUMxMxIbSn@~KdNpCbA~DQ|NsMtRcCnc@sVzYgGzDuOpKcS`QiPtE}GfIyFtDoGtN_Hf@{HdCmF}@cNzBsEHuIjBP~MqCnE_HvIeClMLzQ{EhCgBdE_InBqLdK}DvOmTlIoIlD_HlKm]jJkKpEwAoJ_e@bAwN_@gWfDeSlM{]lEiIlCsApEj@~NdHrJaAsQg]m@_FT}FnPqc@`Ocq@nE}MdMyUpUcY~FcObBwIpBiVhCodAdDeZ|I_ZzSg]~Iwc@`Qa`@~EkV`CwVh@kb@mG}aAOoV~B_X`Kog@nC_Td@gM]os@t@gXxBmWxLgaAhBkf@cBybCaQ_`BiByd@TeN|AqOfJ{`@jC_UL_S{C}c@C{UlJu{@?iI_AqKmH{_@QaPlBiNbLmY~Jcd@nJeZdCi_@`Gs[zCgs@xFqh@bAuRKqT}D{h@PsTdCmQjLyc@|C}]fHa`@VsOgCw^I{Wn@aHhDoOzRcd@dDaPxAsRy@sSoOyj@uByQZ_ZpJ}u@fBeYLePwI{iCcBqUyIir@Ss]tB_R`JqWnF_XpDaIhQ_RbDiGjFoRtAaPEkLyCib@z@wc@U_MoB{MeI{YcAeMLkKdDwYBoPkAaKsQqw@sC}[iCsrB}E_qBgF}Vim@wzAmKuc@eCkWWsVpEgr@CgPmA_JuIu\\oDwd@wDiOmEwHsIqJoImF{F}AeMMqWvFkNrA}S{B_JmEcHeH{IaSuBkLmHky@cHq`@oJgXoVeb@aG_QsCiN_C_ZXus@_AsOsDmQyN{]}BwMa@eMzAkj@uDyg@}Hab@y\\ubAoEeWoA{Wt@q`@pDm_@nYgxBr@yYuBiVsQqq@kE_X{AePaAgXCmu@o@m]}Bu^iJw`A}@qUAySdCee@tFo]xG}U~Xss@dJqa@jB_Sh@wQo@u`@aDyS}DyKgj@uiA_H}UgE_[sMwl@mDuIiNkRwIoEyHMgGjBoRjNwHtA_b@aHkHqCaK}JcJgRiE{MwFeXmF{JyIkGiXwGeu@wa@qG{JkFcS_F_KmGiGaZyP{DqGqHuSuGiIoPcLuHyBsIN_T|EyOqAyOiIiQ{MwJ}KeDuG{Loa@y@cJFwJ`BaL`L{a@zPggAl@kMq@}IyAcGmOsWiAkH@eI|AiIrCmFtM}L~WcQpFcKbAwIUwIkMgf@i@}INeIvCwOlP_c@nEi]nI_c@t@_IQaK_Mo`Ao@aa@bAet@[mKaSovAgIc\\qBmMk@cQjAif@oAgPqCkIcEgGia@cb@{ImCkUOoFwBuFkF}EqKsByNFsLtB_VeA_U}C_MwUkq@yCuE_E{Coe@{GuQmJyHoGqJ_P}Ron@}EaIaRsRmF_LqB}IaA}K_@qv@bBaLxC_IdPoSlAoGQgJcZijAeGuL}[q`@uFcKoE{OyDe^}C_NkFkLsRyYqSgm@gBcMSqRz@kKfFqZ`@uOuE{r@}DwR{`@{jAqGei@{F{SmEcIeGaHyN}H}KyAct@aAmJ_DeH_KqHm\\uH{McF_EyRuHmIuFox@oeAi[}ZcUiLwH_IiE_N}AwNpBws@UmMqBkLuJc[eKacAqHic@cCiZmOg{@VqC~BaCdNmGfA\\b@nC[h@e@s@ePqo@qQ{k@qG_Lw[uT}FyFoYkf@qOiOqu@ufA{EsD}LqEqEqDcF{JcMs\\wLkR_EaBi@mF_NDGhEmJo@e@kK",
};
const ROADSTEPS={
 "fon>for":"yolfHkinO@bAr@C@pB{@J@lDeERg@}@wCdGcAkAgCbEa@o@kSl{@_B~@kElIv@xGmIv]}CbGx@rj@kJjV`ClDx@rGkCd^|IfQfK`f@",
 "@b>gar":"_hivGino\\j@B^}BD}zBzAoAKsCfJ}@IqBdAF?yDhA@VcBnAA",
 "gar>vie":"gphvGkct\\oA@WbBiAAAjAtDpiA]`@z@`[]`WWdCu@IUlBOdQmBrPTf@kBbNqAMq@rFx@T",
 "@c>gnc":"}cxiGmjik@ZpTfBJKgHfWt@GwNpE]",
 "gnc>pro":"sawiGwlik@`Rg@d@_FxIcFhE{@oIq_@pJyDsC}LvIoEzAnG~Ch@UnDlAJGt@",
 "pro>eze":"ukuiGmgkk@Fu@gCZ{AcBiEaU}BgFwFuFyBkGz@kD~IaGfByg@v@_BlEkAf@cNjCcGcDdBuC}D}GgA`Hk@j@aAGkBsQuGsJyGoWsToH}J@kC|FiG^iEeBsDcJiDaHaHrAgGyB{DDkEaAwG~AiJG}QqCiDeHcBiD@gAcB|C}HnAqMqDyUqJyVaLiGeHcQ_DyMeGoB]wNsAmK}BgBaEp@cAa@m@yA?iHy@iDaDwD}Fe@gFcK]aCV}LcE}Mg@oHoFyCiByCKgUzBPzCcC",
 "@c>nce":"}cxiGmjik@ZpTfBJKgHfWt@VdJbGhAbIjGtV`l@nEbE`M|DjEzDpt@feAtOjOdHpNfCeKbUbPxZdOnHnHnQhXxGlS`L~yAdDcB_Ck^`EgAiC{a@",
};
/* ── конец дорог ── */
