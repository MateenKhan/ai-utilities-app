"use client";

import Link from "next/link";
import { FiBookmark, FiCpu, FiCheckSquare, FiImage, FiSave } from "react-icons/fi";

export default function Home() {
  const features = [
    {
      title: "Bookmarks Manager",
      description: "Create, read, update, and delete bookmarks with name and URL",
      icon: <FiBookmark className="text-2xl" />,
      href: "/bookmarks",
    },
    {
      title: "Advanced Calculator",
      description: "Unit conversion functionality like iPhone calculator",
      icon: <FiCpu className="text-2xl" />,
      href: "/calculator",
    },
    {
      title: "Todo List",
      description: "Write notes, upload documents, and view previews",
      icon: <FiCheckSquare className="text-2xl" />,
      href: "/todo",
    },
    {
      title: "Save/Load Data",
      description: "Save all details to ZIP and load from ZIP files",
      icon: <FiSave className="text-2xl" />,
      href: "/save-load",
    },
    {
      title: "Image Tile Generator",
      description: "Convert images into multiple A4 size tiles with custom dimensions",
      icon: <FiImage className="text-2xl" />,
      href: "/image-tiles",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Utilities Application</h1>
        <p className="text-gray-600 mb-8">A collection of useful tools in one place</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Link 
              key={index}
              href={feature.href}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-200"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full text-blue-600 mr-4">
                  {feature.icon}
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{feature.title}</h2>
              </div>
              <p className="text-gray-600">{feature.description}</p>
              <div className="mt-4 text-blue-600 font-medium">Learn more →</div>
            </Link>
          ))}
        </div>
        
        <div className="mt-12 bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Application</h2>
          <p className="text-gray-600 mb-4">
            This utility application provides a suite of tools designed to enhance productivity and organization:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Manage your favorite bookmarks with a clean card-based interface</li>
            <li>Perform calculations with unit conversions similar to iOS calculator</li>
            <li>Organize tasks with note-taking and document attachment capabilities</li>
            <li>Save and load all your data in a convenient ZIP file format</li>
            <li>Convert images into printable A4 tiles with custom dimension support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}