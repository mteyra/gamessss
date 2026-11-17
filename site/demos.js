// Short, user-triggered teaching diagrams. These are conceptual courts, not
// regulation layouts. Every beat has a useful still and at most one brief move.
const INK = '#222522';
const PAPER = '#f2f0e7';
const LIME = '#ddf66a';
const CORAL = '#df765c';
let serial = 0;

const esc = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
}[char]));
const line = (d, color = INK, width = 2, extra = '') =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const outline = extra =>
  `${/(?:^|\s)stroke=/.test(extra) ? '' : `stroke="${INK}"`}${/(?:^|\s)stroke-width=/.test(extra) ? '' : ' stroke-width="1.8"'}`;
const circle = (x, y, r, fill = PAPER, extra = '') =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${outline(extra)} ${extra}/>`;
const box = (x, y, w, h, fill = 'none', r = 6, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${outline(extra)} ${extra}/>`;
const text = (x, y, value, size = 11, extra = '') =>
  `<text x="${x}" y="${y}" fill="${INK}" font-size="${size}" ${extra}>${esc(value)}</text>`;
const centered = (x, y, value, size = 11, extra = '') =>
  text(x, y, value, size, `text-anchor="middle" ${extra}`);
const pill = (x, y, value, fill = LIME, width = value.length * 6.9 + 24) =>
  `${box(x - width / 2, y - 15, width, 28, fill, 14)}${centered(x, y + 3, value, 10.5, 'font-weight="800" letter-spacing=".4"')}`;
const player = (x, y, fill = LIME, letter = '', radius = 13) => {
  const detail = fill === INK ? PAPER : INK;
  return `<g transform="translate(${x} ${y})">${circle(1, 3, radius, INK, 'opacity=".12" stroke="none"')}${circle(0, 0, radius, fill)}${letter
    ? `<text x="0" y="4" fill="${detail}" font-size="10" text-anchor="middle" font-weight="800">${esc(letter)}</text>`
    : line('M-4 -1v2M4 -1v2', detail, 2)}</g>`;
};
const ball = (x = 0, y = 0, radius = 8) =>
  `<g>${circle(x, y, radius, LIME)}${line(`M${x - radius + 1} ${y - 2}q${radius - 1} 6 ${radius * 2 - 2} 0M${x} ${y - radius}q-4 ${radius} 0 ${radius * 2}`, INK, 1)}</g>`;
const burst = (x, y, radius = 15) =>
  line(`M${x - radius} ${y}h-5M${x + radius} ${y}h5M${x} ${y - radius}v-5M${x} ${y + radius}v5M${x - radius * .7} ${y - radius * .7}l-4-4M${x + radius * .7} ${y - radius * .7}l4-4`, INK, 1.6);
const arrow = (d, ctx, extra = '') =>
  line(d, INK, 1.6, `stroke-dasharray="4 6" marker-end="url(#${ctx.id})" ${extra}`);
const court = (split = true) =>
  `${box(35, 62, 430, 197, 'none', 10)}${split ? line('M250 62V259', INK, 1.2, 'stroke-dasharray="5 7" opacity=".55"') : ''}`;
const footer = value =>
  centered(250, 293, value, 10, 'font-weight="700" letter-spacing=".5"');

function moving(markup, path, destination, ctx) {
  if (!ctx.animate) return `<g transform="translate(${destination[0]} ${destination[1]})">${markup}</g>`;
  return `<g>${markup}<animateMotion path="${path}" dur="620ms" begin="0s" repeatCount="1" fill="freeze" calcMode="paced"/></g>`;
}

function reduceMotion() {
  return typeof globalThis.matchMedia === 'function'
    && globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function demo(id, title, steps, draw) {
  return {
    steps,
    render(step = 0, { animate = true } = {}) {
      const beat = Number.isFinite(Number(step)) ? Math.max(0, Math.min(2, Math.trunc(Number(step)))) : 0;
      const ctx = { id: `demo-${id}-${serial++}`, animate: Boolean(animate) && !reduceMotion() };
      const dots = [0, 1, 2].map(n => circle(438 + n * 13, 26, 3.5, n === beat ? INK : PAPER, 'stroke-width="1"')).join('');
      return `<svg xmlns="http://www.w3.org/2000/svg" class="diagram-svg teaching-svg" viewBox="0 0 500 310" role="img" aria-label="${esc(`${title}, step ${beat + 1}: ${steps[beat]}`)}" font-family="Manrope, system-ui, sans-serif"><title>${esc(title)}</title><desc>${esc(steps[beat])} Conceptual layout; see the written rules for setup and restarts.</desc><defs><marker id="${ctx.id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse"><path d="M1 1L8 5 1 9" fill="none" stroke="${INK}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>${box(0, 0, 500, 310, PAPER, 16, 'stroke="none"')}${text(28, 30, title.toUpperCase(), 10, 'font-weight="800" letter-spacing="1.2"')}${dots}${draw(beat, ctx)}</svg>`;
    }
  };
}

const hoop = (x, y) =>
  `${line(`M${x - 25} ${y - 13}h50`, INK, 4)}<ellipse cx="${x}" cy="${y}" rx="16" ry="6" fill="none" stroke="${INK}" stroke-width="2"/>${line(`M${x - 14} ${y + 2}l5 23h18l5-23M${x - 5} ${y + 5}l2 20M${x + 5} ${y + 5}l-2 20`, INK, 1)}`;

const hoopRescue = demo('hoop-rescue', 'Hoop rescue', [
  'Shoot at their basket from your own half.',
  'A basket rescues your entire waiting team.',
  'Pause the throws. Everyone gets a free walk home.'
], (step, ctx) => {
  let s = court()
    + box(419, 63, 45, 195, LIME, 8, 'opacity=".34" stroke="none"')
    + text(81, 81, 'YOUR HALF', 9, 'opacity=".65"')
    + line('M418 63V258', INK, 1, 'stroke-dasharray="3 5" opacity=".45"')
    + player(195, 166, LIME, 'S') + player(96, 226) + player(151, 105)
    + player(319, 129, CORAL) + player(328, 197, CORAL) + player(376, 231, CORAL)
    + hoop(384, 98);
  if (step < 2) {
    s += [140, 187, 234].map(y => player(442, y, LIME, 'W', 10)).join('')
      + centered(442, 116, 'WAIT', 8, 'font-weight="800"');
  } else {
    s += centered(441, 188, 'EMPTY', 8, 'font-weight="800"');
  }
  if (step === 0) {
    s += arrow('M208 148Q292 20 373 86', ctx, 'opacity=".6"')
      + moving(ball(), 'M208 148Q222 111 248 91', [248, 91], ctx)
      + footer('THE SHOOTER STAYS BEHIND CENTRE');
  } else if (step === 1) {
    s += arrow('M209 146Q293 20 384 97', ctx, 'opacity=".42"')
      + moving(ball(), 'M248 91Q316 29 384 97L384 108', [384, 108], ctx)
      + burst(384, 100, 23) + pill(319, 55, 'ALL BACK!')
      + footer('ONE BASKET. A WHOLE-TEAM COMEBACK.');
  } else {
    s += arrow('M444 235Q448 278 296 275T147 223', ctx, 'opacity=".55"')
      + moving(player(-10, -20) + player(8, 3) + player(-10, 26),
        'M439 181Q466 266 309 273T148 182', [148, 182], ctx)
      + pill(318, 55, 'RESCUED')
      + footer('FREE WALK HOME · THEN RESTART PLAY');
  }
  return s;
});

const noodleKeeper = demo('noodle-keeper', 'Noodle keeper', [
  'Roll low toward the opposing goal.',
  'The keeper intercepts with a noodle held low.',
  'Noodle contact is a block. The keeper stays in.'
], (step, ctx) => {
  let s = court()
    + box(388, 118, 76, 86, CORAL, 7, 'opacity=".12" stroke="none"')
    + line('M449 126h15v72h-15', INK, 4)
    + line('M451 134h12M451 147h12M451 160h12M451 173h12M451 186h12', INK, 1, 'opacity=".35"')
    + centered(425, 224, 'GOAL', 9, 'font-weight="800"')
    + player(411, 163, CORAL, 'K', 15)
    + player(176, 176, LIME) + player(91, 105, LIME)
    + player(110, 226, LIME) + player(321, 100, CORAL)
    + player(332, 227, CORAL);
  const noodle = step === 0 ? 'M399 186Q422 195 436 175' : 'M384 140Q361 164 384 188';
  s += line(noodle, INK, 10) + line(noodle, LIME, 6.5);
  if (step === 0) {
    s += arrow('M199 166H382', ctx, 'opacity=".5"')
      + moving(ball(), 'M198 166L283 166', [283, 166], ctx)
      + footer('A GOAL MUST PASS BELOW KNEE HEIGHT');
  } else if (step === 1) {
    s += arrow('M206 166H365', ctx, 'opacity=".45"')
      + moving(ball(), 'M283 166L373 166', [373, 166], ctx)
      + burst(372, 165, 14)
      + footer('LOW NOODLE · SOFT BALL · CLEAR GOAL ZONE');
  } else {
    s += arrow('M368 177Q349 208 316 214', ctx, 'opacity=".55"')
      + moving(ball(), 'M373 166Q352 200 310 216', [310, 216], ctx)
      + pill(319, 55, 'BLOCKED')
      + footer('NO GOAL. NO ELIMINATION. PLAY CONTINUES.');
  }
  return s;
});

const bottle = (x, y, tilt = 0) =>
  `<g transform="translate(${x} ${y}) rotate(${tilt})">${box(-9, -30, 18, 42, PAPER, 5)}${box(-4, -40, 8, 13, PAPER, 2)}${line('M-6 -9H6', CORAL, 4)}</g>`;
const token = (x, y) => circle(x, y, 3.3, LIME, 'stroke-width="1.2"');
const tokenRunner = () => player(0, 0, LIME, '', 11) + token(10, -8);

const flunkyball = demo('flunkyball', 'Flunkyball · tokens', [
  'Hit the centre bottle to start your team’s relay.',
  'Bank one token per runner while opponents reset.',
  'Bottle up, ball home, everyone back: “Stop!”'
], (step, ctx) => {
  let s = court(false)
    + line('M144 73V248M365 73V248', INK, 1.4, 'stroke-dasharray="5 6"')
    + centered(104, 79, 'RELAY', 9, 'font-weight="800"')
    + centered(410, 79, 'RESET', 9, 'font-weight="800"')
    + player(116, 117, LIME) + player(89, 164, LIME)
    + player(125, 229, LIME)
    + box(48, 207, 30, 21, PAPER, 7)
    + centered(63, 247, 'BOWL', 8, 'font-weight="700"')
    + centered(113, 192, 'SUPPLY', 8, 'font-weight="700"')
    + token(105, 202) + token(114, 203) + token(122, 200)
    + (step > 0 ? token(58, 216) + token(67, 219) : '')
    + player(409, 106, CORAL);
  if (step === 0) {
    s += bottle(250, 179, 76)
      + player(67, 112, LIME, '', 11)
      + player(403, 169, CORAL) + player(404, 229, CORAL)
      + moving(ball(), 'M140 123Q205 117 257 164', [257, 164], ctx)
      + burst(251, 166, 24)
      + footer('BOTTLE DOWN → THE RELAY CAN START');
  } else if (step === 1) {
    s += bottle(250, 177)
      + player(278, 181, CORAL) + player(321, 228, CORAL)
      + ball(306, 219)
      + arrow('M112 214Q89 242 63 211', ctx, 'opacity=".6"')
      + arrow('M310 209Q300 146 278 152', ctx, 'opacity=".5"')
      + moving(tokenRunner(), 'M113 211Q87 245 64 205', [64, 205], ctx)
      + footer('ONE RUNNER AT A TIME · RETURN + TAG NEXT');
  } else {
    s += bottle(250, 177)
      + player(403, 169, CORAL) + player(404, 229, CORAL) + ball(417, 163)
      + moving(tokenRunner(), 'M65 204Q87 183 113 213', [113, 213], ctx)
      + pill(250, 99, 'STOP!', CORAL, 91)
      + centered(250, 224, '2 BANKED', 10, 'font-weight="800"')
      + footer('CARRIED TOKEN GOES BACK · ALTERNATE THROWS');
  }
  return s;
});

const disc = (x, y, width = 34, fill = LIME) =>
  box(x - width / 2, y - 3, width, 7, fill, 3, 'stroke-width="1.5"');
const stack = (x, y, count) =>
  Array.from({ length: count }, (_, n) => disc(x, y - n * 7, 43 - n * 3, n % 2 ? PAPER : LIME)).join('');

const lagori = demo('lagori', 'Lagori · seven discs', [
  'Topple the seven-disc stack.',
  'Attackers rebuild. Defenders recover and pass.',
  'All seven back up? Call “Lagori!” for one point.'
], (step, ctx) => {
  let s = court(false)
    + circle(250, 172, 79, 'none', 'stroke-dasharray="3 7" opacity=".25"')
    + player(113, 100, LIME) + player(401, 217, CORAL)
    + player(386, 97, CORAL);
  if (step === 0) {
    s += player(110, 181, LIME) + player(337, 226, LIME)
      + player(313, 96, CORAL)
      + [[217, 180], [240, 193], [275, 182], [266, 152], [230, 151], [212, 164], [283, 207]]
        .map(([x, y], n) => disc(x, y, 28, n % 2 ? PAPER : LIME)).join('')
      + moving(ball(), 'M130 173Q187 150 248 170', [248, 170], ctx)
      + burst(250, 171, 42)
      + footer('UP TO THREE THROWS · MISS ALL THREE? SWAP.');
  } else if (step === 1) {
    s += player(141, 222, LIME) + player(332, 127, CORAL)
      + ball(314, 140) + stack(250, 186, 3)
      + disc(219, 190, 28, PAPER) + disc(217, 163, 25)
      + disc(269, 152, 28, PAPER) + disc(285, 180, 26)
      + arrow('M331 145Q375 141 397 194', ctx, 'opacity=".6"')
      + moving(player(0, 0, LIME), 'M337 226Q311 236 278 211', [278, 211], ctx)
      + footer('DEFENDERS AIM GENTLY BELOW KNEES · GIVE SPACE');
  } else {
    s += player(141, 222, LIME) + player(278, 211, LIME)
      + player(332, 127, CORAL) + ball(314, 140)
      + stack(250, 186, 6)
      + moving(disc(0, 0, 25), 'M218 164Q217 123 250 144', [250, 144], ctx)
      + pill(249, 95, 'LAGORI! +1', LIME, 129)
      + footer('ROUND OVER · RESET THE STACK + SWAP ROLES');
  }
  return s;
});

const khoKho = demo('kho-kho', 'Kho kho · pass the chase', [
  'Approach a seated teammate from behind.',
  'Tap their back, call “kho”, then take their seat.',
  'They chase on the side they face. Keep running!'
], (step, ctx) => {
  let s = court(false)
    + box(65, 145, 372, 24, INK, 0, 'opacity=".045" stroke="none"')
    + line('M65 157H436', INK, 1)
    + circle(65, 157, 6, CORAL) + circle(437, 157, 6, CORAL)
    + [120, 169, 218, 267, 316, 365].map((x, index) =>
      player(x, 157, PAPER, index % 2 ? '↓' : '↑', 13)).join('')
    + player(step === 2 ? 190 : 179, 91, LIME, 'R')
    + player(115, 223, LIME, 'R') + player(392, 90, LIME, 'R');
  if (step === 0) {
    s += arrow('M397 230Q345 230 316 185', ctx, 'opacity=".5"')
      + moving(player(0, 0, CORAL, 'C', 15), 'M398 229Q359 223 316 185', [316, 185], ctx)
      + footer('SEATED PLAYERS FACE ALTERNATE SIDES');
  } else if (step === 1) {
    s += pill(378, 210, 'KHO!', CORAL, 76)
      + burst(316, 179, 9)
      + circle(316, 157, 19, 'none', 'stroke-dasharray="3 4" opacity=".5"')
      + arrow('M316 131V96', ctx, 'opacity=".45"')
      + moving(player(0, 0, CORAL, 'C', 15), 'M316 138L316 107', [316, 107], ctx)
      + footer('OLD CHASER SITS · NEW CHASER GETS UP');
  } else {
    s += arrow('M312 99Q265 65 217 89', ctx, 'opacity=".5"')
      + moving(player(0, 0, CORAL, 'C', 15), 'M316 107Q275 70 237 99', [237, 99], ctx)
      + footer('ACTIVE CHASER CROSSES THE LANE ONLY AT AN END');
  }
  return s;
});

const frame = (x, y, flip = false) =>
  `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)">${line('M-12 24L2-25 24-18 10 30Z', INK, 3)}${line('M-7 15L16-13M-3 0L20-8M0-13L16 16M7-21L20-1', INK, 1)}</g>`;

const tchoukball = demo('tchoukball', 'Tchoukball · use the rebound', [
  'Shoot at either frame. Nobody blocks the pass.',
  'Floor outside the forbidden arc: one point.',
  'Alternative: a clean catch starts their attack.'
], (step, ctx) => {
  let s = court(false)
    + `<path d="M35 81A79 79 0 0 1 35 239Z" fill="${CORAL}" opacity=".13"/>`
    + line('M35 81A79 79 0 0 1 35 239', INK, 1.3, 'stroke-dasharray="4 5"')
    + line('M465 81A79 79 0 0 0 465 239', INK, 1.3, 'stroke-dasharray="4 5" opacity=".5"')
    + frame(58, 160) + frame(442, 160, true)
    + centered(74, 216, 'ARC', 8, 'font-weight="800"')
    + player(219, 222, LIME) + player(352, 207, LIME)
    + player(344, 110, CORAL);
  if (step === 0) {
    s += player(274, 94, CORAL)
      + arrow('M199 204L72 164 173 110', ctx, 'opacity=".6"')
      + moving(ball(), 'M198 204L71 163', [71, 163], ctx)
      + footer('THE FRAME SENDS THE BALL BACK INTO COURT');
  } else if (step === 1) {
    s += player(274, 94, CORAL)
      + arrow('M75 159L167 112', ctx, 'opacity=".5"')
      + circle(175, 108, 17, 'none', 'opacity=".3"')
      + circle(175, 108, 24, 'none', 'opacity=".15"')
      + moving(ball(), 'M71 163L175 108', [175, 108], ctx)
      + pill(292, 166, '+1', LIME, 57)
      + footer('FLOOR OUTSIDE THE ARC · CONCEDING TEAM RESTARTS');
  } else {
    s += player(175, 91, CORAL, '', 14)
      + line('M156 100Q148 120 166 121M194 100Q204 119 184 121', INK, 2)
      + arrow('M75 159L163 113', ctx, 'opacity=".5"')
      + moving(ball(), 'M71 163L175 111', [175, 111], ctx)
      + pill(283, 166, 'CAUGHT', CORAL, 100)
      + footer('NO POINT · THE CATCHING TEAM ATTACKS');
  }
  return s;
});

const bigBall = () =>
  `${circle(0, 0, 34, PAPER)}${line('M-29-17Q0 2 31-13M-8-33Q-29 0 3 34M20-26Q4 2 24 24', INK, 1.4)}${circle(-10, -13, 3, LIME, 'stroke="none"')}`;

const kinBall = demo('kin-ball', 'Kin-ball · call the colour', [
  'Three support. The hitter calls “Omnikin, coral!”',
  'Only the called team must control the incoming ball.',
  'Catch before the floor. Your team calls and hits next.'
], (step, ctx) => {
  let s = court(false)
    + [ [231, 91], [274, 92], [232, 232], [275, 234] ]
      .map(([x, y]) => player(x, y, INK, '', 10)).join('');
  if (step < 2) {
    s += player(110, 183, LIME, '', 11) + player(147, 196, LIME, '', 11)
      + player(180, 181, LIME, '', 11) + player(92, 122, LIME, 'H', 11)
      + player(316, 125, CORAL, '', 11) + player(389, 130, CORAL, '', 11)
      + player(322, 214, CORAL, '', 11) + player(401, 210, CORAL, '', 11);
  } else {
    s += player(110, 117, LIME, '', 11) + player(105, 206, LIME, '', 11)
      + player(179, 100, LIME, '', 11) + player(174, 218, LIME, '', 11)
      + player(319, 187, CORAL, '', 11) + player(355, 198, CORAL, '', 11)
      + player(389, 182, CORAL, '', 11) + player(308, 115, CORAL, 'H', 11);
  }
  if (step === 0) {
    s += `<ellipse cx="145" cy="179" rx="33" ry="8" fill="${INK}" opacity=".1"/>`
      + moving(bigBall(), 'M145 163L145 146', [145, 146], ctx)
      + pill(320, 55, 'OMNIKIN, CORAL!', CORAL, 170)
      + footer('NAME ANOTHER TEAM BEFORE HITTING');
  } else if (step === 1) {
    s += arrow('M170 124Q241 60 325 123', ctx, 'opacity=".55"')
      + `<ellipse cx="350" cy="199" rx="33" ry="8" fill="${INK}" opacity=".1"/>`
      + moving(bigBall(), 'M145 146Q247 50 350 153', [350, 153], ctx)
      + pill(320, 55, 'CORAL, YOUR BALL', CORAL, 180)
      + footer('HIT OUTWARD OR UPWARD · EVERYONE ELSE GIVES SPACE');
  } else {
    s += `<ellipse cx="350" cy="185" rx="33" ry="8" fill="${INK}" opacity=".1"/>`
      + moving(bigBall(), 'M350 173L350 148', [350, 148], ctx)
      + pill(350, 55, 'OMNIKIN, LIME!', LIME, 166)
      + footer('CONTROLLED → PREPARE THE NEXT HIT');
  }
  return s;
});

export const DEMOS = {
  'hoop-rescue': hoopRescue,
  'noodle-keeper': noodleKeeper,
  flunkyball,
  lagori,
  'kho-kho': khoKho,
  tchoukball,
  'kin-ball': kinBall
};
