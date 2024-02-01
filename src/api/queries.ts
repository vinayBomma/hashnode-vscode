import { GraphQLClient, gql, request } from "graphql-request";

export const getAuthUser = async (token: string) => {
  const apiEndpoint = "https://gql.hashnode.com";
  const graphQLClient = new GraphQLClient(apiEndpoint, {
    headers: {
      authorization: token,
    },
  });

  const query = gql`
    {
      me {
        id
        username
      }
    }
  `;

  const data = await graphQLClient.request(query);
  console.log(data);
  return data;
};
