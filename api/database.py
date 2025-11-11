from sqlmodel import create_engine, SQLModel
import os

# Load from environment variables (Vercel will provide this)
DATABASE_URL = os.environ.get("POSTGRES_URL") 

if not DATABASE_URL:
    raise ValueError("POSTGRES_URL environment variable is not set.")

engine = create_engine(
    DATABASE_URL,
    connect_args={"connect_timeout": 30} # Wait 30 seconds for a connection
)

def create_db_and_tables():
    # This function will be called once on startup
    SQLModel.metadata.create_all(engine)