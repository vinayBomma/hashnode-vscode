import { GraphQLClient, gql } from "graphql-request";

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
        id
        username
        posts(page: 1, pageSize: 5) {
          edges {
            node {
              id
            }
          }
        }
      }
      post(id: "6422c561689cfdac66b627ae") {
        title
        subtitle
        content {
          markdown
          text
        }
      }
    }
  `;

  const data = await graphQLClient
    .request(query)
    .then((res) => {
      console.log("res: ", res);
      return { res };
    })
    .catch((err) => {
      console.log("errarta: ", err?.response?.errors[0]?.message);
      return {
        message:
          "Invalid Access Token. Please verify your token and try again.",
      };
    });
  return data;
};
