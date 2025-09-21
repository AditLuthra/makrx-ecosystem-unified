import os
import redis.asyncio as redis
from redis.asyncio import Redis

import structlog
log = structlog.get_logger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")


async def get_redis_client() -> Redis:
    """Returns an async Redis client."""
    return redis.from_url(REDIS_URL)


async def check_redis_connection() -> bool:
    """Checks if the Redis connection is alive."""
    try:
        client = await get_redis_client()
        await client.ping()
        return True
    except redis.ConnectionError:
        log.error("Redis connection error", exc_info=True)
        return False
    except Exception as e:
        log.error(
            "Unknown error in Redis connection check",
            exc_info=True,
            extra={"error_type": type(e).__name__, "error": str(e)}
        )
        return False
