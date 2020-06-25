if (!process.env.WH_ID) require('dotenv').config();
const fetch = require('node-fetch');
const BASE = 'https://coronavirus-19-api.herokuapp.com';
const WH_URL = `https://discordapp.com/api/webhooks/${process.env.WH_ID}/${process.env.WH_TOKEN}?wait=true`;

const pad = (n, c = 2) => String(n).padStart(c, '0');
const formatDate = (d) =>
  `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${pad(d.getFullYear())}`;
const log = (...lines) => console.log(lines.flat().join('\n'));
const toJSON = (thing) => JSON.stringify(thing, null, 2);

const formatData = (data, tests = true) =>
  [
    `**סה"כ מקרים:** ${data.cases.toLocaleString()}`,
    '',
    `**חולים (כרגע):** ${data.active.toLocaleString()}`,
    `**סה"כ החלימו:** ${data.recovered.toLocaleString()}`,
    `**סה"כ מתים:** ${data.deaths.toLocaleString()}`,
    '',
    `**חולים חדשים (היום):** ${data.todayCases.toLocaleString()}`,
    `**מתים חדשים (היום):** ${data.todayDeaths.toLocaleString()}`,
    tests ? `**סה"כ בדיקות:** ${data.totalTests.toLocaleString()}` : '',
  ].join('\n');

(async () => {
  const [globalInfo, localInfoIL] = await Promise.all([
    fetch(`${BASE}/countries/world`).then((res) => res.json()),
    fetch(`${BASE}/countries/israel`).then((res) => res.json()),
  ]);

  log([
    'Fetched data!',
    `Global: ${toJSON(globalInfo)}`,
    `Local (IL): ${toJSON(localInfoIL)}`,
  ]);

  const date = new Date();
  const embed = {
    title: `עדכון - ${formatDate(date)}`,
    type: 'rich',
    timestamp: date.toISOString(),
    color: 0x3eaf7c,
    footer: { text: `UNIX: ${date.getTime()}` },
    fields: [
      { name: 'ישראל', value: formatData(localInfoIL), inline: true },
      { name: 'גלובאלי', value: formatData(globalInfo, false), inline: true },
    ],
  };
  // const embed = new MessageEmbed()
  //   .setColor(0x3eaf7c)
  //   .setTitle(`עדכון - ${formatDate(date)}`)
  //   .setTimestamp(date.getTime())
  //   .setFooter(`UNIX: ${date.getTime()}`)
  //   .addField('ישראל', formatData(localInfoIL), true)
  //   .addField('גלובאלי', formatData(globalInfo, false), true);

  await fetch(WH_URL, {
    method: 'POST',
    body: JSON.stringify({ embeds: [embed] }),
    headers: { 'Content-Type': 'application/json' },
  });
  // log(`Sent: ${toJSON(embed.toJSON())}`);
  process.exit(0);
})();
