import { useForm } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { X } from 'lucide-react';
import { store } from '@/actions/App/Http/Controllers/TransactionController';
import type { Currency, Receiver } from '@/types/receiver';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

interface SharedProps {
    currencies: Currency[];
    receivers: Array<{ id: number; name: string }>;
    [key: string]: unknown;
}

export function SendMoneyModal({ isOpen, onClose }: Props) {
    const { currencies, receivers } = usePage<SharedProps>().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        receiver_id: '',
        currency_id: currencies.find((c) => c.is_default)?.id?.toString() ?? '',
        type: 'Send Money',
        subtype: 'International',
        to: '',
        amount: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url(), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    // Auto-fill "To" when receiver is selected
    const handleReceiverChange = (id: string) => {
        const receiver = receivers.find((r) => r.id === parseInt(id));
        setData((prev) => ({ ...prev, receiver_id: id, to: receiver?.name ?? prev.to }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div
                className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h2 className="text-base font-bold text-gray-900">Send Money</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    {/* Receiver */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                            Receiver
                        </label>
                        <select
                            value={data.receiver_id}
                            onChange={(e) => handleReceiverChange(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A2A]"
                        >
                            <option value="">Select a receiver...</option>
                            {receivers.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                        {errors.receiver_id && (
                            <p className="mt-1 text-xs text-red-500">{errors.receiver_id}</p>
                        )}
                    </div>

                    {/* Currency */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                            Currency
                        </label>
                        <div className="flex gap-2">
                            {currencies.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setData('currency_id', c.id.toString())}
                                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-all ${
                                        data.currency_id === c.id.toString()
                                            ? 'border-[#1B3A2A] bg-[#1B3A2A] text-white'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    <span>{c.flag}</span> {c.code}
                                </button>
                            ))}
                        </div>
                        {errors.currency_id && (
                            <p className="mt-1 text-xs text-red-500">{errors.currency_id}</p>
                        )}
                    </div>

                    {/* Type + Subtype */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Type
                            </label>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A2A]"
                            >
                                <option>Send Money</option>
                                <option>Add money</option>
                                <option>Conversion</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Subtype
                            </label>
                            <select
                                value={data.subtype}
                                onChange={(e) => setData('subtype', e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A2A]"
                            >
                                <option value="">None</option>
                                <option>International</option>
                                <option>Domestic</option>
                            </select>
                        </div>
                    </div>

                    {/* To */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                            To (Recipient)
                        </label>
                        <input
                            type="text"
                            value={data.to}
                            onChange={(e) => setData('to', e.target.value)}
                            placeholder="Recipient name"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A2A]"
                        />
                        {errors.to && (
                            <p className="mt-1 text-xs text-red-500">{errors.to}</p>
                        )}
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                            Amount
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                                {currencies.find((c) => c.id.toString() === data.currency_id)?.code ?? ''}
                            </span>
                            <input
                                type="number"
                                min="1"
                                step="0.01"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                placeholder="0.00"
                                className="w-full rounded-lg border border-gray-200 py-2 pl-12 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A2A]"
                            />
                        </div>
                        {errors.amount && (
                            <p className="mt-1 text-xs text-red-500">{errors.amount}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 rounded-xl bg-[#F5C518] py-2.5 text-sm font-semibold text-gray-900 hover:bg-[#e8b910] disabled:opacity-60"
                        >
                            {processing ? 'Sending...' : 'Send Money'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
