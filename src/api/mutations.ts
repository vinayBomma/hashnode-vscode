import { GraphQLClient, gql } from "graphql-request";
import { PostBlog, PostData } from "../types/Blog";
const apiEndpoint = "https://gql.hashnode.com";

export const postBlog = async (input: PostBlog, token: string) => {
  const graphQLClient = new GraphQLClient(apiEndpoint, {
    headers: {
      authorization: token,
    },
  });

  const mutation = gql`
    mutation PublishPost($input: PublishPostInput!) {
      publishPost(input: $input) {
        post {
          id
          title
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
  `;

  try {
    const data: PostData = await graphQLClient.request(mutation, { input });
    return data?.publishPost?.post;
  } catch (err) {
    console.log("Errata: ", err);
  }
};
