export interface AccountBalance {
  accountNumber: string;
  balance: number;
  currency: string;
  lastUpdated: string;
}

export interface AccountInfo {
  accountNumber: string;
  balance: number;
  currency: string;
  accountHolder: string;
  accountType: string;
  createdAt: string;
  status: string;
}

export interface RecentOperationsResponse {
  operations: any[];
  totalCount: number;
}
