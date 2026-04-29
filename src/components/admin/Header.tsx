"use client";

import { Bell, Menu, Search, ShoppingBag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-[#d4c3bc]/30 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden text-[#50443f]">
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-[#7a5646] text-xl font-heading">✦</span>
          <div>
            <h1 className="text-base font-heading font-medium text-[#1b1c1c]">LUXE BEAUTÉ</h1>
            <p className="text-[10px] uppercase tracking-[0.1em] text-[#82746e]">Dashboard Overview</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center bg-[#f6f3f2] px-3 py-2 rounded-lg border border-[#d4c3bc]/30 focus-within:border-[#7a5646] focus-within:ring-2 focus-within:ring-[#7a5646]/10 transition-all">
          <Search className="w-4 h-4 text-[#82746e] mr-2" />
          <input 
            type="text" 
            placeholder="Global search..." 
            className="bg-transparent border-none outline-none text-sm text-[#1b1c1c] w-64 placeholder:text-[#82746e]"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative text-[#50443f] hover:bg-[#f6f3f2] hover:text-[#7a5646] rounded-full">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#7a5646] rounded-full border border-white"></span>
        </Button>

        <Button variant="ghost" size="icon" className="relative text-[#50443f] hover:bg-[#f6f3f2] hover:text-[#7a5646] rounded-full">
          <ShoppingBag className="w-5 h-5" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-2 ring-2 ring-transparent hover:ring-[#7a5646]/10 transition-all">
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://ui-avatars.com/api/?name=Admin+User&background=7a5646&color=fff" alt="Admin" />
                <AvatarFallback className="bg-[#7a5646] text-white">AD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-[#1b1c1c]">Admin User</p>
                <p className="text-xs leading-none text-[#82746e]">
                  admin@luxebeaute.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#d4c3bc]/30" />
            <DropdownMenuItem className="cursor-pointer text-[#1b1c1c] hover:bg-[#f6f3f2]">Perfil</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-[#1b1c1c] hover:bg-[#f6f3f2]">Configuración</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#d4c3bc]/30" />
            <DropdownMenuItem className="text-[#ba1a1a] cursor-pointer font-medium hover:bg-[#ffdad6]">Cerrar Sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
