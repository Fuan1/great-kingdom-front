import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

interface GoogleVerifyResponse {
    accessToken: string;
    expiresIn: number;
    user: {
        id: string;
        email: string;
        name: string;
    };
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account, user }) {
            if (account && user) {
                try {
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/verify`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                idToken: account.id_token,
                                accessToken: account.access_token,
                            }),
                        }
                    );

                    if (!response.ok) {
                        throw new Error("Failed to verify with backend");
                    }

                    const data =
                        (await response.json()) as GoogleVerifyResponse;

                    console.log("accessToken : ", data.accessToken);

                    return {
                        ...token,
                        backendToken: data.accessToken,
                        backendTokenExpires: Date.now() + data.expiresIn * 1000,
                        id: data.user.id,
                    };
                } catch (error) {
                    console.error("Backend verification failed:", error);
                    return token;
                }
            }

            // 토큰 만료 체크 및 갱신 로직
            if (
                token.backendTokenExpires &&
                Date.now() > token.backendTokenExpires
            ) {
                try {
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
                        {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${token.backendToken}`,
                            },
                        }
                    );

                    const data =
                        (await response.json()) as GoogleVerifyResponse;

                    return {
                        ...token,
                        backendToken: data.accessToken,
                        backendTokenExpires: Date.now() + data.expiresIn * 1000,
                    };
                } catch (error) {
                    return {
                        ...token,
                        error: "RefreshAccessTokenError",
                    };
                }
            }

            return token;
        },

        async session({ session, token }) {
            return {
                ...session,
                backendToken: token.backendToken,
                error: token.error,
                user: {
                    ...session.user,
                    id: token.id,
                },
            };
        },
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30일
    },
    debug: process.env.NODE_ENV === "development",
    secret: process.env.NEXTAUTH_SECRET,
};
