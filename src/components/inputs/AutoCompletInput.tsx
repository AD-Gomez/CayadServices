import React, { useState, useEffect, useRef } from 'react'
import { useFormContext } from 'react-hook-form'

interface AutocompleteInputProps {
  name: string
  label: string
  placeholder: string
  trigger: any
  clearErrors: any
  setError: any
  defaultValue?: string
}

const fetchGeoNamesSuggestions = async (query: string) => {
  const username = 'miguelaacho10'
  const url = `https://secure.geonames.org/searchJSON?name_startsWith=${query}&country=US&featureClass=P&maxRows=10&username=${username}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Network response was not ok.')
    }
    const data = await response.json()
    return data.geonames
  } catch (error) {
    console.error('Error fetching data:', error)
    return []
  }
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ name, label, placeholder, trigger, clearErrors, setError, defaultValue }) => {
  const { register, setValue, formState: { errors } } = useFormContext()
  const [inputValue, setInputValue] = useState(defaultValue)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isValidUSCity, setIsValidUSCity] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const suggestionsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleInputChange = async (event: Event) => {
      const target = event.target as HTMLInputElement
      const query = target.value
      setInputValue(query)

      if (query.length >= 3) {
        const suggestions = await fetchGeoNamesSuggestions(query)
        setSuggestions(suggestions)
      } else {
        setSuggestions([])
      }
    }

    const inputElem = inputRef.current
    if (inputElem) {
      inputElem.addEventListener('input', handleInputChange)
    }

    return () => {
      if (inputElem) {
        inputElem.removeEventListener('input', handleInputChange)
      }
    }
  }, [])

  useEffect(() => {
    setValue(name, defaultValue)
  }, [defaultValue, name, setValue])

  const handleBlur = async () => {
    const valid = await trigger(name)
    if (!valid) {
      setError(name, { type: 'manual', message: 'Please provide a valid city or zip code.' })
    } else {
      clearErrors(name)
    }
  }

  const handleSuggestionClick = (city: any) => {
    const cityName = `${city.name}, ${city.adminCode1}`
    setInputValue(cityName)
    setValue(name, cityName)
    setSuggestions([])

    if (city.countryCode === 'US') {
      setIsValidUSCity(true)
      clearErrors(name)
    } else {
      setIsValidUSCity(false)
      setError(name, { type: 'manual', message: 'Please provide a valid city or zip code.' })
    }
  }

  useEffect(() => {
    if (inputValue?.trim() === '') {
      setValue(name, '')
    }
  }, [inputValue, name, setValue])

  return (
    <div className="relative mb-2">
      <input
        id={name}
        {...register(name)}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        ref={inputRef}
        placeholder={placeholder}
        className={`peer h-10 w-full border-b-2 bg-transparent text-gray-900 placeholder-transparent focus:outline-none 
          ${errors[name] ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}
          ${isValidUSCity ? 'border-green-500 focus:border-green-500' : ''}`}
      />
      {errors[name] && (
        <div className="absolute top-2.5 text-red-500 right-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
      )}
      <label
        htmlFor={name}
        className={`absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-btn-blue 
          ${errors[name] ? 'text-red-500' : ''}`}
      >
        {label}
      </label>
      <div ref={suggestionsRef} className="absolute mt-1 bg-white w-full z-10 max-h-48 overflow-y-auto">
        {suggestions.map((city, index) => (
          <div
            key={index}
            className="cursor-pointer p-2 hover:bg-gray-200"
            onClick={() => handleSuggestionClick(city)}
          >
            {city.name}, {city.adminCode1}
          </div>
        ))}
      </div>
      {isValidUSCity && (
        <div className="absolute top-2.5 right-2.5 text-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  )
}

export default AutocompleteInput
