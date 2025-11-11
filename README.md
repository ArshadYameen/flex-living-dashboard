Flex Living Reviews Dashboard

This is a full-stack application built to serve as a reviews management dashboard for Flex Living. It provides a manager-facing interface to approve or deny guest reviews and a public-facing property page to display the approved reviews.

The backend is built with FastAPI (Python) and the frontend with Next.js (React), all deployed as a serverless monorepo on Vercel.

Live Demo Links

Manager Dashboard: https://flex-living-dashboard-khaki.vercel.app/dashboard

Public Property Page (Example 1): https://flex-living-dashboard-khaki.vercel.app/property/7

Public Property Page (Example 2): https://flex-living-dashboard-khaki.vercel.app/property/8

📸 Screenshots

(Please replace these placeholder paths with your own screenshots)

Manager Dashboard

Public Property Page





✨ Features

Manager Dashboard: A single-page application where managers can view all incoming reviews from all sources.

Advanced Filtering: Filter reviews by property, star rating, or review channel (e.g., Hostaway, Google).

Data Visualization: A "Category Performance" radar chart provides at-a-glance insights into property strengths and weaknesses (e.g., Cleanliness, Communication).

Review Curation: A one-click toggle switch on the dashboard allows managers to approve or unapprove any review for public display.

Public Property Pages: A dynamic, server-rendered page for each property that displays a custom-added image and the list of only manager-approved reviews.

Multi-Source Integration:

Hostaway: A seed.py script normalizes and ingests mock JSON data from Hostaway.

Google Reviews: A "Sync Google Reviews" button on the dashboard calls a custom API endpoint, which fetches live reviews from the Google Places API, normalizes them (converting 5-star to 10-star), and saves them to the database for approval.

🛠️ Tech Stack & Architecture

This project is a monorepo deployed on Vercel.

api/ (Backend):

Framework: FastAPI (Python)

Database ORM: SQLModel (combining SQLAlchemy and Pydantic)

Database: Vercel Postgres (powered by Neon)

API Client: httpx (for calling the Google Places API)

web/ (Frontend):

Framework: Next.js (React) using the App Router

Styling: Tailwind CSS + shadcn/ui

Data Fetching & State: React Query (@tanstack/react-query)

Charts: Recharts

vercel.json (Deployment):

A custom configuration file instructs Vercel how to build the Python api and the Next.js web app separately, then routes all requests starting with /api/ to the Python backend.

Local Setup & Running Instructions

Prerequisites

Node.js (LTS) & npm

Python 3.9+

Git

1. Clone the Repository

git clone [https://github.com/ArshadYameen/flex-living-dashboard.git](https://github.com/ArshadYameen/flex-living-dashboard.git)
cd flex-living-dashboard


2. Configure Environment Variables

You will need two secret keys:

POSTGRES_URL: Your Vercel Postgres Direct (non-pooler) connection string.

GOOGLE_PLACES_API_KEY: Your API key from the Google Cloud Console.

3. Set Up & Run the Backend (Terminal 1)

# 1. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install Python dependencies
pip install -r api/requirements.txt

# 3. Set your environment variables
export POSTGRES_URL="postgres://..."
export GOOGLE_PLACES_API_KEY="AIza..."

# 4. Run the FastAPI server
uvicorn api.index:app --reload --port 8000


4. Set Up & Run the Frontend (Terminal 2)

# 1. Navigate to the web folder
cd web

# 2. Install Node dependencies
npm install

# 3. Run the Next.js development server
npm run dev


Your app is now running!

Frontend (Dashboard): http://localhost:3000/dashboard

Backend (API Docs): http://localhost:8000/docs

📁 API Endpoints

<details>
<summary>Click to expand API endpoint list</summary>

GET /api/reviews/hostaway: (Mandatory deliverable) Returns all normalized Hostaway reviews.

GET /api/reviews: Returns all reviews for the dashboard, supports filtering.

GET /api/listings: Returns a simple list of all properties for filters.

GET /api/listings/{listing_id}: Returns a single property's details.

PATCH /api/reviews/{review_id}/approve: Toggles the is_approved status of a review.

GET /api/reviews/public/{listing_id}: Returns only approved reviews for a property.

POST /api/google/sync/{listing_id}: Triggers a sync with the Google Places API.

</details>
