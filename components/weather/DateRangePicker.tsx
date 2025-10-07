'use client';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  disabled?: boolean;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  disabled = false,
}: DateRangePickerProps) {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Calculate max date (yesterday - archive API supports up to yesterday)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const maxDate = yesterday.toISOString().split('T')[0];

  // Calculate min date (Open-Meteo historical data goes back to 1940)
  const minDate = '1940-01-01';

  // Validate date range
  const handleStartDateChange = (value: string) => {
    onStartDateChange(value);
    // If end date is before start date, adjust end date
    if (endDate && value > endDate) {
      onEndDateChange(value);
    }
  };

  const handleEndDateChange = (value: string) => {
    // Don't allow end date before start date
    if (value < startDate) {
      return;
    }
    onEndDateChange(value);
  };

  // Quick date range presets
  const setPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    onStartDateChange(start.toISOString().split('T')[0]);
    onEndDateChange(end.toISOString().split('T')[0]);
  };

  return (
    <div className="w-full max-w-2xl bg-white/90 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Select Date Range</h3>

      {/* Date Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Start Date */}
        <div>
          <label className="block text-gray-700 font-medium mb-2 text-sm">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            min={minDate}
            max={maxDate}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-gray-700 font-medium mb-2 text-sm">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            min={startDate || minDate}
            max={maxDate}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Quick Presets */}
      <div className="border-t border-gray-200 pt-4">
        <p className="text-gray-600 text-sm mb-3">Quick Presets:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPreset(7)}
            disabled={disabled}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setPreset(30)}
            disabled={disabled}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setPreset(90)}
            disabled={disabled}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Last 3 Months
          </button>
          <button
            onClick={() => setPreset(365)}
            disabled={disabled}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Last Year
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-gray-600">
          ℹ️ Historical weather data is available from 1940 to yesterday. Select any past dates to view historical weather information.
        </p>
      </div>
    </div>
  );
}
