const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_ROOT = path.join(ROOT, 'src');
const BANNED_AUTH_APIS = [
  'getUserProfile',
  'getPhoneNumber',
  'chooseAvatar',
  'scope.userInfo',
  'scope.phoneNumber',
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(entryPath) : [entryPath];
  });
}

test('first page is a browsable task experience instead of login', () => {
  const appConfig = JSON.parse(read('src/app.json'));
  assert.equal(appConfig.pages[0], 'pages/tasks/tasks');
});

test('source does not request phone number, avatar, or nickname authorization', () => {
  const violations = [];
  for (const filePath of sourceFiles(SOURCE_ROOT)) {
    if (!/\.(js|json|ts|wxml)$/.test(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    for (const api of BANNED_AUTH_APIS) {
      if (content.includes(api)) {
        violations.push(`${path.relative(ROOT, filePath)}: ${api}`);
      }
    }
  }
  assert.deepEqual(violations, []);
});

test('all tab pages provide a guest browsing path', () => {
  const guestPages = [
    'src/pages/tasks/tasks.js',
    'src/pages/signin/signin.js',
    'src/pages/shop/list/list.js',
  ];
  for (const page of guestPages) {
    const content = read(page);
    assert.match(content, /setGuestExperience\(\)/, page);
    assert.match(content, /guestMode:\s*true/, page);
  }
});

test('login clearly remains optional', () => {
  const loginTemplate = read('src/pages/login/login.wxml');
  assert.match(loginTemplate, /先浏览功能/);
  assert.match(loginTemplate, /不会申请手机号、头像或昵称/);
});
