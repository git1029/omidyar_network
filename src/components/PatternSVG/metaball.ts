/**
 * Based on Metaball script by Hiroyuki Sato
 * http://shspage.com/aijs/en/#metaball
 * https://varun.ca/metaballs/
 */

import { Vector2 } from "three";

const getVector = (center: Vector2, angle: number, radius: number) => {
  return new Vector2(Math.cos(angle), Math.sin(angle))
    .multiplyScalar(radius)
    .add(center);
};

export const metaball = (
  radius1: number,
  radius2: number,
  center1: Vector2,
  center2: Vector2,
  handleSize = 1.5,
  v = 0.5
) => {
  const HALF_PI = Math.PI / 2;
  // Distance between circles
  // const d = dist(center1.x, center1.y, center2.x, center2.y);
  const d = center1.distanceTo(center2);
  // const dir0 = center2.copy().sub(center1).normalize();
  // const dir1 = center1.copy().sub(center2).normalize();
  // const v0 = center1.copy().add(dir0.mult(radius1));
  // const v1 = center2.copy().add(dir1.mult(radius2));
  // const d = dist(v0.x, v0.y, v1.x, v1.y);

  // push();
  // fill("lime");
  // ellipse(v0.x, v0.y, 10);
  // fill("yellow");
  // ellipse(v1.x, v1.y, 10);
  // pop();

  // console.log(d);
  const maxDist = radius1 + radius2 * 3.5;
  let u1, u2;

  // No blob if a radius is 0
  // or if distance between the circles is larger than max-dist
  // or if circle2 is completely inside circle1 (or viceversa)
  if (
    radius1 === 0 ||
    radius2 === 0 ||
    d > maxDist ||
    d <= Math.abs(radius1 - radius2)
  ) {
    return null;
  }

  // Calculate u1 and u2 if the circles are overlapping
  if (d < radius1 + radius2) {
    u1 = Math.acos(
      (radius1 * radius1 + d * d - radius2 * radius2) / (2 * radius1 * d)
    );
    u2 = Math.acos(
      (radius2 * radius2 + d * d - radius1 * radius1) / (2 * radius2 * d)
    );
  } else {
    // Else set u1 and u2 to zero
    u1 = 0;
    u2 = 0;
  }

  // u1 = 0;
  // u2 = 0;
  // console.log(u1, u2);

  // Calculate the max spread
  // const angleBetweenCenters = center2.angleBetween;
  // const angleBetweenCenters = -center2
  //   .copy()
  //   .sub(center1)
  //   .angleBetween(createVector(1, 0));

  const angleBetweenCenters = -center2
    .clone()
    .sub(center1)
    .angleTo(new Vector2(1, 0));

  // console.log(angleBetweenCenters);
  const maxSpread = Math.acos((radius1 - radius2) / d);
  // Angles for the points
  const angle1 = angleBetweenCenters + u1 + (maxSpread - u1) * v;
  const angle2 = angleBetweenCenters - u1 - (maxSpread - u1) * v;
  const angle3 =
    angleBetweenCenters + Math.PI - u2 - (Math.PI - u2 - maxSpread) * v;
  const angle4 =
    angleBetweenCenters - Math.PI + u2 + (Math.PI - u2 - maxSpread) * v;

  // Point locations
  const p1 = getVector(center1, angle1, radius1);
  const p2 = getVector(center1, angle2, radius1);
  const p3 = getVector(center2, angle3, radius2);
  const p4 = getVector(center2, angle4, radius2);

  // Define handle length by the distance between both ends of the curve
  const totalRadius = radius1 + radius2;
  const d2Base = Math.min(v * handleSize, p1.distanceTo(p3) / totalRadius);
  // console.log(p1, p3, d2Base);
  // Take into account when circles are overlapping
  const d2 = d2Base * Math.min(1, (d * 2) / (radius1 + radius2));

  // console.log(d);
  // console.log(radius1, radius2);

  // Length of the handles
  const r1 = radius1 * d2;
  const r2 = radius2 * d2;

  // Handle locations
  const h1 = getVector(p1, angle1 - HALF_PI, r1);
  const h2 = getVector(p2, angle2 + HALF_PI, r1);
  const h3 = getVector(p3, angle3 + HALF_PI, r2);
  const h4 = getVector(p4, angle4 - HALF_PI, r2);

  // Generate the connector path

  // console.log(p1);

  // return metaballToPath(p1, p2, p3, p4, h1, h2, h3, h4, d > radius1, radius2);

  return [
    { type: "M", a: p1, c1: p1, c2: p1 },
    { type: "C", a: p3, c1: h1, c2: h3 },
    { type: "M", a: p4, c1: p4, c2: p4 },
    { type: "C", a: p2, c1: h4, c2: h2 },
  ];
};

// // prettier-ignore
// function metaballToPath(p1, p2, p3, p4, h1, h2, h3, h4, escaped, r) {
//   // const test = [
//   //   'M', p1.x, p1.y,
//   //   'C', h1.x, h1.y, h3.x, h3.y, p3.x, p3.y,
//   //   'A', r, r, 0, escaped ? 1 : 0, 0, p4.x, p4.y,
//   //   'C', h4.x, h4.y, h2.x, h2.y, p2.x, p2.y,
//   // ].join(' ')
//   // return test

//   // console.log(p1, p2, p3, p4, h1, h2, h3, h4, escaped, r)

//   // return {
//   //   path: new Path2D([
//   //   'M', p1.x, p1.y,
//   //   'C', h1.x, h1.y, h3.x, h3.y, p3.x, p3.y,
//   //   // 'A', r/2, r/2, 0, escaped ? 1 : 0, 0, p4.x, p4.y,
//   //   'L', p4.x, p4.y,
//   //   'C', h4.x, h4.y, h2.x, h2.y, p2.x, p2.y,
//   //   'Z'
//   // ].join(' ')), points: [p1, p2, p3, p4], controls: [h1, h2, h3, h4], p: [
//   //     { type: 'M', a: p1 },
//   //     { type: 'C', a: p3, c1: h1, c2: h3 },
//   //     { type: 'M', a: p4 },
//   //     { type: 'C', a: p2, c1: h4, c2: h2 },
//   //   ]};
// }
