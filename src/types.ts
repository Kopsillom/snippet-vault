export type SnippetType = 'text' | 'code' | 'link' | 'contact';

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface Snippet {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  type: SnippetType;
  createdAt: number;
}
