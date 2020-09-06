import assert from 'assert';
import { normalizePath, relatifyPath } from '../src/utils';

describe('Utilities', () => {
  it('Relative path - WIN32', async () => {
    let result = relatifyPath('D:\\test\\sub-dir\\file.js', 'D:\\test\\sub-dir\\');
    assert.equal(result, './file.js');
  });

  it('Relative path - POSIX', async () => {
    let result = relatifyPath('\\test\\sub-dir\\file.js', '\\test\\sub-dir\\');
    assert.equal(result, './file.js');
  });

  it('Relative path - POSIX', async () => {
    let result = relatifyPath('/test/sub-dir/file.js', '/test/sub-dir/');
    assert.equal(result, './file.js');
  });

  it('Normalize path - WIN32', async () => {
    let result = normalizePath('D:\\test\\sub-dir\\file.js');
    assert.equal(result, '/test/sub-dir/file.js');
  });

  it('Normalize path - POSIX', async () => {
    let result = normalizePath('\\test\\sub-dir\\file.js');
    assert.equal(result, '/test/sub-dir/file.js');
  });

  it('Normalize path - POSIX', async () => {
    let result = normalizePath('/test/sub-dir/file.js');
    assert.equal(result, '/test/sub-dir/file.js');
  });
});
