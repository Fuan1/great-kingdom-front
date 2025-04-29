import { getSession } from "next-auth/react";

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

export async function fetchWithAuth<T>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const session = await getSession();

    if (!session?.backendToken) {
        throw new ApiError(401, "Not authenticated");
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${session.backendToken}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new ApiError(response.status, await response.text());
    }

    return response.json();
}
