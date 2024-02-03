/**
 * Custom type declaration representing a Notepad note.
 */
export type Note = {
  id: string;
  title: string;
  content?: string | { html: string };
  tags?: string[];
};

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
};

export type NewPost = {
  id: string;
  title: string;
  content: string;
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
