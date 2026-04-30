import { useMemo, useState, useEffect } from 'react'
import { getKnowledgeProgress, updateKnowledgeProgress } from '../services/api'
import HintChatPanel from '../components/HintChatPanel'

const quizData = {
  DSA: [
    {
      id: 'dsa-1',
      type: 'mcq',
      question: 'What is the time complexity of accessing an element in an array?',
      options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
      answer: 'O(1)',
      xp: 10,
    },
    {
      id: 'dsa-2',
      type: 'mcq',
      question: 'Which operation is costly in arrays?',
      options: ['Access', 'Insertion at end', 'Insertion at beginning', 'Traversal'],
      answer: 'Insertion at beginning',
      xp: 10,
    },
    {
      id: 'dsa-3',
      type: 'mcq',
      question: 'What is the index of first element in array?',
      options: ['1', '-1', '0', 'Depends'],
      answer: '0',
      xp: 10,
    },
    {
      id: 'dsa-4',
      type: 'mcq',
      question: 'Which structure uses contiguous memory?',
      options: ['Linked List', 'Array', 'Stack', 'Queue'],
      answer: 'Array',
      xp: 10,
    },
    {
      id: 'dsa-5',
      type: 'mcq',
      question: 'What is the size of array?',
      options: ['Dynamic', 'Fixed', 'Infinite', 'Undefined'],
      answer: 'Fixed',
      xp: 10,
    },
    {
      id: 'dsa-6',
      type: 'mcq',
      question: 'Which is not a valid array operation?',
      options: ['Traversal', 'Insertion', 'Deletion', 'Compilation'],
      answer: 'Compilation',
      xp: 10,
    },
    {
      id: 'dsa-7',
      type: 'mcq',
      question: 'Best case search in array?',
      options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
      answer: 'O(1)',
      xp: 10,
    },
    {
      id: 'dsa-8',
      type: 'mcq',
      question: 'Worst case search in unsorted array?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
      answer: 'O(n)',
      xp: 10,
    },
    {
      id: 'dsa-9',
      type: 'mcq',
      question: 'Array stores elements in:',
      options: ['Random order', 'Sorted order', 'Contiguous memory', 'Linked nodes'],
      answer: 'Contiguous memory',
      xp: 10,
    },
    {
      id: 'dsa-10',
      type: 'mcq',
      question: 'Which is true about arrays?',
      options: ['Dynamic size', 'Fixed size', 'No indexing', 'Slow access'],
      answer: 'Fixed size',
      xp: 10,
    },
    {
      id: 'dsa-11',
      type: 'mcq',
      question: 'Strings are arrays of:',
      options: ['Integers', 'Characters', 'Floats', 'Objects'],
      answer: 'Characters',
      xp: 10,
    },
    {
      id: 'dsa-12',
      type: 'mcq',
      question: 'Which function finds string length (Python)?',
      options: ['count()', 'len()', 'size()', 'length()'],
      answer: 'len()',
      xp: 10,
    },
    {
      id: 'dsa-13',
      type: 'mcq',
      question: 'Palindrome means:',
      options: ['Reverse string', 'Same forward & backward', 'Sorted string', 'Unique string'],
      answer: 'Same forward & backward',
      xp: 10,
    },
    {
      id: 'dsa-14',
      type: 'mcq',
      question: 'Anagram means:',
      options: ['Same letters different order', 'Same string', 'Reverse string', 'Uppercase'],
      answer: 'Same letters different order',
      xp: 10,
    },
    {
      id: 'dsa-15',
      type: 'mcq',
      question: 'ASCII stands for:',
      options: ['American Standard Code for Information Interchange', 'Advanced String Code', 'Array Standard Code', 'None'],
      answer: 'American Standard Code for Information Interchange',
      xp: 10,
    },
    {
      id: 'dsa-16',
      type: 'mcq',
      question: 'Which is immutable?',
      options: ['List', 'String', 'Array', 'Set'],
      answer: 'String',
      xp: 10,
    },
    {
      id: 'dsa-17',
      type: 'mcq',
      question: 'Which removes spaces?',
      options: ['strip()', 'replace()', 'Both', 'None'],
      answer: 'Both',
      xp: 10,
    },
    {
      id: 'dsa-18',
      type: 'mcq',
      question: 'Indexing starts at:',
      options: ['1', '0', '-1', 'Depends'],
      answer: '0',
      xp: 10,
    },
    {
      id: 'dsa-19',
      type: 'mcq',
      question: 'String concatenation uses:',
      options: ['-', '+', '*', '/'],
      answer: '+',
      xp: 10,
    },
    {
      id: 'dsa-20',
      type: 'mcq',
      question: 'Which checks digits?',
      options: ['isalpha()', 'isdigit()', 'isnumeric()', 'isspace()'],
      answer: 'isdigit()',
      xp: 10,
    },
    {
      id: 'dsa-21',
      type: 'mcq',
      question: 'Linked list uses:',
      options: ['Continuous memory', 'Nodes with pointers', 'Arrays', 'Stack'],
      answer: 'Nodes with pointers',
      xp: 10,
    },
    {
      id: 'dsa-22',
      type: 'mcq',
      question: 'Access time complexity:',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
      answer: 'O(n)',
      xp: 10,
    },
    {
      id: 'dsa-23',
      type: 'mcq',
      question: 'Insert at beginning:',
      options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
      answer: 'O(1)',
      xp: 10,
    },
    {
      id: 'dsa-24',
      type: 'mcq',
      question: 'Each node contains:',
      options: ['Data only', 'Pointer only', 'Data + Pointer', 'Index'],
      answer: 'Data + Pointer',
      xp: 10,
    },
    {
      id: 'dsa-25',
      type: 'mcq',
      question: 'Last node points to:',
      options: ['First node', 'NULL', 'Itself', 'Random'],
      answer: 'NULL',
      xp: 10,
    },
    {
      id: 'dsa-26',
      type: 'mcq',
      question: 'Stack follows:',
      options: ['FIFO', 'LIFO', 'Random', 'Circular'],
      answer: 'LIFO',
      xp: 10,
    },
    {
      id: 'dsa-27',
      type: 'mcq',
      question: 'Top element access:',
      options: ['Bottom', 'Top', 'Middle', 'Random'],
      answer: 'Top',
      xp: 10,
    },
    {
      id: 'dsa-28',
      type: 'mcq',
      question: 'Push operation:',
      options: ['Remove', 'Insert', 'Swap', 'Search'],
      answer: 'Insert',
      xp: 10,
    },
    {
      id: 'dsa-29',
      type: 'mcq',
      question: 'Pop operation:',
      options: ['Insert', 'Remove', 'Traverse', 'Copy'],
      answer: 'Remove',
      xp: 10,
    },
    {
      id: 'dsa-30',
      type: 'mcq',
      question: 'Overflow occurs when:',
      options: ['Empty', 'Full', 'Half', 'Sorted'],
      answer: 'Full',
      xp: 10,
    },
    {
      id: 'dsa-31',
      type: 'mcq',
      question: 'Queue follows:',
      options: ['LIFO', 'FIFO', 'Random', 'None'],
      answer: 'FIFO',
      xp: 10,
    },
    {
      id: 'dsa-32',
      type: 'mcq',
      question: 'Insert in queue:',
      options: ['Front', 'Rear', 'Middle', 'Anywhere'],
      answer: 'Rear',
      xp: 10,
    },
    {
      id: 'dsa-33',
      type: 'mcq',
      question: 'Delete in queue:',
      options: ['Rear', 'Front', 'Middle', 'Random'],
      answer: 'Front',
      xp: 10,
    },
    {
      id: 'dsa-34',
      type: 'mcq',
      question: 'Circular queue solves:',
      options: ['Overflow', 'Underflow', 'Memory wastage', 'Sorting'],
      answer: 'Memory wastage',
      xp: 10,
    },
    {
      id: 'dsa-35',
      type: 'mcq',
      question: 'Empty queue condition:',
      options: ['front = rear', 'front > rear', 'Both possible', 'None'],
      answer: 'Both possible',
      xp: 10,
    },
    {
      id: 'dsa-36',
      type: 'mcq',
      question: 'Linear search complexity:',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
      answer: 'O(n)',
      xp: 10,
    },
    {
      id: 'dsa-37',
      type: 'mcq',
      question: 'Binary search requires:',
      options: ['Sorted array', 'Unsorted array', 'Linked list', 'Stack'],
      answer: 'Sorted array',
      xp: 10,
    },
    {
      id: 'dsa-38',
      type: 'mcq',
      question: 'Binary search complexity:',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
      answer: 'O(log n)',
      xp: 10,
    },
    {
      id: 'dsa-39',
      type: 'mcq',
      question: 'Mid formula:',
      options: ['(l+r)/2', 'l+r', 'l*r', 'r-l'],
      answer: '(l+r)/2',
      xp: 10,
    },
    {
      id: 'dsa-40',
      type: 'mcq',
      question: 'Worst case binary search:',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      answer: 'O(log n)',
      xp: 10,
    },
    {
      id: 'dsa-41',
      type: 'mcq',
      question: 'Bubble sort complexity:',
      options: ['O(n)', 'O(n²)', 'O(log n)', 'O(n log n)'],
      answer: 'O(n²)',
      xp: 10,
    },
    {
      id: 'dsa-42',
      type: 'mcq',
      question: 'Selection sort complexity:',
      options: ['O(n²)', 'O(n)', 'O(log n)', 'O(n log n)'],
      answer: 'O(n²)',
      xp: 10,
    },
    {
      id: 'dsa-43',
      type: 'mcq',
      question: 'Insertion sort best case:',
      options: ['O(n)', 'O(n²)', 'O(log n)', 'O(n log n)'],
      answer: 'O(n)',
      xp: 10,
    },
    {
      id: 'dsa-44',
      type: 'mcq',
      question: 'Fastest sorting algorithm:',
      options: ['Bubble', 'Selection', 'Quick sort', 'Insertion'],
      answer: 'Quick sort',
      xp: 10,
    },
    {
      id: 'dsa-45',
      type: 'mcq',
      question: 'Stable sorting algorithm:',
      options: ['Bubble sort', 'Quick sort', 'Heap sort', 'Selection'],
      answer: 'Bubble sort',
      xp: 10,
    },
    {
      id: 'dsa-46',
      type: 'mcq',
      question: 'Recursion means:',
      options: ['Loop', 'Function calling itself', 'Sorting', 'Searching'],
      answer: 'Function calling itself',
      xp: 10,
    },
    {
      id: 'dsa-47',
      type: 'mcq',
      question: 'Base case is:',
      options: ['Loop', 'Condition to stop recursion', 'Variable', 'Output'],
      answer: 'Condition to stop recursion',
      xp: 10,
    },
    {
      id: 'dsa-48',
      type: 'mcq',
      question: 'Factorial of 0:',
      options: ['0', '1', '-1', 'Undefined'],
      answer: '1',
      xp: 10,
    },
    {
      id: 'dsa-49',
      type: 'mcq',
      question: 'Fibonacci starts with:',
      options: ['0,1', '1,2', '2,3', '1,1'],
      answer: '0,1',
      xp: 10,
    },
    {
      id: 'dsa-50',
      type: 'mcq',
      question: 'Recursion uses:',
      options: ['Queue', 'Stack', 'Array', 'Graph'],
      answer: 'Stack',
      xp: 10,
    },
  ],
  'Web Development': [
    {
      id: 'web-1',
      type: 'mcq',
      question: 'HTML stands for:',
      options: ['Hyper Text Markup Language', 'High Text Machine Language', 'Hyper Tool', 'None'],
      answer: 'Hyper Text Markup Language',
      xp: 10,
    },
    {
      id: 'web-2',
      type: 'mcq',
      question: 'HTML is:',
      options: ['Programming language', 'Markup language', 'OS', 'DB'],
      answer: 'Markup language',
      xp: 10,
    },
    {
      id: 'web-3',
      type: 'mcq',
      question: 'Tag for paragraph:',
      options: ['<p>', '<h1>', '<div>', '<span>'],
      answer: '<p>',
      xp: 10,
    },
    {
      id: 'web-4',
      type: 'mcq',
      question: 'Self-closing tag example:',
      options: ['<img>', '<p>', '<div>', '<span>'],
      answer: '<img>',
      xp: 10,
    },
    {
      id: 'web-5',
      type: 'mcq',
      question: 'HTML document starts with:',
      options: ['<!DOCTYPE html>', '<html>', '<head>', '<body>'],
      answer: '<!DOCTYPE html>',
      xp: 10,
    },
    {
      id: 'web-6',
      type: 'mcq',
      question: 'Link tag is:',
      options: ['<a>', '<link>', '<href>', '<url>'],
      answer: '<a>',
      xp: 10,
    },
    {
      id: 'web-7',
      type: 'mcq',
      question: 'Image tag is:',
      options: ['<img>', '<image>', '<pic>', '<photo>'],
      answer: '<img>',
      xp: 10,
    },
    {
      id: 'web-8',
      type: 'mcq',
      question: 'List item tag:',
      options: ['<li>', '<list>', '<item>', '<ul>'],
      answer: '<li>',
      xp: 10,
    },
    {
      id: 'web-9',
      type: 'mcq',
      question: 'Table row tag:',
      options: ['<tr>', '<td>', '<th>', '<table>'],
      answer: '<tr>',
      xp: 10,
    },
    {
      id: 'web-10',
      type: 'mcq',
      question: 'Form input tag:',
      options: ['<input>', '<form>', '<button>', '<text>'],
      answer: '<input>',
      xp: 10,
    },
    {
      id: 'web-11',
      type: 'mcq',
      question: 'Heading tag range:',
      options: ['<h1> to <h6>', '<h1> to <h5>', '<h1> to <h4>', '<h1> to <h3>'],
      answer: '<h1> to <h6>',
      xp: 10,
    },
    {
      id: 'web-12',
      type: 'mcq',
      question: 'Break line tag:',
      options: ['<br>', '<break>', '<line>', '<newline>'],
      answer: '<br>',
      xp: 10,
    },
    {
      id: 'web-13',
      type: 'mcq',
      question: 'Bold text tag:',
      options: ['<b>', '<strong>', '<bold>', '<text>'],
      answer: '<b>',
      xp: 10,
    },
    {
      id: 'web-14',
      type: 'mcq',
      question: 'Italic text tag:',
      options: ['<i>', '<italic>', '<em>', '<text>'],
      answer: '<i>',
      xp: 10,
    },
    {
      id: 'web-15',
      type: 'mcq',
      question: 'Division tag:',
      options: ['<div>', '<division>', '<section>', '<part>'],
      answer: '<div>',
      xp: 10,
    },
    {
      id: 'web-16',
      type: 'mcq',
      question: 'CSS stands for:',
      options: ['Cascading Style Sheets', 'Color Style Sheets', 'Computer Style', 'None'],
      answer: 'Cascading Style Sheets',
      xp: 10,
    },
    {
      id: 'web-17',
      type: 'mcq',
      question: 'CSS is used for:',
      options: ['Styling', 'Logic', 'Database', 'OS'],
      answer: 'Styling',
      xp: 10,
    },
    {
      id: 'web-18',
      type: 'mcq',
      question: 'CSS selector types:',
      options: ['Element, Class, ID', 'Only Element', 'Only Class', 'Only ID'],
      answer: 'Element, Class, ID',
      xp: 10,
    },
    {
      id: 'web-19',
      type: 'mcq',
      question: 'Class selector starts with:',
      options: ['.', '#', '@', '$'],
      answer: '.',
      xp: 10,
    },
    {
      id: 'web-20',
      type: 'mcq',
      question: 'ID selector starts with:',
      options: ['#', '.', '@', '$'],
      answer: '#',
      xp: 10,
    },
    {
      id: 'web-21',
      type: 'mcq',
      question: 'CSS color property:',
      options: ['color', 'background', 'text-color', 'font-color'],
      answer: 'color',
      xp: 10,
    },
    {
      id: 'web-22',
      type: 'mcq',
      question: 'CSS font-size property:',
      options: ['font-size', 'text-size', 'size', 'font'],
      answer: 'font-size',
      xp: 10,
    },
    {
      id: 'web-23',
      type: 'mcq',
      question: 'CSS margin property:',
      options: ['margin', 'padding', 'border', 'spacing'],
      answer: 'margin',
      xp: 10,
    },
    {
      id: 'web-24',
      type: 'mcq',
      question: 'CSS padding property:',
      options: ['padding', 'margin', 'border', 'spacing'],
      answer: 'padding',
      xp: 10,
    },
    {
      id: 'web-25',
      type: 'mcq',
      question: 'CSS display property values:',
      options: ['block, inline, none', 'show, hide', 'visible, hidden', 'flex, grid'],
      answer: 'block, inline, none',
      xp: 10,
    },
    {
      id: 'web-26',
      type: 'mcq',
      question: 'CSS position property:',
      options: ['static, relative, absolute, fixed', 'top, bottom, left, right', 'x, y, z', 'none'],
      answer: 'static, relative, absolute, fixed',
      xp: 10,
    },
    {
      id: 'web-27',
      type: 'mcq',
      question: 'CSS flexbox is for:',
      options: ['Layout', 'Colors', 'Fonts', 'Images'],
      answer: 'Layout',
      xp: 10,
    },
    {
      id: 'web-28',
      type: 'mcq',
      question: 'CSS grid is for:',
      options: ['Layout', 'Colors', 'Fonts', 'Images'],
      answer: 'Layout',
      xp: 10,
    },
    {
      id: 'web-29',
      type: 'mcq',
      question: 'CSS media queries for:',
      options: ['Responsive design', 'Colors', 'Fonts', 'Images'],
      answer: 'Responsive design',
      xp: 10,
    },
    {
      id: 'web-30',
      type: 'mcq',
      question: 'CSS animation property:',
      options: ['animation', 'transition', 'transform', 'move'],
      answer: 'animation',
      xp: 10,
    },
    {
      id: 'web-31',
      type: 'mcq',
      question: 'JavaScript is:',
      options: ['Programming language', 'Markup', 'DB', 'OS'],
      answer: 'Programming language',
      xp: 10,
    },
    {
      id: 'web-32',
      type: 'mcq',
      question: 'JavaScript is used for:',
      options: ['Interactivity', 'Styling', 'Storage', 'None'],
      answer: 'Interactivity',
      xp: 10,
    },
    {
      id: 'web-33',
      type: 'mcq',
      question: 'JavaScript variable keyword:',
      options: ['var', 'int', 'float', 'define'],
      answer: 'var',
      xp: 10,
    },
    {
      id: 'web-34',
      type: 'mcq',
      question: 'JavaScript function keyword:',
      options: ['func', 'function', 'def', 'method'],
      answer: 'function',
      xp: 10,
    },
    {
      id: 'web-35',
      type: 'mcq',
      question: 'JavaScript array syntax:',
      options: ['[]', '{}', '()', '<>'],
      answer: '[]',
      xp: 10,
    },
    {
      id: 'web-36',
      type: 'mcq',
      question: 'JavaScript object syntax:',
      options: ['{}', '[]', '()', '<>'],
      answer: '{}',
      xp: 10,
    },
    {
      id: 'web-37',
      type: 'mcq',
      question: 'JavaScript if statement:',
      options: ['if () {}', 'when () {}', 'case () {}', 'check () {}'],
      answer: 'if () {}',
      xp: 10,
    },
    {
      id: 'web-38',
      type: 'mcq',
      question: 'JavaScript loop statement:',
      options: ['for () {}', 'loop () {}', 'repeat () {}', 'cycle () {}'],
      answer: 'for () {}',
      xp: 10,
    },
    {
      id: 'web-39',
      type: 'mcq',
      question: 'JavaScript while loop:',
      options: ['while () {}', 'until () {}', 'as long as () {}', 'during () {}'],
      answer: 'while () {}',
      xp: 10,
    },
    {
      id: 'web-40',
      type: 'mcq',
      question: 'JavaScript DOM method:',
      options: ['getElementById', 'findElement', 'searchElement', 'locateElement'],
      answer: 'getElementById',
      xp: 10,
    },
    {
      id: 'web-41',
      type: 'mcq',
      question: 'JavaScript event listener:',
      options: ['addEventListener', 'onEvent', 'listenEvent', 'attachEvent'],
      answer: 'addEventListener',
      xp: 10,
    },
    {
      id: 'web-42',
      type: 'mcq',
      question: 'JavaScript console method:',
      options: ['console.log', 'print', 'log', 'output'],
      answer: 'console.log',
      xp: 10,
    },
    {
      id: 'web-43',
      type: 'mcq',
      question: 'JavaScript string method:',
      options: ['toUpperCase', 'uppercase', 'upper', 'convert'],
      answer: 'toUpperCase',
      xp: 10,
    },
    {
      id: 'web-44',
      type: 'mcq',
      question: 'JavaScript array method:',
      options: ['push', 'add', 'insert', 'append'],
      answer: 'push',
      xp: 10,
    },
    {
      id: 'web-45',
      type: 'mcq',
      question: 'JavaScript comparison operator:',
      options: ['===', '=', 'equals', 'same'],
      answer: '===',
      xp: 10,
    },
    {
      id: 'web-46',
      type: 'mcq',
      question: 'JavaScript logical operator:',
      options: ['&&', 'and', '&', 'plus'],
      answer: '&&',
      xp: 10,
    },
    {
      id: 'web-47',
      type: 'mcq',
      question: 'JavaScript ternary operator:',
      options: ['? :', 'if then', 'choose', 'select'],
      answer: '? :',
      xp: 10,
    },
    {
      id: 'web-48',
      type: 'mcq',
      question: 'JavaScript try-catch for:',
      options: ['Error handling', 'Loops', 'Conditions', 'Functions'],
      answer: 'Error handling',
      xp: 10,
    },
    {
      id: 'web-49',
      type: 'mcq',
      question: 'JavaScript async/await for:',
      options: ['Asynchronous code', 'Synchronous code', 'Loops', 'Conditions'],
      answer: 'Asynchronous code',
      xp: 10,
    },
    {
      id: 'web-50',
      type: 'mcq',
      question: 'JavaScript framework example:',
      options: ['React', 'HTML', 'CSS', 'SQL'],
      answer: 'React',
      xp: 10,
    },
  ],
  'Operating System': [
    {
      id: 'os-1',
      type: 'mcq',
      question: 'OS stands for:',
      options: ['Open System', 'Operating System', 'Output System', 'None'],
      answer: 'Operating System',
      xp: 10,
    },
    {
      id: 'os-2',
      type: 'mcq',
      question: 'OS acts as:',
      options: ['Interface between user & hardware', 'Program', 'Compiler', 'None'],
      answer: 'Interface between user & hardware',
      xp: 10,
    },
    {
      id: 'os-3',
      type: 'mcq',
      question: 'Kernel is:',
      options: ['Core of OS', 'Program', 'User', 'File'],
      answer: 'Core of OS',
      xp: 10,
    },
    {
      id: 'os-4',
      type: 'mcq',
      question: 'Process is:',
      options: ['Program in execution', 'File', 'Memory', 'CPU'],
      answer: 'Program in execution',
      xp: 10,
    },
    {
      id: 'os-5',
      type: 'mcq',
      question: 'Thread is:',
      options: ['Lightweight process', 'Heavy process', 'File', 'CPU'],
      answer: 'Lightweight process',
      xp: 10,
    },
    {
      id: 'os-6',
      type: 'mcq',
      question: 'Multitasking means:',
      options: ['Multiple tasks simultaneously', 'Single task', 'No task', 'File task'],
      answer: 'Multiple tasks simultaneously',
      xp: 10,
    },
    {
      id: 'os-7',
      type: 'mcq',
      question: 'Multiprocessing uses:',
      options: ['Multiple CPUs', 'Single CPU', 'No CPU', 'File CPU'],
      answer: 'Multiple CPUs',
      xp: 10,
    },
    {
      id: 'os-8',
      type: 'mcq',
      question: 'Multithreading uses:',
      options: ['Multiple threads', 'Single thread', 'No thread', 'File thread'],
      answer: 'Multiple threads',
      xp: 10,
    },
    {
      id: 'os-9',
      type: 'mcq',
      question: 'System call is:',
      options: ['Request to OS', 'User program', 'Hardware', 'File'],
      answer: 'Request to OS',
      xp: 10,
    },
    {
      id: 'os-10',
      type: 'mcq',
      question: 'Interrupt is:',
      options: ['Signal to CPU', 'Program', 'File', 'Memory'],
      answer: 'Signal to CPU',
      xp: 10,
    },
    {
      id: 'os-11',
      type: 'mcq',
      question: 'Bootstrapping means:',
      options: ['Loading OS', 'Running program', 'Saving file', 'Deleting data'],
      answer: 'Loading OS',
      xp: 10,
    },
    {
      id: 'os-12',
      type: 'mcq',
      question: 'Shell is:',
      options: ['Command interpreter', 'Kernel', 'Hardware', 'File'],
      answer: 'Command interpreter',
      xp: 10,
    },
    {
      id: 'os-13',
      type: 'mcq',
      question: 'Device driver is:',
      options: ['Hardware interface', 'User program', 'OS kernel', 'File system'],
      answer: 'Hardware interface',
      xp: 10,
    },
    {
      id: 'os-14',
      type: 'mcq',
      question: 'Spooling is:',
      options: ['Buffering I/O', 'Direct I/O', 'No I/O', 'File I/O'],
      answer: 'Buffering I/O',
      xp: 10,
    },
    {
      id: 'os-15',
      type: 'mcq',
      question: 'Cache memory is:',
      options: ['Fast memory', 'Slow memory', 'No memory', 'File memory'],
      answer: 'Fast memory',
      xp: 10,
    },
    {
      id: 'os-16',
      type: 'mcq',
      question: 'FCFS means:',
      options: ['First Come First Serve', 'Fast CPU First', 'File Control', 'None'],
      answer: 'First Come First Serve',
      xp: 10,
    },
    {
      id: 'os-17',
      type: 'mcq',
      question: 'SJF means:',
      options: ['Shortest Job First', 'Small Job Fast', 'Simple Job', 'None'],
      answer: 'Shortest Job First',
      xp: 10,
    },
    {
      id: 'os-18',
      type: 'mcq',
      question: 'Round Robin uses:',
      options: ['Time quantum', 'Priority', 'FCFS', 'None'],
      answer: 'Time quantum',
      xp: 10,
    },
    {
      id: 'os-19',
      type: 'mcq',
      question: 'Context switching:',
      options: ['Switching processes', 'Deleting', 'Saving', 'None'],
      answer: 'Switching processes',
      xp: 10,
    },
    {
      id: 'os-20',
      type: 'mcq',
      question: 'Priority scheduling uses:',
      options: ['Priority numbers', 'Time', 'Size', 'None'],
      answer: 'Priority numbers',
      xp: 10,
    },
    {
      id: 'os-21',
      type: 'mcq',
      question: 'Preemptive scheduling:',
      options: ['Can interrupt', 'Cannot interrupt', 'No scheduling', 'File scheduling'],
      answer: 'Can interrupt',
      xp: 10,
    },
    {
      id: 'os-22',
      type: 'mcq',
      question: 'Non-preemptive scheduling:',
      options: ['Cannot interrupt', 'Can interrupt', 'No scheduling', 'File scheduling'],
      answer: 'Cannot interrupt',
      xp: 10,
    },
    {
      id: 'os-23',
      type: 'mcq',
      question: 'Multilevel queue uses:',
      options: ['Multiple queues', 'Single queue', 'No queue', 'File queue'],
      answer: 'Multiple queues',
      xp: 10,
    },
    {
      id: 'os-24',
      type: 'mcq',
      question: 'Process states include:',
      options: ['Ready, Running, Waiting', 'Only Ready', 'Only Running', 'Only Waiting'],
      answer: 'Ready, Running, Waiting',
      xp: 10,
    },
    {
      id: 'os-25',
      type: 'mcq',
      question: 'Process control block contains:',
      options: ['Process information', 'User data', 'Files', 'Hardware'],
      answer: 'Process information',
      xp: 10,
    },
    {
      id: 'os-26',
      type: 'mcq',
      question: 'Semaphore is used for:',
      options: ['Synchronization', 'Scheduling', 'Memory', 'Files'],
      answer: 'Synchronization',
      xp: 10,
    },
    {
      id: 'os-27',
      type: 'mcq',
      question: 'Mutex is:',
      options: ['Binary semaphore', 'Counting semaphore', 'No semaphore', 'File semaphore'],
      answer: 'Binary semaphore',
      xp: 10,
    },
    {
      id: 'os-28',
      type: 'mcq',
      question: 'Critical section is:',
      options: ['Shared resource access', 'Private access', 'No access', 'File access'],
      answer: 'Shared resource access',
      xp: 10,
    },
    {
      id: 'os-29',
      type: 'mcq',
      question: 'Race condition occurs in:',
      options: ['Concurrent access', 'Sequential access', 'No access', 'File access'],
      answer: 'Concurrent access',
      xp: 10,
    },
    {
      id: 'os-30',
      type: 'mcq',
      question: 'Deadlock occurs when:',
      options: ['Waiting forever', 'Running', 'Idle', 'None'],
      answer: 'Waiting forever',
      xp: 10,
    },
    {
      id: 'os-31',
      type: 'mcq',
      question: 'Paging avoids:',
      options: ['Fragmentation', 'Memory', 'CPU', 'File'],
      answer: 'Fragmentation',
      xp: 10,
    },
    {
      id: 'os-32',
      type: 'mcq',
      question: 'Virtual memory uses:',
      options: ['Disk as RAM', 'CPU', 'File', 'None'],
      answer: 'Disk as RAM',
      xp: 10,
    },
    {
      id: 'os-33',
      type: 'mcq',
      question: 'FIFO page replacement:',
      options: ['First in first out', 'Last in', 'Random', 'None'],
      answer: 'First in first out',
      xp: 10,
    },
    {
      id: 'os-34',
      type: 'mcq',
      question: 'LRU page replacement:',
      options: ['Least Recently Used', 'Last Recently Used', 'Least Random Used', 'None'],
      answer: 'Least Recently Used',
      xp: 10,
    },
    {
      id: 'os-35',
      type: 'mcq',
      question: 'Thrashing occurs when:',
      options: ['Excessive paging', 'No paging', 'Normal paging', 'File paging'],
      answer: 'Excessive paging',
      xp: 10,
    },
    {
      id: 'os-36',
      type: 'mcq',
      question: 'Segmentation divides memory into:',
      options: ['Segments', 'Pages', 'Blocks', 'Files'],
      answer: 'Segments',
      xp: 10,
    },
    {
      id: 'os-37',
      type: 'mcq',
      question: 'Demand paging loads:',
      options: ['Pages on demand', 'All pages', 'No pages', 'File pages'],
      answer: 'Pages on demand',
      xp: 10,
    },
    {
      id: 'os-38',
      type: 'mcq',
      question: 'Page fault occurs when:',
      options: ['Page not in memory', 'Page in memory', 'No page', 'File page'],
      answer: 'Page not in memory',
      xp: 10,
    },
    {
      id: 'os-39',
      type: 'mcq',
      question: 'Working set model tracks:',
      options: ['Recently used pages', 'All pages', 'No pages', 'File pages'],
      answer: 'Recently used pages',
      xp: 10,
    },
    {
      id: 'os-40',
      type: 'mcq',
      question: 'Memory allocation strategies:',
      options: ['First fit, Best fit, Worst fit', 'Only First fit', 'Only Best fit', 'Only Worst fit'],
      answer: 'First fit, Best fit, Worst fit',
      xp: 10,
    },
    {
      id: 'os-41',
      type: 'mcq',
      question: 'File system manages:',
      options: ['Files', 'CPU', 'Memory', 'Process'],
      answer: 'Files',
      xp: 10,
    },
    {
      id: 'os-42',
      type: 'mcq',
      question: 'Directory is:',
      options: ['Folder', 'File', 'CPU', 'RAM'],
      answer: 'Folder',
      xp: 10,
    },
    {
      id: 'os-43',
      type: 'mcq',
      question: 'File allocation methods:',
      options: ['Contiguous, Linked, Indexed', 'Only Contiguous', 'Only Linked', 'Only Indexed'],
      answer: 'Contiguous, Linked, Indexed',
      xp: 10,
    },
    {
      id: 'os-44',
      type: 'mcq',
      question: 'FAT stands for:',
      options: ['File Allocation Table', 'Fast Access Table', 'File Access Table', 'None'],
      answer: 'File Allocation Table',
      xp: 10,
    },
    {
      id: 'os-45',
      type: 'mcq',
      question: 'Inode contains:',
      options: ['File metadata', 'File data', 'No data', 'CPU data'],
      answer: 'File metadata',
      xp: 10,
    },
    {
      id: 'os-46',
      type: 'mcq',
      question: 'Disk scheduling algorithms:',
      options: ['FCFS, SSTF, SCAN', 'Only FCFS', 'Only SSTF', 'Only SCAN'],
      answer: 'FCFS, SSTF, SCAN',
      xp: 10,
    },
    {
      id: 'os-47',
      type: 'mcq',
      question: 'SSTF stands for:',
      options: ['Shortest Seek Time First', 'Smallest Seek Time First', 'Short Seek Time First', 'None'],
      answer: 'Shortest Seek Time First',
      xp: 10,
    },
    {
      id: 'os-48',
      type: 'mcq',
      question: 'SCAN algorithm is also called:',
      options: ['Elevator algorithm', 'Lift algorithm', 'Both', 'None'],
      answer: 'Elevator algorithm',
      xp: 10,
    },
    {
      id: 'os-49',
      type: 'mcq',
      question: 'RAID stands for:',
      options: ['Redundant Array of Independent Disks', 'Random Access Independent Disks', 'Redundant Access Independent Disks', 'None'],
      answer: 'Redundant Array of Independent Disks',
      xp: 10,
    },
    {
      id: 'os-50',
      type: 'mcq',
      question: 'Disk cache is used for:',
      options: ['Faster access', 'Slower access', 'No access', 'File access'],
      answer: 'Faster access',
      xp: 10,
    },
  ],
  DBMS: [
    {
      id: 'dbms-1',
      type: 'mcq',
      question: 'DBMS stands for:',
      options: ['Database Management System', 'Data Base Management System', 'Database Managing System', 'None'],
      answer: 'Database Management System',
      xp: 10,
    },
    {
      id: 'dbms-2',
      type: 'mcq',
      question: 'DBMS is:',
      options: ['Software', 'Hardware', 'OS', 'Network'],
      answer: 'Software',
      xp: 10,
    },
    {
      id: 'dbms-3',
      type: 'mcq',
      question: 'Database is:',
      options: ['Collection of data', 'Single data', 'No data', 'File data'],
      answer: 'Collection of data',
      xp: 10,
    },
    {
      id: 'dbms-4',
      type: 'mcq',
      question: 'RDBMS stands for:',
      options: ['Relational Database Management System', 'Random Database Management System', 'Relational Data Base Management System', 'None'],
      answer: 'Relational Database Management System',
      xp: 10,
    },
    {
      id: 'dbms-5',
      type: 'mcq',
      question: 'Table in RDBMS is:',
      options: ['Relation', 'File', 'Record', 'Field'],
      answer: 'Relation',
      xp: 10,
    },
    {
      id: 'dbms-6',
      type: 'mcq',
      question: 'Row in table is called:',
      options: ['Tuple', 'Attribute', 'Domain', 'Schema'],
      answer: 'Tuple',
      xp: 10,
    },
    {
      id: 'dbms-7',
      type: 'mcq',
      question: 'Column in table is called:',
      options: ['Attribute', 'Tuple', 'Domain', 'Schema'],
      answer: 'Attribute',
      xp: 10,
    },
    {
      id: 'dbms-8',
      type: 'mcq',
      question: 'Primary key is:',
      options: ['Unique identifier', 'Duplicate identifier', 'No identifier', 'File identifier'],
      answer: 'Unique identifier',
      xp: 10,
    },
    {
      id: 'dbms-9',
      type: 'mcq',
      question: 'Foreign key is:',
      options: ['Reference to primary key', 'Unique key', 'No key', 'File key'],
      answer: 'Reference to primary key',
      xp: 10,
    },
    {
      id: 'dbms-10',
      type: 'mcq',
      question: 'Candidate key is:',
      options: ['Potential primary key', 'Actual primary key', 'No key', 'File key'],
      answer: 'Potential primary key',
      xp: 10,
    },
    {
      id: 'dbms-11',
      type: 'mcq',
      question: 'Super key is:',
      options: ['Set of attributes identifying tuple', 'Single attribute', 'No attribute', 'File attribute'],
      answer: 'Set of attributes identifying tuple',
      xp: 10,
    },
    {
      id: 'dbms-12',
      type: 'mcq',
      question: 'Composite key is:',
      options: ['Multiple attributes as key', 'Single attribute', 'No attribute', 'File attribute'],
      answer: 'Multiple attributes as key',
      xp: 10,
    },
    {
      id: 'dbms-13',
      type: 'mcq',
      question: 'Alternate key is:',
      options: ['Candidate key not chosen as primary', 'Primary key', 'No key', 'File key'],
      answer: 'Candidate key not chosen as primary',
      xp: 10,
    },
    {
      id: 'dbms-14',
      type: 'mcq',
      question: 'Entity is:',
      options: ['Real world object', 'Database object', 'No object', 'File object'],
      answer: 'Real world object',
      xp: 10,
    },
    {
      id: 'dbms-15',
      type: 'mcq',
      question: 'Entity set is:',
      options: ['Collection of entities', 'Single entity', 'No entity', 'File entity'],
      answer: 'Collection of entities',
      xp: 10,
    },
    {
      id: 'dbms-16',
      type: 'mcq',
      question: 'Relationship is:',
      options: ['Association between entities', 'Single entity', 'No entity', 'File entity'],
      answer: 'Association between entities',
      xp: 10,
    },
    {
      id: 'dbms-17',
      type: 'mcq',
      question: 'Degree of relationship:',
      options: ['Number of participating entities', 'Size of entity', 'No entity', 'File entity'],
      answer: 'Number of participating entities',
      xp: 10,
    },
    {
      id: 'dbms-18',
      type: 'mcq',
      question: 'Cardinality is:',
      options: ['Number of entity instances', 'Size of entity', 'No entity', 'File entity'],
      answer: 'Number of entity instances',
      xp: 10,
    },
    {
      id: 'dbms-19',
      type: 'mcq',
      question: 'One-to-one relationship:',
      options: ['Each entity relates to one other', 'Many relations', 'No relation', 'File relation'],
      answer: 'Each entity relates to one other',
      xp: 10,
    },
    {
      id: 'dbms-20',
      type: 'mcq',
      question: 'One-to-many relationship:',
      options: ['One entity relates to many others', 'One to one', 'No relation', 'File relation'],
      answer: 'One entity relates to many others',
      xp: 10,
    },
    {
      id: 'dbms-21',
      type: 'mcq',
      question: 'Many-to-many relationship:',
      options: ['Many entities relate to many others', 'One to one', 'One to many', 'No relation'],
      answer: 'Many entities relate to many others',
      xp: 10,
    },
    {
      id: 'dbms-22',
      type: 'mcq',
      question: 'ER diagram shows:',
      options: ['Entities and relationships', 'Only entities', 'Only relationships', 'No diagram'],
      answer: 'Entities and relationships',
      xp: 10,
    },
    {
      id: 'dbms-23',
      type: 'mcq',
      question: 'Normalization is:',
      options: ['Reducing redundancy', 'Increasing redundancy', 'No redundancy', 'File redundancy'],
      answer: 'Reducing redundancy',
      xp: 10,
    },
    {
      id: 'dbms-24',
      type: 'mcq',
      question: '1NF eliminates:',
      options: ['Repeating groups', 'Partial dependency', 'Transitive dependency', 'No dependency'],
      answer: 'Repeating groups',
      xp: 10,
    },
    {
      id: 'dbms-25',
      type: 'mcq',
      question: '2NF eliminates:',
      options: ['Partial dependency', 'Repeating groups', 'Transitive dependency', 'No dependency'],
      answer: 'Partial dependency',
      xp: 10,
    },
    {
      id: 'dbms-26',
      type: 'mcq',
      question: '3NF eliminates:',
      options: ['Transitive dependency', 'Partial dependency', 'Repeating groups', 'No dependency'],
      answer: 'Transitive dependency',
      xp: 10,
    },
    {
      id: 'dbms-27',
      type: 'mcq',
      question: 'BCNF is:',
      options: ['Boyce-Codd Normal Form', 'Basic Codd Normal Form', 'Better Codd Normal Form', 'None'],
      answer: 'Boyce-Codd Normal Form',
      xp: 10,
    },
    {
      id: 'dbms-28',
      type: 'mcq',
      question: 'Functional dependency is:',
      options: ['Attribute dependency', 'No dependency', 'File dependency', 'OS dependency'],
      answer: 'Attribute dependency',
      xp: 10,
    },
    {
      id: 'dbms-29',
      type: 'mcq',
      question: 'Trivial functional dependency:',
      options: ['Always holds', 'Never holds', 'Sometimes holds', 'File holds'],
      answer: 'Always holds',
      xp: 10,
    },
    {
      id: 'dbms-30',
      type: 'mcq',
      question: 'Non-trivial functional dependency:',
      options: ['May or may not hold', 'Always holds', 'Never holds', 'File holds'],
      answer: 'May or may not hold',
      xp: 10,
    },
    {
      id: 'dbms-31',
      type: 'mcq',
      question: 'SQL stands for:',
      options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'None'],
      answer: 'Structured Query Language',
      xp: 10,
    },
    {
      id: 'dbms-32',
      type: 'mcq',
      question: 'DDL stands for:',
      options: ['Data Definition Language', 'Data Description Language', 'Database Definition Language', 'None'],
      answer: 'Data Definition Language',
      xp: 10,
    },
    {
      id: 'dbms-33',
      type: 'mcq',
      question: 'DML stands for:',
      options: ['Data Manipulation Language', 'Data Management Language', 'Database Manipulation Language', 'None'],
      answer: 'Data Manipulation Language',
      xp: 10,
    },
    {
      id: 'dbms-34',
      type: 'mcq',
      question: 'DCL stands for:',
      options: ['Data Control Language', 'Data Command Language', 'Database Control Language', 'None'],
      answer: 'Data Control Language',
      xp: 10,
    },
    {
      id: 'dbms-35',
      type: 'mcq',
      question: 'TCL stands for:',
      options: ['Transaction Control Language', 'Table Control Language', 'Transaction Command Language', 'None'],
      answer: 'Transaction Control Language',
      xp: 10,
    },
    {
      id: 'dbms-36',
      type: 'mcq',
      question: 'SELECT statement is used for:',
      options: ['Retrieving data', 'Inserting data', 'Updating data', 'Deleting data'],
      answer: 'Retrieving data',
      xp: 10,
    },
    {
      id: 'dbms-37',
      type: 'mcq',
      question: 'INSERT statement is used for:',
      options: ['Inserting data', 'Retrieving data', 'Updating data', 'Deleting data'],
      answer: 'Inserting data',
      xp: 10,
    },
    {
      id: 'dbms-38',
      type: 'mcq',
      question: 'UPDATE statement is used for:',
      options: ['Updating data', 'Retrieving data', 'Inserting data', 'Deleting data'],
      answer: 'Updating data',
      xp: 10,
    },
    {
      id: 'dbms-39',
      type: 'mcq',
      question: 'DELETE statement is used for:',
      options: ['Deleting data', 'Retrieving data', 'Inserting data', 'Updating data'],
      answer: 'Deleting data',
      xp: 10,
    },
    {
      id: 'dbms-40',
      type: 'mcq',
      question: 'CREATE statement is used for:',
      options: ['Creating database objects', 'Retrieving data', 'Inserting data', 'Updating data'],
      answer: 'Creating database objects',
      xp: 10,
    },
    {
      id: 'dbms-41',
      type: 'mcq',
      question: 'DROP statement is used for:',
      options: ['Deleting database objects', 'Retrieving data', 'Inserting data', 'Updating data'],
      answer: 'Deleting database objects',
      xp: 10,
    },
    {
      id: 'dbms-42',
      type: 'mcq',
      question: 'ALTER statement is used for:',
      options: ['Modifying database objects', 'Retrieving data', 'Inserting data', 'Updating data'],
      answer: 'Modifying database objects',
      xp: 10,
    },
    {
      id: 'dbms-43',
      type: 'mcq',
      question: 'JOIN is used for:',
      options: ['Combining tables', 'Splitting tables', 'No tables', 'File tables'],
      answer: 'Combining tables',
      xp: 10,
    },
    {
      id: 'dbms-44',
      type: 'mcq',
      question: 'INNER JOIN returns:',
      options: ['Matching rows', 'All rows', 'No rows', 'File rows'],
      answer: 'Matching rows',
      xp: 10,
    },
    {
      id: 'dbms-45',
      type: 'mcq',
      question: 'LEFT JOIN returns:',
      options: ['All left table rows', 'All right table rows', 'No rows', 'File rows'],
      answer: 'All left table rows',
      xp: 10,
    },
    {
      id: 'dbms-46',
      type: 'mcq',
      question: 'RIGHT JOIN returns:',
      options: ['All right table rows', 'All left table rows', 'No rows', 'File rows'],
      answer: 'All right table rows',
      xp: 10,
    },
    {
      id: 'dbms-47',
      type: 'mcq',
      question: 'FULL JOIN returns:',
      options: ['All rows from both tables', 'Matching rows', 'No rows', 'File rows'],
      answer: 'All rows from both tables',
      xp: 10,
    },
    {
      id: 'dbms-48',
      type: 'mcq',
      question: 'GROUP BY is used for:',
      options: ['Grouping rows', 'Sorting rows', 'Filtering rows', 'No rows'],
      answer: 'Grouping rows',
      xp: 10,
    },
    {
      id: 'dbms-49',
      type: 'mcq',
      question: 'HAVING clause is used for:',
      options: ['Filtering groups', 'Filtering rows', 'Sorting groups', 'No groups'],
      answer: 'Filtering groups',
      xp: 10,
    },
    {
      id: 'dbms-50',
      type: 'mcq',
      question: 'ORDER BY is used for:',
      options: ['Sorting results', 'Grouping results', 'Filtering results', 'No results'],
      answer: 'Sorting results',
      xp: 10,
    },
  ],
  'Operating System': [
    {
      id: 'os-1',
      type: 'mcq',
      question: 'OS stands for:',
      options: ['Open System', 'Operating System', 'Output System', 'None'],
      answer: 'Operating System',
      xp: 10,
    },
    {
      id: 'os-2',
      type: 'mcq',
      question: 'OS acts as:',
      options: ['Interface between user & hardware', 'Program', 'Compiler', 'None'],
      answer: 'Interface between user & hardware',
      xp: 10,
    },
    {
      id: 'os-3',
      type: 'mcq',
      question: 'Kernel is:',
      options: ['Core of OS', 'Program', 'User', 'File'],
      answer: 'Core of OS',
      xp: 10,
    },
    {
      id: 'os-4',
      type: 'mcq',
      question: 'Process is:',
      options: ['Program in execution', 'File', 'Memory', 'CPU'],
      answer: 'Program in execution',
      xp: 10,
    },
    {
      id: 'os-5',
      type: 'mcq',
      question: 'Thread is:',
      options: ['Lightweight process', 'Heavy process', 'File', 'CPU'],
      answer: 'Lightweight process',
      xp: 10,
    },
    {
      id: 'os-6',
      type: 'mcq',
      question: 'Multitasking means:',
      options: ['Multiple tasks simultaneously', 'Single task', 'No task', 'File task'],
      answer: 'Multiple tasks simultaneously',
      xp: 10,
    },
    {
      id: 'os-7',
      type: 'mcq',
      question: 'Multiprocessing uses:',
      options: ['Multiple CPUs', 'Single CPU', 'No CPU', 'File CPU'],
      answer: 'Multiple CPUs',
      xp: 10,
    },
    {
      id: 'os-8',
      type: 'mcq',
      question: 'Multithreading uses:',
      options: ['Multiple threads', 'Single thread', 'No thread', 'File thread'],
      answer: 'Multiple threads',
      xp: 10,
    },
    {
      id: 'os-9',
      type: 'mcq',
      question: 'System call is:',
      options: ['Request to OS', 'User program', 'Hardware', 'File'],
      answer: 'Request to OS',
      xp: 10,
    },
    {
      id: 'os-10',
      type: 'mcq',
      question: 'Interrupt is:',
      options: ['Signal to CPU', 'Program', 'File', 'Memory'],
      answer: 'Signal to CPU',
      xp: 10,
    },
    {
      id: 'os-11',
      type: 'mcq',
      question: 'Bootstrapping means:',
      options: ['Loading OS', 'Running program', 'Saving file', 'Deleting data'],
      answer: 'Loading OS',
      xp: 10,
    },
    {
      id: 'os-12',
      type: 'mcq',
      question: 'Shell is:',
      options: ['Command interpreter', 'Kernel', 'Hardware', 'File'],
      answer: 'Command interpreter',
      xp: 10,
    },
    {
      id: 'os-13',
      type: 'mcq',
      question: 'Device driver is:',
      options: ['Hardware interface', 'User program', 'OS kernel', 'File system'],
      answer: 'Hardware interface',
      xp: 10,
    },
    {
      id: 'os-14',
      type: 'mcq',
      question: 'Spooling is:',
      options: ['Buffering I/O', 'Direct I/O', 'No I/O', 'File I/O'],
      answer: 'Buffering I/O',
      xp: 10,
    },
    {
      id: 'os-15',
      type: 'mcq',
      question: 'Cache memory is:',
      options: ['Fast memory', 'Slow memory', 'No memory', 'File memory'],
      answer: 'Fast memory',
      xp: 10,
    },
    {
      id: 'os-16',
      type: 'mcq',
      question: 'FCFS means:',
      options: ['First Come First Serve', 'Fast CPU First', 'File Control', 'None'],
      answer: 'First Come First Serve',
      xp: 10,
    },
    {
      id: 'os-17',
      type: 'mcq',
      question: 'SJF means:',
      options: ['Shortest Job First', 'Small Job Fast', 'Simple Job', 'None'],
      answer: 'Shortest Job First',
      xp: 10,
    },
    {
      id: 'os-18',
      type: 'mcq',
      question: 'Round Robin uses:',
      options: ['Time quantum', 'Priority', 'FCFS', 'None'],
      answer: 'Time quantum',
      xp: 10,
    },
    {
      id: 'os-19',
      type: 'mcq',
      question: 'Context switching:',
      options: ['Switching processes', 'Deleting', 'Saving', 'None'],
      answer: 'Switching processes',
      xp: 10,
    },
    {
      id: 'os-20',
      type: 'mcq',
      question: 'Priority scheduling uses:',
      options: ['Priority numbers', 'Time', 'Size', 'None'],
      answer: 'Priority numbers',
      xp: 10,
    },
    {
      id: 'os-21',
      type: 'mcq',
      question: 'Preemptive scheduling:',
      options: ['Can interrupt', 'Cannot interrupt', 'No scheduling', 'File scheduling'],
      answer: 'Can interrupt',
      xp: 10,
    },
    {
      id: 'os-22',
      type: 'mcq',
      question: 'Non-preemptive scheduling:',
      options: ['Cannot interrupt', 'Can interrupt', 'No scheduling', 'File scheduling'],
      answer: 'Cannot interrupt',
      xp: 10,
    },
    {
      id: 'os-23',
      type: 'mcq',
      question: 'Multilevel queue uses:',
      options: ['Multiple queues', 'Single queue', 'No queue', 'File queue'],
      answer: 'Multiple queues',
      xp: 10,
    },
    {
      id: 'os-24',
      type: 'mcq',
      question: 'Process states include:',
      options: ['Ready, Running, Waiting', 'Only Ready', 'Only Running', 'Only Waiting'],
      answer: 'Ready, Running, Waiting',
      xp: 10,
    },
    {
      id: 'os-25',
      type: 'mcq',
      question: 'Process control block contains:',
      options: ['Process information', 'User data', 'Files', 'Hardware'],
      answer: 'Process information',
      xp: 10,
    },
    {
      id: 'os-26',
      type: 'mcq',
      question: 'Semaphore is used for:',
      options: ['Synchronization', 'Scheduling', 'Memory', 'Files'],
      answer: 'Synchronization',
      xp: 10,
    },
    {
      id: 'os-27',
      type: 'mcq',
      question: 'Mutex is:',
      options: ['Binary semaphore', 'Counting semaphore', 'No semaphore', 'File semaphore'],
      answer: 'Binary semaphore',
      xp: 10,
    },
    {
      id: 'os-28',
      type: 'mcq',
      question: 'Critical section is:',
      options: ['Shared resource access', 'Private access', 'No access', 'File access'],
      answer: 'Shared resource access',
      xp: 10,
    },
    {
      id: 'os-29',
      type: 'mcq',
      question: 'Race condition occurs in:',
      options: ['Concurrent access', 'Sequential access', 'No access', 'File access'],
      answer: 'Concurrent access',
      xp: 10,
    },
    {
      id: 'os-30',
      type: 'mcq',
      question: 'Deadlock occurs when:',
      options: ['Waiting forever', 'Running', 'Idle', 'None'],
      answer: 'Waiting forever',
      xp: 10,
    },
    {
      id: 'os-31',
      type: 'mcq',
      question: 'Paging avoids:',
      options: ['Fragmentation', 'Memory', 'CPU', 'File'],
      answer: 'Fragmentation',
      xp: 10,
    },
    {
      id: 'os-32',
      type: 'mcq',
      question: 'Virtual memory uses:',
      options: ['Disk as RAM', 'CPU', 'File', 'None'],
      answer: 'Disk as RAM',
      xp: 10,
    },
    {
      id: 'os-33',
      type: 'mcq',
      question: 'FIFO page replacement:',
      options: ['First in first out', 'Last in', 'Random', 'None'],
      answer: 'First in first out',
      xp: 10,
    },
    {
      id: 'os-34',
      type: 'mcq',
      question: 'LRU page replacement:',
      options: ['Least Recently Used', 'Last Recently Used', 'Least Random Used', 'None'],
      answer: 'Least Recently Used',
      xp: 10,
    },
    {
      id: 'os-35',
      type: 'mcq',
      question: 'Thrashing occurs when:',
      options: ['Excessive paging', 'No paging', 'Normal paging', 'File paging'],
      answer: 'Excessive paging',
      xp: 10,
    },
    {
      id: 'os-36',
      type: 'mcq',
      question: 'Segmentation divides memory into:',
      options: ['Segments', 'Pages', 'Blocks', 'Files'],
      answer: 'Segments',
      xp: 10,
    },
    {
      id: 'os-37',
      type: 'mcq',
      question: 'Demand paging loads:',
      options: ['Pages on demand', 'All pages', 'No pages', 'File pages'],
      answer: 'Pages on demand',
      xp: 10,
    },
    {
      id: 'os-38',
      type: 'mcq',
      question: 'Page fault occurs when:',
      options: ['Page not in memory', 'Page in memory', 'No page', 'File page'],
      answer: 'Page not in memory',
      xp: 10,
    },
    {
      id: 'os-39',
      type: 'mcq',
      question: 'Working set model tracks:',
      options: ['Recently used pages', 'All pages', 'No pages', 'File pages'],
      answer: 'Recently used pages',
      xp: 10,
    },
    {
      id: 'os-40',
      type: 'mcq',
      question: 'Memory allocation strategies:',
      options: ['First fit, Best fit, Worst fit', 'Only First fit', 'Only Best fit', 'Only Worst fit'],
      answer: 'First fit, Best fit, Worst fit',
      xp: 10,
    },
    {
      id: 'os-41',
      type: 'mcq',
      question: 'File system manages:',
      options: ['Files', 'CPU', 'Memory', 'Process'],
      answer: 'Files',
      xp: 10,
    },
    {
      id: 'os-42',
      type: 'mcq',
      question: 'Directory is:',
      options: ['Folder', 'File', 'CPU', 'RAM'],
      answer: 'Folder',
      xp: 10,
    },
    {
      id: 'os-43',
      type: 'mcq',
      question: 'File allocation methods:',
      options: ['Contiguous, Linked, Indexed', 'Only Contiguous', 'Only Linked', 'Only Indexed'],
      answer: 'Contiguous, Linked, Indexed',
      xp: 10,
    },
    {
      id: 'os-44',
      type: 'mcq',
      question: 'FAT stands for:',
      options: ['File Allocation Table', 'Fast Access Table', 'File Access Table', 'None'],
      answer: 'File Allocation Table',
      xp: 10,
    },
    {
      id: 'os-45',
      type: 'mcq',
      question: 'Inode contains:',
      options: ['File metadata', 'File data', 'No data', 'CPU data'],
      answer: 'File metadata',
      xp: 10,
    },
    {
      id: 'os-46',
      type: 'mcq',
      question: 'Disk scheduling algorithms:',
      options: ['FCFS, SSTF, SCAN', 'Only FCFS', 'Only SSTF', 'Only SCAN'],
      answer: 'FCFS, SSTF, SCAN',
      xp: 10,
    },
    {
      id: 'os-47',
      type: 'mcq',
      question: 'SSTF stands for:',
      options: ['Shortest Seek Time First', 'Smallest Seek Time First', 'Short Seek Time First', 'None'],
      answer: 'Shortest Seek Time First',
      xp: 10,
    },
    {
      id: 'os-48',
      type: 'mcq',
      question: 'SCAN algorithm is also called:',
      options: ['Elevator algorithm', 'Lift algorithm', 'Both', 'None'],
      answer: 'Elevator algorithm',
      xp: 10,
    },
    {
      id: 'os-49',
      type: 'mcq',
      question: 'RAID stands for:',
      options: ['Redundant Array of Independent Disks', 'Random Access Independent Disks', 'Redundant Access Independent Disks', 'None'],
      answer: 'Redundant Array of Independent Disks',
      xp: 10,
    },
    {
      id: 'os-50',
      type: 'mcq',
      question: 'Disk cache is used for:',
      options: ['Faster access', 'Slower access', 'No access', 'File access'],
      answer: 'Faster access',
      xp: 10,
    },
  ],
  'Web Development': [
    {
      id: 'web-1',
      type: 'mcq',
      question: 'HTML stands for:',
      options: ['Hyper Text Markup Language', 'High Text Machine Language', 'Hyper Tool', 'None'],
      answer: 'Hyper Text Markup Language',
      xp: 10,
    },
    {
      id: 'web-2',
      type: 'mcq',
      question: 'HTML is:',
      options: ['Programming language', 'Markup language', 'OS', 'DB'],
      answer: 'Markup language',
      xp: 10,
    },
    {
      id: 'web-3',
      type: 'mcq',
      question: 'Tag for paragraph:',
      options: ['<p>', '<h1>', '<div>', '<span>'],
      answer: '<p>',
      xp: 10,
    },
    {
      id: 'web-4',
      type: 'mcq',
      question: 'Self-closing tag example:',
      options: ['<img>', '<p>', '<div>', '<span>'],
      answer: '<img>',
      xp: 10,
    },
    {
      id: 'web-5',
      type: 'mcq',
      question: 'HTML document starts with:',
      options: ['<!DOCTYPE html>', '<html>', '<head>', '<body>'],
      answer: '<!DOCTYPE html>',
      xp: 10,
    },
    {
      id: 'web-6',
      type: 'mcq',
      question: 'Link tag is:',
      options: ['<a>', '<link>', '<href>', '<url>'],
      answer: '<a>',
      xp: 10,
    },
    {
      id: 'web-7',
      type: 'mcq',
      question: 'Image tag is:',
      options: ['<img>', '<image>', '<pic>', '<photo>'],
      answer: '<img>',
      xp: 10,
    },
    {
      id: 'web-8',
      type: 'mcq',
      question: 'List item tag:',
      options: ['<li>', '<list>', '<item>', '<ul>'],
      answer: '<li>',
      xp: 10,
    },
    {
      id: 'web-9',
      type: 'mcq',
      question: 'Table row tag:',
      options: ['<tr>', '<td>', '<th>', '<table>'],
      answer: '<tr>',
      xp: 10,
    },
    {
      id: 'web-10',
      type: 'mcq',
      question: 'Form input tag:',
      options: ['<input>', '<form>', '<button>', '<text>'],
      answer: '<input>',
      xp: 10,
    },
    {
      id: 'web-11',
      type: 'mcq',
      question: 'Heading tag range:',
      options: ['<h1> to <h6>', '<h1> to <h5>', '<h1> to <h4>', '<h1> to <h3>'],
      answer: '<h1> to <h6>',
      xp: 10,
    },
    {
      id: 'web-12',
      type: 'mcq',
      question: 'Break line tag:',
      options: ['<br>', '<break>', '<line>', '<newline>'],
      answer: '<br>',
      xp: 10,
    },
    {
      id: 'web-13',
      type: 'mcq',
      question: 'Bold text tag:',
      options: ['<b>', '<strong>', '<bold>', '<text>'],
      answer: '<b>',
      xp: 10,
    },
    {
      id: 'web-14',
      type: 'mcq',
      question: 'Italic text tag:',
      options: ['<i>', '<italic>', '<em>', '<text>'],
      answer: '<i>',
      xp: 10,
    },
    {
      id: 'web-15',
      type: 'mcq',
      question: 'Division tag:',
      options: ['<div>', '<division>', '<section>', '<part>'],
      answer: '<div>',
      xp: 10,
    },
    {
      id: 'web-16',
      type: 'mcq',
      question: 'CSS stands for:',
      options: ['Cascading Style Sheets', 'Color Style Sheets', 'Computer Style', 'None'],
      answer: 'Cascading Style Sheets',
      xp: 10,
    },
    {
      id: 'web-17',
      type: 'mcq',
      question: 'CSS is used for:',
      options: ['Styling', 'Logic', 'Database', 'OS'],
      answer: 'Styling',
      xp: 10,
    },
    {
      id: 'web-18',
      type: 'mcq',
      question: 'CSS selector types:',
      options: ['Element, Class, ID', 'Only Element', 'Only Class', 'Only ID'],
      answer: 'Element, Class, ID',
      xp: 10,
    },
    {
      id: 'web-19',
      type: 'mcq',
      question: 'Class selector starts with:',
      options: ['.', '#', '@', '$'],
      answer: '.',
      xp: 10,
    },
    {
      id: 'web-20',
      type: 'mcq',
      question: 'ID selector starts with:',
      options: ['#', '.', '@', '$'],
      answer: '#',
      xp: 10,
    },
    {
      id: 'web-21',
      type: 'mcq',
      question: 'CSS color property:',
      options: ['color', 'background', 'text-color', 'font-color'],
      answer: 'color',
      xp: 10,
    },
    {
      id: 'web-22',
      type: 'mcq',
      question: 'CSS font-size property:',
      options: ['font-size', 'text-size', 'size', 'font'],
      answer: 'font-size',
      xp: 10,
    },
    {
      id: 'web-23',
      type: 'mcq',
      question: 'CSS margin property:',
      options: ['margin', 'padding', 'border', 'spacing'],
      answer: 'margin',
      xp: 10,
    },
    {
      id: 'web-24',
      type: 'mcq',
      question: 'CSS padding property:',
      options: ['padding', 'margin', 'border', 'spacing'],
      answer: 'padding',
      xp: 10,
    },
    {
      id: 'web-25',
      type: 'mcq',
      question: 'CSS display property values:',
      options: ['block, inline, none', 'show, hide', 'visible, hidden', 'flex, grid'],
      answer: 'block, inline, none',
      xp: 10,
    },
    {
      id: 'web-26',
      type: 'mcq',
      question: 'CSS position property:',
      options: ['static, relative, absolute, fixed', 'top, bottom, left, right', 'x, y, z', 'none'],
      answer: 'static, relative, absolute, fixed',
      xp: 10,
    },
    {
      id: 'web-27',
      type: 'mcq',
      question: 'CSS flexbox is for:',
      options: ['Layout', 'Colors', 'Fonts', 'Images'],
      answer: 'Layout',
      xp: 10,
    },
    {
      id: 'web-28',
      type: 'mcq',
      question: 'CSS grid is for:',
      options: ['Layout', 'Colors', 'Fonts', 'Images'],
      answer: 'Layout',
      xp: 10,
    },
    {
      id: 'web-29',
      type: 'mcq',
      question: 'CSS media queries for:',
      options: ['Responsive design', 'Colors', 'Fonts', 'Images'],
      answer: 'Responsive design',
      xp: 10,
    },
    {
      id: 'web-30',
      type: 'mcq',
      question: 'CSS animation property:',
      options: ['animation', 'transition', 'transform', 'move'],
      answer: 'animation',
      xp: 10,
    },
    {
      id: 'web-31',
      type: 'mcq',
      question: 'JavaScript is:',
      options: ['Programming language', 'Markup', 'DB', 'OS'],
      answer: 'Programming language',
      xp: 10,
    },
    {
      id: 'web-32',
      type: 'mcq',
      question: 'JavaScript is used for:',
      options: ['Interactivity', 'Styling', 'Storage', 'None'],
      answer: 'Interactivity',
      xp: 10,
    },
    {
      id: 'web-33',
      type: 'mcq',
      question: 'JavaScript variable keyword:',
      options: ['var', 'int', 'float', 'define'],
      answer: 'var',
      xp: 10,
    },
    {
      id: 'web-34',
      type: 'mcq',
      question: 'JavaScript function keyword:',
      options: ['func', 'function', 'def', 'method'],
      answer: 'function',
      xp: 10,
    },
    {
      id: 'web-35',
      type: 'mcq',
      question: 'JavaScript array syntax:',
      options: ['[]', '{}', '()', '<>'],
      answer: '[]',
      xp: 10,
    },
    {
      id: 'web-36',
      type: 'mcq',
      question: 'JavaScript object syntax:',
      options: ['{}', '[]', '()', '<>'],
      answer: '{}',
      xp: 10,
    },
    {
      id: 'web-37',
      type: 'mcq',
      question: 'JavaScript if statement:',
      options: ['if () {}', 'when () {}', 'case () {}', 'check () {}'],
      answer: 'if () {}',
      xp: 10,
    },
    {
      id: 'web-38',
      type: 'mcq',
      question: 'JavaScript loop statement:',
      options: ['for () {}', 'loop () {}', 'repeat () {}', 'cycle () {}'],
      answer: 'for () {}',
      xp: 10,
    },
    {
      id: 'web-39',
      type: 'mcq',
      question: 'JavaScript while loop:',
      options: ['while () {}', 'until () {}', 'as long as () {}', 'during () {}'],
      answer: 'while () {}',
      xp: 10,
    },
    {
      id: 'web-40',
      type: 'mcq',
      question: 'JavaScript DOM method:',
      options: ['getElementById', 'findElement', 'searchElement', 'locateElement'],
      answer: 'getElementById',
      xp: 10,
    },
    {
      id: 'web-41',
      type: 'mcq',
      question: 'JavaScript event listener:',
      options: ['addEventListener', 'onEvent', 'listenEvent', 'attachEvent'],
      answer: 'addEventListener',
      xp: 10,
    },
    {
      id: 'web-42',
      type: 'mcq',
      question: 'JavaScript console method:',
      options: ['console.log', 'print', 'log', 'output'],
      answer: 'console.log',
      xp: 10,
    },
    {
      id: 'web-43',
      type: 'mcq',
      question: 'JavaScript string method:',
      options: ['toUpperCase', 'uppercase', 'upper', 'convert'],
      answer: 'toUpperCase',
      xp: 10,
    },
    {
      id: 'web-44',
      type: 'mcq',
      question: 'JavaScript array method:',
      options: ['push', 'add', 'insert', 'append'],
      answer: 'push',
      xp: 10,
    },
    {
      id: 'web-45',
      type: 'mcq',
      question: 'JavaScript comparison operator:',
      options: ['===', '=', 'equals', 'same'],
      answer: '===',
      xp: 10,
    },
    {
      id: 'web-46',
      type: 'mcq',
      question: 'JavaScript logical operator:',
      options: ['&&', 'and', '&', 'plus'],
      answer: '&&',
      xp: 10,
    },
    {
      id: 'web-47',
      type: 'mcq',
      question: 'JavaScript ternary operator:',
      options: ['? :', 'if then', 'choose', 'select'],
      answer: '? :',
      xp: 10,
    },
    {
      id: 'web-48',
      type: 'mcq',
      question: 'JavaScript try-catch for:',
      options: ['Error handling', 'Loops', 'Conditions', 'Functions'],
      answer: 'Error handling',
      xp: 10,
    },
    {
      id: 'web-49',
      type: 'mcq',
      question: 'JavaScript async/await for:',
      options: ['Asynchronous code', 'Synchronous code', 'Loops', 'Conditions'],
      answer: 'Asynchronous code',
      xp: 10,
    },
    {
      id: 'web-50',
      type: 'mcq',
      question: 'JavaScript framework example:',
      options: ['React', 'HTML', 'CSS', 'SQL'],
      answer: 'React',
      xp: 10,
    },
  ],
}

const badgeLevels = [
  { threshold: 0, label: 'Starter', description: 'Begin your learning journey', color: 'bg-slate-200 text-slate-700' },
  { threshold: 50, label: 'DSA Beginner', description: 'You are building momentum', color: 'bg-indigo-100 text-indigo-700' },
  { threshold: 120, label: 'Interview Ready', description: 'Strong fundamentals achieved', color: 'bg-emerald-100 text-emerald-700' },
  { threshold: 200, label: 'Placement Champ', description: 'You are on fire', color: 'bg-yellow-100 text-yellow-800' },
]

function getBadge(xp) {
  return [...badgeLevels].reverse().find((badge) => xp >= badge.threshold) ?? badgeLevels[0]
}

export default function KnowledgeChecker() {
  const domains = useMemo(() => Object.keys(quizData), [])
  const [selectedDomain, setSelectedDomain] = useState(domains[0])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [xp, setXp] = useState(0)
  const [totalCorrectQuestions, setTotalCorrectQuestions] = useState(0)
  const [completed, setCompleted] = useState({})
  const [feedback, setFeedback] = useState('')
  const [weakAreas, setWeakAreas] = useState([])
  const [loadingProgress, setLoadingProgress] = useState(true)
  const [progressError, setProgressError] = useState('')
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [questionCount, setQuestionCount] = useState(3)
  const [showQuestionSelector, setShowQuestionSelector] = useState(true)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [showQuizSummary, setShowQuizSummary] = useState(false)
  const [quizResults, setQuizResults] = useState({ correct: 0, incorrect: 0, total: 0 })
  const [showHintModal, setShowHintModal] = useState(false)

  const questions = quizData[selectedDomain]
  const current = selectedQuestions[questionIndex] || questions[0]

  useEffect(() => {
    let mounted = true

    async function loadProgress() {
      try {
        const response = await getKnowledgeProgress()
        if (!mounted) return
        setXp(response.data.xp || 0)
        setTotalCorrectQuestions(response.data.totalCorrectQuestions || 0)
        setWeakAreas(response.data.weakAreas || [])
      } catch (err) {
        if (!mounted) return
        setProgressError('Unable to load progress')
      } finally {
        if (mounted) setLoadingProgress(false)
      }
    }

    loadProgress()
    return () => {
      mounted = false
    }
  }, [])

  const persistProgress = async (payload) => {
    try {
      const response = await updateKnowledgeProgress(payload)
      setXp(response.data.xp)
      setTotalCorrectQuestions(response.data.totalCorrectQuestions)
      setWeakAreas(response.data.weakAreas)
    } catch (err) {
      console.warn('Knowledge progress sync failed', err)
    }
  }

  const handleDomainChange = (domain) => {
    setSelectedDomain(domain)
    setQuestionIndex(0)
    setAnswers({})
    setSelectedQuestions([])
    setShowQuestionSelector(true)
    setSelectedAnswer('')
    setShowResult(false)
    setShowQuizSummary(false)
    setQuizResults({ correct: 0, incorrect: 0, total: 0 })
  }

  const startQuiz = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, questionCount)
    setSelectedQuestions(selected)
    setShowQuestionSelector(false)
    setQuestionIndex(0)
    setAnswers({})
    setSelectedAnswer('')
    setShowResult(false)
    setShowQuizSummary(false)
    setQuizResults({ correct: 0, incorrect: 0, total: 0 })
  }

  const backToSelector = () => {
    setShowQuestionSelector(true)
    setSelectedQuestions([])
    setShowQuizSummary(false)
    setQuizResults({ correct: 0, incorrect: 0, total: 0 })
  }

  const getCurrentBadge = getBadge(xp)

  const handleAnswer = (value) => {
    if (showResult) {
      // Move to next question
      const isCorrect = selectedAnswer === current.answer
      const earnedXp = isCorrect ? current.xp : Math.max(5, Math.floor(current.xp / 3))
      const nextTotalCorrect = isCorrect ? totalCorrectQuestions + 1 : totalCorrectQuestions
      const nextAnswers = { ...answers, [current.id]: { value: selectedAnswer, correct: isCorrect } }

      setAnswers(nextAnswers)
      setXp((prev) => prev + earnedXp)
      setTotalCorrectQuestions(nextTotalCorrect)

      const nextIndex = questionIndex + 1
      if (nextIndex >= selectedQuestions.length) {
        // Calculate final results
        const finalAnswers = { ...answers, [current.id]: { value: selectedAnswer, correct: isCorrect } }
        const correctCount = selectedQuestions.filter((question) => {
          const answer = finalAnswers[question.id]?.value ?? ''
          return answer === question.answer
        }).length
        const incorrectCount = selectedQuestions.length - correctCount
        
        setQuizResults({
          correct: correctCount,
          incorrect: incorrectCount,
          total: selectedQuestions.length
        })
        
        setCompleted((prev) => ({ ...prev, [selectedDomain]: true }))
        const newWeak = incorrectCount >= 1 && !weakAreas.includes(selectedDomain) ? [...weakAreas, selectedDomain] : weakAreas
        setWeakAreas(newWeak)
        persistProgress({ xpDelta: earnedXp, totalCorrectQuestions: nextTotalCorrect, weakAreas: newWeak })
        setShowQuizSummary(true)
      } else {
        persistProgress({ xpDelta: earnedXp, totalCorrectQuestions: nextTotalCorrect, weakAreas })
        setQuestionIndex(nextIndex)
      }
      setSelectedAnswer('')
      setShowResult(false)
    } else {
      // Show result
      setSelectedAnswer(value)
      setShowResult(true)
    }
  }

  const answeredCount = Object.keys(answers).filter((key) => selectedQuestions.some((q) => q.id === key)).length
  const progressPercent = selectedQuestions.length ? Math.min(100, Math.round((answeredCount / selectedQuestions.length) * 100)) : 0

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-slate-900 px-6 py-6 text-white shadow-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Knowledge Checker</p>
            <h1 className="mt-2 text-3xl font-semibold">Mini Quiz + Coding Practice</h1>
            <p className="mt-2 max-w-2xl text-slate-300">Train domain skills, earn XP, unlock badges, and spot weak areas fast.</p>
            {progressError && <p className="mt-3 text-sm text-amber-200">{progressError}</p>}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-800/70 p-4">
              <p className="text-sm uppercase text-slate-400">XP</p>
              <p className="mt-2 text-3xl font-semibold">{xp}</p>
            </div>
            <div className="rounded-2xl bg-slate-800/70 p-4">
              <p className="text-sm uppercase text-slate-400">Total Correct Questions</p>
              <p className="mt-2 text-3xl font-semibold">{totalCorrectQuestions}</p>
            </div>
            <div className="rounded-2xl bg-slate-800/70 p-4">
              <p className="text-sm uppercase text-slate-400">Badge</p>
              <p className="mt-2 text-2xl font-semibold">{getCurrentBadge.label}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Domains</p>
            {domains.map((domain) => (
              <button
                key={domain}
                type="button"
                onClick={() => handleDomainChange(domain)}
                className={`block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${selectedDomain === domain ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                {domain}
              </button>
            ))}
          </div>

          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Weak areas</p>
            {weakAreas.length ? (
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {weakAreas.map((area) => (
                  <li key={area} className="rounded-xl bg-red-50 p-3">You are weak in {area}. Practice more here.</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No weak domains yet. Keep practicing!</p>
            )}
          </div>

          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Leaderboard</p>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <p className="font-semibold">Anita</p>
                <p className="text-slate-500">420 XP</p>
              </div>
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <p className="font-semibold">Rohit</p>
                <p className="text-slate-500">330 XP</p>
              </div>
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <p className="font-semibold">You</p>
                <p className="text-slate-500">{xp} XP</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
          {showQuestionSelector ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Select quiz settings</p>
                  <h2 className="mt-2 text-2xl font-semibold">{selectedDomain} quiz</h2>
                  <p className="mt-2 text-slate-600">Choose how many questions you want to answer.</p>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="questionCount" className="block text-sm font-medium text-slate-700">
                      Number of questions
                    </label>
                    <select
                      id="questionCount"
                      value={questionCount}
                      onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                      className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    >
                      {[3, 5, 7, 10, 15, 20].map((count) => (
                        <option key={count} value={count}>
                          {count} questions
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-sm text-slate-600">
                    Available questions: {questions.length}
                  </div>
                  <button
                    type="button"
                    onClick={startQuiz}
                    className="inline-flex items-center justify-center rounded-3xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                  >
                    Start Quiz
                  </button>
                </div>
              </div>
            </div>
          ) : showQuizSummary ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Quiz completed</p>
                  <h2 className="mt-2 text-2xl font-semibold">{selectedDomain} quiz results</h2>
                  <p className="mt-2 text-slate-600">Great job! Here's how you performed.</p>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-6">
                <div className="text-center space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                      <p className="text-3xl font-bold text-green-600">{quizResults.correct}</p>
                      <p className="text-sm text-slate-600">Correct Answers</p>
                    </div>
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                      <p className="text-3xl font-bold text-red-600">{quizResults.incorrect}</p>
                      <p className="text-sm text-slate-600">Incorrect Answers</p>
                    </div>
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                      <p className="text-3xl font-bold text-blue-600">{quizResults.total}</p>
                      <p className="text-sm text-slate-600">Total Questions</p>
                    </div>
                  </div>
                  
                  <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <p className="text-lg font-semibold text-slate-700">Score: {Math.round((quizResults.correct / quizResults.total) * 100)}%</p>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                      <div 
                        className="h-full rounded-full bg-primary-600 transition-all duration-500" 
                        style={{ width: `${(quizResults.correct / quizResults.total) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <button
                      type="button"
                      onClick={backToSelector}
                      className="inline-flex items-center justify-center rounded-3xl bg-slate-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      Back to Menu
                    </button>
                    <button
                      type="button"
                      onClick={startQuiz}
                      className="inline-flex items-center justify-center rounded-3xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Current challenge</p>
                  <h2 className="mt-2 text-2xl font-semibold">{selectedDomain} quiz</h2>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">Progress</p>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-primary-600" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <p className="text-sm text-slate-600">{progressPercent}% complete ({answeredCount}/{selectedQuestions.length})</p>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Question {questionIndex + 1} of {selectedQuestions.length}</p>
                  <button
                    onClick={() => setShowHintModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Hint
                  </button>
                </div>
                <h3 className="text-xl font-semibold">{current.question}</h3>
                <div className="mt-6 space-y-4">
                  {current.type === 'mcq' && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {current.options.map((option) => {
                        let buttonClass = "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-slate-700 transition hover:border-primary-500 hover:bg-primary-50"
                        
                        if (showResult) {
                          if (option === current.answer) {
                            buttonClass = "rounded-2xl border border-green-500 bg-green-50 px-4 py-3 text-left text-green-700 font-semibold"
                          } else if (option === selectedAnswer && option !== current.answer) {
                            buttonClass = "rounded-2xl border border-red-500 bg-red-50 px-4 py-3 text-left text-red-700"
                          } else {
                            buttonClass = "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-slate-500"
                          }
                        }
                        
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => !showResult && handleAnswer(option)}
                            disabled={showResult}
                            className={buttonClass}
                          >
                            {option}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {current.type !== 'mcq' && (
                    <AnswerInput current={current} onSubmit={handleAnswer} />
                  )}
                </div>
                
                {showResult && (
                  <div className="mt-4 rounded-2xl bg-slate-100 p-4">
                    <p className="text-sm font-semibold text-slate-700">
                      {selectedAnswer === current.answer ? '✅ Correct!' : '❌ Incorrect'}
                    </p>
                    {selectedAnswer !== current.answer && (
                      <p className="mt-2 text-sm text-slate-600">
                        Correct answer: <span className="font-semibold text-green-700">{current.answer}</span>
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => handleAnswer('')}
                      className="mt-3 inline-flex items-center justify-center rounded-3xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                    >
                      {questionIndex + 1 >= selectedQuestions.length ? 'Finish Quiz' : 'Next Question'}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-6">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Badge status</p>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xl font-semibold">{getCurrentBadge.label}</p>
                      <p className="mt-2 text-sm text-slate-600">{getCurrentBadge.description}</p>
                    </div>
                    <div className={`rounded-2xl px-4 py-2 text-sm font-semibold ${getCurrentBadge.color}`}>
                      {getCurrentBadge.threshold} XP
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-6">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">What to do next</p>
                  <ul className="mt-4 space-y-3 text-sm text-slate-700">
                    <li className="rounded-2xl bg-white p-4 shadow-sm">Complete the remaining questions in {selectedDomain}.</li>
                    <li className="rounded-2xl bg-white p-4 shadow-sm">Use badges to track skill growth.</li>
                    <li className="rounded-2xl bg-white p-4 shadow-sm">Focus on weak domains shown in the sidebar.</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Hint Chat Panel - Right Side */}
      <HintChatPanel
        isOpen={showHintModal}
        question={current?.question || ''}
        onClose={() => setShowHintModal(false)}
      />
    </div>
  )
}

function AnswerInput({ current, onSubmit }) {
  const [text, setText] = useState('')

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={4}
        className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        placeholder={current.type === 'short' ? 'Type your answer...' : 'Explain your approach...'}
      />
      <button
        type="button"
        onClick={() => {
          if (text.trim()) {
            onSubmit(text)
            setText('')
          }
        }}
        className="inline-flex items-center justify-center rounded-3xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
      >
        Submit answer
      </button>
    </div>
  )
}
