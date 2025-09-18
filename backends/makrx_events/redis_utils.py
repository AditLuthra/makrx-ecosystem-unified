import os
import redis.asyncio as redis
from redis.asyncio import Redis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6380/0")

async def get_redis_client() -> Redis:
    """Returns an async Redis client."""
    return redis.from_url(REDIS_URL)

async def check_redis_connection() -> bool:
    """Checks if the Redis connection is alive."""
    try:
        client = await get_redis_client()
        await client.ping()
        return True
    except Exception:
        return False
