export interface ICommentNodeVO {
  schemaType: string;
  note: string;
  size: {
    width: number;
    height: number;
  };
}

export interface ICommentNodeDTO {
  inputs: {
    schemaType: string;
    note: string;
  };
  size: {
    width: number;
    height: number;
  };
}
