const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
    const supabase = createClient('https://vflnbvpxxawbnzkwyszm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmbG5idnB4eGF3Ym56a3d5c3ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5ODMwNTQsImV4cCI6MjA1NzU1OTA1NH0.X_KbHhvLQSoIjIp5ulCmuTOyjeSQ1NpRsUgr72Vgsdc');
    const { userId, action, link } = JSON.parse(event.body || '{}');

    if (!userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'User ID လိုအပ်ပါသည်။' })
        };
    }

    try {
        if (action === 'download') {
            // Download မှတ်တမ်းသိမ်းပါ
            const { error } = await supabase
                .from('downloads')
                .insert({ user_id: userId, link: link, downloaded_at: new Date() });
            if (error) throw error;
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Download မှတ်တမ်းသိမ်းပြီးပါပြီ။' })
            };
        } else if (action === 'getDownloads') {
            // Download မှတ်တမ်းများရယူပါ
            const { data, error } = await supabase
                .from('downloads')
                .select('link')
                .eq('user_id', userId);
            if (error) throw error;
            return {
                statusCode: 200,
                body: JSON.stringify({ downloads: data })
            };
        } else {
            // Premium စစ်ဆေးပါ
            const { data, error } = await supabase
                .from('premium_users')
                .select('*')
                .eq('user_id', userId);
            if (error) throw error;

            let response = {
                isPremium: false,
                expiryDate: null
            };

            if (data && data.length > 0 && new Date(data[0].expiry_date) > new Date()) {
                response.isPremium = true;
                response.expiryDate = data[0].expiry_date;
            }

            return {
                statusCode: 200,
                body: JSON.stringify(response)
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'အမှားတစ်ခုဖြစ်ပွားခဲ့သည်: ' + error.message })
        };
    }
};
