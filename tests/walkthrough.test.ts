import { describe, expect, it } from 'vitest';
import { Game } from '../src/engine';
import { MAX_SCORE, ROOMS } from '../src/world';
import { DIRS } from '../src/types';
import { WALKTHROUGH } from '../src/walkthrough';

const run = (g: Game, cmd: string) =>
  g
    .exec(cmd)
    .map((o) => o.text)
    .join('\n');

describe('walkthrough', () => {
  it('can be completed with a perfect score', () => {
    const g = new Game();
    g.start();
    for (const cmd of WALKTHROUGH) run(g, cmd);
    expect(g.state.won).toBe(true);
    expect(g.state.score).toBe(MAX_SCORE);
  });
});

describe('world', () => {
  it('every exit leads to a real room', () => {
    for (const room of Object.values(ROOMS)) {
      for (const d of DIRS) {
        const dest = room.exits[d];
        if (dest) expect(ROOMS[dest], `${room.id} ${d}`).toBeDefined();
      }
    }
  });
});

describe('parser and rules', () => {
  it('understands direction synonyms', () => {
    const g = new Game();
    run(g, 'go north');
    expect(g.state.room).toBe('crossroads');
    run(g, 'walk to the s');
    expect(g.state.room).toBe('cottage');
  });

  it('bounces the player out of the crypt without light', () => {
    const g = new Game();
    g.state.room = 'cloister';
    const text = run(g, 'down');
    expect(text).toMatch(/scramble back up/);
    expect(g.state.room).toBe('cloister');
  });

  it('hides items in the dark', () => {
    const g = new Game();
    g.state.flags.ropeTied = true;
    g.state.room = 'well';
    run(g, 'd');
    expect(run(g, 'take key')).toMatch(/too dark/);
    expect(g.state.items.key).toBe('wellbottom');
  });

  it('blocks the gate until unlocked', () => {
    const g = new Game();
    g.state.room = 'abbeygate';
    expect(run(g, 'n')).toMatch(/locked/);
    g.state.items.key = 'inv';
    run(g, 'open gate');
    run(g, 'n');
    expect(g.state.room).toBe('cloister');
  });

  it('Wen Kard hands over the rope and answers questions', () => {
    const g = new Game();
    g.state.room = 'ferryhut';
    expect(run(g, 'talk to wen')).toMatch(/Wen Kard/);
    expect(g.state.items.rope).toBe('inv');
    expect(run(g, 'ask wen about tom')).toMatch(/Six years/);
    expect(run(g, 'ask wen about turnips')).toMatch(/not a priest/);
  });

  it('supports again and unknown verbs', () => {
    const g = new Game();
    run(g, 'n');
    run(g, 's');
    run(g, 'g');
    expect(g.state.room).toBe('cottage');
    expect(run(g, 'frobnicate')).toMatch(/don't know how/);
  });

  it('answers whacky verbs with flavor text', () => {
    const g = new Game();
    expect(run(g, 'smell cake')).toMatch(/Clove and nutmeg/);
    expect(run(g, 'lick the lantern')).toMatch(/Brass and soot/);
    expect(run(g, 'finger the table')).toMatch(/warm in one place/);
    expect(run(g, 'sniff')).toMatch(/Peat smoke/);
    expect(run(g, 'listen to the door')).toMatch(/ear to it too/);
    expect(run(g, 'kick fire')).toMatch(/face in them/);
    expect(run(g, 'roll')).toMatch(/roll about in the frost/);
    g.state.room = 'stones';
    expect(run(g, 'dance')).toMatch(/turned to stone/);
    expect(run(g, 'lick the girl')).toMatch(/Absolutely not/);
    g.state.room = 'ferryhut';
    expect(run(g, 'pull beard')).toMatch(/Everybody checks/);
    expect(run(g, 'fart')).toMatch(/Tom would have loved/);
  });

  it('lets senses work by feel in the dark', () => {
    const g = new Game();
    g.state.flags.ropeTied = true;
    g.state.room = 'wellbottom';
    expect(run(g, 'touch key')).toMatch(/So cold it hurts/);
    expect(run(g, 'feel around')).toMatch(/swaying rope/);
    expect(run(g, 'take key')).toMatch(/too dark/);
  });

  it('throws things where they would land', () => {
    const g = new Game();
    g.state.room = 'well';
    g.state.items.key = 'inv';
    g.state.items.lantern = 'inv';
    run(g, 'throw key down the well');
    expect(g.state.items.key).toBe('wellbottom');
    expect(run(g, 'throw lantern')).toMatch(/keep hold of the lantern/);
    expect(g.state.items.lantern).toBe('inv');

    g.state.room = 'belfry';
    g.state.items.candlestick = 'inv';
    run(g, 'hurl candlestick off the tower');
    expect(g.state.items.candlestick).toBe('cloister');

    g.state.room = 'stones';
    g.state.items.cake = 'inv';
    run(g, 'throw cake at girl');
    expect(g.state.flags.childFed).toBe(true);
  });
});
