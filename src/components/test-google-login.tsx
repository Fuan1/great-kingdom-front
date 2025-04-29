"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";

export function LoginButton() {
    const { data: session } = useSession();

    if (session) {
        return (
            <>
                <Button size={"sm"} onClick={() => signOut()}>
                    Logout
                </Button>
            </>
        );
    }
    return (
        <Button size={"sm"} onClick={() => signIn("google")}>
            Google Login
        </Button>
    );
}
