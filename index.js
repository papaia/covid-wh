const fetch = require('node-fetch');
const { MessageEmbed, WebhookClient } = require('discord.js');
const BASE = 'https://coronavirus-19-api.herokuapp.com';

const pad = (n, c = 2) => String(n).padStart(c, '0');
const formatDate = (d) =>
  `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${pad(d.getFullYear())}`;
const log = (...lines) => console.log(lines.flat().join('\n'));
const toJSON = (thing) => JSON.stringify(thing, null, 2);

const formatData = (data, tests = true) =>
  [
    `**סה"כ מקרים:** ${data.cases.toLocaleString()}`,
    `**סה"כ החלימו:** ${data.recovered.toLocaleString()}`,
    `**סה"כ מתים:** ${data.deaths.toLocaleString()}`,
    `**חולים חדשים (היום):** ${data.todayCases.toLocaleString()}`,
    tests ? `**סה"כ בדיקות:** ${data.totalTests.toLocaleString()}` : '',
  ].join('\n');

(async () => {
  const wh = new WebhookClient(process.env.WH_ID, process.env.WH_TOKEN);

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
  const embed = new MessageEmbed()
    .setTitle(`עדכון - ${formatDate(date)}`)
    .setTimestamp(date.getTime())
    .setFooter(`UNIX: ${date.getTime()}`)
    .addField('ישראל', formatData(localInfoIL), true)
    .addField('גלובאלי', formatData(globalInfo, false), true);

  await wh.send(embed);
  log(`Sent: ${toJSON(embed.toJSON())}`);
  process.exit(0);
})();
