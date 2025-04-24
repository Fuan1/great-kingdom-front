import { Clock } from 'lucide-react';

export function TimeBox() {
    return (
        <div className="flex flex-row items-center justify-center border-2 border-zinc-700 rounded-md px-2 py-1 gap-x-2">
            <Clock className="w-6 h-6" />
            <div className="text-2xl font-bold">10:00</div>
        </div>
    );
}
