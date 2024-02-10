export type AuthUser = {
  me: {
    name: string;
    posts: {
      totalDocuments: number;
      nodes: Post[];
    };
  };
};

export type Post = {
  id: string;
  title: string;
  content: {
    html: any;
    markdown: string;
  };
  coverImage: {
    url: string;
  };
  publication: {
    id: string;
  };
};

export type NewPost = {
  id: string;
  title: string;
  content: string;
};

export type PostBlog = {
  title: string;
  contentMarkdown: string;
  publicationId: string;
  coAuthors: string[];
  tags: {}[];
};

export type AuthError<T = any> = {
  response: {
    data: T;
    errors: Message[];
  };
};

export type Message = {
  message: string;
};
