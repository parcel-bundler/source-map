import assert from 'assert';
import { normalizePath, relatifyPath } from '../src/utils';

describe('Utilities', () => {
  describe('win32', function() {
    let platform = process.platform;

    before(() => {
      Object.defineProperty(process, 'platform', {value: 'win32'});
    });

    after(() => {
      Object.defineProperty(process, 'platform', {value: platform});
    });

    it('Relative path', async () => {
      let result = relatifyPath('D:\\test\\sub-dir\\file.js', 'D:\\test\\sub-dir\\');
      assert.equal(result, './file.js');
    });

    it('Normalize path', async () => {
      let result = normalizePath('D:\\test\\sub-dir\\file.js');
      assert.equal(result, '/test/sub-dir/file.js');
    });
  });

  describe('posix', function () {
    it('Relative path', async () => {
      let result = relatifyPath('/test/sub-dir/file.js', '/test/sub-dir/');
      assert.equal(result, './file.js');
    });

    it('Normalize path', async () => {
      let result = normalizePath('/test/sub-dir/file.js');
      assert.equal(result, '/test/sub-dir/file.js');
    });
  });
});
