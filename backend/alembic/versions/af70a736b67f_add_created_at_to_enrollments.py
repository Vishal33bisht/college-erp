"""add created_at to enrollments

Revision ID: af70a736b67f
Revises: a173969af6cd
Create Date: 2025-11-21 16:52:13.346658

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'af70a736b67f'
down_revision: Union[str, Sequence[str], None] = 'a173969af6cd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
