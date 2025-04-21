import React, { useEffect} from "react";

interface ScrollContainerProps {
    children: React.ReactNode;
}

const ScrollContainer = ({ children }: ScrollContainerProps) => {
    useEffect(() => {
        const handleWheel = (event: WheelEvent) => {
            if (document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) {
                event.preventDefault();
                window.scrollBy({
                    left: event.deltaY < 0 ? -10 : 10,
                    top: event.deltaY < 0 ? -10 : 10,
                    behavior: "smooth"
                });
            }
        };

        document.addEventListener('wheel', handleWheel);
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
    }, []);

    return <>{children}</>;
};

export default ScrollContainer;