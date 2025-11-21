"""add created_at to enrollments

Revision ID: a173969af6cd
Revises: d73cbe821b85
Create Date: 2025-11-21 16:51:37.045704

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a173969af6cd'
down_revision: Union[str, Sequence[str], None] = 'd73cbe821b85'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
