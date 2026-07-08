from slowapi import Limiter
from slowapi.util import get_remote_address

# Initialize slowapi rate limiter using Memory storage backend
limiter = Limiter(key_func=get_remote_address, storage_uri="memory://")
