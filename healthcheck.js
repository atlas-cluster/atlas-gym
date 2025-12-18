#!/usr/bin/env bun

// Simple healthcheck script for Docker container
const healthCheck = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/health', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(4000), // 4 second timeout
    })

    if (response.ok) {
      process.exit(0) // Healthy
    } else {
      console.error(`Health check failed with status: ${response.status}`)
      process.exit(1) // Unhealthy
    }
  } catch (error) {
    console.error('Health check error:', error)
    process.exit(1) // Unhealthy
  }
}

healthCheck()
