"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Divider,
} from "@mui/material";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CalculateRoundedIcon from "@mui/icons-material/CalculateRounded";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";


type CalculationHistory = {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
};

type StoredHistoryEntry = Omit<CalculationHistory, "timestamp"> & { timestamp: string };
type StoredCalculatorState = {
  display?: string;
  previousValue?: number | null;
  operation?: string | null;
  waitingForOperand?: boolean;
  currentExpression?: string;
  conversionMode?: "length" | "weight" | "temperature" | null;
  unitFrom?: string;
  unitTo?: string;
  inputValue?: string;
  activeView?: "calculator" | "converter" | "both";
};

const LENGTH_UNITS = {
  "Millimeters (mm)": 0.001,
  "Centimeters (cm)": 0.01,
  "Meters (m)": 1,
  "Kilometers (km)": 1000,
  "Inches (in)": 0.0254,
  "Feet (ft)": 0.3048,
  "Yards (yd)": 0.9144,
  "Miles (mi)": 1609.344,
};

const WEIGHT_UNITS = {
  "Milligrams (mg)": 0.000001,
  "Grams (g)": 0.001,
  "Kilograms (kg)": 1,
  "Metric Tons (t)": 1000,
  "Ounces (oz)": 0.0283495,
  "Pounds (lb)": 0.453592,
  "Stones (st)": 6.35029,
};

const TEMPERATURE_UNITS = {
  "Celsius (degC)": "C",
  "Fahrenheit (degF)": "F",
  "Kelvin (K)": "K",
};

const LENGTH_OPTIONS = Object.keys(LENGTH_UNITS);
const WEIGHT_OPTIONS = Object.keys(WEIGHT_UNITS);
const TEMPERATURE_OPTIONS = Object.keys(TEMPERATURE_UNITS);

const performCalculation = (firstValue: number, secondValue: number, op: string): number => {
  switch (op) {
    case "+":
      return firstValue + secondValue;
    case "-":
      return firstValue - secondValue;
    case "×":
      return firstValue * secondValue;
    case "÷":
      return firstValue / secondValue;
    default:
      return secondValue;
  }
};

const loadStoredCalculatorState = (): StoredCalculatorState => {
  if (typeof window === "undefined") {
    return {};
  }
  const raw = localStorage.getItem("calculatorState");
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as StoredCalculatorState;
  } catch {
    return {};
  }
};

const loadStoredHistory = (): CalculationHistory[] => {
  if (typeof window === "undefined") {
    return [];
  }
  const raw = localStorage.getItem("calculatorHistory");
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as StoredHistoryEntry[];
    return parsed.map((item) => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }));
  } catch {
    return [];
  }
};

export default function CalculatorContent() {
  const initialState = useMemo(() => loadStoredCalculatorState(), []);

  const [display, setDisplay] = useState(initialState.display ?? "0");
  const [previousValue, setPreviousValue] = useState<number | null>(initialState.previousValue ?? null);
  const [operation, setOperation] = useState<string | null>(initialState.operation ?? null);
  const [waitingForOperand, setWaitingForOperand] = useState(Boolean(initialState.waitingForOperand));
  const [currentExpression, setCurrentExpression] = useState(initialState.currentExpression ?? "");
  const [conversionMode, setConversionMode] = useState<"length" | "weight" | "temperature" | null>(initialState.conversionMode ?? null);
  const [unitFrom, setUnitFrom] = useState(initialState.unitFrom ?? "");
  const [unitTo, setUnitTo] = useState(initialState.unitTo ?? "");
  const [inputValue, setInputValue] = useState(initialState.inputValue ?? "");
  const [history, setHistory] = useState<CalculationHistory[]>(loadStoredHistory);
  const [showHistory, setShowHistory] = useState(false);
  const [activeView, setActiveView] = useState<"calculator" | "converter" | "both">(initialState.activeView ?? "both");

  useEffect(() => {
    const state: StoredCalculatorState = {
      display,
      previousValue,
      operation,
      waitingForOperand,
      currentExpression,
      conversionMode,
      unitFrom,
      unitTo,
      inputValue,
      activeView,
    };
    localStorage.setItem("calculatorState", JSON.stringify(state));
  }, [display, previousValue, operation, waitingForOperand, currentExpression, conversionMode, unitFrom, unitTo, inputValue, activeView]);

  useEffect(() => {
    const historyToSave = history.map((item) => ({
      ...item,
      timestamp: item.timestamp.toISOString(),
    }));
    localStorage.setItem("calculatorHistory", JSON.stringify(historyToSave));
  }, [history]);

  const addToHistory = useCallback((expression: string, result: string) => {
    setHistory((prev) => [{ id: Date.now().toString(), expression, result, timestamp: new Date() }, ...prev].slice(0, 50));
  }, []);

  const handleDigitClick = useCallback(
    (digit: string) => {
      if (waitingForOperand) {
        setDisplay(digit);
        setWaitingForOperand(false);
      } else {
        setDisplay((prev) => (prev === "0" ? digit : prev + digit));
      }
    },
    [waitingForOperand]
  );

  const handleDecimalClick = useCallback(() => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }

    setDisplay((prev) => (prev.includes(".") ? prev : prev + "."));
  }, [waitingForOperand]);

  const handleOperatorClick = useCallback(
    (nextOperator: string) => {
      const inputValue = parseFloat(display);

      if (previousValue === null) {
        setPreviousValue(inputValue);
      } else if (operation) {
        const newValue = performCalculation(previousValue, inputValue, operation);
        setPreviousValue(newValue);
        setDisplay(String(newValue));
        addToHistory(`${previousValue} ${operation} ${inputValue}`, String(newValue));
      }

      setWaitingForOperand(true);
      setOperation(nextOperator);
      setCurrentExpression(`${previousValue ?? display} ${nextOperator}`);
    },
    [addToHistory, display, operation, previousValue]
  );

  const handleEqualsClick = useCallback(() => {
    const inputValue = parseFloat(display);
    if (previousValue === null || operation === null) return;

    const newValue = performCalculation(previousValue, inputValue, operation);
    addToHistory(`${previousValue} ${operation} ${inputValue}`, String(newValue));

    setDisplay(String(newValue));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
    setCurrentExpression("");
  }, [addToHistory, display, operation, previousValue]);

  const handleClearClick = useCallback(() => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setCurrentExpression("");
  }, []);

  const handlePercentage = useCallback(() => {
    setDisplay((prev) => String(parseFloat(prev) / 100));
  }, []);

  const handleSignToggle = useCallback(() => {
    setDisplay((prev) => String(-parseFloat(prev)));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleDigitClick(e.key);
      } else if (e.key === ".") {
        handleDecimalClick();
      } else if (e.key === "+") {
        handleOperatorClick("+");
      } else if (e.key === "-") {
        handleOperatorClick("-");
      } else if (e.key === "*") {
        handleOperatorClick("×");
      } else if (e.key === "/") {
        e.preventDefault();
        handleOperatorClick("÷");
      } else if (e.key === "Enter" || e.key === "=") {
        handleEqualsClick();
      } else if (e.key === "Escape") {
        handleClearClick();
      } else if (e.key === "%") {
        handlePercentage();
      } else if (e.key === "h" || e.key === "H") {
        setShowHistory((prev) => !prev);
      } else if (e.key === "1") {
        setActiveView("calculator");
      } else if (e.key === "2") {
        setActiveView("converter");
      } else if (e.key === "3") {
        setActiveView("both");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClearClick, handleDecimalClick, handleDigitClick, handleEqualsClick, handleOperatorClick, handlePercentage]);

  const clearHistory = useCallback(() => setHistory([]), []);

  const convertTemperature = (value: number, from: string, to: string): number => {
    let celsius: number;
    switch (from) {
      case "Celsius (degC)":
        celsius = value;
        break;
      case "Fahrenheit (degF)":
        celsius = (value - 32) * 5 / 9;
        break;
      case "Kelvin (K)":
        celsius = value - 273.15;
        break;
      default:
        return value;
    }

    switch (to) {
      case "Celsius (degC)":
        return celsius;
      case "Fahrenheit (degF)":
        return (celsius * 9 / 5) + 32;
      case "Kelvin (K)":
        return celsius + 273.15;
      default:
        return value;
    }
  };

  const convertValue = (value: number, from: string, to: string): string => {
    if (!conversionMode || !from || !to) return "0";

    if (conversionMode === "temperature") {
      return formatNumber(convertTemperature(value, from, to));
    }

    const units = conversionMode === "length" ? LENGTH_UNITS : WEIGHT_UNITS;
    const fromFactor = units[from as keyof typeof units];
    const toFactor = units[to as keyof typeof units];
    if (fromFactor === undefined || toFactor === undefined) return "0";

    return formatNumber((value * fromFactor) / toFactor);
  };

  const formatNumber = (num: number) => num.toFixed(6).replace(/\.?0+$/, "");

  const showCalculator = activeView === "calculator" || activeView === "both";
  const showConverter = activeView === "converter" || activeView === "both";

  const keypad = [
    ["AC", "±", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
  ];

  return (
    <Box>


      <ToggleButtonGroup value={activeView} exclusive onChange={(_e, value) => value && setActiveView(value)} sx={{ mb: 3 }}>
        <ToggleButton value="calculator" aria-label="calculator">
          <CalculateRoundedIcon />
        </ToggleButton>
        <ToggleButton value="converter" aria-label="converter">
          <CompareArrowsRoundedIcon />
        </ToggleButton>
        <ToggleButton value="both" aria-label="both">
          <Box display="flex">
            <CalculateRoundedIcon sx={{ mr: 1 }} />
            <CompareArrowsRoundedIcon />
          </Box>
        </ToggleButton>
      </ToggleButtonGroup>

      <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
        {showCalculator && (
          <Card sx={{ flex: showConverter ? 1 : undefined }}>
            <CardContent>
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="body2" align="right" color="text.secondary" minHeight={24}>
                  {currentExpression || "\u00a0"}
                </Typography>
                <Typography variant="h4" align="right" fontWeight={700}>
                  {display}
                </Typography>
              </Paper>

              {keypad.map((row, index) => (
                <Grid container spacing={1} mb={1} key={index}>
                  {row.map((key) => (
                    <Grid size={3} key={key}>
                      <Button
                        fullWidth
                        variant={isNaN(Number(key)) && key !== "%" ? "contained" : "outlined"}
                        color={isNaN(Number(key)) && key !== "%" ? "primary" : "inherit"}
                        sx={{
                          minHeight: { xs: 64, sm: 48 },
                          fontSize: { xs: "1.25rem", sm: "0.875rem" }
                        }}
                        onClick={() => {
                          if (key === "AC") return handleClearClick();
                          if (key === "±") return handleSignToggle();
                          if (key === "%") return handlePercentage();
                          if (["÷", "×", "-", "+"].includes(key)) return handleOperatorClick(key);
                          return handleDigitClick(key);
                        }}
                      >
                        {key}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              ))}

              <Grid container spacing={1}>
                <Grid size={6}>
                  <Button fullWidth variant="outlined" onClick={() => handleDigitClick("0")} sx={{ minHeight: { xs: 64, sm: 48 }, fontSize: { xs: "1.25rem", sm: "0.875rem" } }}>
                    0
                  </Button>
                </Grid>
                <Grid size={3}>
                  <Button fullWidth variant="outlined" onClick={handleDecimalClick} sx={{ minHeight: { xs: 64, sm: 48 }, fontSize: { xs: "1.25rem", sm: "0.875rem" } }}>
                    .
                  </Button>
                </Grid>
                <Grid size={3}>
                  <Button fullWidth variant="contained" onClick={handleEqualsClick} sx={{ minHeight: { xs: 64, sm: 48 }, fontSize: { xs: "1.25rem", sm: "0.875rem" } }}>
                    =
                  </Button>
                </Grid>
              </Grid>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} mt={3}>
                <Button startIcon={<HistoryRoundedIcon />} onClick={() => setShowHistory((prev) => !prev)}>
                  {showHistory ? "Hide History" : "Show History"}
                </Button>
                <Button startIcon={<DeleteOutlineRoundedIcon />} color="error" onClick={clearHistory} disabled={history.length === 0}>
                  Clear History
                </Button>
              </Stack>

              <Collapse in={showHistory && history.length > 0}>
                <Divider sx={{ my: 2 }} />
                <List dense sx={{ maxHeight: 300, overflow: "auto" }}>
                  {history.map((entry) => (
                    <ListItem key={entry.id} disableGutters divider>
                      <ListItemText
                        primary={`${entry.expression} = ${entry.result}`}
                        secondary={entry.timestamp.toLocaleString()}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </CardContent>
          </Card>
        )}

        {showConverter && (
          <Card sx={{ flex: showCalculator ? 1 : undefined }}>
            <CardContent>
              <ToggleButtonGroup value={conversionMode} exclusive onChange={(_e, value) => setConversionMode(value)} fullWidth sx={{ mb: 2 }}>
                <ToggleButton value="length">Length</ToggleButton>
                <ToggleButton value="weight">Weight</ToggleButton>
                <ToggleButton value="temperature">Temperature</ToggleButton>
              </ToggleButtonGroup>

              {conversionMode ? (
                <Stack spacing={2}>
                  <TextField label="Value" type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} fullWidth />
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Autocomplete
                      options={conversionMode === "length" ? LENGTH_OPTIONS : conversionMode === "weight" ? WEIGHT_OPTIONS : TEMPERATURE_OPTIONS}
                      value={unitFrom || null}
                      onChange={(_e, value) => setUnitFrom(value || "")}
                      renderInput={(params) => <TextField {...params} label="From" />}
                      fullWidth
                    />
                    <Autocomplete
                      options={conversionMode === "length" ? LENGTH_OPTIONS : conversionMode === "weight" ? WEIGHT_OPTIONS : TEMPERATURE_OPTIONS}
                      value={unitTo || null}
                      onChange={(_e, value) => setUnitTo(value || "")}
                      renderInput={(params) => <TextField {...params} label="To" />}
                      fullWidth
                    />
                  </Stack>

                  {unitFrom && unitTo && inputValue && (
                    <Paper variant="outlined" sx={{ p: 3 }}>
                      <Typography align="center">
                        {inputValue} {unitFrom}
                      </Typography>
                      <Typography align="center" variant="h4" fontWeight={700} my={1}>
                        {convertValue(parseFloat(inputValue), unitFrom, unitTo)}
                      </Typography>
                      <Typography align="center" color="text.secondary">
                        {unitTo}
                      </Typography>
                    </Paper>
                  )}
                </Stack>
              ) : (
                <Typography color="text.secondary">Select a conversion category to begin.</Typography>
              )}
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
}
