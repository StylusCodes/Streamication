document.getElementById('startMonitoring').addEventListener('click', startMonitoring);

const TWITCH_CLIENT_ID = 'your_twitch_client_id';  // Replace with your Twitch Client ID
const TWITCH_ACCESS_TOKEN = 'your_twitch_access_token';  // Replace with your Twitch Access Token
const DLIVE_API_URL = 'https://graphigo.prd.dlive.tv';

function notify(title, message) {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
        });
    }
}

function logMessage(message) {
    const logs = document.getElementById('logs');
    const logEntry = document.createElement('div');
    logEntry.className = 'log';
    logEntry.textContent = message;
    logs.appendChild(logEntry);
    logs.scrollTop = logs.scrollHeight;
}

function checkTwitchStreamer(streamer) {
    const url = `https://api.twitch.tv/helix/streams?user_login=${streamer}`;
    const headers = {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${TWITCH_ACCESS_TOKEN}`
    };
    fetch(url, { headers })
        .then(response => response.json())
        .then(data => {
            if (data.data && data.data.length > 0) {
                notify('Twitch Alert', `${streamer} is live!`);
                logMessage(`Twitch: ${streamer} is live!`);
            } else {
                logMessage(`Twitch: ${streamer} is offline.`);
            }
        });
}

function checkDliveStreamer(streamer) {
    const query = `
    {
        userByDisplayName(displayname: "${streamer}") {
            live {
                title
            }
        }
    }`;

    const url = `${DLIVE_API_URL}/?query=${encodeURIComponent(query)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.data && data.data.userByDisplayName && data.data.userByDisplayName.live) {
                notify('DLive Alert', `${streamer} is live!`);
                logMessage(`DLive: ${streamer} is live!`);
            } else {
                logMessage(`DLive: ${streamer} is offline.`);
            }
        });
}

function checkAllStreamers(twitchStreamers, dliveStreamers) {
    twitchStreamers.forEach(streamer => checkTwitchStreamer(streamer));
    dliveStreamers.forEach(streamer => checkDliveStreamer(streamer));
}

function startMonitoring() {
    const twitchStreamers = document.getElementById('twitchStreamers').value.split(' ').filter(Boolean);
    const dliveStreamers = document.getElementById('dliveStreamers').value.split(' ').filter(Boolean);

    if (!twitchStreamers.length && !dliveStreamers.length) {
        alert('Please enter at least one streamer.');
        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
            alert('Please enable notifications.');
            return;
        }

        logMessage('Started monitoring streamers!');

        // Initial check
        checkAllStreamers(twitchStreamers, dliveStreamers);

        // Periodic check every 5 minutes
        setInterval(() => {
            checkAllStreamers(twitchStreamers, dliveStreamers);
        }, 300000); // 300,000 milliseconds = 5 minutes
    });
}