import { Link } from "react-router-dom";

export default function AppHeader() {
  return (
    <header className="w-full bg-[rgb(31,12,87)] text-white font-sans select-none">
      {/* Top Utility Bar */}
      <div className="w-full text-[12.5px] font-normal px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center text-xs border-b border-purple-950/20">
        {/* Left Side: Contact & Socials */}
        <div className="flex items-center space-x-4">
          <span className="text-gray-200">
            Call us on{" "}
            <span className="font-bold text-white">+353 (0)1 626 7516</span>
          </span>
          <span className="text-gray-400">|</span>
          <div className="flex items-center space-x-3">
            {/* Facebook Icon */}
            <a href="#" className="hover:text-orange-500 transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
              </svg>
            </a>
            {/* LinkedIn Icon */}
            <a href="#" className="hover:text-orange-500 transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Right Side: Links */}
        <div className="flex items-center space-x-6 font-medium text-gray-200">
          <a href="#" className="hover:text-orange-500 transition-colors">
            Quick Order
          </a>
          <a href="#" className="hover:text-orange-500 transition-colors">
            About Us
          </a>
          <a href="#" className="hover:text-orange-500 transition-colors">
            Login/Register
          </a>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
        {/* Brand Logo Component */}
        <Link
          to="/"
          className="flex items-center space-x-3 shrink-0 cursor-pointer group"
        >
          <img 
          className="w-75 h-20"
          src="https://s3-eu-west-1.amazonaws.com/webshop/data/thumbs/ee/eee7b1e0884389d021c57fba66742e13f506a591.png"
          alt="" />
        </Link>

        {/* Search Bar Container */}
        <div className="flex-1 max-w-4xl mx-4">
          <div className="relative flex items-center bg-white rounded-sm overflow-hidden h-11 shadow-sm">
            <input
              type="text"
              placeholder="What are you looking for today?"
              className="w-full h-full pl-4 pr-14 text-sm text-gray-700 bg-transparent placeholder-gray-400 outline-none border-none focus:ring-0"
            />
            {/* Search Button Area (Visual Splitter) */}
            <div className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center border-l border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0x"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* User Actions (Account & Cart) */}
        <div className="flex items-center space-x-6 shrink-0">
          {/* Account Section */}
          <div className="flex items-center space-x-3 cursor-pointer group">
            <div className="text-[#ff6a00] group-hover:scale-105 transition-transform">
              {/* User Profile Icon */}
              <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM8.5 8a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0zm3.5 7c-4.14 0-7.5 2.46-7.5 5.5a.75.75 0 00.75.75h13.5a.75.75 0 00.75-.75c0-3.04-3.36-5.5-7.5-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="text-sm leading-tight">
              <p className="font-bold text-white group-hover:text-orange-400 transition-colors">
                My Account
              </p>
              <p className="text-xs text-gray-300">Login / Register</p>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="h-9 w-[1px] bg-purple-900/60" />

          {/* Cart Section */}
          <div className="flex items-center space-x-3 cursor-pointer group">
            <div className="text-[#ff6a00] group-hover:scale-105 transition-transform">
              {/* Shopping Cart Icon */}
              <svg
                className="w-7 h-7 fill-none stroke-current stroke-2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
            </div>
            <div className="text-sm leading-tight">
              <p className="font-bold text-white group-hover:text-orange-400 transition-colors">
                My Cart
              </p>
              <p className="text-xs text-gray-300 font-medium">
                0 item(s) - €0
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
