// header.tsx
import Image from "next/image";

const Header = () => {
  return (
    <header>
      {/* Hero Section */}
      <div
        className="relative pt-16 pb-32 flex content-center items-center justify-center"
        style={{ minHeight: "75vh" }}
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
                    width={400} // Increased the width
                    height={200} // Increased the height
                    className="mx-auto" // This centers the image
                  />
                </h1>
              </div>
            </div>
          </div>
        </div>
        <div
          className="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden"
          style={{ height: "70px" }}
        >
          {/* <svg
            className="absolute bottom-0 overflow-hidden"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            viewBox="0 0 2560 100"
            x="0"
            y="0"
          >
            <polygon className="text-white fill-current" points="2560 0 2560 100 0 100"></polygon>
          </svg> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
