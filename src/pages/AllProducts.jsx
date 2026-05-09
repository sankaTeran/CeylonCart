import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import ProductCard from '../components/ProductCard'

export default function AllProducts() {

    const {products,searchQuery} =useAppContext()
    const[filteredproducts,setFilteredproducts]=useState([])

    useEffect(()=>{
      if (searchQuery.length > 0) {
          setFilteredproducts(products.filter(
            product => product.name.toLowerCase().includes(searchQuery.toLowerCase())
          ))
      }else{
        setFilteredproducts(products)
      }

    },[products,searchQuery])

  return (
    <div className='flex flex-col mt-16'>
        <div className='flex flex-col items-end w-max'>
            <p className='text-2xl font-medium uppercase'>All Products</p> 
            <div className='w-16 h-0.5 bg-primary rounded-full'></div>
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6 '>
          {filteredproducts.filter((product)=>product.inStock).map((product,index)=>(
              <ProductCard key={index} product={product} />
          ))}
        </div>
      
    </div>
  )
}
