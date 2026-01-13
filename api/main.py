import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import artists, albums, tracks, customers, invoices, employees, genres, playlists, envvars
import database

app = FastAPI(title="Chinook Music API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    # IMPORTANT:
    # - Browsers disallow `Access-Control-Allow-Origin: *` when credentials are enabled.
    # - This API is used via bearerless JSON requests (no cookies), so credentials aren't needed.
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /api prefix
app.include_router(artists.router)
app.include_router(albums.router)
app.include_router(tracks.router)
app.include_router(customers.router)
app.include_router(invoices.router)
app.include_router(employees.router)
app.include_router(genres.router)
app.include_router(playlists.router)
app.include_router(envvars.router)

# Also include routers without /api prefix for proxy environments that strip it
# Import route handlers and create new routers
from fastapi import APIRouter
from routers.artists import get_artists, get_artist
from routers.albums import get_albums, get_album
from routers.tracks import get_tracks, get_track
from routers.customers import get_customers, get_customer
from routers.invoices import get_invoices, get_invoice
from routers.employees import get_employees
from routers.genres import get_genres
from routers.playlists import get_playlists, get_playlist
from routers.envvars import get_envvars

# Create routers without /api prefix
artists_no_api = APIRouter(prefix="/artists", tags=["artists"])
artists_no_api.get("")(get_artists)
artists_no_api.get("/{artist_id}")(get_artist)

albums_no_api = APIRouter(prefix="/albums", tags=["albums"])
albums_no_api.get("")(get_albums)
albums_no_api.get("/{album_id}")(get_album)

tracks_no_api = APIRouter(prefix="/tracks", tags=["tracks"])
tracks_no_api.get("")(get_tracks)
tracks_no_api.get("/{track_id}")(get_track)

customers_no_api = APIRouter(prefix="/customers", tags=["customers"])
customers_no_api.get("")(get_customers)
customers_no_api.get("/{customer_id}")(get_customer)

invoices_no_api = APIRouter(prefix="/invoices", tags=["invoices"])
invoices_no_api.get("")(get_invoices)
invoices_no_api.get("/{invoice_id}")(get_invoice)

employees_no_api = APIRouter(prefix="/employees", tags=["employees"])
employees_no_api.get("")(get_employees)

genres_no_api = APIRouter(prefix="/genres", tags=["genres"])
genres_no_api.get("")(get_genres)

playlists_no_api = APIRouter(prefix="/playlists", tags=["playlists"])
playlists_no_api.get("")(get_playlists)
playlists_no_api.get("/{playlist_id}")(get_playlist)

envvars_no_api = APIRouter(prefix="/envvars", tags=["envvars"])
envvars_no_api.get("")(get_envvars)

# Include routers without /api prefix
app.include_router(artists_no_api)
app.include_router(albums_no_api)
app.include_router(tracks_no_api)
app.include_router(customers_no_api)
app.include_router(invoices_no_api)
app.include_router(employees_no_api)
app.include_router(genres_no_api)
app.include_router(playlists_no_api)
app.include_router(envvars_no_api)



async def wait_for_database(max_retries=None, delay=None):
    """Wait for database to be ready with retry logic"""
    import os
    from sqlalchemy import text
    max_retries = max_retries or int(os.getenv("DB_MAX_RETRIES", "30"))
    delay = delay or float(os.getenv("DB_RETRY_DELAY", "2.0"))
    
    for attempt in range(max_retries):
        try:
            async with database.engine.begin() as conn:
                # First, verify we can connect and check what database we're connected to
                result = await conn.execute(text("SELECT current_database(), current_schema()"))
                db_info = result.fetchone()
                print(f"Connected to database: {db_info[0]}, schema: {db_info[1]}")
                
                # Check if tables exist in the database
                result = await conn.execute(text("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    ORDER BY table_name
                """))
                db_tables = [row[0] for row in result.fetchall()]
                print(f"Tables found in database: {db_tables[:20]}")
                
                if not db_tables:
                    raise Exception(f"No tables found in database '{db_info[0]}'. Database may be empty or not initialized.")
                
                # Reflect all tables from the database
                await conn.run_sync(database.Base.metadata.reflect)
            
            # Verify that key tables are reflected
            tables = database.Base.metadata.tables
            required_tables = ['artist', 'album', 'track', 'customer', 'invoice', 'employee', 'genre', 'playlist']
            missing_tables = [t for t in required_tables if t not in tables]
            
            if missing_tables:
                available = list(tables.keys())
                raise Exception(f"Missing tables after reflection: {missing_tables}. Available tables: {available[:20]}")
            
            print(f"Database connection successful! Reflected {len(tables)} tables.")
            print(f"Key tables available: {required_tables}")
            return
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"Database not ready yet (attempt {attempt + 1}/{max_retries}): {e}")
                await asyncio.sleep(delay)
            else:
                print(f"Failed to connect to database after {max_retries} attempts: {e}")
                # Print available tables for debugging
                try:
                    tables = database.Base.metadata.tables
                    print(f"Available tables: {list(tables.keys())[:20]}")
                except:
                    pass
                raise


@app.on_event("startup")
async def startup():
    # Wait for database to be ready and reflect tables
    # Don't fail startup if tables aren't found - allow app to start and handle errors in routes
    try:
        await wait_for_database()
    except Exception as e:
        print(f"WARNING: Database initialization failed: {e}")
        print("WARNING: Application will start but API endpoints may fail until database is initialized.")
        print("WARNING: Ensure database initialization scripts are mounted and run on first startup.")


@app.get("/")
async def root():
    return {"message": "Chinook Music API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

