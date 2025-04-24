"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PlayerProfileBadgeProps {
    playerName: string;
    rating: number;
    score?: number;
    profileImage?: string;
    countryCode?: string;
    isPremium?: boolean;
    isMaster?: boolean;
    additionalPoints?: number;
}

export function PlayerProfileBadge({
    playerName,
    rating,
    score = 0,
    profileImage,
    countryCode,
    isPremium = false,
    isMaster = false,
    additionalPoints = 0,
}: PlayerProfileBadgeProps) {
    return (
        <div className="flex flex-row items-center text-white w-full border-none rounded-md overflow-hidden gap-x-2">
            {/* 점수 (왼쪽) */}
            {score > 0 && (
                <div className="flex font-bold text-xl bg-zinc-800 w-10 h-10 text-center items-center justify-center rounded-md">
                    {score.toFixed(1)}
                </div>
            )}

            {/* 프로필 이미지 */}
            <Avatar className="h-10 w-10 border-2 border-zinc-700">
                <AvatarImage src={profileImage} alt={playerName} />
                <AvatarFallback className="bg-zinc-800">
                    {playerName.substring(0, 2)}
                </AvatarFallback>
            </Avatar>

            {/* 사용자 정보 */}
            <div className="flex-1">
                <div className="flex items-center gap-1">
                    <span className="text-sm truncate">{playerName}</span>
                    <span className="text-zinc-400 text-sm">({rating})</span>

                    {/* 국가 플래그 (있는 경우) */}
                    {countryCode && (
                        <img
                            src={`https://flagcdn.com/16x12/${countryCode.toLowerCase()}.png`}
                            alt={countryCode}
                            className="h-3"
                        />
                    )}
                </div>

                <div className="flex items-center">
                    <div className="flex items-center space-x-1 text-sm">
                        {"+1"}
                    </div>
                </div>
            </div>
        </div>
    );
}
