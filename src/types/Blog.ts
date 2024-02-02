/**
 * Custom type declaration representing a Notepad note.
 */
export type Note = {
  id: string;
  title: string;
  content?: string;
  tags?: string[];
};

export interface AuthUser {
  me: {
    name: string;
    posts: {
      totalDocuments: number;
      nodes: Post[];
    };
  };
}

export interface Post {
  id: string;
  title: string;
  content: {
    html: string;
  };
}
