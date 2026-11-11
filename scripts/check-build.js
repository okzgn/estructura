'use strict';
// Checks of the hand-maintained builds. They run with `npm run check`, in CI and before `npm publish`.
//
// Usage:
//   node scripts/check-build.js [project root]
//
// 1. Version: the header of every file in dist/ carries the version of package.json.
// 2. ES3: dist/estructura.umd.js has no syntax errors and only uses ES3 syntax, because it must run
//    without transpiling in old browsers. Only the syntax is checked, not the APIs it calls.
// 3. Sync: the UMD and ESM builds contain the same code. They may only differ in the module wrapper,
//    in `var` vs `let`/`const`, and in how consecutive declarations are grouped.

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const UMD = 'dist/estructura.umd.js';
const ESM = 'dist/estructura.esm.mjs';
const DIST_FILES = [UMD, ESM, 'dist/estructura.umd.d.ts', 'dist/estructura.esm.d.mts'];
const K = ts.SyntaxKind;

function read(file){ return fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/\r/g, ''); }
function parse(file, text){ return ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS); }
function line_of(text, position){ return text.slice(0, position).split('\n').length; }

// ---------------------------------------------------------------------------------------
// 1. Version
// ---------------------------------------------------------------------------------------

function check_version(){
  const version = JSON.parse(read('package.json')).version;
  const problems = [];
  DIST_FILES.forEach(function(file){
    const found = read(file).slice(0, 400).match(/Estructura v(\d+\.\d+\.\d+)/);
    if(!found){ problems.push(file + ': no version in the header (package.json says ' + version + ')'); }
    else if(found[1] !== version){ problems.push(file + ': the header says v' + found[1] + ', package.json says ' + version); }
  });
  return { title: 'version ' + version + ' in package.json and in the ' + DIST_FILES.length + ' headers of dist/', problems: problems };
}

// ---------------------------------------------------------------------------------------
// 2. ES3 syntax of the UMD build
// ---------------------------------------------------------------------------------------

// Reserved words of ES3 (keywords and future reserved words): they cannot be used as `object.word` or as an unquoted key.
const ES3_RESERVED = 'abstract boolean break byte case catch char class const continue debugger default delete do double else enum export extends false final finally float for function goto if implements import in instanceof int interface long native new null package private protected public return short static super switch synchronized this throw throws transient true try typeof var void volatile while with'.split(' ');
const MODERN_OPERATORS = [K.QuestionQuestionToken, K.AsteriskAsteriskToken, K.AsteriskAsteriskEqualsToken, K.QuestionQuestionEqualsToken, K.BarBarEqualsToken, K.AmpersandAmpersandEqualsToken];

function check_es3(){
  const text = read(UMD);
  const source = parse(UMD, text);
  const problems = source.parseDiagnostics.map(function(diagnostic){
    return 'line ' + line_of(text, diagnostic.start) + ': syntax error: ' + ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ');
  });
  function add(node, what){ problems.push('line ' + line_of(text, node.getStart()) + ': ' + what); }
  function is_reserved(name){ return name && name.kind === K.Identifier && ES3_RESERVED.indexOf(name.text) !== -1; }

  (function walk(node){
    switch(node.kind){
      case K.VariableDeclarationList: if(node.flags & ts.NodeFlags.BlockScoped){ add(node, 'let/const'); } break;
      case K.ArrowFunction: add(node, 'arrow function'); break;
      case K.TemplateExpression: case K.NoSubstitutionTemplateLiteral: case K.TaggedTemplateExpression: add(node, 'template literal'); break;
      case K.ClassDeclaration: case K.ClassExpression: add(node, 'class'); break;
      case K.ForOfStatement: add(node, 'for...of'); break;
      case K.SpreadElement: case K.SpreadAssignment: add(node, 'spread'); break;
      case K.GetAccessor: case K.SetAccessor: add(node, 'getter/setter'); break;
      case K.ShorthandPropertyAssignment: add(node, 'shorthand property'); break;
      case K.ComputedPropertyName: add(node, 'computed property name'); break;
      case K.ObjectBindingPattern: case K.ArrayBindingPattern: add(node, 'destructuring'); break;
      case K.MethodDeclaration: add(node, 'shorthand method'); break;
      case K.AsyncKeyword: case K.AwaitExpression: add(node, 'async/await'); break;
      case K.YieldExpression: add(node, 'generator'); break;
      case K.BigIntLiteral: add(node, 'BigInt literal'); break;
      case K.ImportDeclaration: case K.ExportDeclaration: case K.ExportAssignment: add(node, 'import/export'); break;
      case K.BinaryExpression: if(MODERN_OPERATORS.indexOf(node.operatorToken.kind) !== -1){ add(node, 'operator ' + node.operatorToken.getText()); } break;
      case K.ObjectLiteralExpression: if(node.properties.hasTrailingComma){ add(node, 'trailing comma in an object'); } break;
      case K.ArrayLiteralExpression: if(node.elements.hasTrailingComma){ add(node, 'trailing comma in an array'); } break;
      case K.PropertyAssignment: if(is_reserved(node.name)){ add(node, 'reserved word as an unquoted key: ' + node.name.text); } break;
      case K.PropertyAccessExpression: if(is_reserved(node.name)){ add(node, 'reserved word as a property: .' + node.name.text); } break;
      case K.Parameter: if(node.initializer || node.dotDotDotToken){ add(node, 'default or rest parameter'); } break;
    }
    if(node.questionDotToken){ add(node, 'optional chaining'); }
    if(node.asteriskToken){ add(node, 'generator'); }
    if((node.kind === K.CallExpression || node.kind === K.NewExpression) && node.arguments && node.arguments.hasTrailingComma){ add(node, 'trailing comma in the arguments'); }
    if(node.parameters && node.parameters.hasTrailingComma){ add(node, 'trailing comma in the parameters'); }
    ts.forEachChild(node, walk);
  })(source);

  return { title: UMD + ' only uses ES3 syntax', problems: problems };
}

// ---------------------------------------------------------------------------------------
// 3. UMD and ESM builds in sync
// ---------------------------------------------------------------------------------------

// Returns the code shared by both builds: for the UMD, the body of the factory function passed to the wrapper
// (between 'use strict' and `return _e`); for the ESM, everything before `export default _e`.
function shared_code(file){
  const text = read(file);
  const source = parse(file, text);
  let statements = source.statements, expected = true;
  if(file === UMD){
    let call = statements[0] && statements[0].expression;
    while(call && call.kind === K.ParenthesizedExpression){ call = call.expression; }
    const factory = call && call.arguments && call.arguments[call.arguments.length - 1];
    statements = (factory && factory.body && factory.body.statements) || [];
    expected = statements.length > 2 && statements[0].kind === K.ExpressionStatement && statements[0].expression.kind === K.StringLiteral && statements[statements.length - 1].kind === K.ReturnStatement;
    statements = Array.prototype.slice.call(statements, 1, -1);
  }
  else {
    expected = statements.length > 1 && statements[statements.length - 1].kind === K.ExportAssignment;
    statements = Array.prototype.slice.call(statements, 0, -1);
  }
  if(!expected || !statements.length){ return null; }
  const start = statements[0].getStart();
  return { text: text, start: start, code: text.slice(start, statements[statements.length - 1].getEnd()) };
}

// Splits the code into tokens, without comments or whitespace, erasing the differences that are allowed.
function normalized_tokens(shared){
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.Standard, shared.code);
  const token_start = scanner.getTokenStart || scanner.getTokenPos;
  const tokens = [], positions = [];
  let kind;
  while((kind = scanner.scan()) !== K.EndOfFileToken){
    let token = scanner.getTokenText();
    if(kind === K.LetKeyword || kind === K.ConstKeyword){ token = 'var'; }
    // `var a = 1; var b = 2;` and `var a = 1, b = 2;` are the same declarations, grouped differently.
    if(token === 'var' && tokens[tokens.length - 1] === ';'){ tokens[tokens.length - 1] = ','; continue; }
    tokens.push(token);
    positions.push(shared.start + token_start.call(scanner));
  }
  return { tokens: tokens, positions: positions };
}

function check_sync(){
  const umd = shared_code(UMD), esm = shared_code(ESM);
  if(!umd || !esm){
    return { title: 'UMD and ESM builds in sync', problems: [(umd ? ESM : UMD) + ': unexpected module structure (wrapper, \'use strict\', `return _e` or `export default _e` not found)'] };
  }
  const a = normalized_tokens(umd), b = normalized_tokens(esm);
  const problems = [];
  const length = Math.max(a.tokens.length, b.tokens.length);
  for(let i = 0; i < length; i++){
    if(a.tokens[i] === b.tokens[i]){ continue; }
    const context = function(side, shared, file){
      if(i >= side.tokens.length){ return file + ': the code ends here'; }
      return file + ' line ' + line_of(shared.text, side.positions[i]) + ': ... ' + side.tokens.slice(Math.max(0, i - 4), i + 6).join(' ') + ' ...';
    };
    problems.push('the builds differ from here on:', '  ' + context(a, umd, UMD), '  ' + context(b, esm, ESM));
    break;
  }
  return { title: 'UMD and ESM builds contain the same code (' + a.tokens.length + ' tokens compared)', problems: problems };
}

// ---------------------------------------------------------------------------------------

let failed = false;
[check_version, check_es3, check_sync].forEach(function(check){
  const result = check();
  if(result.problems.length){ failed = true; }
  console.log((result.problems.length ? 'FAIL  ' : 'OK    ') + result.title);
  result.problems.forEach(function(problem){ console.log('      ' + problem); });
});
process.exit(failed ? 1 : 0);
