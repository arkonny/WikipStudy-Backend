import {GraphQLError} from 'graphql';
import wikiAPICall from './wikiAPICall';

// First we need to search for the page, allowing the user to write a more general search (still quite specific though)
const wikiPage = async (
  search: string,
): Promise<{page: string; imageUrl: string}> => {
  const dataSearch = await (
    await wikiAPICall({
      search,
      action: 'opensearch',
      limit: '1',
      namespace: '0',
      format: 'json',
    })
  ).json();
  console.log('Search data:', dataSearch);

  if (!Array.isArray(dataSearch) || dataSearch[3].length === 0) {
    console.log('No data from Wikipedia :', dataSearch, '\n');
    throw new GraphQLError('No data from Wikipedia');
  }

  let title = dataSearch[3][0].toString().replace(/.*\//g, '');

  // Now we need to get the page content
  const dataPage = await (
    await wikiAPICall({
      titles: title,
      action: 'query',
      prop: 'extracts',
      //exsentences: '5',
      explaintext: 1,
      formatversion: '2',
      format: 'json',
      redirects: 1,
    })
  ).json();

  if (!dataPage.query.pages || dataPage.query.pages[0].extract.length === 0) {
    console.log('No data from Wikipedia on second call');
    throw new GraphQLError('No data from Wikipedia on second call');
  } else if (
    dataPage.query.pages[0].extract.replace(
      /[\s|\S]* may (also )?refer to[\s|\S]*/g,
      '',
    ).length === 0
  ) {
    console.log('Disambiguation page:\n', dataPage.query.pages[0].extract);
    throw new GraphQLError('Disambiguation page');
  }

  title = dataPage.query.pages[0].title;

  const image = await (
    await wikiAPICall({
      titles: title,
      action: 'query',
      prop: 'pageimages',
      format: 'json',
      formatversion: '2',
      pithumbsize: '300',
    })
  ).json();

  let imageUrl = '';
  if (!image.query.pages[0].thumbnail) {
    console.log('No image found');
  } else {
    imageUrl = image.query.pages[0].thumbnail.source as string;
  }

  return {
    page: dataPage.query.pages[0].extract as string,
    imageUrl,
  };
};

export default wikiPage;
