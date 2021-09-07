import 'dotenv/config';
import fetch from 'node-fetch';
import untab from 'untab';

const WH_URL = `https://discordapp.com/api/v8/webhooks/${process.env.WH_ID}/${process.env.WH_TOKEN}?wait=true`;

const BASE_API_URL = 'https://disease.sh/v3/covid-19';
const basicURL = (path) =>
  `${BASE_API_URL}/${path}?yesterday=false&twoDaysAgo=false&strict=true&allowNull=false`;
const vaccineURL = (path) =>
  `${BASE_API_URL}/vaccine/coverage/${path}?lastdays=2&fullData=true`;

const sourceUrl = (path = '') => `https://www.worldometers.info/coronavirus/${path}`;

const pad = (n) => String(n).padStart(2, '0');
const formatDate = (d) =>
  `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

const formatData = (data, vaccineTimeline, source) =>
  untab`
  **Total Cases:** ${data.cases}
  **Total Tests:** ${data.tests}

  **Active Cases:** ${data.active}
  - Today: ${data.todayCases}
  - Critical: ${data.critical}
  **Deaths:** ${data.deaths}
  - Today: ${data.todayDeaths}
  **Recovered:** ${data.recovered}
  - Today: ${data.todayRecovered}
  **Vaccinated:** ${vaccineTimeline[1].total}
  - Today: ${vaccineTimeline[1].daily || vaccineTimeline[0].daily}

  **[Click for more info](${source})**
`.replace(/\d+/g, (n) => parseInt(n).toLocaleString());

(async () => {
  const [globalGeneral, globalVaccine, israelGeneral, israelVaccine] = await Promise.all(
    [
      basicURL('all'),
      vaccineURL(''),
      basicURL('countries/israel'),
      vaccineURL('countries/israel'),
    ].map((e) => fetch(e).then((res) => res.json())),
  );

  console.log('Global General', globalGeneral);
  console.log('Global Vaccine', globalVaccine);
  console.log('Israel General', israelGeneral);
  console.log('Israel Vaccine', israelVaccine);

  const updatedAt = new Date(globalGeneral.updated);
  const embed = {
    title: `Update - ${formatDate(updatedAt)}`,
    type: 'rich',
    timestamp: updatedAt.toISOString(),
    color: 0x00141b,
    footer: { text: `UNIX: ${updatedAt.getTime()}` },
    fields: [
      {
        name: '🇮🇱 Israel',
        value: formatData(
          israelGeneral,
          israelVaccine.timeline,
          sourceUrl('country/israel'),
        ),
        inline: true,
      },
      {
        name: '🗺️ Global',
        value: formatData(globalGeneral, globalVaccine, sourceUrl()),
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
