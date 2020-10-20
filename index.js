if (!process.env.WH_ID) require('dotenv').config();
const fetch = require('node-fetch');

const BASE_API_URL = 'https://coronavirus-19-api.herokuapp.com';
const BASE_SOURCE_URL = 'https://www.worldometers.info/coronavirus';
const WH_URL = `https://discordapp.com/api/v8/webhooks/${process.env.WH_ID}/${process.env.WH_TOKEN}?wait=true`;

const pad = (n) => String(n).padStart(2, '0');
const formatDate = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

const formatData = (data, source, includeTests = true) =>
  [
    `**Total cases:** ${data.cases.toLocaleString()}`,
    '',
    `**Currently sick:** ${data.active.toLocaleString()}`,
    `**Total recovered:** ${data.recovered.toLocaleString()}`,
    `**Total deaths:** ${data.deaths.toLocaleString()}`,
    '',
    `**New cases (today):** ${data.todayCases.toLocaleString()}`,
    `**New deaths (today):** ${data.todayDeaths.toLocaleString()}`,
    includeTests ? `**Total tests:** ${data.totalTests.toLocaleString()}` : '',
    `**[Click for more info](${source})**`,
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
    title: `Update - ${formatDate(now)}`,
    type: 'rich',
    timestamp: now.toISOString(),
    color: 0x00141b,
    footer: { text: `UNIX: ${now.getTime()}` },
    fields: [
      {
        name: 'Israel',
        value: formatData(localInfoIL, `${BASE_SOURCE_URL}/country/israel`),
        inline: true,
      },
      {
        name: 'Global',
        value: formatData(globalInfo, BASE_SOURCE_URL, false),
        inline: true,
      },
    ],
  };

  await fetch(WH_URL, {
    method: 'POST',
    body: JSON.stringify({
      username: 'COVID Updates',
      avatar_url: 'https://preview.pixlr.com/images/450nwm/1460/2/1460108316.jpg',
      embeds: [embed],
    }),
    headers: { 'Content-Type': 'application/json' },
  });

  console.log('Sent!');

  process.exit(0);
})();
