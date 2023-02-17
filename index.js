const cheerio = require("cheerio");
const axios = require("axios");
const Table = require('cli-table');
const fs = require("fs");

const fetchDataFromBizBuySell = async (pageNumber) => {
  try {
    const response = await axios.get(`https://www.bizbuysell.com/businesses-for-sale/?page=${pageNumber}`);
    const html = response.data;
    const $ = cheerio.load(html);
    const data = [];

    $('div > div.col-10.tablet-col-5.mobile-col-6.details').each((_idx, el) => {
      const title = $(el).find('h3').text();
      const price = $(el).find('p.asking-price.ng-star-inserted').text();
      data.push({ title, price });
    });

    return data;
  } catch (error) {
    throw error;
  }
};

const fetchDataFromBusinessExits = async (pageNumber) => {
  try {
    const response = await axios.get(`https://businessexits.com/listings/?page=${pageNumber}`);
    const html = response.data;
    const $ = cheerio.load(html);

    const data = [];

    $(".listing_details").each((i, el) => {
      const title = $(el).find(".listing_title").text().trim();
      const price = $(el).find(".listing_price").text().trim();
      data.push({ title, price });
    });

    return data;
  } catch (error) {
    throw error;
  }
};

const mergeData = async () => {
  const bizBuySellData = [];
  const businessExitsData = [];
  const maxResults = 10000;

  let totalResults = 0;
  let pageNumber = 1;

  while (totalResults < maxResults) {
    const bizBuySellPageData = await fetchDataFromBizBuySell(pageNumber);
    console.log(`Fetched ${bizBuySellPageData.length} results from BizBuySell (Page: ${pageNumber})`);
    bizBuySellData.push(...bizBuySellPageData);
    const businessExitsPageData = await fetchDataFromBusinessExits(pageNumber);
    console.log(`Fetched ${businessExitsPageData.length} results from BusinessExits (Page: ${pageNumber})`);
    businessExitsData.push(...businessExitsPageData);
    totalResults = bizBuySellData.length + businessExitsData.length;

    if (bizBuySellPageData.length === 0 && businessExitsPageData.length === 0) {
      break;
    }

    pageNumber += 1;
  }
  console.log(`Total Results Fetched: ${totalResults}`);

  const combinedData = [...bizBuySellData, ...businessExitsData];

  const table = new Table({
    head: ['Index', 'Title', 'Asking Price'],
    colWidths: [10, 50, 20]
    });
    
    combinedData.forEach((entry, index) => {
      console.log("Processing Entry", index + 1);
    table.push([index + 1, entry.title, entry.price]);
    });
    
    console.log(table.toString());
    };
    
    const writeDataToFile = (data) => {
      const filePath = `output-${Date.now()}.txt`;
      const content = data.reduce((acc, entry) => acc + '\n' + "${entry.title} | ${entry.price}", ''); 
    fs.writeFile(filePath, content, (error) => {
    
      if (error) {
    throw error;
    };
    
    console.log(`Data written to ${filePath} successfully`);
    });
    };
    
    
    mergeData()
    .then((data) => writeDataToFile(data))
    .catch((error) => console.error(`Error: ${error}`));  

    
