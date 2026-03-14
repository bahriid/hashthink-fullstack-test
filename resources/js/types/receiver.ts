export interface Currency {
    id: number;
    code: string;
    name: string;
    flag: string;
    is_default: boolean;
}

export interface AccountNumber {
    currency: string;
    number: string;
}

export interface Receiver {
    id: number;
    name: string;
    email: string;
    type: 'individual' | 'business';
    country: string;
    bank_name: string;
    branch_name: string | null;
    swift_bic: string | null;
    account_numbers: AccountNumber[] | null;
}

export interface Transaction {
    id: number;
    receiver_id: number;
    currency_id: number;
    request_id: string;
    type: string;
    subtype: string | null;
    to: string;
    amount: string;
    status: 'pending' | 'approved' | 'cancelled' | 'rejected' | 'success';
    created_at: string;
    currency?: Currency;
    receiver?: Receiver;
}

export interface PaginatedTransactions {
    data: Transaction[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}
