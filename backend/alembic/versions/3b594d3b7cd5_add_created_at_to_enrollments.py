"""add created_at to enrollments

Revision ID: 3b594d3b7cd5
Revises: 77c5b53afd0b
Create Date: 2025-11-21 16:57:42.943100

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3b594d3b7cd5'
down_revision: Union[str, Sequence[str], None] = '77c5b53afd0b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
