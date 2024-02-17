import {
  Event,
  EventEmitter,
  ProviderResult,
  ThemeIcon,
  TreeDataProvider,
  TreeItem,
} from "vscode";
import { Post } from "../types/Blog";

type TreeDataOnChangeEvent = BlogPost | undefined | null | void;

export class BlogsDataProvider implements TreeDataProvider<BlogPost> {
  private _onDidChangeTreeData = new EventEmitter<TreeDataOnChangeEvent>();
  readonly onDidChangeTreeData: Event<TreeDataOnChangeEvent> =
    this._onDidChangeTreeData.event;

  data: BlogPost[];

  constructor(blogData: Post[]) {
    this.data = blogData.map(
      (post) => new BlogPost(post.id, post.title, post?.content?.markdown)
    );
  }

  refresh(blogData: Post[]): void {
    this._onDidChangeTreeData.fire();
    this.data = blogData.map(
      (post) => new BlogPost(post.id, post.title, post?.content?.markdown)
    );
  }

  getTreeItem(element: BlogPost): TreeItem | Thenable<TreeItem> {
    return element;
  }

  getChildren(element?: BlogPost | undefined): ProviderResult<BlogPost[]> {
    if (element === undefined) {
      return this.data;
    }
    return element.children;
  }

  getParent() {
    return null;
  }
}

class BlogPost extends TreeItem {
  children?: BlogPost[];

  constructor(postId: string, postTitle: string, postContent: string) {
    super(postTitle);
    this.id = postId;
    this.iconPath = new ThemeIcon("note");
    this.command = {
      title: "Open Post",
      command: "hashnode-on-vscode.showPost",
      arguments: [postContent],
    };
  }
}
