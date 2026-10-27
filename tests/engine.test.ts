import { describe, expect, it } from 'vitest';
import { Game, type Story } from '../src/engine';

/** A tiny story, to prove the engine knows nothing about The Silent Bell. */
const LIGHTHOUSE: Story = {
  id: 'lighthouse',
  title: 'The Lighthouse',
  subtitle: 'A test.',
  start: 'shore',
  maxScore: 20,
  rooms: {
    shore: {
      id: 'shore',
      name: 'Shore',
      description: 'Pebbles. A lighthouse stands north.',
      exits: { north: 'lamproom' },
      senses: { smell: 'Brine.' },
      acts: { dance: 'You dance on the pebbles. A gull judges you.' },
      throwTargets: [{ match: /\bsea\b/, to: 'nowhere', text: 'The sea swallows the {item}.' }],
      scenery: {
        'keeper|man|him': {
          look: 'An old keeper with one eye.',
          person: true,
          talk: { topics: [[/lamp|light/, '“Wind it, or ships die.”']], fallback: '“Hm.”' },
          on: { smell: 'Pipe smoke.', take: '“Hands off.”' },
        },
        pebbles: { look: 'Gray and round.', on: { roll: 'They clack together.' } },
      },
    },
    lamproom: {
      id: 'lamproom',
      name: 'Lamp Room',
      description: 'A great lamp with a crank.',
      exits: { south: 'shore' },
      dark: true,
      scenery: { 'lamp|crank': 'Brass and glass.' },
    },
  },
  items: {
    apple: {
      id: 'apple',
      name: 'red apple',
      nouns: ['red apple', 'apple'],
      start: 'shore',
      treasure: 10,
      description: 'Shiny.',
      on: { smell: 'Sweet.', eat: 'Crisp.' },
    },
    torch: {
      id: 'torch',
      name: 'torch',
      nouns: ['torch'],
      start: 'inv',
      lightSource: true,
      description: 'A torch.',
    },
  },
  verbs: { wind: 'wind', crank: 'wind' },
  acts: { polka: { verbs: ['polka'], text: 'You polka, badly.' } },
  rules: [
    { on: 'give', obj: 'apple', second: 'keeper', do: (g) => ((g.state.items.apple = 'nowhere'), g.say('He eats it.'), true) },
    {
      on: 'wind',
      obj: 'lamp',
      do: (g) => {
        g.say('The beam sweeps out across the sea.');
        g.award('lamp', 10);
        g.win();
        return true;
      },
    },
  ],
};

const run = (g: Game, cmd: string) =>
  g
    .exec(cmd)
    .map((o) => o.text)
    .join('\n');

describe('engine with another story', () => {
  it('answers flavor verbs from the story’s own objects', () => {
    const g = new Game(LIGHTHOUSE);
    expect(run(g, 'sniff apple')).toMatch(/Sweet/);
    expect(run(g, 'smell')).toMatch(/Brine/);
    expect(run(g, 'smell keeper')).toMatch(/Pipe smoke/);
    expect(run(g, 'roll pebbles')).toMatch(/clack/);
    expect(run(g, 'lick pebbles')).toMatch(/put your tongue|lick/i);
    expect(run(g, 'take keeper')).toMatch(/Hands off/);
    expect(run(g, 'dance')).toMatch(/gull/);
    expect(run(g, 'polka')).toMatch(/badly/);
  });

  it('runs conversations, rules, throwing and darkness', () => {
    const g = new Game(LIGHTHOUSE);
    expect(run(g, 'ask keeper about the lamp')).toMatch(/Wind it/);
    expect(run(g, 'talk')).toMatch(/Hm/);
    run(g, 'take apple');
    expect(g.state.score).toBe(10);
    expect(run(g, 'give apple to man')).toMatch(/He eats it/);

    run(g, 'n');
    expect(g.isDark()).toBe(true);
    expect(run(g, 'light torch')).toMatch(/You light the torch/);
    expect(g.isDark()).toBe(false);
    run(g, 'crank the lamp');
    expect(g.state.won).toBe(true);
    expect(g.state.score).toBe(20);
  });

  it('lands thrown things where the room says', () => {
    const g = new Game(LIGHTHOUSE);
    run(g, 'take apple');
    expect(run(g, 'throw apple into the sea')).toMatch(/swallows the red apple/);
    expect(g.state.items.apple).toBe('nowhere');
  });
});
