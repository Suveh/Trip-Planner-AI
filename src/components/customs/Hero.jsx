//Hero.jsx
import React from 'react'
import { Link } from 'react-router-dom'

function Hero() {
  return (

    <div className=' flex flex-col  items-center w-full h-screen gap-9'>
      <h1 className='font-extrabold text-[50px] text-center mt-16'>
        <span className='text-red-700'>Discover Your Next Adventure with AI:</span>
        <br></br>
        <span className='text-blue-900 font'>Personalized Itineraries at Your Fingertips</span>
      </h1>
      <p className='text-xl text-black text-center mt-4'>
        Your personal trip planner and travel curator, creating custom itineries tailored to your interests and budget.
      </p>
      <Link to="/create-trip">
        <button className="bg-gradient-to-b from-red-700 to-red-800 text-white px-6 py-3rounded-lg
                           border-b-4 border-red-900 shadow-[0_4px_0_rgb(127,29,29)] hover:from-red-600 hover:to-red-700
                           hover:border-b-2 hover:shadow-[0_2px_0_rgb(127,29,29)] hover:translate-y-0.5
                           active:from-red-800 active:to-red-900 active:border-b-0 active:shadow-none active:translate-y-1.5
                           transition-all duration-75 transform origin-bottom">  Get Started </button>
      </Link>
      <img src='/Hero.jpg' alt='Hero Image' className='-mt-1 w-96 h-64 rounded-lg shadow-xl'/>
    </div>
  )
}

export default Hero