import { UserButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4">
      <h1 className="text-xl font-bold">Emoji Maker</h1>
      <UserButton afterSignOutUrl="/sign-in" />
    </header>
  );
}