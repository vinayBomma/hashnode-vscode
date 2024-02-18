export type AuthUser = {
  me: {
    name: string;
    posts: {
      totalDocuments: number;
      nodes: Post[];
    };
  };
};

export type PostData = {
  publishPost: {
    post: Post;
  };
};

export type UpdatePostData = {
  updatePost: {
    post: Post;
  };
};

export type Post = {
  id: string;
  title: string;
  content: {
    html: any;
    markdown: string;
  };
  coverImage?: {
    url: string;
  };
  publication: {
    id: string;
  };
  views?: number;
  readTimeInMinutes?: number;
};

export type NewPost = {
  id?: string;
  title: string;
  content: string;
  tags?: string;
};

export type DeletePost = {
  removePost: {
    post: Post;
  };
};

export type DeleteBlog = {
  id: string;
};

export type PostBlog = {
  title: string;
  contentMarkdown: string;
  publicationId: string;
  coAuthors: string[];
  tags: { name: string; slug: string }[];
};
