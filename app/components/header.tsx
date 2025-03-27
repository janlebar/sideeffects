// header.tsx
import Image from "next/image";

const Header = () => {
  return (
    <header>
      {/* Hero Section */}
      <div
        className="relative pt-10 pb-20 flex content-center items-center justify-center"
        style={{ minHeight: "20vh" }}
      >
        <div
          className="absolute top-0 w-full h-full bg-center bg-cover"
          style={{ backgroundImage: "url('/sideeffect.svg')" }}
        >
          <span
            id="blackOverlay"
            className="w-full h-full absolute opacity-75 bg-black"
          ></span>
        </div>
        <div className="container relative mx-auto">
          <div className="items-center flex flex-wrap">
            <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
              <div className="pr-12">
                <h1 className="items-center justify-center text-white font-semibold text-5xl">
                  <Image
                    src="/sideeffectlogo.svg"
                    alt="Side Effect"
                    width={400}
                    height={200}
                    className="mx-auto"
                  />
                </h1>
              </div>
            </div>
          </div>
        </div>
        <div
          className="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden"
          style={{ height: "70px" }}
        ></div>
      </div>
    </header>
  );
};

export default Header;
