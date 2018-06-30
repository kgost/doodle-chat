import { EmojifyPipe } from './emojify.pipe';

describe('EmojifyPipe', () => {
  it('create an instance', () => {
    const pipe = new EmojifyPipe();
    expect(pipe).toBeTruthy();
  });
});
