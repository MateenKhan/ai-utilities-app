"use client";

import { useState, useEffect, useRef } from "react";
import { FiRotateCcw } from "react-icons/fi";

export default function CalculatorPage() {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [conversionMode, setConversionMode] = useState<"length" | "weight" | "temperature" | null>(null);
  const [unitFrom, setUnitFrom] = useState("");
  const [unitTo, setUnitTo] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false);
  const [isToDropdownOpen, setIsToDropdownOpen] = useState(false);
  const fromDropdownRef = useRef<HTMLDivElement>(null);
  const toDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromDropdownRef.current && !fromDropdownRef.current.contains(event.target as Node)) {
        setIsFromDropdownOpen(false);
      }
      if (toDropdownRef.current && !toDropdownRef.current.contains(event.target as Node)) {
        setIsToDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Keyboard support for calculator
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigitClick(e.key);
      } else if (e.key === '.') {
        handleDecimalClick();
      } else if (e.key === '+') {
        handleOperatorClick("+");
      } else if (e.key === '-') {
        handleOperatorClick("-");
      } else if (e.key === '*') {
        handleOperatorClick("×");
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperatorClick("÷");
      } else if (e.key === 'Enter' || e.key === '=') {
        handleEqualsClick();
      } else if (e.key === 'Escape') {
        handleClearClick();
      } else if (e.key === '%') {
        handlePercentage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [display, previousValue, operation, waitingForOperand]);

  const handleDigitClick = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const handleDecimalClick = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const handleOperatorClick = (op: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setPreviousValue(newValue);
      setDisplay(String(newValue));
    }

    setWaitingForOperand(true);
    setOperation(op);
  };

  const handleEqualsClick = () => {
    const inputValueNum = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValueNum, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const calculate = (first: number, second: number, op: string): number => {
    switch (op) {
      case "+":
        return first + second;
      case "-":
        return first - second;
      case "×":
        return first * second;
      case "÷":
        return first / second;
      default:
        return second;
    }
  };

  const handleClearClick = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const handleToggleSign = () => {
    const value = parseFloat(display);
    setDisplay(String(-value));
  };

  const handlePercentage = () => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  };

  // Reverse conversion units
  const handleReverseUnits = () => {
    const tempUnit = unitFrom;
    setUnitFrom(unitTo);
    setUnitTo(tempUnit);
    
    const tempSearch = searchFrom;
    setSearchFrom(searchTo);
    setSearchTo(tempSearch);
  };

  // Conversion functions
  const convertUnits = () => {
    if (!inputValue || !unitFrom || !unitTo) return "";

    const value = parseFloat(inputValue);
    if (isNaN(value)) return "";

    // Length conversions (to meters)
    const lengthToMeters: Record<string, number> = {
      "mm": 0.001,
      "cm": 0.01,
      "m": 1,
      "km": 1000,
      "inch": 0.0254,
      "feet": 0.3048,
      "yard": 0.9144,
      "mile": 1609.344,
    };

    // Weight conversions (to grams)
    const weightToGrams: Record<string, number> = {
      "mg": 0.001,
      "g": 1,
      "kg": 1000,
      "oz": 28.3495,
      "lb": 453.592,
    };

    try {
      if (conversionMode === "length") {
        const meters = value * lengthToMeters[unitFrom];
        const result = meters / lengthToMeters[unitTo];
        return result.toFixed(6);
      } else if (conversionMode === "weight") {
        const grams = value * weightToGrams[unitFrom];
        const result = grams / weightToGrams[unitTo];
        return result.toFixed(6);
      } else if (conversionMode === "temperature") {
        // Temperature conversions
        let celsius: number;
        if (unitFrom === "celsius") {
          celsius = value;
        } else if (unitFrom === "fahrenheit") {
          celsius = (value - 32) * 5/9;
        } else { // kelvin
          celsius = value - 273.15;
        }

        if (unitTo === "celsius") {
          return celsius.toFixed(2);
        } else if (unitTo === "fahrenheit") {
          return ((celsius * 9/5) + 32).toFixed(2);
        } else { // kelvin
          return (celsius + 273.15).toFixed(2);
        }
      }
    } catch (e) {
      return "Error";
    }

    return "";
  };

  const getUnitOptions = () => {
    if (conversionMode === "length") {
      return ["mm", "cm", "m", "km", "inch", "feet", "yard", "mile"];
    } else if (conversionMode === "weight") {
      return ["mg", "g", "kg", "oz", "lb"];
    } else if (conversionMode === "temperature") {
      return ["celsius", "fahrenheit", "kelvin"];
    }
    return [];
  };

  // Filter options based on search
  const filteredFromOptions = getUnitOptions().filter(option => 
    option.toLowerCase().includes(searchFrom.toLowerCase())
  );

  const filteredToOptions = getUnitOptions().filter(option => 
    option.toLowerCase().includes(searchTo.toLowerCase())
  );

  const conversionResult = convertUnits();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Calculator & Unit Converter</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Standard Calculator */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Standard Calculator</h2>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <div className="text-right text-3xl font-semibold text-gray-800 h-12 overflow-x-auto">
                {display}
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={handleClearClick}
                className="col-span-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 rounded"
              >
                AC
              </button>
              <button
                onClick={handleToggleSign}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 rounded"
              >
                +/-
              </button>
              <button
                onClick={handlePercentage}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 rounded"
              >
                %
              </button>
              
              <button
                onClick={() => handleOperatorClick("÷")}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded"
              >
                ÷
              </button>
              <button
                onClick={() => handleDigitClick("7")}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded"
              >
                7
              </button>
              <button
                onClick={() => handleDigitClick("8")}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded"
              >
                8
              </button>
              <button
                onClick={() => handleDigitClick("9")}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded"
              >
                9
              </button>
              <button
                onClick={() => handleOperatorClick("×")}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded"
              >
                ×
              </button>
              
              <button
                onClick={() => handleDigitClick("4")}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded"
              >
                4
              </button>
              <button
                onClick={() => handleDigitClick("5")}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded"
              >
                5
              </button>
              <button
                onClick={() => handleDigitClick("6")}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded"
              >
                6
              </button>
              <button
                onClick={() => handleOperatorClick("-")}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded"
              >
                -
              </button>
              
              <button
                onClick={() => handleDigitClick("1")}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded"
              >
                1
              </button>
              <button
                onClick={() => handleDigitClick("2")}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded"
              >
                2
              </button>
              <button
                onClick={() => handleDigitClick("3")}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded"
              >
                3
              </button>
              <button
                onClick={() => handleOperatorClick("+")}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded"
              >
                +
              </button>
              
              <button
                onClick={() => handleDigitClick("0")}
                className="col-span-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded"
              >
                0
              </button>
              <button
                onClick={handleDecimalClick}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded"
              >
                .
              </button>
              <button
                onClick={handleEqualsClick}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded"
              >
                =
              </button>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>Keyboard shortcuts: 0-9, +, -, *, /, Enter, Escape, ., %</p>
            </div>
          </div>
          
          {/* Unit Converter */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Unit Converter</h2>
            
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => {
                    setConversionMode("length");
                    setUnitFrom("");
                    setUnitTo("");
                    setInputValue("");
                  }}
                  className={`px-4 py-2 rounded ${conversionMode === "length" ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                >
                  Length
                </button>
                <button
                  onClick={() => {
                    setConversionMode("weight");
                    setUnitFrom("");
                    setUnitTo("");
                    setInputValue("");
                  }}
                  className={`px-4 py-2 rounded ${conversionMode === "weight" ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                >
                  Weight
                </button>
                <button
                  onClick={() => {
                    setConversionMode("temperature");
                    setUnitFrom("");
                    setUnitTo("");
                    setInputValue("");
                  }}
                  className={`px-4 py-2 rounded ${conversionMode === "temperature" ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                >
                  Temperature
                </button>
              </div>
              
              {conversionMode && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* From Unit Dropdown */}
                    <div ref={fromDropdownRef} className="relative">
                      <label className="block text-gray-700 mb-2">From</label>
                      <div 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                        onClick={() => setIsFromDropdownOpen(!isFromDropdownOpen)}
                      >
                        {unitFrom || "Select unit"}
                      </div>
                      {isFromDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                          <div className="p-2">
                            <input
                              type="text"
                              placeholder="Search..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={searchFrom}
                              onChange={(e) => setSearchFrom(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <ul className="max-h-40 overflow-y-auto">
                            {filteredFromOptions.map(unit => (
                              <li
                                key={unit}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setUnitFrom(unit);
                                  setIsFromDropdownOpen(false);
                                }}
                              >
                                {unit}
                              </li>
                            ))}
                            {filteredFromOptions.length === 0 && (
                              <li className="px-4 py-2 text-gray-500">No matching units</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    {/* Reverse Button */}
                    <div className="flex items-end">
                      <button
                        onClick={handleReverseUnits}
                        className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded"
                      >
                        ⇄ Reverse
                      </button>
                    </div>
                    
                    {/* To Unit Dropdown */}
                    <div ref={toDropdownRef} className="relative">
                      <label className="block text-gray-700 mb-2">To</label>
                      <div 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                        onClick={() => setIsToDropdownOpen(!isToDropdownOpen)}
                      >
                        {unitTo || "Select unit"}
                      </div>
                      {isToDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                          <div className="p-2">
                            <input
                              type="text"
                              placeholder="Search..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={searchTo}
                              onChange={(e) => setSearchTo(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <ul className="max-h-40 overflow-y-auto">
                            {filteredToOptions.map(unit => (
                              <li
                                key={unit}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setUnitTo(unit);
                                  setIsToDropdownOpen(false);
                                }}
                              >
                                {unit}
                              </li>
                            ))}
                            {filteredToOptions.length === 0 && (
                              <li className="px-4 py-2 text-gray-500">No matching units</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Value</label>
                    <input
                      type="number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter value"
                    />
                  </div>
                  
                  {conversionResult && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                      <p className="font-semibold">{inputValue} {unitFrom} = {conversionResult} {unitTo}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}