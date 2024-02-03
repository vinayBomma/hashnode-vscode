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

  constructor(notesData: Post[]) {
    this.data = notesData.map((note) => new BlogPost(note.id, note.title));
  }

  refresh(notesData: Post[]): void {
    this._onDidChangeTreeData.fire();
    this.data = notesData.map((note) => new BlogPost(note.id, note.title));
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

  constructor(noteId: string, noteTitle: string) {
    super(noteTitle);
    this.id = noteId;
    this.iconPath = new ThemeIcon("note");
    this.command = {
      title: "Open Post",
      command: "hashnode-on-vscode.showPost",
    };
  }
}
