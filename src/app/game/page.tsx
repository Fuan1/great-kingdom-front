import { GameBoard } from '@/components/game-board';
import { NotationBox } from '@/components/notation-box';
import { PlayerProfileBadge } from '@/components/player-profile-badge';
import { TimeBox } from '@/components/time-box';

export default function Home() {
    return (
        <main className="flex flex-row items-center max-h-screen justify-center max-w-screen-xl mx-auto p-4 gap-x-4">
            {/* game board */}
            <div className="h-full w-full flex flex-col gap-y-2">
                <div className="flex flex-row items-center h-12 w-full">
                    <PlayerProfileBadge playerName="홍길동" score={1} rating={1850} countryCode="kr" isPremium={true} />
                    <TimeBox />
                </div>
                <div className="flex-grow">
                    <GameBoard />
                </div>
                <div className="flex flex-row items-center h-12 w-full">
                    <PlayerProfileBadge playerName="Fuan" rating={1850} countryCode="kr" isPremium={true} />
                    <TimeBox />
                </div>
            </div>
            {/* game controls, chat */}
            <div className="w-[40rem] h-full flex flex-col gap-x-2">
                <div className="w-full h-2/3 ">
                    <NotationBox />
                </div>
                <div className="w-full h-1/3 bg-yellow-500"></div>
            </div>
        </main>
    );
}

// Accordion
// Alert
// Alert Dialog
// Aspect Ratio
// Avatar
// Badge
// Breadcrumb
// Button
// Calendar
// Card
// Carousel
// Chart
// Checkbox
// Collapsible
// Combobox
// Command
// Context Menu
// Data Table
// Date Picker
// Dialog
// Drawer
// Dropdown Menu
// Form
// Hover Card
// Input
// Input OTP
// Label
// Menubar
// Navigation Menu
// Pagination
// Popover
// Progress
// Radio Group
// Resizable
// Scroll Area
// Select
// Separator
// Sheet
// Sidebar
// Skeleton
// Slider
// Sonner
// Switch
// Table
// Tabs
// Textarea
// Toast
// Toggle
// Toggle Group
// Tooltip
