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
