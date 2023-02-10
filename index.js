const axios = require("axios");
const cheerio = require("cheerio");
const Table = require('cli-table');

const fetchData = async () => {
 try {
  const response = await axios.get('https://www.bizbuysell.com/colorado-businesses-for-sale/');
  const html = response.data;

  const $ = cheerio.load(html);

  const data = [];

  $('div > div.col-10.tablet-col-5.mobile-col-6.details').each((_idx, el) => {
    const title = $(el).find('h3').text();
    const price = $(el).find('p.asking-price.ng-star-inserted').text();
    data.push({title, price})
  });

  return data;
} catch (error) {
    throw error;
}
};

fetchData().then((data) => {
  const table = new Table({
    head: ['Index', 'Title', 'Asking Price'],
    colWidths: [10, 50, 20]
  });

  data.forEach((entry, index) => {
    table.push([index + 1, entry.title, entry.price]);
  });

  console.log(table.toString());
});
