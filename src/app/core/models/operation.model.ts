export interface DocumentDto {
  id: number;
  fileName: string;
  fileType: string;
  uploadedAt: string;
}

export interface Operation {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  amount: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  description: string;
  createdAt: string;
  updatedAt: string;
  accountNumber: string;
  recipientAccountNumber?: string;
  documents?: DocumentDto[];
  justificationDocumentUrl?: string;
}

export interface CreateOperationRequest {
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  amount: number;
  currency: string;
  description: string;
  recipientAccountNumber?: string;
}

export interface OperationResponse {
  id: string;
  type: string;
  amount: number;
  status: string;
  message: string;
}

export interface OperationListResponse {
  operations: Operation[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}
