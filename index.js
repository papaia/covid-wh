const fetch = require('node-fetch');
const { MessageEmbed, WebhookClient } = require('discord.js');
const BASE = 'https://coronavirus-19-api.herokuapp.com';

const pad = (n, c = 2) => String(n).padStart(c, '0');
const formatDate = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${pad(d.getFullYear())}`;
const log = (...lines) => console.log(lines.flat().join('\n'));

(async () => {
  const wh = new WebhookClient(process.env.WH_ID, process.env.WH_TOKEN);

  const [globalInfo, localInfoIL] = await Promise.all([
    fetch(`${BASE}/all`).then((res) => res.json()),
    fetch(`${BASE}/countries/israel`).then((res) => res.json()),
  ]);

  log([
    'Fetched data!',
    `Global: ${JSON.stringify(globalInfo, null, 2)}`,
    `Local (IL): ${JSON.stringify(localInfoIL, null, 2)}`,
  ]);

  const date = new Date();
  const embed = new MessageEmbed()
    .setTitle(`עדכון - ${formatDate(date)}`)
    .setTimestamp(date.getTime())
    .setFooter(`UNIX: ${date.getTime()}`)
    .addField(
      'ישראל',
      [
        `**סכ"ה מקרים:** ${localInfoIL.cases.toLocaleString()}`,
        `**סכ"ה החלימו:** ${localInfoIL.recovered.toLocaleString()}`,
        `**סכ"ה מתים:** ${localInfoIL.deaths.toLocaleString()}`,
        `**סכ"ה בדיקות:** ${localInfoIL.totalTests.toLocaleString()}`,
        `**חולים חדשים (היום):** ${localInfoIL.todayCases.toLocaleString()}`,
      ],
      true
    )
    .addField(
      'גלובאלי',
      [
        `**סכ"ה מקרים:** ${globalInfo.cases.toLocaleString()}`,
        `**סכ"ה החלימו:** ${globalInfo.recovered.toLocaleString()}`,
        `**סכ"ה מתים:** ${globalInfo.deaths.toLocaleString()}`,
      ],
      true
    );

  await wh.send(embed);
  log(`Sent: ${JSON.stringify(embed.toJSON())}`);
  process.exit(0);
})();
