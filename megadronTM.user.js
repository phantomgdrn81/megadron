// ==UserScript==
// @name         Megadron Scripts Packed
// @namespace    megadron.pl
// @version      1.2.20
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

/* global $, IAI */ //clearing the triggers

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
    // GUZICZKI GABARYTÓW INPOST //notmine
    // ════════════════════════════════════════════════════════════════════════

    if (url.includes('/panel/order-verification.php')) {

        window.addEventListener("load", () => {
            addButtonsGabaryt();
        });

        function addButtonsGabaryt() {
            var scriptDelivery = document.getElementById("deliverer-number-count_" + IAI._orderNumber);
            scriptDelivery = scriptDelivery.getAttribute("onclick");
            scriptDelivery = scriptDelivery.replace('show_packages_edit_toplayer(event,', '');
            scriptDelivery = scriptDelivery.replace(')', '');
            var jsonObject = JSON.parse(scriptDelivery);
            var packageId = jsonObject.delivery_packages.packs[0].id;

            if (!jsonObject.delivery_packages.packs[0].package_number) {
                var mydiv, newDiv;
                if (document.querySelector('[title="Paczkomaty InPost Smile"]')) {
                    mydiv = document.querySelector("#tr_0 > td:nth-child(5)");
                    newDiv = "<br/><div id=\"wyborGabarytu\"><input type=\"button\" value=\"Gabaryt A\" onclick=\"IAI.ajax.post('/panel/ajax/orderd.php', '', 'action=assignBoxToPackage&packageId=" + packageId + "&boxType=A'); IAI.ajax.post('/panel/ajax/packages-gateway.php', '', 'courierId=" + jsonObject.deliverer_id + "&action=generate&orders[]=" + jsonObject.order_id + "'); $('#wyborGabarytu').html('<br/><b>Przypisano gabaryt A!</b>'); document.querySelector('#fg_code').focus();\" style=\"margin-top:20px; height:50px; font-size:15px; border-radius: 3px\" class=\"btn btn-sm btn-success formbutton\">";
                    newDiv += "<input type=\"button\" value=\"Gabaryt B\" onclick=\"IAI.ajax.post('/panel/ajax/orderd.php', '', 'action=assignBoxToPackage&packageId=" + packageId + "&boxType=B'); IAI.ajax.post('/panel/ajax/packages-gateway.php', '', 'courierId=" + jsonObject.deliverer_id + "&action=generate&orders[]=" + jsonObject.order_id + "'); $('#wyborGabarytu').html('<br/><b>Przypisano gabaryt B!</b>'); document.querySelector('#fg_code').focus();\" style=\"margin-top:20px; height:50px; font-size:15px; border-radius: 3px\" class=\"btn btn-sm btn-warning formbutton\">";
                    newDiv += "<input type=\"button\" value=\"Gabaryt C\" onclick=\"IAI.ajax.post('/panel/ajax/orderd.php', '', 'action=assignBoxToPackage&packageId=" + packageId + "&boxType=C'); IAI.ajax.post('/panel/ajax/packages-gateway.php', '', 'courierId=" + jsonObject.deliverer_id + "&action=generate&orders[]=" + jsonObject.order_id + "'); $('#wyborGabarytu').html('<br/><b>Przypisano gabaryt C!</b>'); document.querySelector('#fg_code').focus();\" style=\"margin-top:20px; height:50px; font-size:15px; border-radius: 3px\" class=\"btn btn-sm btn-danger formbutton\"></div>";
                    mydiv.innerHTML += newDiv;
                } else if (document.querySelector('[title="Allegro Paczkomaty 24/7 InPost - wszystkie rozmiary"]') || document.querySelector('[title="InPost Paczkomaty 24/7 - wszystkie rozmiary"]')) {
                    mydiv = document.querySelector("#tr_0 > td:nth-child(5)");
                    newDiv = "<br/><div id=\"wyborGabarytu\"><input type=\"button\" value=\"Gabaryt A\" onclick=\"IAI.ajax.post('/panel/ajax/packages-gateway.php', '', 'defaultParcelGauge=small&courierId=" + jsonObject.deliverer_id + "&action=generate&orders[]=" + jsonObject.order_id + "'); $('#wyborGabarytu').html('<br/><b>Przypisano gabaryt A!</b>'); document.querySelector('#fg_code').focus();\" style=\"margin-top:20px; height:50px; font-size:15px; border-radius: 3px\" class=\"btn btn-sm btn-success formbutton\">";
                    newDiv += "<input type=\"button\" value=\"Gabaryt B\" onclick=\"IAI.ajax.post('/panel/ajax/packages-gateway.php', '', 'defaultParcelGauge=medium&courierId=" + jsonObject.deliverer_id + "&action=generate&orders[]=" + jsonObject.order_id + "'); $('#wyborGabarytu').html('<br/><b>Przypisano gabaryt B!</b>'); document.querySelector('#fg_code').focus();\" style=\"margin-top:20px; height:50px; font-size:15px; border-radius: 3px\" class=\"btn btn-sm btn-warning formbutton\">";
                    newDiv += "<input type=\"button\" value=\"Gabaryt C\" onclick=\"IAI.ajax.post('/panel/ajax/packages-gateway.php', '', 'defaultParcelGauge=large&courierId=" + jsonObject.deliverer_id + "&action=generate&orders[]=" + jsonObject.order_id + "'); $('#wyborGabarytu').html('<br/><b>Przypisano gabaryt C!</b>'); document.querySelector('#fg_code').focus();\" style=\"margin-top:20px; height:50px; font-size:15px; border-radius: 3px\" class=\"btn btn-sm btn-danger formbutton\">";
                    mydiv.innerHTML += newDiv;
                } else if (!/^Allegro\b/i.test(jsonObject.deliverer_name || '')) {
                    IAI.ajax.post('/panel/ajax/packages-gateway.php', '', 'courierId=' + jsonObject.deliverer_id + '&action=generate&orders[]=' + jsonObject.order_id);
                }
            }
            var badDivs = $("#msg_line_msg");
            badDivs.remove();
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // GUZICZKI GABARYTÓW ALLEGRO
    // ════════════════════════════════════════════════════════════════════════

    if (url.includes('/panel/order-verification.php')) {

        window.addEventListener("load", () => {
            [0, 300, 700, 1200, 2000, 3000].forEach(d => setTimeout(addButtonsGabarytAllegro, d));
        });

        function addButtonsGabarytAllegro() {
            if (document.getElementById('wyborGabarytu')) return;

            var GB_COURIER_TITLES = [
                'Allegro Automat DPD Pickup',
                'Allegro Odbiór w Punkcie Orlen Paczka',
                'Allegro Automat Orlen Paczka',
                'Allegro Automat DHL BOX 24/7 (AD)',
                'Allegro Odbiór w Punkcie DHL (AD)',
                'Allegro One Box (One Kurier)',
                'Allegro One Box (DPD)',
                'Allegro One Kurier - dostawa na jutro',
            ];

            var matchedTitle = GB_COURIER_TITLES.find(function (title) {
                return !!document.querySelector('[title="' + title + '"]');
            });
            if (!matchedTitle) return;

            var deliveryEl = document.getElementById("deliverer-number-count_" + IAI._orderNumber);
            if (!deliveryEl) return;

            var scriptDelivery = deliveryEl.getAttribute("onclick");
            scriptDelivery = scriptDelivery.replace('show_packages_edit_toplayer(event,', '');
            scriptDelivery = scriptDelivery.replace(/\)\s*$/, '');
            var jsonObject = JSON.parse(scriptDelivery);

            if (jsonObject.delivery_packages.packs[0].package_number) return;

            var mydiv = deliveryEl.closest('td');
            if (!mydiv) return;

            var wrap = document.createElement('div');
            wrap.id = 'wyborGabarytu';
            wrap.innerHTML = '<br/>';

            var btnClasses = [
                'btn btn-sm btn-success formbutton',
                'btn btn-sm btn-warning formbutton',
                'btn btn-sm btn-danger formbutton',
                'btn btn-sm btn-default formbutton',
            ];

            var gaugeSelect = document.querySelector('select#fg_defaultParcelGauge');
            var gauges = (gaugeSelect && gaugeSelect.options.length > 0)
                ? [...gaugeSelect.options].filter(o => o.value).map(o => ({ value: o.value, label: o.textContent.trim() }))
                : [
                    { value: 'S', label: 'Gabaryt A' },
                    { value: 'M', label: 'Gabaryt B' },
                    { value: 'L', label: 'Gabaryt C' },
                ];

            gauges.forEach(function (g, i) {
                var btn = document.createElement('input');
                btn.type = 'button';
                btn.value = g.label;
                btn.className = btnClasses[i] || 'btn btn-sm btn-default formbutton';
                btn.style.cssText = 'margin-top:20px; height:50px; font-size:15px; border-radius: 3px';
                btn.addEventListener('click', function () {
                    IAI.ajax.post(
                        '/panel/ajax/packages-gateway.php', '',
                        'defaultParcelGauge=' + g.value +
                        '&courierId=' + jsonObject.deliverer_id +
                        '&action=generate&orders[]=' + jsonObject.order_id
                    );

                    wrap.innerHTML = '<br/><b>Przypisano gabaryt ' + g.value + '!</b>';

                    var fgCode = document.querySelector('#fg_code');
                    if (fgCode) fgCode.focus();

                    setTimeout(function () {
                        var link = document.querySelector('.generateNumber22');
                        if (link) link.click();
                    }, 1200);
                });
                wrap.appendChild(btn);
            });

            mydiv.appendChild(wrap);

            var badDivs = $("#msg_line_msg");
            badDivs.remove();
        }
    }


    // ════════════════════════════════════════════════════════════════════════
    // KARTONY – ALLEGRO ZAGRANICZNE (wpisywane wymiary)
    // ════════════════════════════════════════════════════════════════════════

    if (url.includes('/panel/order-verification.php')) {

        const DRY_RUN = false;
        const STORE_KEY = 'kartony';
        const SELECTED_KEY = 'kartonWybrany';
        const NAME_MAX = 10;

        const kq = (sel, root = document) => root.querySelector(sel);
        const sleep = ms => new Promise(r => setTimeout(r, ms));

        const loadBoxes = () => { try { return GM_getValue(STORE_KEY, []) || []; } catch (e) { return []; } };
        const saveBoxes = boxes => GM_setValue(STORE_KEY, boxes);

        function rowText(label) {
            const tr = [...document.querySelectorAll('tr')]
                .find(t => t.cells.length >= 2 && t.cells[0].textContent.trim().startsWith(label));
            return tr ? tr.cells[1].textContent.replace(/\s+/g, ' ').trim() : '';
        }

        function isForeignAllegro(link) {
            if (!/^Allegro/i.test(rowText('Kurier'))) return false;
            if (/allegro\.(?!pl\b)[a-z]{2}\b/i.test(rowText('Źródło zamówienia'))) return true;
            const table = link.closest('table');
            if (!table) return false;
            const flags = [...table.querySelectorAll('img')]
                .map(i => (i.getAttribute('src') || '').match(/(?:^|\/)([a-z]{2})\.png$/i))
                .filter(Boolean).map(m => m[1].toLowerCase());
            if (flags.some(cc => cc !== 'pl')) return true;
            const countries = (table.rows[2]?.cells[1]?.textContent || '').match(/\(([^()]+)\)/g) || [];
            return countries.some(c => !/Polska/i.test(c));
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

        function findPanelAlert() {
            const known = /^(windowTopLayer_c|teporaryStorageView_c|wait_c|ajax_c)$/;
            const el = [...document.querySelectorAll('.yui-panel-container, .bootbox, .modal.in, .ui-dialog')]
                .find(e => visible(e) && !known.test(e.id) && e.innerText.trim());
            return el ? el.innerText.replace(/\s+/g, ' ').replace(/Close$/, '').trim() : '';
        }
        function closePanelAlert() {
            const known = /^(windowTopLayer_c|teporaryStorageView_c|wait_c|ajax_c)$/;
            [...document.querySelectorAll('.yui-panel-container, .bootbox, .modal.in, .ui-dialog')]
                .filter(e => visible(e) && !known.test(e.id))
                .forEach(e => kq('a.container-close, .close, .bootbox-close-button', e)?.click());
        }

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
            .krb-tile .del{position:absolute;right:8px;top:50%;transform:translateY(-50%);color:#c62828;font-size:15px;padding:2px 5px;border-radius:4px}
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

        const log = (...a) => console.log('[Kartony]', ...a);

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
            log(text);
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
                const h = await waitFor(() => { const e = kq('#fg_Height'); return visible(e) && e; });
                const panel = h.closest('#windowTopLayer_c') || h.closest('form') || document;
                setVal(h, box.h);
                setVal(kq('#fg_Width', panel), box.w);
                setVal(kq('#fg_Length', panel), box.l);

                if (DRY_RUN) {
                    setStatus('ok', `Wpisano ${box.h}×${box.w}×${box.l} (test)`);
                    busy = false;
                    setTimeout(showSelected, 4000);
                    return;
                }

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
                log('krok 1 OK (bez przeładowania)');
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
                    log('krok 2, próba', i + 1);
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
                log('etykieta', pdf.textContent.trim());
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

        //wybór kartonu
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

                    // Przeciąganie całego kafelka
                    t.onpointerdown = e => {
                        if (e.button !== 0 || e.target.closest('.del') || boxes.length < 2) return;
                        e.preventDefault(); // bez zaznaczania tekstu; click nadal przychodzi
                        const tiles = [...pop.querySelectorAll('.krb-tile')];
                        const tops = tiles.map(x => x.getBoundingClientRect().top);
                        const step = tops[1] - tops[0];
                        const minDy = tops[0] - tops[i], maxDy = tops[tiles.length - 1] - tops[i];
                        const y0 = e.clientY;
                        let dragging = false, to = i;

                        const place = n => tiles.forEach((x, j) => {
                            if (j === i) return;
                            const shift = (i < n && j > i && j <= n) ? -step : (n < i && j >= n && j < i) ? step : 0;
                            x.style.transform = shift ? `translateY(${shift}px)` : '';
                        });
                        // Nasłuch na całym oknie
                        const finish = () => {
                            window.removeEventListener('pointermove', onMove, true);
                            window.removeEventListener('pointerup', onUp, true);
                            window.removeEventListener('pointercancel', cancel, true);
                            window.removeEventListener('keydown', onKey, true);
                            pop.classList.remove('sorting');
                        };
                        const cancel = () => {
                            finish();
                            t.classList.remove('lift');
                            tiles.forEach(x => { x.style.transform = ''; });
                        };
                        const onKey = ev => { if (ev.key === 'Escape' && dragging) { ev.stopPropagation(); cancel(); } };

                        const onMove = ev => {
                            const dy = ev.clientY - y0;
                            if (!dragging) {
                                if (Math.abs(dy) < 5) return;
                                dragging = true;
                                t.classList.add('lift');
                                pop.classList.add('sorting');
                                window.addEventListener('keydown', onKey, true);
                            }
                            const d = Math.max(minDy, Math.min(maxDy, dy));
                            t.style.transform = `translateY(${d}px) scale(1.02)`;
                            const n = Math.max(0, Math.min(tiles.length - 1, Math.round(i + d / step)));
                            if (n !== to) { to = n; place(to); }
                        };
                        const onUp = ev => {
                            if (!dragging && Math.abs(ev.clientY - y0) >= 5) onMove(ev); // szybki ruch bez pośrednich pozycji
                            if (!dragging) { finish(); return; }
                            justDragged = true;
                            setTimeout(() => { justDragged = false; }, 0); // gdyby click nie przyszedł
                            finish();
                            // Dojazd do slotu, potem zapis nowej kolejności
                            t.classList.remove('lift');
                            t.classList.add('settle');
                            t.style.transform = `translateY(${(to - i) * step}px)`;
                            setTimeout(() => {
                                if (to !== i) {
                                    const [moved] = boxes.splice(i, 1);
                                    boxes.splice(to, 0, moved);
                                    saveBoxes(boxes);
                                }
                                render(); showSelected();
                            }, 160);
                        };
                        window.addEventListener('pointermove', onMove, true);
                        window.addEventListener('pointerup', onUp, true);
                        window.addEventListener('pointercancel', cancel, true);
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

        function init() {
            const link = kq('a.generateNumber22');
            if (!link || kq('.krb-card')) return;
            const td = link.closest('td');
            if (!td || !/Nie wygenerowano numeru/i.test(td.textContent) || !isForeignAllegro(link)) return;

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
        }

        window.addEventListener("load", () => {
            const pendingBox = takePending();
            if (pendingBox) {
                injectStyles();
                finishLabel(pendingBox);
            } else {
                [0, 500, 1500].forEach(d => setTimeout(init, d));
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
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(response.responseText, 'text/html');
                        const allRows = doc.querySelectorAll('table tbody tr');
                        let row = null;
                        allRows.forEach(r => {
                            const cells = r.querySelectorAll('td');
                            if (!row && cells.length >= 2 && cells[1].textContent.trim() !== '' && cells[1].textContent.trim() !== '-') {
                                row = r;
                            }
                        });
                        if (!row) { callback(null); return; }
                        const cells = row.querySelectorAll('td');
                        callback(cells[1] ? cells[1].textContent.trim() : null);
                    } catch (e) {
                        callback(null);
                    }
                },
                onerror: function () { callback(null); }
            });
        }

        function makeBadgeM1(m1) {
            const qty = parseInt(m1, 10);
            if (m1 === null) {
            }
            let displayM1 = m1 !== null ? m1 : '-';
            if (m1 === 'jest') {
                displayM1 = "<i> elektronicznie </i>";
            }

            if (qty === 0 || m1 === '0') {
                displayM1 = 'BRAK';
            }

            const d = document.createElement('div');
            d.className = 'm1-stock-badge';
            d.style.cssText = `
            margin-top:4px;
            padding:2px 8px;
            border-radius:4px;
            font-size:12px;
            display:inline-block;
            background:#FDF5E6;
            border:1px solid #D2B48C;
            color:#721c24;
            `;

            d.innerHTML = `📦 M1: <strong>${displayM1}</strong>`;
            return d;
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

                let lokalizacjeP = null;
                nameTd.querySelectorAll('p').forEach(p => {
                    if (!lokalizacjeP && p.textContent.includes('Lokalizacje:')) {
                        lokalizacjeP = p;
                    }
                });
                if (!lokalizacjeP) return;
                if (lokalizacjeP.parentElement.querySelector('.m1-stock-badge')) return;

                const placeholder = document.createElement('div');
                placeholder.className = 'm1-stock-badge';
                placeholder.style.cssText = `
                margin-top:4px;
                padding:2px 8px;
                border-radius:4px;
                font-size:12px;
                display:inline-block;
                background:#FDF5E6;
                border:1px solid #D2B48C;
                color:#721c24;`;
                placeholder.innerHTML = '📦 M1: <strong>ładowanie…</strong>';
                lokalizacjeP.insertAdjacentElement('afterend', placeholder);

                fetchM1(idt, function (m1) {
                    placeholder.replaceWith(makeBadgeM1(m1));
                });
            });
        }

        const observerM1 = new MutationObserver(processLinksM1);
        observerM1.observe(document.documentElement, { childList: true, subtree: true });
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
        let summaryEl = null;
        let toggleBtn = null;
        let showingHidden = false;

        function shouldHideRowText(text) {
            const t = (text || '').trim();
            return NEEDLE_PHRASES.some(p => t.includes(p));
        }

        function insertUIAfterAnchor() {
            const anchor = document.querySelector('div.hd#orderHistoryDiv_h');
            if (!anchor || !anchor.parentNode) return false;
            if (document.getElementById('tm-hidden-rows-summary')) return true;

            summaryEl = document.createElement('div');
            summaryEl.id = 'tm-hidden-rows-summary';
            summaryEl.textContent = 'Skrypt ukrył 0 wierszy';
            summaryEl.style.cssText =`
            margin:12px 0 8px 0;
            padding:10px 12px;
            border:2px solid #d00;
            color:#d00;
            font-weight:700;
            background:#fff5f5;
            font-family:Arial,sans-serif;
            font-size:14px;';
            `

            toggleBtn = document.createElement('button');
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

        function ensureUI() { insertUIAfterAnchor(); }

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
                if (shouldHideRowText(tr.textContent || '')) {
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
    // PODGLĄD DŁUŻSZYCH NOTATEK
    // ════════════════════════════════════════════════════════════════════════

    if (url.includes('client6220.idosell.com')) {

        let tooltipNote;
        const MIN_LENGTH = 100;

        function createTooltip() {
            tooltipNote = document.createElement('div');
            tooltipNote.style.position = 'fixed';
            tooltipNote.style.zIndex = '99999';
            tooltipNote.style.top = '50%';
            tooltipNote.style.right = '20px';
            tooltipNote.style.transform = 'translateY(-50%)';
            tooltipNote.style.maxWidth = '420px';
            tooltipNote.style.padding = '10px 12px';
            tooltipNote.style.background = '#ffffff';
            tooltipNote.style.border = '1px solid #ccc';
            tooltipNote.style.borderRadius = '8px';
            tooltipNote.style.boxShadow = '0 6px 18px rgba(0,0,0,.18)';
            tooltipNote.style.fontSize = '13px';
            tooltipNote.style.fontWeight = '700';
            tooltipNote.style.lineHeight = '1.45';
            tooltipNote.style.color = 'red';
            tooltipNote.style.whiteSpace = 'pre-wrap';
            tooltipNote.style.display = 'none';
            document.body.appendChild(tooltipNote);
        }

        function showTooltipNote(text) {
            if (!tooltipNote) createTooltip();
            tooltipNote.textContent = text;
            tooltipNote.style.display = 'block';
        }

        function hideTooltipNote() {
            if (tooltipNote) tooltipNote.style.display = 'none';
        }

        function initTooltip() {
            document.querySelectorAll('a[data-function_delegate="TextareaEdit"]').forEach(el => {
                if (el.dataset.tmTooltipInit) return;
                el.dataset.tmTooltipInit = '1';
                const text = (el.getAttribute('title') || el.textContent || '').trim();
                if (text.length <= MIN_LENGTH) return;
                el.addEventListener('mouseenter', () => showTooltipNote(text));
                el.addEventListener('mouseleave', hideTooltipNote);
            });
        }

        initTooltip();
        new MutationObserver(initTooltip).observe(document.documentElement, { childList: true, subtree: true });
    }


    // ════════════════════════════════════════════════════════════════════════
    // ALLEGRO OPISY KURIERÓW
    // ════════════════════════════════════════════════════════════════════════

    if (url.includes('client6220.idosell.com')) {

        const allegroCourierMap = [
            { match: /orlen/i, label: 'Orlen Paczka' },
            { match: /dpd/i, label: 'DPD' },
            { match: /\bone\b/i, label: 'One Kurier' },
            { match: /inpost/i, label: 'InPost' },
            { match: /dhl/i, label: 'DHL' },
            { match: /ups/i, label: 'UPS' },
            { match: /pocztex/i, label: 'Pocztex' },
        ];

        function getCourierLabel(name) {
            for (const courier of allegroCourierMap) {
                if (courier.match.test(name)) return courier.label;
            }
            return null;
        }

        function addCourierLabels() {
            document.querySelectorAll('img.delivery-icon').forEach(img => {
                const parent = img.parentElement;
                if (!parent) return;
                if (parent.querySelector('.tm-courier-label')) return;
                const fullName = img.title || img.alt;
                if (!fullName) return;
                if (!/allegro/i.test(fullName)) return;
                const shortName = getCourierLabel(fullName);
                if (!shortName) return;

                parent.style.textAlign = 'center';
                const label = document.createElement('div');
                label.className = 'tm-courier-label';
                label.textContent = shortName;
                label.style.fontSize = '12px';
                label.style.fontWeight = '600';
                label.style.lineHeight = '1.3';
                label.style.marginTop = '4px';
                label.style.color = '#333';
                label.style.whiteSpace = 'normal';
                label.style.wordBreak = 'break-word';
                label.style.maxWidth = '70px';
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
            var container = li.closest("fieldset, .box, .panel, .content, .section, form, body") || document.body;
            var img = container.querySelector('img[title="Empik"], img[title="Allegro"]');
            if (img) return (img.getAttribute("title") || "").trim();
            img = document.querySelector('img[title="Empik"], img[title="Allegro"]');
            if (img) return (img.getAttribute("title") || "").trim();
            return "";
        }

        function addAllegroButton(orderId) {
            if (document.getElementById("allegro-order-button")) return;
            var btn = document.createElement("a");
            btn.id = "allegro-order-button";
            btn.href = allegroUrl + orderId;
            btn.target = "_blank";
            btn.rel = "noopener noreferrer";
            btn.textContent = "Allegro";
            btn.style.position = "fixed";
            btn.style.right = "16px";
            btn.style.bottom = "16px";
            btn.style.zIndex = "9999";
            btn.style.padding = "10px 16px";
            btn.style.background = "#ff5a00";
            btn.style.color = "#fff";
            btn.style.fontSize = "14px";
            btn.style.fontWeight = "700";
            btn.style.borderRadius = "6px";
            btn.style.textDecoration = "none";
            btn.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
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
            box.style.cssText = `
            position:fixed;
            top:60px;right:20px;
            z-index:99999;
            background:#c62828;
            color:#fff;

            font-family:Arial,sans-serif;
            font-size:13px;
            font-weight:bold;
            padding:12px 16px;
            border-radius:6px;
            box-shadow:0 4px 16px rgba(0,0,0,0.4);
            max-width:280px;
            line-height:1.6;
            `;

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
            nameMap.forEach((elements, name) => {
                if (elements.length > 1) {
                    elements.forEach(b => {
                        b.style.cssText = `
                        background:#fff176;
                        color:#b71c1c;
                        padding:1px 4px;
                        border-radius:3px;
                        outline:2px solid #e53935;`

                        b.title = `Ten klient ma ${elements.length} zamówienia na liście`;
                    });

                } else {
                    elements.forEach(b => b.style.cssText = '');
                }
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

        const styleApi = document.createElement('style');
        styleApi.textContent = 'tr.tm-api-order td { background-color: #c8e6c9 !important; }';
        document.head.appendChild(styleApi);

        function runApiOrders() {
            document.querySelectorAll('table tbody tr').forEach(tr => {
                const statusCell = tr.querySelector('td.yui-dt0-col-status');
                if (!statusCell) return;
                const hasApi = [...statusCell.querySelectorAll('span')].some(span =>
                    span.textContent.trim() === 'zarejestrowane przez API'
                );
                if (hasApi) {
                    tr.classList.add('tm-api-order');
                } else {
                    tr.classList.remove('tm-api-order');
                }
            });
        }

        let debounceApi;
        const observerApi = new MutationObserver(() => {
            clearTimeout(debounceApi);
            debounceApi = setTimeout(runApiOrders, 600);
        });
        observerApi.observe(document.documentElement, { childList: true, subtree: true });
        setTimeout(() => { observerApi.disconnect(); runApiOrders(); }, 8000);

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runApiOrders);
        } else {
            runApiOrders();
        }
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

        // ikonki style
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
                        const inputs = doc.querySelectorAll('input[type="text"][name*="location_id_sel[1]"]');
                        let lokalizacja = null;

                        inputs.forEach(input => {
                            if (input.value && input.value.trim() !== '' && !lokalizacja) {
                                lokalizacja = input.value.trim();
                            }
                        });

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

                        const cells = row.querySelectorAll('td');
                        const raw = cells[1] ? cells[1].textContent.trim() : '-';
                        const val = raw === '-' ? 0 : parseInt(raw, 10);
                        const parsedVal = isNaN(val) ? 0 : val;

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
        (function () {
    'use strict';

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
        })();
    }



    // ════════════════════════════════════════════════════════════════════════
    // STATUSY ALLEGRO NA LIŚCIE ZAMÓWIEŃ
    // ════════════════════════════════════════════════════════════════════════

    if (url.includes('/panel/orders-list.php')) {

        // SELLER ID - ID Z NAGŁÓWKA ALLEGRO
        const AZ_SELLER_ID = '38153188';

        const AZ_MAX_CONCURRENT = 5;
        const AZ_ROW_WAIT_TIMEOUT_MS = 60000;

        const AZ_STATUS_INFO = {
            RETURNED:  { icon: '🔁', text: 'ZWROT', wrap: true },
            CANCELLED: { icon: '❌', text: 'ANULOWANE', wrap: true },
        };
        const AZ_DEFAULT_INFO = { icon: '✅', text: '', wrap: false };
        const AZ_HIGHLIGHT_COLOR = '#ffe3e3';

        function azGmFetch(fetchUrl) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: fetchUrl,
                    headers: {
                        'Accept': 'application/vnd.allegro.public.v1+json',
                        'X-Representative-Of': AZ_SELLER_ID,
                    },
                    onload: resolve,
                    onerror: reject,
                    ontimeout: reject,
                    timeout: 15000,
                });
            });
        }

        function azCreateQueue(maxConcurrent) {
            let active = 0;
            const queue = [];
            function next() {
                if (active >= maxConcurrent || queue.length === 0) return;
                active++;
                const { fn, resolve, reject } = queue.shift();
                fn().then(resolve, reject).finally(() => { active--; next(); });
            }
            return (fn) => new Promise((resolve, reject) => { queue.push({ fn, resolve, reject }); next(); });
        }
        const azEnqueue = azCreateQueue(AZ_MAX_CONCURRENT);

        function azExtractAllegroOrders(data) {
            const records = data?.records || [];
            const results = [];
            for (const record of records) {
                const orderNumber = record?.id?.order_number;
                const uuid = record?.order_source?.details?.orderExternalId;
                const isAllegro = record?.order_source?.auction === 'allegro';
                if (orderNumber && uuid && isAllegro) {
                    results.push({ orderNumber: String(orderNumber), uuid });
                }
            }
            return results;
        }

        // STATUS ALLEGRO
        async function azFetchAllegroStatus(uuid) {
            const res = await azGmFetch(`https://edge.salescenter.allegro.com/seller/orders/${uuid}`);
            if (res.status !== 200) return null;
            const data = JSON.parse(res.responseText);

            if (data.status !== 'CANCELLED' && data.status !== 'RETURNED'
                && data.itemReturnStatus && data.itemReturnStatus !== 'NONE') return 'RETURNED';
            return data.status;
        }

        // DOM
        function azFindRowCellByOrderNumber(orderNumber) {
            const link = document.querySelector(`a[href*="orderd.php?idt=${orderNumber}"]`);
            if (link) return link;
            for (const el of document.querySelectorAll('td a, td')) {
                if (el.children.length === 0 && el.textContent.trim() === orderNumber) return el;
            }
            return null;
        }

        function azInjectHighlightStyle() {
            const style = document.createElement('style');
            style.textContent = `tr.az-problem td { background-color: ${AZ_HIGHLIGHT_COLOR} !important; }`;
            document.head.appendChild(style);
        }

        function azRenderStatus(anchorEl, status) {
            if (anchorEl.dataset.allegroStatus) return;
            anchorEl.dataset.allegroStatus = '1';

            const info = AZ_STATUS_INFO[status] || AZ_DEFAULT_INFO;

            const wrapper = document.createElement('span');
            wrapper.style.display = 'block';
            wrapper.style.marginTop = '2px';
            wrapper.style.whiteSpace = 'nowrap';
            wrapper.textContent = info.wrap ? `${info.icon} ${info.text} ${info.icon}` : info.icon;
            anchorEl.insertAdjacentElement('afterend', wrapper);

            if (info.wrap) {
                const row = anchorEl.closest('tr');
                if (row) row.classList.add('az-problem');
            }
        }

        function azProcessListData(listData) {
            const orders = azExtractAllegroOrders(listData);
            if (orders.length === 0) return;

            const pending = new Map(orders.map(o => [o.orderNumber, o.uuid]));

            function tryRenderAll() {
                for (const [orderNumber, uuid] of pending.entries()) {
                    const cell = azFindRowCellByOrderNumber(orderNumber);
                    if (!cell) continue;
                    pending.delete(orderNumber);

                    azEnqueue(() => azFetchAllegroStatus(uuid))
                        .then((status) => {
                            azRenderStatus(cell, status);
                        })
                        .catch((e) => console.error('[allegro-zwroty] blad pobierania statusu dla', orderNumber, e));
                }
            }

            tryRenderAll();
            if (pending.size === 0) return;

            const observer = new MutationObserver(() => {
                tryRenderAll();
                if (pending.size === 0) { observer.disconnect(); clearInterval(poll); }
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });

            const poll = setInterval(() => {
                tryRenderAll();
                if (pending.size === 0) { observer.disconnect(); clearInterval(poll); }
            }, 1000);

            setTimeout(() => { observer.disconnect(); clearInterval(poll); }, AZ_ROW_WAIT_TIMEOUT_MS);
        }

        function azInstallHooks() {
            const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

            const X = win.XMLHttpRequest;
            const origOpen = X.prototype.open;
            const origSend = X.prototype.send;
            X.prototype.open = function (method, openUrl, ...rest) {
                this.__azUrl = openUrl;
                return origOpen.call(this, method, openUrl, ...rest);
            };
            X.prototype.send = function (...args) {
                if (this.__azUrl && String(this.__azUrl).includes('orders-list-data.php')) {
                    this.addEventListener('load', function () {
                        try { azProcessListData(JSON.parse(this.responseText)); }
                        catch (e) { console.error('[allegro-zwroty] blad parsowania odpowiedzi XHR', e); }
                    });
                }
                return origSend.apply(this, args);
            };

            const origFetch = win.fetch;
            if (origFetch) {
                win.fetch = function (input, init) {
                    const fetchUrl = typeof input === 'string' ? input : input && input.url;
                    const p = origFetch.apply(this, arguments);
                    if (fetchUrl && fetchUrl.includes('orders-list-data.php')) {
                        p.then((res) => res.clone().json()).then(azProcessListData).catch(() => {});
                    }
                    return p;
                };
            }
        }

        azInstallHooks();
        azInjectHighlightStyle();
    }

    // ════════════════════════════════════════════════════════════════════════
    // STATUSY W PASKU BOCZNYM (sekcja „Statusy” z licznikami zamówień)
    // ════════════════════════════════════════════════════════════════════════

    if (window.self === window.top && url.includes('/panel/') && !url.includes('/panel/app/client-deliveryaddress.php')) {
        const tmStatusyStart = () => {
        (function () {
          'use strict';

          // ---------- storage ----------
          const HOST = location.host;
          const K = (k) => `${HOST}:${k}`;
          const load = (k, d) => {
            try { const v = GM_getValue(K(k)); return v === undefined ? d : JSON.parse(v); } catch (e) { return d; }
          };
          const save = (k, v) => { try { GM_setValue(K(k), JSON.stringify(v)); } catch (e) { /* ignore */ } };

          const DEFAULT_SELECTED = ['wn', 'n', 'o', 'b', 'p', 'w'];
          const STATUS_TTL = 24 * 3600 * 1000;
          const PANEL_CONCURRENCY = 2;   // ciężkie zapytania panelu
          const API_CONCURRENCY = 3;     // lekkie zapytania Admin API
          const API_URL = '/api/admin/v8/orders/orders/search';

          // Kod statusu w panelu -> status w Admin API (orders/orders/search, pole ordersStatuses).
          // Kody bez odpowiednika (br, z, l, r, wd, wp, wr, wn) i podstatusy (np. b-110) liczone są przez panel.
          const API_STATUS = {
            n: 'new', o: 'on_order', b: 'packed', p: 'ready', w: 'payment_waiting',
            d: 'delivery_waiting', h: 'suspended', t: 'finished', j: 'joined',
            k: 'canceled', i: 'false', s: 'lost', a: 'finished_ext',
          };

          // „* wszystkie nieobsłużone” (wn) = n+o+b+br+p+w+d+h+wp(+wd+wr) – sprawdzone na sumach z panelu.
          // Statusy z odpowiednikiem w API liczone jednym zapytaniem, reszta (zwykle kilka zamówień) przez panel.
          const WN_API = ['new', 'on_order', 'packed', 'ready', 'payment_waiting', 'delivery_waiting', 'suspended'];
          const WN_PANEL = ['br', 'wp', 'wd', 'wr'];
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
          const viaApi = (code) => !CUSTOM[code] && !!(API_STATUS[code] || code === 'wn');

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

          let statuses = load('statuses', null);      // {ts, list:[{code,name,sub,parent}], views:[{id,name}]}
          let selected = load('selected', DEFAULT_SELECTED);
          // jednorazowo dodaj „Gotowe do odbioru” pod „Gotowe”
          if (!load('addedPOdb', false) && !selected.includes('p_odb')) {
            const i = selected.indexOf('p');
            selected = selected.slice();
            selected.splice(i >= 0 ? i + 1 : selected.length, 0, 'p_odb');
            save('selected', selected);
          }
          save('addedPOdb', true);
          let counts = load('counts', {});            // {code: n}
          let countView = load('view', '');            // '' = domyślny widok użytkownika
          let apiKey = load('apiKey', '');             // klucz Admin API (opcjonalny, wpisuje użytkownik)
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
            #tm-statusy .--title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
            #tm-statusy.tm-collapsed .tm-hdr span:first-child,
            #tm-statusy.tm-collapsed .--title,
            #tm-statusy.tm-collapsed .tm-badge{display:none}
            #tm-statusy.tm-collapsed .tm-hdr{justify-content:center;padding-left:0;padding-right:0}
            #tm-statusy.tm-collapsed .tm-gear{margin-left:0}

            .tm-ov{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:2147483000;display:flex;align-items:center;justify-content:center;font-family:inherit}
            .tm-md{background:#fff;color:#1f1f22;border-radius:10px;width:380px;max-width:calc(100vw - 32px);max-height:calc(100vh - 64px);display:flex;flex-direction:column;box-shadow:0 10px 40px rgba(0,0,0,.3);font-size:13px}
            .tm-md-h{display:flex;align-items:center;padding:14px 16px 8px;font-size:15px;font-weight:600}
            .tm-md-h .tm-x{margin-left:auto;cursor:pointer;font-size:20px;opacity:.6}
            .tm-md-h .tm-x:hover{opacity:1}
            .tm-md input.tm-search{margin:0 16px 8px;padding:7px 10px;border:1px solid #d6d6db;border-radius:6px;font:inherit}
            .tm-md input.tm-key{padding:6px 8px;border:1px solid #d6d6db;border-radius:6px;font:inherit;-webkit-text-security:disc;text-security:disc}
            .tm-md-list{overflow:auto;padding:0 16px;flex:1;min-height:120px}
            .tm-md-list label{display:flex;align-items:center;gap:8px;padding:4px 0;cursor:pointer}
            .tm-md-list label.tm-sub{padding-left:22px;color:#555}
            .tm-md-list label code{margin-left:auto;font-size:11px;color:#999}
            .tm-md-f{border-top:1px solid #eee;padding:10px 16px 14px;display:flex;flex-direction:column;gap:10px}
            .tm-row{display:flex;align-items:center;gap:8px}
            .tm-row select{margin-left:auto;padding:5px 8px;border:1px solid #d6d6db;border-radius:6px;font:inherit;max-width:200px}
            .tm-hint{font-size:11px;color:#888}
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
            const vs = doc.querySelector('select[name="view"]');
            const views = vs ? [...vs.options].map((o) => ({ id: o.value, name: o.textContent.trim() })) : [];
            statuses = { ts: Date.now(), list, views };
            save('statuses', statuses);
            return statuses;
          }

          async function fetchCountApi(apiStatus, key) {
            const r = await fetch(API_URL, {
              method: 'POST',
              credentials: 'omit',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-API-KEY': key },
              body: JSON.stringify({ params: { ordersStatuses: [].concat(apiStatus), resultsPage: 0, resultsLimit: 1 } }),
            });
            let j = null;
            try { j = await r.json(); } catch (e) { /* brak JSON */ }
            if (!r.ok && !(r.status === 404 && j && j.errors)) {
              throw new Error('API HTTP ' + r.status + (r.status === 429 ? ' (limit zapytań)' : r.status === 401 || r.status === 403 ? ' (klucz)' : ''));
            }
            if (!j) throw new Error('API: pusta odpowiedź');
            const n = parseInt(j.resultsNumberAll, 10);
            if (isNaN(n)) {
              const fs = j.errors && (j.errors.faultString || j.errors.faultCode);
              // brak wyników bywa zgłaszany jako błąd "brak danych" – traktuj jako 0
              if (j.errors && (String(j.errors.faultCode) === '2' || /no results|brak|not found|nie znaleziono/i.test(String(fs)))) return 0;
              throw new Error('API: ' + (fs || 'brak resultsNumberAll'));
            }
            return n;
          }

          // Zwraca {n, src, ms, note}; przy błędzie API automatycznie liczy przez panel.
          async function fetchCount(code) {
            const t0 = performance.now();
            const apiStatus = CUSTOM[code] ? null : API_STATUS[code];
            let note = '';
            if (apiKey && code === 'wn') {
              try {
                const parts = await Promise.all([
                  fetchCountApi(WN_API, apiKey),
                  ...WN_PANEL.map((c) => fetchCountPanel(c)),
                ]);
                return { n: parts.reduce((s, x) => s + x, 0), src: 'API + panel (' + WN_PANEL.join(', ') + ')', ms: Math.round(performance.now() - t0) };
              } catch (e) {
                note = e.message || String(e);
              }
            } else if (apiKey && apiStatus) {
              try {
                const n = await fetchCountApi(apiStatus, apiKey);
                return { n, src: 'API', ms: Math.round(performance.now() - t0) };
              } catch (e) {
                note = e.message || String(e);
              }
            }
            const t1 = performance.now();
            const n = await fetchCountPanel(code);
            return { n, src: 'panel', ms: Math.round(performance.now() - t1), note };
          }

          async function fetchCountPanel(code) {
            const q = CUSTOM[code] ? CUSTOM[code].query : { status: code };
            let body = 'action=ajax&page=1&' + new URLSearchParams(q).toString();
            if (countView) body += '&view=' + encodeURIComponent(countView);
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

          async function refreshCounts(codes) {
            const todo = codes.filter((c) => !fresh[c]);
            const useApi = (c) => !!(apiKey && viaApi(c));
            const apiQ = todo.filter(useApi);
            const panelQ = todo.filter((c) => !useApi(c));
            const worker = (queue) => async () => {
              while (queue.length) {
                const c = queue.shift();
                try {
                  const res = await fetchCount(c);
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
              ...Array.from({ length: API_CONCURRENCY }, worker(apiQ)),
              ...Array.from({ length: PANEL_CONCURRENCY }, worker(panelQ)),
            ]);
          }

          // ---------- helpers ----------
          const statusByCode = (c) => (statuses && statuses.list.find((s) => s.code === c)) || null;
          const labelOf = (c) => { if (CUSTOM[c]) return CUSTOM[c].name; const s = statusByCode(c); return s ? s.name : c; };
          const titleOf = (c) => { if (CUSTOM[c]) return CUSTOM[c].name; const s = statusByCode(c); return s ? (s.sub ? `${s.parent} › ${s.name}` : s.name) : c; };

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
            const active = currentStatus();
            section.innerHTML = '';

            const hdr = document.createElement('div');
            hdr.className = cls.hdr + ' tm-hdr';
            hdr.innerHTML = `<span>Statusy</span><span class="material-symbols-outlined notranslate tm-gear" title="Wybierz widoczne statusy">settings</span>`;
            hdr.querySelector('.tm-gear').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openSettings(); });
            wireSectionDrag(hdr);
            section.appendChild(hdr);

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
              a.href = CUSTOM[code] ? CUSTOM[code].href : '/panel/app/orders-list.php?status=' + encodeURIComponent(code);
              a.dataset.code = code;
              a.draggable = false;
              a.title = titleOf(code);
              a.innerHTML =
                `<span class="${cls.icon}">label</span>` +
                `<span class="--title mr-auto"></span>` +
                `<span class="${cls.badge} tm-badge"></span>`;
              a.querySelector('.--title').textContent = labelOf(code);
              const col = colorOf(code);
              if (col) {
                const ic = a.querySelector('.--icon');
                ic.style.color = col;
                ic.style.fontVariationSettings = "'FILL' 1"; // wypełniona etykieta w kolorze statusu
              }
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
              const info = m ? `Źródło: ${m.src}, ${m.ms} ms` + (m.note ? ` (API nie zadziałało: ${m.note})` : '') : '';
              b.title = fresh[code] ? info : 'Ostatnia znana wartość – trwa pobieranie';
              if (info) a.title += ' – ' + info;
            } else {
              b.textContent = '…';
              b.title = 'Trwa pobieranie';
            }
          }

          function updateActive() {
            if (!section || !cls) return;
            const active = currentStatus();
            section.querySelectorAll('a.tm-item').forEach((a) => {
              const want = (a.dataset.code === active ? cls.active : cls.item) + ' tm-item';
              if (a.className.replace(/\s*tm-(lift|settle)/g, '') !== want) a.className = want;
            });
          }

          // ---------- przeciąganie: cały wiersz jedzie za kursorem, pozostałe płynnie robią miejsce ----------
          // Dopóki ruch < 5 px, to zwykły klik (link do statusu).
          let dragCode = null;
          let justDragged = false;

          function wireDrag(a) {
            a.addEventListener('pointerdown', (e) => {
              if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) return;
              const items = [...section.querySelectorAll('a.tm-item')];
              const i = items.indexOf(a);
              if (items.length < 2 || i < 0) return;
              e.preventDefault();
              const tops = items.map((x) => x.getBoundingClientRect().top);
              const step = tops[1] - tops[0];
              const minDy = tops[0] - tops[i];
              const maxDy = tops[items.length - 1] - tops[i];
              const y0 = e.clientY;
              let dragging = false;
              let to = i;

              const place = (n) => items.forEach((x, j) => {
                if (j === i) return;
                const shift = (i < n && j > i && j <= n) ? -step : (n < i && j >= n && j < i) ? step : 0;
                x.style.transform = shift ? `translateY(${shift}px)` : '';
              });
              const finish = () => {
                window.removeEventListener('pointermove', onMove, true);
                window.removeEventListener('pointerup', onUp, true);
                window.removeEventListener('pointercancel', cancel, true);
                window.removeEventListener('keydown', onKey, true);
                section.classList.remove('tm-sorting');
                dragCode = null;
              };
              const cancel = () => {
                finish();
                a.classList.remove('tm-lift');
                items.forEach((x) => { x.style.transform = ''; });
              };
              const onKey = (ev) => { if (ev.key === 'Escape' && dragging) { ev.stopPropagation(); cancel(); } };
              const onMove = (ev) => {
                const dy = ev.clientY - y0;
                if (!dragging) {
                  if (Math.abs(dy) < 5) return;
                  dragging = true;
                  dragCode = a.dataset.code;
                  // tło paska pod uniesionym wierszem, żeby nie prześwitywały sąsiednie
                  for (let x = section; x; x = x.parentElement) {
                    const bg = getComputedStyle(x).backgroundColor;
                    if (bg && bg !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(bg)) { a.style.setProperty('--tm-lift-bg', bg); break; }
                  }
                  a.classList.add('tm-lift');
                  section.classList.add('tm-sorting');
                  window.addEventListener('keydown', onKey, true);
                }
                const d = Math.max(minDy, Math.min(maxDy, dy));
                a.style.transform = `translateY(${d}px)`;
                const n = Math.max(0, Math.min(items.length - 1, Math.round(i + d / step)));
                if (n !== to) { to = n; place(to); }
              };
              const onUp = (ev) => {
                if (!dragging && Math.abs(ev.clientY - y0) >= 5) onMove(ev); // szybki ruch bez pośrednich pozycji
                if (!dragging) { finish(); return; }
                finish();
                // puszczenie po przeciągnięciu nie może otworzyć linku
                justDragged = true;
                setTimeout(() => { justDragged = false; }, 150);
                a.classList.remove('tm-lift');
                a.classList.add('tm-settle');
                a.style.transform = `translateY(${(to - i) * step}px)`;
                setTimeout(() => {
                  if (to !== i) {
                    const list = selected.slice();
                    const [moved] = list.splice(i, 1);
                    list.splice(to, 0, moved);
                    selected = list;
                    save('selected', selected);
                  }
                  render();
                }, 160);
              };
              window.addEventListener('pointermove', onMove, true);
              window.addEventListener('pointerup', onUp, true);
              window.addEventListener('pointercancel', cancel, true);
            });
            a.addEventListener('dragstart', (e) => e.preventDefault());
          }

          // click po przeciągnięciu trafia czasem w inny wiersz – blokujemy go na całej sekcji
          document.addEventListener('click', (e) => {
            if (justDragged && section && section.contains(e.target)) { e.preventDefault(); e.stopPropagation(); }
          }, true);

          // ---------- settings modal ----------
          async function openSettings() {
            const ov = document.createElement('div');
            ov.className = 'tm-ov';
            ov.innerHTML = `
              <div class="tm-md" role="dialog" aria-label="Widoczne statusy">
                <div class="tm-md-h">Widoczne statusy<span class="material-symbols-outlined notranslate tm-x" title="Zamknij">close</span></div>
                <input type="search" class="tm-search" name="tm-status-filter" autocomplete="off" data-lpignore="true" data-1p-ignore placeholder="Szukaj statusu">
                <div class="tm-md-list">Ładowanie statusów…</div>
                <div class="tm-md-f">
                  <div class="tm-row"><span>Widok do liczenia</span><select class="tm-view"><option value="">Domyślny (Twój bieżący)</option></select></div>
                  <div class="tm-hint">Widok z mniejszą liczbą kolumn = szybsze liczniki. Nie zmienia widoku listy zamówień.</div>
                  <div class="tm-row"><span>Klucz API</span><input type="text" class="tm-key" name="tm-idosell-api-key" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" data-lpignore="true" data-1p-ignore data-form-type="other" placeholder="opcjonalny" style="margin:0 0 0 auto;flex:1;max-width:200px"></div>
                  <div class="tm-row"><button class="tm-btn tm-check" type="button">Sprawdź klucz</button><span class="tm-hint tm-check-out" style="margin-left:4px"></span></div>
                  <div class="tm-hint">Z kluczem statusy główne liczą się przez Admin API – dużo szybciej. Użyj osobnego klucza tylko z odczytem zamówień. Klucz jest zapisany w Tampermonkey i wysyłany wyłącznie do API tego sklepu.</div>
                  <div class="tm-row">
                    <button class="tm-btn tm-reload" type="button">Odśwież listę statusów</button>
                    <button class="tm-btn tm-primary tm-save" type="button" style="margin-left:auto">Zapisz</button>
                  </div>
                </div>
              </div>`;
            document.body.appendChild(ov);
            const close = () => { ov.remove(); document.removeEventListener('keydown', onKey, true); };
            const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
            document.addEventListener('keydown', onKey, true);
            ov.addEventListener('mousedown', (e) => { if (e.target === ov) close(); });
            ov.querySelector('.tm-x').addEventListener('click', close);

            const listEl = ov.querySelector('.tm-md-list');
            const search = ov.querySelector('.tm-search');
            const viewSel = ov.querySelector('.tm-view');
            const keyIn = ov.querySelector('.tm-key');
            const checkOut = ov.querySelector('.tm-check-out');
            keyIn.value = apiKey;
            ov.querySelector('.tm-check').addEventListener('click', async () => {
              const k = keyIn.value.trim();
              if (!k) { checkOut.textContent = 'Wpisz klucz'; return; }
              checkOut.textContent = 'Sprawdzam…';
              const t0 = performance.now();
              try {
                const n = await fetchCountApi('new', k);
                checkOut.textContent = `OK – nieobsłużone: ${n}, ${Math.round(performance.now() - t0)} ms`;
              } catch (e) {
                checkOut.textContent = 'Błąd: ' + (e.message || e);
              }
            });
            let checked = new Set(selected);

            const fill = () => {
              listEl.innerHTML = '';
              const extra = Object.keys(CUSTOM)
                .filter((c) => !statuses.list.some((s) => s.code === c))
                .map((c) => ({ code: c, name: CUSTOM[c].name, sub: false, parent: '' }));
              extra.concat(statuses.list).forEach((s) => {
                const name = CUSTOM[s.code] ? CUSTOM[s.code].name : s.name;
                const l = document.createElement('label');
                if (s.sub) l.className = 'tm-sub';
                l.dataset.q = (name + ' ' + s.parent + ' ' + s.code).toLowerCase();
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.checked = checked.has(s.code);
                cb.addEventListener('change', () => { cb.checked ? checked.add(s.code) : checked.delete(s.code); });
                const t = document.createElement('span');
                t.textContent = name;
                const c = document.createElement('code');
                c.textContent = s.code;
                l.append(cb, t, c);
                listEl.appendChild(l);
              });
              viewSel.length = 1;
              (statuses.views || []).forEach((v) => {
                const o = document.createElement('option');
                o.value = v.id; o.textContent = v.name;
                viewSel.appendChild(o);
              });
              viewSel.value = countView || '';
              applyFilter();
            };
            const applyFilter = () => {
              const q = search.value.trim().toLowerCase();
              listEl.querySelectorAll('label').forEach((l) => { l.style.display = !q || l.dataset.q.includes(q) ? '' : 'none'; });
            };
            search.addEventListener('input', applyFilter);

            ov.querySelector('.tm-reload').addEventListener('click', async () => {
              listEl.textContent = 'Ładowanie statusów…';
              try { await fetchStatuses(true); fill(); render(); } catch (e) { listEl.textContent = 'Nie udało się pobrać statusów: ' + e.message; }
            });

            ov.querySelector('.tm-save').addEventListener('click', () => {
              // zachowaj dotychczasową kolejność, nowe dopisz na końcu w kolejności IdoSell
              const order = Object.keys(CUSTOM).concat(statuses.list.map((s) => s.code));
              const kept = selected.filter((c) => checked.has(c));
              const added = order.filter((c) => checked.has(c) && !kept.includes(c));
              selected = kept.concat(added);
              save('selected', selected);
              const newView = viewSel.value;
              if (newView !== countView) {
                countView = newView;
                save('view', countView);
              }
              const newKey = keyIn.value.trim();
              if (newKey !== apiKey) {
                apiKey = newKey;
                save('apiKey', apiKey);
                Object.keys(fresh).forEach((c) => { if (viaApi(c)) delete fresh[c]; }); // przelicz przez nowe źródło
              }
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
            if (!fetchStarted) {
              fetchStarted = true;
              fetchStatuses(false).then(render).catch(() => {}).finally(() => refreshCounts(selected));
            }
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
        })();
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
