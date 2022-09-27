const pageFixed = () => {
  let fixedFlag = false;

  const scrollingElement = (): HTMLElement => {
    const browser = window.navigator.userAgent.toLowerCase();
    if ("scrollingElement" in document)
      return document.scrollingElement as HTMLElement;
    if (browser.indexOf("webkit") > 0) return document.body;
    return document.documentElement!;
  };

  const styles = {
    height: "100vh",
    left: "0",
    overflow: "hidden",
    position: "fixed",
    top: `${scrollY * -1}px`,
    width: "100vw",
  };
  type stylesKeyType = keyof typeof styles;
  const keys = Object.keys(styles) as Array<stylesKeyType>;

  return {
    remove: () => {
      fixedFlag = true;
      document.body.style.paddingRight = "";
      const scrollY = parseInt(document.body.style.top || "0");
      if (!fixedFlag) window.scrollTo(0, scrollY * -1);
      keys.map((key, i) => {
        document.body.style[key] = "";
      });
    },
    attach: () => {
      fixedFlag = false;
      const scrollbarWidth = window.innerWidth - document.body.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      const scrollY = scrollingElement().scrollTop;
      keys.map((key, i) => {
        document.body.style[key] = styles[key];
      });
    },
    isFixed: () => fixedFlag,
  };
};

export default pageFixed;
