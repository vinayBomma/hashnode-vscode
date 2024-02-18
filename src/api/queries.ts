import { GraphQLClient, gql } from "graphql-request";
import { AuthUser } from "../types/Blog";
import { saveData } from "../utilities/globalState";
import * as vscode from "vscode";

const apiEndpoint = "https://gql.hashnode.com";

export const getAuthUser = async (
  context: vscode.ExtensionContext,
  token: any
) => {
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
          nodes {
            id
            title
            views
            readTimeInMinutes
            content {
              html
              markdown
            }
            coverImage {
              url
            }
            publication {
              id
            }
          }
        }
      }
    }
  `;

  try {
    const data: AuthUser = await graphQLClient.request(query);
    saveData(context, "publicationId", data.me.posts.nodes[0].publication.id);
    return data.me.posts;
  } catch (err) {
    console.log("err: ", err);
  }
};
