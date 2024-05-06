import {GraphQLError} from 'graphql';

interface wikiAPIParameters {
  search?: string;
  action: string;
  limit?: string;
  namespace?: string;
  format?: string;
  titles?: string;
  prop?: string;
  exintro?: number;
  exsentences?: string;
  explaintext?: number;
  formatversion?: string;
  redirects?: number;
  pithumbsize?: string;
}

const wikiAPIURL = 'https://en.wikipedia.org/w/api.php';

const wikiAPICall = async (params: wikiAPIParameters): Promise<Response> => {
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

export default wikiAPICall;
