"""add enrollments table

Revision ID: 77c5b53afd0b
Revises: 86bb352214f7
Create Date: 2025-11-21 14:24:12.419112

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '77c5b53afd0b'
down_revision: Union[str, Sequence[str], None] = '86bb352214f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
