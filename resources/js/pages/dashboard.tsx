import { Head, usePage } from '@inertiajs/react';
import { useEchoPublic } from '@laravel/echo-react';
import { ArrowUpRight, Download, Search, SlidersHorizontal } from 'lucide-react';
import { useState, useRef } from 'react';
import { ReceiverModal } from '@/components/receiver-modal';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { Currency, Receiver, Transaction } from '@/types/receiver';

interface Props {
    transactions: Transaction[];
}

interface SharedProps {
    currencies: Currency[];
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
];

const balances = [
    { flag: '🇺🇸', code: 'USD', amount: '$14,000' },
    { flag: '🇮🇳', code: 'INR', amount: '₹1,191,680' },
    { flag: '🇨🇦', code: 'CAD', amount: '$2,878.48' },
];

const filterTabs = ['All', 'Add money', 'Send Money', 'Conversion'];

type StatusKey = Transaction['status'];

const statusConfig: Record<StatusKey, { label: string; className: string }> = {
    pending: { label: 'needs action', className: 'bg-orange-100 text-orange-600' },
    approved: { label: 'success', className: 'bg-green-100 text-green-700' },
    success: { label: 'success', className: 'bg-green-100 text-green-700' },
    cancelled: { label: 'failed', className: 'bg-red-100 text-red-600' },
    rejected: { label: 'failed', className: 'bg-red-100 text-red-600' },
};

export default function Dashboard({ transactions: initialTransactions }: Props) {
    const { currencies } = usePage<SharedProps>().props;
    const [activeFilter, setActiveFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedReceiver, setSelectedReceiver] = useState<Receiver | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const searchRef = useRef<HTMLInputElement>(null);

    // Real-time: new transaction arrives via queue
    useEchoPublic<Transaction>(
        'transactions',
        '.transaction.created',
        (e) => setTransactions((prev) => [e, ...prev]),
    );

    // Real-time: transaction status updated
    useEchoPublic<{ id: number; status: StatusKey }>(
        'transactions',
        '.transaction.status.updated',
        (e) =>
            setTransactions((prev) =>
                prev.map((tx) => (tx.id === e.id ? { ...tx, status: e.status } : tx)),
            ),
    );

    const filteredTransactions = transactions.filter((tx) => {
        const matchesType = activeFilter === 'All' || tx.type === activeFilter;
        const matchesStatus = statusFilter === 'All' || tx.status === statusFilter;
        const matchesSearch =
            !search ||
            tx.to.toLowerCase().includes(search.toLowerCase()) ||
            tx.status.toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesStatus && matchesSearch;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-5 p-5">
                {/* Top row */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    {/* Account Balance */}
                    <div className="md:col-span-2 rounded-2xl bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-start justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Account<br />Balance</h2>
                            <a href="#" className="flex items-center gap-1 text-sm font-medium text-[#1B3A2A] hover:underline">
                                Add Money <ArrowUpRight className="size-4" />
                            </a>
                        </div>
                        <p className="mb-1 text-xs text-gray-400">Overall (In USD)</p>
                        <p className="mb-4 text-3xl font-bold text-gray-900">$30,000</p>
                        <div className="space-y-2">
                            {balances.map((b) => (
                                <div key={b.code} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-gray-50">
                                    <div className="flex items-center gap-2">
                                        <span className="text-base">{b.flag}</span>
                                        <span className="text-sm font-medium text-gray-600">{b.code}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-800">{b.amount}</span>
                                </div>
                            ))}
                        </div>
                        <button className="mt-4 flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700">
                            <ArrowUpRight className="size-3.5" /> Show More
                        </button>
                    </div>

                    {/* Quick Conversion */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-base font-bold text-gray-900">Quick Conversion</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="mb-1 block text-xs text-gray-400">From</label>
                                <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                                    <span className="text-sm font-medium text-gray-500">Cash</span>
                                    <span className="ml-auto text-xs text-gray-300">▾</span>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-gray-400">To</label>
                                <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                                    <span className="text-sm font-medium text-gray-500">Cash</span>
                                    <span className="ml-auto text-xs text-gray-300">▾</span>
                                </div>
                            </div>
                            <div className="flex justify-between pt-1 text-xs text-gray-500">
                                <span>Rate</span><span className="font-medium text-gray-700">—</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Fee</span><span className="font-medium text-gray-700">—</span>
                            </div>
                            <button className="mt-2 w-full rounded-xl bg-[#1B3A2A] py-2.5 text-sm font-semibold text-white hover:bg-[#163020]">
                                Preview
                            </button>
                        </div>
                    </div>
                </div>

                {/* Transactions */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-lg font-bold text-gray-900">Transactions</h3>
                        <div className="flex items-center gap-2">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by name or status..."
                                    className="w-48 rounded-lg border border-gray-200 py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#1B3A2A] focus:w-60 transition-all"
                                />
                            </div>

                            {/* Status filter */}
                            <div className="relative">
                                <SlidersHorizontal className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="appearance-none rounded-lg border border-gray-200 py-1.5 pl-8 pr-6 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#1B3A2A] cursor-pointer"
                                >
                                    <option value="All">All statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="success">Success</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            {/* Export */}
                            <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                                <Download className="size-3.5" /> Export
                            </button>
                        </div>
                    </div>

                    <div className="mb-4 flex gap-2">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveFilter(tab)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                    activeFilter === tab ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-400">
                                    <th className="pb-3 pr-4">Date &amp; Time</th>
                                    <th className="pb-3 pr-4">Request ID</th>
                                    <th className="pb-3 pr-4">Type</th>
                                    <th className="pb-3 pr-4">To</th>
                                    <th className="pb-3 pr-4">Amount</th>
                                    <th className="pb-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredTransactions.map((tx) => {
                                    const status = statusConfig[tx.status];
                                    const date = new Date(tx.created_at);
                                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
                                        ' | ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                                    return (
                                        <tr
                                            key={tx.id}
                                            className="cursor-pointer hover:bg-gray-50"
                                            onClick={() => tx.receiver && setSelectedReceiver(tx.receiver)}
                                        >
                                            <td className="py-3 pr-4 text-xs text-gray-500">{dateStr}</td>
                                            <td className="py-3 pr-4">
                                                <span className="text-xs font-medium text-[#1B3A2A] underline underline-offset-2">{tx.request_id}</span>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span className="text-xs font-medium text-gray-700">{tx.type}</span>
                                                {tx.subtype && <span className="block text-xs text-gray-400">{tx.subtype}</span>}
                                            </td>
                                            <td className="py-3 pr-4 text-xs text-gray-600">{tx.to}</td>
                                            <td className="py-3 pr-4 text-xs font-medium text-gray-700">
                                                {tx.currency?.code} {parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-3">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <ReceiverModal
                isOpen={selectedReceiver !== null}
                onClose={() => setSelectedReceiver(null)}
                receiver={selectedReceiver}
                currencies={currencies}
            />
        </AppLayout>
    );
}
