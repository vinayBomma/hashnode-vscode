import { GraphQLClient, gql } from "graphql-request";
import { AuthUser, Post } from "../types/Blog";

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
    // .then((res) => {
    //   console.log("res: ", res);
    //   // return { res };
    //   return data.arg1.posts;
    return data.me.posts;
    // })
  } catch (err) {
    console.log(err);
    // console.log("errarta: ", err?.response?.errors[0]?.message);
    // return {
    //   message:
    //     "Invalid Access Token. Please verify your token and try again.",
    // };
    // return data.arg1.posts;
  }
};
