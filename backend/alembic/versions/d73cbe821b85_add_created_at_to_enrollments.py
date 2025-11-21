"""add created_at to enrollments

Revision ID: d73cbe821b85
Revises: 77c5b53afd0b
Create Date: 2025-11-21 16:50:55.836290

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd73cbe821b85'
down_revision: Union[str, Sequence[str], None] = '77c5b53afd0b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
