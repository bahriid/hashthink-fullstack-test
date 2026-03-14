import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ReceiverModal } from '@/components/receiver-modal';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Currency, Receiver } from '@/types/receiver';

interface Props {
    receiver: Receiver;
}

interface SharedProps {
    currencies: Currency[];
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Receivers', href: '/receivers' },
];

export default function ReceiversPage({ receiver }: Props) {
    const { currencies } = usePage<SharedProps>().props;
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Receivers" />

            <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Receivers</h1>
                    <p className="mt-1 text-sm text-gray-400">Manage your payment receivers and beneficiaries.</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 rounded-xl bg-[#1B3A2A] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#163020] transition-colors"
                >
                    View Receiver
                </button>
            </div>

            <ReceiverModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                receiver={receiver}
                currencies={currencies}
            />
        </AppLayout>
    );
}
