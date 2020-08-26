if (!process.env.WH_ID) require('dotenv').config();
const fetch = require('node-fetch');

const BASE_API_URL = 'https://coronavirus-19-api.herokuapp.com';
const BASE_SOURCE_URL = 'https://www.worldometers.info/coronavirus';
const WH_URL = `https://discordapp.com/api/webhooks/${process.env.WH_ID}/${process.env.WH_TOKEN}?wait=true`;

const pad = (n) => String(n).padStart(2, '0');
const formatDate = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

const formatData = (data, source, includeTests = true) =>
  [
    `**סה"כ מקרים:** ${data.cases.toLocaleString()}`,
    '',
    `**חולים (כרגע):** ${data.active.toLocaleString()}`,
    `**סה"כ החלימו:** ${data.recovered.toLocaleString()}`,
    `**סה"כ מתים:** ${data.deaths.toLocaleString()}`,
    '',
    `**חולים חדשים (היום):** ${data.todayCases.toLocaleString()}`,
    `**מתים חדשים (היום):** ${data.todayDeaths.toLocaleString()}`,
    includeTests ? `**סה"כ בדיקות:** ${data.totalTests.toLocaleString()}` : '',
    `**[לעוד מידע](${source})**`,
  ].join('\n');

(async () => {
  const [globalInfo, localInfoIL] = await Promise.all([
    fetch(`${BASE_API_URL}/countries/world`).then((res) => res.json()),
    fetch(`${BASE_API_URL}/countries/israel`).then((res) => res.json()),
  ]);

  console.log('Global', globalInfo);
  console.log('Local (IL)', localInfoIL);

  const now = new Date();
  const embed = {
    title: `עדכון - ${formatDate(now)}`,
    type: 'rich',
    timestamp: now.toISOString(),
    color: 0x3eaf7c,
    footer: { text: `UNIX: ${now.getTime()}` },
    fields: [
      {
        name: 'ישראל',
        value: formatData(localInfoIL, `${BASE_SOURCE_URL}/country/israel`),
        inline: true,
      },
      {
        name: 'גלובאלי',
        value: formatData(globalInfo, BASE_SOURCE_URL, false),
        inline: true,
      },
    ],
  };

  await fetch(WH_URL, {
    method: 'POST',
    body: JSON.stringify({ username: 'עדכוני קורונה', embeds: [embed] }),
    headers: { 'Content-Type': 'application/json' },
  });

  console.log('Sent!');

  process.exit(0);
})();
