(function() {
    'use strict';

    const WAR_ROOM_CONTEXT = 'WarRoom';

    function log(message, meta = null) {
        const timestamp = new Date().toISOString();
        console.log(
            `%c[WAR ROOM]%c ${timestamp} ${message}`,
            'color: #EF4444; font-weight: bold; background: #1E293B; padding: 2px 6px; border-radius: 3px;',
            'color: #94A3B8;'
        );
        if (meta) console.log('  Data:', meta);
    }

    function updateSystemTime() {
        const timeEl = document.getElementById('systemTime');
        if (timeEl) {
            const now = new Date();
            timeEl.textContent = now.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            });
        }
    }

    function updateLastScanTime() {
        const scanEl = document.getElementById('lastScanTime');
        if (scanEl) {
            const now = new Date();
            scanEl.textContent = now.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit'
            });
        }
    }

    function setConnectionStatus(status, text) {
        const statusEl = document.getElementById('connectionStatus');
        if (statusEl) {
            statusEl.className = 'connection-status ' + status;
            statusEl.querySelector('.status-text').textContent = text;
        }
    }

    function updateDefconModule(threatLevel) {
        const defconCard = document.querySelector('.defcon-card');
        const defconBadge = document.getElementById('defconBadge');
        const threatIcon = document.getElementById('threatIcon');
        const threatText = document.getElementById('threatText');
        const threatDescription = document.getElementById('threatDescription');

        defconCard.classList.remove('threat-critical', 'threat-elevated', 'threat-secure');
        threatText.classList.remove('critical', 'elevated', 'secure');
        defconBadge.classList.remove('critical', 'elevated', 'secure');

        const level = (threatLevel || '').toUpperCase();

        switch (level) {
            case 'CRITICAL':
                defconCard.classList.add('threat-critical');
                defconBadge.classList.add('critical');
                defconBadge.textContent = 'CRITICAL';
                threatIcon.textContent = '🔴';
                threatText.textContent = 'HIGH THREAT DETECTED';
                threatText.classList.add('critical');
                threatDescription.textContent = 'Immediate attention required. Competitor activity at dangerous levels.';
                break;
            case 'ELEVATED':
                defconCard.classList.add('threat-elevated');
                defconBadge.classList.add('elevated');
                defconBadge.textContent = 'ELEVATED';
                threatIcon.textContent = '🟡';
                threatText.textContent = 'ELEVATED ACTIVITY';
                threatText.classList.add('elevated');
                threatDescription.textContent = 'Increased competitor movements detected. Monitor closely.';
                break;
            case 'SECURE':
            default:
                defconCard.classList.add('threat-secure');
                defconBadge.classList.add('secure');
                defconBadge.textContent = 'SECURE';
                threatIcon.textContent = '🟢';
                threatText.textContent = 'SYSTEM SECURE';
                threatText.classList.add('secure');
                threatDescription.textContent = 'All systems nominal. No significant competitor threats detected.';
                break;
        }
    }

    function updateAggressionGauge(score) {
        const valueEl = document.getElementById('aggressionValue');
        const barEl = document.getElementById('aggressionBar');
        const descriptionEl = document.getElementById('aggressionDescription');

        const numScore = parseInt(score) || 0;
        const clampedScore = Math.max(0, Math.min(100, numScore));

        valueEl.textContent = clampedScore;
        barEl.style.width = clampedScore + '%';

        valueEl.classList.remove('low', 'medium', 'high');

        if (clampedScore <= 33) {
            valueEl.classList.add('low');
            descriptionEl.textContent = 'Low competitive pressure. Market position stable.';
        } else if (clampedScore <= 66) {
            valueEl.classList.add('medium');
            descriptionEl.textContent = 'Moderate competitor activity. Stay vigilant.';
        } else {
            valueEl.classList.add('high');
            descriptionEl.textContent = 'High aggression detected. Defensive measures recommended.';
        }
    }

    async function fetchIntelligenceData() {
        try {
            log('Fetching intelligence data...');
            
            await SupabaseManager.initialize();
            const client = SupabaseManager.getClient();

            const { data, error } = await client
                .from('intelligence_scores')
                .select('*')
                .limit(1)
                .single();

            if (error) {
                throw error;
            }

            log('Intelligence data received', data);
            return data;
        } catch (error) {
            log('Failed to fetch intelligence data: ' + error.message);
            throw error;
        }
    }

    async function refreshDashboard() {
        try {
            const data = await fetchIntelligenceData();
            
            updateDefconModule(data.threat_level);
            updateAggressionGauge(data.aggression_score);
            updateLastScanTime();
            
            setConnectionStatus('connected', 'LIVE');
            
        } catch (error) {
            console.error('Dashboard refresh failed:', error);
            setConnectionStatus('error', 'OFFLINE');
            
            updateDefconModule('SECURE');
            updateAggressionGauge(0);
        }
    }

    async function init() {
        log('Initializing War Room...');

        updateSystemTime();
        setInterval(updateSystemTime, 1000);

        try {
            await refreshDashboard();
            
            setInterval(refreshDashboard, 30000);
            
            log('War Room initialized successfully');
        } catch (error) {
            log('Initialization error: ' + error.message);
            setConnectionStatus('error', 'ERROR');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
