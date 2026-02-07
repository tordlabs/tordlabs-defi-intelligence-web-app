import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";


import { useState, useCallback } from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollTo = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsOpen(false);
  }, []);

  const NavItems = () => (
    <>
      <a href="#ecosystem" onClick={(e) => scrollTo(e, "ecosystem")} className="text-sm font-medium hover:text-primary transition-colors">Ecosystem</a>
      <a href="#tokenomics" onClick={(e) => scrollTo(e, "tokenomics")} className="text-sm font-medium hover:text-primary transition-colors">Tokenomics</a>
      <a href="#roadmap" onClick={(e) => scrollTo(e, "roadmap")} className="text-sm font-medium hover:text-primary transition-colors">Roadmap</a>
      <a href="#community" onClick={(e) => scrollTo(e, "community")} className="text-sm font-medium hover:text-primary transition-colors">Community</a>
    </>
  );

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center gap-2">
            <img src="/logo.png" alt="Tord Labs" className="h-10 w-auto" />
            <span className="font-display font-bold text-xl tracking-wider text-white">
              TORD <span className="text-primary">LABS</span>
            </span>
          </a>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <NavItems />
          <a href="/dashboard">
            <Button className="bg-primary text-black hover:bg-primary/90 font-bold px-6 neon-snake-btn">
              Launch App
            </Button>
          </a>
        </div>

        {/* Mobile Nav */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="p-1">
              <div className="flex flex-col gap-[5px] items-center justify-center w-7 h-7">
                <span className="block w-6 h-[3.5px] rounded-full bg-primary"></span>
                <span className="block w-6 h-[3.5px] rounded-full bg-primary"></span>
                <span className="block w-6 h-[3.5px] rounded-full bg-primary"></span>
              </div>
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-black/95 border-primary/20">
            <div className="flex flex-col gap-8 mt-10">
              <NavItems />
              <a href="/dashboard">
                <Button className="bg-primary text-black w-full neon-snake-btn">Launch App</Button>
              </a>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
