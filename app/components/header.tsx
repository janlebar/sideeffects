// header.tsx
import Image from "next/image";

const Header = () => {
  return (
    <header className="sticky top-0 z-30 bg-brand-navy text-white shadow-md">
      <div className="mx-auto flex h-14 items-center gap-3 px-4 sm:px-6">
        <Image
          src="/sideeffectlogo.svg"
          alt="SID Effect"
          width={150}
          height={40}
          priority
          className="h-8 w-auto object-contain"
        />
        <span className="hidden text-sm font-medium text-white/70 sm:inline">
          Adverse Effects Monitor
        </span>
        <span className="ml-auto hidden text-xs text-white/50 md:inline">
          Data source: Drugs.com
        </span>
      </div>
    </header>
  );
};

export default Header;
