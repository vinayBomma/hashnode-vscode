import { GraphQLClient, gql } from "graphql-request";
import {
  DeleteBlog,
  DeletePost,
  PostBlog,
  PostData,
  UpdatePostData,
} from "../types/Blog";
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
  `;

  try {
    const data: PostData = await graphQLClient.request(mutation, { input });
    return data?.publishPost?.post;
  } catch (err) {
    console.log("err: ", err);
  }
};

export const updateBlog = async (input: PostBlog, token: string) => {
  const graphQLClient = new GraphQLClient(apiEndpoint, {
    headers: {
      authorization: token,
    },
  });

  const mutation = gql`
    mutation UpdatePost($input: UpdatePostInput!) {
      updatePost(input: $input) {
        post {
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
  `;

  try {
    const data: UpdatePostData = await graphQLClient.request(mutation, {
      input,
    });
    return data?.updatePost?.post;
  } catch (err) {
    console.log("err: ", err);
  }
};

export const removeBlog = async (input: DeleteBlog, token: string) => {
  const graphQLClient = new GraphQLClient(apiEndpoint, {
    headers: {
      authorization: token,
    },
  });

  const mutation = gql`
    mutation RemovePost($input: RemovePostInput!) {
      removePost(input: $input) {
        post {
          id
        }
      }
    }
  `;

  try {
    const data: DeletePost = await graphQLClient.request(mutation, {
      input,
    });
    return data.removePost?.post;
  } catch (err) {
    console.log("err: ", err);
  }
};
