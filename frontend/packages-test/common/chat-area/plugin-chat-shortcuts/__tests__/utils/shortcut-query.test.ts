import { getQueryFromTemplate } from '../../src/utils/shortcut-query';

describe('getQueryFromTemplate', () => {
  it('should replace placeholders with corresponding values', () => {
    const templateQuery = 'Hello, {{name}}!';
    const values = { name: 'John' };
    const result = getQueryFromTemplate(templateQuery, values);
    expect(result).to.equal('Hello, John!');
  });

  it('should handle multiple placeholders', () => {
    const templateQuery = '{{greeting}}, {{name}}!';
    const values = { greeting: 'Hi', name: 'John' };
    const result = getQueryFromTemplate(templateQuery, values);
    expect(result).to.equal('Hi, John!');
  });

  it('should leave unreplaced placeholders intact', () => {
    const templateQuery = 'Hello, {{name}}!';
    const values = { greeting: 'Hi' };
    const result = getQueryFromTemplate(templateQuery, values);
    expect(result).to.equal('Hello, {{name}}!');
  });

  it('should handle empty values object', () => {
    const templateQuery = 'Hello, {{name}}!';
    const values = {};
    const result = getQueryFromTemplate(templateQuery, values);
    expect(result).to.equal('Hello, {{name}}!');
  });

  it('should handle empty template string', () => {
    const templateQuery = '';
    const values = { name: 'John' };
    const result = getQueryFromTemplate(templateQuery, values);
    expect(result).to.equal('');
  });
});
