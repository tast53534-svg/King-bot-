// كود طرد البوتات المزعجة ومنع توجيه القنوات
async function antiBotSpam(client, m) {
    // 1. كشف إذا كانت الرسالة "مُعاد توجيهها" أو تحتوي على رابط قناة
    const isForwarded = m.message?.contextInfo?.isForwarded || m.message?.extendedTextMessage?.contextInfo?.isForwarded;
    const hasChannelSource = m.message?.contextInfo?.forwardingScore > 0; // إذا كانت محولة أكثر من مرة
    
    // التحقق من وجود نص "عرض القناة" أو "view channel" (اللي بيظهر في البوتات الغريبة)
    const isChannelAd = m.text?.includes('عرض القناة') || m.text?.includes('View Channel');

    if (isForwarded || isChannelAd) {
        
        // منع حذف رسائل المطور أو الأدمن
        const groupMetadata = await client.groupMetadata(m.chat);
        const isAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;
        if (isAdmin) return; 

        try {
            // 2. حذف الرسالة فوراً
            await client.sendMessage(m.chat, { 
                delete: { 
                    remoteJid: m.chat, 
                    fromMe: false, 
                    id: m.key.id, 
                    participant: m.sender 
                } 
            });

            // 3. طرد "البوت" أو الشخص اللي عمل التوجيه
            await client.groupParticipantsUpdate(m.chat, [m.sender], 'remove');

            return client.sendMessage(m.chat, { 
                text: `🚫 تم طرد @${m.sender.split('@')[0]} وتنظيف الشات من توجيه القنوات.`,
                mentions: [m.sender]
            });

        } catch (err) {
            console.log("خطأ في نظام مكافحة البوتات:", err);
        }
    }
}