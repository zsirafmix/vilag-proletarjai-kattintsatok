# „Világ proletárjai, kattintsatok!”

**Játssz most:** https://zsirafmix.github.io/vilag-proletarjai-kattintsatok/

2D-s, humoros, rombolós stratégiai böngészőjáték az 1920-as évek szovjet propagandaplakátjainak stílusában. Lenin elvtárs a **VÖRÖS OKTÓBER 1917** nevű lánctalpas járművéből lövi szét a kapitalizmus jelképeit – bankokat, tőzsdét, arany felhőkarcolót, pénzgyárat, plázát, vállalati tornyokat, végül pedig MR. CAPITAL-t, az aranypénzekből épült robotot.

> Szatíra. A bankároknak nem esik bajuk – csak elszaladnak.

Nyelvek: **magyar** (alapértelmezett), English, Deutsch, Français, Русский – a menüben a zászlókkal váltható, a választást a böngésző megjegyzi, első indításkor a böngésző nyelvét veszi alapul.

## Irányítás

| Művelet | Egér / érintés | Billentyű |
|---|---|---|
| Célzás | Húzd hátra az egeret/ujjad bárhol a pályán (mint a csúzlinál), engedd el = tűz | Fel/Le nyíl: szög, Bal/Jobb nyíl: erő (Shift = ötösével) |
| Tüzelés | **TŰZ!** gomb | SPACE / ENTER |
| Fegyverválasztás | bal oldali ikonok | 1–5 |
| Különleges lövedék elsütése repülés közben (csillag robbantása, röplapok szórása, sarló visszahívása) | koppintás a pályára | SPACE |
| Röppálya-előnézet | kapcsoló alul | T |
| Szünet / Hang / Újrakezdés | ikonok jobb felül | P (Esc) / M / R |

## Fegyverek

1. **Kalapácsvető** – nehéz, erős, végtelen.
2. **Sarlóbumeráng** – átvágja a gyengébb anyagokat, majd visszatér (az acél visszaveri).
3. **Vörös csillag** – becsapódáskor vagy koppintásra robban.
4. **Propagandaágyú** – röplapokat szór: meggyengíti az elemeket, elkergeti a bankárokat (AGITÁCIÓ-bónusz), és sztrájkot hirdet, így egy körig nincs újjáépítés.
5. **FORRADALOM!** – a rombolás tölti; óriási vörös csillag + kalapácseső.

## Játékmenet

- 7 pálya + főellenség: A burzsoá bank, Wall Street, A milliárdos tornya, A pénzgyár, A fogyasztás temploma, A monopólium, A kapitalizmus szíve, végül MR. CAPITAL.
- Valódi 2D merevtest-fizika (Matter.js, helyben a repóban): az épületek fizikailag omlanak össze.
- Korlátozott lövésszám – az összes célpontot (pénzeszsák, aranyrúd, széf, aranybika, pénznyomda, bevásárlókocsi, aktatáska, aranydollár) le kell dönteni.
- **A kapitalizmus újraépül:** minden lövés után új emelet, acélmerevítés, új épületrész, pénznyomtatás, új szárny, fúzió, növekvő szobor vagy mentőcsomag.
- Pontozás: rombolás + bónuszok (megmaradt lövések, láncreakció, többes találat, mesterlövés különleges fegyverrel, agitáció).
- MR. CAPITAL támadásai: **kamatemelés** (hátralöki Lenint), **infláció** (–30% lőerő a következő lövésre), **adósságbuborék** (lefékezi a lövedéket). A gyenge pontjai: monokli, széfszív, cilinder.
- Haladás, pályarekordok és legjobb összpontszám a böngészőben (localStorage); a végső győzelem után **ÚJ JÁTÉK+**.
- Asztali gépen és mobilon is megy (érintéses célzás, fekvő mód ajánlott). Hang: WebAudio-szintézis, nincs hangfájl.

## Futtatás helyben

Statikus oldal, nincs backend: `python3 -m http.server` a mappában, majd `http://localhost:8000`. Hibakereső mód: `?debug=1` (pálya megnyerése, végtelen lövés, ugrás pályára, automatikus lövés).

---

## English
**Workers of the world, click!** – a humorous physics demolition game in 1920s Soviet poster style. Aim by dragging back like a slingshot (or sliders / arrow keys), fire with SPACE or **FIRE!**, pick weapons with 1–5, tap mid-air to trigger specials. Topple every capitalist target within the shot limit while capitalism rebuilds itself after every shot, then defeat MR. CAPITAL by hitting his weak points.

## Deutsch
**Proletarier aller Länder, klickt!** – humorvolles Physik-Abrissspiel im Stil sowjetischer Plakate der 1920er. Zielen durch Zurückziehen wie bei einer Schleuder (oder Regler / Pfeiltasten), Feuer mit LEERTASTE oder **FEUER!**, Waffen mit 1–5, Spezialeffekte per Tippen in der Luft. Zerstöre alle Ziele mit begrenzten Schüssen – der Kapitalismus baut sich nach jedem Schuss wieder auf – und besiege MR. CAPITAL an seinen Schwachstellen.

## Français
**Prolétaires de tous les pays, cliquez !** – jeu de démolition physique humoristique au style des affiches soviétiques des années 1920. Vise en tirant vers l'arrière comme une fronde (ou curseurs / flèches), tire avec ESPACE ou **FEU !**, armes 1–5, touche en vol pour les effets spéciaux. Abats toutes les cibles avec un nombre de tirs limité – le capitalisme se reconstruit après chaque tir – puis vaincs MR. CAPITAL en visant ses points faibles.

## Русский
**Пролетарии всех стран, кликайте!** – юмористическая физическая игра-разрушалка в стиле советских плакатов 1920-х. Целься, оттягивая назад как рогатку (или ползунки / стрелки), стреляй ПРОБЕЛОМ или кнопкой **ОГОНЬ!**, оружие 1–5, нажатие в полёте активирует спецэффект. Уничтожь все цели за ограниченное число выстрелов – капитализм отстраивается после каждого выстрела – и победи МИСТЕРА КАПИТАЛА, попадая по слабым местам.

---
Technika: HTML5 Canvas + JavaScript, Matter.js 0.20 (MIT, `js/matter.min.js`), betűtípusok: Russo One és Oswald (SIL OFL, `fonts/`). Minden grafika kódból rajzolt.
