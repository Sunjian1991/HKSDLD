export interface Category {
  id: string;
  name: string;
}

export interface Equipment {
  id: string;
  name: string;
  attributes: string[];
}

export interface Rune {
  id: string;
  name: string;
  categoryId: string;
}

export interface Hero {
  id: string;
  name: string;
  alias?: string;
  title?: string;
  categoryId: string;
}

export interface Build {
  id: string;
  name: string;
  heroCategoryId: string;
  runeIds: string[];
  equipmentIds: string[];
}