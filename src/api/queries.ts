import { GraphQLClient, gql } from "graphql-request";
import { AuthUser } from "../types/Blog";

const apiEndpoint = "https://gql.hashnode.com";

export const getAuthUser = async (token: any) => {
  const graphQLClient = new GraphQLClient(apiEndpoint, {
    headers: {
      authorization: token,
    },
  });

  const query = gql`
    {
      me {
        name
        posts(page: 1, pageSize: 10) {
          totalDocuments
          nodes {
            id
            title
            content {
              html
            }
          }
        }
      }
    }
  `;

  try {
    const data: AuthUser = await graphQLClient.request(query);
    return data.me.posts;
    // })
  } catch (err) {
    console.log(err);
  }
};
