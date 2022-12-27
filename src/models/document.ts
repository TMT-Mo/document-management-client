export interface AwaitSigningResponse {}

export interface PersonalDocResponse {}

export interface SharedDocResponse {}

export interface HistoryResponse {}

export interface CreateDocumentArgs {
  idTemplate: number;
  createdBy: number;
  xfdfString: string;
}

export interface CreateDocumentResponse {
  message: string;
}

export interface GetDocumentsArgs {
  _page?: number;
  _size?: number;
  _sort?: string;
  status_eq?: number;
  createdBy_eq?: number;
  type_eq?: string;
  typeName_eq?: string;
  department_eq?: string;
  isLocked_eq?: boolean;
  documentName_contains?: string;
  signatoryList_contains?: number;
}

interface Signer {
  email: string;
  signature: string;
  status: number;
  roleName: string;
}

export interface Document {
  id: number;
  createdAt: string;
  updateAt: string;
  documentName: string;
  type: string;
  description: string;
  size: number;
  status: number;
  //   typeName: string;
  //   departmentName: string;
  signatoryList: Signer[];
  link: string;
  createdBy: number;
  isLocked: boolean;
  xfdfString: string;
}

export interface DocumentListResponse {
  items: Document[];
  total: number;
  page: number;
  size: number;
}

export interface DocumentFilter {
  value: number | string | boolean;
  field: string;
}

export interface DocumentSorter {
  field: string;
  sort: "asc" | "desc";
}
