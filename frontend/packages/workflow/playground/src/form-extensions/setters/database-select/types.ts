export interface Database {
  databaseInfoID: string;
}

export type DatabaseSelectValue = Database[];

export interface DatabaseSelectContextProps {
  changeDatabase: (id: string) => void;
  clearDatabase: () => void;
  readonly?: boolean;
}
