import { useCallback, useEffect, useState } from "react";
import { CanvasTexture } from "three";
import { useThree } from "@react-three/fiber";
import useStore from "../../store/store";

import LogoFull from "/logo_full.svg";

const CanvasLogo = () => {
  const { size } = useThree();

  const logo = useStore((state) => state.logo);
  const { color } = useStore((state) => state.text);
  const setValue = useStore((state) => state.setValue);

  const [offscreen] = useState(new OffscreenCanvas(1000, 1000));
  const [glo] = useState(offscreen.getContext("2d"));
  const [tex, setTex] = useState(new CanvasTexture(offscreen));
  const [image] = useState(new Image());

  useEffect(() => {
    setValue("canvasSize", { width: size.width, height: size.height });
  }, [size, setValue]);

  const [logoSrc, setLogoSrc] = useState(LogoFull);

  useEffect(() => {
    // Convert logo to base64 string for image src so can adjust color before drawing to canvas
    const getSVG = async () => {
      const logo = await fetch(LogoFull);
      const logoText = await logo.text();
      setLogoSrc(logoText);
      // const logoTextColor = logoText.replace("#3A3A3A", color.hex);
      const svg64 = btoa(logoText);
      image.src = "data:image/svg+xml;base64," + svg64;
    };

    getSVG();
  }, [image]);

  useEffect(() => {
    // Replace svg file fill color with text color
    const logoTextColor = logoSrc.replace("#3A3A3A", color.hex);
    const svg64 = btoa(logoTextColor);
    image.src = "data:image/svg+xml;base64," + svg64;
  }, [color, image, logoSrc]);
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
    if (glo) {
      glo.clearRect(0, 0, offscreen.width, offscreen.height);
    }
    offscreen.width = size.width;
    offscreen.height = size.height;

    const pad = 1 / 34;
    const padX = pad;

    const grid = 4;
    const colw = (1 - padX * 2 - (grid - 1) * (padX * 0.5)) / grid;
    const spanx = 1;
    const wtotal = colw * spanx + (Math.max(0, spanx - 1) * padX) / 2;
    const scl = (wtotal * size.width) / image.width;

    if (glo) {
      glo.drawImage(
        image,
        Math.floor(size.width - image.width * scl - padX * size.width),
        Math.floor(padX * size.width - (image.height * scl) / 2.1),
        Math.floor(image.width * scl),
        Math.floor(image.height * scl)
      );

      tex.dispose();
      setTex(new CanvasTexture(offscreen));
    }
  }, [offscreen, image, glo, size]);

  useEffect(() => {
    // image.src = LogoFull;
    image.onload = () => {
      // tex.dispose();
      drawLogo();
    };
  }, [image, drawLogo]);

  useEffect(() => {
    // tex.dispose();
    drawLogo();
  }, [size, drawLogo]);

  return (
    <mesh visible={logo}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial transparent={true} map={tex} toneMapped={false} />
    </mesh>
  );
};

export default CanvasLogo;
