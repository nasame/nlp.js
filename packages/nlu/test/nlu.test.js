const {
  Container,
  Normalizer,
  Tokenizer,
  Stemmer,
  Stopwords,
} = require('@nlpjs/core');
const Nlu = require('../src/nlu');

function bootstrap() {
  const container = new Container();
  container.use(Normalizer);
  container.use(Tokenizer);
  container.use(Stemmer);
  container.use(Stopwords);
  return container;
}

describe('NLU', () => {
  describe('Constructor', () => {
    test('An instance can be created', () => {
      const nlu = new Nlu();
      expect(nlu).toBeDefined();
    });
    test('Some settings are by default', () => {
      const nlu = new Nlu();
      expect(nlu.settings.locale).toEqual('en');
      expect(nlu.settings.keepStopwords).toBeTruthy();
      expect(nlu.settings.nonefeatureValue).toEqual(1);
      expect(nlu.settings.nonedeltaMultiplier).toEqual(1.2);
      expect(nlu.settings.spellcheckDistance).toEqual(0);
    });
    test('The settings can be provided in constructor', () => {
      const nlu = new Nlu({ locale: 'fr', keepStopwords: false });
      expect(nlu.settings.locale).toEqual('fr');
      expect(nlu.settings.keepStopwords).toBeFalsy();
      expect(nlu.settings.nonefeatureValue).toEqual(1);
      expect(nlu.settings.nonedeltaMultiplier).toEqual(1.2);
      expect(nlu.settings.spellcheckDistance).toEqual(0);
    });
  });

  describe('Prepare', () => {
    test('Prepare will generate an array of tokens', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, bootstrap());
      const input = 'Allí hay un ratón';
      const actual = await nlu.prepare(input);
      expect(actual).toEqual(['alli', 'hay', 'un', 'raton']);
    });
    test('Prepare should throw and exception if no text available', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, bootstrap());
      const input = 7;
      await expect(nlu.prepare(input)).rejects.toThrow(
        'Error at nlu.prepare: expected a text but received 7'
      );
    });
    test('Prepare should throw and exception if is an object with no text available', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, bootstrap());
      const input = { something: 'something' };
      await expect(nlu.prepare(input)).rejects.toThrow(
        'Error at nlu.prepare: expected a text but received [object Object]'
      );
    });
    test('Prepare can process an array of strings', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, bootstrap());
      const input = ['Allí hay un ratón', 'y vino el señor doctor'];
      const actual = await nlu.prepare(input);
      expect(actual).toEqual([
        ['alli', 'hay', 'un', 'raton'],
        ['y', 'vino', 'el', 'senor', 'doctor'],
      ]);
    });
    test('Prepare can process an object with text', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, bootstrap());
      const input = { text: 'Allí hay un ratón', intent: 'mouse' };
      const actual = await nlu.prepare(input);
      expect(actual).toEqual({
        text: 'Allí hay un ratón',
        tokens: ['alli', 'hay', 'un', 'raton'],
        intent: 'mouse',
      });
    });
    test('Prepare can process an object with utterance', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, bootstrap());
      const input = { utterance: 'Allí hay un ratón', intent: 'mouse' };
      const actual = await nlu.prepare(input);
      expect(actual).toEqual({
        utterance: 'Allí hay un ratón',
        tokens: ['alli', 'hay', 'un', 'raton'],
        intent: 'mouse',
      });
    });
    test('Prepare can process an array of objects with text', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, bootstrap());
      const input = [
        { text: 'Allí hay un ratón', intent: 'mouse' },
        { text: 'y vino el señor doctor', intent: 'doctor' },
      ];
      const actual = await nlu.prepare(input);
      expect(actual).toEqual([
        {
          text: 'Allí hay un ratón',
          tokens: ['alli', 'hay', 'un', 'raton'],
          intent: 'mouse',
        },
        {
          text: 'y vino el señor doctor',
          tokens: ['y', 'vino', 'el', 'senor', 'doctor'],
          intent: 'doctor',
        },
      ]);
    });
    test('Prepare can process an array of objects with utterance', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, bootstrap());
      const input = [
        { utterance: 'Allí hay un ratón', intent: 'mouse' },
        { utterance: 'y vino el señor doctor', intent: 'doctor' },
      ];
      const actual = await nlu.prepare(input);
      expect(actual).toEqual([
        {
          utterance: 'Allí hay un ratón',
          tokens: ['alli', 'hay', 'un', 'raton'],
          intent: 'mouse',
        },
        {
          utterance: 'y vino el señor doctor',
          tokens: ['y', 'vino', 'el', 'senor', 'doctor'],
          intent: 'doctor',
        },
      ]);
    });
    test('Prepare can process an object with texts array', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, bootstrap());
      const input = {
        intent: 'doctor',
        texts: ['Y vino el señor doctor', 'manejando un cuatrimotor'],
      };
      const actual = await nlu.prepare(input);
      expect(actual).toEqual({
        intent: 'doctor',
        texts: ['Y vino el señor doctor', 'manejando un cuatrimotor'],
        tokens: [
          ['y', 'vino', 'el', 'senor', 'doctor'],
          ['manejando', 'un', 'cuatrimotor'],
        ],
      });
    });
    test('Prepare can process an object with utterances array', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, bootstrap());
      const input = {
        intent: 'doctor',
        utterances: ['Y vino el señor doctor', 'manejando un cuatrimotor'],
      };
      const actual = await nlu.prepare(input);
      expect(actual).toEqual({
        intent: 'doctor',
        utterances: ['Y vino el señor doctor', 'manejando un cuatrimotor'],
        tokens: [
          ['y', 'vino', 'el', 'senor', 'doctor'],
          ['manejando', 'un', 'cuatrimotor'],
        ],
      });
    });
    test('Prepare can process an array of objects with texts array', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, bootstrap());
      const input = [
        {
          intent: 'doctor',
          utterances: ['Y vino el señor doctor', 'manejando un cuatrimotor'],
        },
        {
          intent: 'mouse',
          utterances: ['Ahí hay un ratón'],
        },
      ];
      const actual = await nlu.prepare(input);
      expect(actual).toEqual([
        {
          intent: 'doctor',
          utterances: ['Y vino el señor doctor', 'manejando un cuatrimotor'],
          tokens: [
            ['y', 'vino', 'el', 'senor', 'doctor'],
            ['manejando', 'un', 'cuatrimotor'],
          ],
        },
        {
          intent: 'mouse',
          utterances: ['Ahí hay un ratón'],
          tokens: [['ahi', 'hay', 'un', 'raton']],
        },
      ]);
    });
  });
});
