# Mock API Service Guide

## Overview

The mock API service simulates realistic backend behavior including network delays, server errors, and timeouts. This helps with development and testing of error handling and loading states.

## Configuration

All mock API behavior is controlled via environment variables in `.env`:

### Basic Configuration

```env
VITE_MOCK_MODE=true                 # Enable/disable mock mode
VITE_API_BASE_URL=/api              # Real API base URL (when mock mode is off)
```

### Delay Configuration

Simulates realistic network latency with variability:

```env
VITE_MOCK_MIN_DELAY=300             # Minimum delay in milliseconds
VITE_MOCK_MAX_DELAY=1000            # Maximum delay in milliseconds
```

Each API call will wait a random duration between `MIN_DELAY` and `MAX_DELAY`, simulating variable network conditions.

### Error Simulation

Control the frequency of simulated errors:

```env
VITE_MOCK_ERROR_RATE=0              # 0-100: Percentage chance of 500 error
VITE_MOCK_TIMEOUT_RATE=0            # 0-100: Percentage chance of timeout
VITE_MOCK_TIMEOUT_DURATION=5000     # Timeout threshold in milliseconds
```

**Examples:**
- `VITE_MOCK_ERROR_RATE=10` = 10% of requests will fail with 500 error
- `VITE_MOCK_TIMEOUT_RATE=5` = 5% of requests will timeout

## Use Cases

### 1. Normal Development (Default)

Fast, reliable responses for smooth development:

```env
VITE_MOCK_MIN_DELAY=300
VITE_MOCK_MAX_DELAY=1000
VITE_MOCK_ERROR_RATE=0
VITE_MOCK_TIMEOUT_RATE=0
```

### 2. Testing Error Handling

Moderate error rate to test error states:

```env
VITE_MOCK_MIN_DELAY=300
VITE_MOCK_MAX_DELAY=1000
VITE_MOCK_ERROR_RATE=10
VITE_MOCK_TIMEOUT_RATE=5
```

### 3. Testing Loading States

Slow network simulation:

```env
VITE_MOCK_MIN_DELAY=2000
VITE_MOCK_MAX_DELAY=5000
VITE_MOCK_ERROR_RATE=0
VITE_MOCK_TIMEOUT_RATE=0
```

### 4. Stress Testing

High error rate for robust error handling:

```env
VITE_MOCK_MIN_DELAY=500
VITE_MOCK_MAX_DELAY=2000
VITE_MOCK_ERROR_RATE=30
VITE_MOCK_TIMEOUT_RATE=20
```

### 5. Fast Development (No Delays)

Instant responses for rapid iteration:

```env
VITE_MOCK_MIN_DELAY=0
VITE_MOCK_MAX_DELAY=0
VITE_MOCK_ERROR_RATE=0
VITE_MOCK_TIMEOUT_RATE=0
```

## Error Types

### 1. 500 Internal Server Error

Thrown as `MockApiError` with:
- `status: 500`
- `statusText: "Internal Server Error"`
- `message: "Internal server error"`

### 2. Timeout Error

Thrown as `MockTimeoutError` with:
- `name: "MockTimeoutError"`
- `message: "Request timeout - please try again"`

## API Functions

All API functions support the mock configuration:

1. **`fetchDeals(page, itemsPerPage)`** - Paginated deal fetching
2. **`fetchAllDeals()`** - Fetch all deals at once
3. **`fetchDealById(dealId)`** - Fetch single deal by ID

## Implementation Details

### Variable Delays

Each request generates a random delay:
```typescript
delay = MIN_DELAY + random() * (MAX_DELAY - MIN_DELAY)
```

### Error Simulation

Before returning data, the service checks:
1. Generate random number 0-100
2. If less than `ERROR_RATE`, throw 500 error
3. If less than `TIMEOUT_RATE`, throw timeout error
4. Otherwise, return data normally

### Timeout Handling

Requests have a maximum duration (`TIMEOUT_DURATION`). If exceeded, a timeout error is thrown regardless of error rate settings.

## Testing the Mock API

### Test Error Handling

1. Set `VITE_MOCK_ERROR_RATE=100` in `.env`
2. Restart dev server: `npm run dev`
3. Navigate to deals page
4. You should see error states

### Test Timeout Handling

1. Set `VITE_MOCK_TIMEOUT_RATE=100` in `.env`
2. Restart dev server
3. Navigate to deals page
4. You should see timeout errors

### Test Loading States

1. Set `VITE_MOCK_MIN_DELAY=3000` and `VITE_MOCK_MAX_DELAY=5000`
2. Restart dev server
3. Navigate to deals page
4. You should see loading spinner for 3-5 seconds

## Notes

- **Must restart dev server** after changing `.env` values
- Error rates are independent - you can have both 500 errors and timeouts
- Set both error rates to 0 for reliable development experience
- Use `.env.example` as a reference for configuration options
