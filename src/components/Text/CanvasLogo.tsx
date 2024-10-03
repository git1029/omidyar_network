import { useCallback, useEffect, useMemo, useState } from "react";
import { CanvasTexture } from "three";
import { useThree } from "@react-three/fiber";
import useStore from "../../store/store";

import LogoFull from "/logo_full.svg";
import LogoEmblem from "/logo.svg";
// import Logo from "../Logo";

const CanvasLogo = () => {
  const { size } = useThree();

  const logo = useStore((state) => state.logo);
  const fullscreen = useStore((state) => state.fullscreen);
  // const layout = useStore((state) => state.layout);
  const { color } = useStore((state) => state.text);
  const setValue = useStore((state) => state.setValue);

  const [offscreen, glo, imageFull, imageEmblem] = useMemo(() => {
    const offscreen = new OffscreenCanvas(1000, 1000);
    const glo = offscreen.getContext("2d");
    // const tex = new CanvasTexture(offscreen)
    const imageFull = new Image();
    const imageEmblem = new Image();
    return [offscreen, glo, imageFull, imageEmblem];
  }, []);

  // const [offscreen] = useState(new OffscreenCanvas(1000, 1000));
  // const [glo] = useState(offscreen.getContext("2d"));
  const [tex, setTex] = useState(new CanvasTexture(offscreen));
  // const [imageFull] = useState(new Image());
  // const [imageEmblem] = useState(new Image());

  useEffect(() => {
    setValue("canvasSize", {
      // width: size.width * Math.min(window.devicePixelRatio, 2),
      // height: size.height * Math.min(window.devicePixelRatio, 2),
      width: size.width,
      height: size.height,
    });
  }, [size, setValue]);

  const [logoSrc, setLogoSrc] = useState(LogoFull);
  const [logoSrcEmblem, setLogoSrcEmblem] = useState(LogoEmblem);

  useEffect(() => {
    // Convert logo to base64 string for image src so can adjust color before drawing to canvas
    const getSVG = async () => {
      const logo = await fetch(LogoFull);
      const logoText = await logo.text();
      setLogoSrc(logoText);
      // const logoTextColor = logoText.replace("#3A3A3A", color.hex);
      const svg64 = btoa(logoText);
      imageFull.src = "data:image/svg+xml;base64," + svg64;
      return logoText;
    };

    getSVG();
  }, [imageFull]);

  useEffect(() => {
    // Convert logo to base64 string for image src so can adjust color before drawing to canvas
    const getSVG = async () => {
      const logo = await fetch(LogoEmblem);
      const logoText = await logo.text();
      setLogoSrcEmblem(logoText);
      // const logoTextColor = logoText.replace("#3A3A3A", color.hex);
      const svg64 = btoa(logoText);
      imageEmblem.src = "data:image/svg+xml;base64," + svg64;
      return logoText;
    };

    getSVG();
  }, [imageEmblem]);

  useEffect(() => {
    // Replace svg file fill color with text color
    if (logo.value === 0) return;
    const logoTextColor =
      logo.value === 2
        ? logoSrcEmblem.replace("#3A3A3A", color.hex)
        : logoSrc.replace("#3A3A3A", color.hex);
    const svg64 = btoa(logoTextColor);
    if (logo.value === 1) imageFull.src = "data:image/svg+xml;base64," + svg64;
    else if (logo.value === 2)
      imageEmblem.src = "data:image/svg+xml;base64," + svg64;
  }, [color, imageFull, imageEmblem, logoSrc, logoSrcEmblem, logo]);
  // console.log(svg);
  //   const XML = new XMLSerializer().serializeToString(svg);
  // const SVG64 = btoa(XML);

  // // Returns top left view position at grid coordinate [x,y], column width and row height, and gap value
  // const getPos = (x: number, y: number) => {
  //   const grid = 4;

  //   const marginFactor = 1 / 34;

  //   const marginX = marginFactor;
  //   const marginY = marginFactor * viewport.aspect;
  //   const margin = new Vector2(marginX, marginY);

  //   const gap = margin.clone().multiplyScalar(0.5);

  //   // Add margin if logo and/or caption to calculate correct row height
  //   let marginY2 = 0;
  //   if (logo) marginY2 += marginY;
  //   if (caption.length > 0) marginY2 += marginY;

  //   // Add margin if logo to calculate correct y position
  //   let marginY3 = 0;
  //   if (logo) marginY3 += marginY;

  //   const cWidth = (1 - margin.x * 2 - (grid - 1) * gap.x) / grid;
  //   const rHeight = (1 - margin.y * 2 - (grid - 1) * gap.y - marginY2) / grid;

  //   const posX = cWidth * x + x * gap.x - 0.5 + margin.x;
  //   const posY = 0.5 - (rHeight * y + y * gap.y + margin.y + marginY3);

  //   return { pos: new Vector3(posX, posY, 0), cWidth, rHeight, gap, margin };
  // };

  const drawLogo = useCallback(() => {
    // if (glo) {
    //   glo.clearRect(0, 0, offscreen.width, offscreen.height);
    // }
    // Setting canvas width will auto clear it
    const dpr = Math.min(window.devicePixelRatio, 2);
    offscreen.width = size.width * dpr;
    offscreen.height = size.height * dpr;

    const image = logo.value === 2 ? imageEmblem : imageFull;

    const pad = 1 / 34;
    const padX = pad;

    const grid = 4;
    const colw = (1 - padX * 2 - (grid - 1) * (padX * 0.5)) / grid;
    const spanx = 1;
    let wtotal = colw * spanx + (Math.max(0, spanx - 1) * padX) / 2;
    if (logo.value === 2) wtotal /= 4; // if emblem reduce to 1/6th column width
    const scl = (wtotal * size.width) / image.width;
    // const r = size.width / useStore.getState().layout.size.width

    if (glo) {
      glo.drawImage(
        image,
        Math.floor(
          offscreen.width - image.width * scl * dpr - padX * offscreen.width
        ),
        // Math.floor(padX * size.width - (image.height * scl) / 2.1),
        Math.floor(padX * offscreen.width),
        Math.floor(image.width * scl * dpr),
        Math.floor(image.height * scl * dpr)
      );

      tex.dispose();
      setTex(new CanvasTexture(offscreen));
    }
  }, [offscreen, imageFull, imageEmblem, glo, size, logo]);

  useEffect(() => {
    // image.src = LogoFull;
    imageFull.onload = () => {
      // tex.dispose();
      drawLogo();
    };
  }, [imageFull, drawLogo]);

  useEffect(() => {
    // image.src = LogoFull;
    imageEmblem.onload = () => {
      // tex.dispose();
      drawLogo();
    };
  }, [imageEmblem, drawLogo]);

  useEffect(() => {
    // tex.dispose();
    drawLogo();
  }, [size, drawLogo]);

  return (
    <mesh visible={logo.value > 0 && !fullscreen}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial transparent={true} map={tex} toneMapped={false} />
    </mesh>
  );
};

export default CanvasLogo;
