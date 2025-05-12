export interface User {
    id: string;
    email: string;
    name: string | null;
    googleId: string | null;
    picture: string | null;
    rating: number;
    wins: number;
    losses: number;
    createdAt: Date;
    updatedAt: Date;
}
