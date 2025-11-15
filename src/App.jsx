// File: Trip_Planner/src/App.jsx
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button } from "@/components/ui/button"
import Hero from './components/customs/Hero';


// If using TypeScript:
// import Hero from './components/Hero';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/*Hero*/}
      <Hero/>
    </>
  )
}

export default App
