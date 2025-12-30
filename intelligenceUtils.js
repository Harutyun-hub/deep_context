const IntelligenceUtils = (function() {
    'use strict';

    const SEVERITY_WEIGHTS = {
        HIGH: 25,
        MEDIUM: 8,
        LOW: 2,
        DEFAULT: 5
    };

    const THREAT_THRESHOLDS = {
        CRITICAL: 71,
        ELEVATED: 31
    };

    async function calculateThreatLevel() {
        try {
            await SupabaseManager.initialize();
            const client = SupabaseManager.getClient();

            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

            const { data, error } = await client
                .from('intel_events')
                .select('severity')
                .gte('created_at', twentyFourHoursAgo);

            if (error) {
                console.warn('[IntelligenceUtils] Failed to fetch intel_events:', error.message);
                return { score: 0, status: 'SECURE', label: 'SYSTEM SECURE' };
            }

            let totalScore = 0;

            if (data && data.length > 0) {
                for (const event of data) {
                    const severity = (event.severity || '').toUpperCase();
                    switch (severity) {
                        case 'HIGH':
                            totalScore += SEVERITY_WEIGHTS.HIGH;
                            break;
                        case 'MEDIUM':
                            totalScore += SEVERITY_WEIGHTS.MEDIUM;
                            break;
                        case 'LOW':
                            totalScore += SEVERITY_WEIGHTS.LOW;
                            break;
                        default:
                            totalScore += SEVERITY_WEIGHTS.DEFAULT;
                            break;
                    }
                }
            }

            const finalScore = Math.min(totalScore, 100);

            let status, label;
            if (finalScore >= THREAT_THRESHOLDS.CRITICAL) {
                status = 'CRITICAL';
                label = 'CRITICAL THREAT';
            } else if (finalScore >= THREAT_THRESHOLDS.ELEVATED) {
                status = 'ELEVATED';
                label = 'ELEVATED ACTIVITY';
            } else {
                status = 'SECURE';
                label = 'SYSTEM SECURE';
            }

            console.log('[IntelligenceUtils] Threat calculated:', { 
                eventsCount: data?.length || 0, 
                totalScore, 
                finalScore, 
                status 
            });

            return { score: finalScore, status, label };

        } catch (error) {
            console.error('[IntelligenceUtils] calculateThreatLevel error:', error);
            return { score: 0, status: 'SECURE', label: 'SYSTEM SECURE' };
        }
    }

    return {
        calculateThreatLevel,
        SEVERITY_WEIGHTS,
        THREAT_THRESHOLDS
    };

})();

if (typeof window !== 'undefined') {
    window.IntelligenceUtils = IntelligenceUtils;
}
