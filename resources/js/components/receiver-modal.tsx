import { useCallback, useEffect, useReducer, useState } from 'react';
import { useEchoPublic } from '@laravel/echo-react';
import { Download, Search, X } from 'lucide-react';
import type { Currency, Receiver, Transaction } from '@/types/receiver';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    receiver: Receiver | null;
    currencies: Currency[];
}

type StatusKey = Transaction['status'];

const STATUS_CONFIG: Record<StatusKey, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
    approved: { label: 'Approved', className: 'bg-green-100 text-green-700' },
    success: { label: 'Success', className: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-600' },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-600' },
};

function formatAmount(amount: string, currencyCode: string): string {
    return `${currencyCode} ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' | ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

type State = {
    selectedCurrencyId: number | null;
    transactions: Transaction[];
    isLoading: boolean;
    search: string;
    onlyActionNeeded: boolean;
    showMore: boolean;
    page: number;
    totalPages: number;
};

type Action =
    | { type: 'SET_CURRENCY'; currencyId: number }
    | { type: 'SET_TRANSACTIONS'; transactions: Transaction[]; total: number; lastPage: number }
    | { type: 'SET_LOADING'; loading: boolean }
    | { type: 'SET_SEARCH'; search: string }
    | { type: 'TOGGLE_ACTION_NEEDED' }
    | { type: 'TOGGLE_SHOW_MORE' }
    | { type: 'SET_PAGE'; page: number }
    | { type: 'UPDATE_STATUS'; id: number; status: StatusKey }
    | { type: 'ADD_TRANSACTION'; transaction: Transaction };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SET_CURRENCY':
            return { ...state, selectedCurrencyId: action.currencyId, page: 1, transactions: [], isLoading: true };
        case 'SET_TRANSACTIONS':
            return { ...state, transactions: action.transactions, isLoading: false, totalPages: action.lastPage };
        case 'SET_LOADING':
            return { ...state, isLoading: action.loading };
        case 'SET_SEARCH':
            return { ...state, search: action.search };
        case 'TOGGLE_ACTION_NEEDED':
            return { ...state, onlyActionNeeded: !state.onlyActionNeeded };
        case 'TOGGLE_SHOW_MORE':
            return { ...state, showMore: !state.showMore };
        case 'SET_PAGE':
            return { ...state, page: action.page, isLoading: true };
        case 'UPDATE_STATUS':
            return {
                ...state,
                transactions: state.transactions.map((t) =>
                    t.id === action.id ? { ...t, status: action.status } : t,
                ),
            };
        case 'ADD_TRANSACTION':
            if (action.transaction.currency_id !== state.selectedCurrencyId) return state;
            return { ...state, transactions: [action.transaction, ...state.transactions] };
        default:
            return state;
    }
}

export function ReceiverModal({ isOpen, onClose, receiver, currencies }: Props) {
    const defaultCurrencyId = currencies.find((c) => c.is_default)?.id ?? currencies[0]?.id ?? null;

    const [state, dispatch] = useReducer(reducer, {
        selectedCurrencyId: defaultCurrencyId,
        transactions: [],
        isLoading: false,
        search: '',
        onlyActionNeeded: false,
        showMore: false,
        page: 1,
        totalPages: 1,
    });

    // Restore last selected currency when modal opens
    const [lastCurrencyId, setLastCurrencyId] = useState<number | null>(defaultCurrencyId);

    useEffect(() => {
        if (isOpen && lastCurrencyId) {
            dispatch({ type: 'SET_CURRENCY', currencyId: lastCurrencyId });
        }
    }, [isOpen]);

    // Fetch transactions when currency or page changes
    useEffect(() => {
        if (!receiver || !state.selectedCurrencyId || !isOpen) return;

        const currency = currencies.find((c) => c.id === state.selectedCurrencyId);
        if (!currency) return;

        dispatch({ type: 'SET_LOADING', loading: true });

        const params = new URLSearchParams({
            receiver_id: String(receiver.id),
            currency_code: currency.code,
            page: String(state.page),
        });

        fetch(`/api/transactions?${params}`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((r) => r.json())
            .then((data) => {
                dispatch({ type: 'SET_TRANSACTIONS', transactions: data.data, total: data.total, lastPage: data.last_page });
            });
    }, [receiver?.id, state.selectedCurrencyId, state.page, isOpen]);

    // Real-time: subscribe to receiver channel for status updates
    useEchoPublic<{ id: number; status: StatusKey }>(
        `receiver.${receiver?.id ?? 0}`,
        '.transaction.status.updated',
        (e) => { dispatch({ type: 'UPDATE_STATUS', id: e.id, status: e.status }); },
        [receiver?.id],
    );

    // Real-time: subscribe for new transactions
    useEchoPublic<Transaction>(
        `receiver.${receiver?.id ?? 0}`,
        '.transaction.created',
        (e) => { dispatch({ type: 'ADD_TRANSACTION', transaction: e }); },
        [receiver?.id],
    );

    const handleCurrencySelect = useCallback(
        (id: number) => {
            dispatch({ type: 'SET_CURRENCY', currencyId: id });
            setLastCurrencyId(id);
        },
        [],
    );

    if (!isOpen || !receiver) return null;

    const selectedCurrency = currencies.find((c) => c.id === state.selectedCurrencyId);

    // Client-side filtering
    const filteredTransactions = state.transactions.filter((tx) => {
        const matchesSearch =
            !state.search ||
            tx.to.toLowerCase().includes(state.search.toLowerCase()) ||
            tx.status.toLowerCase().includes(state.search.toLowerCase());
        const matchesAction = !state.onlyActionNeeded || tx.status === 'pending';
        return matchesSearch && matchesAction;
    });

    const accountForCurrency = receiver.account_numbers?.find(
        (a) => a.currency === selectedCurrency?.code,
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div
                className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 pb-0">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-gray-900">{receiver.name}</h2>
                                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-700">
                                    {receiver.type}
                                </span>
                            </div>
                            <p className="mt-0.5 text-sm text-gray-400">{receiver.email}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Currency Tabs */}
                    <div className="mt-4 flex gap-2">
                        {currencies.map((currency) => {
                            const isSelected = currency.id === state.selectedCurrencyId;
                            const accountNum = receiver.account_numbers?.find((a) => a.currency === currency.code);
                            return (
                                <button
                                    key={currency.id}
                                    onClick={() => handleCurrencySelect(currency.id)}
                                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${
                                        isSelected
                                            ? 'border-yellow-400 bg-white shadow-sm'
                                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                    }`}
                                >
                                    <span className="text-base">{currency.flag}</span>
                                    <span className="font-mono text-xs text-gray-500">
                                        {accountNum?.number ?? '—'}
                                    </span>
                                    <span className="text-xs font-semibold text-gray-700">{currency.code}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Receiver Details */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 px-6 py-4">
                    <div>
                        <p className="flex items-center gap-1 text-xs text-gray-400">
                            <span>🌐</span> Country/Countries
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-gray-800">{receiver.country}</p>
                    </div>
                    <div>
                        <p className="flex items-center gap-1 text-xs text-gray-400">
                            <span>🏦</span> Bank name
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-gray-800">{receiver.bank_name}</p>
                    </div>
                    {state.showMore && (
                        <>
                            <div>
                                <p className="flex items-center gap-1 text-xs text-gray-400">
                                    <span>🏢</span> Branch name
                                </p>
                                <p className="mt-0.5 text-sm font-semibold text-gray-800">
                                    {receiver.branch_name ?? '—'}
                                </p>
                            </div>
                            <div>
                                <p className="flex items-center gap-1 text-xs text-gray-400">
                                    <span>💳</span> Swift/BIC code
                                </p>
                                <p className="mt-0.5 text-sm font-semibold text-gray-800">
                                    {receiver.swift_bic ?? '—'}
                                </p>
                            </div>
                        </>
                    )}
                </div>
                <button
                    onClick={() => dispatch({ type: 'TOGGLE_SHOW_MORE' })}
                    className="px-6 pb-4 text-xs font-medium text-gray-400 hover:text-gray-600"
                >
                    {state.showMore ? '▲ Show Less' : '▼ Show More'}
                </button>

                <hr className="border-gray-100" />

                {/* Transactions Section */}
                <div className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900">
                            Transactions With <span className="text-[#1B3A2A]">{receiver.name.split(' ')[0]}</span>
                        </h3>
                        <button className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100">
                            <Search className="size-4" />
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <input
                            type="text"
                            placeholder="Search by name or status..."
                            value={state.search}
                            onChange={(e) => dispatch({ type: 'SET_SEARCH', search: e.target.value })}
                            className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1B3A2A]"
                        />
                        <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                            Only Action Needed
                            <button
                                role="switch"
                                aria-checked={state.onlyActionNeeded}
                                onClick={() => dispatch({ type: 'TOGGLE_ACTION_NEEDED' })}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                    state.onlyActionNeeded ? 'bg-[#1B3A2A]' : 'bg-gray-200'
                                }`}
                            >
                                <span
                                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                        state.onlyActionNeeded ? 'translate-x-4' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </label>
                    </div>

                    {/* Table */}
                    {state.isLoading ? (
                        <div className="space-y-3 py-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />
                            ))}
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-400">No transactions found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-400">
                                        <th className="pb-3 pr-3">#</th>
                                        <th className="pb-3 pr-3">Date &amp; Time</th>
                                        <th className="pb-3 pr-3">Request ID</th>
                                        <th className="pb-3 pr-3">Type</th>
                                        <th className="pb-3 pr-3">To</th>
                                        <th className="pb-3 pr-3">Amount</th>
                                        <th className="pb-3 pr-3">Status</th>
                                        <th className="pb-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredTransactions.map((tx, index) => {
                                        const statusCfg = STATUS_CONFIG[tx.status];
                                        const rowNum = (state.page - 1) * 10 + index + 1;
                                        return (
                                            <tr key={tx.id} className="hover:bg-gray-50">
                                                <td className="py-3 pr-3 text-xs text-gray-400">{rowNum}</td>
                                                <td className="py-3 pr-3 text-xs text-gray-500 whitespace-nowrap">
                                                    {formatDate(tx.created_at)}
                                                </td>
                                                <td className="py-3 pr-3">
                                                    <span className="text-xs font-medium text-[#1B3A2A] underline underline-offset-2">
                                                        {tx.request_id}
                                                    </span>
                                                </td>
                                                <td className="py-3 pr-3">
                                                    <span className="text-xs font-medium text-gray-700">{tx.type}</span>
                                                    {tx.subtype && (
                                                        <span className="block text-xs text-gray-400">{tx.subtype}</span>
                                                    )}
                                                </td>
                                                <td className="py-3 pr-3 text-xs text-gray-600">{tx.to}</td>
                                                <td className="py-3 pr-3 text-xs font-medium text-gray-700 whitespace-nowrap">
                                                    {formatAmount(tx.amount, selectedCurrency?.code ?? '')}
                                                </td>
                                                <td className="py-3 pr-3">
                                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusCfg.className}`}>
                                                        {statusCfg.label}
                                                    </span>
                                                </td>
                                                <td className="py-3">
                                                    {tx.status === 'success' && (
                                                        <a
                                                            href={`/api/transactions/${tx.id}/download`}
                                                            className="text-xs font-medium text-[#1B3A2A] hover:underline"
                                                        >
                                                            <Download className="inline size-3 mr-1" />
                                                            Download
                                                        </a>
                                                    )}
                                                    {tx.status === 'pending' && (
                                                        <span className="text-xs font-medium text-blue-600">
                                                            Track Payment
                                                        </span>
                                                    )}
                                                    {tx.status === 'cancelled' && (
                                                        <span className="text-xs font-medium text-red-500">
                                                            View Reason
                                                        </span>
                                                    )}
                                                    {tx.status === 'rejected' && (
                                                        <span className="text-xs font-medium text-red-500">
                                                            View Rejection
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {state.totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-center gap-1">
                            <button
                                onClick={() => dispatch({ type: 'SET_PAGE', page: state.page - 1 })}
                                disabled={state.page === 1}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                            >
                                ‹
                            </button>
                            {Array.from({ length: Math.min(state.totalPages, 5) }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => dispatch({ type: 'SET_PAGE', page: p })}
                                    className={`size-8 rounded-lg text-xs font-medium ${
                                        p === state.page
                                            ? 'bg-gray-900 text-white'
                                            : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                onClick={() => dispatch({ type: 'SET_PAGE', page: state.page + 1 })}
                                disabled={state.page === state.totalPages}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                            >
                                ›
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
