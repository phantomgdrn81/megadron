// ==UserScript==
// @name         Megadron Scripts Packed
// @namespace    megadron.pl
// @version      1.3.5
// @description  do repozytorium
// @author       DF
// @match        https://client6220.idosell.com/*
// @match        https://megadron.pl/pl/products/*
// @match        https://salescenter.allegro.com/*
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @connect      client6220.idosell.com
// @connect      edge.salescenter.allegro.com
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/phantomgdrn81/megadron/refs/heads/main/megadronTM.user.js
// @downloadURL  https://raw.githubusercontent.com/phantomgdrn81/megadron/refs/heads/main/megadronTM.user.js
// ==/UserScript==

/* global $, IAI */

(function () {
    'use strict';

    const url = window.location.href;

    // ════════════════════════════════════════════════════════════════════════
    // PRZEKIEROWANIE /panel/ -> /panel/app/
    // ════════════════════════════════════════════════════════════════════════

    if (window.self === window.top) {
        const AP_REQUIRED_PREFIX = 'https://client6220.idosell.com/panel/app/';
        const AP_BASE_PREFIX = 'https://client6220.idosell.com/panel/';
        const AP_EXCLUDED_PATHS = ['/panel/orders-connect'];

        const isExcluded = AP_EXCLUDED_PATHS.some(path => url.includes(path));

        if (!isExcluded && url.startsWith(AP_BASE_PREFIX) && !url.startsWith(AP_REQUIRED_PREFIX)) {
            const apFixedUrl = AP_REQUIRED_PREFIX + url.slice(AP_BASE_PREFIX.length);
            window.location.replace(apFixedUrl);
            return;
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // WSPÓLNE
    // ════════════════════════════════════════════════════════════════════════

    // Dane paczki z JSON-a w onclick przy numerze przesyłki (strona zamówienia)
    function orderPackage() {
        try {
            const el = document.getElementById('deliverer-number-count_' + IAI._orderNumber);
            if (!el) return null;
            const json = JSON.parse(el.getAttribute('onclick')
                .replace('show_packages_edit_toplayer(event,', '').replace(/\)\s*$/, ''));
            const pack = json.delivery_packages.packs[0];
            const cell = el.closest('td');
            return pack && cell ? { el, json, pack, cell } : null;
        } catch (e) { return null; }
    }

    // Wiersz jedzie za kursorem, pozostałe robią miejsce. Ruch < 5 px = zwykły klik.
    // o: { lift, settle, sorting, box, scale, onStart, onEnd, onRelease, onDrop(to) }
    function dragSort(e, items, i, o) {
        const el = items[i];
        const rects = items.map(x => x.getBoundingClientRect());
        const gap = Math.max(0, rects[1].top - rects[0].bottom);
        const h = rects[i].height + gap;
        const mids = rects.map(r => r.top + r.height / 2);
        const minDy = rects[0].top - rects[i].top;
        const maxDy = rects[rects.length - 1].bottom - rects[i].bottom;
        const offset = n => n > i ? rects[n].bottom - rects[i].bottom : rects[n].top - rects[i].top;
        const y0 = e.clientY;
        let dragging = false, to = i;

        const place = n => items.forEach((x, j) => {
            if (j === i) return;
            const sh = (i < n && j > i && j <= n) ? -h : (n < i && j >= n && j < i) ? h : 0;
            x.style.transform = sh ? `translateY(${sh}px)` : '';
        });
        const finish = () => {
            window.removeEventListener('pointermove', onMove, true);
            window.removeEventListener('pointerup', onUp, true);
            window.removeEventListener('pointercancel', cancel, true);
            window.removeEventListener('keydown', onKey, true);
            o.box.classList.remove(o.sorting);
            if (o.onEnd) o.onEnd();
        };
        const cancel = () => {
            finish();
            el.classList.remove(o.lift);
            items.forEach(x => { x.style.transform = ''; });
        };
        const onKey = ev => { if (ev.key === 'Escape' && dragging) { ev.stopPropagation(); cancel(); } };
        const onMove = ev => {
            const dy = ev.clientY - y0;
            if (!dragging) {
                if (Math.abs(dy) < 5) return;
                dragging = true;
                if (o.onStart) o.onStart();
                el.classList.add(o.lift);
                o.box.classList.add(o.sorting);
                window.addEventListener('keydown', onKey, true);
            }
            const d = Math.max(minDy, Math.min(maxDy, dy));
            el.style.transform = `translateY(${d}px)` + (o.scale || '');
            const c = mids[i] + d;
            let n = 0;
            mids.forEach((m, j) => { if (Math.abs(m - c) < Math.abs(mids[n] - c)) n = j; });
            if (n !== to) { to = n; place(to); }
        };
        const onUp = ev => {
            if (!dragging && Math.abs(ev.clientY - y0) >= 5) onMove(ev); // szybki ruch
            finish();
            if (!dragging) return;
            if (o.onRelease) o.onRelease();
            el.classList.remove(o.lift);
            el.classList.add(o.settle);
            el.style.transform = `translateY(${offset(to)}px)`;
            setTimeout(() => o.onDrop(to), 160);
        };
        window.addEventListener('pointermove', onMove, true);
        window.addEventListener('pointerup', onUp, true);
        window.addEventListener('pointercancel', cancel, true);
    }

    // ════════════════════════════════════════════════════════════════════════
    // WAGA PACZKI – IKONA PRZY KURIERZE (każde zamówienie)
    // ════════════════════════════════════════════════════════════════════════

    if (url.includes('/panel/order-verification.php')) {

        window.addEventListener("load", () => {
            [0, 300, 800, 1500, 3000].forEach(d => setTimeout(addWagaGear, d));
        });

        // Własny pasek z ikoną w komórce kuriera – niezależny od guzików gabarytów
        function addWagaGear() {
            if (document.getElementById('tmWagaBar')) return;
            var data = orderPackage();
            if (!data) return;
            var pack = data.pack, cell = data.cell;

            if (!document.getElementById('wgStyle')) {
                var st = document.createElement('style');
                st.id = 'wgStyle';
                st.textContent =
                    '#tmWagaBar{display:flex;justify-content:flex-end;align-items:center;margin-top:6px}' +
                    '.wg-gear{border:0;background:none;color:#7d848c;line-height:0;padding:3px;border-radius:5px;cursor:pointer}' +
                    '.wg-gear svg{width:20px;height:20px}' +
                    '.wg-gear:hover,.wg-gear.on{color:#333;background:#eef0f3}' +
                    '.wg-pop{position:absolute;z-index:10000;width:220px;background:#fff;border:1px solid #dde1e6;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.18);padding:12px;font-size:12px;text-align:left}' +
                    '.wg-pop .wg-h{font-size:13px;font-weight:600;color:#222;margin-bottom:8px}' +
                    '.wg-pop .wg-f{display:flex;align-items:center;gap:6px}' +
                    '.wg-pop input{width:90px;height:28px;padding:2px 8px;font-size:14px;font-weight:600;border:1px solid #ccd2d8;border-radius:6px}' +
                    '.wg-pop .wg-u{color:#555}' +
                    '.wg-pop .wg-info{color:#777;margin:6px 0 10px}' +
                    '.wg-pop .wg-save{width:100%;height:30px;border:0;border-radius:6px;background:#3a3d42;color:#fff;font-weight:600;cursor:pointer}' +
                    '.wg-pop .wg-save:hover{background:#2b2e32}' +
                    '.wg-pop .wg-save:disabled{opacity:.6;cursor:wait}' +
                    '.wg-pop .wg-msg{margin-top:6px;min-height:14px;font-weight:600;text-align:center}' +
                    '.wg-pop .wg-msg.ok{color:#2e7d32}.wg-pop .wg-msg.err{color:#c62828}';
                document.head.appendChild(st);
            }

            var gear = document.createElement('button');
            gear.type = 'button';
            gear.className = 'wg-gear';
            gear.title = 'Zmień wagę paczki';
            // odważnik z uchwytem i napisem „kg”
            gear.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
                '<path d="M12 2.5a4.5 4.5 0 0 0-4.2 6.1H6.6a1.6 1.6 0 0 0-1.6 1.3L3.1 19.6A1.6 1.6 0 0 0 4.7 21.5h14.6a1.6 1.6 0 0 0 1.6-1.9L19 9.9a1.6 1.6 0 0 0-1.6-1.3h-1.2A4.5 4.5 0 0 0 12 2.5zm0 2a2.5 2.5 0 0 1 2 4.1h-4a2.5 2.5 0 0 1 2-4.1z"/>' +
                '<text x="12" y="18.2" text-anchor="middle" font-size="7.5" font-weight="700" font-family="Arial,sans-serif" fill="#fff">kg</text>' +
                '</svg>';
            gear.addEventListener('click', function (e) {
                e.stopPropagation();
                if (document.querySelector('.wg-pop')) return wagaClose();
                wagaOpen(gear, pack);
            });

            var bar = document.createElement('div');
            bar.id = 'tmWagaBar';
            bar.appendChild(gear);
            var kafelki = document.getElementById('wyborGabarytu');
            if (kafelki && kafelki.parentNode === cell) cell.insertBefore(bar, kafelki);
            else cell.appendChild(bar);
        }

        function wagaClose() {
            var pop = document.querySelector('.wg-pop');
            if (pop) pop.remove();
            var gear = document.querySelector('.wg-gear');
            if (gear) gear.classList.remove('on');
            document.removeEventListener('mousedown', wagaOutside);
        }
        function wagaOutside(e) {
            if (!e.target.closest('.wg-pop, .wg-gear')) wagaClose();
        }

        // Wpisujemy wagę całkowitą (pierwsze okienko na stronie zamówienia). IdoSell przechowuje ją jako
        // produkty + opakowanie, więc tak jak panel: opakowanie = całkowita − produkty.
        function wagaOpen(gear, pack) {
            var products = parseInt(pack.products_weight, 10) || 0;
            var packaging = parseInt(pack.packaging_weight, 10) || 0;

            var pop = document.createElement('div');
            pop.className = 'wg-pop';
            pop.innerHTML =
                '<div class="wg-h">Waga całkowita paczki</div>' +
                '<div class="wg-f"><input type="number" min="0" step="1"><span class="wg-u">g</span></div>' +
                '<div class="wg-info"></div>' +
                '<button type="button" class="wg-save">Zapisz</button>' +
                '<div class="wg-msg"></div>';
            var input = pop.querySelector('input');
            var info = pop.querySelector('.wg-info');
            var save = pop.querySelector('.wg-save');
            var msg = pop.querySelector('.wg-msg');

            var refresh = function () {
                info.textContent = 'obecnie: ' + (products + packaging) + ' g';
            };
            input.value = products + packaging;
            refresh();
            input.addEventListener('input', function () { msg.textContent = ''; msg.className = 'wg-msg'; });
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') { e.preventDefault(); save.click(); }
                if (e.key === 'Escape') wagaClose();
            });

            save.addEventListener('click', function () {
                if (input.value === '' || !(parseInt(input.value, 10) >= 0)) { input.focus(); return; }
                var newPackaging = parseInt(input.value, 10) - products;
                save.disabled = true;
                msg.className = 'wg-msg';
                msg.textContent = 'Zapisywanie…';
                var request = new IAI.ajax.request({
                    method: 'POST',
                    gate: '/panel/ajax/shipment.php',
                    params: 'action=savePackagesWeights&eventId=' + pack.event_id + '&eventType=' + pack.event_type +
                        '&packageIds[]=' + pack.id +
                        '&productsWeights[' + pack.id + ']=' + products +
                        '&packagingWeights[' + pack.id + ']=' + newPackaging,
                    sync: false,
                });
                var timer = setTimeout(function () {
                    save.disabled = false;
                    msg.className = 'wg-msg err';
                    msg.textContent = 'Brak potwierdzenia zapisu';
                }, 10000);
                request.onSuccess = function () {
                    clearTimeout(timer);
                    packaging = newPackaging;
                    pack.packaging_weight = String(newPackaging);
                    refresh();
                    save.disabled = false;
                    msg.className = 'wg-msg ok';
                    msg.textContent = 'Zapisano ✓';
                };
                request.makeRequest();
            });

            document.body.appendChild(pop);
            var r = gear.getBoundingClientRect();
            pop.style.top = (r.bottom + window.scrollY + 6) + 'px';
            pop.style.left = Math.max(6, r.right + window.scrollX - pop.offsetWidth) + 'px';
            gear.classList.add('on');
            document.addEventListener('mousedown', wagaOutside);
            input.focus();
            input.select();
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // WARTOŚĆ ZAMÓWIENIA PRZY PŁATNOŚCI
    // ════════════════════════════════════════════════════════════════════════

    if (url.includes('/panel/order-verification.php')) {

        window.addEventListener("load", () => {
            [0, 500, 1500, 3000].forEach(d => setTimeout(addWartoscZamowienia, d));
        });

        function addWartoscZamowienia() {
            if (document.querySelector('.tm-order-value')) return;
            var od = IAI && IAI._orderdata;
            if (!od || od.currency_sum == null) return;
            var row = [...document.querySelectorAll('tr')].find(function (tr) {
                return tr.cells.length >= 2 && /Sposób płatności/i.test(tr.cells[0].textContent);
            });
            if (!row) return;

            var currency = od.order_currency || od.currency || 'PLN';
            var amount = parseFloat(od.currency_sum);
            var text;
            try {
                text = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: currency }).format(amount);
            } catch (e) {
                text = amount.toFixed(2).replace('.', ',') + ' ' + currency;
            }

            var pill = document.createElement('div');
            pill.className = 'tm-order-value';
            pill.title = 'Wartość zamówienia';
            pill.style.cssText = 'display:inline-block;margin:2px 0 0 8px;padding:2px 9px;border-radius:10px;background:#eef0f3;color:#333;font-size:12px;font-weight:600;white-space:nowrap';
            pill.textContent = text;
            var cell = row.cells[1];
            (cell.querySelector('.text') || cell).appendChild(pill);
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // PAKOWANIE – GABARYTY (InPost, Allegro) / KARTONY
    // Jedna decyzja (packagingType) i jedno wyświetlenie (renderPackaging).
    // ════════════════════════════════════════════════════════════════════════

    if (url.includes('/panel/order-verification.php')) {

        const STORE_KEY = 'kartony';
        const SELECTED_KEY = 'kartonWybrany';
        const NAME_MAX = 10;

        const kq = (sel, root = document) => root.querySelector(sel);
        const sleep = ms => new Promise(r => setTimeout(r, ms));

        const loadBoxes = () => { try { return GM_getValue(STORE_KEY, []) || []; } catch (e) { return []; } };
        const saveBoxes = boxes => GM_setValue(STORE_KEY, boxes);

        // Kafelki A/B/C – wspólne dla InPost i kurierów Allegro
        const GB_KAFELKI = [
            { letter: 'A', dims: '8×38×64 cm', cls: 'btn btn-sm btn-success formbutton' },
            { letter: 'B', dims: '19×38×64 cm', cls: 'btn btn-sm btn-warning formbutton' },
            { letter: 'C', dims: '41×38×64 cm', cls: 'btn btn-sm btn-danger formbutton' },
        ];

        // Kurierzy Allegro z gabarytem zamiast wymiarów. Porównanie po początku nazwy
        // (np. 'Allegro One Box' łapie też „(DPD)”). InPost osobno w packagingType().
        const GB_COURIER_TITLES = [
            'Allegro Automat DPD Pickup',
            'Allegro Odbiór w Punkcie DPD',
            'Allegro Odbiór w Punkcie Orlen Paczka',
            'Allegro Automat Orlen Paczka',
            'Allegro Automat DHL BOX 24/7',
            'Allegro Odbiór w Punkcie DHL',
            'Allegro One Box',
            'Allegro One Kurier',
            'Allegro kurier DPD',
        ];

        function gabarytKafelki(mydiv, onPick) {
            if (!mydiv || document.getElementById('wyborGabarytu')) return;
            if (!document.getElementById('gbStyle')) {
                var st = document.createElement('style');
                st.id = 'gbStyle';
                st.textContent =
                    '#wyborGabarytu{margin-top:8px;text-align:center}' +
                    '#wyborGabarytu > b{font-size:15px}' +
                    '#wyborGabarytu .gb-row{display:flex;gap:4px}' +
                    '#wyborGabarytu .gb-btn{flex:1 1 0;min-width:0;height:58px;font-size:16px;border-radius:3px;line-height:1.15;padding:4px 6px}' +
                    '#wyborGabarytu .gb-btn small{display:block;font-size:12px;opacity:.85;white-space:nowrap}';
                document.head.appendChild(st);
            }

            var wrap = document.createElement('div');
            wrap.id = 'wyborGabarytu';
            wrap.innerHTML = '<div class="gb-row"></div>';
            var row = wrap.querySelector('.gb-row');

            GB_KAFELKI.forEach(function (g) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = g.cls + ' gb-btn';
                btn.innerHTML = 'Gabaryt ' + g.letter + '<small>' + g.dims + '</small>';
                btn.addEventListener('click', function () {
                    onPick(g.letter);
                    wrap.innerHTML = '<br/><b>Przypisano gabaryt ' + g.letter + '!</b>';
                    var fgCode = document.querySelector('#fg_code');
                    if (fgCode) fgCode.focus();
                });
                row.appendChild(btn);
            });

            mydiv.appendChild(wrap);
        }

        function rowText(label) {
            const tr = [...document.querySelectorAll('tr')]
                .find(t => t.cells.length >= 2 && t.cells[0].textContent.trim().startsWith(label));
            return tr ? tr.cells[1].textContent.replace(/\s+/g, ' ').trim() : '';
        }

        function isAllegro() {
            return /^Allegro/i.test(rowText('Kurier'));
        }

        // Zamówienie zagraniczne: domena allegro.xx, flaga inna niż PL albo kraj inny niż Polska
        function isForeignOrder(el) {
            if (/allegro\.(?!pl\b)[a-z]{2}\b/i.test(rowText('Źródło zamówienia'))) return true;
            const table = el && el.closest('table');
            if (!table) return false;
            const flags = [...table.querySelectorAll('img')]
                .map(i => (i.getAttribute('src') || '').match(/(?:^|\/)([a-z]{2})\.png$/i))
                .filter(Boolean).map(m => m[1].toLowerCase());
            if (flags.some(cc => cc !== 'pl')) return true;
            const countries = (table.rows[2]?.cells[1]?.textContent || '').match(/\(([^()]+)\)/g) || [];
            return countries.some(c => !/Polska/i.test(c));
        }

        // "Allegro kurier DPD (Polska) [zmień]" -> "allegro kurier dpd"
        // (IdoSell w title podaje nazwę bez kraju, a w wierszu „Kurier” z krajem)
        const normCourier = s => (s || '').replace(/\[zmień\]/i, '').replace(/\s*\([^()]*\)\s*$/, '')
            .replace(/\s+/g, ' ').trim().toLowerCase();

        // Kurier na stronie: wiersz „Kurier” albo atrybut title zaczyna się od podanej nazwy
        function courierIs(title) {
            const want = normCourier(title);
            if (normCourier(rowText('Kurier')).startsWith(want)) return true;
            return [...document.querySelectorAll('[title]')]
                .some(e => normCourier(e.getAttribute('title')).startsWith(want));
        }
        const courierIn = titles => titles.some(courierIs);

        // --- Jedna decyzja: co pokazać przy tym zamówieniu ---
        // null = nic; undefined = jeszcze za wcześnie (strona się nie doładowała)
        function packagingType(data) {
            if (!data || !rowText('Kurier')) return undefined;
            if (data.pack.package_number) return null;
            const link = kq('a.generateNumber22');
            const allegro = isAllegro();
            if (allegro && isForeignOrder(link || data.el)) return 'box';
            if (courierIs('Paczkomaty InPost Smile')) return 'inpost-smile';
            if (courierIs('Allegro miniKurier24 InPost')) return 'inpost-mini';
            if (courierIn(['Allegro Paczkomaty 24/7 InPost - wszystkie rozmiary', 'InPost Paczkomaty 24/7 - wszystkie rozmiary'])) return 'inpost-247';
            if (courierIn(GB_COURIER_TITLES)) return 'allegro-gauge';
            if (allegro) return 'box';
            if (!/^Allegro\b/i.test(data.json.deliverer_name || '')) return 'auto-generate';
            return null;
        }

        // --- Wysyłanie gabarytów ---
        const postGateway = body => IAI.ajax.post('/panel/ajax/packages-gateway.php', '', body);

        function gaugeHandler(type, data) {
            const json = data.json;
            if (type === 'inpost-smile') {
                const packageId = data.pack.id;
                return letter => {
                    IAI.ajax.post('/panel/ajax/orderd.php', '', 'action=assignBoxToPackage&packageId=' + packageId + '&boxType=' + letter);
                    postGateway('courierId=' + json.deliverer_id + '&action=generate&orders[]=' + json.order_id);
                };
            }
            if (type === 'inpost-mini') {
                // miniKurier24: samo zapytanie nie przypisuje gabarytu – robimy to przez okienko panelu
                return letter => generujPrzezOkienko('letter_' + letter.toLowerCase());
            }
            if (type === 'inpost-247') {
                const gauge = { A: 'small', B: 'medium', C: 'large' };
                return letter => postGateway('defaultParcelGauge=' + gauge[letter] + '&courierId=' + json.deliverer_id + '&action=generate&orders[]=' + json.order_id);
            }
            // allegro-gauge: wartości z selecta panelu (pierwsze trzy = A/B/C), inaczej S/M/L
            const gaugeSelect = document.querySelector('select#fg_defaultParcelGauge');
            let values = gaugeSelect ? [...gaugeSelect.options].map(o => o.value).filter(Boolean) : [];
            if (values.length < 3) values = ['S', 'M', 'L'];
            const gauge = { A: values[0], B: values[1], C: values[2] };
            return letter => {
                postGateway('defaultParcelGauge=' + gauge[letter] + '&courierId=' + json.deliverer_id + '&action=generate&orders[]=' + json.order_id);
                setTimeout(function () {
                    const link = document.querySelector('.generateNumber22');
                    if (link) link.click();
                }, 1200);
            };
        }

        // Otwiera okienko „Generowanie przesyłek i wydruków dla kuriera”, wybiera gabaryt i zatwierdza
        function generujPrzezOkienko(gaugeValue) {
            var link = document.querySelector('.generateNumber22') ||
                [...document.querySelectorAll('a')].find(function (a) { return /Generowanie przesyłek i wydruków/.test(a.textContent); });
            if (!link) return;
            link.click();
            var start = Date.now();
            (function czekaj() {
                var sel = document.getElementById('fg_defaultParcelGauge');
                if (sel && sel.offsetParent && [...sel.options].some(function (o) { return o.value === gaugeValue; })) {
                    sel.value = gaugeValue;
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                    var form = sel.closest('form');
                    var submit = form && [...form.elements].find(function (e) { return e.type === 'submit'; });
                    if (submit) submit.click();
                    return;
                }
                if (Date.now() - start < 10000) setTimeout(czekaj, 200);
            })();
        }

        function waitFor(fn, timeout = 10000) {
            return new Promise((resolve, reject) => {
                const t0 = Date.now();
                (function poll() {
                    let v;
                    try { v = fn(); } catch (e) { return reject(e); }
                    if (v) return resolve(v);
                    if (Date.now() - t0 > timeout) return reject(new Error('przekroczono czas oczekiwania'));
                    setTimeout(poll, 100);
                })();
            });
        }

        const visible = el => !!el && el.offsetParent !== null && !el.closest('.yui-overlay-hidden')
            && getComputedStyle(el).visibility !== 'hidden' && el.getClientRects().length > 0;
        const panelBusy = () => visible(kq('#wait_c')) || visible(kq('#ajax_c'));

        function setVal(el, v) {
            el.focus();
            el.value = String(v);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            el.blur();
        }

        // Widoczne komunikaty panelu (poza własnymi okienkami generowania)
        const panelAlerts = () => [...document.querySelectorAll('.yui-panel-container, .bootbox, .modal.in, .ui-dialog')]
            .filter(e => visible(e) && !/^(windowTopLayer_c|teporaryStorageView_c|wait_c|ajax_c)$/.test(e.id));
        function findPanelAlert() {
            const el = panelAlerts().find(e => e.innerText.trim());
            return el ? el.innerText.replace(/\s+/g, ' ').replace(/Close$/, '').trim() : '';
        }
        const closePanelAlert = () => panelAlerts()
            .forEach(e => kq('a.container-close, .close, .bootbox-close-button', e)?.click());

        const BOX_SVG = `<svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
            <path d="M16 3 4 8.5v15L16 29l12-5.5v-15z" fill="#c8894a"/>
            <path d="M16 3 4 8.5 16 14l12-5.5z" fill="#e0a868"/>
            <path d="M16 14v15L4 23.5v-15z" fill="#b5763a"/>
            <path d="M10 5.7 22 11.2v4.3l-3 1.4v-4.3L7 7.1z" fill="#f3d3a1"/>
        </svg>`;

        const BOX_SVG_GRAY = BOX_SVG.replace('#c8894a', '#d2d6db').replace('#e0a868', '#e3e6ea')
            .replace('#b5763a', '#c3c8ce').replace('#f3d3a1', '#f1f3f5');
        const GRIP_SVG = `<svg viewBox="0 0 10 16" width="10" height="16" aria-hidden="true" fill="#9aa1a9">
            <circle cx="2.5" cy="3" r="1.5"/><circle cx="7.5" cy="3" r="1.5"/><circle cx="2.5" cy="8" r="1.5"/>
            <circle cx="7.5" cy="8" r="1.5"/><circle cx="2.5" cy="13" r="1.5"/><circle cx="7.5" cy="13" r="1.5"/>
        </svg>`;

        function injectStyles() {
            const css = `
            .krb-card{margin:8px auto 2px;max-width:320px;background:#fff;border:1px solid #e2e5ea;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,.08);padding:10px 12px;text-align:left;font-family:inherit}
            .krb-bar{display:flex;gap:6px;align-items:stretch}
            .krb-main{flex:1;display:flex;align-items:center;gap:8px;background:#3a3d42;color:#fff;border:0;border-radius:6px;padding:10px 14px;min-height:54px;font-size:13px;font-weight:500;cursor:pointer;text-align:left;line-height:1.25}
            .krb-main:hover{background:#2b2e32}
            .krb-main .ico{flex:none;display:flex;align-items:center;justify-content:center;width:38px;height:34px;background:#ffcc00;border-radius:5px}
            .krb-main .ico svg{width:26px;height:26px}
            .krb-main.busy{background:#5b6068;cursor:wait}
            .krb-main.ok{background:#2e7d32}
            .krb-main.err{background:#c62828}
            .krb-gear{flex:none;width:44px;border:1px solid #cfd4da;background:#f6f7f9;border-radius:6px;cursor:pointer;font-size:16px;color:#555;display:flex;align-items:center;justify-content:center}
            .krb-gear:hover,.krb-gear.on{background:#e8ecf1;color:#222}
            .krb-pop{position:absolute;z-index:10000;width:290px;background:#fff;border:1px solid #dde1e6;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.18);padding:12px;font-size:12px;text-align:left}
            .krb-pop-h{display:flex;align-items:center;justify-content:space-between;font-size:14px;font-weight:600;color:#222;margin-bottom:10px}
            .krb-x{cursor:pointer;color:#888;font-size:18px;line-height:1;padding:0 2px}
            .krb-x:hover{color:#222}
            .krb-tile{position:relative;display:flex;align-items:center;gap:10px;background:#fff8db;border:1px solid #f0d77a;border-radius:8px;padding:9px 10px 9px 6px;margin-bottom:8px;cursor:grab;touch-action:none;user-select:none;transition:transform .18s ease}
            .krb-tile:hover{background:#fff1b8;border-color:#e6c000}
            .krb-tile .grip{flex:none;display:flex;align-items:center;padding:4px 2px;margin-right:-4px}
            .krb-tile.lift{transition:none;z-index:2;cursor:grabbing;box-shadow:0 8px 20px rgba(0,0,0,.18)}
            .krb-tile.settle{transition:transform .15s ease;z-index:2}
            .krb-pop.sorting{user-select:none;cursor:grabbing}
            .krb-tile .nm{font-weight:600;color:#222;font-size:13px}
            .krb-tile .dm{color:#333;font-size:13px;font-weight:600;margin-top:1px}
            .krb-tile .del{position:absolute;right:8px;top:50%;transform:translateY(-50%);color:#c62828;font-size:15px;padding:2px 5px;border-radius:4px;cursor:pointer}
            .krb-tile .del:hover{background:#fbe3e3}
            .krb-tile.sel{background:#ffec9e;border:2px solid #e0b000;padding:8px 9px 8px 5px}
            .krb-main .txt{display:flex;flex-direction:column;min-width:0;white-space:nowrap}
            .krb-main .txt span{font-size:16px;font-weight:700;overflow:hidden;text-overflow:ellipsis}
            .krb-main .txt small{font-size:13px;opacity:.9;font-weight:600;margin-top:2px}
            .krb-addrow{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #dfe3e7;border-radius:8px;padding:8px 12px;cursor:pointer;color:#555;font-size:13px;font-weight:500}
            .krb-addrow:hover{background:#f6f7f9;border-color:#c9ced4}
            .krb-addrow svg{flex:none;width:30px;height:30px}
            .krb-addrow .plus{margin-left:auto;width:22px;height:22px;border:1px solid #c4c9cf;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#8a9097;font-size:16px;line-height:1}
            .krb-toast{position:fixed;top:12px;right:12px;z-index:100000;max-width:360px;padding:9px 14px;border-radius:8px;color:#fff;background:#3a3d42;font-size:13px;box-shadow:0 6px 18px rgba(0,0,0,.25)}
            .krb-toast.busy{background:#5b6068}.krb-toast.ok{background:#2e7d32}.krb-toast.err{background:#c62828}
            .krb-add{border:1px dashed #c4ccd5;border-radius:8px;padding:8px;background:#fafbfc}
            .krb-add .lbl{display:flex;justify-content:space-between;color:#666;margin-bottom:6px}
            .krb-add .lbl .krb-x{font-size:15px}
            .krb-add .f{display:flex;gap:4px}
            .krb-add input{min-width:0;font-size:12px;height:24px;padding:2px 5px;border:1px solid #ccd2d8;border-radius:4px}
            .krb-add input.n{flex:2}.krb-add input.d{flex:1}
            .krb-add button{flex:none;width:26px;height:24px;border:1px solid #e0b000;background:#fff8db;color:#8a6d00;border-radius:4px;cursor:pointer;font-size:15px;line-height:1}
            .krb-empty{color:#777;padding:6px 2px 10px}
            `;
            const s = document.createElement('style');
            s.textContent = css;
            document.head.appendChild(s);
        }

        let busy = false;
        let mainBtn, mainLabel;

        function getSelected() {
            const boxes = loadBoxes();
            let name = null;
            try { name = GM_getValue(SELECTED_KEY, null); } catch (e) { }
            return boxes.find(b => b.name === name) || boxes[0] || null;
        }
        const setSelected = box => GM_setValue(SELECTED_KEY, box ? box.name : null);

        let toast, toastTimer;
        function setStatus(state, text) {
            if (mainBtn && mainBtn.isConnected) {
                mainBtn.classList.remove('busy', 'ok', 'err');
                if (state) mainBtn.classList.add(state);
                mainLabel.textContent = text;
            }
            if (!toast || !toast.isConnected) {
                toast = document.createElement('div');
                document.body.appendChild(toast);
            }
            toast.className = 'krb-toast ' + (state || '');
            toast.textContent = text;
            clearTimeout(toastTimer);
            if (state === 'ok') toastTimer = setTimeout(() => toast.remove(), 8000);
            if (state === 'err') toast.onclick = () => toast.remove();
        }

        function showSelected() {
            if (busy || !mainBtn || !mainBtn.isConnected) return;
            mainBtn.classList.remove('busy', 'ok', 'err');
            const b = getSelected();
            if (!b) {
                mainLabel.textContent = 'Dodaj karton ⚙';
                mainBtn.title = 'Brak kartonów – dodaj je w ustawieniach';
                return;
            }
            mainLabel.innerHTML = '<span></span><small></small>';
            mainLabel.firstChild.textContent = b.name.slice(0, NAME_MAX);
            mainLabel.lastChild.textContent = `${b.h}×${b.w}×${b.l} cm`;
            mainBtn.title = `Kliknij, aby wygenerować etykietę (wys × szer × dł: ${b.h} × ${b.w} × ${b.l} cm)`;
        }

        async function generate(box) {
            if (busy) return;
            busy = true;
            closePop();
            try {
                const link = kq('a.generateNumber22');
                if (!link) throw new Error('brak linku generowania');

                setStatus('busy', `Generuję: ${box.name}…`);
                link.click();
                // Formularz kuriera: wymiary (fg_Height) albo gabaryt (fg_defaultParcelGauge)
                const found = await waitFor(() => {
                    const e = kq('#fg_Height');
                    if (visible(e)) return e;
                    const g = kq('#fg_defaultParcelGauge');
                    return visible(g) ? 'gauge' : null;
                });
                if (found === 'gauge') {
                    kq('#windowTopLayer_c a.container-close')?.click();
                    kq('.krb-card')?.remove();
                    throw new Error('Ten kurier używa gabarytów (S/M/L / A/B/C), nie wymiarów');
                }
                const h = found;
                const panel = h.closest('#windowTopLayer_c') || h.closest('form') || document;
                setVal(h, box.h);
                setVal(kq('#fg_Width', panel), box.w);
                setVal(kq('#fg_Length', panel), box.l);

                const submit = panel.querySelector('input.formbutton[type=submit], button[type=submit]');
                if (!submit) throw new Error('brak przycisku Generuj');

                setPending(box);
                submit.click();

                await waitFor(() => {
                    const err = findPanelAlert();
                    if (err) throw new Error(err);
                    const cell = kq('a.generateNumber22')?.closest('td');
                    return (!cell || !/Nie wygenerowano numeru/i.test(cell.textContent))
                        && !visible(kq('#windowTopLayer_c')) && !panelBusy();
                }, 30000);
                if (!takePending()) return;
                await finishLabel(box);
            } catch (e) {
                clearPending();
                setStatus('err', '✗ ' + (e.message || e).slice(0, 120));
                busy = false;
                setTimeout(showSelected, 8000);
            }
        }

        const PENDING_KEY = 'krbPending';
        const orderId = () => new URLSearchParams(location.search).get('idt') || '';
        function setPending(box) {
            try { sessionStorage.setItem(PENDING_KEY, JSON.stringify({ idt: orderId(), box, t: Date.now() })); } catch (e) { }
        }
        function clearPending() { try { sessionStorage.removeItem(PENDING_KEY); } catch (e) { } }
        // Zwraca karton, jeśli dla tego zamówienia czeka krok 2 (i zdejmuje flagę)
        function takePending() {
            let p = null;
            try { p = JSON.parse(sessionStorage.getItem(PENDING_KEY) || 'null'); } catch (e) { }
            if (!p) return null;
            clearPending();
            return p.idt === orderId() && Date.now() - p.t < 180000 ? p.box : null;
        }

        async function finishLabel(box) {
            busy = true;
            try {
                setStatus('busy', `Tworzę etykietę (${box.name})…`);
                let pdf = null, lastMsg = '';
                for (let i = 0; i < 10 && !pdf; i++) {
                    if (i) await sleep(1000);
                    await waitFor(() => !panelBusy(), 30000);
                    const again = kq('a.generateNumber22');
                    if (!again) throw new Error('brak linku generowania (sprawdź numer przesyłki)');
                    again.click();
                    const r = await waitFor(() => {
                        const p = kq('#teporaryStorageView_c');
                        if (visible(p)) return [...p.querySelectorAll('a')].find(a => /\.pdf/i.test(a.textContent)) || null;
                        const form = kq('#windowTopLayer_c');
                        if (visible(form)) { kq('a.container-close', form)?.click(); return 'retry'; }
                        const alert = findPanelAlert();
                        if (alert) {
                            lastMsg = alert;
                            // Błąd od kuriera (np. "Nie udało się pobrać etykiety…")
                            if (/nie uda[łl]o si[ęe]|b[łl][ąa]d/i.test(alert)) return 'fatal';
                            closePanelAlert();
                            return 'retry';
                        }
                        return null;
                    }, 20000).catch(() => 'retry');
                    if (r === 'fatal') throw new Error(lastMsg);
                    if (r !== 'retry') pdf = r;
                }
                if (!pdf) throw new Error(lastMsg || 'etykieta nie pojawiła się na liście');
                // Nic nie otwieramy – okienko IdoSell z listą etykiet zostaje na ekranie
                setStatus('ok', `Etykieta gotowa (${box.name})`);
            } catch (e) {
                setStatus('err', '✗ ' + (e.message || e).slice(0, 300));
                busy = false;
                setTimeout(showSelected, 8000);
            }
        }

        // --- Popover z kartonami ---
        let pop = null;
        function closePop() {
            if (!pop) return;
            pop.remove(); pop = null;
            document.querySelector('.krb-gear')?.classList.remove('on');
            document.removeEventListener('mousedown', onOutside);
            document.removeEventListener('keydown', onEsc);
        }
        function onOutside(e) { if (pop && !pop.contains(e.target) && !e.target.closest('.krb-bar')) closePop(); }
        function onEsc(e) { if (e.key === 'Escape') closePop(); }

        function openPop(anchor) {
            closePop();
            pop = document.createElement('div');
            pop.className = 'krb-pop';
            let justDragged = false;

            const render = (adding = false) => {
                const boxes = loadBoxes();
                const sel = getSelected();
                pop.innerHTML = `<div class="krb-pop-h"><span>Szablony Pakowania (Kartony)</span><span class="krb-x" title="Zamknij">×</span></div>`;
                pop.querySelector('.krb-x').onclick = closePop;

                boxes.forEach((b, i) => {
                    const isSel = sel && b.name === sel.name;
                    const t = document.createElement('div');
                    t.className = 'krb-tile' + (isSel ? ' sel' : '');
                    t.innerHTML = `<span class="grip">${GRIP_SVG}</span>${BOX_SVG}<div><div class="nm"></div><div class="dm">${b.h} × ${b.w} × ${b.l} cm</div></div>`;
                    t.querySelector('.nm').textContent = b.name;
                    t.title = 'Kliknij, aby wybrać ten karton · przeciągnij, aby zmienić kolejność';
                    t.onclick = () => {
                        if (justDragged) { justDragged = false; return; } // puszczenie po przeciągnięciu to nie wybór
                        setSelected(b); showSelected(); closePop();
                    };

                    t.onpointerdown = e => {
                        if (e.button !== 0 || e.target.closest('.del') || boxes.length < 2) return;
                        e.preventDefault(); // bez zaznaczania tekstu; click nadal przychodzi
                        dragSort(e, [...pop.querySelectorAll('.krb-tile')], i, {
                            lift: 'lift', settle: 'settle', sorting: 'sorting', box: pop, scale: ' scale(1.02)',
                            onRelease: () => { justDragged = true; setTimeout(() => { justDragged = false; }, 0); },
                            onDrop: to => {
                                if (to !== i) { const [m] = boxes.splice(i, 1); boxes.splice(to, 0, m); saveBoxes(boxes); }
                                render(); showSelected();
                            },
                        });
                    };
                    const del = document.createElement('span');
                    del.className = 'del'; del.title = 'Usuń'; del.textContent = '✕';
                    del.onclick = e => {
                        e.stopPropagation();
                        boxes.splice(i, 1); saveBoxes(boxes);
                        if (isSel) setSelected(boxes[0] || null);
                        render(); showSelected();
                    };
                    t.appendChild(del);
                    pop.appendChild(t);
                });

                // Zwinięty wiersz "Nowy karton"
                if (!adding) {
                    const row = document.createElement('div');
                    row.className = 'krb-addrow';
                    row.title = 'Dodaj nowy karton';
                    row.innerHTML = `${BOX_SVG_GRAY}<span>Nowy karton</span><span class="plus">+</span>`;
                    row.onclick = () => render(true);
                    pop.appendChild(row);
                    return;
                }

                const add = document.createElement('div');
                add.className = 'krb-add';
                add.innerHTML = `<div class="lbl"><span>Nowy karton (wys × szer × dł, cm)</span><span class="krb-x" title="Anuluj">×</span></div><div class="f"><input class="n" placeholder="nazwa" maxlength="${NAME_MAX}"><input class="d" placeholder="wys"><input class="d" placeholder="szer"><input class="d" placeholder="dł"><button type="button" title="Dodaj">+</button></div>`;
                const [n, h, w, l] = add.querySelectorAll('input');
                const doAdd = () => {
                    const dims = [h, w, l].map(x => parseFloat(x.value.replace(',', '.')));
                    if (!n.value.trim() || dims.some(d => !(d > 0))) { n.focus(); return; }
                    const box = { name: n.value.trim().slice(0, NAME_MAX), h: dims[0], w: dims[1], l: dims[2] };
                    boxes.push(box); saveBoxes(boxes);
                    if (boxes.length === 1) setSelected(box);
                    render(); showSelected();
                };
                add.querySelector('.krb-x').onclick = () => render();
                add.querySelector('button').onclick = doAdd;
                add.querySelectorAll('input').forEach(x => x.onkeydown = e => {
                    if (e.key === 'Enter') { e.preventDefault(); doAdd(); }
                    if (e.key === 'Escape') { e.stopPropagation(); render(); } // Esc zwija formularz, nie zamyka okna
                });
                pop.appendChild(add);
                n.focus();
            };
            render();

            document.body.appendChild(pop);
            const r = anchor.getBoundingClientRect();
            pop.style.top = (r.bottom + window.scrollY + 6) + 'px';
            pop.style.left = Math.max(6, Math.min(r.left + window.scrollX, window.scrollX + document.documentElement.clientWidth - pop.offsetWidth - 6)) + 'px';
            document.addEventListener('mousedown', onOutside);
            document.addEventListener('keydown', onEsc);
        }

        // Karta kartonu w komórce numeru przesyłki; true = jest na stronie
        function mountBoxCard() {
            const link = kq('a.generateNumber22');
            if (!link) return false;
            if (kq('.krb-card')) return true;
            const td = link.closest('td');
            if (!td || !/Nie wygenerowano numeru/i.test(td.textContent)) return false;

            injectStyles();
            const card = document.createElement('div');
            card.className = 'krb-card';
            card.innerHTML = `
                <div class="krb-bar">
                    <button type="button" class="krb-main"><span class="ico">${BOX_SVG}</span><span class="txt"></span></button>
                    <button type="button" class="krb-gear" title="Wybierz / dodaj karton">⚙</button>
                </div>`;
            td.appendChild(card);

            mainBtn = kq('.krb-main', card);
            mainLabel = kq('.txt', mainBtn);
            const gear = kq('.krb-gear', card);
            const bar = kq('.krb-bar', card);

            const toggleGear = () => {
                if (pop) return closePop();
                openPop(bar);
                gear.classList.add('on');
            };
            mainBtn.onclick = () => {
                if (busy) return;
                const b = getSelected();
                if (!b) return toggleGear();
                generate(b);
            };
            gear.onclick = toggleGear;
            showSelected();
            return true;
        }

        // --- Jedno wyświetlenie: gabaryty ALBO karton ALBO automatyczne generowanie ---
        let pakDone = false;
        function renderPackaging() {
            if (pakDone) return;
            const data = orderPackage();
            const type = packagingType(data);
            if (type === undefined) return; // strona jeszcze się ładuje – kolejna próba
            try {
                if (type === 'box') {
                    if (!mountBoxCard()) return; // link generowania jeszcze nie gotowy
                } else if (type === 'auto-generate') {
                    postGateway('courierId=' + data.json.deliverer_id + '&action=generate&orders[]=' + data.json.order_id);
                } else if (type) {
                    // InPost: 5. kolumna wiersza; gdy jej nie ma (np. miniKurier24) – komórka kuriera
                    const cell = type.startsWith('inpost') ? (document.querySelector('#tr_0 > td:nth-child(5)') || data.cell) : data.cell;
                    gabarytKafelki(cell, gaugeHandler(type, data));
                }
                if (type && type !== 'box') $('#msg_line_msg').remove();
            } catch (e) {
                console.error('[Pakowanie]', e);
            }
            pakDone = true;
        }

        window.addEventListener("load", () => {
            const pendingBox = takePending();
            if (pendingBox) {
                injectStyles();
                finishLabel(pendingBox);
            } else {
                [0, 300, 700, 1200, 2000, 3000].forEach(d => setTimeout(renderPackaging, d));
            }
        });
    }

    // ════════════════════════════════════════════════════════════════════════
    // STAN M1 PRZY PAKOWANIU
    // ════════════════════════════════════════════════════════════════════════

    if (url.includes('/panel/order-verification.php')) {

        function fetchM1(idt, callback) {
            GM_xmlhttpRequest({
                method: 'POST',
                url: `https://client6220.idosell.com/panel/ajax/product-edit-aceform-tables.php?name=quantity&idt=${idt}&filtered=false`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Referer': `https://client6220.idosell.com/panel/product-edit.php?idt=${idt}`
                },
                data: `id=stocksQuantity&url=/panel/ajax/product-edit-aceform-tables.php%3Fname%3Dquantity%26idt%3D${idt}%26filtered%3Dfalse`,
                onload: function (response) {
                    try {
                        const doc = new DOMParser().parseFromString(response.responseText, 'text/html');
                        // pierwszy wiersz z niepustą ilością
                        const qty = [...doc.querySelectorAll('table tbody tr')]
                            .map(tr => tr.querySelectorAll('td')[1]?.textContent.trim())
                            .find(v => v && v !== '-');
                        callback(qty || null);
                    } catch (e) {
                        callback(null);
                    }
                },
                onerror: function () { callback(null); }
            });
        }

        function badgeM1(html) {
            const d = document.createElement('div');
            d.className = 'm1-stock-badge';
            d.style.cssText = 'margin-top:4px;padding:2px 8px;border-radius:4px;font-size:12px;display:inline-block;background:#FDF5E6;border:1px solid #D2B48C;color:#721c24';
            d.innerHTML = `📦 M1: <strong>${html}</strong>`;
            return d;
        }

        function m1Text(m1) {
            if (m1 === null) return '-';
            if (m1 === 'jest') return '<i> elektronicznie </i>';
            return parseInt(m1, 10) === 0 ? 'BRAK' : m1;
        }

        function processLinksM1() {
            document.querySelectorAll('a[onclick*="showProductInfo"]').forEach(a => {
                if (a.dataset.m1processed) return;
                a.dataset.m1processed = '1';

                const match = a.getAttribute('onclick').match(/showProductInfo\(`(\d+)`/);
                if (!match) return;
                const idt = match[1];

                const tr = a.closest('tr');
                if (!tr) return;

                const nameTd = tr.querySelector('td[class*="col-name"]');
                if (!nameTd) return;

                const lokalizacjeP = [...nameTd.querySelectorAll('p')].find(p => p.textContent.includes('Lokalizacje:'));
                if (!lokalizacjeP || lokalizacjeP.parentElement.querySelector('.m1-stock-badge')) return;

                const placeholder = badgeM1('ładowanie…');
                lokalizacjeP.insertAdjacentElement('afterend', placeholder);
                fetchM1(idt, m1 => placeholder.replaceWith(badgeM1(m1Text(m1))));
            });
        }

        new MutationObserver(processLinksM1).observe(document.documentElement, { childList: true, subtree: true });
        processLinksM1();
    }

    // ════════════════════════════════════════════════════════════════════════
    // UKRYJ WIERSZE W HISTORII ZAMÓWIENIA
    // ════════════════════════════════════════════════════════════════════════

    if (url.includes('/panel/orderd.php') || url.includes('/panel/app/orderd.php')) {

        const NEEDLE_PHRASES = [
            'Nie udało się wykonać automatycznej zmiany statusu zamówienia, gdy wszystkie towary znalazły się na magazynach własnych. Niewystarczająca ilość towaru na stanie dyspozycyjnym'
        ];
        const MARK_ATTR = 'data-tm-hidden-by-script';
        let hiddenCount = 0;
        let showingHidden = false;

        const shouldHideRowText = text => NEEDLE_PHRASES.some(p => text.includes(p));

        function ensureUI() {
            const anchor = document.querySelector('div.hd#orderHistoryDiv_h');
            if (!anchor || !anchor.parentNode) return false;
            if (document.getElementById('tm-hidden-rows-summary')) return true;

            const summaryEl = document.createElement('div');
            summaryEl.id = 'tm-hidden-rows-summary';
            summaryEl.textContent = 'Skrypt ukrył 0 wierszy';
            summaryEl.style.cssText = 'margin:12px 0 8px;padding:10px 12px;border:2px solid #d00;color:#d00;font-weight:700;background:#fff5f5;font-family:Arial,sans-serif;font-size:14px';

            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.id = 'tm-toggle-hidden-rows';
            toggleBtn.textContent = 'Pokaż ukryte';
            toggleBtn.style.cssText = 'margin:0 0 12px 0;padding:6px 12px;cursor:pointer;font-weight:700;';

            toggleBtn.addEventListener('click', () => {
                showingHidden = !showingHidden;
                document.querySelectorAll(`tr[${MARK_ATTR}="1"]`).forEach(tr => {
                    tr.style.display = showingHidden ? '' : 'none';
                });
                toggleBtn.textContent = showingHidden ? 'Ukryj ponownie' : 'Pokaż ukryte';
            });

            anchor.parentNode.insertBefore(summaryEl, anchor.nextSibling);
            anchor.parentNode.insertBefore(toggleBtn, summaryEl.nextSibling);
            return true;
        }

        function updateSummaryHistory() {
            ensureUI();
            const el = document.getElementById('tm-hidden-rows-summary');
            if (el) el.textContent = `Skrypt ukrył ${hiddenCount} wierszy`;
        }

        function processRowsHistory(root = document) {
            const rows = root.querySelectorAll ? root.querySelectorAll('tr') : [];
            for (const tr of rows) {
                if (!(tr instanceof HTMLElement)) continue;
                if (tr.hasAttribute(MARK_ATTR)) continue;
                if (shouldHideRowText(tr.textContent)) {
                    tr.setAttribute(MARK_ATTR, '1');
                    tr.style.display = showingHidden ? '' : 'none';
                    hiddenCount += 1;
                } else {
                    tr.setAttribute(MARK_ATTR, '0');
                }
            }
            updateSummaryHistory();
        }

        function scheduleRescanSequence() {
            [0, 200, 600, 1200, 2000].forEach(d => setTimeout(() => processRowsHistory(document), d));
        }

        function hookHistoryClick() {
            document.addEventListener('click', (e) => {
                const a = e.target && e.target.closest ? e.target.closest('a') : null;
                if (!a) return;
                const onclick = a.getAttribute('onclick') || '';
                const txt = (a.textContent || '').trim();
                if (txt === 'Historia zamówienia' || onclick.includes('IAI._orderd.orderHistory(')) {
                    scheduleRescanSequence();
                }
            }, true);
        }

        function observeDomHistory() {
            const obs = new MutationObserver(mutations => {
                for (const m of mutations) {
                    for (const node of m.addedNodes) {
                        if (!(node instanceof HTMLElement)) continue;
                        if (node.matches?.('div.hd#orderHistoryDiv_h') || node.querySelector?.('div.hd#orderHistoryDiv_h')) {
                            ensureUI();
                        }
                        processRowsHistory(node);
                    }
                }
            });
            obs.observe(document.documentElement, { childList: true, subtree: true });
        }

        function startHistory() {
            ensureUI();
            processRowsHistory(document);
            hookHistoryClick();
            observeDomHistory();
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startHistory);
        } else {
            startHistory();
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // ALLEGRO OPISY KURIERÓW
    // ════════════════════════════════════════════════════════════════════════

    if (url.includes('/panel/orders-list.php')) {

        // Kolejność ma znaczenie: "Packeta, ORLEN Paczka" to Packeta, "One Box (DPD)" to One.
        // label – podpis dla Allegro (sam przewoźnik); short – przewoźnik w podpisie z rodzajem (pozostali kurierzy)
        const allegroCourierMap = [
            { match: /packeta/i, label: 'Packeta' },
            { match: /inpost/i, label: 'InPost' },
            { match: /\bone\b/i, label: 'One Kurier', short: 'One' },
            { match: /dpd/i, label: 'DPD' },
            { match: /dhl/i, label: 'DHL' },
            { match: /orlen/i, label: 'Orlen Paczka', short: 'Orlen' },
            { match: /\bups\b/i, label: 'UPS' },
            { match: /\bgls\b/i, label: 'GLS' },
            { match: /fedex/i, label: 'FedEx' },
            { match: /pocztex/i, label: 'Pocztex' },
            { match: /poczta polska/i, label: 'Poczta Polska' },
        ];

        const courierCountries = [
            [/holandi/i, 'NL'], [/austri/i, 'AT'], [/czech/i, 'CZ'], [/słowacj/i, 'SK'], [/węgi?r/i, 'HU'],
            [/niemc|niemiec/i, 'DE'], [/litw/i, 'LT'], [/łotw/i, 'LV'], [/estoni/i, 'EE'], [/rumuni/i, 'RO'],
            [/słoweni/i, 'SI'], [/chorwacj/i, 'HR'], [/belgi/i, 'BE'], [/franc/i, 'FR'], [/włoch/i, 'IT'], [/hiszpani/i, 'ES'],
        ];

        // Allegro: sam przewoźnik (DHL, DPD, Orlen Paczka, One Kurier, InPost, Pocztex); Packeta w Allegro = Orlen Paczka.
        // Pozostali: przewoźnik + rodzaj (Automat / Punkt / Kurier / Paczkomat) + kraj dla zagranicznych
        function getCourierLabel(name) {
            const n = name.replace(/\s*\(Polska\)\s*$/i, '').trim();
            if (/^Allegro\b/i.test(n) && /pocztex/i.test(n)) return 'Pocztex';
            if (/^Allegro\b/i.test(n) && /dpd/i.test(n)) return 'DPD';   // np. „Allegro One Box (DPD)”
            const courier = allegroCourierMap.find(c => c.match.test(n));
            if (!courier) return n.replace(/^Allegro\s+/i, '');
            if (/^Allegro\b/i.test(n)) {
                if (courier.label === 'Packeta') return 'Orlen Paczka';
                if (courier.label === 'One Kurier') return 'One\nKurier';   // zawijane w dwie linie
                if (courier.label === 'InPost') return /paczkomat|automat|wszystkie rozmiary/i.test(n) ? 'InPost Paczkomat' : 'InPost Kurier';
                return courier.label;
            }
            if (courier.label === 'DPD') return '';   // DPD spoza Allegro – bez podpisu
            if (/inpost international/i.test(n)) return '';   // InPost International – bez podpisu

            let type;
            if (courier.label === 'InPost') type = /paczkomat|automat|wszystkie rozmiary/i.test(n) ? 'Paczkomat' : 'Kurier';
            else if (/automat|\bbox\b/i.test(n)) type = 'Automat';
            else if (/punkt|odbiór w/i.test(n)) type = 'Punkt';
            else type = 'Kurier';

            let country = '';
            const domain = n.match(/allegro\.([a-z]{2})\b/i);
            if (domain && domain[1].toLowerCase() !== 'pl') country = domain[1].toUpperCase();
            else {
                const c = courierCountries.find(([re]) => re.test(n));
                if (c) country = c[1];
                else if (/zagraniczn/i.test(n)) country = 'zagr.';
            }
            return (courier.short || courier.label) + ' ' + type + (country ? ' (' + country + ')' : '');
        }

        function addCourierLabels() {
            document.querySelectorAll('img.delivery-icon').forEach(img => {
                const parent = img.parentElement;
                if (!parent) return;
                if (parent.querySelector('.tm-courier-label')) return;
                const fullName = img.title || img.alt;
                if (!fullName) return;
                const shortName = getCourierLabel(fullName);
                if (!shortName) return;

                parent.style.textAlign = 'center';
                const label = document.createElement('div');
                label.className = 'tm-courier-label';
                label.textContent = shortName;
                // 11px: „Paczkomat” mieści się w kolumnie; pre-line: „\n” = nowa linia
                label.style.cssText = 'font-size:11px;font-weight:600;line-height:1.3;margin-top:4px;color:#333;white-space:pre-line';
                parent.appendChild(label);
            });
        }

        addCourierLabels();
        new MutationObserver(addCourierLabels).observe(document.documentElement, { childList: true, subtree: true });
    }

    // ════════════════════════════════════════════════════════════════════════
    // SN-y WIĘKSZY PRZYCISK
    // ════════════════════════════════════════════════════════════════════════

    if (url.includes('/panel/order-verification.php')) {

        const STYLE_ID = 'serial-button-style';

        function addStylesSN() {
            if (document.getElementById(STYLE_ID)) return;
            const style = document.createElement('style');
            style.id = STYLE_ID;
            style.textContent = `
                a.serial-button {
                    display: inline-block !important;
                    padding: 8px 14px !important;
                    background-color: #428bca !important;
                    color: #fff !important;
                    border-radius: 4px !important;
                    font-weight: 600 !important;
                    text-decoration: none !important;
                    cursor: pointer !important;
                    border: 1px solid #1a68d1 !important;
                }
                a.serial-button:hover {
                    background-color: #3b7db6 !important;
                    color: #fff !important;
                    text-decoration: none !important;
                }
            `;
            document.head.appendChild(style);
        }

        function convertLinks() {
            document.querySelectorAll('a').forEach(a => {
                if (a.textContent.trim().toLowerCase() === 'wprowadź numery seryjne') {
                    a.classList.add('serial-button');
                }
            });
        }

        addStylesSN();
        convertLinks();
        new MutationObserver(convertLinks).observe(document.documentElement, { childList: true, subtree: true });
    }

    // ════════════════════════════════════════════════════════════════════════
    // LINKI Z ZAM DO ALLEGRO
    // ════════════════════════════════════════════════════════════════════════

    if (url.includes('/panel/orderd.php') || url.includes('/panel/app/orderd.php')) {

        var allegroUrl = "https://salescenter.allegro.com/orders/";
        var empikUrl = "https://marketplace.empik.com/mmp/shop/order/";

        function detectSource(li) {
            var sel = 'img[title="Empik"], img[title="Allegro"]';
            var container = li.closest("fieldset, .box, .panel, .content, .section, form, body") || document.body;
            var img = container.querySelector(sel) || document.querySelector(sel);
            return img ? img.getAttribute("title").trim() : "";
        }

        function addAllegroButton(orderId) {
            if (document.getElementById("allegro-order-button")) return;
            var btn = document.createElement("a");
            btn.id = "allegro-order-button";
            btn.href = allegroUrl + orderId;
            btn.target = "_blank";
            btn.rel = "noopener noreferrer";
            btn.textContent = "Allegro";
            btn.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:9999;padding:10px 16px;background:#ff5a00;color:#fff;font-size:14px;font-weight:700;border-radius:6px;text-decoration:none;box-shadow:0 2px 6px rgba(0,0,0,.3)';
            btn.onmouseenter = function () { btn.style.background = "#e64e00"; };
            btn.onmouseleave = function () { btn.style.background = "#ff5a00"; };
            document.body.appendChild(btn);
        }

        function runAllegroEmpik() {
            var listItems = document.getElementsByTagName("li");
            Array.prototype.forEach.call(listItems, function (li) {
                if (li.getAttribute("data-linkdone") === "1") return;
                var span = li.querySelector("span");
                if (!span) return;
                if (span.textContent.trim() !== "ID zamówienia w serwisie zewnętrznym:") return;
                var orderId = li.textContent.replace(span.textContent, "").trim();
                if (!orderId) return;
                var source = detectSource(li);
                var baseUrl = null;
                var label = null;
                if (source === "Empik") {
                    baseUrl = empikUrl;
                    label = "Empik";
                } else if (source === "Allegro") {
                    baseUrl = allegroUrl;
                    label = "Allegro";
                    addAllegroButton(orderId);
                } else {
                    return;
                }
                li.innerHTML = '<span style="font-weight:bold;">ID zamówienia w serwisie zewnętrznym (' + label + '):</span>';
                var a = document.createElement("a");
                a.href = baseUrl + orderId;
                a.textContent = orderId;
                a.target = "_blank";
                a.rel = "noopener noreferrer";
                li.appendChild(a);
                li.setAttribute("data-linkdone", "1");
            });
        }

        runAllegroEmpik();
        setTimeout(runAllegroEmpik, 500);
        setTimeout(runAllegroEmpik, 1500);
    }

    // ════════════════════════════════════════════════════════════════════════
    // INNE ZAMÓWIENIA KLIENTA W REALIZACJI
    // ════════════════════════════════════════════════════════════════════════

    if (url.includes('/panel/orderd.php') || url.includes('/panel/app/orderd.php')) {

        function runOtherOrders() {
            const old = document.getElementById('tm-order-box');
            if (old) old.remove();
            const links = document.querySelectorAll('a[style*="--color-status-on_order"]');
            if (links.length === 0) return;
            const orders = [...links].map(a => ({ number: a.textContent.trim(), href: a.href }));

            const box = document.createElement('div');
            box.id = 'tm-order-box';
            box.style.cssText = 'position:fixed;top:60px;right:20px;z-index:99999;background:#c62828;color:#fff;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;padding:12px 16px;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.4);max-width:280px;line-height:1.6';

            const title = document.createElement('div');
            title.style.cssText = 'font-size:15px;margin-bottom:8px;';
            title.textContent = `⚠️ Inne zamówienia w realizacji (${orders.length})`;
            box.appendChild(title);

            orders.forEach(o => {
                const row = document.createElement('div');
                const a = document.createElement('a');
                a.href = o.href;
                a.target = '_blank';
                a.textContent = `→ #${o.number}`;
                a.style.cssText = 'color:#fff;text-decoration:underline;';
                row.appendChild(a);
                box.appendChild(row);
            });

            document.body.appendChild(box);
        }

        let debounceOther;
        const observerOther = new MutationObserver(() => {
            clearTimeout(debounceOther);
            debounceOther = setTimeout(runOtherOrders, 600);
        });
        observerOther.observe(document.documentElement, { childList: true, subtree: true });
        setTimeout(() => { observerOther.disconnect(); runOtherOrders(); }, 8000);

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runOtherOrders);
        } else {
            runOtherOrders();
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // LISTA ZAMÓWIEŃ: INNE ZAMÓWIENIA KLIENTA + PORÓWNANIE I ŁĄCZENIE
    // klik w imię i nazwisko klienta -> okienko z innymi zamówieniami
    // w statusie "realizowane" -> porównanie -> natywne okno łączenia
    // ════════════════════════════════════════════════════════════════════════

    if (url.includes('/panel/orders-list.php')) {

        GM_addStyle(`
            .tm-oo-open { display:inline-block; margin-top:6px; padding:3px 10px; border:1px solid #cbd5e1; border-radius:3px; background:#fff; color:#334155; font:600 11px Inter,Arial,sans-serif; cursor:pointer; box-shadow:0 1px 0 rgba(0,0,0,.18); transition:transform .12s ease, box-shadow .12s ease; }
            .tm-oo-open:hover { transform:translateY(-2px); box-shadow:0 4px 8px rgba(0,0,0,.2); }
            .tm-oo-open:active { transform:translateY(0); box-shadow:0 1px 0 rgba(0,0,0,.18); }
            .tm-oo-open .fa { margin-right:5px; }
            .tm-oo-overlay { position:fixed; inset:0; z-index:100000; background:rgba(15,23,42,.5); display:flex; align-items:flex-start; justify-content:center; padding-top:50px; font:13px/1.45 Inter,"Helvetica Neue",Arial,sans-serif; color:#1f2937; }
            .tm-oo-card { background:#fff; border:1px solid #9ca3af; border-radius:0; box-shadow:0 12px 40px rgba(0,0,0,.35); width:min(1150px,95vw); max-height:calc(100vh - 90px); display:flex; flex-direction:column; }
            .tm-oo-head { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:#334155; color:#fff; font-size:14px; font-weight:600; }
            .tm-oo-x { border:0; background:none; font-size:18px; cursor:pointer; color:#fff; line-height:1; opacity:.8; }
            .tm-oo-x:hover { opacity:1; }
            .tm-oo-body { padding:14px; overflow:auto; }
            .tm-oo-foot { display:flex; gap:8px; justify-content:flex-end; padding:10px 14px; border-top:1px solid #d1d5db; background:#f8fafc; }
            .tm-oo-foot:empty { display:none; }
            .tm-oo-btn { border:1px solid #9ca3af; border-radius:0; background:#fff; color:#111827; padding:7px 14px; cursor:pointer; font:600 13px Inter,Arial,sans-serif; }
            .tm-oo-btn:hover { background:#f1f5f9; }
            .tm-oo-btn.primary { background:#334155; border-color:#334155; color:#fff; }
            .tm-oo-btn.primary:hover { background:#1e293b; }
            .tm-oo-btn:disabled { opacity:.45; cursor:not-allowed; }
            .tm-oo-btn .fa, .tm-oo-sum .fa { margin-right:6px; }
            .tm-oo-table { width:100%; border-collapse:collapse; }
            .tm-oo-table th, .tm-oo-table td { border:1px solid #d1d5db; padding:7px 9px; text-align:left; vertical-align:middle; }
            .tm-oo-table thead th { background:#e5e7eb; font-weight:600; white-space:nowrap; }
            .tm-oo-table tbody th { background:#f3f4f6; font-weight:600; white-space:nowrap; width:1%; }
            .tm-oo-table tr.base td { background:#f8fafc; }
            .tm-oo-table td.ok { background:#f0fdf4; }
            .tm-oo-table td.bad { background:#fef2f2; }
            .tm-oo-table td .fa-check { color:#15803d; }
            .tm-oo-table td .fa-times { color:#b91c1c; }
            .tm-oo-table a { color:#1d4ed8; font-weight:600; }
            .tm-oo-mark { display:inline-block; width:14px; margin-right:4px; }
            .tm-oo-ico { height:18px; max-width:40px; vertical-align:middle; margin-right:6px; }
            .tm-oo-sum { margin-bottom:12px; padding:9px 12px; border:1px solid #d1d5db; border-left:4px solid #6b7280; background:#f9fafb; font-weight:600; }
            .tm-oo-sum.bad { border-left-color:#1f2937; }
            .tm-oo-addr { display:inline-block; min-width:180px; padding:6px 10px; border:1px solid #e5e7eb; background:#fff; text-align:center; font:12px/1.5 Inter,"Helvetica Neue",Helvetica,Arial,sans-serif; }
            .tm-oo-addr .diff { background:#fee2e2; color:#991b1b; text-decoration:underline; text-decoration-color:#dc2626; }
            .tm-oo-muted { color:#6b7280; font-style:italic; }
        `);

        const OO_ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        const ooEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => OO_ENT[c]);
        const ooTxt = el => el ? el.textContent.replace(/\[[^\]]*\]/g, ' ').replace(/\s+/g, ' ').trim() : '';
        const ooLow = v => String(v || '').toLowerCase().replace(/\s+/g, ' ').trim();
        const ooAbs = src => src ? new URL(src, location.origin + '/panel/orderd.php').href : '';
        const ooIcon = src => src ? `<img class="tm-oo-ico" src="${ooEsc(src)}" alt="">` : '';
        const ooFa = name => `<i class="fa fa-${name}" aria-hidden="true"></i>`;
        const ooOrderUrl = n => '/panel/app/orderd.php?idt=' + encodeURIComponent(n);
        const ooCache = new Map();

        // adres w boksie jak w kolumnie „Dane bilingowe” na liście; linie różne od bazowego zaznaczone
        const ooAddrLines = a => [a.name, a.street, [a.postcode, a.city].filter(Boolean).join(' ')];
        function ooAddrBox(a, base) {
            const lines = ooAddrLines(a);
            const bl = base ? ooAddrLines(base) : lines;
            const cls = i => (ooLow(lines[i]) !== ooLow(bl[i]) ? ' class="diff"' : '');
            return `<div class="tm-oo-addr">Pan / Pani <b${cls(0)}>${ooEsc(lines[0] || '—')}</b><br>` +
                `<span${cls(1)}>${ooEsc(lines[1] || '—')}</span><br><span${cls(2)}>${ooEsc(lines[2] || '—')}</span></div>`;
        }

        // pola porównania: cmp = klucz porównania, html = jak wyświetlić (base = zamówienie bazowe)
        const OO_FIELDS = [
            { label: 'Kurier', cmp: o => ooLow(o.courier), html: o => ooIcon(o.courierIcon) + ooEsc(o.courier || '—') },
            { label: 'Imię i nazwisko', cmp: o => ooLow(o.name), html: o => ooEsc(o.name || '—') },
            { label: 'Adres bilingowy', cmp: o => ooAddrLines(o.bill).map(ooLow).join('|'), html: (o, b) => ooAddrBox(o.bill, b && b.bill) },
            { label: 'Adres dostawy', cmp: o => ooAddrLines(o.deliv).map(ooLow).join('|'), html: (o, b) => ooAddrBox(o.deliv, b && b.deliv) },
            { label: 'E-mail', cmp: o => ooLow(o.email), html: o => ooEsc(o.email || '—') },
            { label: 'Telefon', cmp: o => String(o.phone || '').replace(/\D/g, '').replace(/^48(?=\d{9}$)/, ''), html: o => ooEsc(o.phone || '—') },
            { label: 'Paczkomat / punkt odbioru', cmp: o => ooLow(o.pickup), html: o => ooEsc(o.pickup || '—') },
            { label: 'Rodzaj płatności', cmp: o => ooLow(o.payType), html: o => ooIcon(o.payTypeIcon) + ooEsc(o.payType || '—') },
            // liczy się tylko system płatności w nawiasie (np. IdoPay), nie forma (BLIK / Apple Pay)
            { label: 'Forma płatności', cmp: o => ooLow(o.payForm.systems), html: o => ooIcon(o.payForm.icon) + ooEsc(o.payForm.text) },
            { label: 'Koszt dostawy (brutto)', cmp: o => String(o.shipping || '').replace(/[^\d,.]/g, '').replace(',', '.'), html: o => ooEsc(o.shipping || '—') },
        ];

        async function ooFetchPayForm(idt) {
            try {
                const r = await fetch('/panel/ajax/order-payments.php?action=getPrepaids', {
                    method: 'POST', credentials: 'include',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'order=' + encodeURIComponent(idt),
                }).then(res => res.json());
                const all = (r && r.ret) || [];
                let list = all.filter(p => p.status === 'y');
                let pending = false;
                if (!list.length) { list = all.filter(p => p.status !== 'c'); pending = list.length > 0; }
                if (!list.length) return { text: 'brak wpłat', systems: '', icon: '' };
                const uniq = arr => [...new Set(arr.filter(Boolean))];
                const text = uniq(list.map(p => p.payment_form_name && p.payment_name && p.payment_form_name !== p.payment_name
                    ? `${p.payment_form_name} (${p.payment_name})`
                    : (p.payment_form_name || p.payment_name || 'nieznana'))).join(', ');
                return {
                    text: text + (pending ? ' – nieprzyjęta' : ''),
                    systems: uniq(list.map(p => p.payment_name || p.payment_form_name)).sort().join(', '),
                    // panel_paysystem_icon = "panel/gfx/payforms/…" (względem korzenia), payform_icon = "/gfx/…" (nie działa w panelu)
                    icon: (() => {
                        const p = list.find(x => x.panel_paysystem_icon || x.payform_icon) || {};
                        if (p.panel_paysystem_icon) return location.origin + '/' + String(p.panel_paysystem_icon).replace(/^\/+/, '');
                        return p.payform_icon ? location.origin + '/panel/' + String(p.payform_icon).replace(/^\/+/, '') : '';
                    })(),
                };
            } catch (e) {
                return { text: 'błąd pobierania', systems: '?', icon: '' };
            }
        }

        // paczkomat jest wstrzykiwany przez JS strony: IAI.pickups._pickupPoint = {"id":"WRO32M",...}
        function ooParsePickup(html) {
            const m0 = html.match(/_pickupPoint\s*=\s*\{/);
            if (!m0) return '';
            const s = html.slice(m0.index, m0.index + 3000);
            const g = k => {
                const m = s.match(new RegExp('"' + k + '"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"'));
                if (!m) return '';
                try { return JSON.parse('"' + m[1] + '"'); } catch (e) { return m[1]; }
            };
            const id = g('id');
            if (!id) return '';
            return [id, [g('street'), g('buildingNumber')].filter(Boolean).join(' '), g('city')].filter(Boolean).join(', ');
        }

        // pobiera stronę zamówienia: dane do porównania + inne zamówienia "realizowane" + formularz łączenia
        function ooParseOrder(idt) {
            if (ooCache.has(idt)) return ooCache.get(idt);
            const p = (async () => {
                const [html, payForm] = await Promise.all([
                    fetch('/panel/orderd.php?idt=' + encodeURIComponent(idt), { credentials: 'include' }).then(res => {
                        if (!res.ok) throw new Error('HTTP ' + res.status);
                        return res.text();
                    }),
                    ooFetchPayForm(idt),
                ]);
                const d = new DOMParser().parseFromString(html, 'text/html');
                const q = s => d.querySelector(s);
                const addr = pre => ({
                    name: ooTxt(q(`#${pre}-lastname`)),
                    street: ooTxt(q(`#${pre}-address`)),
                    postcode: ooTxt(q(`#${pre}-postcode`)),
                    city: ooTxt(q(`#${pre}-city`)),
                });
                const shipRaw = ooTxt(q('#tr_koszt td:nth-child(2)'));
                const shipM = shipRaw.match(/-?[\d\s]+,\d{2}\s*[^\s(]+/);
                const courierImg = q('#tr_firma-kurierska img') || q('img.delivery-icon');
                const prepaid = q('span.prepaid-status');
                const payTypeImg = prepaid && prepaid.closest('td') && prepaid.closest('td').querySelector('img');
                const others = [...d.querySelectorAll('a[style*="--color-status-on_order"]')]
                    .map(a => {
                        const inp = a.parentElement && a.parentElement.querySelector('input[name="ordersToConnectIdt[]"]');
                        return { number: a.textContent.trim(), connectIdt: inp ? inp.value : null };
                    })
                    .filter(o => /^\d+$/.test(o.number) && o.number !== String(idt));
                const form = q('form[name="connectOrdersForm"]') || (q('input[name="baseOrderIdt"]') || {}).form || null;
                const baseInp = form && form.querySelector('input[name="baseOrderIdt"]');
                return {
                    idt: String(idt),
                    courier: ooTxt(q('#tr_firma-kurierska td:nth-child(2)')),
                    courierIcon: courierImg ? ooAbs(courierImg.getAttribute('src')) : '',
                    name: ooTxt(q('#invAddr-lastname')),
                    bill: addr('invAddr'),
                    deliv: addr('delivAddr'),
                    email: ooTxt(q('#invAddr-email')),
                    phone: ooTxt(q('#invAddr-phone1')),
                    pickup: ooParsePickup(html),
                    payType: ooTxt(prepaid),
                    payTypeIcon: payTypeImg ? ooAbs(payTypeImg.getAttribute('src')) : '',
                    payForm,
                    shipping: shipM ? shipM[0].replace(/\s+/g, ' ').trim() : shipRaw,
                    others,
                    connect: form && baseInp ? {
                        action: new URL(form.getAttribute('action') || '/panel/orders-connect.php?action=connect&method=one&test=true&withMenu=no', location.origin + '/panel/orderd.php').href,
                        baseOrderIdt: baseInp.value,
                    } : null,
                };
            })();
            p.catch(() => ooCache.delete(idt));
            ooCache.set(idt, p);
            return p;
        }

        // ---------- okienko ----------
        let ooOverlay = null;
        let ooState = null; // { base, selected:Set }

        function ooOnKey(e) { if (e.key === 'Escape') ooClose(); }
        function ooClose() {
            if (!ooOverlay) return;
            ooOverlay.remove();
            ooOverlay = null;
            ooState = null;
            document.removeEventListener('keydown', ooOnKey, true);
        }

        function ooShell(title) {
            if (!ooOverlay) {
                ooOverlay = document.createElement('div');
                ooOverlay.className = 'tm-oo-overlay';
                ooOverlay.addEventListener('mousedown', e => { if (e.target === ooOverlay) ooClose(); });
                document.body.appendChild(ooOverlay);
                document.addEventListener('keydown', ooOnKey, true);
            }
            ooOverlay.innerHTML = `<div class="tm-oo-card">
                <div class="tm-oo-head"><span>${ooEsc(title)}</span><button class="tm-oo-x" title="Zamknij (Esc)">${ooFa('times')}</button></div>
                <div class="tm-oo-body"></div><div class="tm-oo-foot"></div></div>`;
            ooOverlay.querySelector('.tm-oo-x').onclick = ooClose;
            return { body: ooOverlay.querySelector('.tm-oo-body'), foot: ooOverlay.querySelector('.tm-oo-foot') };
        }

        function ooButton(html, primary, onclick) {
            const b = document.createElement('button');
            b.className = 'tm-oo-btn' + (primary ? ' primary' : '');
            b.innerHTML = html;
            b.onclick = onclick;
            return b;
        }

        async function ooOpenForOrder(idt, clientName) {
            const { body } = ooShell(`Zamówienia klienta ${clientName || ''}`);
            body.innerHTML = '<div class="tm-oo-muted">Szukam innych zamówień klienta w realizacji…</div>';
            let base;
            try {
                base = await ooParseOrder(idt);
            } catch (e) {
                if (ooOverlay) body.innerHTML = '<div class="tm-oo-sum bad">' + ooFa('exclamation-triangle') + 'Nie udało się wczytać zamówienia #' + ooEsc(idt) + '.</div>';
                return;
            }
            if (!ooOverlay) return;
            ooState = { base, selected: new Set(base.others.filter(o => o.connectIdt).map(o => o.number)) };
            ooRenderList();
        }

        const OO_LIST_HEAD = '<th>Zamówienie</th><th>Kurier</th><th>Paczkomat</th><th>Płatność</th><th>Dostawa</th>';
        function ooSummaryCells(d) {
            return `<td>${ooIcon(d.courierIcon)}${ooEsc(d.courier)}</td><td>${ooEsc(d.pickup || '—')}</td>` +
                `<td>${ooIcon(d.payTypeIcon)}${ooEsc(d.payType)} <span class="tm-oo-muted">/</span> ${ooEsc(d.payForm.text)}</td><td>${ooEsc(d.shipping)}</td>`;
        }

        function ooRenderList() {
            const { base, selected } = ooState;
            const others = base.others;
            const { body, foot } = ooShell(`Zamówienia klienta ${base.name} – inne w realizacji: ${others.length}`);
            const baseRow = `<tr class="base"><td title="Zamówienie bazowe (kliknięte)">${ooFa('star')}</td>
                <td><a href="${ooOrderUrl(base.idt)}" target="_blank">#${ooEsc(base.idt)}</a> <span class="tm-oo-muted">bazowe</span></td>${ooSummaryCells(base)}</tr>`;

            if (!others.length) {
                body.innerHTML = `<div class="tm-oo-sum">Klient nie ma innych zamówień w statusie „realizowane”.</div>
                    <table class="tm-oo-table"><thead><tr><th></th>${OO_LIST_HEAD}</tr></thead><tbody>${baseRow}</tbody></table>`;
                foot.append(ooButton('Zamknij', false, ooClose));
                return;
            }

            body.innerHTML = `<table class="tm-oo-table"><thead><tr><th>Połącz</th>${OO_LIST_HEAD}</tr></thead><tbody>${baseRow}
                ${others.map(o => `<tr data-n="${ooEsc(o.number)}">
                    <td><input type="checkbox" ${selected.has(o.number) ? 'checked' : ''} ${o.connectIdt ? '' : 'disabled title="Tego zamówienia nie da się połączyć"'}></td>
                    <td><a href="${ooOrderUrl(o.number)}" target="_blank">#${ooEsc(o.number)}</a></td>
                    <td colspan="4" class="tm-oo-muted">wczytywanie…</td></tr>`).join('')}
                </tbody></table>`;

            const go = ooButton(ooFa('link') + 'Połącz zaznaczone…', true, ooRenderCompare);
            go.disabled = !selected.size || !base.connect;
            if (!base.connect) go.title = 'IdoSell nie pokazuje opcji łączenia dla tego zamówienia';
            foot.append(ooButton('Zamknij', false, ooClose), go);

            others.forEach(o => {
                const tr = body.querySelector(`tr[data-n="${o.number}"]`);
                tr.querySelector('input').onchange = e => {
                    if (e.target.checked) selected.add(o.number); else selected.delete(o.number);
                    go.disabled = !selected.size || !base.connect;
                };
                ooParseOrder(o.number).then(d => {
                    const cell = tr.querySelector('td[colspan]');
                    if (cell) cell.outerHTML = ooSummaryCells(d);
                }).catch(() => {
                    const cell = tr.querySelector('td[colspan]');
                    if (cell) cell.textContent = 'błąd wczytywania';
                });
            });
        }

        async function ooRenderCompare() {
            const st = ooState;
            const { base, selected } = st;
            const nums = base.others.map(o => o.number).filter(n => selected.has(n));
            if (!nums.length) return;
            const { body, foot } = ooShell('Porównanie przed połączeniem zamówień');
            body.innerHTML = '<div class="tm-oo-muted">Wczytywanie danych zamówień…</div>';
            const back = ooButton(ooFa('arrow-left') + 'Wstecz', false, ooRenderList);
            foot.append(back);

            let rest;
            try {
                rest = await Promise.all(nums.map(ooParseOrder));
            } catch (e) {
                if (back.isConnected) body.innerHTML = '<div class="tm-oo-sum bad">' + ooFa('exclamation-triangle') + 'Nie udało się wczytać danych zamówień. Spróbuj ponownie.</div>';
                return;
            }
            if (!back.isConnected || ooState !== st) return;

            const diffs = [];
            const rows = OO_FIELDS.map(f => {
                const bv = f.cmp(base);
                let rowBad = false;
                const cells = rest.map(o => {
                    const same = f.cmp(o) === bv;
                    if (!same) rowBad = true;
                    return `<td class="${same ? 'ok' : 'bad'}"><span class="tm-oo-mark">${ooFa(same ? 'check' : 'times')}</span>${f.html(o, base)}</td>`;
                }).join('');
                if (rowBad) diffs.push(f.label);
                return `<tr><th>${ooEsc(f.label)}</th><td class="base">${f.html(base)}</td>${cells}</tr>`;
            }).join('');

            body.innerHTML = `
                <div class="tm-oo-sum ${diffs.length ? 'bad' : ''}">${diffs.length
                    ? ooFa('exclamation-triangle') + 'Różnice: ' + ooEsc(diffs.join(', '))
                    : ooFa('check') + 'Wszystkie porównywane dane są zgodne'}</div>
                <table class="tm-oo-table"><thead><tr><th></th>
                    <th>${ooFa('star')} <a href="${ooOrderUrl(base.idt)}" target="_blank">#${ooEsc(base.idt)}</a> (bazowe)</th>
                    ${rest.map(o => `<th><a href="${ooOrderUrl(o.idt)}" target="_blank">#${ooEsc(o.idt)}</a></th>`).join('')}
                </tr></thead><tbody>${rows}</tbody></table>`;

            foot.append(ooButton(
                diffs.length ? ooFa('exclamation-triangle') + 'Zatwierdź mimo różnic i przejdź do łączenia' : ooFa('check') + 'Zatwierdź i przejdź do łączenia',
                true,
                () => ooGoMerge(base, nums)
            ));
        }

        // to samo co natywny link "Sprawdź, czy można połączyć powyższe zamówienia" na stronie zamówienia
        function ooGoMerge(base, nums) {
            if (!base.connect) return;
            const form = document.createElement('form');
            form.method = 'post';
            form.action = base.connect.action;
            form.target = 'ConnectOrdersWindow';
            form.style.display = 'none';
            const add = (name, value) => {
                const i = document.createElement('input');
                i.type = 'hidden'; i.name = name; i.value = value;
                form.appendChild(i);
            };
            base.others.filter(o => nums.includes(o.number) && o.connectIdt).forEach(o => add('ordersToConnectIdt[]', o.connectIdt));
            add('baseOrderIdt', base.connect.baseOrderIdt);
            document.body.appendChild(form);
            window.open('about:blank', 'ConnectOrdersWindow', 'toolbar=0,width=1000,height=700,scrollbars=yes');
            form.submit();
            form.remove();
            ooClose();
        }

        // guzik „Połącz zamówienia” pod danymi klienta w kolumnie "Dane bilingowe"
        function ooAddButtons() {
            document.querySelectorAll('td.yui-dt0-col-billing_address div[id^="bl"]').forEach(div => {
                if (div.nextElementSibling && div.nextElementSibling.classList.contains('tm-oo-open')) return;
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'tm-oo-open';
                btn.title = 'Inne zamówienia klienta w realizacji – porównanie i łączenie';
                btn.innerHTML = ooFa('link') + 'Połącz zamówienia';
                div.after(btn);
            });
        }

        document.addEventListener('click', e => {
            const btn = e.target.closest && e.target.closest('.tm-oo-open');
            if (!btn) return;
            e.preventDefault();
            e.stopPropagation();
            const tr = btn.closest('tr');
            const idCell = tr && tr.querySelector('td.yui-dt0-col-id');
            const idt = idCell && (idCell.textContent.match(/\d+/) || [])[0];
            if (!idt) return;
            const nameEl = tr.querySelector('td.yui-dt0-col-billing_address div[id^="bl"] > b');
            ooOpenForOrder(idt, nameEl ? nameEl.textContent.trim() : '');
        }, true);

        // lista (YUI) przerysowuje wiersze przy sortowaniu / stronicowaniu
        let ooBtnDebounce;
        new MutationObserver(() => {
            clearTimeout(ooBtnDebounce);
            ooBtnDebounce = setTimeout(ooAddButtons, 300);
        }).observe(document.documentElement, { childList: true, subtree: true });
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ooAddButtons);
        else ooAddButtons();
    }

    // ════════════════════════════════════════════════════════════════════════
    // DUPLIKATY KLIENTÓW HIGHLIGHT
    // ════════════════════════════════════════════════════════════════════════

    if (url.includes('/panel/orders-list.php')) {

        function runDuplicates() {
            const cells = document.querySelectorAll('td.yui-dt0-col-billing_address div[id^="bl"]');
            if (cells.length === 0) return;
            const nameMap = new Map();
            cells.forEach(div => {
                const b = div.querySelector('b');
                if (!b) return;
                const name = b.textContent.trim();
                if (!nameMap.has(name)) nameMap.set(name, []);
                nameMap.get(name).push(b);
            });
            nameMap.forEach(elements => {
                const dup = elements.length > 1;
                elements.forEach(b => {
                    b.style.cssText = dup ? 'background:#fff176;color:#b71c1c;padding:1px 4px;border-radius:3px;outline:2px solid #e53935' : '';
                    if (dup) b.title = `Ten klient ma ${elements.length} zamówienia na liście`;
                });
            });
        }

        let debounceDup;
        const observerDup = new MutationObserver(() => {
            clearTimeout(debounceDup);
            debounceDup = setTimeout(runDuplicates, 600);
        });
        observerDup.observe(document.documentElement, { childList: true, subtree: true });
        setTimeout(() => { observerDup.disconnect(); runDuplicates(); }, 8000);

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runDuplicates);
        } else {
            runDuplicates();
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // "ZAREJESTROWANE PRZEZ API" NA ZIELONO
    // ════════════════════════════════════════════════════════════════════════

    if (url.includes('/panel/orders-list.php')) {

        // GM_addStyle działa też przy document-start (document.head może jeszcze nie istnieć)
        GM_addStyle('tr.tm-api-order td { background-color: #c8e6c9 !important; }');

        function runApiOrders() {
            document.querySelectorAll('table tbody tr').forEach(tr => {
                const statusCell = tr.querySelector('td.yui-dt0-col-status, td[class*="-col-status"]');
                if (!statusCell) return;
                const hasApi = /zarejestrowane przez API/i.test(statusCell.textContent);
                tr.classList.toggle('tm-api-order', hasApi);
            });
        }

        // Obserwator działa cały czas: lista przeładowuje się przy zmianie strony, sortowaniu i filtrach
        let debounceApi;
        new MutationObserver(() => {
            clearTimeout(debounceApi);
            debounceApi = setTimeout(runApiOrders, 300);
        }).observe(document.documentElement, { childList: true, subtree: true });

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runApiOrders);
        } else {
            runApiOrders();
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // NOTATKI / UWAGI NA LIŚCIE ZAMÓWIEŃ – ENTERY JAK W EDYTORZE
    // ════════════════════════════════════════════════════════════════════════

    if (url.includes('/panel/orders-list.php')) {
        // Tekst notatek ma znaki nowej linii, ale panel wyświetla go z white-space:normal (sklejone w jedną linię).
        // display:block – wyrównanie tekstu wg ustawienia z zębatki Statusów (klucz `${host}:noteAlign`, domyślnie do lewej)
        GM_addStyle('a[data-function_delegate="TextareaEdit"] { display: block; white-space: pre-wrap; overflow-wrap: anywhere; }');
        let noteAlign = 'left';
        try { noteAlign = JSON.parse(GM_getValue(location.host + ':noteAlign') || '"left"'); } catch (e) { /* domyślnie */ }
        if (!['left', 'center', 'right', 'justify'].includes(noteAlign)) noteAlign = 'left';
        const alignStyle = GM_addStyle(`a[data-function_delegate="TextareaEdit"] { text-align: ${noteAlign}; }`);
        if (alignStyle) alignStyle.id = 'tm-note-align'; // zębatka w głównym oknie podmienia ten styl po „Zapisz”
    }

    // ════════════════════════════════════════════════════════════════════════
    // MEGABAR
    // ════════════════════════════════════════════════════════════════════════

    if (url.includes('megadron.pl/pl/products')) {
        const skuFromUrl = (window.location.pathname.match(/-(\d+)\.html$/) || [])[1];

        if (skuFromUrl) {
            function waitForElement(selector, callback, timeout = 10000) {
                const el = document.querySelector(selector);
                if (el) { callback(el); return; }
                const observer = new MutationObserver(() => {
                    const el = document.querySelector(selector);
                    if (el) { observer.disconnect(); callback(el); }
                });
                observer.observe(document.documentElement, { childList: true, subtree: true });
                setTimeout(() => observer.disconnect(), timeout);
            }

            const baseStyle = `
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                margin-right: 8px;
                margin-bottom: 8px;
                background-color: #f8f9fa;
                border: 1px solid #e2e8f0;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
                color: #334155;
                text-decoration: none;
                white-space: nowrap;
                width: fit-content;
                line-height: 1.2;
                box-sizing: border-box;
                transition: all 0.2s ease;
            `;

                const iconPin = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
            const iconCheck = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
            const iconCross = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
            const iconLink = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;

            waitForElement('.product_name__actions', function (actionsBar) {

                // 1. badge DYSPOZYCYJNY
                const badgeDysp = document.createElement('div');
                badgeDysp.style.cssText = baseStyle;
                badgeDysp.innerHTML = `${iconCheck} <span>Dyspozycyjny M1: <strong>ładowanie...</strong></span>`;

                // 2. badge LOKALIZACJA
                const badgeLoc = document.createElement('div');
                badgeLoc.style.cssText = baseStyle;
                badgeLoc.innerHTML = `${iconPin} <strong>ładowanie...</strong>`;

                // 3. badge IDOSELL
                const badgeIdosell = document.createElement('a');
                badgeIdosell.href = `https://client6220.idosell.com/panel/app/product.php?idt=${skuFromUrl}`;
                badgeIdosell.target = '_blank';
                badgeIdosell.rel = 'noopener noreferrer';
                badgeIdosell.style.cssText = baseStyle + `cursor: pointer;`;
                badgeIdosell.innerHTML = `<span>Idosell</span> ${iconLink}`;

                badgeIdosell.onmouseover = () => {
                    badgeIdosell.style.borderColor = '#cbd5e1';
                    badgeIdosell.style.backgroundColor = '#f1f5f9';
                };
                badgeIdosell.onmouseout = () => {
                    badgeIdosell.style.borderColor = '#e2e8f0';
                    badgeIdosell.style.backgroundColor = '#f8f9fa';
                };

                actionsBar.insertAdjacentElement('afterbegin', badgeIdosell);
                actionsBar.insertAdjacentElement('afterbegin', badgeLoc);
                actionsBar.insertAdjacentElement('afterbegin', badgeDysp);

                // ────────────────────────────────────────────────────────────────
                // LOKALIZACJA
                // ────────────────────────────────────────────────────────────────
                GM_xmlhttpRequest({
                    method: 'POST',
                    url: 'https://client6220.idosell.com/panel/ajax/product-location.php',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Referer': `https://client6220.idosell.com/panel/product-edit.php?idt=${skuFromUrl}`
                    },
                    data: `action=getLocations&product=${skuFromUrl}`,
                    onload: function (response) {
                        try {
                            const json = JSON.parse(response.responseText);
                            const doc = new DOMParser().parseFromString(json.htmlData, 'text/html');
                            const lokalizacja = [...doc.querySelectorAll('input[type="text"][name*="location_id_sel[1]"]')]
                                .map(i => i.value.trim()).find(Boolean);

                            if (lokalizacja) {
                                badgeLoc.innerHTML = `${iconPin} <span> Lokalizacja: <strong>${lokalizacja}</strong></span>`;
                            } else {
                                badgeLoc.innerHTML = `${iconPin} <span style="color:#64748b;">brak lokalizacji</span>`;
                            }
                        } catch (e) {
                            badgeLoc.innerHTML = `${iconCross} <span style="color:#dc2626;">błąd lokalizacji</span>`;
                        }
                    },
                    onerror: function () {
                        badgeLoc.innerHTML = `${iconCross} <span style="color:#dc2626;">błąd połączenia</span>`;
                    }
                });

                // ────────────────────────────────────────────────────────────────
                // DYSPOZYCYJNY M1
                // ────────────────────────────────────────────────────────────────
                GM_xmlhttpRequest({
                    method: 'POST',
                    url: `https://client6220.idosell.com/panel/ajax/product-edit-aceform-tables.php?name=reserved&idt=${skuFromUrl}&filtered=false`,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Referer': `https://client6220.idosell.com/panel/product-edit.php?idt=${skuFromUrl}`
                    },
                    data: `id=stocksReserved&url=/panel/ajax/product-edit-aceform-tables.php%3Fname%3Dreserved%26idt%3D${skuFromUrl}%26filtered%3Dfalse`,
                    onload: function (response) {
                        try {
                            const doc = new DOMParser().parseFromString(response.responseText, 'text/html');
                            const row = doc.querySelector('table tbody tr');

                            if (!row) {
                                badgeDysp.innerHTML = `${iconCross} <span>Dyspozycyjny M1: <strong>brak danych</strong></span>`;
                                return;
                            }

                            const parsedVal = parseInt(row.querySelectorAll('td')[1]?.textContent, 10) || 0;

                            if (parsedVal > 0) {
                                badgeDysp.innerHTML = `${iconCheck} <span>Dyspozycyjny M1: <strong>${parsedVal}</strong></span>`;
                            } else {
                                badgeDysp.innerHTML = `${iconCross} <span>Dyspozycyjny M1: <strong>BRAK</strong></span>`;
                            }
                        } catch (e) {
                            badgeDysp.innerHTML = `${iconCross} <span style="color:#dc2626;">Dyspozycyjny M1: <strong>ERROR</strong></span>`;
                        }
                    },
                    onerror: function () {
                        badgeDysp.innerHTML = `${iconCross} <span style="color:#dc2626;">Zaloguj do IdoSell</span>`;
                    }
                });

            });
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // NUMERY SERYJNE - REAKCJA NA ENTER/SKANER + TOAST Z SN'AMI
    // ════════════════════════════════════════════════════════════════════════

    if (url.includes('/panel/order-verification.php')) {
        function getSerialInputs() {
            return document.querySelectorAll('#addPosition input[id^="fg_serialnumber"]');
        }

        function getSaveButton() {
            return document.querySelector('#addPosition input.formbutton[type="button"]');
        }

        function getCodeField() {
            return document.getElementById('fg_code');
        }

        function isPanelVisible() {
            const c = document.getElementById('addPosition_c');
            if (!c) return false;
            return c.style.visibility !== 'hidden' && c.offsetParent !== null;
        }

        function focusCodeField() {
            const codeInput = getCodeField();
            if (!codeInput) return;

            codeInput.focus();
            codeInput.dispatchEvent(new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            }));
        }

        const TOAST_DURATION_MS = 2500;

        function showSavedToast(serials) {
            const toast = document.createElement('div');

            serials.forEach(function (s) {
                const line = document.createElement('div');
                line.textContent = 'Nr ' + s.index + ': ' + s.value;
                toast.appendChild(line);
            });

            Object.assign(toast.style, {
                position: 'fixed',
                top: '25vh',
                left: '50%',
                zIndex: '999999',
                background: '#323232',
                color: '#fff',
                padding: '12px 22px',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                opacity: '0',
                textAlign: 'center',
                lineHeight: '1.5',
                transform: 'translateX(-50%) translateY(-12px)',
                transition: 'opacity 0.25s ease, transform 0.25s ease',
                pointerEvents: 'none'
            });

            document.body.appendChild(toast);

            requestAnimationFrame(() => {
                toast.style.opacity = '1';
                toast.style.transform = 'translateX(-50%) translateY(0)';
            });

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(-50%) translateY(-12px)';
                setTimeout(() => toast.remove(), 300);
            }, TOAST_DURATION_MS);
        }

        document.addEventListener('click', function (e) {
            const saveBtn = getSaveButton();
            if (!saveBtn || e.target !== saveBtn) return;

            const inputs = getSerialInputs();
            const serials = Array.from(inputs)
                .map(function (inp, idx) {
                    return { index: idx + 1, value: (inp.value || '').trim() };
                })
                .filter(function (s) { return s.value !== ''; });

            if (serials.length > 0) {
                showSavedToast(serials);
            }
        }, true);

        let wasVisible = false;

        const visibilityObserver = new MutationObserver(() => {
            const nowVisible = isPanelVisible();
            if (wasVisible && !nowVisible) {
                setTimeout(focusCodeField, 50);
            }
            wasVisible = nowVisible;
        });

        visibilityObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style'],
            subtree: true
        });

        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Enter') return;

            const target = e.target;
            if (!target || !target.id || !target.id.startsWith('fg_serialnumber')) return;

            const inputs = getSerialInputs();
            const lastInput = inputs[inputs.length - 1];

            if (target === lastInput) {
                e.preventDefault();
                e.stopPropagation();

                const saveBtn = getSaveButton();
                if (saveBtn) {
                    saveBtn.click();
                }
            }
        }, true);
    }

    // ════════════════════════════════════════════════════════════════════════
    // STATUSY W PASKU BOCZNYM (sekcja „Statusy” z licznikami zamówień)
    // ════════════════════════════════════════════════════════════════════════

    if (window.self === window.top && url.includes('/panel/') && !url.includes('/panel/app/client-deliveryaddress.php')
        && !/^\/panel\/app\/rma\/?$/.test(location.pathname)) { // okienko zmiany adresu (reklamacje) – bez Statusów
        const tmStatusyStart = () => {
          // ---------- storage ----------
          const HOST = location.host;
          const K = (k) => `${HOST}:${k}`;
          const load = (k, d) => {
            try { const v = GM_getValue(K(k)); return v === undefined ? d : JSON.parse(v); } catch (e) { return d; }
          };
          const save = (k, v) => { try { GM_setValue(K(k), JSON.stringify(v)); } catch (e) { /* ignore */ } };

          const DEFAULT_SELECTED = ['wn', 'n', 'o', 'b', 'p', 'p_odb', 'w'];
          const STATUS_TTL = 24 * 3600 * 1000;
          const PANEL_CONCURRENCY = 2;   // zapytania do listy zamówień panelu (tylko to, czego nie ma w statystykach)

          // Kod statusu w panelu -> nazwa statusu w statystykach nowego panelu zamówień.
          const STATUS_NAME = {
            n: 'new', o: 'on_order', b: 'packed', p: 'ready', w: 'payment_waiting',
            d: 'delivery_waiting', h: 'suspended', a: 'finished_ext',
            br: 'packed_ready', wp: 'wait_for_packaging', wd: 'wait_for_dispatch', wr: 'wait_for_receive',
          };
          // Pozycje z własnym linkiem i filtrem (licznik liczony przez panel z tymi samymi filtrami, bez operatora).
          const CUSTOM = {
            p: {
              name: 'Gotowe do wysłania',
              href: '/panel/app/orders-list.php?operator=margal&status=p&omit_personal_collection=y#p1d1v76',
              query: { status: 'p', omit_personal_collection: 'y' },
            },
            p_odb: {
              name: 'Gotowe do odbioru',
              href: '/panel/app/orders-list.php?operator=damian&status=po&delivery=0&selling=1',
              query: { status: 'po', delivery: '0', selling: '1' },
              color: 'p',
              urlStatus: 'po',
            },
          };

          // Pozycje spoza statusów zamówień: liczby z widżetu „Monitor” pulpitu panelu
          // (POST /panel/api/panel/monitor/getMonitorStats – jedno lekkie zapytanie dla wszystkich).
          const MONITOR_URL = '/panel/api/panel/monitor/getMonitorStats';
          const EXTRA = [
            { code: 'rma:na', name: 'Niezaakceptowane reklamacje', icon: 'assignment_late', group: 'orders', key: 'notAcceptedRMA', page: 'rma.php', params: { action: 'search', show: 'na' } },
            { code: 'rma:o', name: 'Niezrealizowane reklamacje', icon: 'assignment', group: 'orders', key: 'unfinishedRma', page: 'rma.php', params: { action: 'search', show: 'o' } },
            { code: 'rma:chat', name: 'Nieodczytane wiadomości – czat reklamacji', icon: 'mark_chat_unread', group: 'orders', key: 'newMsgInRmaChat', page: 'rma.php', params: { action: 'search', newRmaChatMsg: '1' } },
            { code: 'ret:o', name: 'Niezrealizowane zwroty', icon: 'assignment_return', group: 'orders', key: 'unfinishedReturns', page: 'returns.php', params: { action: 'search', show: 'o' } },
            { code: 'faq:new', name: 'Pytania do towarów bez odpowiedzi', icon: 'contact_support', group: 'moderator', key: 'productQuestions', page: 'products-faq.php', params: { search: 'new_questions' } },
          ];
          const extraOf = (c) => EXTRA.find((x) => x.code === c) || null;
          const hrefOf = (c) => {
            const x = extraOf(c);
            if (x) return '/panel/app/' + x.page + '?' + new URLSearchParams(x.params).toString();
            if (CUSTOM[c]) return CUSTOM[c].href;
            return '/panel/app/orders-list.php?status=' + encodeURIComponent(c);
          };

          // Kolory statusów: panel definiuje zmienne CSS --color-status-<nazwa> (te same co na liście zamówień).
          const COLOR_NAME = {
            n: 'new', o: 'on_order', b: 'packed', br: 'packed_ready', p: 'ready', w: 'payment_waiting',
            d: 'delivery_waiting', h: 'suspended', t: 'finished', j: 'joined', k: 'canceled', i: 'false',
            s: 'lost', z: 'returned', l: 'missing', r: 'complainted', a: 'finished_ext',
            wd: 'wait_for_dispatch', wp: 'wait_for_packaging', wr: 'wait_for_receive',
          };
          function colorOf(code) {
            if (CUSTOM[code] && CUSTOM[code].color) code = CUSTOM[code].color;
            const name = COLOR_NAME[code.split('-')[0]]; // podstatus dziedziczy kolor statusu nadrzędnego
            if (!name) return null;
            const v = getComputedStyle(document.documentElement).getPropertyValue('--color-status-' + name).trim();
            return v || null;
          }
          // ikona pozycji: własna dla dodatkowych, wypełniona etykieta w kolorze statusu dla zamówień
          function paintIcon(el, code) {
            const x = extraOf(code);
            el.textContent = x ? x.icon : 'label';
            const col = x ? null : colorOf(code);
            if (col) { el.style.color = col; el.style.fontVariationSettings = "'FILL' 1"; }
          }

          let statuses = load('statuses', null);      // {ts, list:[{code,name,sub,parent}], views:[{id,name}]}
          let selected = load('selected', DEFAULT_SELECTED);
          let enabled = load('enabled', true);          // suwak w nagłówku: false = sekcja zwinięta, nic nie pobiera
          let swDown = false;
          let names = load('names', {});                // własne nazwy pozycji { kod: nazwa } – tylko w tym Tampermonkey
          let counts = load('counts', {});            // {code: n}
          const fresh = {};                            // code -> true (pobrane w tym załadowaniu strony)
          const errors = {};                           // code -> message
          const meta = {};                             // code -> {src:'API'|'panel', ms, note}
          let fetchStarted = false;

          // ---------- styles ----------
          GM_addStyle(`
            #tm-statusy .tm-hdr{display:flex;align-items:center;cursor:grab}
            #tm-statusy.tm-section-dragging{opacity:.45}
            #tm-statusy .tm-gear{margin-left:auto;cursor:pointer;font-size:16px;line-height:1;opacity:.7;border-radius:4px;padding:2px;user-select:none}
            #tm-statusy .tm-gear:hover{opacity:1;background:rgba(255,255,255,.1)}
            #tm-statusy a.tm-item{text-decoration:none;color:inherit;display:flex;width:100%;box-sizing:border-box;touch-action:none;user-select:none;-webkit-user-drag:none;transition:transform .18s ease}
            #tm-statusy a.tm-item.tm-lift{transition:none;position:relative;z-index:2;cursor:grabbing;background:var(--tm-lift-bg,#2c3038);border-radius:6px;box-shadow:0 6px 16px rgba(0,0,0,.35)}
            #tm-statusy a.tm-item.tm-settle{transition:transform .15s ease;position:relative;z-index:2}
            #tm-statusy.tm-sorting{cursor:grabbing}
            #tm-statusy .tm-badge{margin-left:auto;flex:none;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:26px;padding:2px 5px;line-height:14px;font-variant-numeric:tabular-nums;text-align:center}
            #tm-statusy .tm-badge.tm-stale{opacity:.5}
            #tm-statusy .tm-badge.tm-err{background:rgba(255,80,80,.35)!important}
            #tm-statusy .tm-empty{font-size:12px;opacity:.6;padding:4px 8px;cursor:pointer}
            #tm-statusy .--title{min-width:0;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;overflow-wrap:anywhere}
            #tm-statusy.tm-collapsed .tm-hdr span:first-child,
            #tm-statusy.tm-collapsed .--title,
            #tm-statusy.tm-collapsed .tm-badge{display:none}
            #tm-statusy.tm-collapsed .tm-hdr{justify-content:center;padding-left:0;padding-right:0}
            #tm-statusy.tm-collapsed .tm-gear{margin-left:0}
            #tm-statusy .tm-sw{margin-left:6px;flex:none;position:relative;width:24px;height:13px;border-radius:7px;background:rgba(255,255,255,.22);cursor:pointer;transition:background .15s}
            #tm-statusy .tm-sw::after{content:'';position:absolute;top:2px;left:2px;width:9px;height:9px;border-radius:50%;background:#fff;transition:transform .15s}
            #tm-statusy .tm-sw[aria-checked="true"]{background:#4f8df5}
            #tm-statusy .tm-sw[aria-checked="true"]::after{transform:translateX(11px)}
            #tm-statusy.tm-off .tm-hdr > span:first-child{opacity:.55}
            #tm-statusy.tm-off .tm-sw{margin-left:auto}
            #tm-statusy.tm-collapsed .tm-hdr{flex-wrap:wrap;gap:4px}
            #tm-statusy.tm-collapsed .tm-sw{margin:0}

            .tm-ov{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:2147483000;display:flex;align-items:center;justify-content:center;font-family:inherit}
            .tm-md{background:#fff;color:#1f1f22;border-radius:10px;width:380px;max-width:calc(100vw - 32px);max-height:calc(100vh - 64px);display:flex;flex-direction:column;box-shadow:0 10px 40px rgba(0,0,0,.3);font-size:13px}
            .tm-md-h{display:flex;align-items:center;padding:14px 16px 8px;font-size:15px;font-weight:600}
            .tm-md-h .tm-x{cursor:pointer;font-size:20px;opacity:.6}
            .tm-md-h .tm-bug{margin-left:auto;margin-right:6px;cursor:pointer;font-size:17px;opacity:.35}
            .tm-md-h .tm-bug.on,.tm-md-h .tm-bug:hover{opacity:.9}
            .tm-md-h .tm-x:hover{opacity:1}
            .tm-md input.tm-search{margin:0 16px 8px;padding:7px 10px;border:1px solid #d6d6db;border-radius:6px;font:inherit}
            .tm-md-list{overflow:auto;padding:0 16px;flex:1;min-height:120px}
            .tm-md-list label{display:flex;align-items:center;gap:8px;padding:4px 0;cursor:pointer}
            .tm-md-list .tm-grp{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#888;padding:10px 0 2px}
            .tm-md-list .tm-grp:first-child{padding-top:2px}
            .tm-md-list label.tm-top{font-weight:600;border-top:1px solid #eee;padding-top:6px;margin-top:2px}
            .tm-md-list .tm-grp + label.tm-top{border-top:0;margin-top:0}
            .tm-md-list label.tm-sub{margin-left:8px;padding-left:14px;border-left:1px solid #dcdce2;color:#555}
            .tm-md-list label input[type=checkbox]{margin:0 0 0 8px;flex:none}
            .tm-md-list label.tm-off{opacity:.5}
            .tm-md-list label.tm-off > span:not(.tm-ico):not(.tm-ren){text-decoration:line-through}
            .tm-md-list label code{font-size:11px;color:#999}
            .tm-md-list.tm-hide-codes label code{display:none}
            .tm-md-list .tm-ico{font-size:18px;flex:none}
            .tm-md-list .tm-alias{color:#888}
            .tm-md-list .tm-ren{font-size:16px;opacity:0;cursor:pointer;color:#666;padding:0 2px;margin-right:auto;font-weight:400}
            .tm-md-list label:hover .tm-ren{opacity:.6}
            .tm-md-list .tm-ren:hover{opacity:1 !important}
            .tm-md-list .tm-alias-in{font:inherit;font-size:12px;padding:1px 4px;border:1px solid #bbb;border-radius:3px;width:150px}
            .tm-md-f{border-top:1px solid #eee;padding:10px 16px 14px;display:flex;flex-direction:column;gap:10px}
            .tm-row{display:flex;align-items:center;gap:8px}
            .tm-align{margin-left:auto;display:inline-flex;border:1px solid #cfcfd6;border-radius:6px;overflow:hidden}
            .tm-align button{border:0;background:#fff;padding:3px 7px;cursor:pointer;line-height:1;color:#555}
            .tm-align button + button{border-left:1px solid #cfcfd6}
            .tm-align button:hover{background:#f3f3f6}
            .tm-align button.on{background:#1f1f22;color:#fff}
            .tm-align .material-symbols-outlined{font-size:18px;vertical-align:middle}
            .tm-btn{padding:7px 12px;border:1px solid #cfcfd6;border-radius:6px;background:#fff;cursor:pointer;font:inherit}
            .tm-btn:hover{background:#f3f3f6}
            .tm-btn.tm-primary{background:#1f1f22;color:#fff;border-color:#1f1f22}
            .tm-btn.tm-primary:hover{background:#3a3a40}
          `);

          // ---------- data ----------
          async function fetchStatuses(force) {
            if (!force && statuses && Date.now() - statuses.ts < STATUS_TTL && statuses.list.length) return statuses;
            const html = await (await fetch('/panel/orders-search.php', { credentials: 'include' })).text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const sel = doc.querySelector('select[name="status"]');
            if (!sel) throw new Error('Nie znaleziono listy statusów');
            const list = [];
            let parent = '';
            for (const o of sel.options) {
              if (!o.value) continue;
              const raw = o.textContent.trim();
              const sub = /^--/.test(raw) || /-\d+$/.test(o.value);
              const name = raw.replace(/^--\s*/, '').replace(/^\*\s*/, '').trim();
              if (!sub) parent = name;
              list.push({ code: o.value, name, sub, parent: sub ? parent : '' });
            }
            statuses = { ts: Date.now(), list };
            save('statuses', statuses);
            return statuses;
          }

          // Zwraca {n, src, ms} – lista zamówień panelu (dla pozycji spoza statystyk albo gdy statystyki nie działają).
          async function fetchCount(code) {
            const t1 = performance.now();
            const n = await fetchCountPanel(code);
            return { n, src: 'panel', ms: Math.round(performance.now() - t1) };
          }

          async function fetchCountPanel(code) {
            const q = CUSTOM[code] ? CUSTOM[code].query : { status: code };
            const body = 'action=ajax&page=1&' + new URLSearchParams(q).toString();
            const r = await fetch('/panel/ajax/orders-list-data.php', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' },
              body,
            });
            if (!r.ok) throw new Error('HTTP ' + r.status);
            const j = await r.json();
            const n = parseInt(j.totalRecords, 10);
            if (isNaN(n)) throw new Error('Brak totalRecords');
            return n;
          }

          // Jedno zapytanie o wszystkie widoczne pozycje dodatkowe (reklamacje, zwroty, pytania).
          async function refreshExtras(codes) {
            const items = codes.map(extraOf).filter(Boolean);
            if (!items.length) return;
            const groups = [...new Set(items.map((x) => x.group))];
            const t0 = performance.now();
            try {
              const r = await fetch(MONITOR_URL, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ monitorFilter: { requestedData: groups } }),
              });
              if (!r.ok) throw new Error('HTTP ' + r.status);
              const j = await r.json();
              if (j.isError || !j.data) throw new Error((j.errors && j.errors[0] && j.errors[0].message) || 'brak danych');
              const ms = Math.round(performance.now() - t0);
              items.forEach((x) => {
                const n = parseInt((j.data[x.group] || {})[x.key], 10);
                if (isNaN(n)) { errors[x.code] = 'brak pola ' + x.key; return; }
                counts[x.code] = n;
                meta[x.code] = { n, src: 'monitor panelu', ms };
                fresh[x.code] = true;
                delete errors[x.code];
              });
              save('counts', counts);
            } catch (e) {
              items.forEach((x) => { errors[x.code] = e.message || String(e); });
            }
            items.forEach((x) => updateBadge(x.code));
          }

          // Statystyki nowego panelu zamówień: jedno lekkie zapytanie (ok. 2 KB, sesja, bez klucza) z liczbami
          // wszystkich statusów niezakończonych i ich podstatusów. Wewnętrzne API panelu – przy błędzie liczymy jak dawniej.
          const STATS_URL = '/panel/api/orders/ordersStatistics/getOrdersCountByStatuses?scope=unfinished';
          const STATS_CODE = {}; // nazwa statusu w odpowiedzi -> kod panelu
          Object.keys(STATUS_NAME).forEach((c) => { STATS_CODE[STATUS_NAME[c]] = c; });
          const STATS_BASE = Object.keys(STATUS_NAME); // statusy niezakończone
          const statsCovers = (c) => !CUSTOM[c] && !extraOf(c) && (c === 'wn' || STATS_BASE.includes(c.split('-')[0]));
          async function fetchStats() {
            const r = await fetch(STATS_URL, { credentials: 'include', headers: { 'Accept': 'application/json' } });
            if (!r.ok) throw new Error('HTTP ' + r.status);
            const j = await r.json();
            const d = j && !j.isError && j.data;
            const total = d ? parseInt(d.totalCount, 10) : NaN;
            if (!d || !Array.isArray(d.statuses) || isNaN(total)) throw new Error('nieoczekiwana odpowiedź');
            const m = { wn: total };
            d.statuses.forEach((s) => {
              const c = STATS_CODE[s.status];
              if (!c) return;
              m[c] = parseInt(s.ordersCount, 10);
              (s.subStatuses || []).forEach((x) => { m[c + '-' + x.subStatusId] = parseInt(x.ordersCount, 10); });
            });
            return m;
          }

          async function refreshCounts(codes) {
            const pending = codes.filter((c) => !fresh[c]);
            let todo = pending.filter((c) => !extraOf(c));
            const extraJob = refreshExtras(pending.filter(extraOf));
            let statsErr = '';
            let statsP = null;
            const getStats = () => statsP || (statsP = fetchStats()); // jedno zapytanie na odświeżenie
            const covered = todo.filter(statsCovers);
            if (covered.length) {
              const t0 = performance.now();
              try {
                const m = await getStats();
                const ms = Math.round(performance.now() - t0);
                covered.forEach((c) => {
                  let n = m[c];
                  if (n == null && c.includes('-') && m[c.split('-')[0]] != null) n = 0; // podstatus bez zamówień
                  if (n == null || isNaN(n)) return;
                  counts[c] = n;
                  meta[c] = { n, src: 'statystyki panelu', ms };
                  fresh[c] = true;
                  delete errors[c];
                  updateBadge(c);
                });
                save('counts', counts);
                todo = todo.filter((c) => !fresh[c]);
              } catch (e) {
                statsErr = e.message || String(e);
              }
            }
            // „Gotowe do wysłania/odbioru”: wszystkie gotowe są w statystykach (tak samo jak dla pozycji wyżej, jedno
            // zapytanie), z listy panelu bierzemy tylko odbiór osobisty – zwykle kilka zamówień, więc lekkie zapytanie.
            const pick = todo.filter((c) => c === 'p' || c === 'p_odb');
            if (pick.length) {
              try {
                const t0 = performance.now();
                const [m, pickup] = await Promise.all([
                  todo.includes('p') ? getStats() : Promise.resolve(null),
                  fetchCountPanel('p_odb'),
                ]);
                const ms = Math.round(performance.now() - t0);
                pick.forEach((c) => {
                  if (c === 'p' && !(m && m.p != null && !isNaN(m.p))) return;
                  const n = c === 'p_odb' ? pickup : Math.max(0, m.p - pickup);
                  counts[c] = n;
                  meta[c] = { n, src: c === 'p_odb' ? 'panel (odbiór osobisty)' : 'statystyki panelu − odbiór osobisty', ms };
                  fresh[c] = true;
                  delete errors[c];
                  updateBadge(c);
                });
                save('counts', counts);
                todo = todo.filter((c) => !fresh[c]);
              } catch (e) { /* zostają na zwykłej ścieżce niżej (lista panelu) */ }
            }
            const panelQ = todo.slice();
            const worker = (queue) => async () => {
              while (queue.length) {
                const c = queue.shift();
                try {
                  const res = await fetchCount(c);
                  if (statsErr && statsCovers(c)) res.note = (res.note ? res.note + '; ' : '') + 'statystyki panelu niedostępne: ' + statsErr;
                  counts[c] = res.n;
                  meta[c] = res;
                  fresh[c] = true;
                  delete errors[c];
                  save('counts', counts);
                } catch (e) {
                  errors[c] = e.message || String(e);
                }
                updateBadge(c);
              }
            };
            await Promise.all([
              extraJob,
              ...Array.from({ length: PANEL_CONCURRENCY }, worker(panelQ)),
            ]);
          }

          // ---------- helpers ----------
          const statusByCode = (c) => (statuses && statuses.list.find((s) => s.code === c)) || null;
          // full: podstatus z nazwą rodzica
          const baseName = (c, full) => {
            const x = extraOf(c);
            if (x) return x.name;
            if (CUSTOM[c]) return CUSTOM[c].name;
            const s = statusByCode(c);
            if (!s) return c;
            return full && s.sub ? `${s.parent} › ${s.name}` : s.name;
          };
          const labelOf = (c) => names[c] || baseName(c);
          const titleOf = (c) => names[c] ? `${names[c]} – ${baseName(c, true)}` : baseName(c, true);

          // Która pozycja jest aktywna: status zamówień albo pozycja dodatkowa (dopasowanie strony i parametrów).
          function currentCode() {
            const st = currentStatus();
            if (st !== null) return st;
            const urls = [location.href];
            document.querySelectorAll('iframe').forEach((f) => { if (f.src) urls.push(f.src); });
            for (const href of urls) {
              let u;
              try { u = new URL(href, location.href); } catch (e) { continue; }
              const x = EXTRA.find((e) => u.pathname.endsWith('/' + e.page) &&
                Object.entries(e.params).every(([k, v]) => u.searchParams.get(k) === v) &&
                // show=o nie może pasować do adresu z newRmaChatMsg
                !(e.params.show && u.searchParams.get('newRmaChatMsg')));
              if (x) return x.code;
            }
            return null;
          }

          function currentStatus() {
            try {
              const u = new URL(location.href);
              if (!/orders-list\.php/.test(u.pathname)) return null;
              const st = u.searchParams.get('status');
              const f = document.querySelector('iframe[src*="orders-list.php"]');
              const v = st !== null ? st : f ? new URL(f.src, location.href).searchParams.get('status') : null;
              const c = Object.keys(CUSTOM).find((k) => CUSTOM[k].urlStatus && CUSTOM[k].urlStatus === v);
              return c || v;
            } catch (e) { /* ignore */ }
            return null;
          }

          function navClasses(nav) {
            const btns = [...nav.querySelectorAll('button')];
            const freq = {};
            btns.forEach((b) => { freq[b.className] = (freq[b.className] || 0) + 1; });
            const sorted = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);
            const item = sorted[0] || '';
            // aktywny = klasa z tym samym prefiksem sc-*, ale inna
            const prefix = item.split(' ')[0];
            const active = sorted.find((c) => c !== item && c.split(' ')[0] === prefix) || item;
            const icon = (nav.querySelector('.--icon') || {}).className || 'material-symbols-outlined --icon';
            const hdr = (nav.querySelector(':scope > div > div:not([class*="sc-"])') || {}).className || 'p-2 text-xs leading-4 font-medium';
            const badge = (nav.querySelector('button span.rounded-sm') || {}).className || 'rounded-sm px-1 py-0.5 text-xs font-medium';
            return { item, active, icon, hdr, badge };
          }

          // ---------- render ----------
          let cls = null;
          let section = null;

          function buildSection(nav) {
            cls = navClasses(nav);
            section = document.createElement('div');
            section.id = 'tm-statusy';
            section.className = 'p-2';
            render();
            return section;
          }

          function render() {
            if (!section) return;
            const active = currentCode();
            section.innerHTML = '';

            const hdr = document.createElement('div');
            hdr.className = cls.hdr + ' tm-hdr';
            // suwak zawsze ostatni (stałe miejsce), zębatka przed nim tylko gdy włączone
            hdr.innerHTML = `<span>Statusy</span>` +
              (enabled ? `<span class="material-symbols-outlined notranslate tm-gear" title="Wybierz widoczne statusy">settings</span>` : '') +
              `<span class="tm-sw" role="switch"></span>`;
            const sw = hdr.querySelector('.tm-sw');
            sw.setAttribute('aria-checked', String(enabled));
            sw.title = enabled ? 'Wyłącz statusy (bez pobierania danych)' : 'Włącz statusy';
            sw.addEventListener('pointerdown', (e) => { swDown = true; e.stopPropagation(); });
            sw.addEventListener('mousedown', (e) => e.stopPropagation());
            sw.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); swDown = false; setEnabled(!enabled); });
            if (enabled) hdr.querySelector('.tm-gear').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openSettings(); });
            wireSectionDrag(hdr);
            section.appendChild(hdr);
            section.classList.toggle('tm-off', !enabled);
            if (!enabled) return; // wyłączone: sam nagłówek z suwakiem, bez pozycji i bez pobierania

            if (!selected.length) {
              const em = document.createElement('div');
              em.className = 'tm-empty';
              em.textContent = 'Wybierz statusy (zębatka)';
              em.addEventListener('click', openSettings);
              section.appendChild(em);
              return;
            }

            selected.forEach((code) => {
              const a = document.createElement('a');
              a.className = (code === active ? cls.active : cls.item) + ' tm-item';
              a.href = hrefOf(code);
              a.dataset.code = code;
              a.draggable = false;
              a.title = titleOf(code);
              a.innerHTML =
                `<span class="${cls.icon}"></span>` +
                `<span class="--title mr-auto"></span>` +
                `<span class="${cls.badge} tm-badge"></span>`;
              paintIcon(a.firstChild, code);
              a.querySelector('.--title').textContent = labelOf(code);
              section.appendChild(a);
              wireDrag(a);
            });
            selected.forEach(updateBadge);
          }

          function updateBadge(code) {
            if (!section) return;
            const a = section.querySelector(`a.tm-item[data-code="${CSS.escape(code)}"]`);
            if (!a) return;
            const b = a.querySelector('.tm-badge');
            b.classList.remove('tm-stale', 'tm-err');
            a.title = titleOf(code) + (counts[code] != null ? ` (${counts[code]})` : '');
            if (errors[code] && !fresh[code]) {
              b.textContent = counts[code] != null ? String(counts[code]) : '!';
              b.classList.add('tm-err');
              b.title = 'Błąd pobierania: ' + errors[code];
            } else if (counts[code] != null) {
              b.textContent = String(counts[code]);
              if (!fresh[code]) b.classList.add('tm-stale');
              const m = meta[code];
              const info = m ? `Źródło: ${m.src}, ${m.ms} ms` + (m.note ? ` (${m.note})` : '') : '';
              b.title = fresh[code] ? info : 'Ostatnia znana wartość – trwa pobieranie';
              if (info) a.title += ' – ' + info;
            } else {
              b.textContent = '…';
              b.title = 'Trwa pobieranie';
            }
          }

          function updateActive() {
            if (!section || !cls) return;
            const active = currentCode();
            section.querySelectorAll('a.tm-item').forEach((a) => {
              const want = (a.dataset.code === active ? cls.active : cls.item) + ' tm-item';
              if (a.className.replace(/\s*tm-(lift|settle)/g, '') !== want) a.className = want;
            });
          }

          // ---------- przeciąganie ----------
          let dragCode = null;
          let justDragged = false;

          function wireDrag(a) {
            a.addEventListener('pointerdown', (e) => {
              if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) return;
              const items = [...section.querySelectorAll('a.tm-item')];
              const i = items.indexOf(a);
              if (items.length < 2 || i < 0) return;
              e.preventDefault();
              dragSort(e, items, i, {
                lift: 'tm-lift', settle: 'tm-settle', sorting: 'tm-sorting', box: section,
                onStart: () => {
                  dragCode = a.dataset.code;
                  // tło pod uniesionym wierszem, żeby nie prześwitywały sąsiednie
                  for (let x = section; x; x = x.parentElement) {
                    const bg = getComputedStyle(x).backgroundColor;
                    if (bg && bg !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(bg)) { a.style.setProperty('--tm-lift-bg', bg); break; }
                  }
                },
                onEnd: () => { dragCode = null; },
                onRelease: () => { justDragged = true; setTimeout(() => { justDragged = false; }, 150); },
                onDrop: (to) => {
                  if (to !== i) {
                    const list = selected.slice();
                    list.splice(to, 0, list.splice(i, 1)[0]);
                    selected = list;
                    save('selected', selected);
                  }
                  render();
                },
              });
            });
            a.addEventListener('dragstart', (e) => e.preventDefault());
          }

          // click po przeciągnięciu trafia czasem w inny wiersz – blokujemy go na całej sekcji
          document.addEventListener('click', (e) => {
            if (justDragged && section && section.contains(e.target)) { e.preventDefault(); e.stopPropagation(); }
          }, true);

          // wyrównanie notatek w otwartych ramkach listy zamówień (ta sama domena) – bez przeładowania
          function applyNoteAlign(a) {
            const css = `a[data-function_delegate="TextareaEdit"] { text-align: ${a}; }`;
            document.querySelectorAll('iframe').forEach((f) => {
              try {
                const d = f.contentDocument;
                if (!d || !/\/panel\/orders-list\.php/.test(d.location.pathname)) return;
                let s = d.getElementById('tm-note-align');
                if (!s) { s = d.createElement('style'); s.id = 'tm-note-align'; (d.head || d.documentElement).appendChild(s); }
                s.textContent = css;
              } catch (e) { /* inna domena – pomiń */ }
            });
          }

          // ---------- settings modal ----------
          async function openSettings() {
            const ov = document.createElement('div');
            ov.className = 'tm-ov';
            ov.innerHTML = `
              <div class="tm-md" role="dialog" aria-label="Widoczne statusy">
                <div class="tm-md-h">Widoczne pozycje<span class="material-symbols-outlined notranslate tm-bug" title="Pokaż/ukryj ID statusów">bug_report</span><span class="material-symbols-outlined notranslate tm-x" title="Zamknij">close</span></div>
                <input type="search" class="tm-search" name="tm-status-filter" autocomplete="off" data-lpignore="true" data-1p-ignore placeholder="Szukaj statusu">
                <div class="tm-md-list">Ładowanie statusów…</div>
                <div class="tm-md-f">
                  <div class="tm-row">
                    <span>Notatki na liście zamówień</span>
                    <span class="tm-align" role="group" aria-label="Wyrównanie notatek">
                      <button type="button" data-a="left" title="Do lewej"><span class="material-symbols-outlined notranslate">format_align_left</span></button>
                      <button type="button" data-a="center" title="Do środka"><span class="material-symbols-outlined notranslate">format_align_center</span></button>
                      <button type="button" data-a="right" title="Do prawej"><span class="material-symbols-outlined notranslate">format_align_right</span></button>
                      <button type="button" data-a="justify" title="Wyjustuj"><span class="material-symbols-outlined notranslate">format_align_justify</span></button>
                    </span>
                  </div>
                  <div class="tm-row">
                    <button class="tm-btn tm-reload" type="button">Odśwież listę statusów</button>
                    <button class="tm-btn tm-primary tm-save" type="button" style="margin-left:auto">Zapisz</button>
                  </div>
                </div>
              </div>`;
            document.body.appendChild(ov);
            const close = () => { ov.remove(); document.removeEventListener('keydown', onKey, true); };
            const onKey = (e) => {
              if (e.key !== 'Escape') return;
              if (e.target && e.target.classList && e.target.classList.contains('tm-alias-in')) return; // Esc w polu nazwy = anuluj edycję
              e.stopPropagation(); close();
            };
            document.addEventListener('keydown', onKey, true);
            ov.addEventListener('mousedown', (e) => { if (e.target === ov) close(); });
            ov.querySelector('.tm-x').addEventListener('click', close);

            const listEl = ov.querySelector('.tm-md-list');
            const search = ov.querySelector('.tm-search');
            const bug = ov.querySelector('.tm-bug');
            const showCodes = (on) => { bug.classList.toggle('on', on); listEl.classList.toggle('tm-hide-codes', !on); };
            showCodes(load('showCodes', false));
            bug.addEventListener('click', () => { const on = !bug.classList.contains('on'); save('showCodes', on); showCodes(on); });
            const checked = new Set(selected);
            const draft = { ...names }; // własne nazwy – zapis dopiero po „Zapisz”
            let alignDraft = load('noteAlign', 'left'); // wyrównanie notatek – zapis dopiero po „Zapisz”
            const alignBtns = ov.querySelectorAll('.tm-align button');
            const showAlign = () => alignBtns.forEach((b) => b.classList.toggle('on', b.dataset.a === alignDraft));
            alignBtns.forEach((b) => b.addEventListener('click', () => { alignDraft = b.dataset.a; showAlign(); }));
            showAlign();

            const fill = () => {
              listEl.innerHTML = '';
              const custom = Object.keys(CUSTOM)
                .filter((c) => !statuses.list.some((s) => s.code === c))
                .map((c) => ({ code: c, name: CUSTOM[c].name, sub: false, parent: '' }));
              const extras = EXTRA.map((x, i) => ({ code: x.code, name: x.name, sub: false, parent: 'reklamacje zwroty pytania', grp: i === 0 ? 'Reklamacje, zwroty, pytania' : '' }));
              const orders = custom.concat(statuses.list);
              if (orders.length) orders[0] = { ...orders[0], grp: 'Statusy zamówień' };
              extras.concat(orders).forEach((s) => {
                if (s.grp) {
                  const g = document.createElement('div');
                  g.className = 'tm-grp';
                  g.textContent = s.grp;
                  listEl.appendChild(g);
                }
                const name = CUSTOM[s.code] ? CUSTOM[s.code].name : s.name;
                const l = document.createElement('label');
                if (s.sub) l.className = 'tm-sub';
                else if (!extraOf(s.code)) l.className = 'tm-top';
                const setQ = () => { l.dataset.q = (name + ' ' + (draft[s.code] || '') + ' ' + s.parent + ' ' + s.code).toLowerCase(); };
                setQ();
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.checked = checked.has(s.code);
                const mark = () => l.classList.toggle('tm-off', !cb.checked);
                mark();
                cb.addEventListener('change', () => { cb.checked ? checked.add(s.code) : checked.delete(s.code); mark(); });
                const ico = document.createElement('span');
                ico.className = 'material-symbols-outlined notranslate tm-ico';
                paintIcon(ico, s.code);
                const t = document.createElement('span');
                t.textContent = name;
                const al = document.createElement('span');
                al.className = 'tm-alias';
                const showAlias = () => { al.textContent = draft[s.code] ? `(${draft[s.code]})` : ''; };
                showAlias();
                const ren = document.createElement('span');
                ren.className = 'material-symbols-outlined notranslate tm-ren';
                ren.textContent = 'edit';
                ren.title = 'Własna nazwa (widoczna tylko u Ciebie)';
                ren.addEventListener('click', (e) => {
                  e.preventDefault(); e.stopPropagation();
                  if (l.querySelector('.tm-alias-in')) return;
                  const inp = document.createElement('input');
                  inp.type = 'text';
                  inp.className = 'tm-alias-in';
                  inp.placeholder = 'własna nazwa';
                  inp.autocomplete = 'off';
                  inp.value = draft[s.code] || '';
                  al.replaceWith(inp);
                  ren.style.display = 'none';
                  let done = false;
                  const finish = (ok) => {
                    if (done) return; done = true;
                    if (ok) { const v = inp.value.trim(); if (v) draft[s.code] = v; else delete draft[s.code]; }
                    showAlias(); setQ();
                    inp.replaceWith(al);
                    ren.style.display = '';
                  };
                  inp.addEventListener('click', (ev) => ev.preventDefault()); // nie przełączaj checkboxa
                  inp.addEventListener('keydown', (ev) => {
                    if (ev.key === 'Enter') { ev.preventDefault(); finish(true); }
                    else if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); finish(false); }
                  });
                  inp.addEventListener('blur', () => finish(true));
                  inp.focus(); inp.select();
                });
                const c = document.createElement('code');
                c.textContent = extraOf(s.code) ? '' : s.code;
                l.append(ico, t, al, ren, c, cb); // checkbox na końcu
                listEl.appendChild(l);
              });
              applyFilter();
            };
            const applyFilter = () => {
              const q = search.value.trim().toLowerCase();
              listEl.querySelectorAll('label').forEach((l) => { l.style.display = !q || l.dataset.q.includes(q) ? '' : 'none'; });
              listEl.querySelectorAll('.tm-grp').forEach((g) => { g.style.display = q ? 'none' : ''; });
            };
            search.addEventListener('input', applyFilter);

            ov.querySelector('.tm-reload').addEventListener('click', async () => {
              listEl.textContent = 'Ładowanie statusów…';
              try { await fetchStatuses(true); fill(); render(); } catch (e) { listEl.textContent = 'Nie udało się pobrać statusów: ' + e.message; }
            });

            ov.querySelector('.tm-save').addEventListener('click', () => {
              // zachowaj dotychczasową kolejność, nowe dopisz na końcu w kolejności IdoSell
              const order = EXTRA.map((x) => x.code).concat(Object.keys(CUSTOM), statuses.list.map((s) => s.code));
              const kept = selected.filter((c) => checked.has(c));
              const added = order.filter((c) => checked.has(c) && !kept.includes(c));
              selected = kept.concat(added);
              save('selected', selected);
              names = { ...draft };
              save('names', names);
              save('noteAlign', alignDraft);
              applyNoteAlign(alignDraft);
              close();
              render();
              refreshCounts(selected); // tylko statusy, które nie zostały jeszcze pobrane w tym załadowaniu
            });

            try { await fetchStatuses(false); fill(); search.focus(); } catch (e) { listEl.textContent = 'Nie udało się pobrać statusów: ' + e.message; }
          }

          // ---------- położenie sekcji (przeciąganie nagłówka) ----------
          // sectionPos = indeks natywnej sekcji, przed którą stoi „Statusy”:
          // 1 = przed „Kanały sprzedaży”, 2 = przed „Aplikacje”, 3 = przed „Ustawienia” (pod „Aplikacje”).
          let sectionPos = load('sectionPos', null);
          let sectionDragging = false;
          let dropIdx = null;
          let dropLine = null;

          const natives = (nav) => [...nav.children].filter((d) => d !== section);
          function maxPos(nat) {
            const b = nat.findIndex((d) => d.classList.contains('mt-auto'));
            return b >= 0 ? b : nat.length;
          }
          function placeSection(nav) {
            const nat = natives(nav);
            const max = maxPos(nat);
            let idx = sectionPos;
            if (idx == null) {
              const apps = nat.findIndex((d) => /^\s*Aplikacje\s*$/.test((d.firstElementChild || {}).textContent || ''));
              idx = apps >= 0 ? apps : max - 1;
            }
            idx = Math.min(Math.max(1, idx), max);
            const ref = nat[idx] || null;
            if (section.parentElement !== nav || section.nextElementSibling !== ref) nav.insertBefore(section, ref);
          }

          function showLine(y, nav) {
            if (!dropLine) {
              dropLine = document.createElement('div');
              dropLine.style.cssText = 'position:fixed;height:2px;background:#6ea8ff;border-radius:1px;z-index:2147483000;pointer-events:none';
              document.body.appendChild(dropLine);
            }
            const r = nav.getBoundingClientRect();
            dropLine.style.left = r.left + 8 + 'px';
            dropLine.style.width = r.width - 16 + 'px';
            dropLine.style.top = y - 1 + 'px';
            dropLine.style.display = 'block';
          }
          function hideLine() { if (dropLine) dropLine.style.display = 'none'; }

          const wiredNavs = new WeakSet();
          function wireNav(nav) {
            if (wiredNavs.has(nav)) return;
            wiredNavs.add(nav);
            nav.addEventListener('dragover', (e) => {
              if (!sectionDragging) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              const nat = natives(nav);
              const max = maxPos(nat);
              let best = null;
              let bestY = 0;
              for (let i = 1; i <= max; i++) {
                // ostatnie miejsce (przed „Ustawienia”, które jest przyklejone do dołu) = tuż pod poprzednią sekcją
                const y = i < max && nat[i] ? nat[i].getBoundingClientRect().top : nat[i - 1].getBoundingClientRect().bottom;
                if (best === null || Math.abs(e.clientY - y) < Math.abs(e.clientY - bestY)) { best = i; bestY = y; }
              }
              dropIdx = best;
              showLine(bestY, nav);
            });
            nav.addEventListener('drop', (e) => {
              if (!sectionDragging) return;
              e.preventDefault();
              if (dropIdx != null) {
                sectionPos = dropIdx;
                save('sectionPos', sectionPos);
                placeSection(nav);
              }
              hideLine();
            });
          }

          function wireSectionDrag(hdr) {
            hdr.draggable = true;
            hdr.title = 'Przeciągnij, aby przenieść sekcję';
            hdr.addEventListener('dragstart', (e) => {
              if (swDown) { e.preventDefault(); swDown = false; return; } // klik w suwak nie przesuwa sekcji
              if (dragCode) return;
              sectionDragging = true;
              dropIdx = null;
              section.classList.add('tm-section-dragging');
              e.dataTransfer.effectAllowed = 'move';
              try { e.dataTransfer.setData('text/plain', 'tm-statusy'); } catch (err) { /* ignore */ }
            });
            hdr.addEventListener('dragend', () => {
              sectionDragging = false;
              section.classList.remove('tm-section-dragging');
              hideLine();
            });
          }

          // ---------- mount ----------
          function mount() {
            const nav = document.getElementById('Nav');
            if (!nav) return;
            if (section && nav.contains(section)) return;
            if (!(section && cls)) buildSection(nav);
            wireNav(nav);
            placeSection(nav);
            if (!fetchStarted && enabled) startFetch();
          }

          function startFetch() {
            fetchStarted = true;
            fetchStatuses(false).then(render).catch(() => {}).finally(() => { if (enabled) refreshCounts(selected); });
          }

          // Suwak w nagłówku: wyłączone = brak pozycji i żadnych zapytań (zapis per przeglądarka / Tampermonkey).
          function setEnabled(on) {
            enabled = on;
            save('enabled', enabled);
            render();
            if (!enabled) return;
            if (!fetchStarted) startFetch();
            else refreshCounts(selected); // policzy tylko to, czego nie pobrano jeszcze w tym załadowaniu strony
          }

          // Zwinięty pasek: React usuwa teksty nagłówków i etykiet w natywnych sekcjach
          function syncCollapsed() {
            const nav = document.getElementById('Nav');
            if (!nav || !section) return;
            const collapsed = !nav.querySelector(':scope > div:not(#tm-statusy) .--title');
            section.classList.toggle('tm-collapsed', collapsed);
          }

          let lastHref = '';
          const tick = () => {
            mount();
            syncCollapsed();
            if (location.href !== lastHref) { lastHref = location.href; updateActive(); }
          };
          new MutationObserver(() => { tick(); }).observe(document.body, { childList: true, subtree: true });
          setInterval(() => { updateActive(); }, 1500);
          tick();
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', tmStatusyStart, { once: true });
        } else {
            tmStatusyStart();
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // ALLEGRO SALES CENTER – CZAT Z KUPUJĄCYM (guzik w lewym dolnym rogu)
    // ════════════════════════════════════════════════════════════════════════

    if (location.hostname === 'salescenter.allegro.com' && window.self === window.top) {

        const SCC_BTN_ID = 'tm-czat-kupujacy-btn';

        function sccOrderId() {
            const m = location.pathname.match(/^\/orders\/([0-9a-f-]{36})/i);
            return m ? m[1] : null;
        }

        function sccBuyerLogin() {
            const a = document.querySelector('.buyer-details a[href*="/uzytkownik/"]');
            const m = a && (a.getAttribute('href') || '').match(/\/uzytkownik\/([^/?#]+)/);
            return m ? decodeURIComponent(m[1]) : null;
        }

        function sccChatUrl(login, orderId) {
            const p = new URLSearchParams({ interlocutorLogin: login, threadStatus: 'ALL', tab: 'selling', tmOrder: orderId });
            return '/message-center/messages?' + p.toString();
        }

        function sccLeftOffset() {
            // lewy pionowy pasek menu Sales Center – guzik stoi tuż obok niego
            let right = 0;
            document.querySelectorAll('header, nav, aside').forEach(function (el) {
                const r = el.getBoundingClientRect();
                if (r.left < 5 && r.width > 0 && r.width < 400 && r.height > window.innerHeight * 0.6) {
                    right = Math.max(right, Math.round(r.right));
                }
            });
            return right + 16;
        }

        function sccUpdateButton() {
            const orderId = sccOrderId();
            const login = orderId ? sccBuyerLogin() : null;
            let btn = document.getElementById(SCC_BTN_ID);

            if (!orderId || !login) {
                if (btn) btn.remove();
                return;
            }

            if (!btn) {
                btn = document.createElement('a');
                btn.id = SCC_BTN_ID;
                btn.target = '_blank';
                btn.rel = 'noopener';
                btn.style.cssText = 'position:fixed; bottom:16px; z-index:9999; padding:6px 12px; background:#ff5a00; color:#fff;'
                    + ' font-family:inherit; font-size:12px; font-weight:600; letter-spacing:.5px; line-height:1.4;'
                    + ' border-radius:4px; text-decoration:none; box-shadow:0 2px 6px rgba(0,0,0,.3);';
                btn.onmouseenter = function () { btn.style.background = '#e64e00'; };
                btn.onmouseleave = function () { btn.style.background = '#ff5a00'; };
                document.body.appendChild(btn);
            }

            const href = sccChatUrl(login, orderId);
            if (btn.getAttribute('href') !== href) btn.setAttribute('href', href);
            btn.textContent = 'CZAT KLIENTA';
            btn.title = 'Otwórz rozmowę';
            btn.style.left = sccLeftOffset() + 'px';
        }

        // Formularz „Nowa wiadomość"
        const sccNativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        let sccFilledFor = null;

        function sccFillInput(input, value) {
            if (!input || input.value || !value) return;
            sccNativeSetter.call(input, value);
            ['input', 'change', 'blur', 'focusout'].forEach(function (ev) {
                input.dispatchEvent(new Event(ev, { bubbles: true }));
            });
        }

        function sccPrefillNewMessage() {
            if (!location.pathname.startsWith('/message-center/messages/new-message')) return;
            const p = new URLSearchParams(location.search);
            const login = p.get('interlocutorLogin');
            const order = p.get('tmOrder');
            if (!login || !order || sccFilledFor === login + '|' + order) return;
            const rec = document.getElementById('recipient');
            const ord = document.getElementById('order');
            if (!rec || !ord) return;
            sccFillInput(rec, login);
            sccFillInput(ord, order);
            sccFilledFor = login + '|' + order;
        }

        const sccStart = function () {
            let scheduled = false;
            const run = function () {
                scheduled = false;
                sccUpdateButton();
                sccPrefillNewMessage();
            };
            new MutationObserver(function () {
                if (!scheduled) { scheduled = true; requestAnimationFrame(run); }
            }).observe(document.body, { childList: true, subtree: true });
            window.addEventListener('resize', run);
            run();
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', sccStart, { once: true });
        } else {
            sccStart();
        }
    }

})();
