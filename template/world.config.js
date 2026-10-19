// The whole world as data. The skill rewrites this file from the interview + reference image.
// Grid units 0..size on x (left→right) and z (top→bottom of the plan); zones are centred on (x, z).
export const WORLD = {
  title: 'Sample Campus',
  intro: 'A small 3D world. Click a building to learn what happens inside.',
  size: 24,
  seed: 11,
  trees: 40,
  colors: {
    ground: '#B7D18C', trim: '#7AA342', floor: '#E6EBE6', haze: '#E8EEF2', path: '#E6DCC8',
    accent: '#66518A', foliage: ['#7DB04E', '#6FA347', '#8DBA4E', '#5E9A3E'],
  },
  // [x, z, w, d, colour]: lawns, plazas, water, sand… drawn flat on the ground
  areas: [[3, 3, 18, 18, '#BCD794']],
  // [x, z, w, d]: paved paths (top-left corner + size)
  paths: [[3, 11.3, 18, 1.4], [11.3, 3, 1.4, 18]],
  zones: [
    { id: 'gate', name: 'Main Gate', kicker: 'START HERE', x: 6, z: 6, w: 3.6, d: 3.2, h: 1.5, color: '#F0973A', blurb: 'Where visitors arrive.', facts: [['Open', '9am–6pm']] },
    { id: 'lab', name: 'Lab', x: 18, z: 6, w: 4.2, d: 3.4, h: 1.7, color: '#8DBA4E', roof: 'flat', blurb: 'Where ideas get built.' },
    { id: 'hall', name: 'Hall', x: 12, z: 18, w: 5.6, d: 3.6, h: 2.3, color: '#7B63A6', blurb: 'Where results are shown.' },
  ],
};
