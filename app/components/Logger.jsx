export default function Logger({ logs }) {
  const getLogClassByType = (type) => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
      default:
        return "text-gray-300";
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="font-mono text-sm">
      {logs.map((log, index) => (
        <div key={index} className={`${getLogClassByType(log.type)} mb-1`}>
          <span className="text-gray-500 mr-2">
            [{formatTimestamp(log.timestamp)}]
          </span>
          {log.message}
        </div>
      ))}
    </div>
  );
}
