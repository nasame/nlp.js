/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const { Clonable } = require('@nlpjs/core');

class Nlu extends Clonable {
  constructor(settings = {}, container) {
    super({ settings: {} }, container);
    this.applySettings(this.settings, settings);
    this.applySettings(this.settings, {
      locale: 'en',
      keepStopwords: true,
      nonefeatureValue: 1,
      nonedeltaMultiplier: 1.2,
      spellcheckDistance: 0,
    });
    this.applySettings(this, {
      pipelinePrepare: [
        'normalize',
        'tokenize',
        'removeStopwords',
        'stem',
        'output.tokens',
      ],
    });
  }

  async prepare(text, settings) {
    if (typeof text === 'string') {
      const input = {
        locale: this.locale,
        text,
        settings: settings || this.settings,
      };
      return this.runPipeline(input, this.pipelinePrepare);
    }
    if (typeof text === 'object') {
      if (Array.isArray(text)) {
        const result = [];
        for (let i = 0; i < text.length; i += 1) {
          result.push(await this.prepare(text[i], settings));
        }
        return result;
      }
      const item = text.text || text.utterance || text.texts || text.utterances;
      if (item) {
        const result = await this.prepare(item, settings);
        return { tokens: result, ...text };
      }
    }
    throw new Error(
      `Error at nlu.prepare: expected a text but received ${text}`
    );
  }
}

module.exports = Nlu;
