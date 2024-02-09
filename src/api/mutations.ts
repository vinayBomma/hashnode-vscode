import { GraphQLClient, gql } from "graphql-request";
import { Post, PostBlog } from "../types/Blog";
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
        }
      }
    }
  `;

  try {
    const data: Post = await graphQLClient.request(mutation, { input });
    console.log("data: ", data);
  } catch (err) {
    console.log("Errata: ", err);
  }
};
