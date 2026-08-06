"""Generate a VAPID keypair for Web Push.

Writes the keys to stdout in the exact format expected by .env:

    VAPID_PUBLIC_KEY=<url-safe base64, no padding, uncompressed P-256 point>
    VAPID_PRIVATE_KEY=<url-safe base64, no padding, PKCS#8 DER>

Usage:
    python scripts/generate_vapid_keys.py
"""
import base64

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec


def url_safe_no_padding(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def main() -> None:
    private_key = ec.generate_private_key(ec.SECP256R1())

    public_key = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.X962,
        format=serialization.PublicFormat.UncompressedPoint,
    )
    private_key_der = private_key.private_bytes(
        encoding=serialization.Encoding.DER,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )

    print(f"VAPID_PUBLIC_KEY={url_safe_no_padding(public_key)}")
    print(f"VAPID_PRIVATE_KEY={url_safe_no_padding(private_key_der)}")


if __name__ == "__main__":
    main()
