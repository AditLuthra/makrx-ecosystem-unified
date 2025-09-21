
import os
import logging
import redis.asyncio as redis
from redis.asyncio import Redis

logger = logging.getLogger(__name__)

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
    except Exception as e:
        logger.error(
            "Unknown error in Redis connection check",
            exc_info=True,
            extra={"error_type": type(e).__name__, "error": str(e)}
        )
        return False
