const LOCAL_IP = "192.168.1.2";
const VPN_BASE = "files.cuscus-gorgon.ts.net";

const currentHost = window.location.hostname;
const isVPN = currentHost.includes("ts.net");
const baseAddr = isVPN ? VPN_BASE : LOCAL_IP;

// UI Update
const statusEl = document.getElementById('network-status');
statusEl.innerText = isVPN ? "🔗 Connexió via Tailscale VPN" : "🏠 Connexió via Xarxa Local";

// Load link definitions from JSON and build cards
async function initLinks() {
    try {
        const resp = await fetch('links.json');
        const links = await resp.json();
        const container = document.querySelector('.container');

        links.forEach(link => {
            const card = document.createElement('a');
            card.href = '#';
            card.target = '_blank';
            card.className = 'card';
            card.setAttribute('data-service', link.name);
            card.setAttribute('data-port', link.port);
            if (link.protocol) card.setAttribute('data-protocol', link.protocol);

            card.innerHTML = `
                <div class="status-indicator"></div>
                <i class="${link.icon || 'fas fa-link'}"></i>
                <h3>${link.name}</h3>
                <span>${link.description || ''}</span>
            `;
            container.appendChild(card);
        });

        document.querySelectorAll('.card').forEach(async (card) => {
            // skip cards that don't represent a service (e.g. shutdown button)
            const indicator = card.querySelector('.status-indicator');
            if (!indicator) return;

            const port = card.getAttribute('data-port');
            let protocol = card.getAttribute('data-protocol');
            if (!protocol) protocol = (port === "9443") ? "https" : "http";
            const targetUrl = `${protocol}://${baseAddr}:${port}`;
            card.href = targetUrl;

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                await fetch(targetUrl, { mode: 'no-cors', signal: controller.signal });
                indicator.classList.remove('status-checking');
                indicator.classList.add('status-online');
            } catch (err) {
                indicator.classList.remove('status-checking');
                indicator.classList.add('status-offline');
                console.log(`${card.getAttribute('data-service')} is unreachable.`);
            }
        });
    } catch (err) {
        console.error('Failed to load links.json', err);
    }
}

initLinks();

// fetch server status and render overview (generic table)
async function initServerOverview() {
    const container = document.getElementById('server-overview');
    if (!container) return;
    try {
        const resp = await fetch(`http://${baseAddr}:9999/status`); // GET request
        if (!resp.ok) {
            const text = await resp.text();
            throw new Error('status request failed: ' + resp.status + ' ' + text);
        }
        // read body once and attempt to parse
        const text = await resp.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseErr) {
            console.error('invalid JSON from status endpoint:', text);
            throw parseErr;
        }

        // build table dynamically based on keys/values in data
        const table = document.createElement('table');
        table.className = 'overview-table';

        Object.entries(data).forEach(([key, value]) => {
            const row = document.createElement('tr');
            const cellKey = document.createElement('td');
            // humanize the key: snake_case -> Title Case, remove underscores
            const human = key
                .replace(/_/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase());
            cellKey.textContent = human;
            const cellVal = document.createElement('td');

            // pretty-print objects/arrays recursively
            function renderValue(val) {
                if (typeof val === 'object' && val !== null) {
                    // build a nested table for objects/arrays
                    const subTable = document.createElement('table');
                    subTable.style.borderCollapse = 'collapse';
                    Object.entries(val).forEach(([k, v]) => {
                        const subRow = document.createElement('tr');
                        const subKey = document.createElement('td');
                        subKey.textContent = k;
                        subKey.style.padding = '2px 6px';
                        subKey.style.fontWeight = '400';
                        const subVal = document.createElement('td');
                        subVal.style.padding = '2px 6px';
                        if (typeof v === 'object' && v !== null) {
                            subVal.appendChild(renderValue(v));
                        } else {
                            subVal.textContent = String(v);
                        }
                        subRow.appendChild(subKey);
                        subRow.appendChild(subVal);
                        subTable.appendChild(subRow);
                    });
                    return subTable;
                } else {
                    const span = document.createElement('span');
                    span.textContent = String(val);
                    return span;
                }
            }
            const rendered = renderValue(value);
            if (rendered instanceof HTMLElement) {
                cellVal.appendChild(rendered);
            } else {
                cellVal.textContent = String(value);
            }
            row.appendChild(cellKey);
            row.appendChild(cellVal);
            table.appendChild(row);
        });

        container.appendChild(table);
    } catch (err) {
        console.error('could not load server overview', err);
        const msg = document.createElement('div');
        msg.textContent = 'No es pot obtenir informació del servidor';
        container.appendChild(msg);
    }
}

initServerOverview();

// shutdown button logic
const shutdownBtn = document.getElementById('shutdown-btn');
if (shutdownBtn) {
    shutdownBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!confirm('¿Seguro que quieres apagar el servidor?')) return;
        try {
            const resp = await fetch(`http://${baseAddr}:9999/shutdown`, { method: 'POST' });
            if (resp.ok) alert('Comando de apagado enviado');
            else alert('Error al enviar apagado');
        } catch (e) {
            alert('No se pudo contactar con el servidor');
        }
    });
}
