"use client";

import { useState, useRef, useEffect } from "react";
import { currencies } from "../lib/currencies";
import ProgressBar from "./components/ProgressBar";
import Logger from "./components/Logger";
import { runScenarios } from "../lib/runScenarios";

export default function Home() {
  const [secretKey, setSecretKey] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const logEndRef = useRef(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const addLog = (message, type = "info") => {
    setLogs((prev) => [...prev, { message, type, timestamp: new Date() }]);
  };

  const validateSecretKey = (key) => {
    return key && key.startsWith("sk_test_");
  };

  const handleRunTests = async () => {
    if (!validateSecretKey(secretKey)) {
      setError(
        'Invalid test secret key. Please enter a key starting with "sk_test_"'
      );
      return;
    }

    setError("");
    setLogs([]);
    setIsRunning(true);
    setProgress(0);

    try {
      addLog("Starting Stripe test scenarios...", "info");
      addLog(`Using currency: ${currency}`, "info");

      // Run the scenarios directly from the frontend
      const result = await runScenarios(
        secretKey,
        currency,
        (value) => setProgress(value),
        (message, logType = "info") => addLog(message, logType)
      );
      setIsRunning(false);

      if (!result.success) {
        addLog(`Error running scenarios: ${result.error}`, "error");
      } else {
        addLog("All scenarios completed successfully!", "success");
      }
    } catch (error) {
      setIsRunning(false);
      addLog(`Error: ${error.message}`, "error");
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Stripe Test Scenario Creator
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="secretKey"
          >
            Stripe Test Secret Key
          </label>
          <input
            id="secretKey"
            type="text"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              error ? "border-red-500" : ""
            }`}
            placeholder="sk_test_..."
            disabled={isRunning}
          />
          {error && <p className="text-red-500 text-xs italic mt-2">{error}</p>}
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="currency"
          >
            Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            disabled={isRunning}
          >
            {currencies.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.name} ({curr.code.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-center">
          <button
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline ${
              isRunning ? "opacity-50 cursor-not-allowed" : ""
            }`}
            type="button"
            onClick={handleRunTests}
            disabled={isRunning}
          >
            {isRunning ? "Running Tests..." : "Run Test Scenarios"}
          </button>
        </div>
      </div>

      {isRunning && (
        <div className="mb-6">
          <ProgressBar progress={progress} />
          <p className="text-center mt-2 text-sm text-gray-600">
            Progress: {progress}%
          </p>
        </div>
      )}

      {logs.length > 0 && (
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-md h-96 overflow-y-auto">
          <Logger logs={logs} />
          <div ref={logEndRef} />
        </div>
      )}
    </main>
  );
}
