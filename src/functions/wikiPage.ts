import {GraphQLError} from 'graphql';
const wikiAPIURL = 'https://en.wikipedia.org/w/api.php';

interface wikiAPIParameters {
  search?: string;
  action: string;
  limit?: string;
  namespace?: string;
  format?: string;
  titles?: string;
  prop?: string;
  exsentences?: string;
  explaintext?: number;
  formatversion?: string;
  redirects?: number;
}

const wikiAPI = async (params: wikiAPIParameters): Promise<Response> => {
  let url = wikiAPIURL + '?origin=*';
  Object.keys(params).forEach((key: string) => {
    url += `&${key}=${params[key as keyof typeof params]}`;
  });

  const response = await fetch(url);

  if (!response) {
    console.log('No response from Wikipedia');
    throw new GraphQLError('No response from Wikipedia');
  }

  return response;
};

const wikiPage = async (search: string): Promise<string> => {
  const dataSearch = await (
    await wikiAPI({
      search,
      action: 'opensearch',
      limit: '1',
      namespace: '0',
      format: 'json',
    })
  ).json();

  if (!Array.isArray(dataSearch) || dataSearch[3].length === 0) {
    console.log('No data from Wikipedia');
    throw new GraphQLError('No data from Wikipedia');
  }

  console.log(dataSearch);

  const title = dataSearch[3][0].toString().replace(/.*\//g, '');

  // Now we need to get the page content
  const dataPage = await (
    await wikiAPI({
      titles: title,
      action: 'query',
      prop: 'extracts',
      exsentences: '4',
      explaintext: 1,
      formatversion: '2',
      format: 'json',
      redirects: 1,
    })
  ).json();

  if (!dataPage.query.pages || dataPage.query.pages[0].extract.length === 0) {
    console.log('No data from Wikipedia');
    throw new GraphQLError('No data from Wikipedia');
  } else if (
    dataPage.query.pages[0].extract.replace(/.* may refer to[\s|\S]*/g, '')
      .length === 0
  ) {
    console.log('Disambiguation page');
    throw new GraphQLError('Disambiguation page');
  }

  return dataPage.query.pages[0].extract as string;
};

export default wikiPage;
