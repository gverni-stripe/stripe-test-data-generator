# Stripe Test Scenario Creator

A Next.js application for easily creating test scenarios in your Stripe test environment. This application provides a user-friendly interface to run various Stripe test scenarios including successful payments, declined transactions, refunds, disputes, and more.

## Features

- Creates 10 successful transactions with unique order numbers
- Creates transactions that bypass the pending balance (US and international)
- Generates payments with every possible decline reason
- Creates successful and failed refunds
- Sets up complete dispute scenarios:
  - Dispute won (automatically submits winning evidence)
  - Dispute lost (automatically submits losing evidence)
  - Dispute not responded
- Real-time progress tracking and logging
- Currency selection support
- Secure API key handling

## Getting Started

### Prerequisites

- Node.js 16.14.0 or later
- A Stripe account with test mode access
- Stripe API test secret key

### Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/stripe-test-scenario-creator.git
cd stripe-test-scenario-creator
