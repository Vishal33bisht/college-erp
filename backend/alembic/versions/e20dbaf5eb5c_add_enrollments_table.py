"""add enrollments table

Revision ID: e20dbaf5eb5c
Revises: 07e3b39246e3
Create Date: 2025-11-21 14:23:14.752239

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e20dbaf5eb5c'
down_revision: Union[str, Sequence[str], None] = '07e3b39246e3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
