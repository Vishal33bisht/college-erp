"""add enrollments table

Revision ID: 86bb352214f7
Revises: e20dbaf5eb5c
Create Date: 2025-11-21 14:23:42.032977

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '86bb352214f7'
down_revision: Union[str, Sequence[str], None] = 'e20dbaf5eb5c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
