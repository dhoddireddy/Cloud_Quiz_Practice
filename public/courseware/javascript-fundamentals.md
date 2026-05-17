# JavaScript Fundamentals

## Introduction

JavaScript is a versatile programming language that powers the web. It's essential for front-end development and increasingly important for back-end development with Node.js.

## Variables and Data Types

### Declaring Variables
```javascript
let name = "John";        // Block-scoped, can be reassigned
const age = 25;          // Block-scoped, cannot be reassigned
var oldWay = "deprecated"; // Function-scoped (avoid using)
```

### Data Types
- **Primitive**: string, number, boolean, undefined, null, symbol, bigint
- **Object**: arrays, functions, objects

## Functions

### Function Declaration
```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```

### Arrow Functions (ES6+)
```javascript
const greet = (name) => `Hello, ${name}!`;
```

## Arrays and Objects

### Arrays
```javascript
const fruits = ['apple', 'banana', 'orange'];
fruits.push('grape');
const firstFruit = fruits[0];
```

### Objects
```javascript
const person = {
  name: 'John',
  age: 30,
  hobbies: ['reading', 'coding']
};
```

## Modern JavaScript Features

- **Template Literals**: `Hello, ${name}!`
- **Destructuring**: `const {name, age} = person;`
- **Spread Operator**: `const newArray = [...oldArray, newItem];`
- **Promises/Async-Await**: For asynchronous operations

## Best Practices

1. Use `const` by default, `let` when reassignment is needed
2. Prefer arrow functions for callbacks
3. Use meaningful variable names
4. Keep functions small and focused