import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyMigration() {
    console.log('='.repeat(60));
    console.log('MIGRATION VERIFICATION SCRIPT');
    console.log('='.repeat(60));
    console.log('');

    console.log('TEST 1: Count intel_events rows');
    console.log('-'.repeat(40));
    try {
        const { count, error } = await supabase
            .from('intel_events')
            .select('*', { count: 'exact', head: true });
        
        if (error) {
            console.log('ERROR:', error.message);
        } else {
            console.log('Total rows in intel_events:', count);
            console.log('Status:', count > 0 ? 'PASS' : 'FAIL (no rows found)');
        }
    } catch (e) {
        console.log('EXCEPTION:', e.message);
    }
    console.log('');

    console.log('TEST 2: Check source_table distribution');
    console.log('-'.repeat(40));
    try {
        const { data, error } = await supabase
            .from('intel_events')
            .select('source_table')
            .limit(100);
        
        if (error) {
            console.log('ERROR:', error.message);
        } else {
            const counts = {};
            data.forEach(row => {
                counts[row.source_table] = (counts[row.source_table] || 0) + 1;
            });
            console.log('Source table distribution (sample of 100):');
            Object.entries(counts).forEach(([table, cnt]) => {
                console.log(`  - ${table}: ${cnt} rows`);
            });
            console.log('Status: PASS');
        }
    } catch (e) {
        console.log('EXCEPTION:', e.message);
    }
    console.log('');

    console.log('TEST 3: Check company_screenshots table');
    console.log('-'.repeat(40));
    try {
        const { data, error, count } = await supabase
            .from('company_screenshots')
            .select('*', { count: 'exact' })
            .limit(1);
        
        if (error) {
            console.log('ERROR:', error.message);
            console.log('Note: Table may not exist yet or is empty');
        } else {
            console.log('company_screenshots row count:', count);
            if (data && data.length > 0) {
                console.log('Sample row:', JSON.stringify(data[0], null, 2));
            }
            console.log('Status:', count > 0 ? 'PASS' : 'TABLE EXISTS (empty)');
        }
    } catch (e) {
        console.log('EXCEPTION:', e.message);
    }
    console.log('');

    console.log('TEST 4: Test get_ad_velocity_stats RPC function');
    console.log('-'.repeat(40));
    try {
        const { data, error } = await supabase.rpc('get_ad_velocity_stats');
        
        if (error) {
            console.log('ERROR:', error.message);
            console.log('Note: RPC function may not be created yet');
        } else {
            console.log('RPC Response:', JSON.stringify(data, null, 2));
            console.log('Status: PASS');
        }
    } catch (e) {
        console.log('EXCEPTION:', e.message);
    }
    console.log('');

    console.log('='.repeat(60));
    console.log('VERIFICATION COMPLETE');
    console.log('='.repeat(60));
}

verifyMigration().catch(console.error);
