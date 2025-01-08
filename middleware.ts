import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// List of public routes that don't require authentication
const publicRoutes = ["/sign-in*", "/sign-up*"];

function isPublic(path: string) {
    return publicRoutes.find((x) =>
        path.match(new RegExp(`^${x}$`.replace("*$", "($|/)")))
    );
}

export default clerkMiddleware((_, req) => {
    const path = new URL(req.url).pathname;

    // If the path is public, allow the request
    if (isPublic(path)) {
        return NextResponse.next();
    }

    // For all other routes, let Clerk handle the authentication
    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};