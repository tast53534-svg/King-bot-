const handler = async (m, { conn }) => {
  if (!global.subBots) {
    return m.reply("❌ نظام البوتات الفرعية مش شغال حالياً");
  }

  const list = global.subBots.list();
  const count = list.length;

  if (count === 0) {
    return m.reply("📭 مفيش بوتات فرعية منصبة حالياً");
  }

  await m.reply(`⏳ جاري حذف ${count} بوت فرعي...`);

  try {
    await global.subBots.stopAll();

    for (const bot of list) {
      try {
        await global.subBots.removeByPhone(bot.phone || bot.phoneNumber || bot.id);
      } catch (_) {
        try { await global.subBots.remove(bot.id || bot.uid); } catch (__) {}
      }
    }

    await conn.sendMessage(m.chat, {
      react: { text: "✅", key: m.key }
    });

    await m.reply(`✅ تم حذف ${count} بوت فرعي بنجاح\n\n🗑️ تم مسح جميع الجلسات والبيانات`);

  } catch (e) {
    console.error("delete_subbots error:", e);
    await m.reply(`❌ حصل خطأ: ${e.message}`);
  }
};

handler.command = ["حذف_البوتات", "مسح_البوتات", "deletesubbots", "clearsubbots"];
handler.category = "owner";
handler.owner = true;

export default handler;
