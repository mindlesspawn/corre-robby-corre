// Little faces for the shapes, and eyes for the numbers, on the doors and in the banner.
// They are only there to make the game friendlier: the face never changes the outline of
// a shape or covers a number, so what the child has to look at stays the same.

const spots = new Map();
let probe = null;

// Where a shape's face goes: the biggest round space inside it. The shape is an outline
// inside a 100 x 100 box (see SHAPES in questions.js). Worked out once for each outline.
export function faceSpot(outline) {
  if (spots.has(outline)) return spots.get(outline);
  probe ??= document.createElement('canvas').getContext('2d');
  const path = new Path2D(outline);
  const inside = (x, y) => probe.isPointInPath(path, x, y);

  // Of the places with the most room, the one nearest the middle wins, so the face on a
  // long shape sits in its centre and not at one end.
  const offCentre = (x, y) => Math.hypot(x - 50, y - 50) * 0.04;
  let best = { x: 50, y: 50, r: 0, score: 0 };
  for (let y = 8; y <= 92; y += 3) {
    for (let x = 8; x <= 92; x += 3) {
      if (!inside(x, y)) continue;
      // How far this point is from the edge, looking in sixteen directions.
      let room = 60;
      for (let k = 0; k < 16 && room - offCentre(x, y) > best.score; k++) {
        const dx = Math.cos((k * Math.PI) / 8);
        const dy = Math.sin((k * Math.PI) / 8);
        let reach = 0;
        while (reach < room && inside(x + dx * (reach + 1.5), y + dy * (reach + 1.5))) reach += 1.5;
        room = Math.min(room, reach);
      }
      const score = room - offCentre(x, y);
      if (score > best.score) best = { x, y, r: room, score };
    }
  }
  spots.set(outline, best);
  return best;
}

// The parts of a face of a given size, centred on a point: two eyes, two pupils, a smile.
export function faceParts(x, y, r) {
  const eyes = [-1, 1].map((side) => ({ x: x + side * 0.36 * r, y: y - 0.14 * r, r: 0.25 * r }));
  const pupils = eyes.map((eye) => ({ x: eye.x + 0.04 * r, y: eye.y + 0.03 * r, r: 0.12 * r }));
  const smile = { x, y: y + 0.1 * r, r: 0.42 * r, from: 0.2 * Math.PI, to: 0.8 * Math.PI, width: 0.12 * r };
  return { eyes, pupils, smile };
}

function disc(g, { x, y, r }) {
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
}

// Draws a face on a canvas. "light" is the color of the eyes and smile, "dark" of the pupils.
export function drawFace(g, x, y, r, light, dark) {
  const { eyes, pupils, smile } = faceParts(x, y, r);
  g.fillStyle = light;
  eyes.forEach((eye) => disc(g, eye));
  g.fillStyle = dark;
  pupils.forEach((pupil) => disc(g, pupil));
  g.strokeStyle = light;
  g.lineWidth = smile.width;
  g.lineCap = 'round';
  g.beginPath();
  g.arc(smile.x, smile.y, smile.r, smile.from, smile.to);
  g.stroke();
}

// Two googly eyes side by side, for sitting on top of a number. "ring" is the color of
// the number, so the eyes look like part of it.
export function drawEyes(g, x, y, r, ring, white) {
  for (const side of [-1, 1]) {
    const eye = { x: x + side * r * 1.08, y, r };
    g.fillStyle = ring;
    disc(g, eye);
    g.fillStyle = white;
    disc(g, { ...eye, r: r * 0.72 });
    g.fillStyle = ring;
    disc(g, { x: eye.x + r * 0.12, y: eye.y + r * 0.1, r: r * 0.36 });
  }
}
