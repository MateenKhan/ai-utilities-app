"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiBookmark, FiCpu, FiCheckSquare, FiImage, FiSave, FiUpload } from "react-icons/fi";

const Sidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { name: "Bookmarks", href: "/bookmarks", icon: FiBookmark },
    { name: "Calculator", href: "/calculator", icon: FiCpu },
    { name: "Todo List", href: "/todo", icon: FiCheckSquare },
    { name: "Image Tiles", href: "/image-tiles", icon: FiImage },
    { name: "Save/Load", href: "/save-load", icon: FiSave },
  ];

  return (
    <>
      {/* Sidebar */}
      <div className={`bg-gray-800 text-white h-screen sticky top-0 z-10 transition-all duration-300 ${isOpen ? "w-64" : "w-20"}`}>
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          {isOpen && <h1 className="text-xl font-bold">Utilities App</h1>}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded hover:bg-gray-700"
          >
            {isOpen ? "«" : "»"}
          </button>
        </div>
        <nav className="mt-4">
          <ul>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className={`flex items-center p-4 hover:bg-gray-700 transition-colors ${isActive ? "bg-blue-600" : ""}`}
                  >
                    <Icon className="text-xl" />
                    {isOpen && <span className="ml-4">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;