import { Sheet, SheetTrigger, SheetContent } from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { Link } from "@remix-run/react";
import { NavigationMenu, NavigationMenuList, NavigationMenuLink } from "~/components/ui/navigation-menu";

export default function Header() {
  return (
    <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <Link to="/">
            <span className="sr-only">ShadCN</span>
          </Link>
          <div className="grid gap-2 py-6">
            <Link to="/" className="flex w-full items-center py-2 text-lg font-semibold">
              Home
            </Link>
          </div>
        </SheetContent>
      </Sheet>
      <NavigationMenu className="hidden lg:flex">
        <NavigationMenuList>
          <NavigationMenuLink asChild>
            <Link
              to="/"
              className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
            >
            
              Home
            </Link>
          </NavigationMenuLink>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="ml-auto flex gap-2">
        <Link to="/login">
          <Button variant="outline">Accedi</Button>
        </Link>
        <Link to="/login">
          <Button>Registrati</Button>
        </Link>
      </div>
    </header>
  );
}