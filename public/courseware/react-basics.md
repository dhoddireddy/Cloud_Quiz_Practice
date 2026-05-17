# React Basics

## What is React?

React is a popular JavaScript library for building user interfaces, particularly for web applications. It was developed by Facebook and is now maintained by a community of developers.

## Key Concepts

### Components
Components are the building blocks of React applications. They are reusable pieces of code that return JSX elements.

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}
```

### JSX
JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.

### State and Props
- **Props** are inputs to components (immutable)
- **State** is data that can change over time

## Getting Started

To create a new React app, you can use Create React App:

```bash
npx create-react-app my-app
cd my-app
npm start
```

## Next Steps

- Learn about hooks (useState, useEffect)
- Understand the component lifecycle
- Explore React Router for navigation