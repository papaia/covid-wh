if (!process.env.WH_ID) require('dotenv/config');
const fetch = require('node-fetch');
const outdent = require('outdent');

const WH_URL = `https://discordapp.com/api/v8/webhooks/${process.env.WH_ID}/${process.env.WH_TOKEN}?wait=true`;

const url = (path) =>
  `https://disease.sh/v3/covid-19/${path}?yesterday=false&twoDaysAgo=false&strict=true&allowNull=false`;
const sourceUrl = (path = '') => `https://www.worldometers.info/coronavirus/${path}`;

const pad = (n) => String(n).padStart(2, '0');
const formatDate = (d) =>
  `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

const formatData = (data, source) => outdent`
  **Total Cases:** ${data.cases.toLocaleString()}
  **Total Tests:** ${data.tests.toLocaleString()}

  **Active Cases:** ${data.active.toLocaleString()}
  - Today: ${data.todayCases.toLocaleString()}
  - Critical: ${data.critical.toLocaleString()}
  **Deaths:** ${data.deaths.toLocaleString()}
  - Today: ${data.todayDeaths.toLocaleString()}
  **Recovered:** ${data.recovered.toLocaleString()}
  - Today: ${data.todayRecovered.toLocaleString()}

  **[Click for more info](${source})**
`;

(async () => {
  const [globalInfo, localInfoIL] = await Promise.all([
    fetch(url('all')).then((res) => res.json()),
    fetch(url('countries/israel')).then((res) => res.json()),
  ]);

  console.log('Global', globalInfo);
  console.log('Local (IL)', localInfoIL);

  const updatedAt = new Date(globalInfo.updated);
  const embed = {
    title: `Update - ${formatDate(updatedAt)}`,
    type: 'rich',
    timestamp: updatedAt.toISOString(),
    color: 0x00141b,
    footer: { text: `UNIX: ${updatedAt.getTime()}` },
    fields: [
      {
        name: 'Israel',
        value: formatData(localInfoIL, sourceUrl('country/israel')),
        inline: true,
      },
      {
        name: 'Global',
        value: formatData(globalInfo, sourceUrl()),
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
